import type { Tidsrum } from "./tider";
/**
 * Rummet content loader. Reads git files in content/ at build time.
 * Changing copy lives in those files — never here. This module only
 * parses, types, and derives empty-state flags from the data.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * Et ekstra billede i artistens galleri-slot.
 *
 * `fokus` er `object-position`. Den er ikke pynt: husets eneste ubrugte
 * Nizar-billede er 1179x753 — bredformat i en 4:5-slot. Uden et fokuspunkt
 * beskaerer `object-fit: cover` ham halvt vaek i hoejre kant. Tom = "50% 50%".
 */
export type ArtistFoto = {
  /** Sti under /public. Tom raekke findes ikke — den falder ud. */
  fil: string;
  /** Alt-tekst. Redaktoerens egne ord; vi oversaetter dem ikke. */
  tekst: string;
  /** object-position, fx "72% 30%". Tom = midten. */
  fokus: string;
};

/**
 * Loft for hvor mange billeder en artist kan rotere imellem.
 *
 * CSS'en i rummet.css har ét @keyframes pr. antal (2–5) — dumt og laesbart
 * frem for smart og skroebeligt. Haever du loftet, saa laeg keyframes til i
 * SAMME commit; tests/galleri.test.mjs kraever parret.
 *
 * Redaktoeren stoppes i Decap (max 4 ekstra), hvor hun kan se det. Dette er
 * bagstopperen for den der redigerer YAML i haanden.
 */
export const GALLERI_MAX = 5;

/**
 * Et tidsrum en artist er i huset.
 *
 * STRUKTURERET, ikke fritekst. Dagene skal kunne siges paa engelsk uden at
 * et menneske oversaetter «tirsdag» — det er en ugedag, ikke nogens ord.
 * Klokkeslet er tal og staar ens paa begge sprog.
 *
 * Tallene er artistens egne. De opdigtes ALDRIG, og de udledes ikke af
 * husets aabningstider — en artist kan vaere i huset uden at doeren er
 * aaben for walk-in, og huset kan have aabent uden at hun er der.
 */
export type ArtistTid = Tidsrum;

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
  /**
   * Artistens fag på engelsk. Tomt = den danske linje bruges.
   *
   * Håndværkslinjen ER en etiket og må gerne oversættes — men kun af et
   * menneske, i Decap. Vi maskinoversætter ikke en artists fag.
   */
  haandvaerk_en: string;
  /**
   * Artistens EGEN engelske præsentation. Tom = vi viser den danske og
   * mærker den lang="da". Samme regel som bio'en: vi skriver den ikke
   * for dem, og vi oversætter dem ikke — det ville være at lægge ord i
   * munden på et menneske (S574).
   */
  bio_en: string;
  /** Instagram-handle uden @. Tom = linjen udelades. */
  instagram: string;
  aktiv: boolean;
  stol: boolean;
  /** Kan gaesten booke tid hos denne artist? Tom/false = walk-in indtil
   *  kalenderen er sat op. Vi tilbyder ikke en tid huset ikke kan give. */
  booking: boolean;
  /** Ekstra billeder ud over portraettet. Tom liste = én slot, som foer. */
  fotos: ArtistFoto[];
  /** Hvornaar hun er i huset. Tom liste = vi siger ingenting. */
  tider: ArtistTid[];
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
  titel: string;
  aabent_label: string;
  aabent: string;
  walk_in_label: string;
  walk_in: string;
  depositum_linje: string;
  fag_linje: string;
  foto: string;
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
    haandvaerk_en: str(a.haandvaerk_en),
    bio_en: str(a.bio_en),
    instagram: str(a.instagram),
    aktiv: bool(a.aktiv),
    stol: bool(a.stol),
    booking: a.booking === undefined ? true : bool(a.booking),
    fotos: normalizeFotos((a as unknown as Record<string, unknown>).fotos),
    tider: normalizeTider((a as unknown as Record<string, unknown>).tider),
  };
}

