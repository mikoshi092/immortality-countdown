import type { ContentType } from "../../data/articles";
import type { Candidate, DateFieldValue } from "../types";
import type { EditorialPromptInput } from "./types";

function datedIso(value: DateFieldValue | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.iso;
}

export function inferContentType(candidate: Candidate): ContentType {
  const url = candidate.sourceUrl.toLowerCase();
  const title = candidate.title.toLowerCase();
  if (
    candidate.sourceId.includes("clinicaltrials") ||
    url.includes("clinicaltrials.gov") ||
    /\bnct\d{8}\b/i.test(title)
  ) {
    return "trial-registration";
  }
  if (/\bsystematic review\b|\bmeta-analysis\b|\breview\b/i.test(title)) {
    return "review";
  }
  return "paper";
}

export function promptInputFromCandidate(
  candidate: Candidate,
): EditorialPromptInput {
  return {
    title: candidate.title,
    abstract: candidate.abstract,
    sourceUrl: candidate.sourceUrl,
    doi: candidate.doi,
    fieldId: candidate.fieldId,
    evidence: candidate.evidence,
    studySubjects: candidate.studySubjects ?? [],
    publishedAt: candidate.publishedAt,
    journal: candidate.hints?.journal,
    studyType: candidate.hints?.studyType,
    phases: candidate.hints?.phases,
    overallStatus: candidate.hints?.overallStatus,
    hasResults: candidate.hints?.hasResults,
    studyFirstPostDate: datedIso(candidate.dateFields.studyFirstPostDate),
    lastUpdatePostDate: datedIso(candidate.dateFields.lastUpdatePostDate),
    contentType: inferContentType(candidate),
  };
}

export function sourceLabelFromUrl(sourceUrl: string): string {
  const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
  if (host.includes("clinicaltrials.gov")) return "ClinicalTrials.gov";
  if (host.includes("pubmed.ncbi.nlm.nih.gov")) return "PubMed";
  if (host.includes("nature.com")) return "Nature";
  return host;
}

export function slugFromTitle(publishedAt: string, title: string, fallback: string): string {
  const day = publishedAt.slice(0, 10) || "undated";
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${day}-${slug || fallback.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function redactSecrets(text: string, apiKey?: string): string {
  let out = text;
  if (apiKey && apiKey.length > 0) {
    out = out.split(apiKey).join("[redacted]");
  }
  return out.replace(/\bsk-[A-Za-z0-9_-]{10,}\b/g, "[redacted]");
}
