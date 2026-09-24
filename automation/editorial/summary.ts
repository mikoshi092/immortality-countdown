import type { EditorialReport } from "./types";

/**
 * GitHub Actions Job Summary markdown.
 * No API keys, no full abstracts, no secret-looking strings.
 */
export function editorialJobSummary(report: EditorialReport): string {
  const lines = [
    `# Editorial drafts`,
    ``,
    `Provider: ${report.provider}${report.model ? ` (${report.model})` : ""}`,
    `Candidates: ${report.counts.candidates} · passed automated checks: ${report.counts.drafts} · rejected: ${report.counts.rejected} · held: ${report.counts.held}`,
    ``,
    `Drafts that passed automated checks are eligible for automatic publication. They do not change LEV years.`,
    ``,
    `## Passed automated checks`,
  ];

  if (report.drafts.length === 0) {
    lines.push(`None.`);
  } else {
    lines.push(`| Title | URL | Evidence | Field | Impact |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const draft of report.drafts) {
      lines.push(
        `| ${cell(draft.en.headline)} | ${cell(draft.sourceUrl)} | ${cell(draft.evidence)} | ${cell(draft.fieldId)} | ${cell(draft.countdownImpact)} |`,
      );
    }
  }

  lines.push(``, `## Rejected or held`);
  if (report.rejectedDrafts.length === 0) {
    lines.push(`None.`);
  } else {
    lines.push(`| Title | URL | Evidence | Field | Status | Reasons |`);
    lines.push(`| --- | --- | --- | --- | --- | --- |`);
    for (const item of report.rejectedDrafts) {
      lines.push(
        `| ${cell(item.title)} | ${cell(item.sourceUrl ?? "")} | ${cell(item.evidence ?? "")} | ${cell(item.fieldId ?? "")} | ${cell(item.status)} | ${cell(item.reasons.join("; "))} |`,
      );
    }
  }

  return lines.join("\n") + "\n";
}

function cell(value: string): string {
  return value.replaceAll("|", "/").replaceAll("\n", " ").slice(0, 180);
}
