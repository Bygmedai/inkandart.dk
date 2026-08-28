"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROOMS = [
  { href: "/stolen", label: "Stolen" },
  { href: "/maerket", label: "Mærket" },
  { href: "/natten", label: "Natten" },
  { href: "/gaden", label: "Gaden" },
] as const;

function current(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      <header className="rum-nav">
        <Link href="/" className="rum-nav__mark">
          <span className="rum-nav__segl" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-segl.svg" alt="" width={376} height={376} />
          </span>
          Ink and Art
        </Link>
        <nav className="rum-nav__rooms" aria-label="Rum">
          {ROOMS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rum-nav__room"
              aria-current={current(pathname, r.href) ? "page" : undefined}
            >
              {r.label}
            </Link>
          ))}
          <span className="rum-nav__split" aria-hidden="true" />
          <a href="/#doer" className="rum-nav__book">
            <span className="rum-dot" aria-hidden="true" />
            <span className="rum-nav__book-word">Blackbook</span>
            <span className="sr-only">Blackbook</span>
          </a>
        </nav>
        <a href="/#doer" className="rum-nav__book" data-mobile-book="">
          <span className="rum-dot" aria-hidden="true" />
          <span className="sr-only">Blackbook</span>
        </a>
      </header>
      <nav className="rum-dock" aria-label="Rum">
        {ROOMS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            aria-current={current(pathname, r.href) ? "page" : undefined}
          >
            {r.label}
          </Link>
        ))}
        <a href="/#doer" className="rum-dock__book" aria-label="Blackbook">
          <span className="rum-dot" aria-hidden="true" />
        </a>
      </nav>
    </>
  );
}
