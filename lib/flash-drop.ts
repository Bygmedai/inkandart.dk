import { flash, type FlashPiece } from "@/lib/flash";
import { flashVarer } from "@/lib/lager";
import { tilFlashPieces } from "@/lib/lager-regler";

/**
 * Flash-droppet hentes fra Shopify-kollektionen `flash-drop-01`.
 *
 * HVORFOR IKKE FRA EN FIL: Emma skal kunne lægge et motiv op fra sin telefon
 * kl. 23 uden at spørge en udvikler (Stevens kendelse 30/8). Shopify-appen
 * kan foto, navn, pris, antal og kollektion. Sitet læser resultatet.
 *
 * VEJ A (Steven, 30/8): «Emma vælger str på en flash, så den kun findes én
 * gang.» Størrelsen er en egenskab ved motivet, ikke et valg hos kunden —
 * derfor én variant pr. motiv, lager 1, og ingen mulighed for at sælge det
 * samme unikke motiv to gange. Størrelsen skrives i produktets NAVN
 * («Ouroboros · underarm»), fordi det er ét felt Emma alligevel udfylder.
 * Et ekstra felt er ét felt der kan glemmes.
 *
 * SOLGT SKAL SES, IKKE FORSVINDE. Hylden filtrerer varer uden
 * `availableForSale` fra; her gør vi det MODSATTE. Et solgt motiv bliver
 * stående, udtonet, mærket «Taget» — at se hvad der er væk er halvdelen af
 * grunden til at komme igen næste gang, og det er beviset for at knapheden
 * er ægte.
 *
 * NB til Steven: din formulering var «fjernes når den er solgt». Jeg har
 * læst det som fjernet FRA SALG, ikke fra siden — det matcher din egen
 * oprindelige sætning «når et motiv er væk, er det væk, og siden siger
 * det». Skal det helt af siden, er det ét flag her.
 *
 * FAIL-CLOSED (Haruki #245 A1, S576). Et motiv vises kun hvis dets variant
 * kan BEVISE at den er ét stykke. Et utrakteret lager svarer «til salg» for
 * evigt, og så kunne det samme unikke motiv sælges ti gange. Beviset og
 * begrundelserne bor i lib/lager-regler.ts; her er indgangen, og loggen
 * siger hvem der blev holdt ude og hvorfor.
 *
 * Svarer Storefront ikke — ingen env, fejl, timeout, ingen kollektion —
 * falder vi tilbage til lib/flash.ts. Den er tom, og så siger siden ærligt
 * at næste drop er på vej. Bedre en tom hylde end en gætte-hylde (rails §4).
 */
export async function hentFlashDrop(): Promise<FlashPiece[]> {
  const svar = await flashVarer("flash-drop-01");
  if (!svar.ok) return flash;
  return tilFlashPieces(svar.varer);
}
