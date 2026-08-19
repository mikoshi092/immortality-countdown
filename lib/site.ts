/**
 * Site-wide constants. The canonical URL was previously repeated as a
 * string literal in layout.tsx, sitemap.ts and robots.ts.
 */
export const SITE_URL = "https://immortalitycountdown.com";
export const SITE_NAME = "Immortality Countdown";

/**
 * Bump this when the hand-written editorial content (field write-ups,
 * page copy) genuinely changes. Do NOT replace it with `new Date()` —
 * a sitemap that claims every page changed on every deploy trains Google
 * to ignore your lastmod entirely.
 */
export const CONTENT_UPDATED = new Date("2026-08-18");

/** Author/publisher shown in metadata and JSON-LD. E-E-A-T needs a name. */
export const PUBLISHER = {
  name: "Taketoki Fujita",
  url: SITE_URL,
} as const;
