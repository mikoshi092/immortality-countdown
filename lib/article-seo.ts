import type { Article } from "@/data/articles";
import type { SiteLocale } from "@/lib/locale";
import { PUBLISHER, SITE_NAME, SITE_URL } from "@/lib/site";

export function articlePath(locale: SiteLocale, slug: string): string {
  return locale === "ja" ? `/ja/news/${slug}` : `/news/${slug}`;
}

export function newsIndexPath(locale: SiteLocale): string {
  return locale === "ja" ? "/ja/news" : "/news";
}

export function newsRssPath(locale: SiteLocale): string {
  return locale === "ja" ? "/ja/news/rss.xml" : "/news/rss.xml";
}

export function articleCanonical(locale: SiteLocale, slug: string): string {
  return `${SITE_URL}${articlePath(locale, slug)}`;
}

export function newsIndexCanonical(locale: SiteLocale): string {
  return `${SITE_URL}${newsIndexPath(locale)}`;
}

export function articleHreflang(slug: string) {
  return {
    en: articlePath("en", slug),
    ja: articlePath("ja", slug),
    "x-default": articlePath("en", slug),
  };
}

export function newsIndexHreflang() {
  return {
    en: newsIndexPath("en"),
    ja: newsIndexPath("ja"),
    "x-default": newsIndexPath("en"),
  };
}

export function articleJsonLd(article: Article, locale: SiteLocale) {
  const copy = article[locale];
  const url = articleCanonical(locale, article.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article" as const,
    headline: copy.headline,
    description: copy.dek,
    ...(article.sitePublishedAt
      ? { datePublished: article.sitePublishedAt }
      : {}),
    ...(article.siteModifiedAt ? { dateModified: article.siteModifiedAt } : {}),
    inLanguage: locale === "ja" ? "ja" : "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Person",
      name: PUBLISHER.name,
      url: PUBLISHER.url,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** Open Graph article dates. Omit until production publish. */
export function articleOpenGraphDates(article: Article) {
  return {
    ...(article.sitePublishedAt
      ? { publishedTime: article.sitePublishedAt }
      : {}),
    ...(article.siteModifiedAt
      ? { modifiedTime: article.siteModifiedAt }
      : {}),
  };
}