const UGEDAGE = ["man", "tir", "ons", "tor", "fre", "loer", "son"];

function normalizeTider(raw: unknown): ArtistTid[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      const o = (t ?? {}) as Record<string, unknown>;
      const dage = Array.isArray(o.dage)
        ? o.dage.map((d) => str(d as string)).filter((d) => UGEDAGE.includes(d))
        : [];
      return { dage, fra: str(o.fra as string), til: str(o.til as string) };
    })
    // Et tidsrum uden dag eller uden klokkeslet er ikke et tidsrum. Det
    // udelades frem for at blive vist halvt — en halv aabningstid er
    // vaerre end ingen (rails §4).
    .filter((t) => t.dage.length > 0 && t.fra && t.til);
}

function normalizeFotos(raw: unknown): ArtistFoto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      const o = (f ?? {}) as Record<string, unknown>;
      return {
        fil: str(o.fil as string),
        tekst: str(o.tekst as string),
        fokus: str(o.fokus as string),
      };
    })
    .filter((f) => f.fil);
}

/**
 * Artistens billeder i visningsraekkefoelge: portraettet foerst, derefter
 * slotterne fra artists.yml. Altid mindst ét element naar artisten har et
 * foto, saa kaldstedet ikke skal kende forskel paa «én artist med ét
 * billede» og «et galleri» — komponenten afgoer det paa laengden.
 *
 * Samme fil to gange er én slot. En redaktoer der lister portraettet igen
 * skal ikke faa en rotation mellem billedet og sig selv.
 */
