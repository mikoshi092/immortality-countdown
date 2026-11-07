import type { HttpGet, LookbackWindow } from "./fetch";
import { sourceById } from "./sources";
import type { FetchedRecord, SourceDefinition, SourceFetchResult } from "./types";

export const NATURE_NEWS_FEED = "https://www.nature.com/nature.rss";

/**
 * The stage a news report itself states, detected deterministically
 * from the report's title and summary. This is a guard for editorial
 * validation and a ranking signal, never a published classification:
 * media records still carry `studySubjects: []`, and the editorial
 * gate rejects copy whose headline upgrades this stage. `not-stated`
 * means the summary does not state a stage.
 */
export type ReportedStage = "cells" | "animals" | "human-study" | "approved" | "not-stated";

/**
 * Japanese stage vocabulary, matched as substrings (Japanese has no
 * word boundaries). The human-study patterns deliberately require the
 * trial to be the report's own subject — 臨床試験で/において/を実施/
 * を開始/の結果, 治験, 被験者, 患者に投与 — because Japanese reports
 * routinely cite past 臨床試験 (for example their failure rates) as
 * background for an animal finding, and a bare 臨床試験 mention must
 * not promote that finding to a human stage.
 */
const STAGE_PATTERNS: { stage: Exclude<ReportedStage, "not-stated">; pattern: RegExp }[] = [
  {
    stage: "approved",
    pattern:
      /\b(fda[-\s]?approved|approved by (the )?(fda|ema|regulators?)|regulatory approval|marketing authori[sz]ation|received (fda )?approval|granted approval|approval (was|has been) granted|cleared by (the )?fda)\b|(?:薬事承認|製造販売承認|承認を取得|承認が下り|承認済み|承認され)/i,
  },
  {
    stage: "human-study",
    pattern:
      /\b(clinical trials?|phase\s?[123]\b|phase\s?(i{1,3}|iv)\b|first[-\s]in[-\s]human|trial (in|of) (patients|people|adults|volunteers)|\d+\s+(patients|participants|volunteers|adults|people)\b|patients (received|were given|showed|responded)|volunteers (received|were given))\b|(?:治験|臨床試験で|臨床試験において|臨床試験を実施|臨床試験が開始|臨床試験を開始|臨床試験の結果|人を対象とした|ヒトを対象とした|被験者|患者に投与|患者を対象|第[1234]相|第[ⅠⅡⅢⅣ]相|フェーズ[1234])/i,
  },
  {
    stage: "animals",
    pattern:
      /\b(mice|mouse|murine|rats?|rabbits?|minipigs?|pigs?|swine|monkeys?|macaques?|primates?|zebrafish|drosophila|fruit flies|nematodes?|c\.?\s?elegans|in animals|animal (models?|stud(y|ies)|trials?))\b|(?:マウス|ラット|ウサギ|サル(?!コ|痘)|霊長類|ゼブラフィッシュ|ショウジョウバエ|線虫|ミニブタ|動物実験|動物モデル)/i,
  },
  {
    stage: "cells",
    pattern:
      /\b(in vitro|cell cultures?|cultured cells?|cell lines?|organoids?|petri dish|lab-grown cells?)\b|(?:細胞培養|培養細胞|細胞株|オルガノイド|試験管内|培養皿|シャーレ)/i,
  },
];

/** Priority order: approval > human study > animals > cells. */
export function detectReportedStage(text: string): ReportedStage {
  for (const { stage, pattern } of STAGE_PATTERNS) {
    if (pattern.test(text)) return stage;
  }
  return "not-stated";
}

const linkPatterns = new Map<string, RegExp>();

function linkPatternFor(source: SourceDefinition): RegExp | undefined {
  if (!source.api.linkPattern) return undefined;
  let compiled = linkPatterns.get(source.id);
  if (!compiled) {
    compiled = new RegExp(source.api.linkPattern);
    linkPatterns.set(source.id, compiled);
  }
  return compiled;
}

// A media report is evidence of a reported development, not a clinical
// study. Only registered science-news sources feed this route, and an
// item counts only when its link matches the source's article pattern.
export function isScienceNews(record: { sourceId: string; sourceUrl: string }): boolean {
  const source = sourceById(record.sourceId);
  if (!source || source.type !== "science-news") return false;
  const pattern = linkPatternFor(source);
  return pattern ? pattern.test(record.sourceUrl) : false;
}

