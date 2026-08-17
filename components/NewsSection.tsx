"use client";

import { useMemo, useState } from "react";
import type { NewsCategory, NewsItem } from "@/data/news";
import NewsCard from "./NewsCard";

const CATEGORIES: (NewsCategory | "All")[] = [
  "All",
  "Rejuvenation",
  "Biomarkers",
  "Trials",
  "AI Drug Discovery",
  "Gene Therapy",
  "Enabling Tech",
];

// Only the category filter needs client state — `items` is passed in
// from the server-rendered page and should already exclude whichever
// item is shown separately as TODAY'S SIGNAL.
export default function NewsSection({ items }: { items: NewsItem[] }) {
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>("All");

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    [items]
  );

  const filtered =
    selected === "All" ? sorted : sorted.filter((item) => item.category === selected);

  return (
    <section
      id="latest-news"
      data-nosnippet=""
      className="scroll-mt-20 px-5 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
          Prototype News Feed
        </h2>

        <div
          role="group"
          aria-label="Filter latest news by category"
          className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1"
        >
          {CATEGORIES.map((category) => {
            const isActive = category === selected;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelected(category)}
                aria-pressed={isActive}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d] ${
                  isActive
                    ? "border-[#141413] bg-[#141413] text-white"
                    : "border-black/15 bg-white text-[#17202a]/70"
                }`}
              >
                {category}
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
            No additional stories in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
