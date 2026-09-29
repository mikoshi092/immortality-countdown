import { isPublishedArticle, type Article } from "@/data/articles";
import type { SiteLocale } from "@/lib/locale";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  articleCanonical,
  newsIndexCanonical,
  newsRssPath,
} from "@/lib/article-seo";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildNewsRss(locale: SiteLocale, articles: Article[]): string {
  const published = articles.filter(isPublishedArticle);
  const title =
    locale === "ja"
      ? `${SITE_NAME} 最新研究`
      : `${SITE_NAME} Latest News`;
  const description =
    locale === "ja"
      ? "長寿研究の更新情報を、要点と限界に分けて紹介します。詳細は各記事末尾の一次資料をご確認ください。"
      : "Selected longevity research updates. Read the article, then the primary source.";
  const channelLink = newsIndexCanonical(locale);
  const rssLink = `${SITE_URL}${newsRssPath(locale)}`;

  const items = published
    .map((article) => {
      const copy = article[locale];
      return `    <item>
      <title>${xmlEscape(copy.headline)}</title>
      <link>${xmlEscape(articleCanonical(locale, article.slug))}</link>
      <guid isPermaLink="true">${xmlEscape(articleCanonical(locale, article.slug))}</guid>
      <pubDate>${new Date(article.sitePublishedAt).toUTCString()}</pubDate>
      <description>${xmlEscape(copy.dek)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(channelLink)}</link>
    <description>${xmlEscape(description)}</description>
    <language>${locale === "ja" ? "ja" : "en"}</language>
    <atom:link href="${xmlEscape(rssLink)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
