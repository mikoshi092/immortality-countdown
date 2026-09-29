"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavLink from "@/components/NavLink";
import {
  NAV_LINKS,
  NAV_LINKS_JA,
  FOCUS_RING,
  isJapanesePath,
  languageSwitchFor,
} from "@/lib/nav";

/**
 * Was MobileHeader, and it behaved like one at every breakpoint: the nav
 * lived inside `<nav hidden={!open}>`, so desktop visitors also got a
 * hamburger and had to click before they could see that the site has a
 * methodology or eight field pages. Now the links sit inline from `sm` up
 * and the collapsible panel is mobile-only.
 *
 * The locale is read from the path rather than passed as a prop so that
 * the header cannot disagree with the page it sits on. English pages get
 * the English nav plus a link to the Japanese counterpart when one
 * exists; Japanese pages get the Japanese nav plus a link back.
 * Nothing here redirects.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isJa = isJapanesePath(pathname);

  const links = isJa ? NAV_LINKS_JA : NAV_LINKS;
  const homeHref = isJa ? "/ja#top" : "/#top";
  const switcher = languageSwitchFor(pathname);
  const menuLabel = isJa
    ? { open: "メニューを閉じる", closed: "メニューを開く", nav: "メインメニュー" }
    : { open: "Close menu", closed: "Open menu", nav: "Primary" };

  // Kana and kanji have far more strokes per em than Latin letters, so at
  // 14px on a dark background Noto Sans JP 400 reads thinner than Geist
  // 400 next to it. 500 restores the match; the English nav is untouched.
  const navWeight = isJa ? "font-medium" : "";

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="bg-[#141413]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-6 sm:py-4">
        <NavLink href={homeHref} className={`flex items-center gap-2.5 ${FOCUS_RING}`}>
          {/* Same mark/path as app/icon.svg (the site favicon), reused
              here without its black square backing — the header's own
              near-black background already provides that contrast, and
              the stroke is already white, so no color inversion is
              needed. The favicon file itself is untouched. */}
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M10 32
                 C10 18 24 18 32 32
                 C40 46 54 46 54 32
                 C54 18 40 18 32 32
                 C24 46 10 46 10 32"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] leading-none text-white/90 sm:text-sm">
            immortality countdown
          </span>
        </NavLink>

        {/* Desktop: always-visible inline navigation. */}
        <nav aria-label={menuLabel.nav} className="hidden sm:block">
          <ul className="flex flex-row items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  className={`block whitespace-nowrap py-1 text-sm ${navWeight} text-white/80 transition-colors hover:text-white ${FOCUS_RING}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {/* Stays outside the mobile panel: the link between the English
              and Japanese versions is the one thing a visitor who landed
              on the wrong language needs without opening a menu. */}
          <Link
            href={switcher.href}
            hrefLang={switcher.hrefLang}
            lang={switcher.hrefLang}
            aria-label={switcher.ariaLabel}
            className={`whitespace-nowrap rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/80 transition-colors hover:border-white/50 hover:text-white ${FOCUS_RING}`}
          >
            {switcher.label}
          </Link>

          <button
            type="button"
            aria-label={open ? menuLabel.open : menuLabel.closed}
            aria-expanded={open}
            aria-controls="primary-nav-menu"
            onClick={() => setOpen((value) => !value)}
            className={`flex h-7 w-7 shrink-0 items-center justify-center text-white/85 sm:hidden ${FOCUS_RING}`}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile: collapsible panel. */}
      <nav
        id="primary-nav-menu"
        aria-label={menuLabel.nav}
        className={`border-t border-white/10 sm:hidden ${open ? "block" : "hidden"}`}
      >
        <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-1.5 text-sm ${navWeight} text-white/80 transition-colors hover:text-white ${FOCUS_RING}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
