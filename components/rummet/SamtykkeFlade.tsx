"use client";

import { useEffect, useRef, useState } from "react";
import type { SamtykkeCopy } from "@/lib/content";
import type { Fejl } from "@/lib/samtykke";

/**
 * Samtykkeerklaeringen. Simones formular, med hans felter og hans
 * raekkefoelge — men den SENDER. Hans version gemte i browserens eget
 * lager, saa et skema udfyldt hjemme paa kundens telefon blev liggende
 * der, og butikken saa det aldrig.
 *
 * Én komponent, to sprog: ordene kommer ind som data, saa DA og EN ikke
 * kan drive fra hinanden i markup. Samme greb som PiercingBlok.
 *
 * Fail-closed som /api/subscribe efter S568: kun et rent svar fra ruten
 * giver kvittering. Alt andet siger det som det er.
 */

/**
 * Serveren siger HVILKET felt og HVORFOR. Den siger ikke hvad feltet
 * hedder paa kundens sprog — og det skal den heller ikke: ordene bor i
 * content/samtykke*.yml, saa DA og EN ikke kan drive fra hinanden.
 * Her bindes de to sammen.
 *
 * Hvorfor den findes: Steven ramte 1/9 en foedselsdato i fremtiden.
 * Ruten svarede korrekt 422 med
 * `[{felt:"foedselsdato",grund:"under18"}]` — og fladen smed listen vaek
 * og skrev «se de markerede felter» uden at markere noget. Kunden stod
 * med en formular der naegtede at sende og ingen maade at se hvorfor.
 *
 * Jeg havde selv skrevet i E2E-guiden at den tilstand ikke kunne naas
 * fra en browser, fordi felterne er `required`. Det var forkert:
 * `required` maaler at der STAAR noget, ikke at det passer.
 */
function feltnavn(c: SamtykkeCopy, felt: string): string {
  const fast: Record<string, string> = {
    navn: c.dit_navn,
    foedselsdato: c.foedselsdato,
    email: c.email,
    aftale_dato: c.aftale_dato,
    placering: c.placering,
    motiv: c.motiv,
    stoerrelse: c.stoerrelse,
    farve: c.farve,
    helbred_note: c.helbred_note,
  };
  if (fast[felt]) return fast[felt];
  // De tre erklaeringer er afkrydsninger. Deres «navn» er selve saetningen
  // kunden skal saette flueben ved — der er ikke noget kortere at pege paa.
  return c.erklaering_valg.find((v) => v.id === felt)?.tekst ?? felt;
}

/**
 * Grunden i ord. Falder tilbage til serverens raa noegle hvis oversaettelsen
 * mangler: et bart ord er ringe, men det er stadig mere end tavshed.
 * Testen «hver grund serveren kan give har ord paa begge sprog» sikrer at
 * faldet aldrig sker i drift.
 */
function grundord(c: SamtykkeCopy, grund: string): string {
  return c.fejl_grunde.find((g) => g.id === grund)?.tekst ?? grund;
}

