"use client";

import { useCallback, useMemo, useState } from "react";
import type { GuideBlok, GulvetCopy } from "@/lib/content";
import type { Fund } from "@/lib/gulvet-typer";

/**
 * Gulvet — husets oplæringsmåned og logbog.
 *
 * TRE FANER, IKKE FIRE. Første udgave havde et opslagsværk med priser og
 * åbningstider. Det blev skåret væk: de tal bor i teamguiden på /personale,
 * og en kopi her ville være den ottende udgave af noget huset lige har samlet
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
const TIMEPRIS = 140;

export function GulvetFlade({
  c,
  fund,
  fremdrift,
  hvem: hvemStart,
}: {
  c: GulvetCopy;
  fund: Fund[];
  fremdrift: Record<string, boolean>;
  hvem: string;
}) {
  const [fane, setFane] = useState<"nu" | "guider" | "skriv">("nu");
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
          slag, tekst, dato, hvem,
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
          spoergsmaal: slag === "Spørgsmål", svar: null, svar_af: null,
          oprettet: new Date().toISOString(),
        },
        ...p,
      ]);
      setTekst(""); setInd(""); setKoebte(""); setSalg("");
      setBesked({ ok: true, t: "Gemt. Det her vidste huset ikke i går." });
    } catch {
      setBesked({ ok: false, t: "Kunne ikke gemme. Tjek forbindelsen og prøv igen — det du skrev står der stadig." });
    }
    setGemmer(false);
  }

  async function klar() {
    const opgave = `o${nr + 1}`;
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

  const dom = useMemo(() => {
    const t = Number(timer) || 0, u = Number(udgift) || 0, g = Number(giver) || 0;
    if (!t && !u && !g) return null;
    const koster = t * TIMEPRIS + u;
    const rest = g - koster;
    return { ja: rest > 0, koster, giver: g, rest: Math.abs(rest), pr: t ? rest / t : 0, t };
  }, [timer, udgift, giver]);

  const F = ({ id, navn }: { id: typeof fane; navn: string }) => (
    <button type="button" role="tab" aria-selected={fane === id} className="gulv-fane"
      onClick={() => { setFane(id); window.scrollTo(0, 0); }}>
      {navn}
    </button>
  );

  return (
    <div className="gulv">
      <header className="gulv-top">
        <h1 className="gulv-mrk">{c.titel}</h1>
        <button type="button" className="gulv-hvem"
          onClick={() => {
            const v = window.prompt("Dit navn — så holdet kan se hvem der skrev hvad:", hvem);
            if (v !== null) gemNavn(v.trim());
          }}>
          {hvem || "Hvem er du?"}
        </button>
      </header>

      <div className="gulv-faner" role="tablist" aria-label="Sektioner">
        <F id="nu" navn="Nu" />
        <F id="guider" navn="Guider" />
        <F id="skriv" navn="Skriv" />
      </div>

      {fane === "nu" && opg ? (
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

      {fane === "guider" ? (
        <section className="gulv-ark">
          <div className="gulv-seg" role="tablist" aria-label="Guider">
            {c.guider.map((g) => (
              <button key={g.id} type="button" role="tab" aria-selected={guide === g.id}
                onClick={() => { setGuide(g.id); window.scrollTo(0, 0); }}>
                {g.navn}
              </button>
            ))}
          </div>
          {c.guider.find((g) => g.id === guide)?.blokke.map((b, i) => (
            <Blok key={i} b={b} flow={c.flow} />
          ))}
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
                placeholder="Kort er fint. Det halve er fint." />
            </p>
            <p className="gulv-felt">
              <label htmlFor="g-dato">Dato</label>
              <input id="g-dato" type="date" required value={dato} onChange={(e) => setDato(e.target.value)} />
            </p>
            <button type="submit" className="gulv-knap" disabled={gemmer || !tekst.trim()}>
              {gemmer ? "Gemmer…" : "Gem"}
            </button>
          </form>

          <div className="gulv-regn">
            <h2>Regn på det</h2>
            <p className="gulv-p">
              ROI er ét spørgsmål: giver det mere end det koster? Din time koster huset {TIMEPRIS} kr.
              En stoletime giver 1.000 kr.
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
            <ul className="gulv-poster">
              {poster.map((p) => (
                <li key={p.id}>
                  <p className="gulv-post__top">
                    <span className="gulv-slagmrk">{p.slag}</span>
                    <span className="gulv-post__dato">{p.dato}</span>
                    <span className="gulv-post__hvem">{p.hvem}</span>
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
          )}
        </section>
      ) : null}
    </div>
  );
}
