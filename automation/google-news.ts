import type { HttpGet, LookbackWindow } from "./fetch";
import { isRelevantDevelopment, plainText, tag } from "./science-news";
import type {
  FetchedRecord,
  SourceDefinition,
  SourceFetchResult,
  SourceIssue,
} from "./types";

/**
 * Google News keyword collection (design: google-news-keyword-design.md,
 * owner decision 2026-11). Registered feeds cannot carry scoops broken
 * by outlets outside the registry — the motivating case is Bloomberg's
 * Isomorphic Labs funding story, which no feed had and which was added
 * by hand. Two sources (one per locale) run a fixed set of keyword
 * queries against Google News search RSS; every query AND-gates a field
 * term with an event term so the classifier is not flooded.
 *
 * Google News item links are opaque tokens. Plain redirect-following
 * does NOT reach the publisher (verified in the design): the article
 * page carries the decode parameters in a <c-wiz data-p="…"> attribute,
 * and a batchexecute RPC (the method maintained by the open-source
 * googlenewsdecoder project) exchanges them for the publisher URL.
 * That RPC is undocumented and can break without notice, so the
 * failure mode is safe by construction: an item whose link cannot be
 * resolved is dropped and counted in the result's issues. A
 * news.google.com URL never becomes a record — the site's headline
 * link must point at the original article.
 *
 * Status semantics (a deliberate deviation, recorded in the design):
 * the source reports "ok" when at least one of its queries fetched and
 * parsed, even if other queries failed, because decidePublish blocks
 * the whole run on any non-ok source and a Google hiccup must not veto
 * the registered feeds. Per-query and per-item failures are recorded
 * in `issues` instead. The source is "failed" only when every query
 * fails.
 */

/** Queries verbatim from the design (§2); ` when:2d` is appended at fetch time. */
export const GOOGLE_NEWS_QUERIES: Record<"ja" | "en", readonly string[]> = {
  ja: [
    "AI創薬 (資金調達 OR 提携 OR 買収 OR 上場)",
    "(長寿 OR 老化) (ベンチャー OR スタートアップ) (資金調達 OR 買収 OR 提携)",
    "(若返り OR 細胞リプログラミング) (臨床試験 OR 治験 OR 承認)",
    "老化 (治療薬 OR 新薬) (臨床試験 OR 治験 OR 承認 OR 結果)",
    "遺伝子治療 (老化 OR 長寿 OR 承認 OR 臨床試験)",
    "(生物学的年齢 OR 老化時計 OR エピジェネティッククロック) (研究 OR 開発 OR 発表)",
    "(異種移植 OR 人工臓器 OR バイオプリンティング) (臨床 OR 患者 OR 開始)",
    "(免疫老化 OR 免疫療法) (承認 OR 臨床試験 OR 新薬)",
    "(セノリティクス OR 老化細胞) (臨床 OR 治験 OR 効果 OR 除去)",
  ],
  en: [
    '"AI drug discovery" (funding OR raises OR partnership OR acquisition OR deal)',
    "(Altos Labs OR Isomorphic Labs OR Insilico Medicine OR Retro Biosciences OR BioAge Labs)",
    "longevity (startup OR biotech) (funding OR raises OR acquired OR IPO)",
    '(senolytics OR "partial reprogramming") ("clinical trial" OR first-in-human OR patients)',
    '("biological age" OR "aging clock") (test OR study OR predicts OR launched)',
    "(rapamycin OR metformin) aging (\"clinical trial\" OR results OR FDA)",
    '(xenotransplantation OR "engineered organ" OR bioprinted) (patient OR trial OR transplant)',
    '"gene therapy" (aging OR longevity) (trial OR FDA OR approval)',
  ],
};

const LOCALE_PARAMS: Record<"ja" | "en", { hl: string; gl: string; ceid: string }> = {
  ja: { hl: "ja", gl: "JP", ceid: "JP:ja" },
  en: { hl: "en-US", gl: "US", ceid: "US:en" },
};

