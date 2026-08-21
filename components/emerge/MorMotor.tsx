"use client";

import { useEffect } from "react";
import { CREW } from "@/lib/crew";
import { MOR_PERCHES, type MorZone } from "@/lib/mor";
import { MUTTERS, MUTTER_FIRST } from "@/lib/mutter";
import {
  VOICE,
  isLineKey,
  pickLine,
  voiceFromLang,
  type LineKey,
  type Voice,
  type VoiceKey,
} from "@/lib/voice";

const HOLD = 6800;
const QUIET = 8400;

/**
 * Isoleret klient-ø for hele gadens vågne liv. Scenen er server-HTML.
 * Ingen rAF. Timers ryddes ved unmount. Reduced-motion: vi binder ikke.
 *
 * Kontrakt til Haruki: document.documentElement.lang. `en` → engelske linjer.
 * Én figur mumler ad gangen. Lang pause. Linjerne roterer i banken.
 */
export function MorMotor() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const timers: number[] = [];
    const cleanups: Array<() => void> = [];
    const busy = new Map<string, number>();
    const lastLine = new Map<string, string>();
    let quietUntil = 0;
    const v: Voice = voiceFromLang(document.documentElement.lang);

    document.querySelectorAll<HTMLElement>("[data-voice]").forEach((el) => {
      const key = el.dataset.voice as VoiceKey | undefined;
      if (key === "mor.sr") el.textContent = VOICE[v][key];
    });

    const land = (who: string) => {
      document.dispatchEvent(new CustomEvent("crew:land", { detail: { who } }));
    };

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 64 && r.top < window.innerHeight - 64 && r.width > 8 && r.height > 8;
    };

    const utter = (host: HTMLElement, line: HTMLElement | null, key: LineKey): boolean => {
      if (!line) return false;
      const now = Date.now();
      if (now < quietUntil) return false;
      const text = pickLine(v, key, lastLine.get(key));
      lastLine.set(key, text);
      line.textContent = text;
      host.classList.add("is-said");
      quietUntil = now + HOLD + QUIET;
      timers.push(
        window.setTimeout(() => {
          host.classList.remove("is-said");
        }, HOLD),
      );
      return true;
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
          if (Math.random() < 0.4) utter(el, line, next.line);
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
          if (!line || !spec.line) return;
          if (reason === "react" || Math.random() < 0.28) utter(el, line, spec.line);
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

    const mutterHosts: HTMLElement[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const key = el.dataset.mutter;
          if (!key || !isLineKey(key)) continue;
          timers.push(
            window.setTimeout(() => {
              if (!inView(el)) return;
              if (Math.random() >= 0.45) return;
              utter(el, el.querySelector<HTMLElement>(".mutter__line"), key);
            }, 1600 + Math.random() * 2400),
          );
        }
      },
      { threshold: 0.35 },
    );

    const armMutter = (el: HTMLElement, key: LineKey) => {
      if (el.dataset.mutter) return;
      el.dataset.mutter = key;
      if (!el.querySelector(".mutter__line")) {
        const p = document.createElement("p");
        p.className = "mutter__line";
        p.setAttribute("aria-hidden", "true");
        el.appendChild(p);
      }
      mutterHosts.push(el);
      io.observe(el);
      const box = el.getBoundingClientRect();
      if (box.width >= 44 && box.height >= 44) {
        const onSpeak = () => {
          utter(el, el.querySelector<HTMLElement>(".mutter__line"), key);
        };
        el.addEventListener("click", onSpeak);
        el.addEventListener("pointerenter", onSpeak);
        cleanups.push(() => {
          el.removeEventListener("click", onSpeak);
          el.removeEventListener("pointerenter", onSpeak);
        });
      }
      cleanups.push(() => io.unobserve(el));
    };

    for (const m of MUTTERS) {
      const el = document.querySelector<HTMLElement>(m.sel);
      if (el) armMutter(el, m.key);
    }
    for (const m of MUTTER_FIRST) {
      const img = document.querySelector<HTMLImageElement>(`.emerge-v05 img[src="${m.src}"]`);
      const el = img?.parentElement;
      if (el) armMutter(el, m.key);
    }
    cleanups.push(() => io.disconnect());

    const chaos = () => {
      if (reduce.matches) return;
      const delay = 7200 + Math.random() * 8800;
      timers.push(
        window.setTimeout(() => {
          if (Date.now() >= quietUntil) {
            const liveCrew = bits.filter(
              (el) => (busy.get(el.dataset.crew ?? "") ?? 0) < Date.now() && inView(el),
            );
            const liveMut = mutterHosts.filter((el) => inView(el) && !el.classList.contains("is-said"));
            const roll = Math.random();
            if (roll < 0.45 && liveCrew.length) {
              hopCrew(liveCrew[Math.floor(Math.random() * liveCrew.length)]!, "idle");
            } else if (liveMut.length) {
              const el = liveMut[Math.floor(Math.random() * liveMut.length)]!;
              const key = el.dataset.mutter;
              if (key && isLineKey(key)) utter(el, el.querySelector(".mutter__line"), key);
            } else if (liveCrew.length) {
              hopCrew(liveCrew[Math.floor(Math.random() * liveCrew.length)]!, "idle");
            }
          }
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
