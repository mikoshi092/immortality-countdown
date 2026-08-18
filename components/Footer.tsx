import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/#top" },
  { label: "Methodology", href: "/methodology" },
  { label: "Eight Fields", href: "/fields" },
  { label: "Latest News", href: "/#latest-news" },
];

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#141413]">
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
              Tracking scientific progress toward longevity escape velocity.
            </p>
          </div>

          <nav aria-label="Footer" className="sm:shrink-0">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-row sm:gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-white/70 transition-colors hover:text-white ${FOCUS_RING}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/55">
            Independent research and news project.
          </p>
          <p className="text-xs text-white/55">
            &copy; {year} Immortality Countdown. For informational purposes
            only. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
