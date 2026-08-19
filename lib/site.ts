export const site = {
  name: "Ink & Art",
  fullName: "Ink & Art Copenhagen",
  url: "https://inkandart.dk",
  phone: "55 24 86 08",
  phoneIntl: "+4555248608",
  whatsapp: "+4550279123",
  bookingUrl: "https://inkart.book.dk",
  instagram: "https://www.instagram.com/ink.and.art.cph/",
  address: {
    street: "Larsbjørnsstræde 13",
    postalCode: "1454",
    city: "København K",
    mapsUrl: "https://maps.google.com/?q=Larsbjørnsstræde+13,+1454+København",
  },
};

export const artists = [
  {
    name: "Nizar",
    role: "Founder & Artist",
    slug: "nizar",
    portrait: "/artists/nizar/portrait.jpg",
    line: "Hans hånd former kapitlet. Ikke motivet.",
  },
];

export const works = [
  { src: "/work/odin.jpg", alt: "Black & grey — et ansigt der bliver", span: "tall" },
  { src: "/work/under-naalen.jpg", alt: "Under nålen", span: "wide" },
  { src: "/work/session.jpg", alt: "I stolen", span: "tall" },
  { src: "/work/signetring.jpg", alt: "Et mærke på hånden", span: "square" },
  { src: "/work/stolen.jpg", alt: "Stolen", span: "tall" },
  { src: "/work/focus.jpg", alt: "I arbejdet", span: "wide" },
  { src: "/work/mark.jpg", alt: "Stedets mærke", span: "square" },
  { src: "/work/studio-window.jpg", alt: "Studiet om natten", span: "wide" },
] as const;
