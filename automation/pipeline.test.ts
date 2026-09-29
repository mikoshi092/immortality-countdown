import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runIngest } from "./run";
import { SOURCES } from "./sources";
import type { SourceDefinition } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function collectTs(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "output") {
      files.push(...collectTs(path));
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(path);
    }
  }
  return files;
}

function sha(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function jsonResponse(body: unknown, url: string): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", "x-request-url": url },
  });
}

describe("model files stay untouched", () => {
  it("automation source does not write lev/params.json or lev/forecast.json", () => {
    const files = collectTs(here);
    const combined = files.map((name) => readFileSync(name, "utf8")).join("\n");
    assert.equal(/writeFileSync\([^)]*lev\/(params|forecast)\.json/.test(combined), false);
    assert.equal(/writeFile\([^)]*lev\/(params|forecast)\.json/.test(combined), false);
  });

  it("running the pipeline does not change params.json or forecast.json", async () => {
    const paramsPath = join(root, "lev", "params.json");
    const forecastPath = join(root, "lev", "forecast.json");
    const beforeParams = sha(paramsPath);
    const beforeForecast = sha(forecastPath);
    const outputPath = join(mkdtempSync(join(tmpdir(), "ingest-")), "candidates.json");

    const httpGet = async (url: string) => {
      if (url.includes("esearch.fcgi")) {
        return jsonResponse({ esearchresult: { count: "0", idlist: [] } }, url);
      }
      if (url.includes("esummary.fcgi")) {
        return jsonResponse({ result: { uids: [] } }, url);
      }
      if (url.includes("efetch.fcgi")) {
        return new Response("<PubmedArticleSet></PubmedArticleSet>", { status: 200 });
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return jsonResponse({ studies: [] }, url);
      }
      return new Response("unexpected", { status: 500 });
    };

    await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      outputPath,
      write: true,
    });

    assert.equal(sha(paramsPath), beforeParams);
    assert.equal(sha(forecastPath), beforeForecast);
  });

  it("does not change params.json or forecast.json when candidates exist", async () => {
    const paramsPath = join(root, "lev", "params.json");
    const forecastPath = join(root, "lev", "forecast.json");
    const beforeParams = sha(paramsPath);
    const beforeForecast = sha(forecastPath);
    const outputPath = join(mkdtempSync(join(tmpdir(), "ingest-cand-")), "candidates.json");

    const httpGet = async (url: string) => {
      if (url.includes("esearch.fcgi")) {
        return jsonResponse({ esearchresult: { count: "1", idlist: ["99900001"] } }, url);
      }
      if (url.includes("esummary.fcgi")) {
        return jsonResponse(
          {
            result: {
              uids: ["99900001"],
              "99900001": {
                uid: "99900001",
                title: "Senolytic treatment extends lifespan in aged mice",
                pubdate: "2026 Sep 15",
                articleids: [{ idtype: "doi", value: "10.1000/fixture.candidate" }],
                history: [{ pubstatus: "entrez", date: "2026/09/15 16:53" }],
                authors: [{ name: "Fixture A" }],
              },
            },
          },
          url,
        );
      }
      if (url.includes("efetch.fcgi")) {
        return new Response(
          `<PubmedArticleSet><PubmedArticle><PMID Version="1">99900001</PMID><Abstract><AbstractText>Aged mice were treated with dasatinib plus quercetin. Median lifespan was extended from 94 to 118 weeks compared with vehicle control.</AbstractText></Abstract></PubmedArticle></PubmedArticleSet>`,
          { status: 200 },
        );
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return jsonResponse({ studies: [] }, url);
      }
      return new Response("unexpected", { status: 500 });
    };

    const report = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      outputPath,
      write: true,
    });

    assert.ok(report.candidates.length >= 1);
    assert.equal(sha(paramsPath), beforeParams);
    assert.equal(sha(forecastPath), beforeForecast);
  });
});

