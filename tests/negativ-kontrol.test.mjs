// NEGATIV KONTROL — denne test SKAL fejle.
//
// Acceptkriterium 5 i docs/accept/porten.md: «Porten kan bevises at spærre.»
// Et grønt lys er kun værd noget hvis der findes et rødt der kan tændes.
// Denne fil tænder det med vilje, så vi kan se GitHub nægte at merge.
//
// Den lever kun på grenen haruki/negativ-kontrol og bliver ALDRIG merget.
// Ser du den på main, er noget gået galt — slet den.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('negativ kontrol: en bevidst rød test spærrer porten', () => {
  assert.equal(
    'porten burde spærre her',
    'og det gør den',
    'Dette er den bevidste fejl. Den beviser at gitteret har huller der kan lukkes.',
  );
});
