import { SOURCES } from "@/automation/sources";
import type { Article, ArticleCopy } from "@/data/articles";
import { FIELD_SHORT_LABELS, type FieldId } from "@/lib/fields";
import { FIELD_LABELS_JA } from "@/lib/ja";
import type { SiteLocale } from "@/lib/locale";

/**
 * View-model mapping for the realtime-chart-style news rows used on the
 * calm redesign (top pages + news index pages). Design source: the
 * approved mocks (files/toppage_mock_calm_2026-11-04.html and
 * files/news_mock_2026-11-04.html in the goal workspace): badge = hours
 * since the original article appeared, headline links to the original
 * article, meta = field tag + source name + relative time, and an
 * attention bar.
 *
 * Field availability on main (checked 2026-11-04):
 * - `popHeadline` is NOT yet on the Article type. The news automation
 *   upgrade (branch `news-general-media-sources`) adds an optional
 *   `popHeadline` to `ArticleCopy`; once that lands, rows automatically
 *   prefer it over the plain headline. Until then the fallback below is
 *   the existing locale headline.
 * - Every Article record carries `sourceUrl` (required, https), so the
 *   headline link always points at the original article, per the owner's
 *   aggregator decision. The internal article page is the fallback only
 *   if a record ever lacks a usable sourceUrl.
 * - `attentionLevel` (1–4) likewise arrives with the automation upgrade.
 *   Until then the attention percentage falls back to the candidate
 *   significance score captured at ingest (`sourceCheck.significanceScore`,
 *   present on most published records); rows with neither omit the bar.
 *
 * News-face display policy (owner, 2026-11-04): the news surfaces — the
 * top-page strip, the top-page latest list and the news index pages —
 * show general-media coverage only, i.e. records whose contentType is
 * "science-news". Papers and trial registrations stay in the research
 * archive (their own article pages and feeds are untouched) but never
 * appear on the news face. This is a display filter only; no article
 * data changes. `newsFaceArticles` is the filter, and both row builders
 * below apply it so no caller can bypass the policy.
 *
 * Language policy (owner, 2026-11-04): the Japanese news surfaces
 * link only to Japanese-language articles — a Japanese headline that
 * lands the reader on an English article is not acceptable to the
 * core audience. An article's language is resolved from its
 * `sourceUrl` host against the ingest registry (`automation/sources`),
 * whose entries carry the source's language; hosts belonging to no
 * Japanese source count as English, so an unregistered source can
 * never slip onto the Japanese face. English surfaces are unchanged.
 */

export const FIELD_EMOJI: Record<FieldId, string> = {
  "rejuvenation-regeneration": "🧬",
  "biomarkers-diagnostics": "🔍",
  "geroscience-drugs-trials": "💊",
  "gene-therapy-delivery": "🧫",
  "ai-drug-discovery": "🤖",
  "organ-replacement-biofabrication": "🫀",
  "immune-engineering-cancer-control": "🛡️",
  "enabling-technology-automation": "⚙️",
};

/** Display percentage for each attention level, per the approved mock spec. */
const ATTENTION_LEVEL_PCT: Record<number, number> = {
  4: 92,
  3: 74,
  2: 57,
  1: 40,
};

type ArticleWithAttention = Article & { attentionLevel?: number };
type CopyWithPopHeadline = ArticleCopy & { popHeadline?: string };

export function headlineFor(article: Article, locale: SiteLocale): string {
  const copy = article[locale] as CopyWithPopHeadline;
  return copy.popHeadline ?? copy.headline;
}

/** Attention percentage for the row bar, or null when no signal exists. */
export function attentionPctFor(article: Article): number | null {
  const level = (article as ArticleWithAttention).attentionLevel;
  if (typeof level === "number" && Number.isFinite(level)) {
    return ATTENTION_LEVEL_PCT[Math.min(4, Math.max(1, Math.round(level)))] ?? null;
  }
  const significance = article.sourceCheck?.significanceScore;
  if (typeof significance === "number" && Number.isFinite(significance)) {
    return Math.min(100, Math.max(0, Math.round(significance)));
  }
  return null;
}