export function artistFotos(artist: Artist): ArtistFoto[] {
  const alle: ArtistFoto[] = [
    { fil: str(artist.foto), tekst: str(artist.billedtekst), fokus: "" },
    ...(artist.fotos ?? []),
  ].filter((f) => f.fil);
  const unikke: ArtistFoto[] = [];
  for (const f of alle) {
    if (unikke.some((u) => u.fil === f.fil)) continue;
    unikke.push(f);
  }
  return unikke.slice(0, GALLERI_MAX);
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

function readGaden(fil: string): GadenInfo {
  const data = readYaml<Partial<GadenInfo>>(fil);
  return {
    titel: str(data.titel) || "Gaden",
    aabent_label: str(data.aabent_label),
    aabent: str(data.aabent),
    walk_in_label: str(data.walk_in_label),
    walk_in: str(data.walk_in),
    depositum_linje: str(data.depositum_linje),
    fag_linje: str(data.fag_linje),
    foto: str(data.foto) || "/slots/G-02.jpg",
    billedtekst: str(data.billedtekst),
  };
}

export function loadGaden(): GadenInfo {
  return readGaden("gaden.yml");
}

/**
 * Gaden på engelsk — turistens beslutningsside (Sirius' minimumsliste:
 * walk-in, lokation, åbningstider). Adresse og telefon kommer fra
 * kontakt.yml på begge sprog: ét hus, ét nummer.
 */
export function loadGadenEn(): GadenInfo {
  return readGaden("gaden.en.yml");
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

/**
 * Privatlivspolitikken (S574, godkendt af Steven 30/8). Samme form som
 * betingelserne — titel, lede, sektioner — så Sonja redigerer de to
 * juridiske sider på samme måde, og de to sprog ikke kan drifte fra
 * hinanden ét afsnit ad gangen.
 *
 * Databehandlerne i teksten er de virkelige: Book.dk, Shopify,
 * Simply.com (mail) og Vercel. Tilføjer huset en ny, skal den skrives
 * ind i BEGGE filer — ellers lyver siden.
 */
export function loadPrivatliv(): Betingelser {
  return readBetingelser("privatliv.yml");
}

export function loadPrivatlivEn(): Betingelser {
  return readBetingelser("privatliv.en.yml");
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

/**
 * Aftercare (S574). Teksten lå i lib/aftercare.ts — altså i kode, hvor
 * hverken Sonja eller en artist kunne rette den, og kun på dansk.
 * Plejeråd skal kunne rettes af dem der giver dem.
 */
export type AftercareTrin = { t: string; d: string };
export type AftercareCopy = {
  file: string;
  titel: string;
  lead: string;
  tattoo_titel: string;
  piercing_titel: string;
  tattoo: AftercareTrin[];
  piercing: AftercareTrin[];
  tvivl_label: string;
  tvivl: string;
  skriv_cta: string;
};

function readAftercare(fil: string): AftercareCopy {
  const d = readYaml<Partial<AftercareCopy>>(fil);
  const trin = (x: unknown): AftercareTrin[] =>
    Array.isArray(x)
      ? x
          .map((s) => ({ t: str((s as AftercareTrin)?.t), d: str((s as AftercareTrin)?.d) }))
          .filter((s) => s.t && s.d)
      : [];
  return {
    file: str(d.file),
    titel: str(d.titel),
    lead: str(d.lead),
    tattoo_titel: str(d.tattoo_titel),
    piercing_titel: str(d.piercing_titel),
    tattoo: trin(d.tattoo),
    piercing: trin(d.piercing),
    tvivl_label: str(d.tvivl_label),
    tvivl: str(d.tvivl),
    skriv_cta: str(d.skriv_cta),
  };
}

export function loadAftercare(): AftercareCopy {
  return readAftercare("aftercare.yml");
}

export function loadAftercareEn(): AftercareCopy {
  return readAftercare("aftercare.en.yml");
}

/**
 * Teamguiden — husets interne haandbog paa /personale, bag koden.
 *
 * TIDER OG PIERCINGPRISER ER IKKE FELTER HER. De hentes af siden fra
 * aabningstider.yml og piercing-priser.yml. En haandbog der gentog
 * aabningstiden ville vaere den syvende kopi af et tal huset lige har
 * samlet ét sted — og den kopi ville drive.
 */
export type Kort = { t: string; d: string };
export type Liste = { titel: string; punkter: string[] };
export type Rolle = { navn: string; rolle: string; tekst: string };
export type Regel = { overskrift: string; tekst: string };
/** Prisen er et TAL. Adskilleren hoerer til ved visningen — se tal() i
 *  TeamguideFlade. Skrives den i yml som «6.500», laeser YAML 6,5. */
export type Ydelse = { ydelse: string; pris: number };

export type TeamguideCopy = {
  titel: string; lede: string;
  laas_titel: string; laas_lede: string; laas_knap: string;
  laas_fejl: string; laas_ud: string;
  mission_titel: string; mission: string;
  vaerdier_titel: string; vaerdier: Kort[];
  huset_titel: string; huset_lede: string; huset_booking_note: string;
  priser_titel: string; priser_lede: string;
  priser_tattoo_titel: string; priser_tattoo: Ydelse[];
  priser_flash_titel: string; priser_flash: Ydelse[]; priser_flash_note: string;
  priser_piercing_titel: string; priser_piercing_note: string;
  priser_kampagne: string;
  aabning_titel: string; aabning_lede: string; aabning: Liste[]; aabning_note: string;
  lukning_titel: string; lukning_lede: string; lukning: Liste[]; lukning_note: string;
  roller_titel: string; roller_lede: string; roller: Rolle[]; roller_note: string;
  salg_titel: string; salg_lede: string;
  salg_mindset_titel: string; salg_mindset: Kort[];
  salg_faser_titel: string; salg_faser: Kort[];
  salg_indvendinger_titel: string; salg_indvendinger: Kort[];
  salg_maal: string;
  regler_titel: string; regler_lede: string; regler: Regel[];
  kontakt_titel: string; kontakt_lede: string; kontakt: Rolle[];
  kultur_titel: string; kultur: Regel[];
};

function kort(v: unknown): Kort[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ t: str((x as Kort)?.t), d: str((x as Kort)?.d) }))
    .filter((x) => x.t || x.d);
}
function lister(v: unknown): Liste[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      titel: str((x as Liste)?.titel),
      punkter: Array.isArray((x as Liste)?.punkter)
        ? (x as Liste).punkter.map(str).filter(Boolean)
        : [],
    }))
    .filter((x) => x.titel && x.punkter.length > 0);
}
function roller(v: unknown): Rolle[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      navn: str((x as Rolle)?.navn),
      rolle: str((x as Rolle)?.rolle),
      tekst: str((x as Rolle)?.tekst),
    }))
    .filter((x) => x.navn);
}
function regler(v: unknown): Regel[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      overskrift: str((x as Regel)?.overskrift),
      tekst: str((x as Regel)?.tekst),
    }))
    .filter((x) => x.overskrift && x.tekst);
}
function ydelser(v: unknown): Ydelse[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      ydelse: str((x as { ydelse?: unknown })?.ydelse),
      pris: Number((x as { pris?: unknown })?.pris),
    }))
    .filter((x) => x.ydelse && Number.isFinite(x.pris) && x.pris > 0);
}

