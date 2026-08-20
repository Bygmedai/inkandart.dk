"use client";

import { useState } from "react";

/**
 * Blackbook-signup (Haruki-review S566 F2, Steven-valg 20/8: portér).
 * Stille email-capture → /api/subscribe (Shopify-kunde m. consent).
 * Virker uden JS-æstetik-motoren; kræver dog JS for selve POST'en —
 * uden JS står feltet med et mailto-fallback i noscript.
 */
export function BlackbookSignup() {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "fejl">("idle");
  const mono = "'Space Mono',monospace";
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
          source: "emerge",
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
      onSubmit={(e) => { e.preventDefault(); void send(e.currentTarget); }}
      style={{ margin: "34px auto 0", maxWidth: "420px", padding: "0 18px" }}
    >
      <label htmlFor="blackbook-email" style={{ display: "block", fontFamily: mono, fontSize: "10px", letterSpacing: ".26em", textTransform: "uppercase", color: "#8e867b", whiteSpace: "normal", lineHeight: "1.9" }}>
        Blackbook — first look at flash & guest spots
      </label>
      {/* honeypot: skjult for mennesker, fristende for bots */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
        <input
          id="blackbook-email" type="email" name="email" required autoComplete="email"
          placeholder="din@mail.dk"
          style={{ flex: "1", minWidth: "0", background: "transparent", border: "none", borderBottom: "1px solid rgba(232,224,213,.3)", padding: "6px 2px", fontFamily: mono, fontSize: "12px", color: "#e8e0d5", outline: "none" }}
        />
        <button
          type="submit" disabled={status === "busy"}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: mono, fontSize: "11px", letterSpacing: ".3em", textTransform: "uppercase", color: "#c9a227", borderBottom: "1px solid rgba(201,162,39,.45)", paddingBottom: "4px" }}
        >
          {status === "busy" ? "…" : "Join"}
        </button>
      </div>
      <p role="status" style={{ margin: "10px 0 0", minHeight: "14px", fontFamily: mono, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: status === "fejl" ? "rgba(139,30,30,.9)" : "#8e867b" }}>
        {status === "ok" ? "Du er i bogen." : status === "fejl" ? "Noget gik galt — prøv igen." : ""}
      </p>
    </form>
  );
}
