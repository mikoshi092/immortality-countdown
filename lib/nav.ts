// Single source of truth for primary navigation.
// Previously duplicated in SiteHeader and Footer, which is how a link
// gets fixed in one place and stays broken in the other.
export const NAV_LINKS = [
  { label: "Home", href: "/#top" },
  { label: "Methodology", href: "/methodology" },
  { label: "Eight Fields", href: "/fields" },
  { label: "The Model", href: "/model" },
  { label: "Latest News", href: "/news" },
  { label: "About", href: "/about" },
] as const;

/**
 * Japanese navigation for /ja and /ja/news. Most landing-page entries
 * stay in-page anchors. Latest research now has its own Japanese list.
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
  { label: "最新研究", href: "/ja/news" },
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

/**
 * Pair true bilingual routes. News list and article pages exist in both
 * languages; everything else still switches to the landing page.
 */
export function languageSwitchFor(pathname: string | null | undefined) {
  const path = pathname ?? "/";
  if (path === "/news" || path.startsWith("/news/")) {
    return { ...LANGUAGE_SWITCH.toJapanese, href: `/ja${path}` };
  }
  if (path === "/ja/news" || path.startsWith("/ja/news/")) {
    return { ...LANGUAGE_SWITCH.toEnglish, href: path.slice("/ja".length) };
  }
  return isJapanesePath(path)
    ? LANGUAGE_SWITCH.toEnglish
    : LANGUAGE_SWITCH.toJapanese;
}

export const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";