/**
 * Japanese equivalents of the branch vocabularies in
 * isRelevantDevelopment, matched as substrings because Japanese has
 * no word boundaries. Precision comes from the same branch structure:
 * an event word is always required, and broad words such as 健康 or
 * 医療 alone are deliberately absent, so general health coverage and
 * IT news still fail. 若返 is the verb stem, covering 若返り/若返る/
 * 若返らせ the way the English patterns truncate rejuvenat*.
 */
const JP_BIOLOGY = /(?:生物学|ゲノム|タンパク質|酵素|遺伝子|創薬)/;
const JP_AI = /(?:人工知能|機械学習|深層学習|ロボット|自動化|\bAI\b)/;
const JP_THERAPY = /(?:がん|癌|腫瘍|リンパ腫|白血病|黒色腫|肉腫|再生医療|遺伝子編集|遺伝子治療|セノリティクス|セノライティクス|若返|オルガノイド|異種移植)/;
const JP_AGEING = /(?:老化|長寿|寿命|生物学的年齢|エピジェネティッククロック|老化クロック|若返|アルツハイマー|認知症|パーキンソン|フレイル|サルコペニア|ラパマイシン|メトホルミン|セノリティクス|セノライティクス|エイジング)/;
const JP_EVENT = /(?:発見|開発|報告|発表|開始|成功|示し|明らか|延び|延長|改善|確認|実証|証明|試験|承認|公表|掲載|資金調達|提携|買収|出資|調達|大型契約|上場)/;

