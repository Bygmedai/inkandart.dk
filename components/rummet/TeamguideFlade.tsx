"use client";

import { useEffect, useState } from "react";
import type { TeamguideCopy } from "@/lib/content";

/**
 * Husets teamguide. Én komponent, to sprog — ordene kommer ind som data,
 * saa DA og EN ikke kan drive fra hinanden i markup.
 *
 * Tiderne og piercingpriserne kommer IKKE herfra. De sendes ind fra siden,
 * som henter dem i aabningstider.yml og piercing-priser.yml. En haandbog
 * der gentog aabningstiden ville vaere den syvende kopi af et tal huset
 * lige har samlet ét sted.
 *
 * Tjeklisterne kan sættes flueben i, og de nulstiller sig selv til naeste
 * dag. Det er forskellen paa en liste man laeser og en man bruger. Flueben
 * bor i browseren paa den enkelte telefon — ikke hos os. To der aabner
 * guiden samtidig deler ikke liste, og det er med vilje: det er den
 * enkeltes vagt, ikke husets.
 */

type Prisgruppe = { gruppe: string; linjer: { navn: string; pris: number }[] };

function Tjekliste({
  gruppe,
  lister,
  ordAf,
  ordNulstil,
}: {
  gruppe: string;
  lister: { titel: string; punkter: string[] }[];
  ordAf: string;
  ordNulstil: string;
}) {
  const alle = lister.flatMap((l, i) => l.punkter.map((_, j) => `${i}-${j}`));
  const [sat, setSat] = useState<Record<string, boolean>>({});
  const [klar, setKlar] = useState(false);

  const noegle = () => {
    const d = new Date();
    return `ia-guide-${gruppe}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  useEffect(() => {
    try {
      const r = localStorage.getItem(noegle());
      if (r) setSat(JSON.parse(r) as Record<string, boolean>);
    } catch {
      /* privat vindue, ryddet lager — listen starter bare tom */
    }
    setKlar(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skift(id: string) {
    const ny = { ...sat, [id]: !sat[id] };
    setSat(ny);
    try {
      localStorage.setItem(noegle(), JSON.stringify(ny));
    } catch {
      /* uden lager virker fluebenene stadig, de husker bare ikke */
    }
  }

  function nulstil() {
    setSat({});
    try {
      localStorage.removeItem(noegle());
    } catch {
      /* ingenting at rydde */
    }
  }

  const antal = alle.filter((id) => sat[id]).length;

  return (
    <>
      <p className="rum-guide__maaler">
        {klar ? `${antal} ${ordAf} ${alle.length}` : ` `}
        <button type="button" className="rum-guide__nulstil" onClick={nulstil}>
          {ordNulstil}
        </button>
      </p>
      {lister.map((l, i) => (
        <div className="rum-guide__liste" key={l.titel}>
          <b>{l.titel}</b>
          {l.punkter.map((p, j) => {
            const id = `${i}-${j}`;
            return (
              <label key={p}>
                <input type="checkbox" checked={Boolean(sat[id])} onChange={() => skift(id)} />
                <span>{p}</span>
              </label>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function TeamguideFlade({
  c,
  tider,
  kontakt,
  priser,
  retur,
  ordAf,
  ordNulstil,
}: {
  c: TeamguideCopy;
  tider: string[];
  kontakt: { adresse: string; telefon_vist: string; telefon_e164: string; mail: string; instagram: string };
  priser: Prisgruppe[];
  retur: string;
  ordAf: string;
  ordNulstil: string;
}) {
  return (
    <section className="rum-legal rum-guide">
      <h1 className="rum-poster">{c.titel}</h1>
      <p className="rum-body-copy rum-legal__lede">{c.lede}</p>

      <h2 className="rum-label rum-guide__h">{c.mission_titel}</h2>
      <p className="rum-body-copy">{c.mission}</p>

      <h2 className="rum-label rum-guide__h">{c.vaerdier_titel}</h2>
      <div className="rum-guide__kort">
        {c.vaerdier.map((v) => (
          <div key={v.t}>
            <b>{v.t}</b>
            <p>{v.d}</p>
          </div>
        ))}
      </div>

      <h2 className="rum-label rum-guide__h">{c.huset_titel}</h2>
      <p className="rum-body-copy">{c.huset_lede}</p>
      <dl className="rum-guide__fakta">
        <dt>Adresse</dt>
        <dd>{kontakt.adresse}</dd>
        <dt>Telefon</dt>
        <dd>
          <a className="rum-tel rum-tel--i-tekst" href={`tel:${kontakt.telefon_e164}`}>
            {kontakt.telefon_vist}
          </a>
        </dd>
        <dt>Mail</dt>
        <dd>{kontakt.mail}</dd>
        <dt>Instagram</dt>
        <dd>@{kontakt.instagram}</dd>
        {tider.map((t) => (
          <div className="rum-guide__tid" key={t}>
            <dd>{t}</dd>
          </div>
        ))}
      </dl>
      <p className="rum-guide__raab">{c.huset_booking_note}</p>

      <h2 className="rum-label rum-guide__h">{c.priser_titel}</h2>
      <p className="rum-body-copy">{c.priser_lede}</p>

      <h3 className="rum-guide__h3">{c.priser_tattoo_titel}</h3>
      <div className="rum-guide__rulle">
        <table className="rum-guide__tabel">
          <tbody>
            {c.priser_tattoo.map((y) => (
              <tr key={y.ydelse}>
                <td>{y.ydelse}</td>
                <td className="rum-guide__tal">{y.pris}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="rum-guide__h3">{c.priser_flash_titel}</h3>
      <div className="rum-guide__rulle">
        <table className="rum-guide__tabel">
          <tbody>
            {c.priser_flash.map((y) => (
              <tr key={y.ydelse}>
                <td>{y.ydelse}</td>
                <td className="rum-guide__tal">{y.pris}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rum-guide__note">{c.priser_flash_note}</p>

      <h3 className="rum-guide__h3">{c.priser_piercing_titel}</h3>
      {priser.map((g) => (
        <div className="rum-guide__rulle" key={g.gruppe}>
          <table className="rum-guide__tabel">
            <caption className="rum-guide__caption">{g.gruppe}</caption>
            <tbody>
              {g.linjer.map((l) => (
                <tr key={l.navn}>
                  <td>{l.navn}</td>
                  <td className="rum-guide__tal">{l.pris}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="rum-guide__note">{c.priser_piercing_note}</p>
      <p className="rum-guide__raab">{c.priser_kampagne}</p>

      <h2 className="rum-label rum-guide__h">{c.aabning_titel}</h2>
      <p className="rum-body-copy">{c.aabning_lede}</p>
      <Tjekliste gruppe="aabning" lister={c.aabning} ordAf={ordAf} ordNulstil={ordNulstil} />
      <p className="rum-guide__raab">{c.aabning_note}</p>

      <h2 className="rum-label rum-guide__h">{c.lukning_titel}</h2>
      <p className="rum-body-copy">{c.lukning_lede}</p>
      <Tjekliste gruppe="lukning" lister={c.lukning} ordAf={ordAf} ordNulstil={ordNulstil} />
      <p className="rum-guide__raab">{c.lukning_note}</p>

      <h2 className="rum-label rum-guide__h">{c.roller_titel}</h2>
      <p className="rum-body-copy">{c.roller_lede}</p>
      <div className="rum-guide__roller">
        {c.roller.map((r) => (
          <div key={r.navn}>
            <b>{r.navn}</b>
            <i>{r.rolle}</i>
            <p>{r.tekst}</p>
          </div>
        ))}
      </div>
      <p className="rum-guide__raab">{c.roller_note}</p>

      <h2 className="rum-label rum-guide__h">{c.salg_titel}</h2>
      <p className="rum-body-copy">{c.salg_lede}</p>
      {[
        [c.salg_mindset_titel, c.salg_mindset],
        [c.salg_faser_titel, c.salg_faser],
        [c.salg_indvendinger_titel, c.salg_indvendinger],
      ].map(([titel, liste]) => (
        <div key={titel as string}>
          <h3 className="rum-guide__h3">{titel as string}</h3>
          <div className="rum-guide__kort">
            {(liste as { t: string; d: string }[]).map((k) => (
              <div key={k.t}>
                <b>{k.t}</b>
                <p>{k.d}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="rum-guide__raab">{c.salg_maal}</p>

      <h2 className="rum-label rum-guide__h">{c.regler_titel}</h2>
      <p className="rum-body-copy">{c.regler_lede}</p>
      {c.regler.map((r) => (
        <div key={r.overskrift}>
          <h3 className="rum-guide__h3">{r.overskrift}</h3>
          <p className="rum-body-copy">{r.tekst}</p>
        </div>
      ))}

      <h2 className="rum-label rum-guide__h">{c.kontakt_titel}</h2>
      <p className="rum-body-copy">{c.kontakt_lede}</p>
      <div className="rum-guide__roller">
        {c.kontakt.map((r) => (
          <div key={r.navn}>
            <b>{r.navn}</b>
            <i>{r.rolle}</i>
            <p>{r.tekst}</p>
          </div>
        ))}
      </div>

      <h2 className="rum-label rum-guide__h">{c.kultur_titel}</h2>
      {c.kultur.map((k) => (
        <div key={k.overskrift}>
          <h3 className="rum-guide__h3">{k.overskrift}</h3>
          <p className="rum-body-copy">{k.tekst}</p>
        </div>
      ))}

      <form method="post" action="/api/vagt" className="rum-guide__ud">
        <input type="hidden" name="handling" value="ud" />
        <input type="hidden" name="retur" value={retur} />
        <button type="submit" className="rum-tel">
          {c.laas_ud}
        </button>
      </form>
    </section>
  );
}