function teamguide(fil: string): TeamguideCopy {
  const d = readYaml<Record<string, unknown>>(fil);
  const t = (k: string) => str(d[k]);
  return {
    titel: t("titel"), lede: t("lede"),
    laas_titel: t("laas_titel"), laas_lede: t("laas_lede"),
    laas_knap: t("laas_knap"), laas_fejl: t("laas_fejl"), laas_ud: t("laas_ud"),
    mission_titel: t("mission_titel"), mission: t("mission"),
    vaerdier_titel: t("vaerdier_titel"), vaerdier: kort(d.vaerdier),
    huset_titel: t("huset_titel"), huset_lede: t("huset_lede"),
    huset_booking_note: t("huset_booking_note"),
    priser_titel: t("priser_titel"), priser_lede: t("priser_lede"),
    priser_tattoo_titel: t("priser_tattoo_titel"), priser_tattoo: ydelser(d.priser_tattoo),
    priser_flash_titel: t("priser_flash_titel"), priser_flash: ydelser(d.priser_flash),
    priser_flash_note: t("priser_flash_note"),
    priser_piercing_titel: t("priser_piercing_titel"),
    priser_piercing_note: t("priser_piercing_note"),
    priser_kampagne: t("priser_kampagne"),
    aabning_titel: t("aabning_titel"), aabning_lede: t("aabning_lede"),
    aabning: lister(d.aabning), aabning_note: t("aabning_note"),
    lukning_titel: t("lukning_titel"), lukning_lede: t("lukning_lede"),
    lukning: lister(d.lukning), lukning_note: t("lukning_note"),
    roller_titel: t("roller_titel"), roller_lede: t("roller_lede"),
    roller: roller(d.roller), roller_note: t("roller_note"),
    salg_titel: t("salg_titel"), salg_lede: t("salg_lede"),
    salg_mindset_titel: t("salg_mindset_titel"), salg_mindset: kort(d.salg_mindset),
    salg_faser_titel: t("salg_faser_titel"), salg_faser: kort(d.salg_faser),
    salg_indvendinger_titel: t("salg_indvendinger_titel"),
    salg_indvendinger: kort(d.salg_indvendinger),
    salg_maal: t("salg_maal"),
    regler_titel: t("regler_titel"), regler_lede: t("regler_lede"),
    regler: regler(d.regler),
    kontakt_titel: t("kontakt_titel"), kontakt_lede: t("kontakt_lede"),
    kontakt: roller(d.kontakt),
    kultur_titel: t("kultur_titel"), kultur: regler(d.kultur),
  };
}

export function loadTeamguide(): TeamguideCopy {
  return teamguide("teamguide.yml");
}

export function loadTeamguideEn(): TeamguideCopy {
  return teamguide("teamguide.en.yml");
}

