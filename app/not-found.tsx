import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import { FOCUS_RING } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Page not found | Immortality Countdown",
  description: "This URL is not a published page on Immortality Countdown.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {},
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />
      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d]">
            404
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[#17202a] sm:text-5xl">
            This page is not published
          </h1>
          <p className="mt-6 text-base leading-7 text-[#17202a]/70">
            The address you opened is not one of the public pages on this
            site.
          </p>
          <p className="mt-8 text-sm">
            <Link
              href="/"
              className={`font-semibold text-[#2f766d] hover:underline ${FOCUS_RING}`}
            >
              Back to the countdown
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
