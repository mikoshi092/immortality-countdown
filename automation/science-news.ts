import type { HttpGet, LookbackWindow } from "./fetch";
import type { FetchedRecord, SourceFetchResult } from "./types";

export const NATURE_NEWS_FEED = "https://www.nature.com/nature.rss";

// A journal's news report is evidence of a reported development, not a
// clinical study. Only this adapter can supply the separate news route.
export function isScienceNews(record: { sourceId: string; sourceUrl: string }): boolean {
  return record.sourceId === "nature-news" &&
    /^https:\/\/www\.nature\.com\/articles\/d41586-\d{3}-\d{5}-[\dx]$/.test(record.sourceUrl);
}

export function isRelevantDevelopment(text: string): boolean {
  const biology = /\b(biology|biological|biolab|genom\w*|protein\w*|enzyme\w*|dna|rna|crispr|drug\w*|medicin\w*)\b/i.test(text);
  const ai = /\b(ai|artificial intelligence|machine learning|robot\w*|automat\w*|wet lab)\b/i.test(text);
  const therapy = /\b(cancer|tumou?r|lymphoma|leuk[ae]mia|regenerat\w*|gene editing|gene therapy|senolytic\w*|rejuvenat\w*|organoid\w*|xenotransplant\w*)\b/i.test(text);
  const event = /\b(discover\w*|finds?|found|identif\w*|launch\w*|establish\w*|opens?|opened|develop\w*|trial\w*|approv\w*|test\w*|design\w*)\b/i.test(text);
  return event && ((biology && ai) || therapy);
}

function plainText(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code: string) => {
      const n = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code);
      return n <= 0x10ffff ? String.fromCodePoint(n) : "";
    }).replace(/\s+/g, " ").trim();
}

function tag(item: string, name: string): string {
  return plainText(item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "");
}

export function parseNatureNews(xml: string, window: LookbackWindow): FetchedRecord[] {
  if (!/<(?:rss|rdf:RDF)\b/i.test(xml) || !/<\/(?:rss|rdf:RDF)>\s*$/i.test(xml) || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error("Nature feed is not a supported RSS document");
  }
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  if (items.length !== (xml.match(/<item\b/gi) ?? []).length) throw new Error("Nature RSS has incomplete items");
  const records: FetchedRecord[] = [];
  for (const [, item] of items) {
    const sourceUrl = tag(item, "link");
    if (!isScienceNews({ sourceId: "nature-news", sourceUrl })) continue;
    const title = tag(item, "title");
    const abstract = tag(item, "description");
    const rawDate = tag(item, "dc:date") || tag(item, "pubDate") || tag(item, "prism:publicationDate");
    if (!title || !rawDate || Number.isNaN(Date.parse(rawDate))) throw new Error("Nature news item has missing title or date");
    const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    const time = Date.parse(rawDate);
    if (dayOnly && new Date(time).toISOString().slice(0, 10) !== rawDate) throw new Error("Nature news item has an invalid calendar date");
    if (!dayOnly && !/\d{2}:\d{2}/.test(rawDate)) throw new Error("Nature news date has insufficient precision");
    if (time > window.to.getTime() || time + (dayOnly ? 86_400_000 - 1 : 0) < window.from.getTime()) continue;
    if (!isRelevantDevelopment(`${title} ${abstract}`)) continue;
    const publishedAt = new Date(time).toISOString();
    records.push({
      sourceId: "nature-news", sourceName: "Nature News", recordId: sourceUrl.split("/").pop()!,
      title, abstract, sourceUrl: sourceUrl as `https://${string}`,
      urlOrigin: { kind: "source-feed", rule: "Exact link supplied by Nature RSS", id: sourceUrl },
      publishedAt, fetchedAt: window.to.toISOString(),
      dateFields: { publicationDate: { raw: rawDate, iso: dayOnly ? rawDate : publishedAt, precision: dayOnly ? "day" : "datetime" } },
      windowMatch: { inWindow: true, matchedFields: ["publicationDate"] },
      hints: { pubTypes: ["News"], journal: "Nature News" }, studySubjects: [],
    });
  }
  return records;
}

export async function fetchNatureNews(window: LookbackWindow, httpGet: HttpGet): Promise<SourceFetchResult> {
  try {
    const response = await httpGet(NATURE_NEWS_FEED);
    if (!response.ok) throw new Error(`Nature RSS HTTP ${response.status}`);
    return { sourceId: "nature-news", ok: true, status: "ok", records: parseNatureNews(await response.text(), window), requestCount: 1 };
  } catch (error) {
    return { sourceId: "nature-news", ok: false, status: "failed", records: [], error: error instanceof Error ? error.message : "Nature RSS failed", requestCount: 1 };
  }
}
