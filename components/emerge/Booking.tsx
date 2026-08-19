"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Booking() {
  const [sent, setSent] = useState(false);
  useEmerge("#booking [data-emerge]");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const note = String(data.get("note") || "").trim();
    const body = [`Navn: ${name}`, `Kontakt: ${contact}`, note && `Note: ${note}`]
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <section id="booking" className="px-[var(--gutter)] py-[clamp(80px,14vw,160px)] text-center">
      <div data-emerge>
        <p className="mb-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          The chair
        </p>
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,7vw,92px)] font-medium leading-[.95]">
          Stolen venter.
        </h2>
        <p className="mx-auto mt-5 max-w-[38ch] text-[var(--text-soft)]">
          Skriv et par linjer. Vi svarer når det er tid — ikke før.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-10 grid max-w-[420px] gap-3 text-left">
          <label className="grid gap-1.5">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
              Navn
            </span>
            <input
              name="name"
              required
              autoComplete="name"
              className="h-12 border border-[var(--text)]/20 bg-[var(--skin)] px-4 text-[var(--text)]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
              Telefon eller email
            </span>
            <input
              name="contact"
              required
              autoComplete="tel"
              className="h-12 border border-[var(--text)]/20 bg-[var(--skin)] px-4 text-[var(--text)]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
              Det du bærer på
            </span>
            <textarea
              name="note"
              rows={4}
              className="border border-[var(--text)]/20 bg-[var(--skin)] px-4 py-3 text-[var(--text)]"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button type="submit">{sent ? "Åbner WhatsApp" : "Skriv stille"}</Button>
            <Button asChild variant="quiet">
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer">
                Tag din plads
              </a>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
