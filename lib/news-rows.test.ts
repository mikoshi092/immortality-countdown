import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articles, type Article } from "../data/articles";
import {
  isEnglishSourceArticle,
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
// The manually added Bloomberg record (PR #64): one host serves both
// editions, and the registry marks Bloomberg Japan as a Japanese
// source, so the record resolves as Japanese.
const jpBloomberg = mediaArticle({
  id: "jp-bloomberg",
  slug: "jp-bloomberg",
  sourceUrl: "https://www.bloomberg.com/jp/news/articles/2026-11-05/TO083JT9NJLU00",
  sourceLabel: "ブルームバーグ",
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
    assert.equal(isEnglishSourceArticle(enDaily), true);
    assert.equal(isEnglishSourceArticle(jpGigazine), false);
    assert.equal(sourceLanguageFor(jpBloomberg), "ja");
  });

  it("keeps the no-locale default exactly as before", () => {
    const expected = ["jp-gigazine", "jp-portal", "en-daily"];
    assert.deepEqual(newsFaceArticles(all).map((a) => a.id), expected);
  });

  it("shows only English-source items on the English face", () => {
    const expected = ["en-daily"];
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

  it("keeps the Bloomberg Japan record on the Japanese face only", () => {
    const withBloomberg = [...all, jpBloomberg];
    assert.deepEqual(newsFaceArticles(withBloomberg, "ja").map((a) => a.id), [
      "jp-gigazine",
      "jp-portal",
      "jp-bloomberg",
    ]);
    assert.deepEqual(newsFaceArticles(withBloomberg, "en").map((a) => a.id), ["en-daily"]);
    assert.deepEqual(
      toNewsRows(withBloomberg, "en", now).map((row) => row.key),
      ["en-daily"],
    );
    assert.deepEqual(
      toNewsRows(withBloomberg, "ja", now).map((row) => row.key),
      ["jp-gigazine", "jp-portal", "jp-bloomberg"],
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