/** Samtykkeerklaeringens ord. Felterne selv bor i lib/samtykke.ts. */
export type Valg = { id: string; tekst: string };
export type SamtykkeCopy = {
  titel: string; lede: string;
  dig: string; dit_navn: string; foedselsdato: string; email: string; telefon: string;
  arbejdet: string; kunstner: string; aftale_dato: string; aftale_hint: string;
  placering: string; motiv: string; motiv_hint: string;
  stoerrelse: string; stoerrelse_valg: Valg[]; farve: string; farve_valg: Valg[];
  helbred: string; helbred_lede: string; helbred_valg: Valg[]; helbred_note: string;
  erklaering: string; erklaering_valg: Valg[]; foto_ok: string;
  send: string; sender: string;
  tak_titel: string; tak: string; fejl: string; fejl_felter: string;
  print: string; betingelser_linje: string;
};

function valg(v: unknown): Valg[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ id: str((x as Valg)?.id), tekst: str((x as Valg)?.tekst) }))
    .filter((x) => x.id && x.tekst);
}

function samtykke(fil: string): SamtykkeCopy {
  const d = readYaml<Record<string, unknown>>(fil);
  const t = (k: string) => str(d[k]);
  return {
    titel: t("titel"), lede: t("lede"),
    dig: t("dig"), dit_navn: t("dit_navn"), foedselsdato: t("foedselsdato"),
    email: t("email"), telefon: t("telefon"),
    arbejdet: t("arbejdet"), kunstner: t("kunstner"),
    aftale_dato: t("aftale_dato"), aftale_hint: t("aftale_hint"),
    placering: t("placering"),
    motiv: t("motiv"), motiv_hint: t("motiv_hint"),
    stoerrelse: t("stoerrelse"), stoerrelse_valg: valg(d.stoerrelse_valg),
    farve: t("farve"), farve_valg: valg(d.farve_valg),
    helbred: t("helbred"), helbred_lede: t("helbred_lede"),
    helbred_valg: valg(d.helbred_valg), helbred_note: t("helbred_note"),
    erklaering: t("erklaering"), erklaering_valg: valg(d.erklaering_valg),
    foto_ok: t("foto_ok"),
    send: t("send"), sender: t("sender"),
    tak_titel: t("tak_titel"), tak: t("tak"),
    fejl: t("fejl"), fejl_felter: t("fejl_felter"),
    print: t("print"), betingelser_linje: t("betingelser_linje"),
  };
}

export function loadSamtykke(): SamtykkeCopy {
  return samtykke("samtykke.yml");
}

export function loadSamtykkeEn(): SamtykkeCopy {
  return samtykke("samtykke.en.yml");
}

/** Piercing-teksten (H6) — husets standardtekst, Decap-redigerbar. */
/** Ingen `priser` her laengere. Piercingprisen ER en liste, ikke en
 *  saetning — den bor i content/piercing-priser.yml med ét tal og to
 *  navne. En doed noegle ville invitere den tilbage.
 *
 *  Skabet er derimod en del af teksten: den lover smykker over disken,
 *  og fotoet viser disken. Tom `foto` tegner ingen ramme. */
export type PiercingCopy = {
  titel: string;
  tekst: string;
  foto: string;
  billedtekst: string;
};

function piercing(fil: string): PiercingCopy {
  const d = readYaml<Partial<PiercingCopy>>(fil);
  return {
    titel: str(d.titel),
    tekst: str(d.tekst),
    foto: str(d.foto),
    billedtekst: str(d.billedtekst),
  };
}

export function loadPiercing(): PiercingCopy {
  return piercing("piercing.yml");}

