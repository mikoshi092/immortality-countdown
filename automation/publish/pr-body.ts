import { redactSecrets } from "../editorial/from-candidate";
import type { EditorialReport } from "../editorial/types";
import type { ApplyResult } from "./apply";

function line(value: string): string {
  return value.replaceAll("\r", " ").replaceAll("\n", " ").slice(0, 240);
}

export function autoPublishPrBody(input: {
  ingestCounts: { fetched: number; relevant: number; rejected: number };
  editorial: EditorialReport;
  apply: ApplyResult;
  scheduledListingAt: string;
}): string {
  const { editorial, apply } = input;
  const lines = [
    "## Automatic news publish",
    "",
    `Adopted: **${apply.added.length}** · held: **${editorial.counts.held}** · rejected: **${editorial.counts.rejected}**`,
    "",
    "News does not change LEV years. `countdownImpact` is `none` on every adopted article.",
    "Model files were not changed.",
    "",
    `Ingest fetched ${input.ingestCounts.fetched}, relevant ${input.ingestCounts.relevant}, rejected ${input.ingestCounts.rejected}.`,
    "",
    `\`draftCreatedAt\` is the article-file generation time. \`sitePublishedAt\` is the scheduled listing time (${input.scheduledListingAt}). Actual production visibility can lag until required checks pass and the PR merges.`,
    "",
    "### Adopted articles",
  ];

  if (apply.added.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| Title | URL | DOI | Evidence | studySubjects | relevance/significance | validation | countdownImpact |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const article of apply.added) {
      const draft = editorial.drafts.find((item) => item.slug === article.slug);
      const scores =
        draft?.relevanceScore != null && draft.significanceScore != null
          ? `${draft.relevanceScore}/${draft.significanceScore}`
          : "n/a";
      lines.push(
        `| ${line(article.en.headline)} | ${article.sourceUrl} | ${article.doi ?? ""} | ${article.evidence} | ${(article.studySubjects ?? []).join(", ")} | ${scores} | passed | none |`,
      );
    }
  }

  if (apply.skipped.length > 0) {
    lines.push("", "### Skipped");
    for (const item of apply.skipped) {
      lines.push(`- ${line(item.slug)}: ${line(item.reason)}`);
    }
  }

  lines.push("", "### Held or rejected");
  if (editorial.rejectedDrafts.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| Title | URL | Status | Reasons |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of editorial.rejectedDrafts) {
      lines.push(
        `| ${line(item.title)} | ${item.sourceUrl ?? ""} | ${item.status} | ${line(item.reasons.join("; "))} |`,
      );
    }
  }

  lines.push(
    "",
    "### Automated validation",
    "",
    "- relevance and significance at or above current thresholds",
    "- URL / DOI / source ID match",
    "- no URL or DOI duplicate",
    "- no Evidence upgrade",
    "- studySubjects match English and Japanese copy",
    "- English and Japanese numbers match source materials",
    "- countdownImpact is none",
    "",
    "This body omits full abstracts and API keys.",
  );

  return redactSecrets(lines.join("\n") + "\n");
}
