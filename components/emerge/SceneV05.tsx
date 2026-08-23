/* eslint-disable @next/next/no-img-element */
import { BlackbookSignup } from "./BlackbookSignup";
import { GadeTape } from "./GadeTape";
import { GiftRelic } from "./GiftRelic";
import { KerbReservation } from "./KerbReservation";
import { MorBird } from "./MorBird";
import { MorMotor } from "./MorMotor";
import { SceneMotor } from "./SceneMotor";
import { site } from "@/lib/site";
import { localePath, t, type Locale } from "@/lib/i18n";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { WalkinRelic } from "./WalkinRelic";


/**
 * Emerge v0.5 — Claudias komplette scene, porteret 1:1 fra design-spec'en
 * (Ink & Art Emerge v0.5 komplet). Fem zoner: Hero · Under gaden · Work ·
 * Artist · Booking. Hvert [data-depth]-lag flyttes af motoren nedenfor:
 * mouse-parallax + scroll-parallax (bundet til ±1 viewport) + organisk
 * egen-drift med deterministisk frekvens/fase pr. objekt. data-drift="0"
 * fastholder tekst/kanter. Uden JS (og ved reduced motion) står alt synligt
 * og stille — entrance-skjulningen sker først i motoren.
 *
 * Markup'en er GENERERET fra spec-filen (uuid→semantiske assets) — ret i
 * spec'en og regenerér frem for at håndrette positioner herinde.
 */
