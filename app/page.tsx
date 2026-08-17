import MobileHeader from "@/components/MobileHeader";
import BetaBanner from "@/components/BetaBanner";
import Hero from "@/components/Hero";
import ReadinessCard from "@/components/ReadinessCard";
import NewsCard from "@/components/NewsCard";
import NewsSection from "@/components/NewsSection";
import FieldsProgress from "@/components/FieldsProgress";
import { newsItems } from "@/data/news";

export default function Home() {
  const featuredItem = newsItems.find((item) => item.featured);
  const listItems = newsItems.filter((item) => !item.featured);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <MobileHeader />
      <BetaBanner />
      <Hero />
      <ReadinessCard />
      <FieldsProgress />

      {featuredItem && (
        <section
          data-nosnippet=""
          className="px-5 pt-8 pb-2 sm:px-6 sm:pt-10"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
              Prototype Signal
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
