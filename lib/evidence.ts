/**
 * Evidence labels for news and ingest. This module exists so article data
 * and the older NewsItem adapter can share the type without importing
 * each other.
 */
export const EVIDENCE_LEVELS = [
  "Evidence A",
  "Evidence B",
  "Evidence C",
  "Evidence D",
  "Evidence E",
] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
