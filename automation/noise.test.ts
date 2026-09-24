import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exclusionReasons } from "./noise";
import { classifyEvidence, rankRecord } from "./rank";
import { constructPubmedUrl, matchWindow } from "./fetch";
import type { FetchedRecord, RankedRecord } from "./types";

function record(overrides: Partial<FetchedRecord> = {}): FetchedRecord {
  const dateFields = { publicationDate: "2026-09-15T00:00:00Z" };
  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "1",
    title: "Senolytic clearance of senescent cells in aged mice",
    sourceUrl: constructPubmedUrl("1"),
    urlOrigin: { kind: "constructed-from-id", rule: "test", id: "1" },
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    dateFields,
    windowMatch: matchWindow(dateFields, {
      from: new Date("2026-09-14T01:00:00Z"),
      to: new Date("2026-09-16T01:00:00Z"),
      fromDay: "2026-09-14",
      toDay: "2026-09-16",
    }),
    doi: "10.1000/fixture.noise",
    abstract: "Experiments in mice show senescent-cell clearance.",
    ...overrides,
  };
}

function ranked(overrides: Partial<FetchedRecord> = {}): RankedRecord {
  return rankRecord(record(overrides));
}

describe("noise exclusion", () => {
  it("excludes celebrity and gossip coverage", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Celebrity anti-aging gossip from Hollywood",
        abstract: "Tabloid coverage of a celebrity longevity routine.",
      }),
    );
    assert.ok(reasons.some((reason) => /celebrity|gossip/i.test(reason)));
  });

  it("excludes cosmetic product promotion", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Buy now: anti-wrinkle cream for sale",
        abstract: "Shop now and add to cart. This cosmetic serum reverses wrinkles. Discount code SAVE20.",
      }),
    );
    assert.ok(reasons.some((reason) => /cosmetic/i.test(reason)));
  });

  it("does not treat a biology paper as a cosmetic ad just because it mentions skin", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Histological aging signatures in human skin tissue",
        abstract:
          "Deep-learning models estimated biological age from histopathology of GTEx skin. No product was sold.",
        doi: "10.1000/fixture.skin",
      }),
    );
    assert.equal(reasons.some((reason) => /cosmetic/i.test(reason)), false);
  });

  it("excludes supplement sales copy", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Buy our longevity supplement",
        abstract: "Order today from the supplement store. NMN pills.",
        doi: "10.1000/fixture.supplement",
      }),
    );
    assert.ok(reasons.some((reason) => /supplement/i.test(reason)));
  });

  it("excludes an editorial without primary research", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Editorial: opinions on aging",
        abstract: "This editorial discusses senescence research without new experiments.",
        doi: "10.1000/fixture.editorial",
        hints: { pubTypes: ["Editorial"] },
      }),
    );
    assert.ok(reasons.some((reason) => /editorial/i.test(reason)));
  });

  it("does not exclude a primary preprint only because it is a preprint", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Senolytic clearance of senescent cells in aged mice",
        abstract: "Experiments in mice show senescent-cell clearance.",
        doi: "10.1000/fixture.preprint",
        hints: { pubTypes: ["Preprint"] },
      }),
    );
    assert.equal(
      reasons.some((reason) => /editorial, opinion, or press release/i.test(reason)),
      false,
    );
  });

  it("excludes a retracted article", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "Retracted: senolytic treatment in mice",
        abstract: "This article was retracted.",
        doi: "10.1000/fixture.retracted",
      }),
    );
    assert.ok(reasons.some((reason) => /retracted/i.test(reason)));
  });

  it("excludes a pubmed record with no DOI", () => {
    const reasons = exclusionReasons(ranked({ doi: undefined }));
    assert.ok(reasons.some((reason) => /DOI missing/i.test(reason)));
  });

  it("excludes unidentified preclinical work", () => {
    const reasons = exclusionReasons(
      ranked({
        title: "A model of aging",
        abstract: "Aging was studied in an unspecified system.",
        doi: "10.1000/fixture.unknown",
      }),
    );
    assert.ok(
      reasons.some((reason) => /species could not be identified|study class could not/i.test(reason)),
    );
  });
});

describe("the word human is not Evidence C", () => {
  it("does not upgrade a cell-line screen to Evidence C", () => {
    assert.equal(
      classifyEvidence(
        record({
          title: "Human cell-line screen of senolytic candidates",
          abstract: "A human cell line was treated in vitro. No participants were enrolled.",
        }),
      ).evidence,
      "Evidence D",
    );
  });
});
