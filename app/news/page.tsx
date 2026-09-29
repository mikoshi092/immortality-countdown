import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import ArticleTeaser from "@/components/ArticleTeaser";
import { listArticles } from "@/data/articles";
import { ARTICLE_UI } from "@/lib/article-copy";
import { FOCUS_RING } from "@/lib/nav";
import { newsIndexHreflang, newsRssPath } from "@/lib/article-seo";

export const metadata: Metadata = {
  title: "Latest News | Immortality Countdown",
  description:
    "Selected longevity research updates. Read the article here, then open the primary source.",
  alternates: {
    canonical: "/news",
    languages: newsIndexHreflang(),
    types: {
      "application/rss+xml": newsRssPath("en"),
    },
  },
};

export default function NewsIndexPage() {
  const articles = listArticles();
  const ui = ARTICLE_UI.en;

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />
      <section className="px-5 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
            {ui.listTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#17202a]/70">{ui.listDek}</p>
          <p className="mt-3 text-sm">
            <Link
              href={newsRssPath("en")}
              className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              {ui.rssLabel} →
            </Link>
          </p>
          <div className="mt-8 space-y-4">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleTeaser key={article.id} article={article} locale="en" />
              ))
            ) : (
              <p className="text-base leading-7 text-[#17202a]/70">{ui.listEmpty}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