/** Samme tekst på engelsk. Prisen staar samme sted for begge sprog. */
export function loadPiercingEn(): PiercingCopy {
  return piercing("piercing.en.yml");
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
  /** Trin 2: depositummet, kun for de lange sessioner. */
  depositum_trin: string;
  /** Opslags-formen på tak-siden — og dens fem mulige svar. */
  tjek_titel: string;
  tjek_hjaelp: string;
  tjek_knap: string;
  svar_betalt: string;
  svar_ikke_betalt: string;
  svar_ukendt: string;
  svar_ugyldigt: string;
  svar_kan_ikke_tjekke: string;
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
    depositum_trin: str(d.depositum_trin),
    tjek_titel: str(d.tjek_titel),
    tjek_hjaelp: str(d.tjek_hjaelp),
    tjek_knap: str(d.tjek_knap),
    svar_betalt: str(d.svar_betalt),
    svar_ikke_betalt: str(d.svar_ikke_betalt),
    svar_ukendt: str(d.svar_ukendt),
    svar_ugyldigt: str(d.svar_ugyldigt),
    svar_kan_ikke_tjekke: str(d.svar_kan_ikke_tjekke),
  };
}

/**
 * Bookingsiden på engelsk (S574). Samme felter, egen stemme — og samme
 * tal: depositummet er ét beløb i Shopify, uanset hvilket sprog kunden
 * læser på. Ændrer nogen det ene sted, skal det andet med.
 */
export function loadBookingCopyEn(): BookingCopy {
  const d = readYaml<Partial<BookingCopy>>("booking.en.yml");
  return {
    lede: str(d.lede),
    konsultation: str(d.konsultation),
    depositum_label: str(d.depositum_label),
    door_label: str(d.door_label) || "On to booking",
    note: str(d.note),
    foto: str(d.foto),
    billedtekst: str(d.billedtekst),
    tak_titel: str(d.tak_titel),
    tak_betalt: str(d.tak_betalt),
    depositum_trin: str(d.depositum_trin),
    tjek_titel: str(d.tjek_titel),
    tjek_hjaelp: str(d.tjek_hjaelp),
    tjek_knap: str(d.tjek_knap),
    svar_betalt: str(d.svar_betalt),
    svar_ikke_betalt: str(d.svar_ikke_betalt),
    svar_ukendt: str(d.svar_ukendt),
    svar_ugyldigt: str(d.svar_ugyldigt),
    svar_kan_ikke_tjekke: str(d.svar_kan_ikke_tjekke),
  };
}

/** Nattens sideord — konceptet, ikke enkeltnætterne (de bor i nat.yml). */
export type NattenCopy = {
  intro: string;
  tom_titel: string;
  tom_linje: string;
  /**
   * Nattespot — den holdte plads. Beloebet staar bevidst IKKE i YAML:
   * det kommer fra NATTESPOT i lib/commerce.ts, saa siden og Shopify
   * aldrig kan sige to forskellige tal. Er spot_titel tom, vises
   * sektionen ikke — Sonja kan slukke den fra Decap uden en udvikler.
   */
  spot_titel: string;
  spot_linje: string;
  spot_vilkaar: string;
  spot_koeb: string;
};

function readNattenCopy(fil: string, tomTitelFallback: string): NattenCopy {
  const d = readYaml<Partial<NattenCopy>>(fil);
  return {
    intro: str(d.intro),
    tom_titel: str(d.tom_titel) || tomTitelFallback,
    tom_linje: str(d.tom_linje),
    spot_titel: str(d.spot_titel),
    spot_linje: str(d.spot_linje),
    spot_vilkaar: str(d.spot_vilkaar),
    spot_koeb: str(d.spot_koeb),
  };
}

export function loadNattenCopy(): NattenCopy {
  return readNattenCopy("natten.yml", "Ingen nat i aften");
}

/** Natten på engelsk. Rummets navn oversættes ikke — kun sætningerne. */
export function loadNattenCopyEn(): NattenCopy {
  return readNattenCopy("natten.en.yml", "No night tonight");
}

