import { FIELD_IDS } from "../lib/fields";
import type { Candidate, FetchedRecord, Rejection } from "./types";
import { canonicalUrl, dateFieldIso, normalizeDoi } from "./fetch";

const PLACEHOLDER_HOSTS = ["example.com", "example.org", "localhost", "127.0.0.1", "test.com"];

export type ValidationContext = {
  fetchedUrls: Set<string>;
  fetchedDois: Set<string>;
  nowMs?: number;
};

export function contextFromFetched(records: FetchedRecord[]): ValidationContext {
  return {
    fetchedUrls: new Set(records.map((record) => canonicalUrl(record.sourceUrl))),
    fetchedDois: new Set(
      records
        .map((record) => normalizeDoi(record.doi))
        .filter((doi): doi is string => Boolean(doi)),
    ),
  };
}

export function validateCandidate(candidate: Candidate, ctx: ValidationContext): string[] {
  const reasons: string[] = [];
  const now = ctx.nowMs ?? Date.now();

  if (!candidate.title?.trim()) reasons.push("empty title");

  if (!(FIELD_IDS as readonly string[]).includes(candidate.fieldId)) {
    reasons.push(`unknown fieldId ${candidate.fieldId}`);
  }

  try {
    const url = new URL(candidate.sourceUrl);
    if (url.protocol !== "https:") reasons.push("sourceUrl must be https");
    if (PLACEHOLDER_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
      reasons.push("sourceUrl host is a placeholder");
    }
    if (!ctx.fetchedUrls.has(canonicalUrl(candidate.sourceUrl))) {
      reasons.push("sourceUrl was not recorded by the fetch adapters");
    }
  } catch {
    reasons.push("sourceUrl is not a valid URL");
  }

  if (candidate.doi) {
    const doi = normalizeDoi(candidate.doi);
    if (!doi || !/^10\.\d{4,9}\/\S+$/.test(doi)) {
      reasons.push("malformed DOI");
    }
  }

  const published = Date.parse(candidate.publishedAt);
  if (Number.isNaN(published)) reasons.push("publishedAt is not a valid date");
  else if (published > now + 5 * 60_000) reasons.push("publishedAt is in the future");

  const fetched = Date.parse(candidate.fetchedAt);
  if (Number.isNaN(fetched)) reasons.push("fetchedAt is not a valid date");
  else if (fetched > now + 5 * 60_000) reasons.push("fetchedAt is in the future");

  for (const [name, value] of Object.entries(candidate.dateFields)) {
    if (!value) continue;
    const iso = dateFieldIso(value);
    const time = iso ? Date.parse(iso) : Number.NaN;
    if (Number.isNaN(time)) reasons.push(`${name} is not a valid date`);
    else if (time > now + 5 * 60_000) reasons.push(`${name} is in the future`);
  }

  return reasons;
}

export function validateCandidates(candidates: Candidate[], ctx: ValidationContext): {
  accepted: Candidate[];
  rejected: Rejection[];
} {
  const accepted: Candidate[] = [];
  const rejected: Rejection[] = [];
  const seenKeys = new Set<string>();

  for (const candidate of candidates) {
    const reasons = validateCandidate(candidate, ctx);
    const doi = normalizeDoi(candidate.doi);
    const key = doi ? `doi:${doi}` : `url:${canonicalUrl(candidate.sourceUrl)}`;
    if (seenKeys.has(key)) reasons.push("duplicate of an earlier accepted or rejected record");
    seenKeys.add(key);

    if (reasons.length > 0) {
      rejected.push({
        recordId: candidate.recordId,
        sourceId: candidate.sourceId,
        title: candidate.title,
        sourceUrl: candidate.sourceUrl,
        reasons,
        fieldId: candidate.fieldId,
        evidence: candidate.evidence,
        relevanceScore: candidate.relevanceScore,
        significanceScore: candidate.significanceScore,
      });
      continue;
    }
    accepted.push(candidate);
  }

  return { accepted, rejected };
}
