import { flash, type FlashPiece } from "@/lib/flash";
import { productsInCollectionMedSolgte } from "@/lib/storefront";

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
 * Svarer Storefront ikke — ingen env, fejl, timeout, ingen kollektion —
 * falder vi tilbage til lib/flash.ts. Den er tom, og så siger siden ærligt
 * at næste drop er på vej. Bedre en tom hylde end en gætte-hylde (rails §4).
 */
export async function hentFlashDrop(): Promise<FlashPiece[]> {
  const coll = await productsInCollectionMedSolgte("flash-drop-01");
  if (!coll.ok) return flash;

  return coll.products.map((p) => ({
    id: p.handle,
    title: p.title,
    // Artist og størrelse hører til motivet; indtil Shopify bærer dem
    // struktureret, står de i navnet. Vises ikke som tomme felter.
    artist: "",
    size: "M" as const,
    priceKr: Math.round(Number(p.priceAmount) || 0),
    img: p.imageUrl,
    variantId: p.variantNumericId,
    oneOff: true,
    claimed: !p.availableForSale,
  }));
}
