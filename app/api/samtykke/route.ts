/**
 * /api/samtykke — kundens erklaering, udfyldt foer besoeget.
 *
 * Simones ide, hans felter (Fra Simone, 31/8). Skrevet om 1/9 (S578)
 * efter Stevens kald: «Vi skal overholde loven, ikke vaere selv-politi og
 * bygge Fort Knox.» Acceptkriterier: docs/accept/samtykke-flow.md v3.
 *
 * HVAD DER BLEV LAVET OM, OG HVORFOR
 *
 * Den foerste udgave skrev erklaeringen ind paa kundekortet i Shopify.
 * To ting var galt med det, og begge blev MAALT 1/9:
 *
 *  1. Den loej. Ruten kaldte `customerCreate`. Fandtes kunden i forvejen,
 *     svarede Shopify «email has already been taken», og koden svarede
 *     alligevel `ok` UDEN at skrive noget. Stevens egen erklaering
 *     forsvandt saadan: fladen sagde «Vi har den», og kundekortet var
 *     tomt. Roegtesten ramte den aldrig, fordi den brugte en frisk
 *     mailadresse.
 *
 *  2. Stedet var forkert. Helbredsoplysninger hoerer ikke hjemme som
 *     soegbare maerkater i et markedsfoeringssystem, hvor de dukker op i
 *     lister, segmenter og eksporter. Det var mit eget forslag, og det
 *     var forkert.
 *
 * SAA: Shopify roeres ikke mere herfra. Vi gemmer INGENTING selv — ingen
 * database, ingen vault, ingen ny konto. Erklaeringen sendes som to
 * breve: ét til husets postkasse, ét til kunden. Postkassen har allerede
 * adgangsstyring, ligger hos en databehandler, og Steven bestemmer selv
 * hvor laenge der gemmes.
 *
 * FAIL-CLOSED, og denne gang for alvor: kvittering gives KUN naar BEGGE
 * breve er afsendt. Fejler ét af dem, er svaret en fejl. Det er hele
 * laeren fra 1/9.
 *
 * Haerdning arvet fra /api/subscribe (S568-review):
 *  - Honeypot ("company") → lad-som-om-succes, drop bots stille.
 *  - Body-loft foer noget parses.
 *  - Timeout paa alle upstream-kald.
 *  - Credentials er server-only og naar aldrig browseren.
 *
 * IKKE loest, og bevidst ikke foregivet: rate-limit. Edge-runtime har
 * ingen delt tilstand, saa en in-memory taeller ville vaere teater.
 * Samme situation som /api/subscribe — se #151.
 *
 * RAAB TIL HARUKI: denne rute var din (#270). Steven bad mig bygge
 * flowet om 1/9. Du kan rulle tilbage i din egen lane naar som helst.
 */
import { husBrev, husEmne, kundeBrev, kundeEmne, valider } from "@/lib/samtykke";
import { husAdresse, sendMail } from "@/lib/mail";

export const runtime = "edge";

const MAX_BODY_BYTES = 8_192;

const svar = (status: number, krop: Record<string, unknown>) =>
  new Response(JSON.stringify(krop), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return svar(413, { ok: false });

  let d: Record<string, unknown>;
  try {
    d = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return svar(400, { ok: false });
  }

  // Honeypot: bots faar et ja de ikke kan bruge til noget.
  if (typeof d.company === "string" && d.company.trim() !== "") {
    return svar(200, { ok: true });
  }

  const v = valider(d);
  if (!v.ok) return svar(422, { ok: false, fejl: v.fejl });

  const s = v.vaerdi;
  const tidspunkt = new Date().toISOString();

  // Huset foerst. Kan vi ikke levere erklaeringen til studiet, er der
  // ingen grund til at sende kunden en kvittering for noget der ikke kom
  // frem.
  const tilHuset = await sendMail(husAdresse(), husEmne(s), husBrev(s, tidspunkt));
  if (!tilHuset.ok) {
    console.error("samtykke: brevet til huset gik ikke afsted —", tilHuset.grund);
    return svar(502, { ok: false, led: "hus" });
  }

  const tilKunden = await sendMail(s.email, kundeEmne(s), kundeBrev(s, tidspunkt));
  if (!tilKunden.ok) {
    // Huset HAR den nu. Men kunden mangler sin kopi, og AC2 kraever
    // begge. Vi siger det som det er frem for at kalde det halvt godt.
    console.error("samtykke: kundens kopi gik ikke afsted —", tilKunden.grund);
    return svar(502, { ok: false, led: "kunde" });
  }

  return svar(200, { ok: true });
}
