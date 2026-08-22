#!/usr/bin/env python3
"""
export.py — trin 5: master-SVG → WebP i den stoerrelse figuren vises i.

Hvorfor et script: trin 1-4 var reproducerbare, trin 5 var en haandbevaegelse.
Det kostede allerede noget — svalen blev eksporteret i 240px og vist i 240px,
altsaa 1x, mens rose og kranie laa paa 2x. Paa en 2x-skaerm blev svalen
skaleret dobbelt op ved siden af en knivskarp SVG, og det er den figur der
skal bedoemmes. En sammenligning maa ikke vaere skaev paa grund af eksporten.

REGLEN: filen skal vaere 2x den stoerste stoerrelse figuren vises i.
Filnavnet er pixelbredden, saa reglen kan efterses uden at aabne noget.

  ./export.py assets/figur/v06/swallow.svg public/emerge/v06 --vist 149
      -> swallow-298.webp   (2 x 149)

  ./export.py assets/figur/v06/rose.svg public/emerge/v06 --bredde 940
      -> rose-940.webp      (eksplicit bredde)

Kraever: pip install cairosvg pillow
"""
import argparse, io, os, sys
import cairosvg
from PIL import Image


def eksporter(svg: str, ud_mappe: str, bredde: int, kvalitet: int) -> str:
    png = cairosvg.svg2png(url=svg, output_width=bredde, background_color=None)
    im = Image.open(io.BytesIO(png)).convert("RGBA")

    # Alfa er ikke til forhandling: figurerne ligger i en collage. En
    # uigennemsigtig baggrund bliver til en synlig kasse paa forsiden.
    hjoerner = [im.getpixel(p) for p in
                [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]]
    if any(p[3] != 0 for p in hjoerner):
        sys.exit(f"FEJL: {svg} har en uigennemsigtig baggrund — koer finish.py foerst")

    navn = os.path.splitext(os.path.basename(svg))[0]
    ud = os.path.join(ud_mappe, f"{navn}-{im.width}.webp")
    os.makedirs(ud_mappe, exist_ok=True)
    im.save(ud, "WEBP", quality=kvalitet, method=6, exact=True)
    print(f"  {ud}  {im.width}x{im.height}  {os.path.getsize(ud)//1024} kB")
    return ud


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("svg")
    ap.add_argument("ud_mappe")
    ap.add_argument("--vist", type=int, help="stoerste stoerrelse figuren vises i (px) — filen bliver 2x")
    ap.add_argument("--bredde", type=int, help="eksplicit pixelbredde, hvis du ved bedre")
    ap.add_argument("--kvalitet", type=int, default=92)
    a = ap.parse_args()
    if not a.vist and not a.bredde:
        sys.exit("angiv --vist (anbefalet) eller --bredde")
    eksporter(a.svg, a.ud_mappe, a.bredde or a.vist * 2, a.kvalitet)
