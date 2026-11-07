import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractDecodeParams,
  extractMetaDescription,
  extractResolvedUrl,
  fetchGoogleNews,
  parseGoogleNewsFeed,
} from "./google-news";
import { parseRssFeed } from "./science-news";
import { deduplicate } from "./normalize";
import { lookbackWindow, type HttpGet } from "./fetch";
import { sourceById } from "./sources";
import type { SourceDefinition } from "./types";

// Fixtures are modelled on the real captures in the design document
// (google-news-keyword-design.md §1/§3): CBM-style opaque links, the
// " - <Publisher>" title suffix, the <source> element, RFC 822 GMT
// dates, a <c-wiz data-p="…"> decode payload, and a batchexecute
// wrb.fr response. They are synthetic, not production articles.

const window = lookbackWindow(new Date("2026-11-06T12:00:00Z"));
const BLOOMBERG_URL =
  "https://www.bloomberg.com/jp/news/articles/2026-11-05/isomorphic-labs-in-talks";
const BLOOMBERG_META =
  "アルファベット傘下のAI創薬企業アイソモーフィック・ラブズは、約50億ドルの資金調達に向けて投資家と協議している。企業価値は約500億ドルと評価される可能性があり、AIを活用した創薬プラットフォームへの大型投資として、世界の製薬・テクノロジー業界から注目を集めている。";

function jaItem({
  token,
  title,
  pubDate,
  publisher,
}: {
  token: string;
  title: string;
  pubDate?: string;
  publisher: string;
}): string {
  return (
    `<item><title>${title} - ${publisher}</title>` +
    `<link>https://news.google.com/rss/articles/${token}?oc=5</link>` +
    `<guid isPermaLink="false">${token}</guid>` +
    (pubDate ? `<pubDate>${pubDate}</pubDate>` : "") +
    `<description>&lt;a href="https://news.google.com/rss/articles/${token}"&gt;${title}&lt;/a&gt; - ${publisher}</description>` +
    `<source url="https://www.bloomberg.com">${publisher}</source></item>`
  );
}

const jaFeed =
  `<rss version="2.0"><channel><title>Google News</title>` +
  jaItem({
    token: "CBMiTESTB1",
    title: "アルファベット傘下のAI創薬アイソモーフィック、7890億円調達で協議",
    pubDate: "Thu, 05 Nov 2026 07:39:00 GMT",
    publisher: "Bloomberg.com",
  }) +
  // Irrelevant: a money word but no field branch.
  jaItem({
    token: "CBMiTESTX1",
    title: "地元のパン店、資金調達に成功",
    pubDate: "Thu, 05 Nov 2026 08:00:00 GMT",
    publisher: "ローカル新聞",
  }) +
  // Relevant but outside the 48h window.
  jaItem({
    token: "CBMiTESTO1",
    title: "老化細胞を除去するセノリティクス企業が資金調達",
    pubDate: "Wed, 01 Oct 2026 07:39:00 GMT",
    publisher: "Bloomberg.com",
  }) +
  // Malformed: no pubDate.
  jaItem({
    token: "CBMiTESTM1",
    title: "AI創薬ベンチャーが大型契約",
    publisher: "Bloomberg.com",
  }) +
  `</channel></rss>`;

