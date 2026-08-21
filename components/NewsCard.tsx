import Link from "next/link";
import type { NewsItem } from "@/data/news";
import { FIELD_LABELS } from "@/lib/fields";
import { FOCUS_RING } from "@/lib/nav";

// Shared presentational card, used both for the featured item and for the
// list. `item.featured` only changes sizing, not layout.
//
// The two demo affordances that used to live here are gone:
//   - an unconditional "Demo content · Not a real news report" badge, which
//     would have labelled real reporting as fake;
//   - an `item.sourceUrl === "#"` branch, which the type system now proves
//     unreachable (tsc reports the comparison has no overlap).
export default function NewsCard({ item }: { item: NewsItem }) {
  const isFeatured = item.featured;

  return (
    <article
      className={`rounded-lg border border-black/10 bg-white shadow-sm ${
        isFeatured ? "p-5 sm:p-6" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#17202a]/50">
        <Link
          href={`/fields/${item.fieldId}`}
          className={`text-[#2f766d] hover:underline ${FOCUS_RING}`}
        >
          {FIELD_LABELS[item.fieldId]}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{item.evidence}</span>
        <span aria-hidden="true">·</span>
        {/* Deliberately not toLocaleDateString(): this card renders inside a
            client component, and locale-dependent formatting differs between
            server and client, which produces a hydration mismatch. Slicing the
            ISO string is deterministic everywhere. */}
        <time dateTime={item.publishedAt}>{item.publishedAt.slice(0, 10)}</time>
      </div>

      <h3
        className={`mt-2 font-semibold text-[#17202a] ${
          isFeatured ? "text-lg sm:text-xl" : "text-base sm:text-lg"
        }`}
      >
        {item.headline}
      </h3>

      <dl className="mt-3 space-y-2.5">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            What happened
          </dt>
          <dd className="mt-0.5 text-sm leading-6 text-[#17202a]/75">
            {item.whatHappened}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            What it means
          </dt>
          <dd className="mt-0.5 text-sm leading-6 text-[#17202a]/75">
            {item.whatItMeans}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            Caveat
          </dt>
          <dd className="mt-0.5 text-sm leading-6 text-[#17202a]/60 italic">
            {item.caveat}
          </dd>
        </div>
      </dl>

      <a
        href={item.sourceUrl}
        rel="noopener noreferrer"
        target="_blank"
        className={`mt-4 inline-block text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
      >
        {item.sourceLabel} →
      </a>
      {item.doi ? (
        <span className="mt-4 ml-3 inline-block text-xs text-[#17202a]/40">
          DOI {item.doi}
        </span>
      ) : null}
    </article>
  );
}
