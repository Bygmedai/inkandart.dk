"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const bg = el.querySelector<HTMLElement>("[data-layer=bg]");
    const mid = el.querySelector<HTMLElement>("[data-layer=mid]");
    const fg = el.querySelector<HTMLElement>("[data-layer=fg]");
    const word = el.querySelector<HTMLElement>("[data-layer=word]");

    const ctx = gsap.context(() => {
      gsap.set([bg, mid, fg], { willChange: "transform" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          pin: true,
          pinSpacing: true,
        },
      });
      tl.to(bg, { yPercent: 18, ease: "none" }, 0)
        .to(mid, { yPercent: 10, xPercent: -3, ease: "none" }, 0)
        .to(fg, { yPercent: -8, ease: "none" }, 0)
        .to(word, { yPercent: -12, opacity: 0.2, ease: "none" }, 0);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="emerge" className="relative h-svh min-h-[720px] overflow-hidden bg-[var(--void)]">
      <div className="absolute inset-0" aria-hidden="true">
        <div data-layer="bg" className="absolute inset-0 scale-110">
          <Image
            src="/emerge/layer-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%]"
          />
        </div>
        <div data-layer="mid" className="absolute inset-0 scale-110 opacity-40 mix-blend-overlay">
          <Image
            src="/emerge/layer-mid.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          data-layer="fg"
          className="absolute inset-x-0 bottom-0 h-[72%] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black)]"
        >
          <Image
            src="/emerge/layer-fg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.42)_0%,rgba(10,10,10,.04)_36%,rgba(10,10,10,.28)_70%,rgba(10,10,10,.78)_100%)]" />
      </div>

      <div data-layer="word" className="relative z-10 flex h-full flex-col items-center justify-center px-[var(--gutter)] pb-[22vh] text-center">
        <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(52px,13vw,168px)] font-medium uppercase leading-[.9] tracking-[0.06em]">
          INK <span className="italic text-[var(--gold)]">&amp;</span> ART
        </h1>
        <p className="mt-4 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.22em] text-[var(--text)]/70">
          {site.address.street} · {site.address.city}
        </p>
      </div>

      <a
        href="#legend"
        className="emerge-scroll absolute bottom-[clamp(40px,9vh,88px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-mono)] text-[clamp(13px,1.7vw,18px)] font-normal uppercase text-[var(--gold)]"
      >
        Scroll down to emerge
      </a>
    </section>
  );
}
