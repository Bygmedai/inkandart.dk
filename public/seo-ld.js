// Lokal-SEO (TattooParlor), CSP-rent: statisk fil under script-src 'self',
// ingen React-HTML-sinks. Google læser JS-injiceret JSON-LD fra den
// renderede DOM.
//
// Denne fil kan ikke importere content/aabningstider.yml (statisk, ingen
// build-step) — så åbningstiderne herunder er en HÅNDSKREVET kopi af den
// kilde. [GROWTH-OPS] fandt 2026-09-14 at kopien var gammel (nightshift
// tor-lør, 23/23.30/14 i stedet for husets nuværende 22/22/13) — Google
// fik forkerte åbningstider at vise i søgeresultatet. tests/googles-tider.
// test.mjs holder de to i sync fremover; ret aabningstider.yml FØRST, ret
// denne fil bagefter i samme commit.
(function () {
  var data = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Ink & Art Copenhagen",
    url: "https://inkandart.dk",
    image: "https://inkandart.dk/og-inkandart-2026.jpg",
    telephone: "+4591887396",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Larsbjørnsstræde 13",
      postalCode: "1454",
      addressLocality: "København K",
      addressCountry: "DK"
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday"], opens: "13:00", closes: "22:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "13:00", closes: "02:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "13:00", closes: "05:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "13:00", closes: "22:00" }
    ],
    sameAs: ["https://www.instagram.com/ink.and.art.cph/"]
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
})();