describe("fetch failures are not silent zeros", () => {
  it("records a source error instead of pretending there were no new items", async () => {
    const httpGet = async (url: string) => {
      if (url.includes("esearch.fcgi")) {
        return new Response("nope", { status: 503, statusText: "Unavailable" });
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return jsonResponse({ studies: [] }, url);
      }
      return new Response("unexpected", { status: 500 });
    };

    const report = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      write: false,
    });
    const pubmed = report.sourceResults.find((source) => source.sourceId === "pubmed");
    assert.equal(pubmed?.ok, false);
    assert.ok(pubmed?.error);
    assert.notEqual(pubmed?.error, "0");
    assert.equal(pubmed?.status, "failed");
  });

  it("keeps summaries when abstract HTTP fails and reports a partial source", async () => {
    const httpGet = async (url: string) => {
      if (url.includes("esearch.fcgi")) {
        return jsonResponse({ esearchresult: { count: "1", idlist: ["42733811"] } }, url);
      }
      if (url.includes("esummary.fcgi")) {
        return jsonResponse(
          {
            result: {
              uids: ["42733811"],
              "42733811": {
                uid: "42733811",
                title: "Senescence in a windowed paper",
                pubdate: "2026 Sep 15",
                history: [{ pubstatus: "entrez", date: "2026/09/15 16:53" }],
              },
            },
          },
          url,
        );
      }
      if (url.includes("efetch.fcgi")) {
        return new Response("abstract down", { status: 503, statusText: "Unavailable" });
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return jsonResponse({ studies: [] }, url);
      }
      return new Response("unexpected", { status: 500 });
    };

    const report = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      write: false,
    });
    const pubmed = report.sourceResults.find((source) => source.sourceId === "pubmed");
    assert.equal(pubmed?.status, "partial");
    assert.equal(pubmed?.ok, false);
    assert.ok((pubmed?.fetched ?? 0) >= 1);
    assert.ok(pubmed?.issues?.some((issue) => issue.kind === "abstract-fetch-failed"));
    assert.ok(report.candidates.length + report.rejected.length >= 1);
  });

  it("records abstracts that were absent in XML without treating that as a transport failure", async () => {
    const httpGet = async (url: string) => {
      if (url.includes("esearch.fcgi")) {
        return jsonResponse({ esearchresult: { count: "1", idlist: ["2"] } }, url);
      }
      if (url.includes("esummary.fcgi")) {
        return jsonResponse(
          {
            result: {
              uids: ["2"],
              "2": {
                uid: "2",
                title: "Senescence without an abstract",
                pubdate: "2026 Sep 15",
                history: [{ pubstatus: "entrez", date: "2026/09/15 16:53" }],
              },
            },
          },
          url,
        );
      }
      if (url.includes("efetch.fcgi")) {
        return new Response(
          `<PubmedArticleSet><PubmedArticle><PMID Version="1">2</PMID></PubmedArticle></PubmedArticleSet>`,
          { status: 200 },
        );
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return jsonResponse({ studies: [] }, url);
      }
      return new Response("unexpected", { status: 500 });
    };

    const report = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      write: false,
    });
    const pubmed = report.sourceResults.find((source) => source.sourceId === "pubmed");
    assert.equal(pubmed?.status, "ok");
    assert.ok(pubmed?.issues?.some((issue) => issue.kind === "abstract-missing-in-source"));
    assert.equal(pubmed?.issues?.some((issue) => issue.kind === "abstract-fetch-failed"), false);
  });
});

describe("source registry is used by ingest", () => {
  it("runIngest uses enabledSources and can skip a disabled adapter", async () => {
    const requested: string[] = [];
    const sources: SourceDefinition[] = SOURCES.map((source) =>
      source.id === "pubmed" ? { ...source, enabled: false } : source,
    );
    const httpGet = async (url: string) => {
      requested.push(url);
      if (url.includes("clinicaltrials.gov/api/v2/studies")) return jsonResponse({ studies: [] }, url);
      return new Response("unexpected", { status: 500 });
    };
    const report = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      write: false,
      sources,
    });
    assert.equal(report.sourceResults.some((source) => source.sourceId === "pubmed"), false);
    assert.equal(requested.some((url) => url.includes("eutils.ncbi.nlm.nih.gov")), false);
  });
});
