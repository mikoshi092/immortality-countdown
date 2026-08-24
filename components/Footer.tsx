"use client";

import { usePathname } from "next/navigation";
import NavLink from "@/components/NavLink";
import {
  NAV_LINKS,
  NAV_LINKS_JA,
  FOCUS_RING,
  isJapanesePath,
} from "@/lib/nav";

/**
 * A Client Component only because it is rendered once in the root layout
 * and therefore cannot be handed the current route as a prop. Reading the
 * path here is what stops /ja from ending with an English footer bolted
 * under a Japanese page.
 */
const COPY = {
  en: {
    tagline: "Tracking scientific progress toward longevity escape velocity.",
    nav: "Footer",
    project: "Independent research and news project.",
    legal: "For informational purposes only. Not medical advice.",
  },
  ja: {
    tagline: "寿命脱出速度（LEV）に向けた科学の進歩を追跡しています。",
    nav: "フッター",
    project: "独立した研究・ニュースプロジェクトです。",
    legal: "情報提供のみを目的としています。医療上の助言ではありません。",
  },
} as const;

export default function Footer() {
  const year = new Date().getFullYear();
  const isJa = isJapanesePath(usePathname());

  const copy = isJa ? COPY.ja : COPY.en;
  const links = isJa ? NAV_LINKS_JA : NAV_LINKS;

  return (
    <footer
      {...(isJa ? { lang: "ja" } : {})}
      className={`bg-[#141413] ${isJa ? "font-ja" : ""}`}
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-lg leading-none text-[#2f766d]">
                ∞
              </span>
              <span className="text-sm font-medium text-white/90">
                Immortality Countdown
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">
              {copy.tagline}
            </p>
          </div>

          <nav aria-label={copy.nav} className="sm:shrink-0">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-row sm:gap-8">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    className={`text-sm ${isJa ? "font-medium" : ""} text-white/70 transition-colors hover:text-white ${FOCUS_RING}`}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/55">{copy.project}</p>
          <p className="text-xs text-white/55">
            &copy; {year} Immortality Countdown. {copy.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
