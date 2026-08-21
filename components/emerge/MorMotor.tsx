"use client";

import { useEffect } from "react";
import { MOR_PERCHES, type MorZone } from "@/lib/mor";

/**
 * Isoleret klient-ø — samme mønster som SceneMotor. Scenens due er
 * server-HTML; her bindes tap/hover. Reduced-motion: vi binder ikke.
 */
export function MorMotor() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const birds = Array.from(document.querySelectorAll<HTMLElement>("[data-mor]"));
    const cleanups: Array<() => void> = [];
    const timers: number[] = [];

    for (const el of birds) {
      const zone = el.dataset.mor as MorZone | undefined;
      const perches = zone ? MOR_PERCHES[zone] : undefined;
      if (!perches || perches.length < 2) continue;

      let i = 0;
      let busyUntil = 0;

      const hop = () => {
        if (reduce.matches) return;
        const now = Date.now();
        if (now < busyUntil) return;
        i = (i + 1) % perches.length;
        const next = perches[i];
        busyUntil = now + 2800;
        el.classList.add("is-airborne");
        el.classList.remove("is-said");
        el.dataset.perch = next.id;
        const line = el.querySelector<HTMLElement>(".mor__line");
        if (line) line.textContent = "";

        timers.push(
          window.setTimeout(() => {
            el.classList.remove("is-airborne");
            if (!line) return;
            if (Math.random() < 0.36) {
              line.textContent = next.line;
              el.classList.add("is-said");
              timers.push(window.setTimeout(() => el.classList.remove("is-said"), 4200));
            }
          }, 1100),
        );
      };

      el.addEventListener("click", hop);
      el.addEventListener("pointerenter", hop);
      cleanups.push(() => {
        el.removeEventListener("click", hop);
        el.removeEventListener("pointerenter", hop);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
