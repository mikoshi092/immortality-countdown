import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articles as catalog, type Article } from "../../data/articles";
import { canonicalUrl, normalizeDoi } from "../fetch";
import type { EditorialDraft } from "../editorial/types";

const here = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ARTICLES_PATH = join(here, "../../data/articles.ts");
const ARTICLES_EXPORT = "export const articles: Article[] = ";
const ARTICLES_HELPER = "export function isPublishedArticle";

export type ApplyResult = {
  writtenPath: string;
  added: Article[];
  skipped: { slug: string; reason: string }[];
  articles: Article[];
};

function isDuplicate(existing: Article, incoming: Article): string | undefined {
  if (existing.slug === incoming.slug || existing.id === incoming.id) {
    return "duplicate slug or id";
  }
  const doi = normalizeDoi(incoming.doi);
  if (doi && normalizeDoi(existing.doi) === doi) return "duplicate DOI";
  if (canonicalUrl(existing.sourceUrl) === canonicalUrl(incoming.sourceUrl)) {
    return "duplicate URL";
  }
  return undefined;
}

export function draftToPublishableArticle(
  draft: EditorialDraft,
  scheduledListingAt: Date,
): Article {
  if (draft.countdownImpact !== "none") {
    throw new Error("countdownImpact must be none");
  }
  const {
    candidateRecordId: _candidateRecordId,
    relevanceScore: _relevanceScore,
    significanceScore: _significanceScore,
    ...rest
  } = draft;
  void _candidateRecordId;
  void _relevanceScore;
  void _significanceScore;
  const iso = scheduledListingAt.toISOString();
  return {
    ...rest,
    sourceUrl: draft.sourceUrl,
    draftCreatedAt: iso,
    sitePublishedAt: iso,
  };
}

export function mergePublishedArticles(
  existing: readonly Article[],
  incoming: readonly Article[],
): { articles: Article[]; added: Article[]; skipped: { slug: string; reason: string }[] } {
  const articles = existing.map((article) => ({ ...article }));
  const added: Article[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const next of incoming) {
    if (next.countdownImpact !== "none") {
      skipped.push({ slug: next.slug, reason: "countdownImpact must be none" });
      continue;
    }
    if (!next.sitePublishedAt) {
      skipped.push({ slug: next.slug, reason: "sitePublishedAt is required to publish" });
      continue;
    }
    const duplicate = articles
      .map((article) => isDuplicate(article, next))
      .find(Boolean);
    if (duplicate) {
      skipped.push({ slug: next.slug, reason: duplicate });
      continue;
    }
    const stored: Article = { ...next };
    if ("featured" in stored) delete stored.featured;
    added.push(stored);
    articles.push(stored);
  }

  return { articles, added, skipped };
}

export function stampScheduledListing(
  current: readonly Article[],
  ids: ReadonlySet<string>,
  scheduledListingAt: Date,
): Article[] {
  const iso = scheduledListingAt.toISOString();
  return current.map((article) => {
    if (!ids.has(article.id) || article.sitePublishedAt) return { ...article };
    return {
      ...article,
      draftCreatedAt: article.draftCreatedAt ?? iso,
      sitePublishedAt: iso,
    };
  });
}

export function readArticlesFile(path: string): Article[] {
  if (path.endsWith(".json")) {
    return JSON.parse(readFileSync(path, "utf8")) as Article[];
  }
  return catalog.map((article) => ({ ...article }));
}

export function writeArticlesFile(articles: readonly Article[], path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  if (path.endsWith(".json")) {
    writeFileSync(path, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
    return;
  }
  const current = readFileSync(path, "utf8");
  const start = current.indexOf(ARTICLES_EXPORT);
  const helper = current.indexOf(ARTICLES_HELPER);
  if (start < 0 || helper < 0 || helper <= start) {
    throw new Error(`Could not find articles export in ${path}`);
  }
  const header = current.slice(0, start);
  const footer = current.slice(helper);
  writeFileSync(
    path,
    `${header}${ARTICLES_EXPORT}${JSON.stringify(articles, null, 2)} as Article[];\n\n${footer}`,
    "utf8",
  );
}

export function applyDraftsToArticles(
  drafts: readonly EditorialDraft[],
  scheduledListingAt: Date,
  options: { articlesPath?: string; existing?: Article[] } = {},
): ApplyResult {
  const articlesPath = options.articlesPath ?? DEFAULT_ARTICLES_PATH;
  const existing = options.existing ?? readArticlesFile(articlesPath);
  const incoming = drafts.map((draft) =>
    draftToPublishableArticle(draft, scheduledListingAt),
  );
  const merged = mergePublishedArticles(existing, incoming);
  writeArticlesFile(merged.articles, articlesPath);
  return {
    writtenPath: articlesPath,
    added: merged.added,
    skipped: merged.skipped,
    articles: merged.articles,
  };
}
