// Single source of truth for primary navigation.
// Previously duplicated in SiteHeader and Footer, which is how a link
// gets fixed in one place and stays broken in the other.
export const NAV_LINKS = [
  { label: "Home", href: "/#top" },
  { label: "Methodology", href: "/methodology" },
  { label: "Eight Fields", href: "/fields" },
  { label: "The Model", href: "/model" },
  { label: "Latest News", href: "/#latest-news" },
  { label: "About", href: "/about" },
] as const;

/**
 * Japanese navigation for /ja. The site is not translated — /ja is one
 * standalone page — so most entries are in-page anchors and the one link
 * that leaves it is explicitly marked as English.
 *
 * Deliberately free of model numbers (no 「なぜ66年？」): this module is
 * imported by SiteHeader and Footer, which are Client Components, so
 * reaching for `lib/countdown` here would pull the 32 KB
 * lev/forecast.json into the client bundle of every page on the site.
 * The page headings interpolate the model number instead.
 */
export const NAV_LINKS_JA = [
  { label: "トップ", href: "/ja#top" },
  { label: "LEVとは", href: "/ja#lev-toha" },
  { label: "なぜこの年数か", href: "/ja#why-now" },
  { label: "8つの技術", href: "/ja#eight-fields" },
  { label: "最新研究（英語）", href: "/#latest-news" },
] as const;

/** /ja is a single page today; the prefix check keeps room for /ja/*. */
export function isJapanesePath(pathname: string | null | undefined): boolean {
  return pathname === "/ja" || (pathname?.startsWith("/ja/") ?? false);
}

/**
 * Manual language switching only. Google asks for a distinct URL per
 * language plus a visible link between them, and explicitly advises
 * against redirecting visitors by IP or Accept-Language — so this is an
 * ordinary link, never an automatic redirect.
 *
 * `href` has no trailing slash on purpose: the site runs with Next.js's
 * default `trailingSlash: false`, where /ja/ redirects to /ja.
 */
export const LANGUAGE_SWITCH = {
  toJapanese: {
    href: "/ja",
    hrefLang: "ja",
    label: "日本語",
    ariaLabel: "日本語版のページを表示",
  },
  toEnglish: {
    href: "/",
    hrefLang: "en",
    label: "EN",
    ariaLabel: "View this site in English",
  },
} as const;

export const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";
