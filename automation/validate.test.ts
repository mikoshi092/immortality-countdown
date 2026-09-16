import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { constructPubmedUrl } from "./fetch";
import { contextFromFetched, validateCandidate, validateCandidates } from "./validate";
import type { Candidate, FetchedRecord } from "./types";

function fetched(): FetchedRecord {
  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "1",
    title: "Title",
    sourceUrl: constructPubmedUrl("1"),
    urlOrigin: { kind: "constructed-from-id", rule: "test", id: "1" },
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    dateFields: { entrezDate: "2026-09-15T16:53:00Z" },
    windowMatch: { inWindow: true, matchedFields: ["entrezDate"] },
    doi: "10.1000/example.1",
  };
}

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    sourceId: "pubmed",
    sourceUrl: constructPubmedUrl("1"),
    title: "Senolytic therapy and aging",
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    doi: "10.1000/example.1",
    fieldId: "rejuvenation-regeneration",
    evidence: "Evidence D",
    relevanceScore: 80,
    significanceScore: 45,
    reason: "test",
    recordId: "1",
    dateFields: { entrezDate: "2026-09-15T16:53:00Z" },
    windowMatch: { inWindow: true, matchedFields: ["entrezDate"] },
    urlOrigin: { kind: "constructed-from-id", rule: "test", id: "1" },
    ...overrides,
  };
}

describe("candidate validation", () => {
  const ctx = contextFromFetched([fetched()]);
  ctx.nowMs = Date.parse("2026-09-16T02:00:00Z");

  it("accepts a record whose URL was constructed during fetch", () => {
    assert.deepEqual(validateCandidate(candidate(), ctx), []);
  });

  it("rejects a URL that the fetch adapters never recorded", () => {
    const reasons = validateCandidate(
      candidate({ sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/999/" }),
      ctx,
    );
    assert.ok(reasons.some((reason) => reason.includes("not recorded")));
  });

  it("rejects http, placeholders, empty titles, bad DOIs, future dates, and unknown fields", () => {
    const ctxOpen = contextFromFetched([
      fetched(),
      {
        ...fetched(),
        recordId: "x",
        sourceUrl: "https://example.com/paper",
      },
    ]);
    ctxOpen.nowMs = ctx.nowMs;
    ctxOpen.fetchedUrls.add("http://pubmed.ncbi.nlm.nih.gov/1");

    assert.ok(validateCandidate(candidate({ title: "  " }), ctx).includes("empty title"));
    assert.ok(
      validateCandidate(candidate({ sourceUrl: "https://example.com/paper" }), ctxOpen).some((reason) =>
        reason.includes("placeholder"),
      ),
    );
    assert.ok(validateCandidate(candidate({ doi: "not-a-doi" }), ctx).includes("malformed DOI"));
    assert.ok(
      validateCandidate(candidate({ publishedAt: "2026-09-20T00:00:00Z" }), ctx).includes("publishedAt is in the future"),
    );
    assert.ok(
      validateCandidate(candidate({ fieldId: "not-a-field" as Candidate["fieldId"] }), ctx).some((reason) =>
        reason.includes("unknown fieldId"),
      ),
    );
  });

  it("rejects duplicates in the output set", () => {
    const { accepted, rejected } = validateCandidates([candidate(), candidate({ recordId: "2" })], ctx);
    assert.equal(accepted.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(rejected[0].reasons.some((reason) => reason.includes("duplicate")));
  });
});
