"use client";

import { useEffect, useState } from "react";

/**
 * Kurv-dot beside Blackbook. Renders nothing when the cart is empty
 * or Storefront env is missing — never a «0», never a crash.
 */
export function CartIndicator() {
  const [count, setCount] = useState(0);
  const [href, setHref] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/rummet/cart")
      .then((r) => r.json())
      .then((data: { count?: unknown; checkoutUrl?: unknown }) => {
        if (!live) return;
        const n = typeof data?.count === "number" ? data.count : 0;
        if (n < 1) return;
        setCount(n);
        if (typeof data?.checkoutUrl === "string" && data.checkoutUrl.startsWith("https://")) {
          setHref(data.checkoutUrl);
        }
      })
      .catch(() => {
        /* empty — no badge */
      });
    return () => {
      live = false;
    };
  }, []);

  if (count < 1) return null;

  const word = String(count);
  if (!href) {
    return (
      <span className="rum-cart" aria-label={`Kurv ${word}`}>
        {word}
      </span>
    );
  }
  return (
    <a
      className="rum-cart"
      href={href}
      rel="noopener noreferrer"
      aria-label={`Kurv ${word}`}
    >
      {word}
    </a>
  );
}
