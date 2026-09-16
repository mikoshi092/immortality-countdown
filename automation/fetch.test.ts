import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dateQualifiesForWindow,
  fetchEnabledSources,
  lookbackWindow,
  parseCtGovStudy,
  parsePubmedAbstractDocument,
  parsePubmedSummary,
} from "./fetch";
import { SOURCES } from "./sources";
import type { SourceDefinition } from "./types";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("PubMed and ClinicalTrials date storage", () => {
  it("stores PubMed pubdate as day precision so early-day dates still overlap the window", () => {
    const window = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);
    const record = parsePubmedSummary(
      {
        uid: "1",
        title: "Day precision paper",
        pubdate: "2026 Sep 14",
        history: [{ pubstatus: "entrez", date: "2026/09/13 12:00" }],
      },
      "2026-09-16T10:00:00Z",
      window,
    );
    assert.ok(record);
    const publication = record?.dateFields.publicationDate;
    assert.ok(publication && typeof publication !== "string");
    assert.equal(publication.precision, "day");
    assert.equal(dateQualifiesForWindow(publication, window), true);
    assert.ok(record?.windowMatch.matchedFields.includes("publicationDate"));
    assert.ok(!record?.windowMatch.matchedFields.includes("entrezDate"));
  });

  it("stores trial first-posted and last-update dates separately at day precision", () => {
    const window = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);
    const record = parseCtGovStudy(
      {
        protocolSection: {
          identificationModule: { nctId: "NCT1", briefTitle: "Aging trial" },
          statusModule: {
            studyFirstPostDateStruct: { date: "2025-08-27" },
            lastUpdatePostDateStruct: { date: "2026-09-15" },
          },
        },
      },
      "2026-09-16T10:00:00Z",
      window,
    );
    assert.ok(record);
    const first = record?.dateFields.studyFirstPostDate;
    const last = record?.dateFields.lastUpdatePostDate;
    assert.ok(first && typeof first !== "string");
    assert.ok(last && typeof last !== "string");
    assert.equal(first.precision, "day");
    assert.equal(last.precision, "day");
    assert.deepEqual(record?.windowMatch.matchedFields, ["lastUpdatePostDate"]);
  });
});

describe("abstract document parsing", () => {
  it("distinguishes a missing source abstract from a parsed abstract", () => {
    const xml = `<PubmedArticleSet>
      <PubmedArticle><PMID Version="1">1</PMID><Abstract><AbstractText>Hello</AbstractText></Abstract></PubmedArticle>
      <PubmedArticle><PMID Version="1">2</PMID><MedlineCitation></MedlineCitation></PubmedArticle>
    </PubmedArticleSet>`;
    const parsed = parsePubmedAbstractDocument(xml);
    assert.equal(parsed.abstracts.get("1"), "Hello");
    assert.deepEqual(parsed.missingAbstractPmids, ["2"]);
    assert.ok(parsed.pmidsInDocument.includes("1"));
    assert.ok(parsed.pmidsInDocument.includes("2"));
  });
});

describe("source registry", () => {
  it("does not HTTP-request a disabled source and uses registry API URLs", async () => {
    const requested: string[] = [];
    const pubmedOff: SourceDefinition[] = SOURCES.map((source) =>
      source.id === "pubmed" ? { ...source, enabled: false } : source,
    );
    const httpGet = async (url: string) => {
      requested.push(url);
      if (url.includes("clinicaltrials.gov/api/v2/studies")) return jsonResponse({ studies: [] });
      return new Response("unexpected", { status: 500 });
    };
    const window = lookbackWindow(new Date("2026-09-16T02:00:00Z"));
    const results = await fetchEnabledSources(window, httpGet, pubmedOff);
    assert.equal(results.some((result) => result.sourceId === "pubmed"), false);
    assert.equal(results.some((result) => result.sourceId === "clinicaltrials"), true);
    assert.equal(requested.some((url) => url.includes("eutils.ncbi.nlm.nih.gov")), false);
    assert.ok(requested.every((url) => url.startsWith(SOURCES.find((source) => source.id === "clinicaltrials")?.api.baseUrl ?? "missing")));
  });
});