/**
 * Perioden i stolen, paa laeserens sprog.
 *
 * Stod foer haardkodet paa dansk, saa «Fast» blev vist paa hver eneste
 * engelske artist-flade — ogsaa selv om ArtistKort ellers taler engelsk.
 * Maalt 31/8: 6 forekomster paa /en/stolen alene (Stevens fund).
 *
 * Etiketten er husets, ikke artistens: «Fast» er en tilstand vi selv har
 * fundet paa. Derfor MAA den oversaettes her. Fagets navn (haandvaerk)
 * maa den ikke — det staar i haandvaerk_en og skrives af et menneske.
 */
export type PeriodeTekster = {
  fast: string;
  gaest: string;
  til: (dato: string) => string;
};

/** Dansk er standarden, saa hvert dansk kaldsted er uaendret. */
const PERIODE_DA: PeriodeTekster = {
  fast: "Fast",
  gaest: "Gæst",
  til: (dato) => `I huset til ${dato}`,
};

export function periodeLabel(a: Artist, tekster: PeriodeTekster = PERIODE_DA): string {
  if (a.periode === "fast") return tekster.fast;
  if (a.periode === "gaest") {
    return a.periode_til ? tekster.til(a.periode_til) : tekster.gaest;
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

/**
 * Butikkens tider — ét sted for hele huset.
 *
 * Stevens kendelse 31/8: «Butikken er aaben Emmas tider.» Huset lukker naar
 * den sidste artist gaar hjem, saa tiderne ER artisternes — ikke en politik
 * huset har vedtaget uafhaengigt af hvem der moeder ind.
 *
 * Laeses af /gaden, forsidens fold og FAQ'en, paa begge sprog. Foer i dag
 * stod den samme tid i SEKS filer i to formater; den blev rettet to gange
 * paa en time, og begge gange slap to filer igennem. Det er ikke en fejl
 * nogen begik — det er hvad seks kopier goer.
 */
export function loadAabningstider(): Tidsrum[] {
  const data = readYaml<{ tider?: unknown }>("aabningstider.yml");
  return normalizeTider(data.tider);
}

/* ── Piercingpriser ─────────────────────────────────────────────────────
   Ét tal, to sprog. Nizar har godkendt listen; det er fuld pris.
   Se hovedet i content/piercing-priser.yml for hvorfor det er ÉN fil. */

export type Prislinje = { pris: number; navn: string };
export type Prisgruppe = { gruppe: string; linjer: Prislinje[] };
export type Piercingpriser = {
  intro: string;
  grupper: Prisgruppe[];
  tillaeg: Prislinje[];
  note: string;
};

function tosproget(raw: unknown, lang: "da" | "en"): string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "";
  return str((raw as Record<string, unknown>)[lang] as string);
}

function prislinjer(raw: unknown, lang: "da" | "en"): Prislinje[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((l) => {
      const o = (l ?? {}) as Record<string, unknown>;
      return { pris: Number(o.pris), navn: str(o[lang] as string) };
    })
    // En linje uden tal eller uden navn paa DETTE sprog vises ikke. En halv
    // pris er vaerre end ingen — kunden skal kunne regne med tallet.
    .filter((l) => Number.isFinite(l.pris) && l.pris > 0 && l.navn);
}

export function loadPiercingpriser(lang: "da" | "en" = "da"): Piercingpriser {
  const d = readYaml<Record<string, unknown>>("piercing-priser.yml");
  const grupper = Array.isArray(d.prisgrupper) ? d.prisgrupper : [];
  return {
    intro: tosproget(d.intro, lang),
    grupper: grupper
      .map((g) => {
        const o = (g ?? {}) as Record<string, unknown>;
        return { gruppe: tosproget(o.gruppe, lang), linjer: prislinjer(o.linjer, lang) };
      })
      .filter((g) => g.gruppe && g.linjer.length > 0),
    tillaeg: prislinjer(d.tillaeg, lang),
    note: tosproget(d.note, lang),
  };
}
