"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

export function Header() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: "#legend",
      start: "top 75%",
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    });
    return () => st.kill();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-[var(--gutter)] py-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--text)] transition-[opacity,transform] duration-700 ${
        visible ? "pointer-events-auto translate-y-0 bg-[var(--void)]/92 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <a href="#emerge">{site.name}</a>
      <nav className="flex items-center gap-5 text-[var(--text-mute)] max-sm:gap-3">
        <a href="#artists" className="hover:text-[var(--gold)]">Artists</a>
        <a href="#work" className="hover:text-[var(--gold)] max-sm:hidden">Work</a>
        <a href="#studio" className="hover:text-[var(--gold)] max-sm:hidden">Studio</a>
        <a href="#booking" className="text-[var(--gold)]">The chair</a>
      </nav>
    </header>
  );
}
