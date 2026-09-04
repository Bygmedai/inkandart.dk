import { ChateauHero } from "./ChateauHero";

/**
 * Gæsteside: flash upstairs hos Chateau Motel — nattens oplevelse.
 * Rummet-tokens, contact sheet, EN+DA hero. Ingen B2B/ops-copy.
 */
export function ChateauCollabFlade() {
  return (
    <main id="main" className="rum-room chateau-collab">
      <header className="chateau-collab__hero">
        <p className="rum-label">Ink &amp; Art × Chateau Motel</p>
        <h1 className="rum-poster chateau-collab__title" lang="en">
          Flash upstairs at Chateau Motel
        </h1>
        <p className="chateau-collab__lede" lang="da">
          Flash ovenpå hos Chateau Motel
        </p>
        <ChateauHero />
        <ul className="chateau-collab__rail" aria-label="Natens rammer">
          <li>Flash only</li>
          <li>8–12 pladser</li>
          <li>Fra ~23</li>
          <li>Én stol</li>
          <li>Ædru ved stolen</li>
        </ul>
      </header>

      <section className="chateau-collab__sec" aria-labelledby="chateau-tonight">
        <h2 id="chateau-tonight" className="rum-poster chateau-collab__h2">
          Hvad det er i nat
        </h2>
        <ul className="chateau-collab__bullets">
          <li>
            Små flash — ét ark, korte stykker. Ikke custom, ikke dansegulvet.
            Ét lukket rum ovenpå.
          </li>
          <li>
            Begrænset antal pladser (8–12). Når stolen er fyldt, er den fyldt.
          </li>
          <li>
            Døre ca. 23 — vi følger Chateaus rytme, ikke vores egen åbningstid.
          </li>
          <li>
            Ædru ved stolen. Punktum.
          </li>
          <li>
            Alder følger Chateaus aften (torsdag 18+ · fredag–lørdag 20+).
          </li>
        </ul>
        <p className="rum-body-copy chateau-collab__feel">
          Sent. Dæmpet lys. Én stol bag en lukket dør mens natten kører
          nedenunder. Night-gallery — ikke en booth på gulvet.
        </p>
      </section>

      <section
        className="chateau-collab__sec chateau-collab__sheet-sec"
        aria-labelledby="chateau-sheet"
      >
        <h2 id="chateau-sheet" className="rum-label chateau-collab__sheet-label">
          Rummet · arket · hænderne
        </h2>
        <div className="chateau-collab__sheet">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="chateau-collab__shot chateau-collab__shot--stol"
            src="/collab/chateau/chateau-hero-stol.png"
            alt="Én stol i et lukket rum"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="chateau-collab__shot chateau-collab__shot--trap"
            src="/collab/chateau/chateau-trapperum.png"
            alt="Trapperum og dør — stolen bag en lukket dør"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="chateau-collab__shot chateau-collab__shot--flash"
            src="/collab/chateau/chateau-flash-setup.png"
            alt="Flash-setup — ark, handsker, maskine"
          />
        </div>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-chair">
        <h2 id="chateau-chair" className="rum-poster chateau-collab__h2">
          Sådan kommer du i stolen
        </h2>
        <ul className="chateau-collab__bullets">
          <li>
            Spørg på natten, eller skriv dig op før — pladser går via Ink &amp;
            Art.
          </li>
          <li>
            Når depositum / hold-en-plads er live, får du QR. Indtil da: mail.
          </li>
          <li>
            Skriv til{" "}
            <a href="mailto:booking@inkandart.dk?subject=Chateau%20flash%20%E2%80%94%20skriv%20mig%20op">
              booking@inkandart.dk
            </a>{" "}
            — eller følg for drop, når pladserne åbner.
          </li>
        </ul>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-expect">
        <h2 id="chateau-expect" className="rum-poster chateau-collab__h2">
          Hvad du kan forvente
        </h2>
        <ul className="chateau-collab__bullets">
          <li>Sterilt setup. Handsker. Engangsnåle. Rent bord.</li>
          <li>Flash-ark på væggen — peg, vælg, sæt dig.</li>
          <li>
            Små stykker. Typisk et kvarter til en halv time i stolen — afhænger
            af motivet, ikke af køen nede.
          </li>
        </ul>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-after">
        <h2 id="chateau-after" className="rum-poster chateau-collab__h2">
          Efter
        </h2>
        <p className="rum-body-copy">
          Hold det rent. Følg aftercare — vi giver dig den med, eller læs{" "}
          <a href="/aftercare">aftercare</a> når du er hjemme.
        </p>
        <p className="rum-body-copy chateau-collab__mute" style={{ marginTop: 16 }}>
          Vil du have noget større end et flash? Find os på Larsbjørnsstræde 13
          — samme hus, andre dage.
        </p>
      </section>

      <section
        className="chateau-collab__sec chateau-collab__next"
        aria-labelledby="chateau-cta"
      >
        <h2 id="chateau-cta" className="rum-poster chateau-collab__h2">
          Skriv dig op
        </h2>
        <p className="chateau-collab__cta-wrap">
          <a
            className="chateau-collab__cta"
            href="mailto:booking@inkandart.dk?subject=Chateau%20flash%20%E2%80%94%20skriv%20mig%20op"
          >
            Skriv dig op
          </a>
        </p>
        <p className="rum-body-copy chateau-collab__cta-sub">
          Flash upstairs. Begrænsede pladser. Vi skriver tilbage.
        </p>
        <p className="rum-body-copy" style={{ marginTop: 28 }}>
          <a href="mailto:booking@inkandart.dk">booking@inkandart.dk</a>
        </p>
        <p className="rum-label chateau-collab__via">
          Ink &amp; Art · ovenpå hos Chateau Motel
        </p>
      </section>
    </main>
  );
}
