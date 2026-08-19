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

export const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";
