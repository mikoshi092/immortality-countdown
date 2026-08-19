import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import { fieldProgress } from "@/data/fields";

export const metadata: Metadata = {
  title: "Eight Fields of Progress | Immortality Countdown",
  description:
    "Why longevity escape velocity depends on eight combined research fields, not one breakthrough — with provisional scores where available and Score pending status for the rest.",
  alternates: {
    canonical: "/fields",
  },
};

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

export default function FieldsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />

      <article className="px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className={`inline-block text-sm font-medium text-[#17202a]/60 transition-colors hover:text-[#17202a] ${FOCUS_RING}`}
          >
            ← Back to dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
            Eight Fields · Provisional
          </p>

          <h1 className="mt-3 font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[#17202a] sm:text-5xl">
            The Eight Fields of Progress
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#17202a]/70">
            Longevity escape velocity isn&apos;t expected to come from a
            single invention. It&apos;s a concept about combined progress —
            multiple research fields advancing together until, together,
            they outpace aging faster than any one of them could alone.
            This page breaks that idea down into the eight fields this
            site currently tracks.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#17202a]/55">
            This eight-field breakdown is a provisional, site-specific
            classification used to organize the countdown&apos;s tracked
            progress. It is not an official classification recognized by
            the scientific community, and it may be revised.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#17202a]/55">
            <Link href="/methodology" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
              Read the full methodology →
            </Link>
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {fieldProgress.map((field, index) => (
              <Link
                key={field.slug}
                href={`/fields/${field.slug}`}
                className={`block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-colors hover:border-[#2f766d]/40 ${FOCUS_RING}`}
              >
                <p className="text-xs font-semibold text-[#17202a]/40">
                  Field {index + 1} of {fieldProgress.length}
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#17202a] sm:text-lg">
                  {field.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#17202a]/70">
                  {field.description}
                </p>
                {field.status === "provisional" ? (
                  <p className="mt-3 text-sm font-semibold text-[#2f766d]">
                    Provisional score: {field.score} / 100
                  </p>
                ) : (
                  <span className="mt-3 inline-block rounded-full border border-black/15 bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#17202a]/55">
                    Score pending
                  </span>
                )}
                <p className="mt-3 text-sm font-semibold text-[#2f766d]">
                  Read more →
                </p>
              </Link>
            ))}
          </div>

          <p className="mt-10 border-t border-black/10 pt-6 text-sm text-[#17202a]/50">
            For informational purposes only. Not medical advice.
          </p>
        </div>
      </article>
    </main>
  );
}
