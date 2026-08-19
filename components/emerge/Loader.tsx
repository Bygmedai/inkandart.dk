"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Loader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setGone(true), reduce ? 200 : 2200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[10000] grid place-items-center bg-[var(--void)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          role="status"
        >
          <motion.p
            className="m-0 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]"
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            The mark is already waiting
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
