#!/usr/bin/env bash
#
# Måler Shopify cart-permalinks mod den rigtige butik.
#
# Protokollen (Haruki, S568): en LEVENDE variant svarer 302 på et bart kald og
# 200 hvis man følger redirect. En DØD svarer 410 med det samme. Mål derfor
# «302-eller-fulgt-200 mod 410» — ikke «200 mod 410».
#
# Kør ALTID med negativ kontrol: uden et kendt dødt ID ved du ikke om målingen
# overhovedet kan skelne. Scriptet har den indbygget nederst.
#
#   bash scripts/maal-varianter.sh
#
# Exit 1 hvis et ID i "skal leve"-listen ikke lever, eller hvis den negative
# kontrol lever (så ville målingen være værdiløs).
set -uo pipefail

DOMAIN="${NEXT_PUBLIC_SHOPIFY_DOMAIN:-d1qp54-0w.myshopify.com}"
fejl=0

probe () {
  local id="$1" navn="$2" forvent="$3"   # forvent: LEVENDE | DOED
  local bart fulgt dom
  bart=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/cart/$id:1?skip_shop_pay=true")
  fulgt=$(curl -sL -o /dev/null -w '%{http_code}' "https://$DOMAIN/cart/$id:1?skip_shop_pay=true")
  if [ "$bart" = "302" ] && [ "$fulgt" = "200" ]; then dom=LEVENDE
  elif [ "$bart" = "410" ]; then dom=DOED
  else dom="UAFKLARET($bart/$fulgt)"; fi
  printf '%-16s %-26s %-8s forventet:%-8s' "$id" "$navn" "$dom" "$forvent"
  if [ "$dom" = "$forvent" ]; then echo "ok"; else echo "AFVIGER"; fejl=1; fi
}

echo "── skal leve: alt vi har en købsflade for ──"
probe 53492757627208 "reservér en tid 100"   LEVENDE
probe 53463786127688 "heldag 4t+ 1.000"      LEVENDE
probe 53492552827208 "walk-in 2 små 900"     LEVENDE
probe 53467075182920 "gavekort 100"          LEVENDE
probe 53463786094920 "flash i shoppen 500"   LEVENDE
probe 53463786062152 "flash på Module 100"   LEVENDE
probe 53511714570568 "piercing øre 100"      LEVENDE
probe 53511714996552 "piercing krop 100"     LEVENDE
probe 53511715422536 "piercing ansigt 100"   LEVENDE
probe 53511715881288 "piercing mund 100"     LEVENDE

echo
echo "── negativ kontrol: uden disse kan målingen ikke skelne ──"
probe 53342061822280 "Dolk (draft)"          DOED
probe 99999999999999 "findes ikke"           DOED

echo
[ "$fejl" = 0 ] && echo "Alt som forventet." || echo "FUND: se AFVIGER ovenfor."
exit "$fejl"
