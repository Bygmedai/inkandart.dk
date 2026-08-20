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
    const contact = String(data.get("contact") || "").trim();
    const note = String(data.get("note") || "").trim();
    const body = [contact && `Kontakt: ${contact}`, note].filter(Boolean).join("\n");
    const url = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <section id="booking" className="px-[var(--gutter)] py-[clamp(64px,10vw,112px)] text-center">
      <div data-emerge>
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,7vw,92px)] font-medium leading-[.95]">
          Stolen venter.
        </h2>
        <p className="mx-auto mt-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]/70">
          Skriv. Vi svarer.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-10 grid max-w-[380px] gap-3 text-left">
          <label className="grid gap-1.5">
            <span className="sr-only">Kontakt</span>
            <input
              name="contact"
              required
              autoComplete="on"
              placeholder="Telefon eller email"
              className="h-12 border border-[var(--text)]/20 bg-transparent px-4 text-[var(--text)] placeholder:text-[var(--text-mute)]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="sr-only">Besked</span>
            <textarea
              name="note"
              rows={3}
              placeholder="Linjen"
              className="border border-[var(--text)]/20 bg-transparent px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-mute)]"
            />
          </label>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Button type="submit">{sent ? "Åbner WhatsApp" : "Skriv"}</Button>
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
