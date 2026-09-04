"use client";

import { useCallback, useMemo, useState } from "react";
import type { GuideBlok, GulvetCopy } from "@/lib/content";
import type { Analyse, Fund } from "@/lib/gulvet-typer";
import {
  effectiveTilstand, isoUge,
  perOpgave as regnPerOpgave, perSlag as regnPerSlag, perUge, perUgedag,
  planModVirkelighed, regnDoeren, svartid as regnSvartid,
} from "@/lib/gulvet-tal";

/**
 * Gulvet — husets oplæringsmåned og logbog.
 *
 * FIRE FANER. Nu · Guider · Skriv · Overblik. Den fjerde kom til fordi den
 * tredje ellers er en kirkegård: hvis det man skriver aldrig bliver regnet
 * sammen eller svaret på, holder man op med at skrive. «Overblik» regner
 * KUN på det holdet selv har skrevet — der er ikke ét tal på den fane som
 * ikke er talt i «Skriv».
 *
 * «Nu» er enten oplæring (én opgave) eller rytme (I dag / uge / venter).
 * Tilstanden kommer fra gulvet.yml og kan skifte automatisk — se
 * effectiveTilstand i lib/gulvet-tal.ts.
 *
 * Under fanerne ligger en fælles morgenstrip (Døren / Venter / Næste) —
 * synlig i begge tilstande, så huset ikke skal grave i Overblik for de
 * tre tal der gælder hver morgen.
 *
 * Der er stadig ingen prisliste her. De tal bor i teamguiden på /personale,
 * og en kopi ville være den ottende udgave af noget huset lige har samlet
 * ét sted. Siden linker derhen i stedet. Én sandhed, to sider.
 *
 * OPGAVERNE KOMMER FRA content/gulvet.yml, ikke herfra. Komponenten kender
 * kun formen — hvad der står, ejer huset. Det er hele grunden til at Nizar
 * kan rette en opgave uden en PR.
 *
 * DET DER SKRIVES, GEMMES SERVER-SIDE gennem /api/gulvet, bag samme kode som
 * siden. Ikke i browseren: Sonjas walk-in-tal skal kunne læses af nogen andre
 * end Sonjas telefon.
 */

type Fase = GulvetCopy["faser"][number];

/* -------------------------------------------------------------- **fed** ----
 * YAML må bære fremhævning uden at bære markup. En stjerne-parser er fem
 * linjer; at sprøjte rå HTML ind fra en fil fire mennesker redigerer er et hul.
 * (Og nævn ikke React-funktionen der gør det ved navn — csp-testen læser
 * kildeteksten, og en kommentar tæller med. Lært to gange nu.)
 */
function Fed({ tekst }: { tekst: string }) {
  const dele = tekst.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {dele.map((d, i) =>
        d.startsWith("**") && d.endsWith("**") && d.length > 4 ? (
          <strong key={i}>{d.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{d}</span>
        ),
      )}
    </>
  );
}

/* ----------------------------------------------------------------- diagram */

