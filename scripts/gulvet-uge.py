#!/usr/bin/env python3
"""Gulvets ugentlige opsamling — datadelen. Kører i Harukis sandkasse, ikke på sitet.

    python3 scripts/gulvet-uge.py hent  [ÅÅÅÅ-Wnn]   → JSON på stdout: ugens fund, tal, åbne spørgsmål
    python3 scripts/gulvet-uge.py skriv  fil.json    → indsætter én række i gulvet_analyse

HVORFOR ET SCRIPT OG IKKE EN PROMPT. Konklusionerne skriver Haruki; tallene
skal hentes ens hver mandag, uden at nogen husker forkert. Scriptet er den
del der ikke må variere.

HEMMELIGHEDER. Bitwarden-adgangstokenet læses fra BWS_ACCESS_TOKEN i miljøet
eller fra /tmp/.bws_token. Supabase-tokenet hentes derfra og bruges i denne
proces. Intet printes ud over data. Sitets tal (Vercel Web Analytics) hentes
OGSÅ her, med Vercel-tokenet fra Bitwarden. Shopify-tallene kommer IKKE
herfra — dem henter Haruki gennem Shopify-connectoren og lægger i JSON'en
under «tal».

Kræver: pip install bitwarden-sdk
"""
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.request

ORG = "1463dd14-d6f6-4867-aeb9-b41d00cd9fb9"
SUPA = "iqvzreclhvukijcivlhz"
TOKEN_POSTER = ["Supabase Management API Token", "SUPABASE_ACCESS_TOKEN", "Supabase PAT S519"]
TAL_NOEGLER = {
    "doer_ind", "doer_koebte", "doer_salg", "doer_vagter",
    "shop_sessions", "shop_kasse", "shop_koeb", "shop_salg",
    "book_bookinger", "ig_foelgere", "ig_opslag",
    "site_besoeg", "site_booking", "site_walkin", "site_shop", "site_book_klik", "site_koeb_klik",
}
VERCEL_TEAM = "team_Q9pWTWQDaGgf5Y5XnuuxhpCf"
VERCEL_PRJ = "prj_RaATmqi4YdHxPYmDytMZ8UYUwWKJ"


def _bws_token() -> str:
    t = os.environ.get("BWS_ACCESS_TOKEN", "").strip()
    if not t:
        for sti in ("/tmp/.bws_token", "/tmp/.bws_token_h"):
            if os.path.exists(sti):
                t = open(sti).read().strip()
                break
    if not t:
        sys.exit("intet Bitwarden-adgangstoken (BWS_ACCESS_TOKEN eller /tmp/.bws_token)")
    return t


_BW = None


def _bitwarden():
    global _BW
    if _BW is None:
        from bitwarden_sdk import BitwardenClient, DeviceType, client_settings_from_dict
        c = BitwardenClient(client_settings_from_dict({
            "apiUrl": "https://api.bitwarden.com", "identityUrl": "https://identity.bitwarden.com",
            "deviceType": DeviceType.SDK, "userAgent": "haruki-gulvet"}))
        c.auth().login_access_token(_bws_token())
        _BW = (c, {s.key: s.id for s in c.secrets().list(ORG).data.data})
    return _BW


def _vercel_token() -> str | None:
    c, alle = _bitwarden()
    return c.secrets().get(alle["Vercel ks-haruki"]).data.value.strip() if "Vercel ks-haruki" in alle else None


def _supabase_token() -> str:
    c, alle = _bitwarden()
    for navn in TOKEN_POSTER:
        if navn in alle:
            tok = c.secrets().get(alle[navn]).data.value.strip()
            st, _ = _kald(f"https://api.supabase.com/v1/projects/{SUPA}/api-keys", tok)
            if st == 200:
                return tok
    sys.exit("intet brugbart Supabase-token i Bitwarden")


def _kald(url, tok, data=None):
    req = urllib.request.Request(url, method="POST" if data is not None else "GET")
    req.add_header("Authorization", f"Bearer {tok}")
    req.add_header("User-Agent", "curl/8.5.0")
    req.add_header("Accept", "application/json")
    body = None
    if data is not None:
        req.add_header("Content-Type", "application/json")
        body = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, body, timeout=45) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        raa = e.read() or b""
        try:
            return e.code, json.loads(raa or b"null")
        except Exception:
            return e.code, {"raa": raa[:300].decode("utf8", "replace")}


def _sql(tok, q, params=None):
    st, body = _kald(f"https://api.supabase.com/v1/projects/{SUPA}/database/query", tok, {"query": q})
    if st not in (200, 201):
        sys.exit(f"sql fejlede ({st}): {str(body)[:200]}")
    return body


