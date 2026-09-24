import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articles, articleSitemapDate } from "../data/articles";
import { ARTICLE_UI } from "./article-copy";
import { PUBLISHER } from "./site";
import {
  articleCanonical,
  articleHreflang,
  articleJsonLd,
  articleOpenGraphDates,
  articlePath,
  newsIndexHreflang,
  newsIndexPath,
  newsRssPath,
} from "./article-seo";

describe("empty news index copy", () => {
  it("states the publication criteria in English and Japanese", () => {
    assert.equal(
      ARTICLE_UI.en.listEmpty,
      "No research updates currently meet the publication criteria.",
    );
    assert.equal(
      ARTICLE_UI.ja.listEmpty,
      "現在、公開基準を満たす新しい研究情報はありません。",
    );
  });
});

describe("article SEO helpers", () => {
  const article = articles[0];

  it("builds paired canonical and hreflang URLs", () => {
    assert.equal(articlePath("en", article.slug), `/news/${article.slug}`);
    assert.equal(articlePath("ja", article.slug), `/ja/news/${article.slug}`);
    assert.deepEqual(articleHreflang(article.slug), {
      en: `/news/${article.slug}`,
      ja: `/ja/news/${article.slug}`,
      "x-default": `/news/${article.slug}`,
    });
    assert.deepEqual(newsIndexHreflang(), {
      en: "/news",
      ja: "/ja/news",
      "x-default": "/news",
    });
    assert.equal(newsIndexPath("en"), "/news");
    assert.equal(newsIndexPath("ja"), "/ja/news");
    assert.equal(newsRssPath("en"), "/news/rss.xml");
    assert.equal(newsRssPath("ja"), "/ja/news/rss.xml");
  });

  it("omits JSON-LD and Open Graph publish dates until production publish", () => {
    const unpublished = { ...article, sitePublishedAt: undefined, siteModifiedAt: undefined };
    const json = articleJsonLd(unpublished, "en");
    assert.equal(json["@type"], "Article");
    assert.equal(json.headline, unpublished.en.headline);
    assert.equal("datePublished" in json, false);
    assert.equal("dateModified" in json, false);
    assert.equal("author" in json, false);
    assert.equal(json.publisher.name, PUBLISHER.name);
    assert.equal(json.mainEntityOfPage["@id"], articleCanonical("en", unpublished.slug));
    assert.equal(json.inLanguage, "en");
    assert.deepEqual(articleOpenGraphDates(unpublished), {});
    assert.equal(articleSitemapDate(unpublished), undefined);

    const ja = articleJsonLd(unpublished, "ja");
    assert.equal(ja.headline, unpublished.ja.headline);
    assert.equal("datePublished" in ja, false);
    assert.equal("dateModified" in ja, false);
    assert.equal("author" in ja, false);
    assert.equal(ja.inLanguage, "ja");
  });

  it("uses sitePublishedAt only when the article is production-published", () => {
    const published = {
      ...article,
      sitePublishedAt: "2026-09-10T00:00:00Z",
      siteModifiedAt: "2026-09-11T00:00:00Z",
      draftCreatedAt: "2026-09-09T00:00:00Z",
    };
    const json = articleJsonLd(published, "en");
    assert.equal(json.datePublished, "2026-09-10T00:00:00Z");
    assert.equal(json.dateModified, "2026-09-11T00:00:00Z");
    assert.notEqual(json.datePublished, published.sourcePublishedAt);
    assert.notEqual(json.datePublished, published.draftCreatedAt);
    assert.deepEqual(articleOpenGraphDates(published), {
      publishedTime: "2026-09-10T00:00:00Z",
      modifiedTime: "2026-09-11T00:00:00Z",
    });
  });
});
