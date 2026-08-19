import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--text)]/10 px-[var(--gutter)] py-12">
      <p className="font-[family-name:var(--font-display)] text-[clamp(28px,4vw,44px)] font-medium leading-none">
        {site.name}
      </p>
      <nav className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--text)]/70">
        <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer">
          {site.address.street}
        </a>
        <span className="text-[var(--text)]/30">·</span>
        <a href={site.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        <span className="text-[var(--text)]/30">·</span>
        <a href={`tel:${site.phoneIntl}`}>{site.phone}</a>
        <span className="text-[var(--text)]/30">·</span>
        <a href="/privatlivspolitik">Privatliv</a>
      </nav>
    </footer>
  );
}
