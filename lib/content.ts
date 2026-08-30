/**
 * Rummet content loader. Reads git files in content/ at build time.
 * Changing copy lives in those files — never here. This module only
 * parses, types, and derives empty-state flags from the data.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

export type Artist = {
  id: string;
  fornavn: string;
  haandvaerk: string;
  periode: "fast" | "gaest" | string;
  periode_til?: string;
  foto: string;
  billedtekst: string;
  /** Artistens egen præsentation, med egne ord. Tom = linjen udelades.
   *  Vi skriver ALDRIG en bio for et menneske der ikke har skrevet den. */
  bio: string;
  /** Instagram-handle uden @. Tom = linjen udelades. */
  instagram: string;
  aktiv: boolean;
  stol: boolean;
  /** Kan gaesten booke tid hos denne artist? Tom/false = walk-in indtil
   *  kalenderen er sat op. Vi tilbyder ikke en tid huset ikke kan give. */
  booking: boolean;
};

export type Vaerk = {
  id: string;
  titel: string;
  artist: string;
  aar: string;
  arkivnr: string;
  foto: string;
  billedtekst: string;
  maa_vises: boolean;
  demo: boolean;
  i_dag: boolean;
  edition_ref: string;
};

export type Nat = {
  nr: string;
  dato: string;
  navne: string[];
  tidsrum: string;
  plakatfoto: string;
  billedtekst: string;
  aktiv: boolean;
};

export type GadenInfo = {
  aabent: string;
  walk_in: string;
  billedtekst: string;
};

export type House = {
  artists: Artist[];
  vaerker: Vaerk[];
  nats: Nat[];
};

const root = join(process.cwd(), "content");

function readYaml<T>(name: string): T {
  const raw = readFileSync(join(root, name), "utf8");
  const data = parse(raw);
  if (data == null) throw new Error(`content/${name} parsed empty`);
  return data as T;
}

function asList<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : [data];
}

/**
 * Hylden — husets varer. Bevidst adskilt fra vaerker.yml (S573).
 *
 * Et vaerk er et fotografi af en tatovering; en vare er noget man kan koebe.
 * Da hylden hang paa `edition_ref` i vaerker.yml, kunne der ikke findes en
 * vare uden at nogen foerst havde fotograferet en tatovering — og saa kan
 * huset ikke saelge en naesering. Kilden bliver Shopifys kollektioner i uge 36;
 * denne fil er broen derhen.
 */
export type Vare = {
  handle: string;
  titel: string;
  foto: string;
  linje: string;
  gruppe: string;
};

function normalizeVare(v: Vare): Vare {
  return {
    handle: str(v.handle),
    titel: str(v.titel),
    foto: str(v.foto),
    linje: str(v.linje),
    gruppe: str(v.gruppe),
  };
}

export function loadHylden(): Vare[] {
  return asList(readYaml<Vare | Vare[]>("hylden.yml"))
    .map(normalizeVare)
    .filter((v) => v.handle && v.foto);
}

