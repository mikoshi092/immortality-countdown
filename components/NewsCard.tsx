import Link from "next/link";
import type { NewsItem } from "@/data/news";
import { FIELD_LABELS } from "@/lib/fields";
import { FOCUS_RING } from "@/lib/nav";

// Shared presentational card, used both for the featured item and for the
// list. `item.featured` only changes sizing, not layout.
//
// Homepage and list cards now send readers to the on-site article first.
// The primary source lives on the article page.
export default function NewsCard({ item }: { item: NewsItem }) {
  const isFeatured = item.featured;
  const href = `/news/${item.slug}`;

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
        <Link href={href} className={`hover:underline ${FOCUS_RING}`}>
          {item.headline}
        </Link>
      </h3>

      <p
        className={`mt-2 leading-6 text-[#17202a]/70 ${
          isFeatured ? "text-sm sm:text-base" : "text-sm"
        }`}
      >
        {item.dek}
      </p>

      <Link
        href={href}
        className={`mt-4 inline-block text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
      >
        Read the article →
      </Link>
    </article>
  );
}
