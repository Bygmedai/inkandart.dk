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
  aktiv: boolean;
  stol: boolean;
};

export type Vaerk = {
  id: string;
  titel: string;
  artist: string;
  aar: string;
  arkivnr: string;
  foto: string;
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
  aktiv: boolean;
};

export type GadenInfo = {
  aabent: string;
  walk_in: string;
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
    aktiv: bool(a.aktiv),
    stol: bool(a.stol),
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
    aktiv: bool(n.aktiv),
  };
}

export function loadGaden(): GadenInfo {
  const data = readYaml<Partial<GadenInfo>>("gaden.yml");
  return {
    aabent: str(data.aabent),
    walk_in: str(data.walk_in),
  };
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

/** Alt/label for a plate. Untitled DEMO uses slot id — never a fake title. */
export function vaerkLabel(vaerk: Vaerk, artist?: Artist): string {
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
