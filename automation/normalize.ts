import type { Candidate, DedupConflict, FetchedRecord } from "./types";
import { canonicalUrl, normalizeDoi } from "./fetch";

export type DeduplicateResult = {
  records: FetchedRecord[];
  conflicts: DedupConflict[];
};

function completeness(record: FetchedRecord): number {
  return (
    (normalizeDoi(record.doi) ? 8 : 0) +
    (record.abstract ? 4 : 0) +
    (record.authors?.length ? 2 : 0) +
    Math.min(record.title.length, 99) / 100
  );
}

function identityKey(record: FetchedRecord): string {
  return `${record.sourceId}:${record.recordId}:${canonicalUrl(record.sourceUrl)}`;
}

function pickPrimary(a: FetchedRecord, b: FetchedRecord): [FetchedRecord, FetchedRecord] {
  const scoreA = completeness(a);
  const scoreB = completeness(b);
  if (scoreA !== scoreB) return scoreA >= scoreB ? [a, b] : [b, a];
  return identityKey(a) <= identityKey(b) ? [a, b] : [b, a];
}

function mergeRecord(primary: FetchedRecord, extra: FetchedRecord): FetchedRecord {
  const breadcrumb = `merged-from:${extra.sourceId}:${extra.recordId}:${extra.sourceUrl}`;
  return {
    ...primary,
    abstract: primary.abstract || extra.abstract,
    authors: primary.authors?.length ? primary.authors : extra.authors,
    doi: primary.doi || extra.doi,
    dateFields: { ...extra.dateFields, ...primary.dateFields },
    windowMatch: {
      inWindow: primary.windowMatch.inWindow || extra.windowMatch.inWindow,
      matchedFields: [...new Set([...primary.windowMatch.matchedFields, ...extra.windowMatch.matchedFields])],
    },
    urlOrigin: primary.urlOrigin,
    sourceUrl: primary.sourceUrl,
    title: primary.title.length >= extra.title.length ? primary.title : extra.title,
    publishedAt: earlierIso(primary.publishedAt, extra.publishedAt),
    fetchedAt: primary.fetchedAt,
    recordId: primary.recordId,
    sourceId: primary.sourceId,
    sourceName: primary.sourceName,
    studySubjects: [...new Set([...(primary.studySubjects ?? []), ...(extra.studySubjects ?? [])])],
    hints: {
      ...extra.hints,
      ...primary.hints,
      pubTypes: [...new Set([...(primary.hints?.pubTypes ?? []), ...(extra.hints?.pubTypes ?? []), breadcrumb])],
    },
  };
}

function earlierIso(a: string, b: string): string {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  if (Number.isNaN(aTime)) return b;
  if (Number.isNaN(bTime)) return a;
  return aTime <= bTime ? a : b;
}

function mergeGroup(group: FetchedRecord[]): FetchedRecord {
  const sorted = [...group].sort((a, b) => {
    const [primary] = pickPrimary(a, b);
    return primary === a ? -1 : 1;
  });
  return sorted.slice(1).reduce((acc, record) => mergeRecord(acc, record), sorted[0]);
}

class UnionFind {
  private readonly parent: number[];
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
  }
  find(index: number): number {
    if (this.parent[index] !== index) this.parent[index] = this.find(this.parent[index]);
    return this.parent[index];
  }
  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent[rootB] = rootA;
  }
}

export function deduplicate(records: FetchedRecord[]): DeduplicateResult {
  const conflicts: DedupConflict[] = [];
  if (records.length === 0) return { records: [], conflicts };

  const unionFind = new UnionFind(records.length);
  const byDoi = new Map<string, number[]>();
  const byUrl = new Map<string, number[]>();

  records.forEach((record, index) => {
    const doi = normalizeDoi(record.doi);
    const urlKey = canonicalUrl(record.sourceUrl);
    if (doi) {
      const list = byDoi.get(doi) ?? [];
      list.push(index);
      byDoi.set(doi, list);
    }
    const urlList = byUrl.get(urlKey) ?? [];
    urlList.push(index);
    byUrl.set(urlKey, urlList);
  });

  for (const indexes of byDoi.values()) {
    for (let i = 1; i < indexes.length; i += 1) unionFind.union(indexes[0], indexes[i]);
  }

  for (const [urlKey, indexes] of byUrl) {
    const dois = [
      ...new Set(
        indexes
          .map((index) => normalizeDoi(records[index].doi))
          .filter((doi): doi is string => Boolean(doi)),
      ),
    ];
    if (dois.length > 1) {
      conflicts.push({
        kind: "doi-mismatch",
        urls: [urlKey],
        dois,
        recordIds: indexes.map((index) => records[index].recordId),
        reason: "same canonical URL has conflicting DOIs; left unmerged for manual review",
      });
      continue;
    }
    for (let i = 1; i < indexes.length; i += 1) unionFind.union(indexes[0], indexes[i]);
  }

  const groups = new Map<number, FetchedRecord[]>();
  records.forEach((record, index) => {
    const root = unionFind.find(index);
    const group = groups.get(root) ?? [];
    group.push(record);
    groups.set(root, group);
  });

  const merged = [...groups.values()].map(mergeGroup);
  merged.sort((a, b) => identityKey(a).localeCompare(identityKey(b)));
  return { records: merged, conflicts };
}

export function toCandidate(
  record: FetchedRecord & {
    fieldId: Candidate["fieldId"];
    evidence: Candidate["evidence"];
    relevanceScore: number;
    significanceScore: number;
    reason: string;
  },
): Candidate {
  const mergedFrom = record.hints?.pubTypes
    ?.filter((value) => value.startsWith("merged-from:"))
    .map((value) => value.slice("merged-from:".length));

  return {
    sourceId: record.sourceId,
    sourceUrl: record.sourceUrl,
    title: record.title,
    publishedAt: record.publishedAt,
    fetchedAt: record.fetchedAt,
    doi: record.doi,
    abstract: record.abstract,
    authors: record.authors,
    fieldId: record.fieldId,
    evidence: record.evidence,
    relevanceScore: record.relevanceScore,
    significanceScore: record.significanceScore,
    reason: record.reason,
    recordId: record.recordId,
    dateFields: record.dateFields,
    windowMatch: record.windowMatch,
    urlOrigin: record.urlOrigin,
    mergedFrom: mergedFrom?.length ? mergedFrom : undefined,
    studySubjects: record.studySubjects?.length ? record.studySubjects : undefined,
  };
}
