"use client";

import { useEffect, useState } from "react";
import NavLink from "@/components/NavLink";

const MENU_LINKS = [
  { label: "Home", href: "/#top" },
  { label: "Methodology", href: "/methodology" },
  { label: "Eight Fields", href: "/fields" },
  { label: "Latest News", href: "/#latest-news" },
];

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
        <NavLink href="/#top" className={`flex items-center gap-2.5 ${FOCUS_RING}`}>
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

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav-menu"
          onClick={() => setOpen((value) => !value)}
          className={`flex h-7 w-7 shrink-0 items-center justify-center text-white/85 ${FOCUS_RING}`}
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

      <nav id="primary-nav-menu" aria-label="Primary" hidden={!open} className="border-t border-white/10">
        <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-3">
          {MENU_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-1.5 text-sm text-white/80 transition-colors hover:text-white ${FOCUS_RING}`}
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
