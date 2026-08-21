/**
 *   npx tsx --test data/news.test.ts
 *
 * Guards the invariants TypeScript cannot express.
 *
 * The `sourceUrl` template literal type proves a string starts with
 * "https://" and nothing more — not that the URL resolves, not that the page
 * still exists, not that its contents match the claim. These tests close some
 * of that gap mechanically; a human opening the link closes the rest.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { newsItems, type NewsItem } from "./news";
import { fieldProgress } from "./fields";
import { FIELD_IDS, FIELD_LABELS, FIELD_SHORT_LABELS } from "../lib/fields";
import { getFieldModel, REGULATORY_READINESS } from "../lib/model-snapshot";

const here = dirname(fileURLToPath(import.meta.url));
const params = JSON.parse(readFileSync(join(here, "../lev/params.json"), "utf8"));

/** Words that assert more than a research result can support. */
const HYPE = ["breakthrough", "cure", "miracle", "proven", "revolutionary", "reverses aging"];

/** Hosts that indicate a placeholder rather than a real citation. */
const PLACEHOLDER_HOSTS = ["example.com", "example.org", "localhost", "127.0.0.1", "test.com"];

describe("field taxonomy is consistent across the whole site", () => {
  it("lib/fields.ts lists exactly eight unique ids", () => {
    assert.equal(FIELD_IDS.length, 8);
    assert.equal(new Set(FIELD_IDS).size, 8);
  });

  it("data/fields.ts slugs match lib/fields.ts exactly", () => {
    assert.deepEqual([...fieldProgress.map((f) => f.slug)].sort(), [...FIELD_IDS].sort());
  });

  it("lev/params.json field ids match lib/fields.ts exactly", () => {
    const paramIds = params.fields.map((f: { id: string }) => f.id);
    assert.deepEqual([...paramIds].sort(), [...FIELD_IDS].sort());
  });

  it("labels exist for every id and match the long-form field names", () => {
    for (const id of FIELD_IDS) {
      assert.ok(FIELD_LABELS[id], `${id} has no label`);
      assert.ok(FIELD_SHORT_LABELS[id], `${id} has no short label`);
      const field = fieldProgress.find((f) => f.slug === id);
      const paramField = params.fields.find((f: { id: string }) => f.id === id);
      assert.equal(FIELD_LABELS[id], field?.name, `${id}: label drifted from data/fields.ts`);
      assert.equal(FIELD_LABELS[id], paramField?.label, `${id}: label drifted from params.json`);
    }
  });

  it("model snapshots match the published params for all eight fields", () => {
    for (const id of FIELD_IDS) {
      const snapshot = getFieldModel(id);
      const paramField = params.fields.find((f: { id: string }) => f.id === id);
      assert.ok(paramField, `${id}: missing from params.json`);
      assert.equal(snapshot.label, paramField.label, `${id}: label drifted`);
      assert.equal(snapshot.score, paramField.score, `${id}: score drifted`);
      assert.equal(snapshot.rationale, paramField.rationale, `${id}: rationale drifted`);
      assert.equal(snapshot.lastReviewed, paramField.lastReviewed, `${id}: review date drifted`);
    }
  });

  it("regulatory readiness snapshot matches the published model", () => {
    assert.equal(REGULATORY_READINESS.id, params.regulatory.id);
    assert.equal(REGULATORY_READINESS.label, params.regulatory.label);
    assert.equal(REGULATORY_READINESS.score, params.regulatory.score);
    assert.equal(REGULATORY_READINESS.lastReviewed, params.regulatory.lastReviewed);
  });
});

describe("news items", () => {
  const each = (fn: (item: NewsItem, i: number) => void) => newsItems.forEach(fn);

  it("has at most one featured item", () => {
    // app/page.tsx uses .find(), so a second featured item would be silently
    // dropped rather than reported.
    assert.ok(
      newsItems.filter((i) => i.featured).length <= 1,
      "more than one item is marked featured; only the first would ever render"
    );
  });

  it("has unique ids", () => {
    const ids = newsItems.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate id");
  });

  it("required text fields are non-empty", () => {
    each((item) => {
      for (const [name, value] of [
        ["id", item.id],
        ["headline", item.headline],
        ["whatHappened", item.whatHappened],
        ["whatItMeans", item.whatItMeans],
        ["sourceLabel", item.sourceLabel],
      ] as const) {
        assert.ok(value.trim().length > 0, `${item.id || "<missing id>"}: ${name} is empty`);
      }
    });
  });

  it("DOIs are unique when present", () => {
    const dois = newsItems
      .map((item) => item.doi?.trim().toLowerCase())
      .filter((doi): doi is string => Boolean(doi));
    assert.equal(new Set(dois).size, dois.length, "duplicate DOI");
  });

  it("every item carries a real caveat", () => {
    each((item) => {
      assert.ok(
        item.caveat && item.caveat.trim().length >= 30,
        `${item.id}: caveat is missing or too short — an empty caveat reads as "no reservations"`
      );
    });
  });

  it("publishedAt is a valid ISO date and not in the future", () => {
    each((item) => {
      assert.match(
        item.publishedAt,
        /^\d{4}-\d{2}-\d{2}T/,
        `${item.id}: publishedAt must be an ISO 8601 timestamp`
      );
      const t = Date.parse(item.publishedAt);
      assert.ok(!Number.isNaN(t), `${item.id}: publishedAt is not parseable`);
      assert.ok(t <= Date.now() + 5 * 60_000, `${item.id}: publishedAt is in the future`);
    });
  });

  it("sourceUrl is not a placeholder", () => {
    each((item) => {
      const url = new URL(item.sourceUrl);
      assert.ok(
        !PLACEHOLDER_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)),
        `${item.id}: ${url.hostname} is a placeholder host`
      );
      assert.ok(url.pathname !== "/" || url.search, `${item.id}: link points at a bare homepage`);
    });
  });

  it("doi, when present, looks like a DOI", () => {
    each((item) => {
      if (item.doi === undefined) return;
      assert.match(item.doi, /^10\.\d{4,9}\/\S+$/, `${item.id}: malformed DOI`);
    });
  });

  it("headlines do not overclaim", () => {
    each((item) => {
      const lower = item.headline.toLowerCase();
      for (const word of HYPE) {
        assert.ok(!lower.includes(word), `${item.id}: headline contains "${word}"`);
      }
    });
  });

  it("fieldId is one of the eight canonical fields", () => {
    each((item) => {
      assert.ok(
        (FIELD_IDS as readonly string[]).includes(item.fieldId),
        `${item.id}: unknown fieldId`
      );
    });
  });
});

describe("no demo content survives", () => {
  it("no item uses the old placeholder sentinel", () => {
    for (const item of newsItems) {
      assert.notEqual(item.sourceUrl as string, "#");
    }
  });

  it("the news source file carries no leftover fixtures", () => {
    const src = readFileSync(join(here, "news.ts"), "utf8");
    // The template block in the comment is allowed; executable fixtures are not.
    const executable = src.slice(src.indexOf("export const newsItems"), src.indexOf("/*\n * ─── HOW TO ADD"));
    assert.ok(!/sourceUrl:\s*"#"/.test(executable), "a fixture with sourceUrl '#' is still present");
  });
});
