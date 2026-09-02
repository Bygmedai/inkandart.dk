/**
 * En falsk Resend, indsat FOER vagten starter.
 *
 * Hvorfor ikke en rigtig HTTP-server: den forrige udgave af det her rig
 * delte én port paa tvaers af fem scenarier, saa alle fem maalte den
 * samme forladte server og gik groenne. Der er ingen port her, og
 * dermed heller ingen at dele.
 *
 * Hvorfor ikke en base-URL i vagten der kan overstyres: en produktionsfil
 * der baerer en hemmelighed, skal ikke kunne pege et andet sted hen af
 * en miljoevariabel. Stubben sidder i PROEVEN, ikke i koden.
 *
 * Scenariet kommer ind som JSON i STUB: { "<url-fragment>": {status, krop} }
 */
const plan = JSON.parse(process.env.STUB ?? "{}");

globalThis.fetch = async (url) => {
  const u = String(url);
  const noegle = Object.keys(plan).find((k) => u.includes(k));
  if (!noegle) throw new Error(`stubben har intet svar til ${u}`);
  const { status = 200, krop } = plan[noegle];
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => krop,
  };
};
