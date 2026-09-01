"use client";

import { useState } from "react";
import type { SamtykkeCopy } from "@/lib/content";

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
export function SamtykkeFlade({
  c,
  lang,
  betingelserHref,
}: {
  c: SamtykkeCopy;
  lang: "da" | "en";
  betingelserHref: string;
}) {
  const [tilstand, setTilstand] = useState<"klar" | "sender" | "tak" | "fejl" | "felter">("klar");

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
      if (res.ok) setTilstand("tak");
      else setTilstand(res.status === 422 ? "felter" : "fejl");
    } catch {
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
          <input id="navn" name="navn" required autoComplete="name" />
          <label htmlFor="foedselsdato">{c.foedselsdato}</label>
          <input id="foedselsdato" name="foedselsdato" type="date" required />
          <label htmlFor="email">{c.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="telefon">{c.telefon}</label>
          <input id="telefon" name="telefon" type="tel" autoComplete="tel" />
        </fieldset>

        <fieldset>
          <legend className="rum-label">{c.arbejdet}</legend>
          <label htmlFor="kunstner">{c.kunstner}</label>
          <input id="kunstner" name="kunstner" />
          <label htmlFor="aftale_dato">{c.aftale_dato}</label>
          <input id="aftale_dato" name="aftale_dato" type="date" required />
          <p className="rum-samtykke__hint">{c.aftale_hint}</p>
          <label htmlFor="placering">{c.placering}</label>
          <input id="placering" name="placering" required />
          <label htmlFor="motiv">{c.motiv}</label>
          <textarea id="motiv" name="motiv" rows={3} required />
          <p className="rum-samtykke__hint">{c.motiv_hint}</p>

          {/* Stoerrelse er et VALG, ikke fritekst: modstrids-reglen
              «blodfortyndende og en stor flade» skal kunne regnes ud, og
              «ret stor, tror jeg» kan ikke maales. Radioknapper frem for
              en <select>, saa hele skalaen ses paa én gang. */}
          <fieldset className="rum-samtykke__skala">
            <legend>{c.stoerrelse}</legend>
            {c.stoerrelse_valg.map((v) => (
              <label key={v.id} className="rum-samtykke__tjek">
                <input type="radio" name="stoerrelse" value={v.id} required />
                <span>{v.tekst}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="rum-samtykke__skala">
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
          <textarea id="helbred_note" name="helbred_note" rows={2} />
        </fieldset>

        <fieldset>
          <legend className="rum-label">{c.erklaering}</legend>
          {c.erklaering_valg.map((v) => (
            <label key={v.id} className="rum-samtykke__tjek">
              <input type="checkbox" name={v.id} required />
              <span>{v.tekst}</span>
            </label>
          ))}
          <label className="rum-samtykke__tjek rum-samtykke__foto">
            <input type="checkbox" name="foto_ok" />
            <span>{c.foto_ok}</span>
          </label>
        </fieldset>

        {tilstand === "fejl" ? (
          <p className="rum-samtykke__fejl" role="alert">
            {c.fejl}
          </p>
        ) : null}
        {tilstand === "felter" ? (
          <p className="rum-samtykke__fejl" role="alert">
            {c.fejl_felter}
          </p>
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