export function loadHouse(): House {
  return {
    artists: asList(readYaml<Artist | Artist[]>("artists.yml")).map(normalizeArtist),
    vaerker: asList(readYaml<Vaerk | Vaerk[]>("vaerker.yml")).map(normalizeVaerk),
    nats: asList(readYaml<Nat | Nat[]>("nat.yml")).map(normalizeNat),
  };
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function bool(v: unknown): boolean {
  return v === true || v === "true";
}

function normalizeArtist(a: Artist): Artist {
  return {
    id: str(a.id),
    fornavn: str(a.fornavn),
    haandvaerk: str(a.haandvaerk),
    periode: str(a.periode) || "fast",
    periode_til: str(a.periode_til) || undefined,
    foto: str(a.foto),
    billedtekst: str(a.billedtekst),
    bio: str(a.bio),
    instagram: str(a.instagram),
    aktiv: bool(a.aktiv),
    stol: bool(a.stol),
    booking: a.booking === undefined ? true : bool(a.booking),
  };
}

function normalizeVaerk(v: Vaerk): Vaerk {
  return {
    id: str(v.id),
    titel: str(v.titel),
    artist: str(v.artist),
    aar: str(v.aar),
    arkivnr: str(v.arkivnr),
    foto: str(v.foto),
    billedtekst: str(v.billedtekst),
    maa_vises: bool(v.maa_vises),
    demo: bool(v.demo),
    i_dag: bool(v.i_dag),
    edition_ref: str(v.edition_ref),
  };
}

function normalizeNat(n: Nat): Nat {
  const navne = Array.isArray(n.navne) ? n.navne.map((x) => str(x)).filter(Boolean) : [];
  return {
    nr: str(n.nr),
    dato: str(n.dato),
    navne,
    tidsrum: str(n.tidsrum),
    plakatfoto: str(n.plakatfoto),
    billedtekst: str(n.billedtekst),
    aktiv: bool(n.aktiv),
  };
}

export function loadGaden(): GadenInfo {
  const data = readYaml<Partial<GadenInfo>>("gaden.yml");
  return {
    aabent: str(data.aabent),
    walk_in: str(data.walk_in),
    billedtekst: str(data.billedtekst),
  };
}

/**
 * Forsiden — Huset. Ord og hero bor i content/huset.yml, ikke i markup.
 * Sonja retter filen; koden kender kun felterne.
 */
export type HusetForside = {
  kicker: string;
  titel: string;
  lede: string;
  /** Åbningstiderne i folden — Stevens kald 30/8 (H1). */
  tider: string;
  cta_book: string;
  hero_foto: string;
  hero_billedtekst: string;
};

export function loadHusetForside(): HusetForside {
  const d = readYaml<Partial<HusetForside>>("huset.yml");
  return {
    kicker: str(d.kicker),
    titel: str(d.titel),
    lede: str(d.lede),
    tider: str(d.tider),
    cta_book: str(d.cta_book) || "Book tid",
    hero_foto: str(d.hero_foto),
    hero_billedtekst: str(d.hero_billedtekst),
  };
}

/** Betingelser — sektioner fra YAML, dansk og engelsk. Decap-redigerbare. */
export type BetingelserSektion = { overskrift: string; tekst: string };
export type Betingelser = {
  titel: string;
  lede: string;
  sektioner: BetingelserSektion[];
};

function readBetingelser(fil: string): Betingelser {
  const d = readYaml<Partial<Betingelser>>(fil);
  const sektioner = Array.isArray(d.sektioner) ? d.sektioner : [];
  return {
    titel: str(d.titel),
    lede: str(d.lede),
    sektioner: sektioner
      .map((x) => ({ overskrift: str(x?.overskrift), tekst: str(x?.tekst) }))
      .filter((x) => x.overskrift && x.tekst),
  };
}

export function loadBetingelser(): Betingelser {
  return readBetingelser("betingelser.yml");
}

export function loadBetingelserEn(): Betingelser {
  return readBetingelser("betingelser.en.yml");
}


/** Den engelske forside — egen stemme, samme felter plus EN-mikrocopy. */
export type HusetForsideEn = HusetForside & {
  walk_in_line: string;
  chairs_label: string;
  tonight_label: string;
  phone_line: string;
};

export function loadHusetForsideEn(): HusetForsideEn {
  const d = readYaml<Partial<HusetForsideEn>>("huset.en.yml");
  const da = loadHusetForside();
  return {
    kicker: str(d.kicker),
    titel: str(d.titel) || da.titel,
    lede: str(d.lede) || da.lede,
    tider: str(d.tider) || da.tider,
    cta_book: str(d.cta_book) || "Book a session",
    // Heroen deles med den danske forside — ét billede, husets eget.
    hero_foto: da.hero_foto,
    hero_billedtekst: str((d as Record<string, unknown>).hero_billedtekst as string) || da.hero_billedtekst,
    walk_in_line: str(d.walk_in_line),
    chairs_label: str(d.chairs_label) || "In the chair",
    tonight_label: str(d.tonight_label) || "Tonight",
    phone_line: str(d.phone_line) || "Call us",
  };
}

/**
 * Husets stamdata — navn, CVR, adresse, telefon, mail. Ét sted.
 * Footer, forside og booking læser herfra; ingen flade ejer sit eget nummer.
 */
export type Kontakt = {
  navn: string;
  cvr: string;
  adresse: string;
  by: string;
  telefon_vist: string;
  telefon_e164: string;
  email: string;
  /** Husets Instagram-handle uden @. */
  instagram: string;
};

export function loadKontakt(): Kontakt {
  const d = readYaml<Partial<Kontakt>>("kontakt.yml");
  return {
    navn: str(d.navn),
    cvr: str(d.cvr),
    adresse: str(d.adresse),
    by: str(d.by),
    telefon_vist: str(d.telefon_vist),
    telefon_e164: str(d.telefon_e164),
    email: str(d.email),
    instagram: str(d.instagram),
  };
}

/**
 * Periode-etiketten på et kort kommer fra data — aldrig hardcodet i markup.
 * fast → «Fast», gæst → «Gæst» / «I huset til …», alt andet står som skrevet.
 */
/** FAQ — spørgsmål/svar fra YAML, dansk og engelsk (H5). */
export type FaqPunkt = { q: string; a: string };
export type Faq = { titel: string; lede: string; sporgsmal: FaqPunkt[] };

function readFaq(fil: string): Faq {
  const d = readYaml<Partial<Faq>>(fil);
  const liste = Array.isArray(d.sporgsmal) ? d.sporgsmal : [];
  return {
    titel: str(d.titel) || "FAQ",
    lede: str(d.lede),
    sporgsmal: liste
      .map((x) => ({ q: str(x?.q), a: str(x?.a) }))
      .filter((x) => x.q && x.a),
  };
}

export function loadFaq(): Faq {
  return readFaq("faq.yml");
}

export function loadFaqEn(): Faq {
  return readFaq("faq.en.yml");
}

/** Piercing-teksten (H6) — husets standardtekst, Decap-redigerbar. */
export type PiercingCopy = { titel: string; tekst: string; priser: string };

export function loadPiercing(): PiercingCopy {
  const d = readYaml<Partial<PiercingCopy>>("piercing.yml");
  return { titel: str(d.titel), tekst: str(d.tekst), priser: str(d.priser) };
}

/** Bookingsidens ord. */
export type BookingCopy = {
  lede: string;
  konsultation: string;
  depositum_label: string;
  door_label: string;
  note: string;
  foto: string;
  billedtekst: string;
  tak_titel: string;
  tak_betalt: string;
};

export function loadBookingCopy(): BookingCopy {
  const d = readYaml<Partial<BookingCopy>>("booking.yml");
  return {
    lede: str(d.lede),
    konsultation: str(d.konsultation),
    depositum_label: str(d.depositum_label),
    door_label: str(d.door_label) || "Videre til booking",
    note: str(d.note),
    foto: str(d.foto),
    billedtekst: str(d.billedtekst),
    tak_titel: str(d.tak_titel),
    tak_betalt: str(d.tak_betalt),
  };
}

/** Nattens sideord — konceptet, ikke enkeltnætterne (de bor i nat.yml). */
export type NattenCopy = {
  intro: string;
  tom_titel: string;
  tom_linje: string;
};

export function loadNattenCopy(): NattenCopy {
  const d = readYaml<Partial<NattenCopy>>("natten.yml");
  return {
    intro: str(d.intro),
    tom_titel: str(d.tom_titel) || "Ingen nat i aften",
    tom_linje: str(d.tom_linje),
  };
}

export function periodeLabel(a: Artist): string {
  if (a.periode === "fast") return "Fast";
  if (a.periode === "gaest") {
    return a.periode_til ? `I huset til ${a.periode_til}` : "Gæst";
  }
  return a.periode;
}

/**
 * Chips på Væggen: kun artister der faktisk har værker at filtrere på.
 * En chip uden værker bag sig er en dør ind i et tomt rum.
 */
export function wallChipArtists(artists: Artist[], vaerker: Vaerk[]): Artist[] {
  return artists.filter(
    (a) => a.aktiv && a.fornavn && visibleCountForArtist(vaerker, a.id) > 0,
  );
}

/** Artister der har deres egen side i Stolen: aktive, med navn, i stolen. */
export function profiledArtists(artists: Artist[]): Artist[] {
  return artists.filter((a) => a.aktiv && a.stol && a.fornavn);
}

export function artistById(artists: Artist[], id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

/** Who sits in the chair — I stolen. */
export function chairArtists(artists: Artist[]): Artist[] {
  return artists.filter((a) => a.stol && a.periode !== "gaest");
}

export function guestArtist(artists: Artist[]): Artist | undefined {
  return artists.find((a) => a.stol && a.periode === "gaest");
}

/**
 * Guest is a data-state, not a second page:
 *  - no row / inactive → empty
 *  - active without a name → pending
 *  - active with a name → named
 */
export function guestState(
  artists: Artist[],
): { kind: "empty" } | { kind: "pending"; artist: Artist } | { kind: "named"; artist: Artist } {
  const g = guestArtist(artists);
  if (!g || !g.aktiv) return { kind: "empty" };
  if (!g.fornavn) return { kind: "pending", artist: g };
  return { kind: "named", artist: g };
}

export function activeNat(nats: Nat[]): Nat | null {
  return nats.find((n) => n.aktiv) ?? null;
}

export function featuredVaerk(vaerker: Vaerk[]): Vaerk | undefined {
  return vaerker.find((v) => v.i_dag && v.maa_vises) ?? vaerker.find((v) => v.maa_vises);
}

export function visibleVaerker(vaerker: Vaerk[]): Vaerk[] {
  return vaerker.filter((v) => v.maa_vises);
}

/** Hylden is empty until a værk carries an edition_ref. */
export function shelfEmpty(vaerker: Vaerk[]): boolean {
  return !vaerker.some((v) => v.maa_vises && v.edition_ref);
}

/** Alt/label for a plate. Billedtekst first — never a fake title. */
export function vaerkLabel(vaerk: Vaerk, artist?: Artist): string {
  if (vaerk.billedtekst) return vaerk.billedtekst;
  const who = artist?.fornavn || vaerk.artist;
  const bits = [vaerk.titel || vaerk.id, who, vaerk.aar].filter(Boolean);
  return bits.join(", ");
}

/** Visible works for one artist id. Copy stays in the page. */
export function visibleVaerkerForArtist(vaerker: Vaerk[], artistId: string): Vaerk[] {
  const id = artistId.trim();
  if (!id) return [];
  return visibleVaerker(vaerker).filter((v) => v.artist === id);
}

export function visibleCountForArtist(vaerker: Vaerk[], artistId: string): number {
  return visibleVaerkerForArtist(vaerker, artistId).length;
}

/** Væggen filter. Empty/missing id → all visible works. */
export function filterVisibleByArtist(vaerker: Vaerk[], artistId?: string | null): Vaerk[] {
  const id = (artistId || "").trim();
  if (!id) return visibleVaerker(vaerker);
  return visibleVaerkerForArtist(vaerker, id);
}

/** Hylden candidates — YAML side. Storefront matching happens elsewhere. */
export function shelfVaerker(vaerker: Vaerk[]): Vaerk[] {
  return visibleVaerker(vaerker).filter((v) => Boolean(v.edition_ref));
}

/** Product page lookup: edition_ref is the Shopify product handle. */
export function vaerkByEditionHandle(vaerker: Vaerk[], handle: string): Vaerk | undefined {
  const h = handle.trim();
  if (!h) return undefined;
  return visibleVaerker(vaerker).find((v) => v.edition_ref === h);
}

export function vaerkById(vaerker: Vaerk[], id: string): Vaerk | undefined {
  const key = id.trim();
  if (!key) return undefined;
  return visibleVaerker(vaerker).find((v) => v.id === key);
}
