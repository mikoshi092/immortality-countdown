import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canonicalUrl, constructClinicalTrialsUrl, constructPubmedUrl, dateQualifiesForWindow, lookbackWindow, matchWindow, normalizeDoi, parseLooseDate, parsePubmedAbstracts, parsePubmedSummary } from "./fetch";
import { deduplicate } from "./normalize";
import type { FetchedRecord } from "./types";

function samplePaper(overrides: Partial<FetchedRecord> = {}): FetchedRecord {
  const window = lookbackWindow(new Date("2026-09-16T01:00:00Z"));
  const dateFields = { publicationDate: "2026-09-15T00:00:00Z", entrezDate: "2026-09-15T16:53:00Z" };
  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "111",
    title: "Senolytic therapy in aging mice",
    sourceUrl: constructPubmedUrl("111"),
    urlOrigin: { kind: "constructed-from-id", rule: "pubmed-pmid", id: "111" },
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    dateFields,
    windowMatch: matchWindow(dateFields, window),
    doi: "10.1000/example.1",
    ...overrides,
  };
}

describe("URL and DOI helpers", () => {
  it("constructs PubMed URLs from PMIDs in the adapter helper", () => {
    assert.equal(constructPubmedUrl("42743538"), "https://pubmed.ncbi.nlm.nih.gov/42743538/");
  });

  it("constructs ClinicalTrials.gov URLs from NCT IDs in the adapter helper", () => {
    assert.equal(constructClinicalTrialsUrl("NCT07144293"), "https://clinicaltrials.gov/study/NCT07144293");
  });

  it("normalizes DOI prefixes and case", () => {
    assert.equal(normalizeDoi("https://doi.org/10.1038/s41591-026-04566-5"), "10.1038/s41591-026-04566-5");
    assert.equal(normalizeDoi("DOI:10.1038/S41591-026-04566-5"), "10.1038/s41591-026-04566-5");
  });

  it("canonicalizes URLs without losing the path", () => {
    assert.equal(
      canonicalUrl("https://PubMed.NCBI.NLM.NIH.GOV/42743538/?utm_source=x"),
      "https://pubmed.ncbi.nlm.nih.gov/42743538",
    );
  });
});

describe("date window", () => {
  const window = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);

  it("uses datetime precision for Entrez dates and does not treat month-only publication dates as in-window", () => {
    const entrez = parseLooseDate("2026/09/15 16:53");
    const monthOnly = parseLooseDate("2026 Sep");
    assert.equal(entrez?.precision, "datetime");
    assert.equal(monthOnly?.precision, "month");
    assert.equal(dateQualifiesForWindow(entrez, window), true);
    assert.equal(dateQualifiesForWindow(monthOnly, window), false);
  });

  it("does not confuse publication date with Entrez date", () => {
    const match = matchWindow(
      {
        publicationDate: "2024-01-01T00:00:00Z",
        entrezDate: "2026-09-15T16:53:00Z",
      },
      window,
    );
    assert.deepEqual(match.matchedFields, ["entrezDate"]);
    assert.equal(match.inWindow, true);
  });

  it("does not confuse a trial first-posted date with last-update date", () => {
    const match = matchWindow(
      {
        studyFirstPostDate: "2025-08-27T00:00:00Z",
        lastUpdatePostDate: "2026-09-15T00:00:00Z",
      },
      window,
    );
    assert.deepEqual(match.matchedFields, ["lastUpdatePostDate"]);
  });

  it("keeps day precision instead of treating stored dates as midnight datetime", () => {
    const earlyWindow = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);
    const day = parseLooseDate("2026-09-14");
    const midnightAsDatetime = parseLooseDate("2026-09-14T00:00:00Z");
    assert.equal(day?.precision, "day");
    assert.equal(midnightAsDatetime?.precision, "datetime");
    assert.equal(dateQualifiesForWindow(day, earlyWindow), true);
    assert.equal(dateQualifiesForWindow(midnightAsDatetime, earlyWindow), false);
  });

  it("rejects invalid civil dates and respects an explicit timezone", () => {
    const window = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);
    assert.equal(parseLooseDate("2026-02-31"), undefined);
    assert.equal(parseLooseDate("2026-09-31"), undefined);
    const tokyo = parseLooseDate("2026-09-16T18:00:00+09:00");
    assert.equal(tokyo?.precision, "datetime");
    assert.equal(tokyo?.timeZone, "+09:00");
    assert.equal(tokyo?.iso, "2026-09-16T09:00:00Z");
    assert.equal(dateQualifiesForWindow(tokyo, window), true);
    const naiveEvening = parseLooseDate("2026-09-16T18:00:00");
    assert.equal(naiveEvening?.timeZone, undefined);
    assert.equal(dateQualifiesForWindow(naiveEvening, window), false);
  });

  it("does not treat month or year precision as inside the 48h window", () => {
    const window = lookbackWindow(new Date("2026-09-16T10:00:00Z"), 48);
    assert.equal(dateQualifiesForWindow(parseLooseDate("2026 Sep"), window), false);
    assert.equal(dateQualifiesForWindow(parseLooseDate("2026"), window), false);
    assert.equal(dateQualifiesForWindow(parseLooseDate("2026-09"), window), false);
  });
});

