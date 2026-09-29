import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import Hero from "@/components/Hero";
import ReadinessCard from "@/components/ReadinessCard";
import NewsCard from "@/components/NewsCard";
import NewsSection from "@/components/NewsSection";
import FieldsProgress from "@/components/FieldsProgress";
import { newsItems } from "@/data/news";

/**
 * The root layout already sets `canonical: "/"`, but a page-level
 * `alternates` object replaces the inherited one wholesale, so the
 * canonical has to be restated alongside the languages.
 *
 * This pairing exists between / and /ja. News list and article pages
 * declare their own pairs. /model, /fields and the rest still declare
 * `canonical` and no `languages`, which is what keeps them from
 * advertising Japanese versions that do not exist.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ja: "/ja",
      "x-default": "/",
    },
  },
};

export default function Home() {
  const featuredItem = newsItems.find((item) => item.featured);
  const listItems = newsItems.filter((item) => !item.featured);

  return (
    <main id="top" className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />
      <Hero />
      <ReadinessCard />
      <FieldsProgress />

      {featuredItem && (
        <section className="px-5 pt-8 pb-2 sm:px-6 sm:pt-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
              Latest Signal
            </h2>
            <div className="mt-5">
              <NewsCard item={featuredItem} />
            </div>
          </div>
        </section>
      )}

      <NewsSection items={listItems} />
    </main>
  );
}
