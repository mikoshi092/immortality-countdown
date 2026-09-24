import type { Candidate } from "../types";
import type { EditorialDraft } from "./types";

/** Fixture records. Must never be imported by data/articles.ts. */
export const FIXTURE_SOURCE_URL =
  "https://pubmed.ncbi.nlm.nih.gov/99999999/" as const;
export const FIXTURE_DOI = "10.0000/fixture.not-a-real-article";

export function fixtureCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    sourceId: "pubmed",
    sourceUrl: FIXTURE_SOURCE_URL,
    title: "Exercise was not significant for lifespan in mice",
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T00:00:00Z",
    doi: FIXTURE_DOI,
    abstract:
      "In mice (n=48), 10 mg treatment was not significant for lifespan.",
    fieldId: "geroscience-drugs-trials",
    evidence: "Evidence D",
    relevanceScore: 70,
    significanceScore: 45,
    reason: "fixture",
    recordId: "pmid-99999999",
    dateFields: {},
    windowMatch: { inWindow: true, matchedFields: ["entrezDate"] },
    urlOrigin: { kind: "constructed-from-id", rule: "pmid", id: "99999999" },
    studySubjects: ["mice"],
    ...overrides,
  };
}

export function validMouseDraft(
  candidate: Candidate,
  overrides: Partial<EditorialDraft> = {},
): EditorialDraft {
  return {
    id: "2026-09-15-exercise-mice-lifespan",
    slug: "2026-09-15-exercise-mice-lifespan",
    sourceUrl: candidate.sourceUrl,
    sourceLabel: "PubMed",
    doi: candidate.doi,
    sourcePublishedAt: candidate.publishedAt,
    draftCreatedAt: candidate.fetchedAt,
    discoveredAt: candidate.fetchedAt,
    fieldId: candidate.fieldId,
    evidence: candidate.evidence,
    studySubjects: candidate.studySubjects ?? ["mice"],
    contentType: "paper",
    countdownImpact: "none",
    localizedFacts: {
      en: {
        studyDesign: "Mouse experiment. Not a human trial.",
        populationOrModel: "mice",
        sampleSize: "n=48",
        intervention: "10 mg",
        outcomes: "Lifespan change was not significant in mice.",
        limitations: "Mouse experiment only.",
        resultStatus: "not significant in mice",
      },
      ja: {
        studyDesign: "マウス実験。人の試験ではない。",
        populationOrModel: "マウス",
        sampleSize: "n=48",
        intervention: "10 mg",
        outcomes: "マウスの寿命変化は有意ではなかった。",
        limitations: "マウス実験のみ。",
        resultStatus: "マウスで有意ではない",
      },
    },
    en: {
      headline: "Exercise was not significant for lifespan in mice",
      dek: "A mouse study (n=48) found 10 mg treatment was not significant for lifespan.",
      whatHappened:
        "In mice (n=48), 10 mg treatment was not significant for lifespan.",
      whyItMatters:
        "A negative mouse result still matters as a caution, not as a human therapy.",
      realityCheck:
        "This is a mouse experiment. It does not show an effect on human lifespan.",
    },
    ja: {
      headline: "マウスの寿命に対し、運動の効果は有意ではなかった",
      dek: "マウス（n=48）で10 mgの処置は寿命に対して有意ではなかった。",
      whatHappened:
        "マウス（n=48）では、10 mgの処置は寿命に対して有意ではなかった。",
      whyItMatters:
        "マウスでの否定的な結果は、注意として意味がある。人の治療ではない。",
      realityCheck:
        "マウスの実験である。人の寿命への効果は示されていない。",
    },
    candidateRecordId: candidate.recordId,
    ...overrides,
  };
}
