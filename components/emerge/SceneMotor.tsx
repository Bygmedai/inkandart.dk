"use client";

import { useEffect } from "react";

/**
 * Scene-motoren som ISOLERET klient-ø (Haruki S566 perf-pass 2).
 * Scenens markup server-renderes uden hydrering — CI målte hydreringen af
 * de ~180 statiske elementer som ÉN 506 ms long task (hele TBT-budgettet).
 * Motoren finder scenen i DOM'en og animerer den; renderer selv intet.
 */
export function SceneMotor() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(".emerge-v05");
    if (!scope) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PARALLAX = 1;

    type Item = {
      el: HTMLElement; i: number; d: number; o: string; c: number;
      ax: number; ay: number; f1: number; f2: number; f3: number;
      p1: number; p2: number; r: number;
    };
    const sTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const items: Item[] = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-depth]"),
    ).map((el, i) => {
      const d = parseFloat(el.dataset.depth || "0");
      const still = el.dataset.drift === "0";
      // målopacitet gemmes én gang — må ALDRIG læses fra inline-style igen
      // (efter en reload ville en skjult 0 ellers blive læst som målet)
      const cur = el.style.opacity;
      const o = el.dataset.o != null ? el.dataset.o : cur && cur !== "0" ? cur : "1";
      el.dataset.o = o;
      // asynkron egen-bevægelse: unik frekvens/fase/amplitude pr. objekt
      const s = (n: number) => ((i * n + 13) % 97) / 97;
      return {
        el, i, d, o, c: 0,
        ax: still ? 0 : (3 + d * 9) * (0.6 + s(29) * 0.8),
        ay: still ? 0 : (3 + d * 8) * (0.6 + s(41) * 0.8),
        f1: 0.28 + s(17) * 0.5, f2: 0.22 + s(23) * 0.5, f3: 0.15 + s(31) * 0.35,
        p1: s(7) * 6.283, p2: s(11) * 6.283,
        r: still ? 0 : (d > 0.8 ? 1.4 : 0.6) * (0.5 + s(37)),
      };
    });

    const measure = () => {
      // To faser (Haruki S566, forced-reflow-insight): først ALLE skriv,
      // så præcis én reflow, så ALLE læs. Interleavet skriv/læs kostede
      // ~90 forced reflows ved load — én pr. [data-depth]-element.
      const s = sTop();
      for (const it of items) it.el.style.transform = "";
      void document.body.offsetHeight; // committer transform-nulstillingen én gang
      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        it.c = r.top + s + r.height / 2;
      }
    };
    measure();
    for (const it of items) {
      it.el.style.transition = "";
      it.el.style.opacity = it.o;
      it.el.style.translate = "0 0";
    }

    let pending: Item[] = [];
    let revealCheck = () => {};
    const timers: number[] = [];

    if (!reduce) {
      const above = items.filter((it) => it.c - sTop() < window.innerHeight * 1.15);
      pending = items.filter((it) => it.c >= window.innerHeight * 1.15);
      for (const it of above) { it.el.style.transition = "none"; it.el.style.opacity = "0"; }
      void document.body.offsetHeight; // force reflow så opacity:0 er committet
      timers.push(window.setTimeout(() => {
        for (const it of above) {
          const delay = it.d * 700 + ((it.i * 137) % 400);
          it.el.style.transition = "opacity 1.5s ease " + delay.toFixed(0) + "ms";
          it.el.style.opacity = it.o;
        }
      }, 0));
      timers.push(window.setTimeout(() => { for (const it of above) it.el.style.transition = ""; }, 3800));
      // fail-safe: hvis entrance ikke har kørt (throttlet tab), gør alt synligt
      timers.push(window.setTimeout(() => {
        for (const it of items) {
          if (it.el.style.opacity !== it.o) {
            it.el.style.transition = ""; it.el.style.opacity = it.o; it.el.style.translate = "0 0";
          }
        }
      }, 4000));
      // zonen under folden: dukker op af blækket når man scroller derned.
      // Drevet af scroll (ikke IntersectionObserver) — IO fyrer ikke pålideligt overalt.
      for (const it of pending) { it.el.style.opacity = "0"; it.el.style.translate = "0 46px"; }
      revealCheck = () => {
        if (!pending.length) return;
        const limit = sTop() + window.innerHeight * 0.98;
        const still: Item[] = [];
        for (const it of pending) {
          if (it.c < limit) {
            const dly = (it.i % 5) * 130;
            it.el.style.transition =
              "opacity 1.5s ease " + dly + "ms, translate 1.4s cubic-bezier(.16,1,.3,1) " + dly + "ms";
            it.el.style.opacity = it.o;
            it.el.style.translate = "0 0";
            window.setTimeout(() => { it.el.style.transition = ""; }, 3400);
          } else still.push(it);
        }
        pending = still;
      };
      revealCheck();
      window.addEventListener("scroll", revealCheck, { passive: true });
    }

    let mx = 0, my = 0, tx = 0, ty = 0, raf = 0;
    const apply = (t: number) => {
      if (reduce) return;
      const vc = sTop() + window.innerHeight / 2;
      for (const it of items) {
        const dx = Math.sin(t * it.f1 + it.p1) * it.ax * PARALLAX;
        const dy = Math.cos(t * it.f2 + it.p2) * it.ay * PARALLAX;
        const rot = Math.sin(t * it.f3 + it.p2) * it.r;
        const x = mx * (it.d - 0.5) * 95 * PARALLAX + dx;
        // scroll-parallax: bundet til ±1 viewport, så objekter aldrig rives ud af kompositionen
        const rel = Math.max(-1, Math.min(1, (vc - it.c) / window.innerHeight));
        const y = my * (it.d - 0.5) * 55 * PARALLAX + dy + rel * (it.d - 0.5) * 90 * PARALLAX;
        it.el.style.transform =
          "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)" +
          (it.r ? " rotate(" + rot.toFixed(2) + "deg)" : "");
      }
    };
    const t0 = performance.now();
    const loop = (now: number) => {
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      apply((now - t0) / 1000);
      if (pending.length) revealCheck();
      raf = requestAnimationFrame(loop);
    };
    const onMouse = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    // Motor-start udskudt til efter load+idle (Haruki S566 perf-pass):
    // loaderen dækker alligevel skærmen de første ~1,5 s, så drift/parallax
    // der starter efter load er visuelt gratis — men holder rAF-arbejdet ude
    // af TBT-vinduet. Fallback-timeren sikrer start i throttlede tabs.
    let motorStartet = false;
    const startMotor = () => {
      if (motorStartet || reduce) return;
      motorStartet = true;
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) {
      if (document.readyState === "complete") {
        timers.push(window.setTimeout(startMotor, 350));
      } else {
        window.addEventListener("load", () => timers.push(window.setTimeout(startMotor, 350)), { once: true });
        timers.push(window.setTimeout(startMotor, 3000)); // fail-safe
      }
    }
    window.addEventListener("mousemove", onMouse, { passive: true });

    // header: viser sig når heroen er forladt; fail-safe mod throttlede tabs
    let headerShown: boolean | null = null;
    let hTimer = 0;
    const applyHeader = () => {
      const h = scope.querySelector<HTMLElement>("[data-header]");
      if (!h) return;
      const show = sTop() > window.innerHeight * 0.92;
      if (show !== headerShown) {
        headerShown = show;
        h.style.transform = show ? "translateY(0)" : "translateY(-110%)";
        h.style.opacity = show ? "1" : "0";
        window.clearTimeout(hTimer);
        hTimer = window.setTimeout(() => {
          if (parseFloat(getComputedStyle(h).opacity) !== (show ? 1 : 0)) {
            h.style.transition = "none";
            h.style.opacity = show ? "1" : "0";
            h.style.transform = show ? "translateY(0)" : "translateY(-110%)";
          }
        }, 1400);
      }
    };
    applyHeader();
    window.addEventListener("scroll", applyHeader, { passive: true });

    const loader = scope.querySelector<HTMLElement>("[data-loader]");
    if (loader) {
      const hide = () => { loader.style.opacity = "0"; };
      const kill = () => {
        loader.style.transition = "none"; loader.style.opacity = "0"; loader.style.display = "none";
      };
      if (reduce) kill();
      else { timers.push(window.setTimeout(hide, 1500)); timers.push(window.setTimeout(kill, 3200)); }
    }

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", applyHeader);
      window.removeEventListener("scroll", revealCheck);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(hTimer);
      timers.forEach((t) => window.clearTimeout(t));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
