import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const { doemKlik, TILLADTE_EGENSKABER } = await import("../lib/klik.ts");

/**
 * Klik-events (Haruki #245 C).
 *
 * Målt 31/8: Analytics er tændt, 650 besøg på 30 dage, «No custom events».
 * Vi ser hvem der kommer, ikke hvem der klikker.
 */

const klik = (href, data = {}, pathname = "/", search = "") =>
  doemKlik({ href, data, pathname, search });

test("et køb tælles med sit motiv og sin pris", () => {
  const d = klik("https://d1qp54-0w.myshopify.com/cart/123:1?skip_shop_pay=true",
    { handle: "ouroboros-underarm", pris: "450" }, "/flash");
  assert.equal(d.navn, "koeb_klik");
  // Prisen skal vaere et TAL. En pris man ikke kan summere er en pris man
  // ikke kan bruge til noget — maalt: data-attributter er altid tekst.
  assert.deepEqual(d.props, { handle: "ouroboros-underarm", pris: 450 });
  assert.equal(typeof d.props.pris, "number");
});

test("en plads er ikke et køb — det eksplicitte navn vinder", () => {
  // Begge er cart-permalinks. Uden det eksplicitte navn ville en holdt
  // plads blive talt som et printsalg.
  const d = klik("https://d1qp54-0w.myshopify.com/cart/53935797338440:1",
    { event: "plads_klik" }, "/flash");
  assert.equal(d.navn, "plads_klik");
});

test("Book.dk tælles overalt — og bærer artisten når den kan læses", () => {
  assert.equal(klik("https://inkart.book.dk", {}, "/").navn, "book_klik");

  // Fra linkets egen parameter …
  assert.deepEqual(
    klik("https://inkart.book.dk?artist=nizar", {}, "/").props, { artist: "nizar" });
  // … ellers fra hvilken artistside man står på.
  assert.deepEqual(klik("https://inkart.book.dk", {}, "/stolen/emma").props, { artist: "emma" });
  assert.deepEqual(klik("https://inkart.book.dk", {}, "/en/stolen/emma").props, { artist: "emma" });
  // … eller fra sidens egen query. Ikke pynt: artistsiden linker til
  // /booking?artist=nizar, og Book.dk-linket staar FOERST paa booking-siden.
  // Uden dette led mister vi artisten i praecis det flow hvor den betyder
  // noget (maalt lokalt 31/8: book_klik uden egenskaber).
  assert.deepEqual(
    klik("https://inkart.book.dk/", {}, "/booking", "?artist=nizar").props,
    { artist: "nizar" });

  // Ingen artist at læse ⇒ ingen tom egenskab.
  assert.deepEqual(klik("https://inkart.book.dk", {}, "/gaden").props, {});
});

test("ring tælles kun hvor et opkald er en beslutning", () => {
  for (const rute of ["/booking", "/en/booking", "/gaden", "/en/gaden"]) {
    assert.equal(klik("tel:+4555248608", {}, rute).navn, "ring_klik", rute);
  }
  // NEGATIV KONTROL: tel:-linjen står i footeren på hver eneste side.
  // Talte vi dem alle, ville de to der betyder noget drukne.
  for (const rute of ["/", "/flash", "/shop", "/stolen/nizar"]) {
    assert.equal(klik("tel:+4555248608", {}, rute), null, rute);
  }
});

test("nummeret selv kommer aldrig med som en egenskab", () => {
  const d = klik("tel:+4555248608", { handle: "+4555248608" }, "/booking");
  assert.deepEqual(d.props, {}, "et ring-event bærer ingen egenskaber overhovedet");
});

test("kun tre egenskaber slipper igennem — resten er PII indtil andet er bevist", () => {
  assert.deepEqual([...TILLADTE_EGENSKABER], ["handle", "pris", "artist"]);
  const d = klik("https://d1qp54-0w.myshopify.com/cart/1:1", {
    handle: "print", pris: "250",
    email: "kunde@example.com", navn: "Kunde", note: "fritekst",
  }, "/shop");
  assert.deepEqual(d.props, { handle: "print", pris: 250 });
});

test("alt andet tælles ikke", () => {
  for (const href of ["/gavekort", "https://instagram.com/x", "mailto:a@b.dk", "#", ""]) {
    assert.equal(klik(href, {}, "/"), null, href);
  }
});

test("handelsfladerne er stadig server-renderede", () => {
  // Hele grunden til den delegerede lytter: et onClick paa «Tag den →»
  // ville goere koebsfladen til en klientflade (CLAUDE.md §5).
  for (const fil of [
    "app/(emerge)/flash/page.tsx",
    "app/(emerge)/shop/page.tsx",
    "app/(emerge)/en/shop/page.tsx",
    "components/emerge/Fredagsflash.tsx",
  ]) {
    assert.doesNotMatch(read(fil), /"use client"/, `${fil} er blevet en klientflade`);
    assert.doesNotMatch(read(fil), /onClick/, `${fil} har faaet en onClick`);
  }
});

test("de fire koebsknapper er annoteret — ellers er eventet uden indhold", () => {
  const flash = read("app/(emerge)/flash/page.tsx");
  assert.match(flash, /data-hz-handle=\{f\.id\}/);
  assert.match(flash, /data-hz-pris=\{f\.priceKr\}/);
  for (const fil of ["app/(emerge)/shop/page.tsx", "app/(emerge)/en/shop/page.tsx"]) {
    assert.match(read(fil), /data-hz-handle=\{p\.handle\}/, fil);
    assert.match(read(fil), /data-hz-pris=\{p\.kr\}/, fil);
  }
  assert.match(read("components/emerge/Fredagsflash.tsx"), /data-hz-event="plads_klik"/);
});

test("tilmeldingen tælles kun når den lykkedes", () => {
  const f = read("components/emerge/BlackbookSignup.tsx");
  assert.match(f, /if \(lykkedes\) \{[\s\S]*?track\("blackbook_signup", \{ source \}\)/,
    "et forsoeg der fejler er ikke en tilmelding");
  // NEGATIV KONTROL: mailen maa aldrig med.
  const kald = f.slice(f.indexOf('track("blackbook_signup"'), f.indexOf('track("blackbook_signup"') + 120);
  assert.doesNotMatch(kald, /email/, "mailadressen er PII");
});

test("lytteren er monteret ét sted — og kun ét", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /<KlikVagt \/>/);
  assert.equal([...layout.matchAll(/<KlikVagt \/>/g)].length, 1);
});
