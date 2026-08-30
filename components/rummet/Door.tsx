"use client";

import { useState } from "react";
import { DEFAULT_LOCALE, t, type Locale } from "@/lib/i18n";

/**
 * Blackbook-døren. Ét email-felt. Aldrig væk.
 * POST /api/subscribe — Shopify customer + tag `blackbook`.
 * Success copy is the existing line from the house, not a new invention.
 *
 * S574: døren taler sidens sprog. Den engelske udgave er husets egen
 * stemme på engelsk — ikke en maskinoversættelse af den danske linje.
 */
export function Door({
  variant = "page",
  lang = DEFAULT_LOCALE,
}: {
  variant?: "page" | "inline";
  lang?: Locale;
}) {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "fejl">("idle");
  const c = t(lang).rummet;

  async function send(form: HTMLFormElement) {
    const data = new FormData(form);
    setStatus("busy");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || ""),
          company: String(data.get("company") || ""),
          source: "blackbook",
        }),
      });
      const out = await res.json().catch(() => null);
      setStatus(res.ok && out?.ok ? "ok" : "fejl");
    } catch {
      setStatus("fejl");
    }
  }

  return (
    <form
      id="doer"
      className={variant === "inline" ? "rum-door rum-door--inline" : "rum-door"}
      onSubmit={(e) => {
        e.preventDefault();
        void send(e.currentTarget);
      }}
    >
      <div className="rum-door__head">
        <span className="rum-dot" aria-hidden="true" />
        <span className="rum-door__name">Blackbook</span>
      </div>
      <p className="rum-door__line">{c.blackbookLine}</p>
      <div className="rum-door__hp" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="rum-door__row">
        <div className="rum-door__field">
          <label htmlFor={variant === "inline" ? "blackbook-email-inline" : "blackbook-email"}>
            {c.blackbookEmail}
          </label>
          <input
            id={variant === "inline" ? "blackbook-email-inline" : "blackbook-email"}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>
        <button type="submit" className="rum-door__go" disabled={status === "busy"}>
          {status === "busy" ? c.blackbookBusy : c.blackbookGo}
        </button>
      </div>
      <p className="rum-door__status" role="status">
        {status === "ok" ? c.blackbookOk : status === "fejl" ? c.blackbookFejl : ""}
      </p>
    </form>
  );
}