def _site_tal(fra: dt.date, til: dt.date) -> dict:
    """Vercel Web Analytics for ugen: besøgende i alt, på de tre døre, og de to klik-events.
    Fejler stille (tomt dict) — sitets tal må aldrig stoppe opsamlingen."""
    import urllib.parse
    tok = _vercel_token()
    if not tok:
        return {}
    since, until = f"{fra}T00:00:00.000Z", f"{til + dt.timedelta(days=1)}T00:00:00.000Z"
    base = {"projectId": VERCEL_PRJ, "teamId": VERCEL_TEAM, "since": since, "until": until}

    def hent(sti, **ekstra):
        st, r = _kald(f"https://api.vercel.com/v1/query/web-analytics/{sti}?{urllib.parse.urlencode({**base, **ekstra})}", tok)
        return r.get("data") if st == 200 and isinstance(r, dict) else None

    ud = {}
    tot = hent("visits/count")
    if isinstance(tot, dict):
        ud["site_besoeg"] = tot.get("visitors")
    stier = hent("visits/aggregate", by="requestPath",
                 filter="requestPath eq '/booking' or requestPath eq '/walk-in' or requestPath eq '/en/walk-in' or requestPath eq '/shop' or requestPath eq '/en/shop' or requestPath eq '/en/booking'")
    if isinstance(stier, list):
        pr = {x.get("requestPath"): x.get("visitors") or 0 for x in stier}
        ud["site_booking"] = pr.get("/booking", 0) + pr.get("/en/booking", 0)
        ud["site_walkin"] = pr.get("/walk-in", 0) + pr.get("/en/walk-in", 0)
        ud["site_shop"] = pr.get("/shop", 0) + pr.get("/en/shop", 0)
    ev = hent("events/aggregate", by="eventName", limit="20")
    if isinstance(ev, list):
        pr = {x.get("eventName"): x.get("count") or 0 for x in ev}
        ud["site_book_klik"] = pr.get("book_klik", 0)
        ud["site_koeb_klik"] = pr.get("koeb_klik", 0)
    return ud


def _iso_uge(d: dt.date) -> str:
    y, w, _ = d.isocalendar()
    return f"{y}-W{w:02d}"


def _uge_graenser(uge: str):
    y, w = uge.split("-W")
    man = dt.date.fromisocalendar(int(y), int(w), 1)
    return man, man + dt.timedelta(days=6)


def hent(uge: str | None):
    tok = _supabase_token()
    if not uge:
        # Mandag morgen: forrige uge.
        uge = _iso_uge(dt.date.today() - dt.timedelta(days=7))
    fra, til = _uge_graenser(uge)
    fund = _sql(tok, f"""
        select id, slag, tekst, dato, hvem, ind, koebte, salg, spoergsmaal, svar, svar_af, svar_paa, opgave, oprettet
        from public.gulvet_fund
        where dato between '{fra}' and '{til}'
        order by dato, oprettet;""")
    aabne = _sql(tok, """
        select id, tekst, dato, hvem, opgave, oprettet from public.gulvet_fund
        where spoergsmaal and svar is null order by oprettet;""")
    fremdrift = _sql(tok, "select opgave, klaret, af, naar from public.gulvet_fremdrift order by opgave;")
    forrige = _sql(tok, "select uge, konklusioner, naeste, tal from public.gulvet_analyse order by skrevet desc limit 3;")
    vagter = [f for f in fund if any(f.get(k) is not None for k in ("ind", "koebte", "salg"))]
    tal = {
        "doer_vagter": len(vagter),
        "doer_ind": sum(f.get("ind") or 0 for f in vagter),
        "doer_koebte": sum(f.get("koebte") or 0 for f in vagter),
        "doer_salg": sum(f.get("salg") or 0 for f in vagter),
        **_site_tal(fra, til),
    }
    print(json.dumps({
        "uge": uge, "fra": str(fra), "til": str(til),
        "tal": tal, "fund": fund, "aabne_spoergsmaal": aabne,
        "fremdrift": fremdrift, "forrige_opsamlinger": forrige,
    }, ensure_ascii=False, indent=1, default=str))


def skriv(sti: str):
    d = json.load(open(sti, encoding="utf8"))
    for k in ("uge", "fra", "til", "konklusioner"):
        if k not in d:
            sys.exit(f"mangler «{k}» i {sti}")
    if not (1 <= len(d["konklusioner"]) <= 8):
        sys.exit("konklusioner: 1–8 sætninger")
    tal = {k: v for k, v in (d.get("tal") or {}).items() if k in TAL_NOEGLER and (v is None or isinstance(v, (int, float)))}
    ukendte = set((d.get("tal") or {}).keys()) - TAL_NOEGLER
    if ukendte:
        sys.exit(f"ukendte tal-nøgler: {sorted(ukendte)} — fladen viser dem ikke, så de er en fejl")
    tok = _supabase_token()

    def s(v):  # SQL-streng, escaped
        return "'" + str(v).replace("'", "''") + "'"
    konk = "array[" + ",".join(s(k) for k in d["konklusioner"]) + "]::text[]"
    naeste = s(d["naeste"]) if d.get("naeste") else "null"
    _sql(tok, f"""
        insert into public.gulvet_analyse (uge, fra, til, af, tal, konklusioner, naeste)
        values ({s(d['uge'])}, {s(d['fra'])}, {s(d['til'])}, {s(d.get('af') or 'Haruki')},
                {s(json.dumps(tal, ensure_ascii=False))}::jsonb, {konk}, {naeste});""")
    print(f"skrevet: {d['uge']} · {len(d['konklusioner'])} konklusioner · tal: {sorted(tal)}")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("hent", "skriv"):
        sys.exit(__doc__)
    if sys.argv[1] == "hent":
        hent(sys.argv[2] if len(sys.argv) > 2 else None)
    else:
        skriv(sys.argv[2])
