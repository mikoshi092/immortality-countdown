import { articles } from "../../data/articles";
import type { Candidate } from "../types";
import {
  inferContentType,
  promptInputFromCandidate,
  slugFromTitle,
  sourceLabelFromUrl,
} from "./from-candidate";
import { InvalidGeneratedCopyError } from "./generated-copy";
import type {
  EditorialDraft,
  EditorialProvider,
  EditorialReport,
  RejectedDraft,
} from "./types";
import { validateDraft } from "./validate";

export async function generateDrafts(
  candidates: Candidate[],
  provider: EditorialProvider,
  now = new Date(),
): Promise<EditorialReport> {
  const existingSlugs = new Set(articles.map((article) => article.slug));
  const drafts: EditorialDraft[] = [];
  const rejectedDrafts: RejectedDraft[] = [];

  for (const candidate of candidates) {
    const input = promptInputFromCandidate(candidate);
    let generated;
    try {
      generated = await provider.generate(input);
    } catch (error) {
      if (error instanceof InvalidGeneratedCopyError) {
        rejectedDrafts.push({
          recordId: candidate.recordId,
          title: candidate.title,
          sourceUrl: candidate.sourceUrl,
          fieldId: candidate.fieldId,
          evidence: candidate.evidence,
          reasons: error.reasons,
          status: "held",
        });
        continue;
      }
      throw error instanceof Error
        ? error
        : new Error("Editorial provider failed.");
    }

    if (generated.countdownImpact !== "none") {
      rejectedDrafts.push({
        recordId: candidate.recordId,
        title: candidate.title,
        sourceUrl: candidate.sourceUrl,
        fieldId: candidate.fieldId,
        evidence: candidate.evidence,
        reasons: ["countdownImpact must be none"],
        status: "rejected",
      });
      continue;
    }

    const slug = slugFromTitle(
      candidate.publishedAt,
      generated.en.headline || candidate.title,
      candidate.recordId,
    );

    const draft: EditorialDraft = {
      id: slug,
      slug,
      sourceUrl: candidate.sourceUrl,
      sourceLabel: sourceLabelFromUrl(candidate.sourceUrl),
      doi: candidate.doi,
      sourcePublishedAt: candidate.publishedAt,
      draftCreatedAt: now.toISOString(),
      discoveredAt: candidate.fetchedAt,
      fieldId: candidate.fieldId,
      evidence: candidate.evidence,
      studySubjects: candidate.studySubjects ?? [],
      contentType: inferContentType(candidate),
      countdownImpact: "none",
      localizedFacts: generated.localizedFacts,
      en: generated.en,
      ja: generated.ja,
      candidateRecordId: candidate.recordId,
      relevanceScore: candidate.relevanceScore,
      significanceScore: candidate.significanceScore,
      sourceCheck: candidate,
    };

    const result = validateDraft(draft, candidate, existingSlugs, articles);
    if (!result.ok) {
      rejectedDrafts.push({
        recordId: candidate.recordId,
        title: candidate.title,
        sourceUrl: candidate.sourceUrl,
        fieldId: candidate.fieldId,
        evidence: candidate.evidence,
        reasons: result.reasons,
        status: result.hold ? "held" : "rejected",
      });
      continue;
    }

    existingSlugs.add(draft.slug);
    drafts.push(draft);
  }

  return {
    generatedAt: now.toISOString(),
    provider: provider.name,
    model: provider.model,
    inputPath: "",
    counts: {
      candidates: candidates.length,
      drafts: drafts.length,
      rejected: rejectedDrafts.filter((item) => item.status === "rejected").length,
      held: rejectedDrafts.filter((item) => item.status === "held").length,
    },
    drafts,
    rejectedDrafts,
  };
}
