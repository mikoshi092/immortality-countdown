export const SITE_LOCALES = ["en", "ja"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

export function isSiteLocale(value: string): value is SiteLocale {
  return value === "en" || value === "ja";
}
