"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useEmerge(selector = "[data-emerge]") {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (reduce) {
      nodes.forEach((n) => n.classList.add("is-emerged"));
      return;
    }
    const triggers = nodes.map((node) =>
      ScrollTrigger.create({
        trigger: node,
        start: "top 86%",
        onEnter: () => node.classList.add("is-emerged"),
        once: true,
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, [selector]);
}
