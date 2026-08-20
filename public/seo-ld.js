// Lokal-SEO (TattooParlor) fra den gamle version, genindført CSP-rent:
// statisk fil under script-src 'self', ingen React-HTML-sinks. Google læser
// JS-injiceret JSON-LD fra den renderede DOM. Åbningstiderne er den gamle
// site-datas (nightshift tor-lør).
(function () {
  var data = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Ink & Art Copenhagen",
    url: "https://inkandart.dk",
    image: "https://inkandart.dk/og-image.jpg",
    telephone: "+4555248608",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Larsbjørnsstræde 13",
      postalCode: "1454",
      addressLocality: "København K",
      addressCountry: "DK"
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Sunday"], opens: "13:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "13:00", closes: "23:30" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "13:00", closes: "02:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "13:00", closes: "05:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "14:00", closes: "05:00" }
    ],
    sameAs: ["https://www.instagram.com/ink.and.art.cph/"]
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
})();
