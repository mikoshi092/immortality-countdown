import type { MetadataRoute } from "next";
import { listArticles, articleSitemapDate } from "@/data/articles";
import { fieldProgress } from "@/data/fields";
import params from "@/lev/params.json";
import { SITE_URL } from "@/lib/site";
import { articleCanonical, newsIndexCanonical } from "@/lib/article-seo";

/**
 * lastModified is omitted unless that specific URL has a dated source.
 * Do not reuse one editorial constant across unrelated pages.
 *
 * - `/` and `/model` use the published model review date.
 * - `/fields/[slug]` uses that field's lastReviewed date in params.json.
 * - Published article URLs use sitePublishedAt / siteModifiedAt.
 * - News indexes use the latest published article site date, if any.
 * - Hand-written pages without a page-specific date omit lastModified.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const modelReviewed = new Date(params.publishedAt);

  const fieldReviewDate = (slug: string) => {
    const entry = params.fields.find((f) => f.id === slug);
    return entry ? new Date(entry.lastReviewed) : undefined;
  };

  const localePair = {
    languages: {
      en: SITE_URL,
      ja: `${SITE_URL}/ja`,
      "x-default": SITE_URL,
    },
  };

  const newsPair = {
    languages: {
      en: newsIndexCanonical("en"),
      ja: newsIndexCanonical("ja"),
      "x-default": newsIndexCanonical("en"),
    },
  };

  const published = listArticles();
  const newsUpdated = published
    .map((article) => articleSitemapDate(article)?.getTime() ?? 0)
    .reduce((latest, time) => Math.max(latest, time), 0);
  const newsLastModified = newsUpdated > 0 ? new Date(newsUpdated) : undefined;

  return [
    { url: SITE_URL, lastModified: modelReviewed, alternates: localePair },
    {
      url: `${SITE_URL}/ja`,
      alternates: localePair,
    },
    { url: `${SITE_URL}/methodology` },
    { url: `${SITE_URL}/model`, lastModified: modelReviewed },
    { url: `${SITE_URL}/fields` },
    { url: `${SITE_URL}/about` },
    {
      url: newsIndexCanonical("en"),
      ...(newsLastModified ? { lastModified: newsLastModified } : {}),
      alternates: newsPair,
    },
    {
      url: newsIndexCanonical("ja"),
      ...(newsLastModified ? { lastModified: newsLastModified } : {}),
      alternates: newsPair,
    },
    ...published.flatMap((article) => {
      const lastModified = articleSitemapDate(article);
      const pair = {
        languages: {
          en: articleCanonical("en", article.slug),
          ja: articleCanonical("ja", article.slug),
          "x-default": articleCanonical("en", article.slug),
        },
      };
      return [
        {
          url: articleCanonical("en", article.slug),
          ...(lastModified ? { lastModified } : {}),
          alternates: pair,
        },
        {
          url: articleCanonical("ja", article.slug),
          ...(lastModified ? { lastModified } : {}),
          alternates: pair,
        },
      ];
    }),
    ...fieldProgress.map((field) => {
      const lastModified = fieldReviewDate(field.slug);
      return {
        url: `${SITE_URL}/fields/${field.slug}`,
        ...(lastModified ? { lastModified } : {}),
      };
    }),
  ];
}
