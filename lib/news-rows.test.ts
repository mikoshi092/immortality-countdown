import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articles, type Article } from "../data/articles";
import {
  isJapaneseSourceArticle,
  newsFaceArticles,
  sourceLanguageFor,
  toNewsRows,
  topStoryRows,
} from "./news-rows";

// Fixtures are the first catalog record re-pointed at media sources;
// only the fields the news face reads (contentType, sourceUrl,
// sourceLabel) are meaningful here.
const base = articles[0];

function mediaArticle(overrides: Partial<Article>): Article {
  return { ...base, contentType: "science-news", ...overrides };
}

const jpGigazine = mediaArticle({
  id: "jp-gigazine",
  slug: "jp-gigazine",
  sourceUrl: "https://gigazine.net/news/20261104-aging-cells/",
  sourceLabel: "GIGAZINE",
});
const jpPortal = mediaArticle({
  id: "jp-portal",
  slug: "jp-portal",
  sourceUrl: "https://scienceportal.jst.go.jp/newsflash/20261104_n01/",
  sourceLabel: "サイエンスポータル",
});
const enDaily = mediaArticle({
  id: "en-daily",
  slug: "en-daily",
  sourceUrl: "https://www.sciencedaily.com/releases/2026/11/261104100000.htm",
  sourceLabel: "ScienceDaily",
});
const jpPaper = mediaArticle({
  id: "jp-paper",
  slug: "jp-paper",
  contentType: "paper",
  sourceUrl: "https://www.riken.jp/press/2026/20261104_1/index.html",
  sourceLabel: "理化学研究所",
});
const all = [jpGigazine, jpPortal, enDaily, jpPaper];
const now = new Date("2026-11-04T12:00:00Z");

describe("news-face language policy", () => {
  it("resolves an article's language from its source URL", () => {
    assert.equal(sourceLanguageFor(jpGigazine), "ja");
    assert.equal(sourceLanguageFor(jpPortal), "ja");
    assert.equal(sourceLanguageFor(jpPaper), "ja");
    assert.equal(sourceLanguageFor(enDaily), "en");
    assert.equal(
      sourceLanguageFor(mediaArticle({ sourceUrl: "https://example.com/news/aging" })),
      "en",
    );
    assert.equal(isJapaneseSourceArticle(jpGigazine), true);
    assert.equal(isJapaneseSourceArticle(enDaily), false);
  });

  it("keeps the default and English faces exactly as before", () => {
    const expected = ["jp-gigazine", "jp-portal", "en-daily"];
    assert.deepEqual(newsFaceArticles(all).map((a) => a.id), expected);
    assert.deepEqual(newsFaceArticles(all, "en").map((a) => a.id), expected);
    assert.deepEqual(
      toNewsRows(all, "en", now).map((row) => row.key),
      expected,
    );
    assert.deepEqual(
      topStoryRows(all, "en", now, 3).map((row) => row.key).sort(),
      [...expected].sort(),
    );
  });

  it("shows only Japanese-source items on the Japanese face", () => {
    const expected = ["jp-gigazine", "jp-portal"];
    assert.deepEqual(newsFaceArticles(all, "ja").map((a) => a.id), expected);
    assert.deepEqual(
      toNewsRows(all, "ja", now).map((row) => row.key),
      expected,
    );
    assert.deepEqual(
      topStoryRows(all, "ja", now, 3).map((row) => row.key).sort(),
      [...expected].sort(),
    );
  });
});
