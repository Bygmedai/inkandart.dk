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
  { src: "/work/odin.jpg", alt: "Black and grey", width: 1179, height: 1104 },
  { src: "/work/bonsai.jpg", alt: "Bonsai on the ribs", width: 2142, height: 2856 },
  { src: "/work/godspeed.jpg", alt: "Cheetahs", width: 1055, height: 1234 },
  { src: "/work/traditional.jpg", alt: "Heart and dagger", width: 1179, height: 1555 },
  { src: "/work/stolen.jpg", alt: "The chair", width: 928, height: 1232 },
  { src: "/work/signetring.jpg", alt: "A mark on the hand", width: 1000, height: 560 },
  { src: "/work/mask.jpg", alt: "Blackwork", width: 2856, height: 2142 },
  { src: "/work/skull.jpg", alt: "Skull", width: 644, height: 858 },
  { src: "/work/ear.jpg", alt: "Steel", width: 1138, height: 2066 },
  { src: "/work/mark.jpg", alt: "The studio mark", width: 1153, height: 718 },
  { src: "/work/under-naalen.jpg", alt: "Under the needle", width: 1179, height: 1695 },
  { src: "/work/focus.jpg", alt: "Work", width: 1179, height: 1155 },
] as const;

export const studioShots = [
  { src: "/studio/gade.jpg", alt: "Larsbjørnsstræde", width: 1000, height: 1252 },
  { src: "/studio/station.jpg", alt: "The station", width: 900, height: 678 },
] as const;
