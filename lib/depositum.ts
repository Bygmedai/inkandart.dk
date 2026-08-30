/**
 * Depositum-verifikation — broen mellem betaling og booking (Sirius P0-1).
 *
 * PROBLEMET: kunden betaler depositum i Shopify og booker sin tid i
 * Book.dk. De to systemer deler ingen reference, så huset kan ikke
 * svare på «har hun betalt?» — og `/booking/tak?betalt=1` var en
 * URL-parameter, ikke et bevis. Alle kunne skrive den selv.
 *
 * HVORFOR IKKE EN RIGTIG INTEGRATION: målt 30/8 i Book.dk's eget
 * adminpanel — der er ingen API, og «Webhooks» står som «Kommer snart»
 * under Apps. Der er intet at integrere mod. Vi kan altså ikke lade et
 * system tale med det andet.
 *
 * LØSNINGEN: brug den reference begge systemer ALLEREDE kan bære.
 * Shopify giver kunden et ordrenummer på kvitteringen; Book.dk har et
 * kommentarfelt på bookingen. Kunden skriver nummeret med, og så peger
 * de to poster på hinanden — uden ny infrastruktur, uden en database
 * der skal passes, og uden at nogen skal huske at synkronisere.
 *
 * Og så kan betalingen faktisk BEVISES: dette modul spørger Shopify
 * Admin, om ordren findes, er betalt, og indeholder et depositum.
 * Siden siger kun «betalt» når alle tre er sande.
 *
 * HVAD DET IKKE KAN, sagt højt: vi kan ikke se Book.dk-kalenderen.
 * «Betalt men ikke booket» kan kun findes ved at holde Shopifys
 * ordreliste op mod kalenderen — det er en menneskeopgave med en ejer,
 * ikke noget koden kan love. Se docs/handoff-rummet/DEPOSITUM-BINDING.md.
 *
 * PRIVATLIV: modulet returnerer én status og intet andet. Aldrig navn,
 * mail, beløb eller varelinjer. Et opslag kan derfor højst afsløre, at
 * et ordrenummer findes og bærer et depositum.
 *
 * Modulet importerer BEVIDST ikke kataloget: kalderen giver de varianter
 * der tæller som depositum. Så kender verifikationen ikke til hverken
 * priser eller lanes — og prøverne kan give deres eget sæt.
 */

const DEFAULT_STORE = "d1qp54-0w.myshopify.com";
const API_VERSION = "2026-07";
const UPSTREAM_TIMEOUT_MS = 8_000;

/**
 * Ordrenummer som kunden læser det på kvitteringen: «#1042», «1042»,
 * med eller uden mellemrum. Vi normaliserer til cifrene og bygger
 * selv `name`-forespørgslen, så et input aldrig når Shopify som frit
 * søgeudtryk.
 */
export function normaliserOrdrenummer(raw: string): string | null {
  const cifre = String(raw || "").replace(/\D/g, "");
  if (cifre.length < 3 || cifre.length > 12) return null;
  return cifre;
}

export type DepositumStatus =
  /** Ordren findes, er betalt, og bærer et depositum. */
  | "betalt"
  /** Ordren findes og bærer et depositum, men er ikke betalt endnu. */
  | "ikke_betalt"
  /** Vi kan ikke finde en depositum-ordre med det nummer. */
  | "ukendt"
  /** Nummeret er ikke et ordrenummer. */
  | "ugyldigt"
  /** Vi kunne ikke spørge Shopify (env mangler, timeout, fejl). */
  | "kan_ikke_tjekke";

function env(...names: string[]): string | undefined {
  for (const n of names) {
    if (process.env[n]) return process.env[n];
  }
  return undefined;
}

let cachedToken = "";
let cachedExp = 0;

