#!/usr/bin/env python3
"""
finish.py — efterbehandler en Recraft-vektorisering til en collage-figur.

  1. fjerner den heldaekkende baggrundsflade (vektorisatoren bager altid en ind)
  2. snapper alle fyldfarver til husets palet
  3. beskaerer viewBox til figurens faktiske omrids
  4. koerer svgo

  brug: finish.py ind.svg ud.svg [--keep-bg]
"""
import re, sys, subprocess, tempfile, os
import cairosvg
from PIL import Image

PALETTE = {  # husets palet — ACCESS/BRAND
    (0x17,0x11,0x0e): 'sort',
    (0xb8,0xac,0x97): 'ben',
    (0xdd,0xd2,0xbf): 'ben-lys',
    (0x8b,0x1e,0x1e): 'blod',
    (0xd9,0xa1,0x2a): 'messing',
}
def snap(rgb, mono=False):
    r,g,b = rgb
    pal = {k:v for k,v in PALETTE.items() if not (mono and v in ('blod','messing'))}
    # graa/moerk -> sort ; ellers naermeste i palet vaegtet mod kulør
    best=None; bd=1e18
    for p in pal:
        d=(r-p[0])**2*0.9+(g-p[1])**2*1.2+(b-p[2])**2*0.7
        if d<bd: bd=d; best=p
    return best

def hexs(rgb): return '#%02x%02x%02x' % rgb

def process(src, dst, keep_bg=False, mono=False):
    s = open(src).read()
    m = re.search(r'viewBox="([\d.\- ]+)"', s)
    vb = [float(x) for x in m.group(1).split()]

    if not keep_bg:
        # heldaekkende baggrund: path hvis d kun rammer de fire hjoerner
        w,h = vb[2], vb[3]
        def is_bg(d):
            nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
            if len(nums) > 12: return False
            pts = list(zip(nums[0::2], nums[1::2]))
            if len(pts) < 4: return False
            return all(min(abs(x-0),abs(x-w))<2 and min(abs(y-0),abs(y-h))<2 for x,y in pts)
        out=[]; removed=0
        for tag in re.finditer(r'<path[^>]*?/>', s):
            t=tag.group(0)
            dm=re.search(r' d="([^"]+)"', t)
            if dm and is_bg(dm.group(1)) and removed==0:
                s = s.replace(t, '', 1); removed+=1
        print(f'  baggrundsflader fjernet: {removed}')

    # farvesnap
    seen={}
    def rep(m):
        rgb=tuple(int(v) for v in m.group(1).split(','))
        sn=snap(rgb, mono); seen[sn]=seen.get(sn,0)+1
        return f'fill="{hexs(sn)}"'
    s = re.sub(r'fill="rgb\(([\d, ]+)\)"', rep, s)
    # gradienter -> naermeste flade farve (collagen er flad)
    def gstop(m):
        rgb=tuple(int(v) for v in m.group(1).split(','))
        return f'stop-color="{hexs(snap(rgb, mono))}"'
    s = re.sub(r'stop-color="rgb\(([\d, ]+)\)"', gstop, s)
    print('  farver:', {PALETTE[k]:v for k,v in sorted(seen.items(), key=lambda kv:-kv[1])})

    tmp = tempfile.mktemp(suffix='.svg'); open(tmp,'w').write(s)

    # beskaer viewBox til faktisk omrids
    png = tempfile.mktemp(suffix='.png')
    cairosvg.svg2png(url=tmp, write_to=png, output_width=800, background_color=None)
    im = Image.open(png).convert('RGBA'); bb = im.getbbox()
    if bb:
        sx = vb[2]/im.width; sy = vb[3]/im.height
        pad = vb[2]*0.01
        nx = vb[0]+bb[0]*sx-pad; ny = vb[1]+bb[1]*sy-pad
        nw = (bb[2]-bb[0])*sx+2*pad; nh = (bb[3]-bb[1])*sy+2*pad
        s = re.sub(r'viewBox="[\d.\- ]+"', f'viewBox="{nx:.1f} {ny:.1f} {nw:.1f} {nh:.1f}"', s)
        s = re.sub(r'\swidth="\d+"', '', s, count=1)
        s = re.sub(r'\sheight="\d+"', '', s, count=1)
        s = s.replace(' preserveAspectRatio="none"', '')
        print(f'  viewBox beskaaret -> {nw:.0f}x{nh:.0f}')
    open(tmp,'w').write(s)

    subprocess.run(['svgo','--multipass','-p','2','-i',tmp,'-o',dst], check=True,
                   stdout=subprocess.DEVNULL)
    a,b = os.path.getsize(src), os.path.getsize(dst)
    print(f'  {os.path.basename(dst)}: {a//1024} kB -> {b//1024} kB, paths {open(dst).read().count("<path")}')

if __name__ == '__main__':
    a=[x for x in sys.argv[1:] if not x.startswith('--')]
    process(a[0], a[1], '--keep-bg' in sys.argv, '--mono' in sys.argv)
