import type { IngestReport } from "../types";
import type { EditorialReport } from "../editorial/types";
import type { ApplyResult } from "./apply";
import type { PublishDecision } from "./policy";

export type PublishReport = {
  generatedAt: string;
  scheduledListingAt: string;
  decision: PublishDecision;
  ingest: Pick<IngestReport, "counts" | "sourceResults">;
  editorial: EditorialReport["counts"] & { heldReasons: { title: string; reasons: string[] }[] };
  apply?: Pick<ApplyResult, "added" | "skipped">;
  changedPaths: string[];
  protectedChanged: string[];
  vercel?: { status: "ok" | "failed" | "skipped"; detail: string };
};

export function publishJobSummary(report: PublishReport): string {
  const lines = [
    `# News auto-publish`,
    ``,
    report.decision.ok
      ? `Decision: publish ${report.decision.publishCount} article(s).`
      : `Decision: do not auto-merge. ${report.decision.reason}`,
    ``,
    `Scheduled listing time (sitePublishedAt): ${report.scheduledListingAt}`,
    `countdownImpact: none. Model files must not change.`,
    ``,
    `## Ingest`,
    ``,
    `Fetched ${report.ingest.counts.fetched} · relevant ${report.ingest.counts.relevant} · rejected ${report.ingest.counts.rejected}`,
    ...report.ingest.sourceResults.map(
      (source) =>
        `- ${source.sourceId}: ${source.status}${source.error ? ` (${source.error})` : ""}`,
    ),
    ``,
    `## Editorial`,
    ``,
    `Drafts ${report.editorial.drafts} · rejected ${report.editorial.rejected} · held ${report.editorial.held}`,
  ];

  if (report.editorial.heldReasons.length > 0) {
    lines.push(``, `### Held`);
    for (const item of report.editorial.heldReasons) {
      lines.push(`- ${item.title}: ${item.reasons.join("; ")}`);
    }
  }

  if (report.apply) {
    lines.push(``, `## Applied`);
    lines.push(`Added ${report.apply.added.length}. Skipped ${report.apply.skipped.length}.`);
    for (const article of report.apply.added) {
      lines.push(`- ${article.en.headline} (${article.sourceUrl})`);
    }
    for (const item of report.apply.skipped) {
      lines.push(`- skipped ${item.slug}: ${item.reason}`);
    }
  }

  if (report.protectedChanged.length > 0) {
    lines.push(``, `## Protected paths`);
    for (const path of report.protectedChanged) lines.push(`- ${path}`);
  }

  if (report.vercel) {
    lines.push(``, `## Vercel`);
    lines.push(`${report.vercel.status}: ${report.vercel.detail}`);
  }

  return lines.join("\n") + "\n";
}
