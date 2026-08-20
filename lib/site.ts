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
    line: "Vi dekorerer ikke. Vi committer.",
  },
];

export const works = [
  { src: "/work/odin.jpg", alt: "Black and grey", span: "tall" },
  { src: "/work/under-naalen.jpg", alt: "Under the needle", span: "wide" },
  { src: "/work/session.jpg", alt: "In the chair", span: "tall" },
  { src: "/work/signetring.jpg", alt: "A mark on the hand", span: "square" },
  { src: "/work/stolen.jpg", alt: "The chair", span: "tall" },
  { src: "/work/focus.jpg", alt: "Work", span: "wide" },
  { src: "/work/mark.jpg", alt: "The studio mark", span: "square" },
  { src: "/work/studio-window.jpg", alt: "Night", span: "wide" },
] as const;
