import { sikkerJson } from "@/lib/jsonld";

/**
 * Strukturerede data i det serveren sender — ikke i DOM'en bagefter.
 *
 * Server-komponent, ingen klient-direktiv. Teksten er et almindeligt
 * React-barn, ikke en rå HTML-indsprøjtning: husets regel (tests/csp.test.mjs)
 * forbyder HTML-sinks i hele kodebasen, og React 19 skriver tekst i et
 * <script> uændret — uden HTML-entities, så JSON'en er gyldig. Målt 13/10.
 *
 * Det der gør det sikkert, er `sikkerJson()`: den skriver <, >, &, U+2028 og
 * U+2029 som \uXXXX, så et felt med «</script>» ikke kan lukke elementet.
 * Fjern den aldrig.
 *
 * Et <script type="application/ld+json"> er en datablok, ikke kode, og
 * eksekveres ikke — CSP'ens script-src gælder den ikke.
 */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json">{sikkerJson(data)}</script>;
}
