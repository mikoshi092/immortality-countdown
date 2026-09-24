import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import ArticleView from "@/components/ArticleView";
import { listArticles, getArticleBySlug } from "@/data/articles";
import {
  articleHreflang,
  articleJsonLd,
  articleOpenGraphDates,
} from "@/lib/article-seo";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";

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
    title: `${article.en.headline} | Immortality Countdown`,
    description: article.en.dek,
    alternates: {
      canonical: `/news/${article.slug}`,
      languages: articleHreflang(article.slug),
    },
    openGraph: {
      title: article.en.headline,
      description: article.en.dek,
      type: "article",
      url: `${SITE_URL}/news/${article.slug}`,
      ...articleOpenGraphDates(article),
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleJsonLd(article, "en")),
        }}
      />
      <SiteHeader />
      <BetaBanner />
      <section className="px-5 py-10 sm:px-6 sm:py-12">
        <ArticleView article={article} locale="en" />
      </section>
    </main>
  );
}
