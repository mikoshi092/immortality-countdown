import { articles, type Article } from "../../data/articles";
import { matchWindow } from "../fetch";
import { toCandidate } from "../normalize";
import { rankRecord } from "../rank";
import { exclusionReasons } from "../noise";
import { type Candidate, type FetchedRecord, type RankedRecord } from "../types";
import { validateDraft } from "../editorial/validate";
import type { EditorialDraft } from "../editorial/types";

/**
 * Verified title/abstract excerpts used to run the same publish gate
 * on the three existing articles. Numbers are taken from the opened
 * abstracts and papers, not invented.
 */
export const EXISTING_SOURCE_EXCERPTS: FetchedRecord[] = [
  {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "s41591-026-04566-5",
    title:
      "Deep-learning histological aging signatures across 40 human tissue types",
    sourceUrl: "https://www.nature.com/articles/s41591-026-04566-5",
    urlOrigin: {
      kind: "constructed-from-id",
      rule: "existing-article-doi",
      id: "10.1038/s41591-026-04566-5",
    },
    publishedAt: "2026-08-14T00:00:00Z",
    fetchedAt: "2026-08-14T00:00:00Z",
    dateFields: { publicationDate: "2026-08-14T00:00:00Z" },
    windowMatch: matchWindow(
      { publicationDate: "2026-08-14T00:00:00Z" },
      {
        from: new Date("2026-08-13T00:00:00Z"),
        to: new Date("2026-08-15T00:00:00Z"),
        fromDay: "2026-08-13",
        toDay: "2026-08-15",
      },
    ),
    doi: "10.1038/s41591-026-04566-5",
    abstract:
      "We trained deep-learning models on histopathology whole-slide images to estimate tissue-specific biological age. Primary training used 25,712 whole-slide images from 983 GTEx donors collected under a rapid autopsy protocol, covering 40 human tissue types. Independent analyses used consented living-participant skin biopsies and blood samples. The resulting aging signatures were associated with established aging markers.",
  },
  {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "s43587-026-01177-0",
    title:
      "Physical activity is associated with later menopause and delays ovarian aging in mice",
    sourceUrl: "https://www.nature.com/articles/s43587-026-01177-0",
    urlOrigin: {
      kind: "constructed-from-id",
      rule: "existing-article-doi",
      id: "10.1038/s43587-026-01177-0",
    },
    publishedAt: "2026-08-14T00:00:00Z",
    fetchedAt: "2026-08-14T00:00:00Z",
    dateFields: { publicationDate: "2026-08-14T00:00:00Z" },
    windowMatch: matchWindow(
      { publicationDate: "2026-08-14T00:00:00Z" },
      {
        from: new Date("2026-08-13T00:00:00Z"),
        to: new Date("2026-08-15T00:00:00Z"),
        fromDay: "2026-08-13",
        toDay: "2026-08-15",
      },
    ),
    doi: "10.1038/s43587-026-01177-0",
    abstract:
      "Cross-sectional analyses of 152,435 UK Biobank participants and 12,418 NHANES participants associated higher physical activity with premenopausal status and, among postmenopausal UK Biobank participants, with age at menopause. In mice, physical activity delayed ovarian aging. Adiponectin signaling was implicated, and AdipoRon delayed ovarian aging and extended reproductive lifespan in mice.",
  },
  {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "s43587-026-01170-7",
    title: "Systemic TNF signaling drives intestinal stem-cell aging in mice",
    sourceUrl: "https://www.nature.com/articles/s43587-026-01170-7",
    urlOrigin: {
      kind: "constructed-from-id",
      rule: "existing-article-doi",
      id: "10.1038/s43587-026-01170-7",
    },
    publishedAt: "2026-08-11T00:00:00Z",
    fetchedAt: "2026-08-11T00:00:00Z",
    dateFields: { publicationDate: "2026-08-11T00:00:00Z" },
    windowMatch: matchWindow(
      { publicationDate: "2026-08-11T00:00:00Z" },
      {
        from: new Date("2026-08-10T00:00:00Z"),
        to: new Date("2026-08-12T00:00:00Z"),
        fromDay: "2026-08-10",
        toDay: "2026-08-12",
      },
    ),
    doi: "10.1038/s43587-026-01170-7",
    abstract:
      "Heterochronic parabiosis, mouse experiments, and intestinal organoids linked aged blood-borne TNF-TNFR1 signaling to declining intestinal stem-cell function, mitochondrial dysfunction, and reduced fatty-acid oxidation. Organoid formation from aged crypts declined by about 30% in the reported assay. Anti-inflammatory drugs, including TNF antibodies, restored function in mice. TNFR1 knockout protected young intestinal stem cells from the old environment. This is not a human outcome trial.",
  },
];