describe("deduplication", () => {
  it("merges by DOI first and keeps the extra source URL in provenance", () => {
    const a = samplePaper();
    const b = samplePaper({
      sourceId: "clinicaltrials",
      recordId: "NCT1",
      sourceUrl: constructClinicalTrialsUrl("NCT1"),
      title: "Shorter",
    });
    const [merged] = deduplicate([a, b]).records;
    assert.equal(merged.doi, "10.1000/example.1");
    assert.ok(merged.hints?.pubTypes?.some((value) => value.includes("NCT1")));
    assert.ok(merged.hints?.pubTypes?.some((value) => value.includes("clinicaltrials.gov/study/NCT1")));
  });

  it("merges by canonical URL when DOI is missing", () => {
    const a = samplePaper({ doi: undefined, sourceUrl: constructPubmedUrl("222") });
    const b = samplePaper({
      doi: undefined,
      recordId: "222",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/222/?utm_source=feed",
      abstract: "Kept abstract",
    });
    const out = deduplicate([a, b]).records;
    assert.equal(out.length, 1);
    assert.equal(out[0].abstract, "Kept abstract");
  });

  it("merges the same URL when only one copy has a DOI, regardless of input order", () => {
    const withDoi = samplePaper({
      doi: "10.1000/example.order",
      recordId: "333",
      sourceUrl: constructPubmedUrl("333"),
      abstract: undefined,
    });
    const withoutDoi = samplePaper({
      doi: undefined,
      recordId: "333-copy",
      sourceUrl: constructPubmedUrl("333"),
      abstract: "Abstract from the DOI-less copy",
    });
    const forward = deduplicate([withDoi, withoutDoi]);
    const backward = deduplicate([withoutDoi, withDoi]);
    assert.equal(forward.records.length, 1);
    assert.equal(backward.records.length, 1);
    assert.equal(forward.records[0].doi, "10.1000/example.order");
    assert.equal(backward.records[0].doi, "10.1000/example.order");
    assert.equal(forward.records[0].abstract, "Abstract from the DOI-less copy");
    assert.equal(backward.records[0].abstract, "Abstract from the DOI-less copy");
    assert.equal(forward.records[0].sourceId, backward.records[0].sourceId);
    assert.equal(forward.records[0].recordId, backward.records[0].recordId);
  });

  it("keeps same-DOI different-URL provenance and does not silently merge conflicting DOIs", () => {
    const left = samplePaper({
      doi: "10.1000/same",
      recordId: "doi-left",
      sourceUrl: constructPubmedUrl("doi-left"),
    });
    const right = samplePaper({
      doi: "10.1000/same",
      recordId: "doi-right",
      sourceUrl: constructClinicalTrialsUrl("NCT999"),
      title: "Same DOI other URL",
    });
    const sameDoi = deduplicate([left, right]);
    assert.equal(sameDoi.records.length, 1);
    assert.ok(sameDoi.records[0].hints?.pubTypes?.some((value) => value.includes("NCT999")));

    const conflictA = samplePaper({
      doi: "10.1000/aaa",
      recordId: "conflict-a",
      sourceUrl: constructPubmedUrl("conflict"),
    });
    const conflictB = samplePaper({
      doi: "10.1000/bbb",
      recordId: "conflict-b",
      sourceUrl: constructPubmedUrl("conflict"),
    });
    const conflicted = deduplicate([conflictA, conflictB]);
    assert.equal(conflicted.records.length, 2);
    assert.equal(conflicted.conflicts.length, 1);
    assert.equal(conflicted.conflicts[0].kind, "doi-mismatch");
    assert.ok(conflicted.conflicts[0].dois.includes("10.1000/aaa"));
    assert.ok(conflicted.conflicts[0].dois.includes("10.1000/bbb"));
  });
});

describe("PubMed parsers", () => {
  it("parses ESummary JSON without inventing a DOI or URL", () => {
    const window = lookbackWindow(new Date("2026-09-16T01:00:00Z"));
    const record = parsePubmedSummary(
      {
        uid: "42743538",
        title: "A real title.",
        pubdate: "2026 Sep 15",
        articleids: [{ idtype: "doi", value: "10.1097/TA.0000000000005100" }],
        history: [{ pubstatus: "entrez", date: "2026/09/15 16:53" }],
        authors: [{ name: "Harkness H" }],
      },
      "2026-09-16T01:00:00Z",
      window,
    );
    assert.ok(record);
    assert.equal(record?.sourceUrl, "https://pubmed.ncbi.nlm.nih.gov/42743538/");
    assert.equal(record?.doi, "10.1097/ta.0000000000005100");
    assert.equal(record?.urlOrigin.kind, "constructed-from-id");
    assert.equal(record?.authors?.[0], "Harkness H");
    const publication = record?.dateFields.publicationDate;
    const entrez = record?.dateFields.entrezDate;
    assert.equal(typeof publication, "object");
    assert.equal(typeof entrez, "object");
    if (publication && typeof publication !== "string") {
      assert.equal(publication.precision, "day");
      assert.equal(publication.iso, "2026-09-15");
    }
    if (entrez && typeof entrez !== "string") {
      assert.equal(entrez.precision, "datetime");
      assert.equal(entrez.iso, "2026-09-15T16:53:00Z");
    }
    assert.deepEqual(record?.windowMatch.matchedFields.sort(), ["entrezDate", "publicationDate"]);
  });

  it("extracts abstracts from EFetch XML", () => {
    const xml = `<PubmedArticleSet><PubmedArticle><PMID Version="1">1</PMID><Abstract><AbstractText Label="BACKGROUND">Hello</AbstractText></Abstract></PubmedArticle></PubmedArticleSet>`;
    assert.equal(parsePubmedAbstracts(xml).get("1"), "Hello");
  });
});
