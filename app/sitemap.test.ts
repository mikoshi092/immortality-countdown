import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articles } from "../data/articles";
import { articleCanonical, newsIndexCanonical } from "../lib/article-seo";
import { SITE_URL } from "../lib/site";
import params from "../lev/params.json";
import sitemap from "./sitemap";

const here = dirname(fileURLToPath(import.meta.url));

describe("sitemap article dates", () => {
  it("omits unpublished articles entirely and does not use paper dates", () => {
    const entries = sitemap();
    for (const article of articles) {
      for (const locale of ["en", "ja"] as const) {
        const entry = entries.find(
          (item) => item.url === articleCanonical(locale, article.slug),
        );
        if (!article.sitePublishedAt) {
          assert.equal(entry, undefined, `draft ${article.slug} leaked into sitemap`);
        } else {
          assert.ok(entry, `published ${article.slug} missing from sitemap`);
          assert.ok(entry?.lastModified);
          assert.equal(
            new Date(entry.lastModified as Date | string).toISOString(),
            new Date(article.sitePublishedAt).toISOString(),
          );
          assert.notEqual(
            new Date(entry.lastModified as Date | string).getTime(),
            new Date(article.sourcePublishedAt).getTime(),
          );
        }
      }
    }

    const newsEn = entries.find((item) => item.url === newsIndexCanonical("en"));
    const newsJa = entries.find((item) => item.url === newsIndexCanonical("ja"));
    assert.equal(newsEn?.lastModified, undefined);
    assert.equal(newsJa?.lastModified, undefined);
  });

  it("does not apply one blanket lastModified across unrelated pages", () => {
    const src = readFileSync(join(here, "sitemap.ts"), "utf8");
    assert.equal(src.includes("CONTENT_UPDATED"), false);

    const entries = sitemap();
    const modelReviewed = new Date(params.publishedAt).getTime();
    const home = entries.find((item) => item.url === SITE_URL);
    const model = entries.find((item) => item.url === `${SITE_URL}/model`);
    const methodology = entries.find((item) => item.url === `${SITE_URL}/methodology`);
    const about = entries.find((item) => item.url === `${SITE_URL}/about`);
    const fields = entries.find((item) => item.url === `${SITE_URL}/fields`);
    const ja = entries.find((item) => item.url === `${SITE_URL}/ja`);

    assert.equal(home?.lastModified && new Date(home.lastModified).getTime(), modelReviewed);
    assert.equal(model?.lastModified && new Date(model.lastModified).getTime(), modelReviewed);
    assert.equal(methodology?.lastModified, undefined);
    assert.equal(about?.lastModified, undefined);
    assert.equal(fields?.lastModified, undefined);
    assert.equal(ja?.lastModified, undefined);
  });
});
