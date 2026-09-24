import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articles } from "../data/articles";
import { buildNewsRss } from "./rss";

describe("news RSS", () => {
  it("omits draft articles and does not use the paper date as pubDate", () => {
    const drafts = articles.filter((article) => !article.sitePublishedAt);
    if (drafts.length === 0) {
      const rss = buildNewsRss("en", articles.map((article) => ({ ...article, sitePublishedAt: undefined })));
      assert.equal(rss.includes("<item>"), false);
      return;
    }
    const article = drafts[0];
    const rss = buildNewsRss("en", drafts);
    assert.equal(rss.includes("<item>"), false);
    assert.equal(rss.includes("<pubDate>"), false);
    assert.equal(
      rss.includes(new Date(article.sourcePublishedAt).toUTCString()),
      false,
    );
    assert.match(rss, /Selected longevity research updates/);
  });

  it("emits pubDate only from sitePublishedAt for published articles", () => {
    const published = {
      ...articles[0],
      sitePublishedAt: "2026-09-10T00:00:00Z",
      draftCreatedAt: "2026-09-09T00:00:00Z",
    };
    const rss = buildNewsRss("en", [published, articles[0]]);
    assert.equal([...rss.matchAll(/<item>/g)].length, 1);
    assert.ok(rss.includes(new Date("2026-09-10T00:00:00Z").toUTCString()));
    assert.equal(
      rss.includes(new Date(published.sourcePublishedAt).toUTCString()),
      false,
    );
    assert.equal(
      rss.includes(new Date("2026-09-09T00:00:00Z").toUTCString()),
      false,
    );
  });
});