/** External original-article URL, or null when the record has none. */
export function linkFor(article: Article): string | null {
  return article.sourceUrl ? article.sourceUrl : null;
}

export function hoursSince(isoDate: string, now: Date): number {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now.getTime() - then) / 3_600_000));
}

export function relativeTimeJa(hours: number): string {
  if (hours < 1) return "1時間以内";
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "昨日" : `${days}日前`;
}

export function relativeTimeEn(hours: number): string {
  if (hours < 1) return "within the last hour";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export type NewsRowData = {
  key: string;
  href: string;
  external: boolean;
  headline: string;
  fieldLabel: string;
  fieldEmoji: string;
  sourceLabel: string;
  hours: number;
  isNew: boolean;
  attentionPct: number | null;
};

export function newsRowData(article: Article, locale: SiteLocale, now: Date): NewsRowData {
  const hours = hoursSince(article.sourcePublishedAt, now);
  const external = linkFor(article);
  const href = external ?? (locale === "ja" ? `/ja/news/${article.slug}` : `/news/${article.slug}`);
  return {
    key: article.id,
    href,
    external: external !== null,
    headline: headlineFor(article, locale),
    fieldLabel:
      locale === "ja" ? FIELD_LABELS_JA[article.fieldId] : FIELD_SHORT_LABELS[article.fieldId],
    fieldEmoji: FIELD_EMOJI[article.fieldId],
    sourceLabel: article.sourceLabel,
    hours,
    isNew: hours < 12,
    attentionPct: attentionPctFor(article),
  };
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Hosts (www-stripped) of every registry source marked Japanese: the
 * source's public site plus its feed host. Article URLs live on the
 * public site, but matching both keeps the resolution correct if a
 * feed ever points at its own host directly.
 */
const JAPANESE_SOURCE_HOSTS: ReadonlySet<string> = new Set(
  SOURCES.filter((source) => source.language === "ja").flatMap((source) => {
    const hosts = [hostOf(source.url), hostOf(source.api.baseUrl)];
    return hosts.filter((host): host is string => host !== null);
  }),
);

/**
 * The language of the article a record links to, resolved from its
 * source URL against the ingest registry. A host matches when it is
 * a Japanese source's host or a subdomain of one; anything else —
 * including hosts no registry entry claims — is English.
 */
export function sourceLanguageFor(article: Article): "ja" | "en" {
  const host = hostOf(article.sourceUrl);
  if (!host) return "en";
  for (const sourceHost of JAPANESE_SOURCE_HOSTS) {
    if (host === sourceHost || host.endsWith(`.${sourceHost}`)) return "ja";
  }
  return "en";
}

export function isJapaneseSourceArticle(article: Article): boolean {
  return sourceLanguageFor(article) === "ja";
}

/**
 * The news-face display filter: general-media ("science-news")
 * records only. On the Japanese surfaces (`locale: "ja"`) it also
 * requires a Japanese source, per the language policy above; any
 * other call — including omitting the locale — keeps the original
 * behavior exactly.
 */
export function newsFaceArticles(articles: readonly Article[], locale?: SiteLocale): Article[] {
  const media = articles.filter((article) => article.contentType === "science-news");
  return locale === "ja" ? media.filter(isJapaneseSourceArticle) : media;
}

export function toNewsRows(
  articles: readonly Article[],
  locale: SiteLocale,
  now: Date,
): NewsRowData[] {
  return newsFaceArticles(articles, locale).map((article) => newsRowData(article, locale, now));
}

/**
 * "Top stories" ordering for the strip on the top pages: attention first,
 * then recency. Returns at most `count` rows.
 */
export function topStoryRows(
  articles: readonly Article[],
  locale: SiteLocale,
  now: Date,
  count: number,
): NewsRowData[] {
  return [...newsFaceArticles(articles, locale)]
    .sort((a, b) => {
      const attentionDiff = (attentionPctFor(b) ?? -1) - (attentionPctFor(a) ?? -1);
      if (attentionDiff !== 0) return attentionDiff;
      return b.sourcePublishedAt.localeCompare(a.sourcePublishedAt);
    })
    .slice(0, count)
    .map((article) => newsRowData(article, locale, now));
}
