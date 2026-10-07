import type { FieldId } from "../lib/fields";
import type { EvidenceLevel } from "../data/news";

/**
 * Ranking cutoffs live in one place. These numbers are operational
 * filters for the ingest dry-run, not a calibrated scientific index.
 */
export const RANK_THRESHOLDS = {
  minRelevance: 50,
  minSignificance: 30,
} as const;

export const LOOKBACK_HOURS = 48;

export type SourceType = "literature" | "trial-registry" | "science-news";

/** Higher number = more editorial caution required, not a quality score. */
export type TrustTier = 1 | 2 | 3;

export type SourceApiKind = "pubmed-eutils" | "ctgov-studies" | "nature-rss";

export type SourceApi = {
  kind: SourceApiKind;
  /** Official HTTP API base used by the adapter. Not the public HTML site. */
  baseUrl: string;
};

export type SourceDefinition = {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  enabled: boolean;
  trustTier: TrustTier;
  api: SourceApi;
};

export type UrlOrigin = {
  kind: "constructed-from-id" | "source-feed";
  rule: string;
  id: string;
};

export type DatePrecision = "datetime" | "day" | "month" | "year";

/**
 * A source date with the precision the source actually gave.
 * Do not store a day/month/year as a midnight datetime — matchWindow
 * would then treat it as an exact instant.
 */
export type DatedValue = {
  raw: string;
  iso: string;
  precision: DatePrecision;
  /** Present only when the source stated a timezone (Z or numeric offset). */
  timeZone?: string;
};

export type DateFieldValue = string | DatedValue;

/**
 * Date fields are stored separately on purpose. Do not treat publication
 * date as indexing date, or a trial's first-posted date as its last update.
 */
export type RecordDateFields = {
  publicationDate?: DateFieldValue;
  entrezDate?: DateFieldValue;
  createDate?: DateFieldValue;
  studyFirstPostDate?: DateFieldValue;
  lastUpdatePostDate?: DateFieldValue;
};

export type WindowMatch = {
  inWindow: boolean;
  matchedFields: string[];
};

export type StudyHints = {
  pubTypes?: string[];
  journal?: string;
  studyType?: string;
  phases?: string[];
  hasResults?: boolean;
  overallStatus?: string;
  /**
   * Verified description of what changed on a registry update.
   * Absent means the fetch did not identify the change.
   */
  registryChange?: string;
};

export type FetchedRecord = {
  sourceId: string;
  sourceName: string;
  recordId: string;
  title: string;
  sourceUrl: `https://${string}`;
  urlOrigin: UrlOrigin;
  publishedAt: string;
  fetchedAt: string;
  dateFields: RecordDateFields;
  windowMatch: WindowMatch;
  doi?: string;
  abstract?: string;
  authors?: string[];
  hints?: StudyHints;
  studySubjects?: string[];
};

export type RankedRecord = FetchedRecord & {
  fieldId: FieldId;
  evidence: EvidenceLevel;
  relevanceScore: number;
  significanceScore: number;
  reason: string;
};

export type Candidate = {
  sourceId: string;
  sourceUrl: `https://${string}`;
  title: string;
  publishedAt: string;
  fetchedAt: string;
  doi?: string;
  abstract?: string;
  authors?: string[];
  fieldId: FieldId;
  evidence: EvidenceLevel;
  relevanceScore: number;
  significanceScore: number;
  reason: string;
  recordId: string;
  dateFields: RecordDateFields;
  windowMatch: WindowMatch;
  urlOrigin: UrlOrigin;
  mergedFrom?: string[];
  studySubjects?: string[];
  /** Copied from the normalized record when present. Do not invent values. */
  hints?: StudyHints;
};

export type Rejection = {
  recordId: string;
  sourceId: string;
  title: string;
  sourceUrl?: string;
  reasons: string[];
  fieldId?: FieldId;
  evidence?: EvidenceLevel;
  relevanceScore?: number;
  significanceScore?: number;
};

export type FetchStatus = "ok" | "partial" | "failed";

export type SourceIssue = {
  stage: string;
  kind:
    | "http"
    | "parse"
    | "truncated"
    | "abstract-missing-in-source"
    | "abstract-fetch-failed"
    | "abstract-not-in-response";
  count: number;
  message: string;
};

export type SourceFetchResult = {
  sourceId: string;
  ok: boolean;
  status: FetchStatus;
  records: FetchedRecord[];
  error?: string;
  issues?: SourceIssue[];
  truncated?: boolean;
  requestCount: number;
};

export type DedupConflict = {
  kind: "doi-mismatch";
  urls: string[];
  dois: string[];
  recordIds: string[];
  reason: string;
};

export type CountDefinitions = {
  fetched: string;
  deduplicated: string;
  relevant: string;
  rejected: string;
};

export const COUNT_DEFINITIONS: CountDefinitions = {
  fetched:
    "Records successfully returned by a source adapter before deduplication. A failed source is reported as a fetch error, not as zero new items. Partial fetch failures keep the records that arrived and are not treated as complete success.",
  deduplicated:
    "Unique records after merging by DOI (preferred) then canonical source URL, including the case where only one copy has a DOI. Provenance from merged records is retained. Conflicting DOIs on the same URL are not silently merged.",
  relevant:
    "Deduplicated records that passed validation and the ranking thresholds (relevance >= 50 and significance >= 30). These scores are not a scientifically calibrated index.",
  rejected:
    "Deduplicated records that did not become relevant, including threshold misses and validation failures. See each item's reasons.",
};

export type IngestReport = {
  generatedAt: string;
  lookbackHours: number;
  windowFrom: string;
  windowTo: string;
  nodeVersion: string;
  counts: {
    fetched: number;
    deduplicated: number;
    relevant: number;
    rejected: number;
  };
  countDefinitions: CountDefinitions;
  sourceResults: Array<{
    sourceId: string;
    ok: boolean;
    status: FetchStatus;
    fetched: number;
    error?: string;
    truncated?: boolean;
    issues?: SourceIssue[];
  }>;
  dedupConflicts?: DedupConflict[];
  scoreDisclaimer: string;
  candidates: Candidate[];
  rejected: Rejection[];
};

export const SCORE_DISCLAIMER =
  "relevanceScore and significanceScore are explainable rule-based filters for triage. They are not scientifically calibrated measures of study quality, clinical importance, or likelihood of changing a field score.";
