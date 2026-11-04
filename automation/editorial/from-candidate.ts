import type { ContentType } from "../../data/articles";
import type { Candidate, DateFieldValue } from "../types";
import type { EditorialPromptInput } from "./types";
import { isScienceNews } from "../science-news";

function datedIso(value: DateFieldValue | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.iso;
}

export function inferContentType(candidate: Candidate): ContentType {
  if (isScienceNews(candidate)) return "science-news";
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
  if (host.includes("sciencedaily.com")) return "ScienceDaily";
  if (host.includes("newatlas.com")) return "New Atlas";
  if (host.includes("genengnews.com")) return "GEN";
  if (host.includes("fiercebiotech.com")) return "Fierce Biotech";
  if (host.includes("fightaging.org")) return "Fight Aging!";
  if (host.includes("gigazine.net")) return "GIGAZINE";
  if (host.startsWith("nazology.")) return "ナゾロジー";
  if (host.includes("scienceportal.jst.go.jp")) return "サイエンスポータル";
  if (host.includes("gooday.nikkei.co.jp")) return "日経Gooday";
  if (host.includes("univ-journal.jp")) return "大学ジャーナル";
  if (host.includes("riken.jp")) return "理化学研究所";
  if (host.includes("healthdayjapan.com")) return "ヘルスデージャパン";
  if (host.includes("news.mynavi.jp")) return "マイナビニュース";
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
