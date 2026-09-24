/**
 * Semi-annual LEV model review helper.
 *
 * Lists published articles as evidence candidates. Does not write
 * lev/params.json or lev/forecast.json and never auto-merges.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { listArticles } from "../../data/articles";

const here = dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = join(here, "../output", "model-review.json");
const defaultPrBodyPath = join(here, "../output", "model-review-pr.md");

export type ModelReviewReport = {
  generatedAt: string;
  autoMerge: false;
  changesLevYears: false;
  evidenceCandidates: {
    id: string;
    slug: string;
    title: string;
    sourceUrl: string;
    doi?: string;
    evidence: string;
    fieldId: string;
    sourcePublishedAt: string;
    sitePublishedAt?: string;
  }[];
};

export function runModelReview(now = new Date()): ModelReviewReport {
  const published = listArticles();
  return {
    generatedAt: now.toISOString(),
    autoMerge: false,
    changesLevYears: false,
    evidenceCandidates: published.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.en.headline,
      sourceUrl: article.sourceUrl,
      doi: article.doi,
      evidence: article.evidence,
      fieldId: article.fieldId,
      sourcePublishedAt: article.sourcePublishedAt,
      sitePublishedAt: article.sitePublishedAt,
    })),
  };
}

export function modelReviewPrBody(report: ModelReviewReport): string {
  const lines = [
    "## Semi-annual model review",
    "",
    `Evidence candidates from published news articles: **${report.evidenceCandidates.length}**.`,
    "",
    "This pull request only lists those articles. It does not change `lev/params.json`, `lev/forecast.json`, model code, or the countdown.",
    "",
    "- Auto-merge is forbidden.",
    "- A model-change proposal, if any, must be a separate pull request.",
    "- Monte Carlo was not rerun here. A human reviews any rerun before a model change.",
    "- Daily news auto-publish must not move countdown values.",
    "",
  ];
  if (report.evidenceCandidates.length === 0) {
    lines.push("No published articles are available as evidence candidates.");
  } else {
    lines.push("| Title | URL | DOI | Evidence |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of report.evidenceCandidates) {
      lines.push(`| ${item.title.replaceAll("|", "/")} | ${item.sourceUrl} | ${item.doi ?? ""} | ${item.evidence} |`);
    }
  }
  return lines.join("\n") + "\n";
}

function jobSummary(report: ModelReviewReport): string {
  return [
    `# Semi-annual model review`,
    ``,
    `Auto-merge is forbidden. This workflow must not write lev/params.json or lev/forecast.json.`,
    `News auto-publish never moves countdown values. A human must review any Monte Carlo rerun.`,
    ``,
    `Evidence candidates from published articles: ${report.evidenceCandidates.length}`,
    ...report.evidenceCandidates.map(
      (item) => `- ${item.title} (${item.evidence}, ${item.fieldId}) ${item.sourceUrl}`,
    ),
    ``,
  ].join("\n");
}

const isCli =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const report = runModelReview();
  mkdirSync(dirname(defaultOutputPath), { recursive: true });
  writeFileSync(defaultOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(defaultPrBodyPath, modelReviewPrBody(report), "utf8");
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  const summary = jobSummary(report);
  if (summaryPath) writeFileSync(summaryPath, summary, { flag: "a" });
  console.log(summary);
}