function articlePageHtml(token: string, localeArray: unknown, signature = "c2ln"): string {
  const inner = JSON.stringify(["garturlreq", localeArray, token, 1794150000, signature]);
  const outer = JSON.stringify(["Fbv4je", inner, null, "generic"]);
  const dataP = `%.@.${outer}`.replace(/"/g, "&quot;");
  return `<html><head></head><body><c-wiz data-p="${dataP}"></c-wiz></body></html>`;
}

function batchResponse(url: string): string {
  const payload = JSON.stringify(["garturlres", url, 1]);
  const entry = JSON.stringify([["wrb.fr", "Fbv4je", payload, null, null, null, "generic"]]);
  return `)]}'\n\n${entry.length}\n${entry}\n`;
}

function router(
  handlers: Array<{ match: (url: string) => boolean; respond: () => Response }>,
  calls: string[],
): HttpGet {
  return async (url: string) => {
    calls.push(url);
    for (const handler of handlers) {
      if (handler.match(url)) return handler.respond();
    }
    return new Response("not found", { status: 404 });
  };
}

function jaHttpGet(calls: string[], overrides?: { articleHtml?: string; publisher?: () => Response }): HttpGet {
  return router(
    [
      {
        match: (url) => url.startsWith("https://news.google.com/rss/search"),
        respond: () => new Response(jaFeed, { status: 200 }),
      },
      {
        match: (url) => url.startsWith("https://news.google.com/articles/CBMiTESTB1"),
        respond: () =>
          new Response(overrides?.articleHtml ?? articlePageHtml("CBMiTESTB1", ["ja", "JP"]), {
            status: 200,
          }),
      },
      {
        match: (url) => url.includes("batchexecute"),
        respond: () => new Response(batchResponse(BLOOMBERG_URL), { status: 200 }),
      },
      {
        match: (url) => url === BLOOMBERG_URL,
        respond:
          overrides?.publisher ??
          (() =>
            new Response(
              `<html><head><meta name="description" content="${BLOOMBERG_META}"></head></html>`,
              { status: 200 },
            )),
      },
    ],
    calls,
  );
}

const jaSource: SourceDefinition = sourceById("google-news-ja")!;

describe("Google News keyword adapter", () => {
  it("resolves, strips and enriches a keyword item end to end (the flagship shape)", async () => {
    const calls: string[] = [];
    const result = await fetchGoogleNews(jaSource, window, jaHttpGet(calls), {
      queries: ["AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)"],
    });
    assert.equal(result.status, "ok");
    assert.equal(result.records.length, 1);
    const [record] = result.records;
    assert.equal(record.title, "アルファベット傘下のAI創薬アイソモーフィック、7890億円調達で協議");
    assert.equal(record.sourceUrl, BLOOMBERG_URL);
    assert.equal(record.recordId, "isomorphic-labs-in-talks");
    assert.equal(record.hints?.journal, "Bloomberg.com");
    assert.equal(record.abstract, BLOOMBERG_META);
    assert.equal(record.urlOrigin.kind, "source-feed");
    assert.equal(record.urlOrigin.id, "CBMiTESTB1");
    assert.deepEqual(record.studySubjects, []);
    // The irrelevant and out-of-window items were never resolved.
    assert.equal(calls.some((url) => url.includes("CBMiTESTX1")), false);
    assert.equal(calls.some((url) => url.includes("CBMiTESTO1")), false);
    // The malformed item is reported, not thrown.
    assert.ok(result.issues?.some((issue) => issue.kind === "parse" && issue.count === 1));
  });

  it("drops an item whose redirect cannot be resolved and records the issue", async () => {
    const calls: string[] = [];
    const result = await fetchGoogleNews(
      jaSource,
      window,
      jaHttpGet(calls, { articleHtml: "<html><body>no decode parameters</body></html>" }),
      { queries: ["AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)"] },
    );
    assert.equal(result.status, "ok");
    assert.equal(result.records.length, 0);
    assert.ok(
      result.issues?.some((issue) => issue.kind === "resolution-failed" && issue.count === 1),
    );
  });

  it("keeps the record when enrichment cannot fetch the publisher page (paywall shape)", async () => {
    const calls: string[] = [];
    const result = await fetchGoogleNews(
      jaSource,
      window,
      jaHttpGet(calls, { publisher: () => new Response("Forbidden", { status: 403 }) }),
      { queries: ["AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)"] },
    );
    assert.equal(result.records.length, 1);
    // Abstract falls back to the cleaned Google description.
    assert.ok(result.records[0].abstract?.includes("アイソモーフィック"));
  });

  it("stays ok when one query fails; fails only when every query fails", async () => {
    const calls: string[] = [];
    const flaky = router(
      [
        {
          match: (url) => url.includes("badquery"),
          respond: () => new Response("boom", { status: 500 }),
        },
        {
          match: (url) => url.startsWith("https://news.google.com/rss/search"),
          respond: () => new Response(jaFeed, { status: 200 }),
        },
        {
          match: (url) => url.startsWith("https://news.google.com/articles/CBMiTESTB1"),
          respond: () => new Response(articlePageHtml("CBMiTESTB1", ["ja", "JP"]), { status: 200 }),
        },
        {
          match: (url) => url.includes("batchexecute"),
          respond: () => new Response(batchResponse(BLOOMBERG_URL), { status: 200 }),
        },
        {
          match: (url) => url === BLOOMBERG_URL,
          respond: () => new Response("<html><head></head></html>", { status: 200 }),
        },
      ],
      calls,
    );
    const partial = await fetchGoogleNews(jaSource, window, flaky, {
      queries: ["badquery", "AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)"],
    });
    assert.equal(partial.status, "ok");
    assert.equal(partial.records.length, 1);
    assert.ok(partial.issues?.some((issue) => issue.kind === "http" && issue.count === 1));

    const dead: HttpGet = async () => new Response("boom", { status: 503 });
    const failed = await fetchGoogleNews(jaSource, window, dead, { queries: ["a", "b"] });
    assert.equal(failed.status, "failed");
    assert.equal(failed.ok, false);
    assert.equal(failed.records.length, 0);
  });

  it("dedupes the same token across queries and resolves it once", async () => {
    const calls: string[] = [];
    const result = await fetchGoogleNews(jaSource, window, jaHttpGet(calls), {
      queries: ["AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)", "老化 (治療薬 OR 新薬) (臨床試験 OR 承認)"],
    });
    assert.equal(result.records.length, 1);
    assert.equal(
      calls.filter((url) => url.startsWith("https://news.google.com/articles/CBMiTESTB1")).length,
      1,
    );
  });

  it("admits a keyword record through isScienceNews via the resolved URL", async () => {
    const { isScienceNews } = await import("./science-news");
    const calls: string[] = [];
    const result = await fetchGoogleNews(jaSource, window, jaHttpGet(calls), {
      queries: ["AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)"],
    });
    assert.equal(isScienceNews(result.records[0]), true);
  });
});

describe("Google News parsing helpers", () => {
  it("strips the publisher suffix and counts malformed items", () => {
    const { items, malformed } = parseGoogleNewsFeed(jaFeed);
    assert.equal(items.length, 3);
    assert.equal(malformed, 1);
    assert.equal(items[0].title, "アルファベット傘下のAI創薬アイソモーフィック、7890億円調達で協議");
    assert.equal(items[0].publisherName, "Bloomberg.com");
    assert.throws(() => parseGoogleNewsFeed("<html>not a feed</html>"));
  });

  it("extracts decode parameters from the data-p payload", () => {
    const params = extractDecodeParams(articlePageHtml("CBMiTESTB1", ["ja", "JP"]));
    assert.ok(params);
    assert.equal(params?.[0], "garturlreq");
    assert.equal(params?.[2], "CBMiTESTB1");
    assert.equal(extractDecodeParams("<html><body>nothing</body></html>"), null);
  });

  it("reads the resolved URL from the wrb.fr payload and from a bare scan", () => {
    assert.equal(extractResolvedUrl(batchResponse(BLOOMBERG_URL)), BLOOMBERG_URL);
    const bare = `)]}'\n\nsome prefix https:\\/\\/example.com\\/story?a=1 suffix`;
    assert.equal(extractResolvedUrl(bare), "https://example.com/story?a=1");
    assert.equal(extractResolvedUrl("no urls here"), null);
  });

  it("extracts meta descriptions in name-then-og order", () => {
    assert.equal(
      extractMetaDescription(`<meta property="og:description" content="og text">`),
      "og text",
    );
    assert.equal(
      extractMetaDescription(
        `<meta name="description" content="name text"><meta property="og:description" content="og text">`,
      ),
      "name text",
    );
    assert.equal(extractMetaDescription(`<meta content="reversed" name="description">`), "reversed");
    assert.equal(extractMetaDescription("<html></html>"), null);
  });
});

describe("keyword records in dedupe (design §7)", () => {
  it("merges a feed record and a keyword record for the same publisher URL, feed copy primary", async () => {
    const genUrl = "https://www.genengnews.com/topics/drug-discovery/isomorphic-labs-raises";
    const genRss =
      `<rss version="2.0"><channel><title>GEN</title>` +
      `<item><title>Isomorphic Labs raises $5 billion to expand its AI drug discovery platform</title>` +
      `<link>${genUrl}</link><pubDate>Thu, 05 Nov 2026 09:00:00 GMT</pubDate>` +
      `<description>Isomorphic Labs, the Alphabet-owned AI drug discovery company, is in talks to raise about $5 billion at a valuation near $50 billion, according to people familiar with the matter.</description></item>` +
      `</channel></rss>`;
    const feedRecords = parseRssFeed(sourceById("gen-news")!, genRss, window);
    assert.equal(feedRecords.length, 1);

    const enFeed =
      `<rss version="2.0"><channel><title>Google News</title>` +
      `<item><title>Isomorphic Labs raises $5B for AI drug discovery - GEN</title>` +
      `<link>https://news.google.com/rss/articles/CBMiTESTG1?oc=5</link>` +
      `<guid isPermaLink="false">CBMiTESTG1</guid>` +
      `<pubDate>Thu, 05 Nov 2026 10:00:00 GMT</pubDate>` +
      `<description>&lt;a href="https://news.google.com/rss/articles/CBMiTESTG1"&gt;Isomorphic Labs raises $5B for AI drug discovery&lt;/a&gt; - GEN</description>` +
      `<source url="https://www.genengnews.com">GEN</source></item>` +
      `</channel></rss>`;
    const calls: string[] = [];
    const httpGet = router(
      [
        {
          match: (url) => url.startsWith("https://news.google.com/rss/search"),
          respond: () => new Response(enFeed, { status: 200 }),
        },
        {
          match: (url) => url.startsWith("https://news.google.com/articles/CBMiTESTG1"),
          respond: () => new Response(articlePageHtml("CBMiTESTG1", ["en-US", "US"]), { status: 200 }),
        },
        {
          match: (url) => url.includes("batchexecute"),
          respond: () => new Response(batchResponse(genUrl), { status: 200 }),
        },
        {
          match: (url) => url === genUrl,
          respond: () => new Response("<html><head></head></html>", { status: 200 }),
        },
      ],
      calls,
    );
    const keyword = await fetchGoogleNews(sourceById("google-news-en")!, window, httpGet, {
      queries: ['"AI drug discovery" (funding OR raises OR partnership OR acquisition OR deal)'],
    });
    assert.equal(keyword.records.length, 1);
    assert.equal(keyword.records[0].sourceUrl, genUrl);
    // The EN article page was requested with the US locale parameters.
    assert.ok(calls.some((url) => url.includes("hl=en-US")));

    const { records, conflicts } = deduplicate([...feedRecords, ...keyword.records]);
    assert.equal(conflicts.length, 0);
    assert.equal(records.length, 1);
    assert.equal(records[0].sourceId, "gen-news");
    assert.ok(
      records[0].hints?.pubTypes?.some((value) => value.startsWith("merged-from:google-news-en:")),
    );
  });
});