function Flow({ f }: { f: Record<string, string> & { knaek: string[] } }) {
  const R = "#9A4526";
  const boks = (x: number, y: number, w: number, h: number, rod = false) => (
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={rod ? R : "currentColor"} strokeWidth={rod ? 1.6 : 1.2} />
  );
  const navn = (x: number, y: number, s: string, rod = false) => (
    <text x={x} y={y} fontSize="14" fontWeight="600" fill={rod ? R : "currentColor"}>{s}</text>
  );
  const tal = (x: number, y: number, s: string, rod = false) => (
    <text x={x} y={y} fontFamily="monospace" fontSize="11" fill={rod ? R : "currentColor"} opacity={rod ? 1 : 0.6}>{s}</text>
  );
  const pil = (x1: number, y1: number, x2: number, y2: number, rod = false) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={rod ? R : "currentColor"} strokeWidth={rod ? 1.6 : 1.2}
      markerEnd={rod ? "url(#gpr)" : "url(#gp)"} />
  );
  return (
    <figure className="gulv-fig">
      <svg viewBox="0 0 680 560" role="img"
        aria-label="Husets syv kundeveje. Gaden, Instagram, Google, telefon og mail fører ind mod butikken, Book.dk og webshoppen. Beskederne har ingen ejer, Book.dk står tom, og alle tyve der nåede kassen forsvandt.">
        <defs>
          <marker id="gp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <polygon points="0,0 10,5 0,10" fill="currentColor" />
          </marker>
          <marker id="gpr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <polygon points="0,0 10,5 0,10" fill={R} />
          </marker>
        </defs>

        <text x="8" y="18" fontFamily="monospace" fontSize="11" fill="currentColor" opacity=".55">HVOR DE KOMMER FRA</text>
        {boks(8, 30, 150, 44)}{navn(20, 50, "Gaden")}{tal(20, 66, f.gaden)}
        {boks(8, 92, 150, 44)}{navn(20, 112, "Instagram")}{tal(20, 128, f.instagram)}
        {boks(8, 154, 150, 44)}{navn(20, 174, "Google")}{tal(20, 190, f.google)}
        {boks(8, 216, 150, 44)}{navn(20, 236, "Telefon og mail")}{tal(20, 252, f.telefon)}

        <text x="250" y="18" fontFamily="monospace" fontSize="11" fill="currentColor" opacity=".55">HVOR DE LANDER</text>
        {boks(250, 30, 170, 44)}{navn(262, 50, "Butikken")}{tal(262, 66, f.butikken)}
        {boks(250, 92, 170, 44, true)}{navn(262, 112, "Beskeder (DM)", true)}{tal(262, 128, f.dm, true)}
        {boks(250, 154, 170, 44)}{navn(262, 174, "inkandart.dk")}{tal(262, 190, f.site)}

        {pil(158, 52, 248, 52)}
        {pil(158, 114, 248, 114, true)}
        {pil(158, 120, 248, 172)}
        {pil(158, 176, 248, 176)}
        {pil(158, 238, 248, 60)}

        <text x="480" y="18" fontFamily="monospace" fontSize="11" fill="currentColor" opacity=".55">HVAD DER SKER</text>
        {boks(480, 30, 192, 60)}{navn(492, 50, "Tid i stolen")}
        {tal(492, 67, "walk-in eller aftale")}{tal(492, 82, `— ${f.stolen}`)}
        {boks(480, 154, 192, 60, true)}{navn(492, 174, "Book.dk", true)}
        {tal(492, 191, f.bookdk, true)}{tal(492, 206, "kalenderen er tom", true)}

        {pil(420, 52, 478, 52)}
        {pil(420, 114, 478, 66)}
        {pil(420, 176, 478, 176)}
        <text x="449" y="168" fontFamily="monospace" fontSize="10" fill="currentColor" opacity=".6" textAnchor="middle">book</text>

        {pil(336, 198, 336, 250)}
        <text x="344" y="228" fontFamily="monospace" fontSize="10" fill="currentColor" opacity=".6">«Shoppen»</text>
        {boks(250, 256, 170, 44)}{navn(262, 276, "butik.inkandart.dk")}{tal(262, 292, f.shop)}
        {pil(420, 278, 478, 278)}
        {boks(480, 256, 192, 44)}{navn(492, 276, "Kassen")}{tal(492, 292, f.kassen)}
        {pil(576, 300, 576, 342, true)}
        {boks(480, 348, 192, 52, true)}{navn(492, 368, "Gennemført køb", true)}{tal(492, 385, f.koeb, true)}

        <line x1="8" y1="440" x2="672" y2="440" stroke="currentColor" strokeWidth="1" opacity=".3" />
        <text x="8" y="466" fontFamily="monospace" fontSize="11" fill="currentColor" opacity=".55">DE TRE STEDER DET KNÆKKER</text>
        {f.knaek.slice(0, 3).map((k, i) => (
          <text key={i} x="8" y={490 + i * 22} fontSize="13.5" fill="currentColor">{`${i + 1} · ${k}`}</text>
        ))}
      </svg>
      <figcaption>
        Rødt er der hvor kunder forsvinder. Gaden og butikken er husets stærkeste vej —
        og den eneste ingen har talt.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------ guide-blokke */

function Blok({ b, flow }: { b: GuideBlok; flow: Record<string, string> & { knaek: string[] } }) {
  switch (b.type) {
    case "overskrift":
      return <h3 className="gulv-sek">{b.tekst}</h3>;
    case "tekst":
      return <>{b.afsnit.map((a, i) => <p key={i} className="gulv-p"><Fed tekst={a} /></p>)}</>;
    case "advarsel":
      return (
        <div className="gulv-advarsel">
          {b.afsnit.map((a, i) => <p key={i}><Fed tekst={a} /></p>)}
        </div>
      );
    case "liste":
      return (
        <ul className="gulv-trin">
          {b.punkter.map((p, i) => <li key={i}><Fed tekst={p} /></li>)}
        </ul>
      );
    case "opskrift":
      return (
        <ol className="gulv-opskrift">
          {b.trin.map((t, i) => <li key={i}><Fed tekst={t} /></li>)}
        </ol>
      );
    case "sti":
      return (
        <p className="gulv-sti">
          {b.led.map((l, i) => (
            <span key={i}>
              {i > 0 ? <i aria-hidden="true">→</i> : null}
              <span>{l}</span>
            </span>
          ))}
        </p>
      );
    case "tabel":
      return (
        <div className="gulv-rulle">
          <table className="gulv-tab">
            <thead>
              <tr>{b.kolonner.map((k, i) => <th key={i} scope="col">{k}</th>)}</tr>
            </thead>
            <tbody>
              {b.raekker.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}><Fed tekst={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "kort":
      return (
        <div className="gulv-kort">
          <h4>{b.titel}</h4>
          {b.rk.map(([m, v], i) => (
            <div key={i} className="gulv-kort__rk">
              <span>{m}</span>
              <p><Fed tekst={v ?? ""} /></p>
            </div>
          ))}
        </div>
      );
    case "diagram":
      return <Flow f={flow} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------- flade */

const KR = (n: number) => `${Math.round(n).toLocaleString("da-DK")} kr`;
const PCT = (n: number) => `${Math.round(n * 100)}%`;
/** Kun rigtige uuid'er kan besvares. En post der lige er gemt optimistisk
 *  har et midlertidigt id, og serveren ville afvise den — så vises knappen
 *  ikke. En knap der ikke kan virke er værre end ingen knap. */
const ER_UUID = /^[0-9a-f-]{36}$/i;

/* ------------------------------------------------------------- stolper
 * Én serie, vandret, tynd. Tallet står direkte ved stolpen, så der er ingen
 * akse at læse på tværs. Stolper med kun én vagt bag sig tegnes hult og får
 * ordet «1 vagt» — usikkerheden skal kunne læses uden farve. Ingen anden
 * akse, ingen anden serie: to mål af forskellig skala er to figurer.
 */
function Stolper({
  rk, aria,
}: {
  rk: { navn: string; v: number; etiket: string; note?: string; usikker?: boolean }[];
  aria: string;
}) {
  // HTML-rækker, ikke ét SVG: et SVG på 640 px skaleret til en telefon gør
  // teksten otte pixel høj og klipper den længste etiket. Målt S579.
  const maks = Math.max(1, ...rk.map((r) => r.v));
  return (
    <figure className="gulv-fig gulv-stolper" role="img" aria-label={aria}>
      {rk.map((r) => (
        <div key={r.navn} className={`gulv-stolpe${r.v > 0 ? "" : " er-tom"}${r.usikker ? " er-usikker" : ""}`}
          title={`${r.navn}: ${r.etiket}${r.note ? ` · ${r.note}` : ""}`}>
          <span className="gulv-stolpe__navn">{r.navn}</span>
          <span className="gulv-stolpe__bane">
            <span className="gulv-stolpe__stang" style={{ width: r.v > 0 ? `${Math.max(2, (r.v / maks) * 100)}%` : 0 }} />
          </span>
          <span className="gulv-stolpe__tal">
            {r.v > 0 ? <b>{r.etiket}</b> : <b>—</b>}
            {r.note ? <i>{r.note}</i> : null}
          </span>
        </div>
      ))}
    </figure>
  );
}

/** Ugens systemtal i én stribe. Nøglerne ejes af den ugentlige kørsel;
 *  fladen kender kun etiketterne og viser det den kan genkende. */
const TAL_NAVNE: [string, string][] = [
  ["doer_vagter", "vagter talt"], ["doer_ind", "ind ad døren"], ["doer_koebte", "købte"], ["doer_salg", "på gulvet"],
  ["shop_sessions", "besøg i shoppen"], ["shop_kasse", "nåede kassen"], ["shop_koeb", "købte online"], ["shop_salg", "online"],
  ["book_bookinger", "bookinger i Book.dk"], ["ig_foelgere", "følgere"], ["ig_opslag", "opslag"],
  ["site_besoeg", "besøg på sitet"], ["site_booking", "så /booking"], ["site_walkin", "så /walk-in"],
  ["site_shop", "så /shop"], ["site_book_klik", "trykkede book"], ["site_koeb_klik", "trykkede køb"],
];
function TalStrip({ tal }: { tal: Record<string, number | null> }) {
  const rk = TAL_NAVNE.filter(([k]) => tal[k] !== undefined && tal[k] !== null);
  if (!rk.length) return null;
  return (
    <p className="gulv-tal gulv-tal--stribe">
      {rk.map(([k, e]) => (
        <span key={k}><b>{k === "doer_salg" || k === "shop_salg" ? KR(tal[k] as number) : (tal[k] as number).toLocaleString("da-DK")}</b> {e}</span>
      ))}
    </p>
  );
}

/** Overblikkets eneste byggesten: ét tal, hvad det er, og hvor det kommer fra.
 *  Valgfri onClick gør cellen til knap (morgenstrip «Venter» → Overblik/Nu). */
function Maal({ v, e, n, onClick }: { v: string; e: string; n?: string; onClick?: () => void }) {
  const indre = (
    <>
      <b>{v}</b>
      <span>{e}</span>
      {n ? <i>{n}</i> : null}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className="gulv-maal" onClick={onClick}>
        {indre}
      </button>
    );
  }
  return <div className="gulv-maal">{indre}</div>;
}

export function GulvetFlade({
  c,
  fund,
  fremdrift,
  analyser,
  hvem: hvemStart,
}: {
  c: GulvetCopy;
  fund: Fund[];
  fremdrift: Record<string, boolean>;
  analyser: Analyse[];
  hvem: string;
}) {
  const [fane, setFane] = useState<"nu" | "guider" | "skriv" | "overblik">("nu");
  const [guide, setGuide] = useState(c.guider[0]?.id ?? "");
  const [gjort, setGjort] = useState(fremdrift);
  const [poster, setPoster] = useState(fund);
  const [hvem, setHvem] = useState(hvemStart);
  const [slag, setSlag] = useState(c.slags[0] ?? "Andet");
  const [tekst, setTekst] = useState("");
  const [dato, setDato] = useState(() => new Date().toISOString().slice(0, 10));
  const [ind, setInd] = useState("");
  const [koebte, setKoebte] = useState("");
  const [salg, setSalg] = useState("");
  const [besked, setBesked] = useState<{ ok: boolean; t: string } | null>(null);
  const [gemmer, setGemmer] = useState(false);
  const [timer, setTimer] = useState("");
  const [udgift, setUdgift] = useState("");
  const [giver, setGiver] = useState("");
  // null = «følg den opgave hun er i gang med». Først når hun selv vælger
  // noget andet, holder valget fast — og kun til hun har gemt.
  const [tilOpgave, setTilOpgave] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [alle, setAlle] = useState(false);
  const [udkast, setUdkast] = useState<Record<string, string>>({});
  const [svarer, setSvarer] = useState<string | null>(null);
  const [svarFejl, setSvarFejl] = useState("");
  // Placeholder når walk-in åbner Skriv — almindelig tekst ellers.
  const [skrivPlaceholder, setSkrivPlaceholder] = useState("Kort er fint. Det halve er fint.");

  const naeste = c.opgaver.findIndex((_, i) => !gjort[`o${i + 1}`]);
  const nr = naeste === -1 ? c.opgaver.length - 1 : naeste;
  const opg = c.opgaver[nr];
  const klaret = Boolean(gjort[`o${nr + 1}`]);
  const fase: Fase | undefined = c.faser.find((f) => nr >= f.fra && nr < f.til) ?? c.faser.at(-1);

  const gemNavn = useCallback((v: string) => {
    setHvem(v);
    // Navnet er en bekvemmelighed på den enkelte telefon, ikke en identitet.
    try { v ? localStorage.setItem("ia-gulv-hvem", v) : localStorage.removeItem("ia-gulv-hvem"); } catch { /* privat browser */ }
  }, []);

  async function send() {
    if (!tekst.trim() || gemmer) return;
    setGemmer(true);
    setBesked(null);
    try {
      const r = await fetch("/api/gulvet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slag, tekst, dato, hvem, opgave: valgtOpgave,
          ...(slag === "Vagt-tal" ? { ind, koebte, salg } : {}),
        }),
      });
      const j = await r.json().catch(() => ({ ok: false }));
      if (!j.ok) throw new Error();
      setPoster((p) => [
        {
          id: `ny-${Date.now()}`, slag, tekst: tekst.trim(), dato, hvem,
          ind: ind === "" ? null : Number(ind),
          koebte: koebte === "" ? null : Number(koebte),
          salg: salg === "" ? null : Number(salg),
          spoergsmaal: slag === "Spørgsmål", svar: null, svar_af: null, svar_paa: null,
          opgave: valgtOpgave || null,
          oprettet: new Date().toISOString(),
        },
        ...p,
      ]);
      setTekst(""); setInd(""); setKoebte(""); setSalg(""); setTilOpgave(null);
      setBesked({ ok: true, t: "Gemt. Det her vidste huset ikke i går." });
    } catch {
      setBesked({ ok: false, t: "Kunne ikke gemme. Tjek forbindelsen og prøv igen — det du skrev står der stadig." });
    }
    setGemmer(false);
  }

  async function klarOpgave(opgave: string) {
    setGjort((g) => ({ ...g, [opgave]: true }));
    const r = await fetch("/api/gulvet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opgave, hvem }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({ ok: false })) : { ok: false };
    // Rul tilbage hvis serveren ikke tog imod — ellers tror hun den er gemt.
    if (!j.ok) setGjort((g) => { const n = { ...g }; delete n[opgave]; return n; });
  }
  async function klar() { return klarOpgave(`o${nr + 1}`); }

  function aabnSkriv(slagNavn: string, placeholder?: string) {
    setSlag(slagNavn);
    if (placeholder) setSkrivPlaceholder(placeholder);
    else setSkrivPlaceholder("Kort er fint. Det halve er fint.");
    setFane("skriv");
    window.scrollTo(0, 0);
  }

  const dom = useMemo(() => {
    const t = Number(timer) || 0, u = Number(udgift) || 0, g = Number(giver) || 0;
    if (!t && !u && !g) return null;
    const koster = t * c.tal.timepris + u;
    const rest = g - koster;
    return { ja: rest > 0, koster, giver: g, rest: Math.abs(rest), pr: t ? rest / t : 0, t };
  }, [timer, udgift, giver, c.tal.timepris]);

  /* ------------------------------------------------------------ overblik
   *
   * Alt herunder er REGNET af det holdet selv har skrevet. Der er ingen
   * konstant her som ikke enten kommer fra en post eller fra gulvet.yml.
   * Det er hele forskellen på den her fane og et gæt med decimaler.
   */

  const doeren = useMemo(
    () => regnDoeren(poster, c.overblik.vagter_min, c.tal.stoletime),
    [poster, c.overblik.vagter_min, c.tal.stoletime],
  );
  const perOpgave = useMemo(() => regnPerOpgave(poster), [poster]);
  const perSlag = useMemo(() => regnPerSlag(poster, c.slags), [poster, c.slags]);
  const ugedage = useMemo(() => perUgedag(poster), [poster]);
  const uger = useMemo(() => perUge(poster), [poster]);
  const svartid = useMemo(() => regnSvartid(poster), [poster]);
  // Startdato: husets, ellers mandagen i den uge det første blev skrevet.
  const start = useMemo(() => {
    if (c.overblik.start) return c.overblik.start;
    const foerste = poster.map((p) => p.dato).sort()[0];
    if (!foerste) return "";
    const d = new Date(`${foerste}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }, [c.overblik.start, poster]);
  const plan = useMemo(() => planModVirkelighed(gjort, c.faser, start), [gjort, c.faser, start]);
  const seneste = analyser[0] ?? null;
  const talForUge = (uge: string) => analyser.find((a) => a.uge === uge)?.tal ?? null;

  const vagterTalt = useMemo(
    () => poster.filter((p) => p.ind !== null || p.koebte !== null || p.salg !== null).length,
    [poster],
  );
  const mode = useMemo(
    () => effectiveTilstand({
      tilstand: c.tilstand,
      fremdrift: gjort,
      opgaveAntal: c.opgaver.length,
      start: c.overblik.start,
      vagterMin: c.overblik.vagter_min,
      vagterTalt,
    }),
    [c.tilstand, gjort, c.opgaver.length, c.overblik.start, c.overblik.vagter_min, vagterTalt],
  );
  const autoSkiftet = mode === "rytme" && c.tilstand !== "rytme";
  const ugeNu = useMemo(() => isoUge(new Date().toISOString().slice(0, 10)), []);
  const ugeVagter = useMemo(
    () => poster.filter((p) =>
      (p.ind !== null || p.koebte !== null || p.salg !== null) && isoUge(p.dato) === ugeNu),
    [poster, ugeNu],
  );
  const vagterDenneUge = ugeVagter.length;
  const indDenneUge = useMemo(
    () => ugeVagter.reduce((a, p) => a + (p.ind ?? 0), 0),
    [ugeVagter],
  );

  const aabne = poster.filter((p) => p.spoergsmaal && !p.svar);
  const besvarede = poster.filter((p) => p.spoergsmaal && p.svar);
  const valgtOpgave = tilOpgave === null ? `o${nr + 1}` : tilOpgave;
  const filtreret = filter ? poster.filter((p) => p.slag === filter) : poster;
  const synlige = alle ? filtreret : filtreret.slice(0, 25);

  async function svarPaa(id: string) {
    const t = (udkast[id] ?? "").trim();
    if (!t || svarer) return;
    setSvarer(id);
    setSvarFejl("");
    const r = await fetch("/api/gulvet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, svar: t, hvem }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({ ok: false })) : { ok: false };
    if (j.ok) {
      setPoster((ps) => ps.map((p) => (p.id === id
        ? { ...p, svar: t, svar_af: hvem || "Holdet", svar_paa: new Date().toISOString() }
        : p)));
      setUdkast((u) => { const n2 = { ...u }; delete n2[id]; return n2; });
    } else {
      setSvarFejl("Svaret blev ikke gemt. Prøv igen — det du skrev står der stadig.");
    }
    setSvarer(null);
  }

  const F = ({ id, navn }: { id: typeof fane; navn: string }) => (
    <button type="button" role="tab" aria-selected={fane === id} className="gulv-fane"
      onClick={() => { setFane(id); window.scrollTo(0, 0); }}>
      {navn}
    </button>
  );

  return (
    <div className="gulv">
      <header className="gulv-top">
        <div className="gulv-navn">
          <p className="gulv-kicker">{c.undertitel}</p>
          <h1 className="gulv-mrk">{c.titel}</h1>
        </div>
        <button type="button" className="gulv-hvem"
          onClick={() => {
            const v = window.prompt("Dit navn — så holdet kan se hvem der skrev hvad:", hvem);
            if (v !== null) gemNavn(v.trim());
          }}>
          {hvem || "Dit navn"}
        </button>
      </header>

      <div className="gulv-faner" role="tablist" aria-label="Sektioner">
        <F id="nu" navn="Nu" />
        <F id="guider" navn="Guider" />
        <F id="skriv" navn="Skriv" />
        <F id="overblik" navn="Overblik" />
      </div>

      {/* Fælles morgenstrip — under fanerne, synlig på alle faner i begge tilstande. */}
      <section className="gulv-morgen" aria-label="Morgen">
        <div className="gulv-maalraek">
          {vagterDenneUge === 0 ? (
            <Maal v="—" e={c.morgen.doeren_titel} n={c.morgen.doeren_tom} />
          ) : (
            <Maal
              v={String(vagterDenneUge)}
              e={c.morgen.doeren_titel}
              n={[
                indDenneUge > 0 ? `${indDenneUge} ind denne uge` : null,
                doeren && doeren.ind > 0 ? `${doeren.ind} ind i alt` : null,
              ].filter(Boolean).join(" · ") || undefined}
            />
          )}
          {aabne.length === 0 ? (
            <Maal v="—" e={c.morgen.venter_titel} n={c.morgen.venter_tom} />
          ) : (
            <Maal
              v={String(aabne.length)}
              e={c.morgen.venter_titel}
              n={`${aabne.length} venter — ældste ${
                svartid.aeldsteAabenDage === null
                  ? "—"
                  : `${Math.round(svartid.aeldsteAabenDage)} ${Math.round(svartid.aeldsteAabenDage) === 1 ? "dag" : "dage"}`
              }`}
              onClick={() => {
                setFane(mode === "rytme" ? "nu" : "overblik");
                window.scrollTo(0, 0);
              }}
            />
          )}
          <div className="gulv-maal">
            <b>{seneste?.naeste ? "·" : "—"}</b>
            <span>{c.morgen.naeste_titel}</span>
            <i>{seneste?.naeste
              ? <Fed tekst={seneste.naeste} />
              : c.morgen.naeste_tom}</i>
          </div>
        </div>
      </section>

      {fane === "nu" && mode === "oplæring" && opg ? (
        <section className="gulv-ark">
          <p className="gulv-lede">{c.lede}</p>
          {nr === 0 ? (
            <div className="gulv-ro">
              {c.ro.map((r, i) => <p key={i}><Fed tekst={r} /></p>)}
            </div>
          ) : null}
          <p className="gulv-maaned">
            <span>{fase?.navn} · opgave {nr + 1} af {c.opgaver.length}</span>
            <em>{fase?.linje}</em>
          </p>
          <article className="gulv-opg">
            <h2>{opg.t}</h2>
            <h3>Hvad vi tror</h3>
            <p className="gulv-p">{opg.tror}</p>
            <h3>Sådan gør du</h3>
            <ul className="gulv-trin">{opg.trin.map((t, i) => <li key={i}>{t}</li>)}</ul>
            <div className="gulv-afgoer">
              <h3>Det skal du selv afgøre</h3>
              <p>{opg.afgoer}</p>
            </div>
            <p className="gulv-bring"><strong>Tag med tilbage:</strong> {opg.b}</p>
            <p className="gulv-tid">{opg.tid}</p>
            <button type="button" className={`gulv-knap${klaret ? " er-klaret" : ""}`}
              onClick={klar} disabled={klaret}>
              {klaret ? "Klaret" : "Jeg har klaret den"}
            </button>
          </article>

          <ol className="gulv-raek">
            {c.faser.map((f) => (
              <li key={f.navn} className="gulv-raek__uge">
                <h3>{f.navn} — {f.linje}</h3>
                <ol>
                  {c.opgaver.slice(f.fra, f.til).map((o, i) => {
                    const idx = f.fra + i;
                    const k = Boolean(gjort[`o${idx + 1}`]);
                    return (
                      <li key={o.t} className={k ? "er-klaret" : idx === nr ? "er-nu" : ""}>
                        <span className="gulv-nr">{idx + 1}</span>
                        <span className="gulv-t">{o.t}</span>
                        <span className="gulv-mrkt">{k ? "klaret" : idx === nr ? "i gang" : "venter"}</span>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ol>

          <p className="gulv-p gulv-teamguide">
            {c.teamguide_linje} <a href="/personale">Åbn teamguiden</a>
          </p>
        </section>
      ) : null}

      {fane === "nu" && mode === "rytme" ? (
        <section className="gulv-ark">
          {autoSkiftet && c.rytme.skiftet_linje ? (
            <p className="gulv-p" role="status">{c.rytme.skiftet_linje}</p>
          ) : null}
          <p className="gulv-lede">{c.rytme.lede || c.lede}</p>

          <h2 className="gulv-sek">{c.rytme.i_dag_titel || "I dag"}</h2>
          <p className="gulv-p">
            {seneste?.naeste
              ? <><strong>Næste</strong> · <Fed tekst={seneste.naeste} /></>
              : (c.rytme.i_dag_naeste_tom || "Ingen næste handling endnu.")}
          </p>
          <p className="gulv-felt">
            <button type="button" className="gulv-knap"
              onClick={() => aabnSkriv("Vagt-tal")}>
              {c.rytme.i_dag_vagt_knap || "Skriv vagt-tal"}
            </button>
          </p>
          <h3 className="gulv-sek">{c.rytme.i_dag_walkin_label || "Walk-in"}</h3>
          <button type="button" className="gulv-knap gulv-knap--stille"
            onClick={() => aabnSkriv("Drift", c.rytme.i_dag_walkin_placeholder || undefined)}>
            {c.rytme.i_dag_walkin_knap || "Notér en walk-in"}
          </button>

          <h2 className="gulv-sek">{c.rytme.uge_titel || "I denne uge"}</h2>
          <h3 className="gulv-sek">{c.rytme.uge_doer_titel || "Døren"}</h3>
          <div className="gulv-maalraek">
            <Maal
              v={`${vagterDenneUge}`}
              e="vagter talt denne uge"
              n={`mål ${c.overblik.vagter_min}`}
            />
          </div>
          {c.rytme.uge_doer_maal_linje ? (
            <p className="gulv-p">{c.rytme.uge_doer_maal_linje}</p>
          ) : null}

          <h3 className="gulv-sek">{c.rytme.uge_kanal_titel || "Kanalen"}</h3>
          <p className="gulv-p">
            {seneste?.naeste
              ? <Fed tekst={seneste.naeste} />
              : (c.rytme.i_dag_naeste_tom || "Ingen næste handling fra huset endnu.")}
          </p>
          {c.guider.some((g) => g.id === "content") ? (
            <button type="button" className="gulv-knap gulv-knap--stille"
              onClick={() => { setGuide("content"); setFane("guider"); window.scrollTo(0, 0); }}>
              Åbn content-planen
            </button>
          ) : null}

          <h3 className="gulv-sek">{c.rytme.uge_hylden_titel || "Hylden"}</h3>
          <p className="gulv-p">
            {c.rytme.uge_hylden_linje || "Tjek shoppen selv."}{" "}
            <a href="https://inkandart.dk/shop">inkandart.dk/shop</a>
          </p>

          <h2 className="gulv-sek">{c.rytme.venter_titel || "Venter på huset"}</h2>
          {svarFejl ? <p className="gulv-advarsel" role="status"><strong>{svarFejl}</strong></p> : null}
          {aabne.length === 0 ? (
            <p className="gulv-p">{c.rytme.venter_tom || "Ingen åbne spørgsmål."}</p>
          ) : (
            <ul className="gulv-poster">
              {[...aabne].sort((a, b) => a.oprettet.localeCompare(b.oprettet)).map((p) => {
                const dage = Math.max(0, Math.floor(
                  (Date.now() - Date.parse(p.oprettet)) / 86_400_000,
                ));
                return (
                  <li key={p.id}>
                    <p className="gulv-post__top">
                      <span className="gulv-post__dato">{p.dato}</span>
                      <span className="gulv-post__hvem">{p.hvem}</span>
                      <span className="gulv-post__opg">
                        {dage === 0 ? "i dag" : dage === 1 ? "1 dag" : `${dage} dage`}
                      </span>
                    </p>
                    <p className="gulv-cit">{p.tekst}</p>
                    {ER_UUID.test(p.id) ? (
                      <div className="gulv-svarfelt">
                        <label className="gulv-felt" htmlFor={`sv-rytme-${p.id}`}>
                          <span>Svar</span>
                        </label>
                        <textarea id={`sv-rytme-${p.id}`} value={udkast[p.id] ?? ""}
                          onChange={(e) => setUdkast((u) => ({ ...u, [p.id]: e.target.value }))}
                          placeholder="Kort svar er også et svar." />
                        <button type="button" className="gulv-knap gulv-knap--stille"
                          disabled={svarer === p.id || !(udkast[p.id] ?? "").trim()}
                          onClick={() => void svarPaa(p.id)}>
                          {svarer === p.id ? "Gemmer…" : "Gem svaret"}
                        </button>
                      </div>
                    ) : (
                      <p className="gulv-tid">
                        <button type="button" className="gulv-knap gulv-knap--stille"
                          onClick={() => { setFane("overblik"); window.scrollTo(0, 0); }}>
                          Svar på Overblik
                        </button>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {fane === "guider" ? (
        <section className="gulv-ark">
          <div className="gulv-seg" role="tablist" aria-label="Guider">
            {mode === "rytme" ? (
              <button type="button" role="tab" aria-selected={guide === "oplæring"}
                onClick={() => { setGuide("oplæring"); window.scrollTo(0, 0); }}>
                {c.rytme.oplæring_guide_navn || "Oplæring"}
              </button>
            ) : null}
            {c.guider.map((g) => (
              <button key={g.id} type="button" role="tab" aria-selected={guide === g.id}
                onClick={() => { setGuide(g.id); window.scrollTo(0, 0); }}>
                {g.navn}
              </button>
            ))}
          </div>
          {mode === "rytme" && guide === "oplæring" ? (
            <ol className="gulv-raek">
              {c.faser.map((f) => (
                <li key={f.navn} className="gulv-raek__uge">
                  <h3>{f.navn} — {f.linje}</h3>
                  <ol>
                    {c.opgaver.slice(f.fra, f.til).map((o, i) => {
                      const idx = f.fra + i;
                      const oid = `o${idx + 1}`;
                      const k = Boolean(gjort[oid]);
                      return (
                        <li key={o.t} className={k ? "er-klaret" : ""}>
                          <span className="gulv-nr">{idx + 1}</span>
                          <span className="gulv-t">{o.t}</span>
                          <span className="gulv-mrkt">{k ? "klaret" : "venter"}</span>
                          {!k ? (
                            <button type="button" className="gulv-knap gulv-knap--stille"
                              onClick={() => void klarOpgave(oid)}>
                              Jeg har klaret den
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          ) : (
            c.guider.find((g) => g.id === guide)?.blokke.map((b, i) => (
              <Blok key={i} b={b} flow={c.flow} />
            ))
          )}
        </section>
      ) : null}

      {fane === "skriv" ? (
        <section className="gulv-ark">
          <p className="gulv-lede">Alt du finder ud af, og alt du er i tvivl om. Også det halve.</p>
          {besked ? (
            <p className={besked.ok ? "gulv-kvit" : "gulv-advarsel"} role="status">{besked.t}</p>
          ) : null}

          <form className="gulv-form" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <fieldset className="gulv-felt">
              <legend>Hvad er det?</legend>
              <div className="gulv-slag">
                {c.slags.map((s) => (
                  <button key={s} type="button" aria-pressed={slag === s} onClick={() => setSlag(s)}>{s}</button>
                ))}
              </div>
            </fieldset>

            {slag === "Vagt-tal" ? (
              <div className="gulv-par">
                <p className="gulv-felt">
                  <label htmlFor="g-ind">Kom ind</label>
                  <input id="g-ind" type="number" min="0" inputMode="numeric" value={ind}
                    onChange={(e) => setInd(e.target.value)} placeholder="0" />
                </p>
                <p className="gulv-felt">
                  <label htmlFor="g-koeb">Købte noget</label>
                  <input id="g-koeb" type="number" min="0" inputMode="numeric" value={koebte}
                    onChange={(e) => setKoebte(e.target.value)} placeholder="0" />
                </p>
                <p className="gulv-felt gulv-felt--bred">
                  <label htmlFor="g-salg">Salg på gulvet, kr</label>
                  <input id="g-salg" type="number" min="0" inputMode="numeric" value={salg}
                    onChange={(e) => setSalg(e.target.value)} placeholder="0" />
                </p>
              </div>
            ) : null}

            <p className="gulv-felt">
              <label htmlFor="g-tekst">Skriv det</label>
              <textarea id="g-tekst" required value={tekst} onChange={(e) => setTekst(e.target.value)}
                placeholder={skrivPlaceholder} />
            </p>
            <p className="gulv-felt">
              <label htmlFor="g-dato">Dato</label>
              <input id="g-dato" type="date" required value={dato} onChange={(e) => setDato(e.target.value)} />
            </p>
            {/* Mærkatet er det der gør «Overblik» til et regnskab: hver opgave
                lover noget med tilbage, og her knyttes fundet til løftet. */}
            <p className="gulv-felt gulv-felt--vaelg">
              <label htmlFor="g-opg">Hører til opgave</label>
              <select id="g-opg" value={valgtOpgave} onChange={(e) => setTilOpgave(e.target.value)}>
                <option value="">Ingen bestemt</option>
                {c.opgaver.map((o, i) => (
                  <option key={o.t} value={`o${i + 1}`}>{i + 1} · {o.t}</option>
                ))}
              </select>
            </p>
            <button type="submit" className="gulv-knap" disabled={gemmer || !tekst.trim()}>
              {gemmer ? "Gemmer…" : "Gem"}
            </button>
          </form>

          <div className="gulv-regn">
            <h2>Regn på det</h2>
            <p className="gulv-p">
              ROI er ét spørgsmål: giver det mere end det koster? Din time koster huset{" "}
              {c.tal.timepris} kr. En time i stolen giver {KR(c.tal.stoletime)}.
            </p>
            <div className="gulv-par">
              <p className="gulv-felt">
                <label htmlFor="g-timer">Dine timer</label>
                <input id="g-timer" type="number" min="0" step="0.5" inputMode="decimal" value={timer}
                  onChange={(e) => setTimer(e.target.value)} placeholder="0" />
              </p>
              <p className="gulv-felt">
                <label htmlFor="g-udgift">Udgift i kr</label>
                <input id="g-udgift" type="number" min="0" inputMode="numeric" value={udgift}
                  onChange={(e) => setUdgift(e.target.value)} placeholder="0" />
              </p>
              <p className="gulv-felt gulv-felt--bred">
                <label htmlFor="g-giver">Hvad kan det give i kr?</label>
                <input id="g-giver" type="number" min="0" inputMode="numeric" value={giver}
                  onChange={(e) => setGiver(e.target.value)} placeholder="0" />
              </p>
            </div>
            <p className={`gulv-dom${dom ? (dom.ja ? " er-ja" : " er-nej") : ""}`} role="status">
              <strong>Svar</strong>
              {!dom ? "Skriv tallene, så regner den selv."
                : dom.ja
                  ? `Ja — det giver mere end det koster. Det koster ${KR(dom.koster)} og giver ${KR(dom.giver)}. Der er ${KR(dom.rest)} tilbage.${dom.t ? ` Det svarer til ${KR(dom.pr)} pr. time du bruger.` : ""}`
                  : `Nej — ikke som det ser ud nu. Det koster ${KR(dom.koster)} og giver ${KR(dom.giver)}. Der mangler ${KR(dom.rest)}. Kan det gøres på færre timer, eller give mere? Ellers er et nej det rigtige svar.`}
            </p>
          </div>

          <h2 className="gulv-sek">Det I har skrevet</h2>
          {poster.length === 0 ? (
            <p className="gulv-p">Ikke noget endnu. Det første du skriver her er det første huset ved.</p>
          ) : (
            <>
            <div className="gulv-seg" role="tablist" aria-label="Filtrér">
              <button type="button" role="tab" aria-selected={filter === null}
                onClick={() => { setFilter(null); setAlle(false); }}>
                Alle {poster.length}
              </button>
              {perSlag.filter(([, r]) => r.n > 0).map(([sl, r]) => (
                <button key={sl} type="button" role="tab" aria-selected={filter === sl}
                  onClick={() => { setFilter(sl); setAlle(false); }}>
                  {sl} {r.n}
                </button>
              ))}
            </div>
            <ul className="gulv-poster">
              {synlige.map((p) => (
                <li key={p.id}>
                  <p className="gulv-post__top">
                    <span className="gulv-slagmrk">{p.slag}</span>
                    <span className="gulv-post__dato">{p.dato}</span>
                    <span className="gulv-post__hvem">{p.hvem}</span>
                    {p.opgave ? <span className="gulv-post__opg">opgave {p.opgave.slice(1)}</span> : null}
                    {p.spoergsmaal && !p.svar ? <span className="gulv-ubesvaret">mangler svar</span> : null}
                  </p>
                  {p.ind !== null || p.koebte !== null || p.salg !== null ? (
                    <p className="gulv-tal">
                      {p.ind !== null ? <span><b>{p.ind}</b> kom ind</span> : null}
                      {p.koebte !== null ? <span><b>{p.koebte}</b> købte</span> : null}
                      {p.ind ? <span><b>{Math.round(((p.koebte ?? 0) / p.ind) * 100)}%</b> lukket</span> : null}
                      {p.salg !== null ? <span><b>{p.salg.toLocaleString("da-DK")}</b> kr</span> : null}
                    </p>
                  ) : null}
                  <p className="gulv-cit">{p.tekst}</p>
                  {p.svar ? (
                    <p className="gulv-svar">
                      <strong>Svar{p.svar_af ? ` · ${p.svar_af}` : ""}</strong>
                      {p.svar}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {!alle && filtreret.length > synlige.length ? (
              <button type="button" className="gulv-knap gulv-knap--stille" onClick={() => setAlle(true)}>
                Vis alle {filtreret.length}
              </button>
            ) : null}
            </>
          )}
        </section>
      ) : null}

      {/* ------------------------------------------------------------------
          OVERBLIK. Det der gør «Skriv» til andet end en kirkegård: tallene
          bliver regnet sammen, spørgsmålene bliver besvaret, og hver opgave
          i måneden kan gøres op mod det den lovede. Intet på fanen er hentet
          udefra — hvert eneste tal står skrevet af nogen i huset.
          --------------------------------------------------------------- */}
      {fane === "overblik" ? (
        <section className="gulv-ark">
          <p className="gulv-lede">{c.overblik.lede}</p>

          <section className="gulv-laerte" aria-labelledby="gulv-laerte-h">
            <p className="gulv-laerte__mrk">
              <span>Huset lærte</span>
              {seneste ? <em>{seneste.uge.replace(/^\d{4}-W0?/, "uge ")} · {seneste.fra} – {seneste.til} · {seneste.af}</em> : null}
            </p>
            {!seneste ? (
              <p className="gulv-p" id="gulv-laerte-h">{c.overblik.laerte_tom}</p>
            ) : (
              <>
                <h2 id="gulv-laerte-h" className="gulv-visuelt-skjult">Huset lærte {seneste.uge}</h2>
                <ol className="gulv-laerte__liste">
                  {seneste.konklusioner.map((k, i) => <li key={i}><Fed tekst={k} /></li>)}
                </ol>
                {seneste.naeste ? (
                  <p className="gulv-laerte__naeste"><strong>Næste uge</strong><Fed tekst={seneste.naeste} /></p>
                ) : null}
                <TalStrip tal={seneste.tal} />
              </>
            )}
            <p className="gulv-laerte__fod">{c.overblik.laerte_lede}</p>
          </section>

          {poster.length === 0 ? (
            <p className="gulv-p">{c.overblik.tom}</p>
          ) : null}

          <h2 className="gulv-sek">Døren</h2>
          {!doeren ? (
            <p className="gulv-p">
              Der er ikke talt en vagt endnu. Vælg <strong>Vagt-tal</strong> i «Skriv» og skriv
              hvor mange der kom ind. Det tal har huset aldrig haft — «80–160 om måneden» er
              et gæt, ikke en måling.
            </p>
          ) : (
            <>
              <div className="gulv-maalraek">
                <Maal v={String(doeren.ind)} e="kom ind"
                  n={`${doeren.vagter} ${doeren.vagter === 1 ? "vagt" : "vagter"} · ${doeren.fra} – ${doeren.til}`} />
                <Maal v={String(doeren.koebte)} e="købte noget" />
                <Maal v={doeren.lukke === null ? "—" : PCT(doeren.lukke)} e="lukkerate"
                  n={doeren.lukke === null ? "ingen talt ind endnu" : undefined} />
                <Maal v={KR(doeren.salg)} e="salg på gulvet" />
                <Maal v={doeren.prHoved === null ? "—" : KR(doeren.prHoved)} e="pr. person ind ad døren" />
                <Maal v={String(Math.round(doeren.indPrVagt))} e="ind pr. vagt" />
              </div>

              {!doeren.nok ? (
                <p className="gulv-dom" role="status">
                  <strong>Stikprøve</strong>
                  {doeren.vagter} {doeren.vagter === 1 ? "vagt" : "vagter"} talt. Der skal{" "}
                  {doeren.mangler} mere, før det her er andet end en stikprøve — og siden regner
                  ikke et månedstal på for lidt. Det er den samme knap hver vagt.
                </p>
              ) : (
                <p className={`gulv-dom${doeren.lukke && doeren.lukke > 0 ? " er-ja" : " er-nej"}`} role="status">
                  <strong>Svar</strong>
                  {doeren.lukke === null
                    ? `${doeren.vagter} vagter talt, men ingen har skrevet hvor mange der kom ind.`
                    : `${doeren.vagter} vagter talt. ${PCT(doeren.lukke)} af dem der kom ind ad døren købte noget. ${c.overblik.web_linje}`}
                </p>
              )}

              <p className="gulv-dom" role="status">
                <strong>Hvad det er værd</strong>
                {doeren.stoletimer < 1
                  ? `Gulvsalget er ${KR(doeren.salg)} indtil nu — mindre end én time i stolen (${KR(c.tal.stoletime)}). Gulvsalg betaler ikke huset. Det er noget man tager med, fordi de allerede står der.`
                  : `Gulvsalget er ${KR(doeren.salg)} indtil nu — ${doeren.stoletimer.toFixed(1).replace(".", ",")} timer i stolen. Det er ikke en sidegevinst længere, og det tåler at blive planlagt.`}
              </p>
            </>
          )}

          <h2 className="gulv-sek">Spørgsmål der venter</h2>
          <p className="gulv-lede">{c.overblik.svar_lede}</p>
          {svartid.besvarede + svartid.aabne > 0 ? (
            <p className={`gulv-dom${svartid.aeldsteAabenDage !== null && svartid.aeldsteAabenDage >= 7 ? " er-nej" : svartid.besvarede ? " er-ja" : ""}`} role="status">
              <strong>Husets svartid</strong>
              {svartid.besvarede
                ? `${svartid.besvarede} besvaret, typisk efter ${svartid.medianDage === null ? "–" : svartid.medianDage < 1 ? "under en dag" : `${Math.round(svartid.medianDage)} ${Math.round(svartid.medianDage) === 1 ? "dag" : "dage"}`}. `
                : "Intet besvaret endnu. "}
              {svartid.aabne
                ? `${svartid.aabne} venter${svartid.aeldsteAabenDage !== null && svartid.aeldsteAabenDage >= 1 ? ` — det ældste i ${Math.round(svartid.aeldsteAabenDage)} ${Math.round(svartid.aeldsteAabenDage) === 1 ? "dag" : "dage"}` : ""}.`
                : "Ingen venter."}
              {svartid.aeldsteAabenDage !== null && svartid.aeldsteAabenDage >= 7 ? " Det er ikke Sonja der er problemet." : ""}
            </p>
          ) : null}
          {svarFejl ? <p className="gulv-advarsel" role="status"><strong>{svarFejl}</strong></p> : null}
          {aabne.length === 0 ? (
            <p className="gulv-p">
              Ingen ubesvarede.{besvarede.length ? ` ${besvarede.length} er besvaret.` : ""}
            </p>
          ) : (
            <ul className="gulv-poster">
              {aabne.map((p) => (
                <li key={p.id}>
                  <p className="gulv-post__top">
                    <span className="gulv-post__dato">{p.dato}</span>
                    <span className="gulv-post__hvem">{p.hvem}</span>
                    {p.opgave ? <span className="gulv-post__opg">opgave {p.opgave.slice(1)}</span> : null}
                  </p>
                  <p className="gulv-cit">{p.tekst}</p>
                  {ER_UUID.test(p.id) ? (
                    <div className="gulv-svarfelt">
                      <label className="gulv-felt" htmlFor={`sv-${p.id}`}>
                        <span>Svar</span>
                      </label>
                      <textarea id={`sv-${p.id}`} value={udkast[p.id] ?? ""}
                        onChange={(e) => setUdkast((u) => ({ ...u, [p.id]: e.target.value }))}
                        placeholder="Kort svar er også et svar." />
                      <button type="button" className="gulv-knap gulv-knap--stille"
                        disabled={svarer === p.id || !(udkast[p.id] ?? "").trim()}
                        onClick={() => void svarPaa(p.id)}>
                        {svarer === p.id ? "Gemmer…" : "Gem svaret"}
                      </button>
                    </div>
                  ) : (
                    <p className="gulv-tid">Genindlæs siden for at kunne svare på den her.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {besvarede.length ? (
            <details className="gulv-fold">
              <summary>{besvarede.length} besvaret{besvarede.length === 1 ? "" : "e"} spørgsmål</summary>
              <ul className="gulv-poster">
                {besvarede.map((p) => (
                  <li key={p.id}>
                    <p className="gulv-post__top">
                      <span className="gulv-post__dato">{p.dato}</span>
                      <span className="gulv-post__hvem">{p.hvem}</span>
                    </p>
                    <p className="gulv-cit">{p.tekst}</p>
                    <p className="gulv-svar">
                      <strong>Svar{p.svar_af ? ` · ${p.svar_af}` : ""}</strong>
                      {p.svar}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <h2 className="gulv-sek">Måneden, opgave for opgave</h2>
          <p className="gulv-lede">{c.overblik.opgave_lede}</p>
          {plan && plan.ugeNr > 0 ? (
            <p className={`gulv-dom${plan.bagud === 0 ? " er-ja" : plan.bagud >= 3 ? " er-nej" : ""}`} role="status">
              <strong>Plan mod virkelighed</strong>
              Uge {plan.ugeNr} af {c.faser.length}, fra {start}. Planen siger {plan.forventet} klaret.
              Der er klaret {plan.klaret}.{plan.bagud === 0 ? " Det holder." : ` ${plan.bagud} bagud — det er ikke en fejl, det er en oplysning.`}
            </p>
          ) : null}
          <ol className="gulv-regnsk">
            {c.opgaver.map((o, i) => {
              const id = `o${i + 1}`;
              const f = perOpgave.get(id) ?? [];
              const k = Boolean(gjort[id]);
              const tomt = k && f.length === 0;
              return (
                <li key={o.t} className={tomt ? "er-tom" : k ? "er-klaret" : i === nr ? "er-nu" : ""}>
                  <p className="gulv-regnsk__top">
                    <span className="gulv-nr">{i + 1}</span>
                    <span className="gulv-t">{o.t}</span>
                    <span className="gulv-mrkt">{k ? "klaret" : i === nr ? "i gang" : "venter"}</span>
                  </p>
                  {f.length ? (
                    <details className="gulv-fold">
                      <summary>{f.length} {f.length === 1 ? "note" : "noter"} herfra</summary>
                      <ul className="gulv-fold__liste">
                        {f.map((x) => (
                          <li key={x.id}><b>{x.dato}</b> {x.tekst}</li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <p className="gulv-regnsk__ingen">
                      {tomt ? "Klaret — men der kom intet med tilbage." : `Skal give: ${o.b}`}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {ugedage.some((d) => d.vagter > 0) ? (
            <>
              <h2 className="gulv-sek">Ugedagene</h2>
              <p className="gulv-lede">{c.overblik.ugedag_lede}</p>
              <Stolper
                aria="Hvor mange der kommer ind pr. vagt, fordelt på ugedag, med lukkerate ved siden af."
                rk={ugedage.map((d) => ({
                  navn: d.dag,
                  v: d.indPrVagt,
                  etiket: `${Math.round(d.indPrVagt)} ind`,
                  note: d.vagter === 0 ? undefined
                    : `${d.lukke === null ? "—" : PCT(d.lukke)} køber · ${KR(d.salgPrVagt)}${d.vagter === 1 ? " · 1 vagt" : ""}`,
                  usikker: d.vagter === 1,
                }))}
              />
              <details className="gulv-fold">
                <summary>Som tabel</summary>
                <div className="gulv-rulle">
                  <table className="gulv-tab">
                    <thead><tr><th>Dag</th><th>Vagter</th><th>Ind pr. vagt</th><th>Køber</th><th>Salg pr. vagt</th></tr></thead>
                    <tbody>
                      {ugedage.map((d) => (
                        <tr key={d.dag} className={d.vagter === 0 ? "er-nul" : ""}>
                          <td><strong>{d.dag}</strong></td>
                          <td>{d.vagter}</td>
                          <td>{d.vagter ? Math.round(d.indPrVagt) : "—"}</td>
                          <td>{d.lukke === null ? "—" : PCT(d.lukke)}</td>
                          <td>{d.vagter ? KR(d.salgPrVagt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : null}

          {uger.length > 0 ? (
            <>
              <h2 className="gulv-sek">Uge for uge</h2>
              <p className="gulv-lede">{c.overblik.uge_lede}</p>
              <Stolper
                aria="Ind pr. vagt uge for uge, med lukkerate og webshoppens tal ved siden af når de findes."
                rk={uger.map((u) => {
                  const t = talForUge(u.uge);
                  const web = t && t.shop_sessions !== null && t.shop_sessions !== undefined
                    ? ` · web ${t.shop_sessions}/${t.shop_kasse ?? "–"}/${t.shop_koeb ?? "–"}` : "";
                  return {
                    navn: u.uge.replace(/^\d{4}-W0?/, "u"),
                    v: u.indPrVagt,
                    etiket: u.vagter ? `${Math.round(u.indPrVagt)} ind` : `${u.noter} noter`,
                    note: u.vagter
                      ? `${u.lukke === null ? "—" : PCT(u.lukke)} køber · ${u.vagter} ${u.vagter === 1 ? "vagt" : "vagter"}${web}`
                      : "ingen vagt talt",
                    usikker: u.vagter < 2,
                  };
                })}
              />
              <p className="gulv-tid">web = besøg / nåede kassen / købte, fra Shopify. Kommer med mandagens opsamling.</p>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
