"use client";

import { useEffect } from "react";
import { CREW } from "@/lib/crew";
import { MOR_PERCHES, type MorZone } from "@/lib/mor";
import { VOICE, voiceFromLang, type Voice, type VoiceKey } from "@/lib/voice";

/**
 * Isoleret klient-ø for hele gadens vågne liv. Scenen er server-HTML.
 * Ingen rAF. Timers ryddes ved unmount. Reduced-motion: vi binder ikke.
 *
 * Kontrakt til Haruki: document.documentElement.lang. `en` → engelske linjer.
 */
export function MorMotor() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const timers: number[] = [];
    const cleanups: Array<() => void> = [];
    const busy = new Map<string, number>();
    let v: Voice = voiceFromLang(document.documentElement.lang);

    const say = (key: VoiceKey) => VOICE[v][key];

    document.querySelectorAll<HTMLElement>("[data-voice]").forEach((el) => {
      const key = el.dataset.voice as VoiceKey | undefined;
      if (key && key in VOICE[v]) el.textContent = VOICE[v][key];
    });

    const land = (who: string) => {
      document.dispatchEvent(new CustomEvent("crew:land", { detail: { who } }));
    };

    const hopMor = (el: HTMLElement) => {
      const zone = el.dataset.mor as MorZone | undefined;
      const perches = zone ? MOR_PERCHES[zone] : undefined;
      if (!perches || perches.length < 2) return;
      const id = `mor-${zone}`;
      const now = Date.now();
      if ((busy.get(id) ?? 0) > now) return;
      const cur = el.dataset.perch;
      const pool = perches.filter((p) => p.id !== cur);
      const next = pool[Math.floor(Math.random() * pool.length)] ?? perches[0];
      busy.set(id, now + 2800);
      el.classList.add("is-airborne");
      el.classList.remove("is-said");
      el.dataset.perch = next.id;
      const line = el.querySelector<HTMLElement>(".mor__line");
      if (line) line.textContent = "";
      timers.push(
        window.setTimeout(() => {
          el.classList.remove("is-airborne");
          land(id);
          if (!line) return;
          if (Math.random() < 0.4) {
            line.textContent = say(next.line);
            el.classList.add("is-said");
            timers.push(window.setTimeout(() => el.classList.remove("is-said"), 4200));
          }
        }, 1100),
      );
    };

    const hopCrew = (el: HTMLElement, reason: "idle" | "react") => {
      const who = el.dataset.crew;
      const spec = CREW.find((c) => c.who === who);
      if (!spec) return;
      const now = Date.now();
      if ((busy.get(spec.who) ?? 0) > now) return;
      const cur = el.dataset.perch ?? "a";
      const pool = spec.perches.filter((p) => p !== cur);
      const next = pool[Math.floor(Math.random() * pool.length)] ?? spec.perches[0];
      busy.set(spec.who, now + 2200);
      el.classList.add("is-airborne");
      el.classList.remove("is-said");
      if (spec.who.startsWith("dice")) el.classList.add("is-tumble");
      el.dataset.perch = next;
      const line = el.querySelector<HTMLElement>(".crew__line");
      if (line) line.textContent = "";
      timers.push(
        window.setTimeout(() => {
          el.classList.remove("is-airborne");
          el.classList.remove("is-tumble");
          land(spec.who);
          if (line && spec.line && (reason === "react" || Math.random() < 0.28)) {
            line.textContent = say(spec.line);
            el.classList.add("is-said");
            timers.push(window.setTimeout(() => el.classList.remove("is-said"), 3200));
          }
        }, 900),
      );
    };

    const birds = Array.from(document.querySelectorAll<HTMLElement>("[data-mor]"));
    for (const el of birds) {
      const onHop = () => hopMor(el);
      el.addEventListener("click", onHop);
      el.addEventListener("pointerenter", onHop);
      cleanups.push(() => {
        el.removeEventListener("click", onHop);
        el.removeEventListener("pointerenter", onHop);
      });
    }

    const bits = Array.from(document.querySelectorAll<HTMLElement>("[data-crew]"));
    for (const el of bits) {
      const onHop = () => hopCrew(el, "idle");
      el.addEventListener("click", onHop);
      el.addEventListener("pointerenter", onHop);
      cleanups.push(() => {
        el.removeEventListener("click", onHop);
        el.removeEventListener("pointerenter", onHop);
      });
    }

    const onLand = (ev: Event) => {
      const who = (ev as CustomEvent<{ who: string }>).detail?.who;
      if (!who) return;
      for (const spec of CREW) {
        if (!spec.reactsTo.includes(who)) continue;
        const el = document.querySelector<HTMLElement>(`[data-crew="${spec.who}"]`);
        if (el) hopCrew(el, "react");
      }
    };
    document.addEventListener("crew:land", onLand);
    cleanups.push(() => document.removeEventListener("crew:land", onLand));

    const chaos = () => {
      if (reduce.matches) return;
      const delay = 3800 + Math.random() * 6400;
      timers.push(
        window.setTimeout(() => {
          const live = bits.filter((el) => (busy.get(el.dataset.crew ?? "") ?? 0) < Date.now());
          if (live.length) hopCrew(live[Math.floor(Math.random() * live.length)], "idle");
          chaos();
        }, delay),
      );
    };
    chaos();

    return () => {
      cleanups.forEach((fn) => fn());
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
