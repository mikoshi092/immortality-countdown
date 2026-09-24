import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runEditorial, selectProvider } from "./run";
import { fixtureCandidate } from "./fixtures";
import { editorialJobSummary } from "./summary";
import { generateDrafts } from "./generate";
import { MockEditorialProvider } from "./mock-provider";
import type { IngestReport } from "../types";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function sha(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("editorial dry-run", () => {
  it("does not write lev/params.json or lev/forecast.json", () => {
    const files = readdirSync(here).filter(
      (name) => name.endsWith(".ts") && !name.endsWith(".test.ts"),
    );
    const combined = files.map((name) => readFileSync(join(here, name), "utf8")).join("\n");
    assert.equal(/writeFileSync\([^)]*lev\/(params|forecast)\.json/.test(combined), false);
    assert.equal(/writeFile\([^)]*lev\/(params|forecast)\.json/.test(combined), false);
  });

  it("does not append to published article files", () => {
    const files = readdirSync(here).filter(
      (name) => name.endsWith(".ts") && !name.endsWith(".test.ts"),
    );
    const combined = files.map((name) => readFileSync(join(here, name), "utf8")).join("\n");
    assert.equal(/writeFileSync\([^)]*data\/(news|articles)\.ts/.test(combined), false);
  });

  it("running with a mock provider leaves model files unchanged", async () => {
    const paramsPath = join(root, "lev", "params.json");
    const forecastPath = join(root, "lev", "forecast.json");
    const articlesPath = join(root, "data", "articles.ts");
    const beforeParams = sha(paramsPath);
    const beforeForecast = sha(forecastPath);
    const beforeArticles = sha(articlesPath);

    const dir = mkdtempSync(join(tmpdir(), "editorial-"));
    const ingest: IngestReport = {
      generatedAt: "2026-09-16T00:00:00Z",
      lookbackHours: 48,
      windowFrom: "2026-09-14T00:00:00Z",
      windowTo: "2026-09-16T00:00:00Z",
      nodeVersion: "22.0.0",
      counts: { fetched: 1, deduplicated: 1, relevant: 1, rejected: 0 },
      countDefinitions: {
        fetched: "",
        deduplicated: "",
        relevant: "",
        rejected: "",
      },
      sourceResults: [],
      scoreDisclaimer: "",
      candidates: [fixtureCandidate()],
      rejected: [],
    };
    const inputPath = join(dir, "candidates.json");
    const outputPath = join(dir, "editorial-drafts.json");
    writeFileSync(inputPath, JSON.stringify(ingest));

    await runEditorial({
      inputPath,
      outputPath,
      write: true,
      provider: new MockEditorialProvider(),
      now: new Date("2026-09-16T03:00:00Z"),
    });

    assert.equal(sha(paramsPath), beforeParams);
    assert.equal(sha(forecastPath), beforeForecast);
    assert.equal(sha(articlesPath), beforeArticles);
    const written = JSON.parse(readFileSync(outputPath, "utf8"));
    assert.ok(Array.isArray(written.drafts));
    assert.ok(Array.isArray(written.rejectedDrafts));
  });

  it("stops clearly when the OpenAI provider has no API key", () => {
    assert.throws(
      () => selectProvider({ EDITORIAL_PROVIDER: "openai" }),
      /OPENAI_API_KEY is not set/,
    );
  });

  it("uses the mock provider without an API key", () => {
    const provider = selectProvider({ EDITORIAL_PROVIDER: "mock" });
    assert.equal(provider.name, "mock");
  });

  it("writes a job summary without abstracts or secrets", async () => {
    const report = await generateDrafts(
      [fixtureCandidate()],
      new MockEditorialProvider(),
    );
    const summary = editorialJobSummary(report);
    assert.equal(summary.includes("In mice (n=48), 10 mg treatment was not significant for lifespan."), false);
    assert.equal(summary.includes("sk-"), false);
    assert.match(summary, /Passed automated checks|Rejected or held/);
  });
});
