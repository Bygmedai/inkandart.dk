"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";
import { CartIndicator } from "./CartIndicator";
import { LangDoor } from "./LangDoor";

const ROOMS = [
  { href: "/stolen", label: "Stolen" },
  { href: "/maerket", label: "Mærket" },
  { href: "/natten", label: "Natten" },
  { href: "/gaden", label: "Gaden" },
] as const;

/**
 * S574: rumnavnene er husets egennavne og oversættes ikke — men stierne
 * gør. `localePath` peger på /en/… når ruten findes dér, og bliver på
 * dansk når den ikke gør, så en engelsk kunde aldrig rammer en 410.
 */
function current(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Blackbook({
  word = false,
  dock = false,
  mobile = false,
  lang = DEFAULT_LOCALE,
}: {
  word?: boolean;
  dock?: boolean;
  mobile?: boolean;
  lang?: Locale;
}) {
  return (
    <span className={dock ? "rum-dock__cluster" : "rum-nav__cluster"}>
      <a
        href={`${localePath(lang, "/")}#doer`}
        className={dock ? "rum-dock__book" : "rum-nav__book"}
        aria-label={word ? undefined : "Blackbook"}
        data-mobile-book={mobile ? "" : undefined}
      >
        <span className="rum-dot" aria-hidden="true" />
        {word ? <span className="rum-nav__book-word">Blackbook</span> : null}
        <span className="sr-only">Blackbook</span>
      </a>
      <CartIndicator />
    </span>
  );
}

export function Nav({ lang = DEFAULT_LOCALE }: { lang?: Locale }) {
  const pathname = usePathname();
  const c = t(lang).rummet;
  const home = localePath(lang, "/");
  const onHuset = pathname === home;
  return (
    <>
      <header className="rum-nav">
        <Link href={home} className="rum-nav__mark">
          {onHuset ? null : (
            <span className="rum-nav__segl" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-segl.svg" alt="" width={44} height={44} />
            </span>
          )}
          Ink & Art
        </Link>
        <nav className="rum-nav__rooms" aria-label={c.roomsLabel}>
          {ROOMS.map((r) => (
            <Link
              key={r.href}
              href={localePath(lang, r.href)}
              className="rum-nav__room"
              aria-current={current(pathname, r.href) ? "page" : undefined}
            >
              {r.label}
            </Link>
          ))}
          <span className="rum-nav__split" aria-hidden="true" />
          <LangDoor lang={lang} variant="nav" />
          <Blackbook word lang={lang} />
        </nav>
        {/*
          Sprogdøren står som direkte barn af headeren, ikke pakket ind:
          `.rum-nav > .rum-nav__cluster` er en eksisterende regel der
          styrer den mobile Blackbook-klynge, og en wrapper ville bryde
          den lydløst. Egen klasse, husets egen 900px-grænse.
        */}
        <LangDoor lang={lang} variant="nav" />
        <Blackbook mobile lang={lang} />
      </header>
      <nav className="rum-dock" aria-label={c.roomsLabel}>
        {ROOMS.map((r) => (
          <Link
            key={r.href}
            href={localePath(lang, r.href)}
            aria-current={current(pathname, r.href) ? "page" : undefined}
          >
            {r.label}
          </Link>
        ))}
        <Blackbook dock lang={lang} />
      </nav>
    </>
  );
}