async function adminToken(store: string): Promise<string | null> {
  const staticToken = env("SHOPIFY_ADMIN_TOKEN", "Shopify_admin_token");
  if (staticToken) return staticToken;
  const clientId = env("SHOPIFY_CLIENT_ID", "Shopify_client_id", "SHOPIFY_CLIENTID");
  const clientSecret = env(
    "SHOPIFY_CLIENT_SECRET",
    "Shopify_client_secret",
    "SHOPIFY_CLIENTSECRET",
  );
  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;

  try {
    const res = await fetch(`https://${store}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data?.access_token) return null;
    cachedToken = data.access_token;
    cachedExp = Date.now() + (data.expires_in ?? 86_400) * 1000;
    return cachedToken;
  } catch {
    return null;
  }
}

const ORDRE_QUERY = `
  query Depositum($q: String!) {
    orders(first: 1, query: $q) {
      edges {
        node {
          name
          displayFinancialStatus
          lineItems(first: 20) {
            edges { node { variant { id } } }
          }
        }
      }
    }
  }
`;

type OrdreSvar = {
  data?: {
    orders?: {
      edges?: {
        node?: {
          name?: string;
          displayFinancialStatus?: string;
          lineItems?: { edges?: { node?: { variant?: { id?: string } | null } }[] };
        };
      }[];
    };
  };
};

/**
 * Depositum-ordrer til afstemningen (S574). Kun det Sonja skal bruge
 * for at parre en betaling med en booking: nummer, tidspunkt, mail og
 * beløb. Ingen navn, telefon eller adresse — de hjælper ikke med
 * matchningen, og så skal de ikke stå på en skærm i butikken.
 */
export type DepositumOrdre = {
  nummer: string;
  tid: string;
  email: string;
  belob: string;
  betalt: boolean;
};

const LISTE_QUERY = `
  query Depositumordrer($q: String!) {
    orders(first: 50, query: $q, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          name
          createdAt
          displayFinancialStatus
          totalPriceSet { shopMoney { amount currencyCode } }
          customer { defaultEmailAddress { emailAddress } }
          lineItems(first: 20) { edges { node { variant { id } } } }
        }
      }
    }
  }
`;

/**
 * Henter de seneste depositum-ordrer. Fejler LUKKET: kan vi ikke spørge
 * Shopify, får Sonja et tomt svar og en besked — aldrig en liste der
 * ser komplet ud men mangler halvdelen.
 */
export async function depositumOrdrer(
  varianter: ReadonlySet<string>,
  dage = 60,
): Promise<{ ok: boolean; ordrer: DepositumOrdre[] }> {
  const store = env("SHOPIFY_STORE", "Shopify_store") || DEFAULT_STORE;
  const token = await adminToken(store);
  if (!token) return { ok: false, ordrer: [] };

  const fra = new Date(Date.now() - dage * 86_400_000).toISOString().slice(0, 10);
  let json: { data?: { orders?: { edges?: { node?: Record<string, unknown> }[] } } };
  try {
    const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query: LISTE_QUERY, variables: { q: `created_at:>=${fra}` } }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, ordrer: [] };
    json = await res.json();
  } catch {
    return { ok: false, ordrer: [] };
  }

  const kanter = json?.data?.orders?.edges;
  if (!Array.isArray(kanter)) return { ok: false, ordrer: [] };

  const ordrer: DepositumOrdre[] = [];
  for (const k of kanter) {
    const n = k?.node as
      | {
          name?: string;
          createdAt?: string;
          displayFinancialStatus?: string;
          totalPriceSet?: { shopMoney?: { amount?: string; currencyCode?: string } };
          customer?: { defaultEmailAddress?: { emailAddress?: string } | null } | null;
          lineItems?: { edges?: { node?: { variant?: { id?: string } | null } }[] };
        }
      | undefined;
    if (!n) continue;
    const erDepositum = (n.lineItems?.edges ?? []).some((e) =>
      varianter.has(variantId(e?.node?.variant?.id)),
    );
    if (!erDepositum) continue;
    const penge = n.totalPriceSet?.shopMoney;
    ordrer.push({
      nummer: String(n.name || ""),
      tid: String(n.createdAt || ""),
      email: String(n.customer?.defaultEmailAddress?.emailAddress || ""),
      belob: penge ? `${Math.round(Number(penge.amount))} ${penge.currencyCode || ""}`.trim() : "",
      betalt: n.displayFinancialStatus === "PAID",
    });
  }
  return { ok: true, ordrer };
}

/** Variant-GID → bart id. Ordren svarer med gid, kataloget har cifre. */
function variantId(gid: string | undefined | null): string {
  return String(gid || "").split("/").pop() || "";
}

/**
 * Spørger Shopify om ordren er betalt OG bærer et depositum.
 *
 * Begge betingelser skal holde. En betalt ordre på en t-shirt er ikke
 * et depositum, og en ubetalt depositum-ordre holder ingen tid.
 */
export async function verificerDepositum(
  raw: string,
  varianter: ReadonlySet<string>,
): Promise<DepositumStatus> {
  const nummer = normaliserOrdrenummer(raw);
  if (!nummer) return "ugyldigt";

  const store = env("SHOPIFY_STORE", "Shopify_store") || DEFAULT_STORE;
  const token = await adminToken(store);
  if (!token) return "kan_ikke_tjekke";

  let json: OrdreSvar;
  try {
    const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({
        query: ORDRE_QUERY,
        variables: { q: `name:#${nummer}` },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return "kan_ikke_tjekke";
    json = (await res.json()) as OrdreSvar;
  } catch {
    return "kan_ikke_tjekke";
  }

  const node = json?.data?.orders?.edges?.[0]?.node;
  if (!node) return "ukendt";

  const harDepositum = (node.lineItems?.edges ?? []).some((e) =>
    varianter.has(variantId(e?.node?.variant?.id)),
  );
  if (!harDepositum) return "ukendt";

  return node.displayFinancialStatus === "PAID" ? "betalt" : "ikke_betalt";
}
