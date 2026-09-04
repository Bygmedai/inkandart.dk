import { ChateauHero } from "./ChateauHero";

/**
 * B2B collab one-pager til Chateau Motel (Monir).
 * Hus-ord OK — side er til partner/staff, ikke slutkunde.
 * Ingen offentlig billet-CTA, ingen fake priser, ingen hype-headline.
 */
export function ChateauCollabFlade() {
  return (
    <main id="main" className="rum-room chateau-collab">
      <header className="chateau-collab__hero">
        <p className="rum-label">Ink &amp; Art × Chateau Motel</p>
        <h1 className="rum-poster chateau-collab__title">
          Et rum. Én stol. En nat.
        </h1>
        <p className="rum-body-copy chateau-collab__lede">
          Tatovørstol som lukket rum — ikke stand på dansegulvet.
        </p>
        <ChateauHero />
      </header>

      <section className="chateau-collab__sec" aria-labelledby="chateau-faar">
        <h2 id="chateau-faar" className="rum-poster chateau-collab__h2">
          Hvad Chateau får
        </h2>
        <ul className="chateau-collab__bullets">
          <li>
            Et lukket rum med dør midt i jeres nat — gæster går ind i Ink &amp;
            Art, ikke hen til en booth.
          </li>
          <li>
            8–12 flash-pladser. Små stykker. Først til stolen. Ædru ved
            stolen — punktum.
          </li>
          <li>
            Content og snak der passer jeres hus: rummet, arket, hænderne —
            ikke dansegulvet.
          </li>
        </ul>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-aften">
        <h2 id="chateau-aften" className="rum-poster chateau-collab__h2">
          Sådan ser aftenen ud
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="chateau-collab__img"
          src="/collab/chateau/chateau-trapperum.png"
          alt="Trapperum og dør — stolen bag en lukket dør"
        />
        <ul className="chateau-collab__bullets">
          <li>Ét rum med dør. Én stol. Ét flash-ark.</li>
          <li>8–12 pladser. Døre ca. 23 — I sætter rytmen.</li>
          <li>Depositum / hold-en-plads via QR. Samtykke på telefon før indgang.</li>
          <li>Ædru ved stolen. Vi sender folk ud af rummet hvis ikke.</li>
          <li>Alder følger Chateaus aften (torsdag 18+; stolen er 18 uanset).</li>
        </ul>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-bytte">
        <h2 id="chateau-bytte" className="rum-poster chateau-collab__h2">
          Hvad I stiller / hvad vi medbringer
        </h2>
        <div className="chateau-collab__cols">
          <div>
            <p className="rum-label">I stiller</p>
            <ul className="chateau-collab__bullets">
              <li>Rum med dør vi kan lukke</li>
              <li>Strøm, lys vi kan styre, adgang før/efter døre</li>
              <li>Håndvask inden for rækkevidde (ikke toiletrum)</li>
              <li>Gæsteliste / dør for artist + runner + holdte pladser</li>
            </ul>
          </div>
          <div>
            <p className="rum-label">Vi medbringer</p>
            <ul className="chateau-collab__bullets">
              <li>Stol, lampe, maskine, steril setup</li>
              <li>Flash-ark, aftercare, kanyler/affald hjem</li>
              <li>Samtykke på inkandart.dk (QR i rummet)</li>
              <li>Én artist. Én runner. Ingen piercing første nat.</li>
            </ul>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="chateau-collab__img"
          src="/collab/chateau/chateau-flash-setup.png"
          alt="Flash-setup — ark, handsker, maskine"
        />
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-mynd">
        <h2 id="chateau-mynd" className="rum-poster chateau-collab__h2">
          Myndighed
        </h2>
        <p className="rum-body-copy">
          Midlertidig tatoveringsgodkendelse er på plads før natten —{" "}
          <strong>Ink &amp; Art</strong> står for drift og papir.
        </p>
        <p className="rum-body-copy chateau-collab__mute">
          Chateau er værten. Ikke drift-tatovørsted.
        </p>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-pilot">
        <h2 id="chateau-pilot" className="rum-poster chateau-collab__h2">
          Pilot → gentagelse
        </h2>
        <p className="rum-body-copy">
          Nat 1 er en test. Hvis rummet holder — ikke en booth — og begge huse
          vil igen: faste aftaler. Ellers stopper vi.
        </p>
      </section>

      <section className="chateau-collab__sec" aria-labelledby="chateau-oekonomi">
        <h2 id="chateau-oekonomi" className="rum-poster chateau-collab__h2">
          Økonomi
        </h2>
        <p className="rum-body-copy">
          Aftales. Default-pitch: Ink &amp; Art beholder tattoo-omsætning;
          Chateau bar + dør.
        </p>
        <p className="rum-body-copy chateau-collab__mute">
          Rum til forhandling — hvis I hellere vil have andel, content-byt eller
          noget andet, siger I det.
        </p>
      </section>

      <section className="chateau-collab__sec chateau-collab__next" aria-labelledby="chateau-naeste">
        <h2 id="chateau-naeste" className="rum-poster chateau-collab__h2">
          Næste skridt
        </h2>
        <ol className="chateau-collab__checks">
          <li>Hvilket rum — med dør vi kan lukke?</li>
          <li>Hvilken dato — første torsdag efter intern generalprøve?</li>
          <li>30 min walkthrough på stedet.</li>
        </ol>
        <p className="rum-body-copy" style={{ marginTop: 28 }}>
          Kontakt: <strong>Simone + Steven</strong>
          <br />
          <a href="mailto:steven@bygmedai.dk">steven@bygmedai.dk</a>
        </p>
        <p className="rum-label chateau-collab__via">
          I kender os allerede via Simone / Monir. Events:{" "}
          <a href="mailto:oskar@chateaumotel.dk">oskar@chateaumotel.dk</a>
        </p>
      </section>
    </main>
  );
}