/** Dagens dato som `yyyy-mm-dd` i BRUGERENS tidszone, ikke serverens. */
function idagLokalt(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Seneste foedselsdato der giver 18 aar i dag. Samme regel som serverens. */
function senesteFoedselsdato(d = new Date()): string {
  const f = new Date(d.getFullYear() - 18, d.getMonth(), d.getDate());
  return idagLokalt(f);
}

export function SamtykkeFlade({
  c,
  lang,
  betingelserHref,
}: {
  c: SamtykkeCopy;
  lang: "da" | "en";
  betingelserHref: string;
}) {
  const [tilstand, setTilstand] = useState<
    "klar" | "sender" | "tak" | "fejl" | "felter" | "halvt"
  >("klar");
  const [fejl, setFejl] = useState<Fejl[]>([]);
  const raab = useRef<HTMLDivElement>(null);

  /**
   * Graenserne saettes FOERST efter mount, ikke under server-renderen.
   * Serveren staar i UTC og kunden staar hvor hun staar; regnes datoen
   * to gange, giver de to forskellige svar omkring midnat, og React
   * klager over en hydrering der ikke passer. Tom paa serveren, sat i
   * browseren — og serveren er alligevel den rigtige port.
   */
  const [idag, setIdag] = useState("");
  const [attenAar, setAttenAar] = useState("");
  useEffect(() => {
    setIdag(idagLokalt());
    setAttenAar(senesteFoedselsdato());
  }, []);

  // Kommer der fejl tilbage, skal de ogsaa naas af den der ikke ser
  // skaermen. Uden dette staar fokus stadig paa knappen, og listen
  // laeses aldrig op.
  useEffect(() => {
    if (tilstand === "felter" && fejl.length) raab.current?.focus();
  }, [tilstand, fejl.length]);

  const daarlige = new Set(fejl.map((f) => f.felt));
  const maerk = (felt: string) =>
    daarlige.has(felt) ? ({ "aria-invalid": true, "data-fejl": "ja" } as const) : ({} as const);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTilstand("sender");
    const f = new FormData(e.currentTarget);
    const krop = {
      navn: f.get("navn"),
      foedselsdato: f.get("foedselsdato"),
      email: f.get("email"),
      telefon: f.get("telefon"),
      kunstner: f.get("kunstner"),
      aftale_dato: f.get("aftale_dato"),
      placering: f.get("placering"),
      motiv: f.get("motiv"),
      stoerrelse: f.get("stoerrelse"),
      farve: f.get("farve"),
      helbred: f.getAll("helbred").map(String),
      helbred_note: f.get("helbred_note"),
      foto_ok: f.get("foto_ok") === "on",
      atten: f.get("atten") === "on",
      permanent: f.get("permanent") === "on",
      aftercare: f.get("aftercare") === "on",
      sprog: lang,
      company: f.get("company"),
    };
    try {
      const res = await fetch("/api/samtykke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(krop),
      });
      if (res.ok) {
        setTilstand("tak");
      } else if (res.status === 422) {
        // Ruten sender HVILKE felter der er galt med, og hvorfor. Den
        // liste blev smidt vaek her indtil 1/9.
        const krop = (await res.json().catch(() => null)) as { fejl?: Fejl[] } | null;
        setFejl(Array.isArray(krop?.fejl) ? krop.fejl : []);
        setTilstand("felter");
      } else {
        // Ruten siger HVILKET led der faldt. Gik brevet til huset afsted,
        // men kundens kopi ikke, er «prøv igen» en løgn den anden vej —
        // huset kan allerede have erklæringen, og et nyt forsøg giver en
        // dublet. Sirius' fund 1/9.
        const krop = await res.json().catch(() => null);
        setFejl([]);
        setTilstand(krop?.led === "kunde" ? "halvt" : "fejl");
      }
    } catch {
      setFejl([]);
      setTilstand("fejl");
    }
  }

  if (tilstand === "tak") {
    return (
      <section className="rum-legal rum-samtykke">
        <h1 className="rum-poster">{c.tak_titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{c.tak}</p>
      </section>
    );
  }

  return (
    <section className="rum-legal rum-samtykke">
      <h1 className="rum-poster">{c.titel}</h1>
      <p className="rum-body-copy rum-legal__lede">{c.lede}</p>

      <form className="rum-samtykke__form" onSubmit={send} noValidate={false}>
        <p className="rum-samtykke__hp" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </p>

        <fieldset>
          <legend className="rum-label">{c.dig}</legend>
          <label htmlFor="navn">{c.dit_navn}</label>
          <input id="navn" name="navn" required autoComplete="name" {...maerk("navn")} />
          <label htmlFor="foedselsdato">{c.foedselsdato}</label>
          {/* `max` er serverens egen 18-aars-regel, sat i browseren saa den
              siger fra FOER en tur over nettet. Serveren maaler den stadig. */}
          <input
            id="foedselsdato"
            name="foedselsdato"
            type="date"
            required
            max={attenAar || undefined}
            {...maerk("foedselsdato")}
          />
          <label htmlFor="email">{c.email}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            {...maerk("email")}
          />
          <label htmlFor="telefon">{c.telefon}</label>
          <input id="telefon" name="telefon" type="tel" autoComplete="tel" />
        </fieldset>

        <fieldset>
          <legend className="rum-label">{c.arbejdet}</legend>
          <label htmlFor="kunstner">{c.kunstner}</label>
          <input id="kunstner" name="kunstner" />
          <label htmlFor="aftale_dato">{c.aftale_dato}</label>
          {/* `min` er strengere end serveren, med vilje. Serveren maa blive
              ved med at tage imod en dato der er passeret — ellers kan et
              skema ikke udfyldes ved disken paa dagen hvis uret staar
              skaevt. En dato i fortiden er derimod altid en tastefejl, og
              browseren kan sige det med sine egne ord med det samme. */}
          <input
            id="aftale_dato"
            name="aftale_dato"
            type="date"
            required
            min={idag || undefined}
            {...maerk("aftale_dato")}
          />
          <p className="rum-samtykke__hint">{c.aftale_hint}</p>
          <label htmlFor="placering">{c.placering}</label>
          <input id="placering" name="placering" required maxLength={400} {...maerk("placering")} />
          <label htmlFor="motiv">{c.motiv}</label>
          <textarea id="motiv" name="motiv" rows={3} required maxLength={400} {...maerk("motiv")} />
          <p className="rum-samtykke__hint">{c.motiv_hint}</p>

          {/* Stoerrelse er et VALG, ikke fritekst: modstrids-reglen
              «blodfortyndende og en stor flade» skal kunne regnes ud, og
              «ret stor, tror jeg» kan ikke maales. Radioknapper frem for
              en <select>, saa hele skalaen ses paa én gang. */}
          <fieldset
            className="rum-samtykke__skala"
            data-fejl={daarlige.has("stoerrelse") ? "ja" : undefined}
          >
            <legend>{c.stoerrelse}</legend>
            {c.stoerrelse_valg.map((v) => (
              <label key={v.id} className="rum-samtykke__tjek">
                <input type="radio" name="stoerrelse" value={v.id} required />
                <span>{v.tekst}</span>
              </label>
            ))}
          </fieldset>

          <fieldset
            className="rum-samtykke__skala"
            data-fejl={daarlige.has("farve") ? "ja" : undefined}
          >
            <legend>{c.farve}</legend>
            {c.farve_valg.map((v) => (
              <label key={v.id} className="rum-samtykke__tjek">
                <input type="radio" name="farve" value={v.id} required />
                <span>{v.tekst}</span>
              </label>
            ))}
          </fieldset>
        </fieldset>

        <fieldset>
          <legend className="rum-label">{c.helbred}</legend>
          <p className="rum-samtykke__hint">{c.helbred_lede}</p>
          {c.helbred_valg.map((v) => (
            <label key={v.id} className="rum-samtykke__tjek">
              <input type="checkbox" name="helbred" value={v.id} />
              <span>{v.tekst}</span>
            </label>
          ))}
          <label htmlFor="helbred_note">{c.helbred_note}</label>
          <textarea
            id="helbred_note"
            name="helbred_note"
            rows={2}
            maxLength={400}
            {...maerk("helbred_note")}
          />
        </fieldset>

        <fieldset>
          <legend className="rum-label">{c.erklaering}</legend>
          {c.erklaering_valg.map((v) => (
            <label
              key={v.id}
              className="rum-samtykke__tjek"
              data-fejl={daarlige.has(v.id) ? "ja" : undefined}
            >
              <input type="checkbox" name={v.id} required {...maerk(v.id)} />
              <span>{v.tekst}</span>
            </label>
          ))}
          <label className="rum-samtykke__tjek rum-samtykke__foto">
            <input type="checkbox" name="foto_ok" />
            <span>{c.foto_ok}</span>
          </label>
        </fieldset>

        {tilstand === "halvt" ? (
          <p className="rum-samtykke__fejl" role="alert">
            {c.fejl_halvt}
          </p>
        ) : null}
        {tilstand === "fejl" ? (
          <p className="rum-samtykke__fejl" role="alert">
            {c.fejl}
          </p>
        ) : null}
        {tilstand === "felter" ? (
          <div className="rum-samtykke__fejl" role="alert" tabIndex={-1} ref={raab}>
            <p>{c.fejl_felter}</p>
            {fejl.length ? (
              <ul className="rum-samtykke__fejl-liste">
                {fejl.map((f) => (
                  <li key={`${f.felt}-${f.grund}`}>
                    <b>{feltnavn(c, f.felt)}</b> — {grundord(c, f.grund)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <button type="submit" className="rum-book rum-book--row" disabled={tilstand === "sender"}>
          {tilstand === "sender" ? c.sender : c.send}
        </button>
      </form>

      <p className="rum-samtykke__hint rum-samtykke__print">
        <button type="button" className="rum-tel" onClick={() => window.print()}>
          {c.print}
        </button>
      </p>
      <p className="rum-samtykke__hint">
        <a href={betingelserHref}>{c.betingelser_linje}</a>
      </p>
    </section>
  );
}
