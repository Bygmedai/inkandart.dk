"use client";

import { useState } from "react";

/**
 * Blackbook-døren. Ét email-felt. Aldrig væk.
 * POST /api/subscribe — Shopify customer + tag `blackbook`.
 * Success copy is the existing line from the house, not a new invention.
 */
export function Door({ variant = "page" }: { variant?: "page" | "inline" }) {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "fejl">("idle");

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
      <p className="rum-door__line">Vi sender kun natten. Afmeld nederst i mailen.</p>
      <div className="rum-door__hp" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="rum-door__row">
        <div className="rum-door__field">
          <label htmlFor={variant === "inline" ? "blackbook-email-inline" : "blackbook-email"}>
            Email
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
          {status === "busy" ? "…" : "Ind"}
        </button>
      </div>
      <p className="rum-door__status" role="status">
        {status === "ok" ? "Du er i bogen." : status === "fejl" ? "Noget gik galt — prøv igen." : ""}
      </p>
    </form>
  );
}