export function SceneV05({ lang = "da" }: { lang?: Locale } = {}) {
  const c = t(lang).scene;
  const nav = t(lang).nav;
  const L = (p: string) => localePath(lang, p);



  return (
    <div className="emerge-v05" style={{ position: "relative", overflow: "clip", background: "#0a0a0a", color: "#e8e0d5", fontFamily: "var(--font-body), system-ui, sans-serif" }}>
      <SceneMotor />
      <MorMotor />
{/* PE (Haruki S566): loaderen VISES kun når emerge-boot har sat html.emerge-js — uden JS ville den ellers dække hele siden permanent (fixed, opak, z-9999). Layout bor i globals.css. */}

<header data-header="" style={{position:'fixed',top:'0',left:'0',right:'0',zIndex:'9980',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',padding:'13px 5vw',background:'rgba(8,7,7,.86)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',borderBottom:'1px solid rgba(232,224,213,.09)',transform:'translateY(-110%)',opacity:'0',transition:'transform .7s cubic-bezier(.16,1,.3,1),opacity .5s ease'}}>
  <a href="#emerge" style={{borderBottom:'none',fontFamily:'\'Cormorant Garamond\',serif',fontWeight:'500',fontSize:'19px',letterSpacing:'.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>INK <em style={{fontStyle:'italic',color:'#c9a227'}}>&</em> ART</a>
  <nav style={{display:'flex',alignItems:'center',gap:'clamp(14px,2.6vw,36px)'}}>
    <a href="#work" style={{borderBottom:'1px solid transparent',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(232,224,213,.72)',paddingTop:'8px'}}>{nav.work}</a>
    <a href="#artists" style={{borderBottom:'1px solid transparent',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(232,224,213,.72)',paddingTop:'8px'}}>{nav.artist}</a>
    <a href={L("/gavekort")} style={{borderBottom:'1px solid transparent',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(232,224,213,.72)',paddingTop:'8px'}}>{nav.gift}</a>
    <a href="https://inkart.book.dk" style={{borderBottom:'1px solid rgba(201,162,39,.5)',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.28em',textTransform:'uppercase',color:'#c9a227',whiteSpace:'nowrap',paddingTop:'8px'}}>{nav.booking}</a>
    <LangSwitch lang={lang} path="/" />
  </nav>
</header>

<section id="emerge" data-screen-label={c.screens.hero} style={{position:'relative',height:'100svh',zIndex:'6'}}>

  <div data-depth="0.05" style={{position:'absolute',inset:'-10%',background:'radial-gradient(72% 26% at 50% 54%, rgba(110,135,142,.15), transparent 70%),radial-gradient(55% 45% at 72% 22%, rgba(42,58,58,.36), transparent 70%),radial-gradient(48% 40% at 16% 66%, rgba(74,22,22,.3), transparent 72%),radial-gradient(70% 55% at 50% 114%, rgba(28,18,16,.95), transparent 75%)'}}></div>
  <div data-depth="0.1" style={{position:'absolute',left:'0',right:'0',top:'46%',height:'32svh',background:'radial-gradient(70% 95% at 50% 100%, rgba(90,112,118,.11), rgba(90,112,118,.05) 55%, transparent 88%)'}}></div>
  <div data-depth="0.14" style={{position:'absolute',left:'-4%',right:'-4%',top:'38%',opacity:'.45',zIndex:'1'}}><img src="/emerge/v05/skyline.svg" alt="" style={{width:'100%',display:'block',filter:'blur(2.5px) saturate(.7)'}}/></div>
  <div data-depth="0.16" style={{position:'absolute',left:'16vw',top:'2%',width:'min(66vw,780px)',opacity:'.1',zIndex:'1'}}><img src="/emerge/v05/ouroboros.svg" alt="" style={{width:'100%',display:'block',filter:'blur(2.5px)'}}/></div>
  <div data-depth="0.12" style={{position:'absolute',left:'2%',top:'5%',width:'44vw',zIndex:'1'}}><img src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="0.18" style={{position:'absolute',right:'-2%',top:'38%',width:'40vw',zIndex:'1'}}><img src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(8deg)'}}/></div>
  <div data-depth="0.2" style={{position:'absolute',left:'28%',bottom:'2%',width:'50vw',opacity:'.7',zIndex:'1'}}><img src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-4deg)'}}/></div>
  <div data-depth="0.15" style={{position:'absolute',left:'56%',top:'6%',width:'220px',opacity:'.14',zIndex:'1'}}><img src="/emerge/v05/smoke-blob.svg" alt="" style={{width:'100%',display:'block',filter:'blur(2px)'}}/></div>
  <div data-depth="0.22" style={{position:'absolute',left:'0',top:'26%',width:'100%',zIndex:'1',pointerEvents:'none'}}><div style={{width:'54px',opacity:'.5',animation:'flyBack 58s linear infinite'}}><img src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1)',filter:'blur(1.2px)'}}/></div></div>
  <div data-depth="0.24" style={{position:'absolute',left:'0',top:'33%',width:'100%',zIndex:'1',pointerEvents:'none'}}><div style={{width:'40px',opacity:'.35',animation:'flyBack 66s linear infinite -30s'}}><img src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(4deg)',filter:'blur(1.6px)'}}/></div></div>

  <div data-depth="0.34" style={{position:'absolute',top:'0',left:'0',width:'100%',zIndex:'3'}}><img src="/emerge/v05/edge-top.svg" alt="" style={{width:'100%',height:'clamp(160px,30svh,340px)',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.38" style={{position:'absolute',left:'-2vw',top:'-6svh',width:'37vw',zIndex:'3'}}><img src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'114svh',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.4" style={{position:'absolute',right:'-2vw',top:'-6svh',width:'37vw',zIndex:'3'}}><img src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'114svh',objectFit:'fill',display:'block',transform:'scaleX(-1)'}}/></div>
  <div data-depth="0.42" style={{position:'absolute',left:'5%',top:'28%',width:'240px',zIndex:'4'}}><img src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="0.44" style={{position:'absolute',right:'3%',top:'54%',width:'200px',zIndex:'4'}}><img src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(70deg)'}}/></div>
  <div data-depth="0.44" style={{position:'absolute',left:'-4%',top:'22%',width:'112%',opacity:'.85',zIndex:'4'}}><img src="/emerge/v05/wire.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-2.5deg)'}}/></div>
  <div data-depth="0.48" style={{position:'absolute',left:'7%',top:'14%',width:'clamp(170px,18vw,280px)',zIndex:'5'}}><img src="/emerge/v05/sign.svg" alt="Larsbjørnsstræde — Pisserenden" style={{width:'100%',display:'block',transform:'rotate(-6deg)',filter:'drop-shadow(0 16px 28px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="0.36" style={{position:'absolute',left:'66%',top:'58%',width:'clamp(200px,24vw,340px)',opacity:'.55',zIndex:'2'}}><img src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div className="v5m-rose-big" data-depth="0.46" style={{position:'absolute',left:'-3%',bottom:'-4%',width:'clamp(280px,30vw,470px)',zIndex:'5'}}><img src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-10deg)',filter:'saturate(1.15) drop-shadow(0 24px 40px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.4" style={{position:'absolute',right:'8%',top:'8%',width:'clamp(120px,13vw,190px)',zIndex:'4'}}><img src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(38deg)',filter:'drop-shadow(0 16px 28px rgba(0,0,0,.55))'}}/></div>
  <div className="v5m-snake-hero" data-depth="0.5" style={{position:'absolute',right:'-2%',top:'19%',width:'clamp(200px,22vw,320px)',zIndex:'5'}}><img src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)',filter:'saturate(1.1) drop-shadow(0 20px 34px rgba(0,0,0,.6))'}}/></div>
  <div className="v5m-skull-title" data-depth="0.52" style={{position:'absolute',left:'13%',top:'39%',width:'clamp(90px,10vw,140px)',zIndex:'5'}}><img src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-8deg)',filter:'drop-shadow(0 16px 28px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.54" style={{position:'absolute',right:'19%',bottom:'19%',width:'clamp(110px,12vw,180px)',zIndex:'5'}}><img src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-16deg)',filter:'drop-shadow(0 16px 28px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.55" style={{position:'absolute',left:'0',top:'11%',width:'100%',zIndex:'5',pointerEvents:'none'}}><div style={{width:'clamp(90px,10vw,140px)',animation:'fly 34s linear infinite'}}><img src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-4deg)',filter:'drop-shadow(0 10px 18px rgba(0,0,0,.5))'}}/></div></div>
  <div className="v5m-dice-scroll" data-depth="0.5" style={{position:'absolute',left:'29%',bottom:'11%',width:'64px',zIndex:'5'}}><img src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)',filter:'drop-shadow(0 10px 18px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.52" style={{position:'absolute',left:'23%',bottom:'8%',width:'54px',zIndex:'5'}}><img src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',filter:'drop-shadow(0 10px 18px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.53" style={{position:'absolute',left:'26.5%',bottom:'7%',width:'42px',zIndex:'5'}}><img src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(6deg)',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.45" style={{position:'absolute',left:'78%',top:'50%',width:'44px',opacity:'.8',zIndex:'4'}}><img src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)'}}/></div>

  <div data-depth="0.6" data-drift="0" style={{position:'relative',zIndex:'18',paddingTop:'25svh',textAlign:'center'}}>
    <h1 style={{margin:'0',display:'flex',justifyContent:'center'}}>
      {/* Husets officielle segl — samme mærke som på døren i Larsbjørnsstræde.
          Vektoriseret med potrace fra originalen, så størrelsen er fri:
          14 kB gzip'et mod rasterens 31 kB, og skarp i enhver opløsning.
          Overskriften beholder sin semantik via alt-teksten. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-segl.svg" alt="Ink &amp; Art Copenhagen"
           width={376} height={376}
           style={{width:'clamp(148px,24vw,300px)',height:'auto',display:'block',filter:'drop-shadow(0 20px 50px rgba(0,0,0,.78))'}} />
    </h1>
    <p style={{margin:'18px 0 0',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(13px,1.5vw,17px)',letterSpacing:'.34em',textTransform:'uppercase',color:'rgba(232,224,213,.92)',textShadow:'0 2px 18px rgba(0,0,0,.9)'}}>{c.trade}</p>
    <p style={{margin:'10px 0 0',fontFamily:'\'Space Mono\',monospace',fontSize:'13px',letterSpacing:'.26em',textTransform:'uppercase',color:'rgba(232,224,213,.68)'}}>Larsbjørnsstræde 13 · Pisserenden · København K</p>
    <p style={{margin:'26px 0 0'}}>
      <a className="hero-cta" href="https://inkart.book.dk">{c.bookCta}</a>
    </p>
    <div className="walkin-relic-slot"><WalkinRelic /></div>
  </div>

  <div className="v5m-machine-big" data-depth="1.0" style={{position:'absolute',left:'-6%',top:'24%',width:'clamp(200px,24vw,340px)',zIndex:'9'}}><img src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-28deg)',filter:'drop-shadow(0 26px 44px rgba(0,0,0,.75))'}}/></div>
  <div className="v5m-dagger-hero" data-depth="1.1" style={{position:'absolute',right:'5%',bottom:'-6%',width:'clamp(150px,15vw,240px)',zIndex:'10'}}><img src="/emerge/v05/dagger.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(22deg)',filter:'drop-shadow(0 26px 44px rgba(0,0,0,.75))'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',right:'-4%',top:'5%',width:'clamp(200px,24vw,360px)',zIndex:'9'}}><img src="/emerge/v05/needle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-24deg)',filter:'drop-shadow(0 20px 34px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.08" style={{position:'absolute',left:'17%',top:'58%',width:'clamp(80px,8vw,115px)',zIndex:'9'}}><img src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(24deg)',filter:'drop-shadow(0 16px 26px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',right:'29%',top:'11%',width:'clamp(48px,5vw,70px)',zIndex:'10'}}><img src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-18deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'63%',bottom:'11%',width:'clamp(80px,9vw,130px)',zIndex:'10'}}><img src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(30deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.7))'}}/></div>
  <div className="v5m-swallow-mid" data-depth="1.25" style={{position:'absolute',left:'0',top:'23%',width:'100%',zIndex:'10',pointerEvents:'none'}}><div style={{width:'clamp(60px,7vw,100px)',animation:'fly 19s linear infinite -6s'}}><img src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div></div>

  <div data-depth="1.08" data-drift="0" style={{position:'absolute',left:'0',bottom:'-3%',width:'100%',zIndex:'11'}}><img src="/emerge/v05/edge-bottom.svg" alt="" style={{width:'100%',height:'clamp(110px,17svh,200px)',objectFit:'fill',display:'block',filter:'drop-shadow(0 -10px 30px rgba(0,0,0,.5))'}}/></div>
  <div data-depth="1.02" style={{position:'absolute',right:'8%',bottom:'2%',width:'clamp(56px,6.5vw,100px)',zIndex:'10'}}><img src="/emerge/v05/lamp.svg" alt="" style={{width:'100%',display:'block',filter:'drop-shadow(0 14px 26px rgba(0,0,0,.7))'}}/></div>
  <div className="mor-slot" data-depth="1.12" data-drift="0"><MorBird zone="hero" /></div>
  <div data-depth="1.16" style={{position:'absolute',left:'13%',bottom:'2%',width:'clamp(50px,5.5vw,76px)',zIndex:'12'}}><img src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',filter:'drop-shadow(0 8px 16px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',left:'74%',bottom:'1.5%',width:'clamp(72px,8vw,120px)',zIndex:'12'}}><img src="/emerge/v05/bottle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-3deg)',filter:'drop-shadow(0 8px 16px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'34%',bottom:'3.5%',width:'clamp(30px,3vw,44px)',zIndex:'12'}}><img src="/emerge/v05/cigarette.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(8deg)'}}/></div>
  <div data-depth="1.18" style={{position:'absolute',left:'44%',bottom:'4%',width:'34px',zIndex:'12'}}><img src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-8deg)'}}/></div>
  <div data-depth="1.22" style={{position:'absolute',left:'47%',bottom:'2.8%',width:'26px',zIndex:'12'}}><img src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'66%',bottom:'4%',width:'40px',zIndex:'12'}}><img src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(20deg)'}}/></div>

  <div data-depth="1.25" style={{position:'absolute',left:'8%',top:'4%',width:'20px',zIndex:'13'}}><div style={{animation:'fall 9s linear infinite'}}><img src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'93%',top:'2%',width:'15px',zIndex:'13'}}><div style={{animation:'fall 12s linear infinite -5s'}}><img src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.28" style={{position:'absolute',left:'90%',top:'8%',width:'12px',zIndex:'13'}}><div style={{animation:'fall 7.5s linear infinite -2.6s'}}><img src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(8deg)'}}/></div></div>
  <div data-depth="1.22" style={{position:'absolute',left:'86%',top:'6%',width:'10px',zIndex:'13'}}><div style={{animation:'fall 10s linear infinite -4s'}}><img src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.1" style={{position:'absolute',left:'18%',top:'64%',width:'12px',zIndex:'13'}}><div style={{animation:'floatUp 14s linear infinite'}}><img src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'90%',top:'70%',width:'9px',zIndex:'13'}}><div style={{animation:'floatUp 18s linear infinite -7s'}}><img src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(40deg)'}}/></div></div>
  <div data-depth="1.35" style={{position:'absolute',left:'80%',top:'62%',width:'11px',zIndex:'13'}}><div style={{animation:'floatUp 16s linear infinite -11s'}}><img src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(80deg)'}}/></div></div>
  <div data-depth="1.15" style={{position:'absolute',left:'6%',top:'72%',width:'8px',zIndex:'13'}}><div style={{animation:'floatUp 13s linear infinite -3s'}}><img src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.4" style={{position:'absolute',left:'8%',top:'58%',width:'10px',zIndex:'13'}}><div style={{animation:'floatUp 20s linear infinite -9s'}}><img src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-30deg)'}}/></div></div>

  <div data-depth="0.9" style={{position:'absolute',left:'20%',top:'20%',width:'22px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.2s ease-in-out infinite'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',left:'76%',top:'26%',width:'16px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5.4s ease-in-out infinite -2s'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'60%',top:'7%',width:'13px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 3.6s ease-in-out infinite -1s'}}/></div>
  <div data-depth="0.95" style={{position:'absolute',left:'11%',top:'70%',width:'18px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 6s ease-in-out infinite -3s'}}/></div>
  <div data-depth="1.3" style={{position:'absolute',left:'88%',top:'74%',width:'12px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.8s ease-in-out infinite -2.4s'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'42%',top:'15%',width:'10px',zIndex:'8'}}><img src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5s ease-in-out infinite -.8s'}}/></div>

  <div data-depth="1.45" style={{position:'absolute',left:'-12%',top:'-14%',width:'44vw',height:'44svh',background:'radial-gradient(closest-side, rgba(6,5,5,.85), rgba(6,5,5,.45) 55%, transparent 95%)',zIndex:'15',pointerEvents:'none'}}></div>
  <div data-depth="1.45" style={{position:'absolute',right:'-12%',bottom:'-12%',width:'46vw',height:'42svh',background:'radial-gradient(closest-side, rgba(6,5,5,.8), rgba(6,5,5,.42) 55%, transparent 95%)',zIndex:'15',pointerEvents:'none'}}></div>

  <p style={{position:'absolute',bottom:'clamp(28px,4.5svh,64px)',left:'50%',transform:'translateX(-50%)',zIndex:'16',margin:'0',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(12px,1.5vw,16px)',letterSpacing:'.6em',textTransform:'uppercase',color:'rgba(232,224,213,.62)',whiteSpace:'nowrap'}}>{c.scroll}</p>
</section>

<section className="v5-zone-under" data-screen-label={c.screens.street} style={{position:'relative',zIndex:'5',height:'148svh',background:'linear-gradient(180deg,#120d0b 0%,#0d0a09 32%,#080606 100%)'}}>
  <img loading="lazy" src="/emerge/v05/edge-top.svg" alt="" style={{position:'absolute',top:'-2px',left:'0',width:'100%',height:'clamp(150px,27svh,330px)',objectFit:'fill',display:'block',zIndex:'3',pointerEvents:'none'}}/>
  <div data-depth="0.34" style={{position:'absolute',left:'-3vw',top:'4%',width:'30vw',height:'100%',opacity:'.85',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.36" style={{position:'absolute',right:'-3vw',top:'4%',width:'30vw',height:'100%',opacity:'.85',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block',transform:'scaleX(-1)'}}/></div>
  <div data-depth="0.12" style={{position:'absolute',left:'20vw',top:'26%',width:'min(60vw,720px)',opacity:'.07',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/ouroboros.svg" alt="" style={{width:'100%',display:'block',filter:'blur(3px)'}}/></div>
  <div data-depth="0.15" style={{position:'absolute',left:'6%',top:'14%',width:'40vw',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(6deg)'}}/></div>
  <div data-depth="0.18" style={{position:'absolute',right:'2%',top:'56%',width:'44vw',opacity:'.8',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(-5deg)'}}/></div>
  <div data-depth="0.14" style={{position:'absolute',left:'48%',top:'80%',width:'220px',opacity:'.1',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke-blob.svg" alt="" style={{width:'100%',display:'block',filter:'blur(2px)'}}/></div>

  <div data-drift="0" data-depth="0.9" style={{position:'absolute',left:'71%',top:'0',width:'4px',height:'22svh',background:'linear-gradient(180deg,rgba(90,20,20,0),rgba(90,20,20,.6))',zIndex:'4'}}></div>
  <div data-depth="1.1" style={{position:'absolute',left:'70.6%',top:'1%',width:'13px',zIndex:'5'}}><div style={{animation:'fall 6s linear infinite'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.2" style={{position:'absolute',left:'71.2%',top:'3%',width:'9px',zIndex:'5'}}><div style={{animation:'fall 8s linear infinite -3.4s'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="0.6" style={{position:'absolute',left:'64%',top:'20%',width:'200px',zIndex:'4'}}><img loading="lazy" src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>

  <div data-depth="0.44" style={{position:'absolute',left:'21%',top:'-1.5%',width:'clamp(110px,13vw,180px)',zIndex:'4'}}><img loading="lazy" src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(174deg)',filter:'saturate(1.1) drop-shadow(0 18px 30px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.4" style={{position:'absolute',right:'25%',top:'0.5%',width:'clamp(70px,8vw,115px)',zIndex:'4'}}><img loading="lazy" src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(187deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.55))'}}/></div>
  <div data-depth="0.48" style={{position:'absolute',left:'-4%',top:'36%',width:'110%',opacity:'.7',zIndex:'4'}}><img loading="lazy" src="/emerge/v05/wire.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(2.6deg)'}}/></div>

  <div data-depth="0.5" data-drift="0" style={{position:'absolute',left:'0',right:'0',top:'19%',zIndex:'6',overflow:'hidden',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',WebkitMaskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)'}}>
    <div style={{display:'flex',width:'max-content',animation:'mq 38s linear infinite'}}>
      <span style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(14px,2vw,24px)',letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(201,162,39,.72)'}}>THE MARK STAYS. EVERYTHING ELSE FADES  —  SKIN IS THE ONLY ARCHIVE THAT DOESN'T LIE  —  WE DON'T DECORATE. WE COMMIT  —  LATE NIGHTS. PERMANENT DECISIONS  —  </span>
      <span aria-hidden="true" style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(14px,2vw,24px)',letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(201,162,39,.72)'}}>THE MARK STAYS. EVERYTHING ELSE FADES  —  SKIN IS THE ONLY ARCHIVE THAT DOESN'T LIE  —  WE DON'T DECORATE. WE COMMIT  —  LATE NIGHTS. PERMANENT DECISIONS  —  </span>
    </div>
  </div>
  <div data-depth="0.58" data-drift="0" style={{position:'absolute',left:'0',right:'0',top:'46%',zIndex:'6',overflow:'hidden',transform:'rotate(-1.4deg)',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',WebkitMaskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)'}}>
    <div style={{display:'flex',width:'max-content',animation:'mq 47s linear infinite reverse'}}>
      <span style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(12px,1.6vw,19px)',letterSpacing:'.24em',textTransform:'uppercase',color:'rgba(232,224,213,.58)'}}>THE NEEDLE DOESN'T NEGOTIATE  —  WHAT YOU CARRY IS WHAT YOU CHOSE  —  THE MARK STAYS. EVERYTHING ELSE FADES  —  </span>
      <span aria-hidden="true" style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(12px,1.6vw,19px)',letterSpacing:'.24em',textTransform:'uppercase',color:'rgba(232,224,213,.58)'}}>THE NEEDLE DOESN'T NEGOTIATE  —  WHAT YOU CARRY IS WHAT YOU CHOSE  —  THE MARK STAYS. EVERYTHING ELSE FADES  —  </span>
    </div>
  </div>
  <div data-depth="0.54" data-drift="0" style={{position:'absolute',left:'0',right:'0',top:'73%',zIndex:'6',overflow:'hidden',transform:'rotate(0.9deg)',maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',WebkitMaskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)'}}>
    <div style={{display:'flex',width:'max-content',animation:'mq 54s linear infinite'}}>
      <span style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(11px,1.4vw,17px)',letterSpacing:'.26em',textTransform:'uppercase',color:'rgba(139,30,30,.7)'}}>{c.gadeLegend}</span>
      <span aria-hidden="true" style={{whiteSpace:'nowrap',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(11px,1.4vw,17px)',letterSpacing:'.26em',textTransform:'uppercase',color:'rgba(139,30,30,.7)'}}>{c.gadeLegend}</span>
    </div>
  </div>

  <div className="kerb-slot" data-depth="0.62" data-drift="0" style={{position:'absolute',left:'8%',top:'79%',zIndex:'10'}}><KerbReservation /></div>
  <div className="mor-slot" data-depth="1.12" data-drift="0"><MorBird zone="under" /></div>
  <div className="gade-tape-slot"><GadeTape /></div>
  <div data-depth="0.9" style={{position:'absolute',right:'6%',top:'39%',width:'clamp(160px,18vw,260px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(142deg)',filter:'saturate(1.1) drop-shadow(0 20px 34px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'0',top:'44%',width:'100%',zIndex:'7',pointerEvents:'none'}}><div style={{width:'clamp(70px,8vw,110px)',animation:'fly 26s linear infinite -9s'}}><img loading="lazy" src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-5deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div></div>
  <div data-depth="0.85" style={{position:'absolute',left:'5%',top:'53%',width:'clamp(100px,12vw,160px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(12deg)',filter:'drop-shadow(0 18px 30px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',left:'78%',top:'58%',width:'clamp(80px,9vw,125px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/dagger.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(168deg)',filter:'drop-shadow(0 18px 30px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.7" style={{position:'absolute',left:'1%',top:'91%',width:'clamp(110px,13vw,170px)',zIndex:'5'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-24deg)',filter:'drop-shadow(0 16px 26px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.95" style={{position:'absolute',left:'30%',top:'64%',width:'56px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(94deg)'}}/></div>
  <div data-depth="0.8" style={{position:'absolute',left:'32%',top:'66.5%',width:'130px',opacity:'.85',zIndex:'6'}}><img loading="lazy" src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',left:'52%',top:'88%',width:'44px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(32deg)'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'56%',top:'89.5%',width:'34px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-50deg)'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'7%',top:'28%',width:'clamp(46px,5vw,66px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.12" style={{position:'absolute',right:'17%',top:'84%',width:'clamp(52px,6vw,76px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1)',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.92" style={{position:'absolute',right:'5%',top:'66%',width:'clamp(70px,8vw,110px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/bottle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)',filter:'drop-shadow(0 8px 16px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.18" style={{position:'absolute',left:'44%',top:'31%',width:'clamp(26px,2.6vw,38px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cigarette.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-12deg)'}}/></div>

  <div data-depth="0.9" style={{position:'absolute',left:'16%',top:'36%',width:'18px',zIndex:'6'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5.2s ease-in-out infinite -1.2s'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'84%',top:'26%',width:'14px',zIndex:'6'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.4s ease-in-out infinite -2.8s'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',left:'38%',top:'80%',width:'16px',zIndex:'6'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 6.2s ease-in-out infinite'}}/></div>
  <div data-depth="1.25" style={{position:'absolute',left:'24%',top:'10%',width:'12px',zIndex:'8'}}><div style={{animation:'fall 9.5s linear infinite -4s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'58%',top:'8%',width:'10px',zIndex:'8'}}><div style={{animation:'fall 11s linear infinite -6s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(6deg)'}}/></div></div>
  <div data-depth="1.15" style={{position:'absolute',left:'10%',top:'68%',width:'10px',zIndex:'8'}}><div style={{animation:'floatUp 17s linear infinite -5s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(30deg)'}}/></div></div>
  <div data-depth="1.35" style={{position:'absolute',left:'68%',top:'74%',width:'9px',zIndex:'8'}}><div style={{animation:'floatUp 15s linear infinite -10s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>

  <div style={{position:'absolute',left:'0',right:'0',bottom:'0',height:'16svh',background:'linear-gradient(180deg,transparent,#050404 92%)',zIndex:'9',pointerEvents:'none'}}></div>
  <div data-depth="0.7" style={{position:'absolute',left:'38%',bottom:'-4%',width:'190px',opacity:'.85',zIndex:'10'}}><img loading="lazy" src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(40deg)'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',left:'64%',bottom:'-2%',width:'14px',zIndex:'10'}}><div style={{animation:'fall 10s linear infinite -3s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>

  {/* Fagets egne genstande — tilføjet efter Stevens beta-test (S568), hvor to
      førstegangsbesøgende spurgte «er det en tatoveringsbutik?». Heroen siger
      det nu med ord; her siger gaden det med ting. Piercing-motiverne (hoop,
      barbell) er nye i biblioteket — huset piercer, men intet i universet
      viste det. Placeret i kanterne, uden for kridtets bånd. */}
  <div data-depth="0.52" style={{position:'absolute',left:'4%',top:'12%',width:'clamp(74px,9vw,132px)',zIndex:'5',opacity:'.92'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-14deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="1.18" style={{position:'absolute',left:'88%',top:'18%',width:'clamp(56px,6.5vw,96px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/hoop.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(8deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="0.78" style={{position:'absolute',left:'91%',top:'40%',width:'clamp(96px,12vw,180px)',zIndex:'6',opacity:'.9'}}><img loading="lazy" src="/emerge/v05/needle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="1.24" style={{position:'absolute',left:'6%',top:'36%',width:'clamp(46px,5.5vw,78px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/barbell.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-18deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="0.62" style={{position:'absolute',left:'2%',top:'62%',width:'clamp(52px,6vw,88px)',zIndex:'6',opacity:'.85'}}><img loading="lazy" src="/emerge/v05/hoop.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-11deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="1.3" style={{position:'absolute',left:'93%',top:'70%',width:'clamp(44px,5vw,74px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/barbell.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="0.9" style={{position:'absolute',left:'86%',top:'88%',width:'clamp(66px,8vw,112px)',zIndex:'7',opacity:'.88'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(9deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'12%',top:'90%',width:'clamp(38px,4.5vw,62px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-7deg)',filter:'drop-shadow(0 12px 22px rgba(0,0,0,.65))'}}/></div>
</section>

<section id="work" data-screen-label={c.screens.work} style={{position:'relative',zIndex:'4',height:'180svh',background:'linear-gradient(180deg,#050404 0%,#0b0808 26%,#0d0908 62%,#070505 100%)'}}>
  <div data-depth="0.32" style={{position:'absolute',left:'-4vw',top:'-2%',width:'26vw',height:'102%',opacity:'.8',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.34" style={{position:'absolute',right:'-4vw',top:'-2%',width:'26vw',height:'102%',opacity:'.8',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block',transform:'scaleX(-1)'}}/></div>
  <div data-depth="0.1" style={{position:'absolute',left:'24vw',top:'34%',width:'min(56vw,680px)',opacity:'.06',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/ouroboros.svg" alt="" style={{width:'100%',display:'block',filter:'blur(3px)'}}/></div>
  <div data-depth="0.14" style={{position:'absolute',left:'2%',top:'2%',width:'42vw',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)'}}/></div>
  <div data-depth="0.16" style={{position:'absolute',right:'0',top:'38%',width:'40vw',opacity:'.8',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(4deg)'}}/></div>
  <div data-depth="0.12" style={{position:'absolute',left:'20%',top:'74%',width:'46vw',opacity:'.7',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(3deg)'}}/></div>

  <h2 style={{position:'absolute',top:'1.2%',left:'50%',transform:'translateX(-50%)',zIndex:'11',margin:'0',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(12px,1.5vw,16px)',fontWeight:'400',letterSpacing:'.6em',textTransform:'uppercase',color:'rgba(232,224,213,.62)',whiteSpace:'nowrap'}}>Selected work</h2>
  <div data-depth="0.85" style={{position:'absolute',left:'52%',top:'5%',width:'40px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-8deg)'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'56%',top:'3%',width:'12px',zIndex:'10'}}><div style={{animation:'fall 9s linear infinite -1.5s'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>

  <div data-depth="0.3" style={{position:'absolute',right:'22%',top:'33%',width:'min(20%,260px)',opacity:'.35',zIndex:'3'}}><img loading="lazy" src="/optimized/mood/echo-960.webp" srcSet="/optimized/mood/echo-480.webp 480w, /optimized/mood/echo-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={960} alt="" style={{width:'100%',display:'block',filter:'blur(1.5px) saturate(.55) contrast(1.1) brightness(.6) sepia(.16) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-b.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-b.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/></div>

  <div data-depth="0.75" style={{position:'absolute',left:'8%',top:'2.5%',width:'min(30%,420px)',zIndex:'6'}}>
    <figure style={{margin:'0',transform:'rotate(-2.5deg)'}}>
      <img loading="lazy" src="/optimized/work/odin-960.webp" srcSet="/optimized/work/odin-480.webp 480w, /optimized/work/odin-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={899} alt="Black and grey — Odin" style={{width:'100%',display:'block',filter:'saturate(.7) contrast(1.15) brightness(.9) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-b.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-b.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Odin — black & grey</figcaption>
    </figure>
  </div>
  <div data-depth="0.95" style={{position:'absolute',left:'30%',top:'13%',width:'170px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'5%',top:'1%',width:'clamp(70px,8vw,110px)',zIndex:'9'}}><img loading="lazy" src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(22deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.7))'}}/></div>

  <div data-depth="0.55" style={{position:'absolute',right:'10%',top:'7.5%',width:'min(22%,300px)',zIndex:'3'}}>
    <figure style={{margin:'0',transform:'rotate(2deg)'}}>
      <img loading="lazy" src="/optimized/work/traditional-960.webp" srcSet="/optimized/work/traditional-480.webp 480w, /optimized/work/traditional-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={1266} alt="Heart and dagger" style={{width:'100%',display:'block',filter:'saturate(.65) contrast(1.12) brightness(.8) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-c.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-c.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Heart & dagger</figcaption>
    </figure>
  </div>
  <div data-depth="0.9" style={{position:'absolute',right:'8%',top:'5.5%',width:'clamp(56px,6vw,88px)',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/dagger.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-16deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.7))'}}/></div>

  <div data-depth="0.48" style={{position:'absolute',left:'-4%',top:'23%',width:'110%',opacity:'.7',zIndex:'5'}}><img loading="lazy" src="/emerge/v05/wire.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-2deg)'}}/></div>

  <div data-depth="0.9" style={{position:'absolute',left:'34%',top:'25%',width:'min(26%,360px)',zIndex:'8'}}>
    <figure style={{margin:'0',transform:'rotate(1.5deg)'}}>
      <img loading="lazy" src="/optimized/work/godspeed-960.webp" srcSet="/optimized/work/godspeed-480.webp 480w, /optimized/work/godspeed-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={1123} alt="Cheetahs — fine line" style={{width:'100%',display:'block',filter:'saturate(.7) contrast(1.15) brightness(.95) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-a.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-a.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Godspeed</figcaption>
    </figure>
  </div>
  <div data-depth="1.15" style={{position:'absolute',left:'32%',top:'38%',width:'16px',zIndex:'9'}}><div style={{animation:'fall 8.5s linear infinite -2s'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>

  <div data-depth="0.5" style={{position:'absolute',left:'12%',top:'43%',width:'min(20%,280px)',zIndex:'3'}}>
    <figure style={{margin:'0',transform:'rotate(-3deg)'}}>
      <img loading="lazy" src="/optimized/work/signetring-960.webp" srcSet="/optimized/work/signetring-480.webp 480w, /optimized/work/signetring-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={538} alt="A mark on the hand" style={{width:'100%',display:'block',filter:'saturate(.65) contrast(1.12) brightness(.78) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-b.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-b.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>The signet</figcaption>
    </figure>
  </div>
  <div data-depth="0.8" style={{position:'absolute',left:'9%',top:'41%',width:'clamp(90px,10vw,140px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(118deg)',filter:'drop-shadow(0 16px 26px rgba(0,0,0,.7))'}}/></div>

  <div data-depth="0.95" style={{position:'absolute',right:'6%',top:'48%',width:'min(32%,460px)',zIndex:'8'}}>
    <figure style={{margin:'0',transform:'rotate(2.2deg)'}}>
      <img loading="lazy" src="/optimized/work/saint-960.webp" srcSet="/optimized/work/saint-480.webp 480w, /optimized/work/saint-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={720} alt="Fresh blackwork" style={{width:'100%',display:'block',filter:'saturate(.7) contrast(1.15) brightness(.95) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-c.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-c.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Fresh blackwork</figcaption>
    </figure>
  </div>
  <div data-depth="1.1" style={{position:'absolute',right:'32%',top:'46%',width:'170px',opacity:'.85',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',right:'10%',top:'63%',width:'44px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)'}}/></div>
  <div data-depth="1.12" style={{position:'absolute',right:'13%',top:'64%',width:'34px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(10deg)'}}/></div>

  <div data-depth="0.65" style={{position:'absolute',left:'30%',top:'63%',width:'min(28%,400px)',zIndex:'4'}}>
    <figure style={{margin:'0',transform:'rotate(-1.5deg)'}}>
      <img loading="lazy" src="/optimized/work/session-960.webp" srcSet="/optimized/work/session-480.webp 480w, /optimized/work/session-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={864} height={1152} alt="Under the needle" style={{width:'100%',display:'block',filter:'saturate(.7) contrast(1.15) brightness(.85) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-a.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-a.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Under the needle</figcaption>
    </figure>
  </div>
  <div data-depth="1.0" style={{position:'absolute',left:'26%',top:'60%',width:'clamp(90px,10vw,150px)',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-20deg)',filter:'drop-shadow(0 18px 30px rgba(0,0,0,.75))'}}/></div>

  <div className="v5m-street" data-depth="0.7" style={{position:'absolute',left:'56%',top:'80%',width:'min(24%,340px)',zIndex:'5'}}>
    <figure style={{margin:'0',transform:'rotate(-2deg)'}}>
      <img loading="lazy" src="/optimized/studio/gade-960.webp" srcSet="/optimized/studio/gade-480.webp 480w, /optimized/studio/gade-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={1202} alt="Larsbjørnsstræde" style={{width:'100%',display:'block',filter:'saturate(.7) contrast(1.15) brightness(.88) sepia(.14) hue-rotate(-6deg)',maskImage:'url(\'/emerge/v05/mask-b.svg\')',WebkitMaskImage:'url(\'/emerge/v05/mask-b.svg\')',maskSize:'100% 100%',WebkitMaskSize:'100% 100%'}}/>
      <figcaption style={{marginTop:'12px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>{c.gadeCaption}</figcaption>
    </figure>
  </div>
  <div className="mor-slot" data-depth="1.05" data-drift="0"><MorBird zone="work" /></div>
  <div data-depth="1.15" style={{position:'absolute',left:'30%',top:'93%',width:'clamp(46px,5vw,68px)',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.7))'}}/></div>

  <div data-depth="0.45" style={{position:'absolute',left:'68%',top:'4%',width:'clamp(60px,7vw,100px)',opacity:'.85',zIndex:'3'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(12deg)'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'60%',top:'40%',width:'clamp(40px,4.5vw,60px)',zIndex:'10'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-14deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'0',top:'56%',width:'100%',zIndex:'10',pointerEvents:'none'}}><div style={{width:'clamp(60px,7vw,100px)',animation:'flyBack 32s linear infinite -12s'}}><img loading="lazy" src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(4deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div></div>
  <div data-depth="0.88" style={{position:'absolute',left:'74%',top:'74%',width:'40px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(24deg)'}}/></div>
  <div data-depth="0.92" style={{position:'absolute',left:'16%',top:'79%',width:'clamp(60px,7vw,96px)',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/bottle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(6deg)',filter:'drop-shadow(0 8px 16px rgba(0,0,0,.7))'}}/></div>

  <div data-depth="0.9" style={{position:'absolute',left:'22%',top:'34%',width:'18px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5.6s ease-in-out infinite -1.6s'}}/></div>
  <div data-depth="1.2" style={{position:'absolute',left:'80%',top:'30%',width:'13px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.6s ease-in-out infinite'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',left:'48%',top:'54%',width:'15px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 6.4s ease-in-out infinite -3s'}}/></div>
  <div data-depth="0.95" style={{position:'absolute',left:'8%',top:'70%',width:'16px',zIndex:'9'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5s ease-in-out infinite -2.2s'}}/></div>
  <div data-depth="1.25" style={{position:'absolute',left:'44%',top:'2%',width:'12px',zIndex:'10'}}><div style={{animation:'fall 10s linear infinite -4.5s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'70%',top:'24%',width:'10px',zIndex:'10'}}><div style={{animation:'fall 12s linear infinite -7s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(6deg)'}}/></div></div>
  <div data-depth="1.1" style={{position:'absolute',left:'14%',top:'26%',width:'10px',zIndex:'10'}}><div style={{animation:'floatUp 16s linear infinite -6s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(50deg)'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'64%',top:'70%',width:'9px',zIndex:'10'}}><div style={{animation:'floatUp 14s linear infinite -9s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>

  <div style={{position:'absolute',left:'0',right:'0',bottom:'0',height:'24svh',background:'linear-gradient(180deg,transparent,#040303 94%)',zIndex:'11',pointerEvents:'none'}}></div>
  <div data-depth="0.8" style={{position:'absolute',left:'60%',bottom:'-3%',width:'160px',opacity:'.85',zIndex:'12'}}><img loading="lazy" src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-30deg)'}}/></div>

  {/* Kriterium 2: doeren i bunden af «Selected work». Maalt foer: 42 billeder, nul links — og det er praecis her intentionen topper. */}
  <p className="zone-doer zone-doer--work" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',zIndex:'20',margin:'0'}}>
    <a className="hero-cta" href="https://inkart.book.dk">{c.bookWork}</a>
  </p>
</section>

{/* id="artists" er redirect-matrixens mål (lib/redirects.ts); det indre
    id="artist-nizar" bærer den navngivne ankomst. Krydstjekkes af
    tests/redirects.test.mjs — omdøb ikke uden at rette matrixen. */}
<section id="artists" data-screen-label={c.screens.artist} style={{position:'relative',zIndex:'3',height:'105svh',background:'linear-gradient(180deg,#040303 0%,#0a0708 40%,#0b0808 70%,#050404 100%)'}}>
  <div data-depth="0.3" style={{position:'absolute',left:'-5vw',top:'0',width:'24vw',height:'100%',opacity:'.7',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.32" style={{position:'absolute',right:'-5vw',top:'0',width:'24vw',height:'100%',opacity:'.7',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block',transform:'scaleX(-1)'}}/></div>
  <div data-depth="0.12" style={{position:'absolute',left:'4%',top:'8%',width:'44vw',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(5deg)'}}/></div>
  <div data-depth="0.16" style={{position:'absolute',right:'0',top:'52%',width:'42vw',opacity:'.8',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(-6deg)'}}/></div>

  <h2 style={{position:'absolute',top:'5%',left:'50%',transform:'translateX(-50%)',zIndex:'11',margin:'0',fontFamily:'\'Space Mono\',monospace',fontSize:'clamp(12px,1.5vw,16px)',fontWeight:'400',letterSpacing:'.6em',textTransform:'uppercase',color:'rgba(232,224,213,.62)',whiteSpace:'nowrap'}}>The artist</h2>

  <div data-depth="0.35" style={{position:'absolute',left:'24%',top:'12%',width:'min(44%,560px)',opacity:'.16',zIndex:'3'}}><img loading="lazy" src="/emerge/v05/ouroboros.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div className="v5m-artist-photo" id="artist-nizar" data-depth="0.7" style={{position:'absolute',left:'31%',top:'20%',width:'min(26%,340px)',zIndex:'5'}}>
    <figure style={{margin:'0'}}>
      <img loading="lazy" src="/optimized/artists/nizar/portrait-960.webp" srcSet="/optimized/artists/nizar/portrait-480.webp 480w, /optimized/artists/nizar/portrait-960.webp 960w" sizes="(max-width: 768px) 60vw, 480px" width={960} height={613} alt="Nizar" style={{width:'100%',display:'block',filter:'saturate(.55) contrast(1.12) brightness(.88) sepia(.16) hue-rotate(-6deg)',maskImage:'radial-gradient(120% 105% at 50% 40%, #000 52%, transparent 92%)',WebkitMaskImage:'radial-gradient(120% 105% at 50% 40%, #000 52%, transparent 92%)'}}/>
    </figure>
  </div>
  <div className="v5m-artist-quote" data-depth="0.55" style={{position:'absolute',left:'53%',top:'34%',width:'min(34%,440px)',zIndex:'6'}}>
    <div style={{position:'absolute',left:'-8%',top:'-24%',width:'70%',opacity:'.5',zIndex:'-1'}}><img loading="lazy" src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>
    <blockquote style={{margin:'0'}}>
      <p style={{margin:'0',fontFamily:'\'Cormorant Garamond\',serif',fontStyle:'italic',fontWeight:'500',fontSize:'clamp(26px,3.4vw,44px)',lineHeight:'1.2',textShadow:'0 4px 24px rgba(0,0,0,.8)'}}>{c.artistLine1}<br/>{c.artistLine2}</p>
      <footer style={{marginTop:'18px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.3em',textTransform:'uppercase',color:'#8e867b'}}>Nizar — Founder & Artist</footer>
    </blockquote>
  </div>

  <div data-depth="0.95" style={{position:'absolute',left:'22%',top:'13%',width:'clamp(90px,10vw,150px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-18deg)',filter:'drop-shadow(0 18px 30px rgba(0,0,0,.75))'}}/></div>
  <div className="v5m-artist-needle" data-depth="1.0" style={{position:'absolute',right:'14%',top:'55%',width:'clamp(160px,19vw,300px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/needle.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(8deg)',filter:'drop-shadow(0 16px 26px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.9" style={{position:'absolute',left:'26%',top:'58%',width:'46px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="0.94" style={{position:'absolute',left:'29.5%',top:'59%',width:'36px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(8deg)'}}/></div>
  <div data-depth="0.98" style={{position:'absolute',left:'32.5%',top:'58.4%',width:'28px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cup.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-10deg)'}}/></div>
  <div data-depth="0.45" style={{position:'absolute',right:'22%',top:'10%',width:'clamp(80px,9vw,130px)',zIndex:'4'}}><img loading="lazy" src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(178deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',left:'12%',top:'38%',width:'clamp(54px,6vw,84px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/dagger.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(30deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',right:'8%',top:'26%',width:'clamp(44px,5vw,68px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(16deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.12" style={{position:'absolute',left:'64%',top:'74%',width:'clamp(48px,5.5vw,72px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1)',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.85" style={{position:'absolute',left:'0',top:'66%',width:'100%',zIndex:'7',pointerEvents:'none'}}><div style={{width:'clamp(56px,6.5vw,90px)',animation:'fly 29s linear infinite -14s'}}><img loading="lazy" src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-5deg)',filter:'drop-shadow(0 10px 18px rgba(0,0,0,.7))'}}/></div></div>

  <div data-depth="0.92" style={{position:'absolute',left:'18%',top:'24%',width:'16px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5.4s ease-in-out infinite -2s'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'78%',top:'44%',width:'13px',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.8s ease-in-out infinite -1s'}}/></div>
  <div data-depth="1.0" style={{position:'absolute',left:'44%',top:'76%',width:'15px',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 6s ease-in-out infinite -3.4s'}}/></div>
  <div data-depth="1.25" style={{position:'absolute',left:'36%',top:'4%',width:'12px',zIndex:'8'}}><div style={{animation:'fall 9.5s linear infinite -3s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'68%',top:'6%',width:'10px',zIndex:'8'}}><div style={{animation:'fall 11.5s linear infinite -6.5s'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.2" style={{position:'absolute',left:'10%',top:'74%',width:'10px',zIndex:'8'}}><div style={{animation:'floatUp 15s linear infinite -4s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(20deg)'}}/></div></div>
  <div data-depth="0.6" style={{position:'absolute',left:'38%',top:'74%',width:'clamp(100px,12vw,160px)',zIndex:'5'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(-22deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.9" style={{position:'absolute',left:'48%',top:'82%',width:'170px',opacity:'.85',zIndex:'6'}}><img loading="lazy" src="/emerge/v05/splat-black.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(24deg)'}}/></div>
  <div data-depth="0.5" style={{position:'absolute',left:'-4%',top:'78%',width:'70%',opacity:'.6',zIndex:'4'}}><img loading="lazy" src="/emerge/v05/wire.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(4deg)'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',right:'26%',top:'78%',width:'clamp(60px,7vw,100px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(64deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.95" style={{position:'absolute',left:'18%',top:'84%',width:'42px',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/dice.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-28deg)'}}/></div>
  <div data-depth="1.1" style={{position:'absolute',right:'12%',top:'86%',width:'120px',opacity:'.7',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'72%',top:'90%',width:'clamp(26px,2.6vw,36px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/cigarette.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-6deg)'}}/></div>

  <div className="mor-slot" data-depth="1.12" data-drift="0"><MorBird zone="artist" /></div>
  <div style={{position:'absolute',left:'0',right:'0',bottom:'0',height:'18svh',background:'linear-gradient(180deg,transparent,#050404 94%)',zIndex:'11',pointerEvents:'none'}}></div>

  {/* Kriterium 3: doeren i bunden af Nizars afsnit. Man har lige laest om ham — her skal man kunne booke HAM, ikke lede videre. */}
  <p className="zone-doer zone-doer--artist" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',zIndex:'20',margin:'0'}}>
    <a className="hero-cta" href="https://inkart.book.dk">{c.bookArtist}</a>
  </p>
</section>

<section id="booking" data-screen-label={c.screens.booking} style={{position:'relative',zIndex:'2',height:'128svh',background:'linear-gradient(180deg,#050404 0%,#070505 45%,#030303 100%)'}}>
  {/* Ankeret mobil-dock'en tucker på — 1px, første barn af zonen, så tuck-punktet
      følger zonens TOP og er uafhængigt af sektionshøjden. Flyt ikke dette ud af
      toppen uden at fortælle dock'en (MobileDock læser [data-dock-sentinel]). */}
  <div data-dock-sentinel="" aria-hidden="true" style={{position:'absolute',top:'0',left:'0',width:'1px',height:'1px',pointerEvents:'none'}}></div>
  <div data-depth="0.3" style={{position:'absolute',left:'-7vw',top:'0',width:'22vw',height:'96%',opacity:'.6',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block'}}/></div>
  <div data-depth="0.32" style={{position:'absolute',right:'-7vw',top:'0',width:'22vw',height:'96%',opacity:'.6',zIndex:'2'}}><img loading="lazy" src="/emerge/v05/edge-side.svg" alt="" style={{width:'100%',height:'100%',objectFit:'fill',display:'block',transform:'scaleX(-1)'}}/></div>
  <div data-depth="0.14" style={{position:'absolute',left:'8%',top:'14%',width:'40vw',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-5deg)'}}/></div>
  <div data-depth="0.16" style={{position:'absolute',right:'2%',top:'44%',width:'38vw',opacity:'.8',zIndex:'1'}}><img loading="lazy" src="/emerge/v05/smoke.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(6deg)'}}/></div>

  <div data-depth="0.35" style={{position:'absolute',left:'50%',top:'16%',width:'min(46%,520px)',marginLeft:'min(-23%,-260px)',opacity:'.2',zIndex:'3'}}><img loading="lazy" src="/emerge/v05/ouroboros.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div className="v5m-book-center" data-depth="0.6" data-drift="0" style={{position:'relative',zIndex:'6',paddingTop:'22svh',textAlign:'center'}}>
    <h2 style={{margin:'0 auto',maxWidth:'720px',fontFamily:'\'Cormorant Garamond\',serif',fontStyle:'italic',fontWeight:'500',fontSize:'clamp(34px,4.8vw,60px)',lineHeight:'1.15',textShadow:'0 4px 28px rgba(0,0,0,.85)'}}>The mark is already waiting.</h2>
    <GiftRelic lang={lang} />
    <div style={{marginTop:'clamp(28px,5svh,56px)'}}>
      <a href="https://inkart.book.dk" style={{fontFamily:'\'Space Mono\',monospace',fontSize:'13px',letterSpacing:'.34em',textTransform:'uppercase'}} className="hero-cta">{c.bookCta}</a>
      <p style={{margin:'28px 0 0',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.26em',textTransform:'uppercase',color:'#8e867b'}}>Larsbjørnsstræde 13 · 1454 København K · <a href="tel:+4555248608" aria-label={c.callAria(site.phone)} style={{color:'inherit',borderBottom:'1px solid rgba(232,224,213,.25)',paddingTop:'12px'}}>55 24 86 08</a></p>
      <p style={{margin:'12px 0 0',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.26em',textTransform:'uppercase',color:'rgba(139,30,30,.85)'}}>{c.findUs}</p>
      <p style={{margin:'26px 0 0',display:'flex',gap:'24px',justifyContent:'center',flexWrap:'wrap'}}>
        <a href={L("/flash")} style={{fontFamily:'\'Space Mono\',monospace',fontSize:'13px',letterSpacing:'.3em',textTransform:'uppercase',color:'rgba(232,224,213,.72)',borderBottom:'1px solid rgba(201,162,39,.35)',paddingBottom:'5px'}}>{c.flash}</a>
        <a href={L("/shop")} style={{fontFamily:'\'Space Mono\',monospace',fontSize:'13px',letterSpacing:'.3em',textTransform:'uppercase',color:'rgba(232,224,213,.72)',borderBottom:'1px solid rgba(201,162,39,.35)',paddingBottom:'5px'}}>{c.shop}</a>
      </p>
      <BlackbookSignup />
    </div>
  </div>

  <div className="v5m-book-dagger" data-depth="1.1" style={{position:'absolute',left:'16%',top:'22%',width:'clamp(60px,7vw,100px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/dagger.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-20deg)',filter:'drop-shadow(0 16px 26px rgba(0,0,0,.75))'}}/></div>
  <div data-depth="0.45" style={{position:'absolute',right:'14%',top:'8%',width:'clamp(90px,10vw,140px)',zIndex:'4'}}><img loading="lazy" src="/emerge/v06/rose-940.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(184deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.6))'}}/></div>
  <div data-depth="0.9" style={{position:'absolute',right:'20%',top:'38%',width:'clamp(80px,9vw,130px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/machine.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(14deg)',filter:'drop-shadow(0 14px 24px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="1.05" style={{position:'absolute',left:'24%',top:'58%',width:'clamp(70px,8vw,110px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/snake.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(-38deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.95" style={{position:'absolute',left:'70%',top:'64%',width:'clamp(52px,6vw,80px)',zIndex:'7'}}><img loading="lazy" src="/emerge/v06/skull-680.webp" alt="" style={{width:'100%',display:'block',transform:'rotate(10deg)',filter:'drop-shadow(0 12px 20px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.85" style={{position:'absolute',left:'0',top:'52%',width:'100%',zIndex:'7',pointerEvents:'none'}}><div style={{width:'clamp(50px,6vw,84px)',animation:'flyBack 36s linear infinite -8s'}}><img loading="lazy" src="/emerge/v06/swallow-298.webp" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1) rotate(5deg)',filter:'drop-shadow(0 10px 18px rgba(0,0,0,.7))'}}/></div></div>
  <div className="mor-slot" data-depth="1.12" data-drift="0"><MorBird zone="booking" /></div>
  <div data-depth="1.08" style={{position:'absolute',left:'32%',top:'83%',width:'clamp(44px,5vw,64px)',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/rat.svg" alt="" style={{width:'100%',display:'block',transform:'scaleX(-1)',filter:'drop-shadow(0 8px 14px rgba(0,0,0,.7))'}}/></div>
  <div data-depth="0.9" style={{position:'absolute',left:'14%',top:'80%',width:'120px',opacity:'.7',zIndex:'7'}}><img loading="lazy" src="/emerge/v05/splat-red.svg" alt="" style={{width:'100%',display:'block'}}/></div>
  <div data-depth="1.25" style={{position:'absolute',left:'40%',top:'6%',width:'13px',zIndex:'9'}}><div style={{animation:'fall 9s linear infinite -2s'}}><img loading="lazy" src="/emerge/v05/drop-dark.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.3" style={{position:'absolute',left:'58%',top:'4%',width:'10px',zIndex:'9'}}><div style={{animation:'fall 11s linear infinite -5.5s'}}><img loading="lazy" src="/emerge/v05/drop-red.svg" alt="" style={{width:'100%',display:'block'}}/></div></div>
  <div data-depth="1.0" style={{position:'absolute',left:'22%',top:'36%',width:'15px',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 5.8s ease-in-out infinite -1.4s'}}/></div>
  <div data-depth="1.18" style={{position:'absolute',left:'80%',top:'26%',width:'12px',zIndex:'8'}}><img loading="lazy" src="/emerge/v05/spark.svg" alt="" style={{width:'100%',display:'block',animation:'twk 4.4s ease-in-out infinite -2.6s'}}/></div>
  <div data-depth="1.15" style={{position:'absolute',left:'48%',top:'70%',width:'9px',zIndex:'9'}}><div style={{animation:'floatUp 16s linear infinite -6s'}}><img loading="lazy" src="/emerge/v05/ember.svg" alt="" style={{width:'100%',display:'block',transform:'rotate(30deg)'}}/></div></div>

  <footer data-drift="0" style={{position:'absolute',left:'0',right:'0',bottom:'0',zIndex:'10',display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:'12px',padding:'0 5vw 26px',fontFamily:'\'Space Mono\',monospace',fontSize:'12px',letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(232,224,213,.62)'}}>
    <span>Ink & Art Copenhagen — the mark stays</span>
    <span style={{display:'flex',gap:'18px'}}>
      <a href={L("/blackbook")} style={{color:'rgba(232,224,213,.62)',borderBottom:'1px solid rgba(201,162,39,.35)'}}>Blackbook</a>
      <a href="https://www.instagram.com/ink.and.art.cph/" style={{color:'rgba(232,224,213,.62)',borderBottom:'1px solid rgba(232,224,213,.2)'}}>@ink.and.art.cph</a>
    </span>
  </footer>
</section>    </div>
  );
}
