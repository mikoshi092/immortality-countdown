import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ArticleTeaser from "@/components/ArticleTeaser";
import { listArticles } from "@/data/articles";
import { ARTICLE_UI } from "@/lib/article-copy";
import { FOCUS_RING } from "@/lib/nav";
import { newsIndexHreflang, newsRssPath } from "@/lib/article-seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "最新研究 | Immortality Countdown";
const description =
  "長寿研究の更新情報を、要点と限界に分けて紹介します。詳細は各記事末尾の一次資料をご確認ください。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/ja/news",
    languages: newsIndexHreflang(),
    types: {
      "application/rss+xml": newsRssPath("ja"),
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/ja/news`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
};

export default function JapaneseNewsIndexPage() {
  const articles = listArticles();
  const ui = ARTICLE_UI.ja;

  return (
    <main lang="ja" className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <JaNewsBanner />
      <section className="px-5 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-ja-serif text-[clamp(1.5rem,4.6vw,2.2rem)] font-medium leading-[1.45] text-[#17202a]">
            {ui.listTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-pretty text-[15px] leading-8 text-[#17202a]/75 sm:text-base sm:leading-9">
            {ui.listDek}
          </p>
          <p className="mt-3 text-sm">
            <Link
              href={newsRssPath("ja")}
              className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              {ui.rssLabel} →
            </Link>
          </p>
          <div className="mt-8 space-y-4">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleTeaser key={article.id} article={article} locale="ja" />
              ))
            ) : (
              <p className="text-[15px] leading-8 text-[#17202a]/75 sm:text-base sm:leading-9">
                {ui.listEmpty}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function JaNewsBanner() {
  return (
    <div className="border-b border-white/10 bg-[#141413]">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#2f766d]" />
          <span className="text-[11px] font-bold tracking-[0.14em] text-white/90">
            PUBLIC BETA
          </span>
        </span>
        <p className="text-[11px] font-medium leading-4 text-white/55 sm:text-xs">
          カウントダウンのモデルは開発中です。各スコアはモデルへの入力値であり、
          根拠の見直しにあわせて変わります。
        </p>
      </div>
    </div>
  );
}
