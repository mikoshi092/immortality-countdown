/**
 * Phase 3.1 editorial dry-run.
 *
 *   npm run editorial:dry
 *
 * Reads automation/output/candidates.json and writes
 * automation/output/editorial-drafts.json.
 *
 * Does not append to data/news.ts or data/articles.ts.
 * Does not commit, open a PR, or write lev/params.json / lev/forecast.json.
 *
 * Default provider is OpenAI and requires OPENAI_API_KEY.
 * Local tests use EDITORIAL_PROVIDER=mock.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { IngestReport } from "../types";
import { EDITORIAL_CONFIG, type EnvVars } from "./config";
import { generateDrafts } from "./generate";
import { MockEditorialProvider } from "./mock-provider";
import { OpenAIEditorialProvider } from "./openai-provider";
import { redactSecrets } from "./from-candidate";
import { editorialJobSummary } from "./summary";
import type { EditorialProvider, EditorialProviderName, EditorialReport } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const defaultInputPath = join(here, "../output", "candidates.json");
const defaultOutputPath = join(here, "../output", "editorial-drafts.json");

export type RunEditorialOptions = {
  inputPath?: string;
  outputPath?: string;
  write?: boolean;
  provider?: EditorialProvider;
  env?: EnvVars;
  now?: Date;
};

export function selectProvider(env: EnvVars = process.env): EditorialProvider {
  const name = (env[EDITORIAL_CONFIG.providerEnv]?.trim() ||
    "openai") as EditorialProviderName;
  if (name === "mock") return new MockEditorialProvider();
  if (name === "openai") return new OpenAIEditorialProvider({ env });
  throw new Error(
    `Unknown ${EDITORIAL_CONFIG.providerEnv}=${name}. Use openai or mock.`,
  );
}

export async function runEditorial(
  options: RunEditorialOptions = {},
): Promise<EditorialReport> {
  const inputPath = options.inputPath ?? defaultInputPath;
  const outputPath = options.outputPath ?? defaultOutputPath;
  const env = options.env ?? process.env;

  if (!existsSync(inputPath)) {
    throw new Error(
      `Candidates file not found: ${inputPath}. Run npm run ingest:dry first.`,
    );
  }

  const report = JSON.parse(readFileSync(inputPath, "utf8")) as IngestReport;
  const candidates = report.candidates ?? [];
  const provider = options.provider ?? selectProvider(env);

  const result = await generateDrafts(candidates, provider, options.now ?? new Date());
  result.inputPath = inputPath;

  if (options.write !== false) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  }

  const summary = editorialJobSummary(result);
  const summaryPath = env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    writeFileSync(summaryPath, summary, { flag: "a" });
  }

  return result;
}

function isMain(): boolean {
  const entry = process.argv[1];
  return Boolean(entry && import.meta.url === pathToFileURL(entry).href);
}

if (isMain()) {
  runEditorial()
    .then((result) => {
      console.log(editorialJobSummary(result));
      console.log(
        `wrote ${result.counts.drafts} drafts, ${result.counts.rejected} rejected, ${result.counts.held} held`,
      );
    })
    .catch((error: unknown) => {
      const message = redactSecrets(
        error instanceof Error ? error.message : String(error),
        process.env[EDITORIAL_CONFIG.apiKeyEnv],
      );
      console.error(message);
      const summaryPath = process.env.GITHUB_STEP_SUMMARY;
      if (summaryPath) {
        writeFileSync(
          summaryPath,
          `# Editorial drafts\n\nGeneration failed: ${message}\n`,
          { flag: "a" },
        );
      }
      process.exitCode = 1;
    });
}
