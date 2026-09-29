import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ArticleView from "@/components/ArticleView";
import { listArticles, getArticleBySlug } from "@/data/articles";
import {
  articleHreflang,
  articleJsonLd,
  articleOpenGraphDates,
} from "@/lib/article-seo";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return listArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.ja.headline} | Immortality Countdown`,
    description: article.ja.dek,
    alternates: {
      canonical: `/ja/news/${article.slug}`,
      languages: articleHreflang(article.slug),
    },
    openGraph: {
      title: article.ja.headline,
      description: article.ja.dek,
      type: "article",
      url: `${SITE_URL}/ja/news/${article.slug}`,
      siteName: SITE_NAME,
      locale: "ja_JP",
      ...articleOpenGraphDates(article),
    },
  };
}

export default async function JapaneseNewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main lang="ja" className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleJsonLd(article, "ja")),
        }}
      />
      <SiteHeader />
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
      <section className="px-5 py-10 sm:px-6 sm:py-12">
        <ArticleView article={article} locale="ja" />
      </section>
    </main>
  );
}