export type ExistingGateResult = {
  articleId: string;
  ok: boolean;
  hold: boolean;
  reasons: string[];
  relevanceScore?: number;
  significanceScore?: number;
  evidence?: string;
  excluded?: string[];
};

function articleToDraft(article: Article, recordId: string): EditorialDraft {
  return {
    ...article,
    candidateRecordId: recordId,
  };
}

const NO_SOURCE_BASIS = "no verified source excerpt; hold because the source cannot be checked";

function savedCandidate(article: Article): Candidate | undefined {
  const saved = article.sourceCheck;
  if (!saved?.recordId || !saved.sourceUrl || !saved.title || !saved.fieldId || !saved.evidence) {
    return undefined;
  }
  return saved;
}

function rankedFromSaved(saved: Candidate): RankedRecord {
  return {
    sourceId: saved.sourceId,
    sourceName: saved.sourceId,
    recordId: saved.recordId,
    title: saved.title,
    sourceUrl: saved.sourceUrl,
    urlOrigin: saved.urlOrigin,
    publishedAt: saved.publishedAt,
    fetchedAt: saved.fetchedAt,
    dateFields: saved.dateFields,
    windowMatch: saved.windowMatch,
    doi: saved.doi,
    abstract: saved.abstract,
    authors: saved.authors,
    hints: saved.hints,
    studySubjects: saved.studySubjects,
    fieldId: saved.fieldId,
    evidence: saved.evidence,
    relevanceScore: saved.relevanceScore,
    significanceScore: saved.significanceScore,
    reason: saved.reason,
  };
}

function gateFromSavedSource(
  article: Article,
  catalog: readonly Article[],
): ExistingGateResult {
  const saved = savedCandidate(article);
  if (!saved) {
    return {
      articleId: article.id,
      ok: false,
      hold: true,
      reasons: [NO_SOURCE_BASIS],
    };
  }
  const excluded = exclusionReasons(rankedFromSaved(saved));
  if (excluded.length > 0) {
    return {
      articleId: article.id,
      ok: false,
      hold: false,
      reasons: excluded,
      excluded,
      relevanceScore: saved.relevanceScore,
      significanceScore: saved.significanceScore,
      evidence: saved.evidence,
    };
  }
  const others = catalog.filter((entry) => entry.slug !== article.slug);
  const result = validateDraft(
    articleToDraft(article, saved.recordId),
    saved,
    new Set(),
    others,
  );
  if (result.ok) {
    return {
      articleId: article.id,
      ok: true,
      hold: false,
      reasons: [],
      relevanceScore: saved.relevanceScore,
      significanceScore: saved.significanceScore,
      evidence: saved.evidence,
    };
  }
  return {
    articleId: article.id,
    ok: false,
    hold: result.hold,
    reasons: result.reasons,
    relevanceScore: saved.relevanceScore,
    significanceScore: saved.significanceScore,
    evidence: saved.evidence,
  };
}

export function gateExistingArticles(
  catalog: readonly Article[] = articles,
): ExistingGateResult[] {
  return catalog.map((article) => {
    const fetched = EXISTING_SOURCE_EXCERPTS.find(
      (record) => record.doi === article.doi || record.sourceUrl === article.sourceUrl,
    );
    if (!fetched) return gateFromSavedSource(article, catalog);
    const ranked = rankRecord(fetched);
    const excluded = exclusionReasons(ranked);
    if (excluded.length > 0) {
      return {
        articleId: article.id,
        ok: false,
        hold: false,
        reasons: excluded,
        excluded,
        relevanceScore: ranked.relevanceScore,
        significanceScore: ranked.significanceScore,
        evidence: ranked.evidence,
      };
    }
    const candidate = toCandidate(ranked);
    const others = catalog.filter((entry) => entry.slug !== article.slug);
    const result = validateDraft(
      articleToDraft(article, fetched.recordId),
      candidate,
      new Set(),
      others,
    );
    if (result.ok) {
      return {
        articleId: article.id,
        ok: true,
        hold: false,
        reasons: [],
        relevanceScore: ranked.relevanceScore,
        significanceScore: ranked.significanceScore,
        evidence: ranked.evidence,
      };
    }
    return {
      articleId: article.id,
      ok: false,
      hold: result.hold,
      reasons: result.reasons,
      relevanceScore: ranked.relevanceScore,
      significanceScore: ranked.significanceScore,
      evidence: ranked.evidence,
    };
  });
}