/** Bounds the ~1 MB article-page fetches and RPC posts per run and source. */
export const GOOGLE_NEWS_RESOLUTION_CAP = 25;

/** Editorial holds science-news candidates whose abstract is shorter than this. */
const ABSTRACT_HOLD_CHARS = 160;
const ABSTRACT_CAP_CHARS = 600;
const REQUEST_TIMEOUT_MS = 25_000;
const BATCHEXECUTE_URL = "https://news.google.com/_/DotsSplashUi/data/batchexecute";

export type GoogleNewsItem = {
  token: string;
  googleUrl: string;
  title: string;
  publisherName: string;
  publishedAtMs: number;
  rawPubDate: string;
  description: string;
};

function sourceElement(item: string): { name: string } {
  const block = item.match(/<source\b[^>]*>([\s\S]*?)<\/source>/i)?.[1] ?? "";
  return { name: plainText(block) };
}

/**
 * Lenient item parse: a malformed aggregated item is skipped and
 * counted, never thrown — one bad item must not kill a sweep (unlike
 * parseRssFeed, whose registered feeds are well-formed). Throws only
 * when the document is not an RSS document at all.
 */
export function parseGoogleNewsFeed(xml: string): { items: GoogleNewsItem[]; malformed: number } {
  if (!/<(?:rss|rdf:RDF)\b/i.test(xml)) {
    throw new Error("Google News response is not an RSS document");
  }
  const items: GoogleNewsItem[] = [];
  let malformed = 0;
  for (const [, item] of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    try {
      const googleUrl = tag(item, "link");
      const token = googleUrl.match(/articles\/([A-Za-z0-9_-]+)/)?.[1];
      const rawTitle = tag(item, "title");
      const rawPubDate = tag(item, "pubDate");
      const publishedAtMs = rawPubDate ? Date.parse(rawPubDate) : NaN;
      if (!token || !rawTitle || Number.isNaN(publishedAtMs)) {
        malformed += 1;
        continue;
      }
      const publisherName = sourceElement(item).name;
      const suffix = publisherName ? ` - ${publisherName}` : "";
      const title =
        suffix && rawTitle.endsWith(suffix) ? rawTitle.slice(0, -suffix.length).trim() : rawTitle;
      items.push({
        token,
        googleUrl,
        title,
        publisherName,
        publishedAtMs,
        rawPubDate,
        description: tag(item, "description"),
      });
    } catch {
      malformed += 1;
    }
  }
  return { items, malformed };
}

function unescapeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Recursively find a JSON string that parses to ["garturlreq", …]. */
function findGarturlreq(value: unknown, depth = 0): unknown[] | null {
  if (depth > 6 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("[")) return null;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed[0] === "garturlreq") return parsed;
      return findGarturlreq(parsed, depth + 1);
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findGarturlreq(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findGarturlreq(item, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export function extractDecodeParams(html: string): unknown[] | null {
  const attribute =
    html.match(/<c-wiz[^>]*\sdata-p="([^"]+)"/)?.[1] ?? html.match(/\sdata-p="([^"]{20,})"/)?.[1];
  if (!attribute) return null;
  const dataP = unescapeHtml(attribute);
  for (const candidate of [dataP, dataP.replace(/^%\.\@\./, "")]) {
    try {
      const inner = findGarturlreq(JSON.parse(candidate));
      if (inner) return inner;
    } catch {
      // try the next candidate shape
    }
    const inner = findGarturlreq(candidate);
    if (inner) return inner;
  }
  return null;
}

export function extractResolvedUrl(text: string): string | null {
  // Structured path: the batchexecute response is lines of JSON after
  // a )]}' prefix; the wrb.fr entry for Fbv4je carries a payload whose
  // second element is the publisher URL.
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("[")) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    for (const entry of parsed) {
      if (
        Array.isArray(entry) &&
        entry[0] === "wrb.fr" &&
        entry[1] === "Fbv4je" &&
        typeof entry[2] === "string"
      ) {
        try {
          const payload: unknown = JSON.parse(entry[2]);
          if (Array.isArray(payload) && typeof payload[1] === "string" && payload[1].startsWith("https://")) {
            return payload[1];
          }
        } catch {
          // fall through to the scan below
        }
      }
    }
  }
  // Fallback: the first non-Google https URL in the unescaped body.
  const unescaped = text.replace(/\\\//g, "/");
  for (const match of unescaped.matchAll(/https:\/\/[^\s"'\\<>]+/g)) {
    try {
      const host = new URL(match[0]).hostname;
      if (!/(^|\.)google\.com$|(^|\.)googleusercontent\.com$|(^|\.)gstatic\.com$/.test(host)) {
        return match[0];
      }
    } catch {
      // keep scanning
    }
  }
  return null;
}

/**
 * Resolve one opaque Google News link to its publisher URL via the
 * two-step decode. Returns null on any failure (timeout, missing
 * parameters, RPC error, non-https result): the caller drops the item.
 * A paywalled publisher URL is a success — resolution is judged on the
 * returned URL, never on fetching the article body.
 */
export async function resolveGoogleNewsUrl(
  googleUrl: string,
  locale: "ja" | "en",
  httpGet: HttpGet,
  counter?: { count: number },
): Promise<string | null> {
  const token = googleUrl.match(/articles\/([A-Za-z0-9_-]+)/)?.[1];
  if (!token) return null;
  const params = LOCALE_PARAMS[locale];
  const pageUrl = `https://news.google.com/articles/${token}?hl=${params.hl}&gl=${params.gl}&ceid=${params.ceid}`;
  let html: string;
  try {
    if (counter) counter.count += 1;
    const response = await httpGet(pageUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return null;
    html = await response.text();
  } catch {
    return null;
  }
  const decoded = extractDecodeParams(html);
  if (!decoded) return null;
  const [, localeArray, paramToken, timestamp, signature] = decoded as [
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
  ];
  if (typeof paramToken !== "string" || typeof signature !== "string") return null;
  const payload = JSON.stringify(["garturlreq", localeArray, paramToken, timestamp, signature]);
  let text: string;
  try {
    if (counter) counter.count += 1;
    const response = await httpGet(BATCHEXECUTE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        referer: "https://news.google.com/",
      },
      body: new URLSearchParams({
        "f.req": JSON.stringify([[["Fbv4je", payload, null, "generic"]]]),
      }).toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    text = await response.text();
  } catch {
    return null;
  }
  const resolved = extractResolvedUrl(text);
  if (!resolved) return null;
  try {
    if (new URL(resolved).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return resolved;
}

/**
 * The publisher page's own summary, used to enrich keyword records
 * whose Google description is only a headline echo (editorial holds
 * abstracts under 160 chars). Returns null on any failure; the caller
 * keeps the description fallback and the item is held at editorial,
 * never published on an unchecked summary.
 */
export function extractMetaDescription(html: string): string | null {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const text = plainText(match[1]);
      if (text) return text.slice(0, ABSTRACT_CAP_CHARS);
    }
  }
  return null;
}

async function fetchMetaDescription(
  url: string,
  httpGet: HttpGet,
  counter: { count: number },
): Promise<string | null> {
  try {
    counter.count += 1;
    const response = await httpGet(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return null;
    return extractMetaDescription(await response.text());
  } catch {
    return null;
  }
}

export async function fetchGoogleNews(
  source: SourceDefinition,
  window: LookbackWindow,
  httpGet: HttpGet,
  options?: { queries?: readonly string[]; resolutionCap?: number },
): Promise<SourceFetchResult> {
  const counter = { count: 0 };
  const issues: SourceIssue[] = [];
  try {
    const locale = source.language;
    const params = LOCALE_PARAMS[locale];
    const queries = options?.queries ?? GOOGLE_NEWS_QUERIES[locale];
    const cap = options?.resolutionCap ?? GOOGLE_NEWS_RESOLUTION_CAP;
    let fetchedQueries = 0;
    let malformedTotal = 0;
    const byToken = new Map<string, GoogleNewsItem>();
    for (const query of queries) {
      const url = `${source.api.baseUrl}?q=${encodeURIComponent(`${query} when:2d`)}&hl=${params.hl}&gl=${params.gl}&ceid=${params.ceid}`;
      let xml: string;
      try {
        counter.count += 1;
        const response = await httpGet(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        xml = await response.text();
      } catch (error) {
        issues.push({
          stage: "query",
          kind: "http",
          count: 1,
          message: `Google News query failed (${query.slice(0, 40)}): ${error instanceof Error ? error.message : "unknown error"}`,
        });
        continue;
      }
      let parsed: { items: GoogleNewsItem[]; malformed: number };
      try {
        parsed = parseGoogleNewsFeed(xml);
      } catch (error) {
        issues.push({
          stage: "query",
          kind: "parse",
          count: 1,
          message: `Google News query response unparsable (${query.slice(0, 40)}): ${error instanceof Error ? error.message : "unknown error"}`,
        });
        continue;
      }
      fetchedQueries += 1;
      malformedTotal += parsed.malformed;
      for (const item of parsed.items) {
        if (item.publishedAtMs > window.to.getTime() || item.publishedAtMs < window.from.getTime()) {
          continue;
        }
        if (!isRelevantDevelopment(item.title)) continue;
        if (!byToken.has(item.token)) byToken.set(item.token, item);
      }
    }
    if (malformedTotal > 0) {
      issues.push({
        stage: "parse",
        kind: "parse",
        count: malformedTotal,
        message: "Google News items skipped as malformed (missing link, title or date)",
      });
    }
    if (fetchedQueries === 0) {
      return {
        sourceId: source.id,
        ok: false,
        status: "failed",
        records: [],
        error: "All Google News queries failed",
        issues: issues.length > 0 ? issues : undefined,
        requestCount: counter.count,
      };
    }
    const survivors = [...byToken.values()]
      .sort((a, b) => b.publishedAtMs - a.publishedAtMs)
      .slice(0, cap);
    const records: FetchedRecord[] = [];
    let resolutionFailures = 0;
    for (const item of survivors) {
      const resolved = await resolveGoogleNewsUrl(item.googleUrl, locale, httpGet, counter);
      if (!resolved) {
        resolutionFailures += 1;
        continue;
      }
      let abstract: string | undefined = item.description || undefined;
      if (!abstract || abstract.length < ABSTRACT_HOLD_CHARS) {
        const meta = await fetchMetaDescription(resolved, httpGet, counter);
        if (meta && (!abstract || meta.length > abstract.length)) abstract = meta;
      }
      const publishedAt = new Date(item.publishedAtMs).toISOString();
      const recordId = resolved.replace(/\/$/, "").split("/").pop() || item.token;
      records.push({
        sourceId: source.id,
        sourceName: source.name,
        recordId,
        title: item.title,
        abstract,
        sourceUrl: resolved as `https://${string}`,
        urlOrigin: {
          kind: "source-feed",
          rule: "google-news keyword search; redirect resolved to publisher URL at fetch time",
          id: item.token,
        },
        publishedAt,
        fetchedAt: window.to.toISOString(),
        dateFields: {
          publicationDate: { raw: item.rawPubDate, iso: publishedAt, precision: "datetime" },
        },
        windowMatch: { inWindow: true, matchedFields: ["publicationDate"] },
        hints: { pubTypes: ["News"], journal: item.publisherName || source.name },
        studySubjects: [],
      });
    }
    if (resolutionFailures > 0) {
      issues.push({
        stage: "resolution",
        kind: "resolution-failed",
        count: resolutionFailures,
        message: "Google News items dropped: redirect could not be resolved to a publisher URL",
      });
    }
    return {
      sourceId: source.id,
      ok: true,
      status: "ok",
      records,
      issues: issues.length > 0 ? issues : undefined,
      requestCount: counter.count,
    };
  } catch (error) {
    return {
      sourceId: source.id,
      ok: false,
      status: "failed",
      records: [],
      error: error instanceof Error ? error.message : "Google News fetch failed",
      issues: issues.length > 0 ? issues : undefined,
      requestCount: counter.count,
    };
  }
}