export function isRelevantDevelopment(text: string): boolean {
  const biology = /\b(biology|biological|biolab|genom\w*|protein\w*|enzyme\w*|dna|rna|crispr|drug\w*|medicin\w*)\b/i.test(text) || JP_BIOLOGY.test(text);
  const ai = /\b(ai|artificial intelligence|machine learning|robot\w*|automat\w*|wet lab)\b/i.test(text) || JP_AI.test(text);
  const therapy = /\b(cancer|tumou?r|lymphoma|leuk[ae]mia|regenerat\w*|gene editing|gene therapy|senolytic\w*|rejuvenat\w*|organoid\w*|xenotransplant\w*)\b/i.test(text) || JP_THERAPY.test(text);
  // Media reports usually lead with the ageing angle itself rather than
  // with method terms, so ageing and age-related-disease vocabulary is
  // a relevance branch of its own (still gated on an event word).
  const ageing = /\b(aging|ageing|senescence|senolytic\w*|longevity|healthspan|lifespan|biological age|epigenetic clock|rejuvenat\w*|alzheimer\w*|dementia|parkinson\w*|frailty|sarcopenia|rapamycin|metformin)\b/i.test(text) || JP_AGEING.test(text);
  // Business events (raise/funding/partner/acquire/deal/invest and
  // 資金調達・提携・買収・出資・調達・大型契約・上場) count as developments
  // (2026-11 split from the keyword-collection design): a funding,
  // partnership or M&A move by a company in the field is a development
  // worth surfacing. They still require one of the field branches
  // below, so a bare money story with no biology/therapy/ageing term
  // fails. 協議 is deliberately NOT an event word (it appears in every
  // corporate-dispute story); bare 調達 is, because flagship funding
  // headlines use it (「7890億円調達で協議」) and the branch gate keeps
  // general procurement news out.
  const event = /\b(discover\w*|finds?|found|identif\w*|launch\w*|establish\w*|opens?|opened|develop\w*|trial\w*|approv\w*|test\w*|design\w*|report\w*|shows?|extend\w*|reveal\w*|publish\w*|demonstrat\w*|rais\w*|funding|partner\w*|acquir\w*|deal|invest\w*)\b/i.test(text) || JP_EVENT.test(text);
  return event && ((biology && ai) || therapy || ageing);
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

/**
 * Normalize the loose date formats general-media feeds emit (for
 * example Fierce Biotech's "Nov 3, 2026 5:05am", which Date.parse
 * rejects) without loosening precision: the normalized value is only
 * used when it still carries at least hour-and-minute precision.
 */
function parseFeedDate(rawDate: string): number {
  const direct = Date.parse(rawDate);
  if (!Number.isNaN(direct)) return direct;
  const normalized = rawDate.replace(/(\d)\s*(am|pm)\b/i, "$1 $2").toUpperCase();
  return Date.parse(normalized);
}

export function parseRssFeed(source: SourceDefinition, xml: string, window: LookbackWindow): FetchedRecord[] {
  // The document must end at the root close, allowing only whitespace
  // and trailing comments (ScienceDaily appends a cache stamp comment
  // after </rss>). Anything else means the document is not the feed it
  // claims to be.
  if (!/<(?:rss|rdf:RDF)\b/i.test(xml) || !/<\/(?:rss|rdf:RDF)>(?:\s|<!--[\s\S]*?-->)*$/i.test(xml) || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error(`${source.name} feed is not a supported RSS document`);
  }
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  if (items.length !== (xml.match(/<item\b/gi) ?? []).length) throw new Error(`${source.name} RSS has incomplete items`);
  const records: FetchedRecord[] = [];
  for (const [, item] of items) {
    const sourceUrl = tag(item, "link");
    if (!isScienceNews({ sourceId: source.id, sourceUrl })) continue;
    const title = tag(item, "title");
    const abstract = tag(item, "description");
    const rawDate = tag(item, "dc:date") || tag(item, "pubDate") || tag(item, "prism:publicationDate");
    const time = rawDate ? parseFeedDate(rawDate) : NaN;
    if (!title || !rawDate || Number.isNaN(time)) throw new Error(`${source.name} news item has missing title or date`);
    const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    if (dayOnly && new Date(time).toISOString().slice(0, 10) !== rawDate) throw new Error(`${source.name} news item has an invalid calendar date`);
    if (!dayOnly && !/\d{1,2}:\d{2}/.test(rawDate)) throw new Error(`${source.name} news date has insufficient precision`);
    if (time > window.to.getTime() || time + (dayOnly ? 86_400_000 - 1 : 0) < window.from.getTime()) continue;
    if (!isRelevantDevelopment(`${title} ${abstract}`)) continue;
    const publishedAt = new Date(time).toISOString();
    const recordId = sourceUrl.replace(/\/$/, "").split("/").pop()!;
    records.push({
      sourceId: source.id, sourceName: source.name, recordId,
      title, abstract, sourceUrl: sourceUrl as `https://${string}`,
      urlOrigin: { kind: "source-feed", rule: `Exact link supplied by ${source.name} RSS`, id: sourceUrl },
      publishedAt, fetchedAt: window.to.toISOString(),
      dateFields: { publicationDate: { raw: rawDate, iso: dayOnly ? rawDate : publishedAt, precision: dayOnly ? "day" : "datetime" } },
      windowMatch: { inWindow: true, matchedFields: ["publicationDate"] },
      hints: { pubTypes: ["News"], journal: source.name }, studySubjects: [],
    });
  }
  return records;
}

export function parseNatureNews(xml: string, window: LookbackWindow): FetchedRecord[] {
  const source = sourceById("nature-news");
  if (!source) throw new Error("Nature News source is not registered");
  return parseRssFeed(source, xml, window);
}

export async function fetchScienceNews(source: SourceDefinition, window: LookbackWindow, httpGet: HttpGet): Promise<SourceFetchResult> {
  try {
    const response = await httpGet(source.api.baseUrl);
    if (!response.ok) throw new Error(`${source.name} RSS HTTP ${response.status}`);
    return { sourceId: source.id, ok: true, status: "ok", records: parseRssFeed(source, await response.text(), window), requestCount: 1 };
  } catch (error) {
    return { sourceId: source.id, ok: false, status: "failed", records: [], error: error instanceof Error ? error.message : `${source.name} RSS failed`, requestCount: 1 };
  }
}

export async function fetchNatureNews(window: LookbackWindow, httpGet: HttpGet): Promise<SourceFetchResult> {
  const source = sourceById("nature-news");
  if (!source) {
    return { sourceId: "nature-news", ok: false, status: "failed", records: [], error: "Nature News source is not registered", requestCount: 0 };
  }
  return fetchScienceNews(source, window, httpGet);
}
