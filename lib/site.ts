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

export type Shot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Nizar-bruddet: rå studie-virkelighed der bevidst bryder blæk-universet.
      Får mildere gradning (work-print--raw) så bruddet er designet, ikke tilfældigt. */
  raw?: boolean;
};

export type Row =
  | { kind: "cluster"; items: Shot[] }
  | { kind: "band"; shot: Shot }
  | { kind: "pair"; items: [Shot, Shot] };

const odin: Shot = { src: "/work/odin.jpg", alt: "Black and grey", width: 1179, height: 1104 };
const bonsai: Shot = { src: "/work/bonsai.jpg", alt: "Bonsai on the ribs", width: 2142, height: 2856 };
const godspeed: Shot = { src: "/work/godspeed.jpg", alt: "Cheetahs", width: 1055, height: 1234 };
const traditional: Shot = { src: "/work/traditional.jpg", alt: "Heart and dagger", width: 1179, height: 1555 };
const stolen: Shot = { src: "/work/stolen.jpg", alt: "The chair", width: 928, height: 1232 };
const signetring: Shot = { src: "/work/signetring.jpg", alt: "A mark on the hand", width: 1000, height: 560 };
const mask: Shot = { src: "/work/mask.jpg", alt: "Blackwork", width: 2856, height: 2142 };
const skull: Shot = { src: "/work/skull.jpg", alt: "Skull", width: 644, height: 858 };
const ear: Shot = { src: "/work/ear.jpg", alt: "Steel", width: 1138, height: 2066 };
const mark: Shot = { src: "/work/mark.jpg", alt: "The studio mark", width: 1153, height: 718 };
const underNaalen: Shot = { src: "/work/under-naalen.jpg", alt: "Under the needle", width: 1179, height: 1695, raw: true };
const focus: Shot = { src: "/work/focus.jpg", alt: "Work", width: 1179, height: 1155, raw: true };
const saint: Shot = { src: "/work/saint.jpg", alt: "Fresh blackwork", width: 2856, height: 2142 };

const bloom: Shot = { src: "/mood/bloom.jpg", alt: "", width: 1280, height: 720 };
const skin: Shot = { src: "/mood/skin.jpg", alt: "", width: 1280, height: 720 };
const drip: Shot = { src: "/mood/drip.jpg", alt: "The needle", width: 864, height: 1152 };
const caps: Shot = { src: "/mood/caps.jpg", alt: "Ink caps", width: 1024, height: 1024 };
const gloves: Shot = { src: "/mood/gloves.jpg", alt: "Under the needle", width: 864, height: 1152 };
const hide: Shot = { src: "/mood/hide.jpg", alt: "Leather", width: 1152, height: 864 };
const needle: Shot = { src: "/mood/needle.jpg", alt: "The machine", width: 620, height: 430 };
const stencil: Shot = { src: "/mood/stencil.jpg", alt: "Stencil", width: 1179, height: 700 };
const machine: Shot = { src: "/mood/machine.jpg", alt: "The line", width: 780, height: 530 };

export const landscape: Row[] = [
  { kind: "cluster", items: [odin, bonsai, godspeed, traditional] },
  { kind: "band", shot: bloom },
  { kind: "cluster", items: [stolen, mask, skull, saint] },
  { kind: "band", shot: hide },
  { kind: "cluster", items: [signetring, ear, caps] },
  { kind: "band", shot: skin },
  { kind: "cluster", items: [needle, stencil, machine] },
  { kind: "pair", items: [drip, gloves] },
  { kind: "cluster", items: [mark, underNaalen, focus] },
];

export const studioShots = [
  { src: "/studio/gade.jpg", alt: "Larsbjørnsstræde", width: 1000, height: 1252 },
  { src: "/studio/station.jpg", alt: "The station", width: 900, height: 678 },
  { src: "/mood/hand.jpg", alt: "The street", width: 600, height: 620 },
] as const;
