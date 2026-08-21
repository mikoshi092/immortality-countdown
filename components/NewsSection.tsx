"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NewsItem } from "@/data/news";
import { FIELD_IDS, FIELD_SHORT_LABELS, type FieldId } from "@/lib/fields";
import { FOCUS_RING } from "@/lib/nav";
import NewsCard from "./NewsCard";

// Filtering is by fieldId, i.e. the site's one canonical taxonomy. There used
// to be a separate six-value `NewsCategory` union here that had already
// drifted from the eight field slugs; keeping both would have guaranteed they
// diverged again once ingest was automated. If a different axis is needed
// later (Clinical Trial / Paper / Regulatory / Company), add a purpose-named
// `contentType` — do not bring back a general `category`.
type Filter = FieldId | "All";

// Only the filter needs client state — `items` is passed in from the
// server-rendered page and should already exclude the featured item.
export default function NewsSection({ items }: { items: NewsItem[] }) {
  const [selected, setSelected] = useState<Filter>("All");

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    [items]
  );

  // Only offer a chip for a field that actually has something behind it.
  const availableFields = useMemo(
    () => FIELD_IDS.filter((id) => items.some((item) => item.fieldId === id)),
    [items]
  );

  const filtered =
    selected === "All" ? sorted : sorted.filter((item) => item.fieldId === selected);

  const isEmpty = items.length === 0;

  return (
    <section id="latest-news" className="scroll-mt-20 px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
          Latest Verified Updates
        </h2>

        {isEmpty ? (
          // An empty list used to render the full chip row plus "No additional
          // stories in this category yet", which implied stories existed
          // elsewhere. Say what is actually true instead.
          <div className="mt-5 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-base leading-7 text-[#17202a]/70">
              Verified research updates are being prepared. Every entry must
              link to a source that has been checked before it appears here.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#17202a]/55">
              In the meantime, the LEV model and its published assumptions are
              already available for inspection.
            </p>
            <Link
              href="/model"
              className={`mt-4 inline-block border-b border-[#2f766d] pb-1 text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              See how the countdown is calculated →
            </Link>
          </div>
        ) : (
          <>
            <div
              role="group"
              aria-label="Filter updates by research field"
              className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1"
            >
              {(["All", ...availableFields] as Filter[]).map((value) => {
                const isActive = value === selected;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelected(value)}
                    aria-pressed={isActive}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${FOCUS_RING} ${
                      isActive
                        ? "border-[#141413] bg-[#141413] text-white"
                        : "border-black/15 bg-white text-[#17202a]/70"
                    }`}
                  >
                    {value === "All" ? "All" : FIELD_SHORT_LABELS[value]}
                  </button>
                );
              })}
            </div>

            {filtered.length > 0 ? (
              <div className="mt-6 space-y-4">
                {filtered.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#17202a]/45">
                No updates in this field yet.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
