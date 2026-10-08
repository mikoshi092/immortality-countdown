/**
 * Site-wide constants. The canonical URL was previously repeated as a
 * string literal in layout.tsx, sitemap.ts and robots.ts.
 */
export const SITE_URL = "https://immortalitycountdown.com";
export const SITE_NAME = "Immortality Countdown";

/**
 * Author/publisher. E-E-A-T needs a named human, and Google needs to be
 * able to tie that name to profiles it already knows about — that is what
 * `sameAs` is for. Deliberately NO postal address or phone number: those
 * matter for LocalBusiness and for sites that sell things, and carry real
 * personal risk on a site about immortality. They do nothing for search
 * on an independent research site.
 */
export const PUBLISHER = {
  name: "Johnny Wang",
  url: `${SITE_URL}/about`,
  jobTitle: "Strategic investor",
  /** Identity signals. Keep these in sync with the live profiles. */
  sameAs: ["https://x.com/fruitescake", "https://github.com/mikoshi092"],
  x: "https://x.com/fruitescake",
  xHandle: "@fruitescake",
  github: "https://github.com/mikoshi092",
  /** Kept out of the nav and out of any heading; see /about. */
  email: "techevangelist2030@gmail.com",
  /** Preferred channel: public, logged, and consistent with the site's ethos. */
  issues: "https://github.com/mikoshi092/immortality-countdown/issues",
} as const;
