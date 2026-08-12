import type { NewsItem } from "@/data/news";

// Shared presentational card used for both the TODAY'S SIGNAL item and
// the LATEST NEWS list. `item.featured` only changes sizing, not layout.
export default function NewsCard({ item }: { item: NewsItem }) {
  const isFeatured = item.featured;

  return (
    <article
      className={`rounded-lg border border-black/10 bg-white shadow-sm ${
        isFeatured ? "p-5 sm:p-6" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#17202a]/50">
        <span>{item.field}</span>
        <span aria-hidden="true">·</span>
        <span>{item.evidence}</span>
        <span aria-hidden="true">·</span>
        <span>{item.timeLabel}</span>
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

      {item.sourceUrl === "#" ? (
        <p className="mt-4 text-sm font-medium text-[#17202a]/40">
          Source pending
        </p>
      ) : (
        <a
          href={item.sourceUrl}
          className="mt-4 inline-block text-sm font-semibold text-[#2f766d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
        >
          {item.sourceLabel} →
        </a>
      )}
    </article>
  );
}
