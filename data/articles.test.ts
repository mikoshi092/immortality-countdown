import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, listArticles, listDraftArticles, getArticleBySlug } from "./articles";
import { newsItems } from "./news";
import { FIELD_IDS } from "../lib/fields";
import { subjectKinds } from "../lib/study-subjects";
import { FIXTURE_DOI, FIXTURE_SOURCE_URL } from "../automation/editorial/fixtures";

const here = dirname(fileURLToPath(import.meta.url));

describe("published bilingual articles", () => {
  it("keeps the original three items", () => {
    assert.equal(articles.length, 3);
    assert.deepEqual(
      articles.map((article) => article.id),
      [
        "2026-08-14-histological-aging-signatures",
        "2026-08-14-physical-activity-ovarian-aging",
        "2026-08-11-tnfr1-intestinal-stem-cell-aging",
      ],
    );
  });

  it("gives English and Japanese the same locked identifiers", () => {
    for (const article of articles) {
      assert.equal(article.en === article.ja, false);
      assert.ok(article.en.headline.trim().length > 0);
      assert.ok(article.ja.headline.trim().length > 0);
      assert.notEqual(article.en.headline, article.ja.headline);
      assert.ok((FIELD_IDS as readonly string[]).includes(article.fieldId));
      assert.match(article.evidence, /^Evidence [A-E]$/);
      assert.equal(article.countdownImpact, "none");
    }
  });

  it("uses unique slugs, ids, and DOIs", () => {
    const slugs = articles.map((article) => article.slug);
    const ids = articles.map((article) => article.id);
    const dois = articles.map((article) => article.doi).filter(Boolean);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(new Set(dois).size, dois.length);
  });

  it("does not mix editorial fixtures into production articles", () => {
    const src = readFileSync(join(here, "articles.ts"), "utf8");
    assert.equal(src.includes(FIXTURE_SOURCE_URL), false);
    assert.equal(src.includes(FIXTURE_DOI), false);
    for (const article of articles) {
      assert.notEqual(article.sourceUrl, FIXTURE_SOURCE_URL);
      assert.notEqual(article.doi, FIXTURE_DOI);
    }
  });

  it("keeps the homepage adapter in sync", () => {
    const listed = listArticles();
    assert.equal(newsItems.length, listed.length);
    for (const item of newsItems) {
      const article = articles.find((entry) => entry.id === item.id);
      assert.ok(article);
      assert.equal(item.sourceUrl, article.sourceUrl);
      assert.equal(item.doi, article.doi);
      assert.equal(item.evidence, article.evidence);
      assert.equal(item.fieldId, article.fieldId);
      assert.equal(item.slug, article.slug);
      assert.equal(item.headline, article.en.headline);
      assert.equal(item.dek, article.en.dek);
    }
  });

  it("records human, animal, cell, and tissue kinds from shared subjects", () => {
    const kinds = Object.fromEntries(
      articles.map((article) => [article.id, subjectKinds(article.studySubjects)]),
    );
    assert.deepEqual(kinds["2026-08-14-histological-aging-signatures"], [
      "human",
      "tissue",
    ]);
    assert.deepEqual(
      articles.find((article) => article.id === "2026-08-14-histological-aging-signatures")
        ?.studySubjects,
      ["deceased-donor-tissue", "living-people"],
    );
    assert.deepEqual(kinds["2026-08-14-physical-activity-ovarian-aging"], [
      "human",
      "animal",
    ]);
    assert.deepEqual(kinds["2026-08-11-tnfr1-intestinal-stem-cell-aging"], [
      "animal",
      "cell",
    ]);
  });

  it("keeps GTEx Evidence C and uses the abstract image count in public copy", () => {
    const article = articles.find(
      (entry) => entry.id === "2026-08-14-histological-aging-signatures",
    );
    assert.ok(article);
    assert.equal(article.evidence, "Evidence C");
    const publicText = [
      ...Object.values(article.localizedFacts.en),
      ...Object.values(article.localizedFacts.ja),
      ...Object.values(article.en),
      ...Object.values(article.ja),
    ].join("\n");
    assert.match(publicText, /25,712/);
    assert.match(article.localizedFacts.en.sampleSize ?? "", /abstract/i);
    assert.match(article.localizedFacts.ja.sampleSize ?? "", /抄録/);
    assert.equal(publicText.includes("25,713"), false);
    assert.match(article.localizedFacts.en.populationOrModel, /Primary training data are GTEx postmortem/);
    assert.match(article.localizedFacts.ja.populationOrModel, /主な学習データは、急速剖検で採取されたGTExの死後組織/);
    const src = readFileSync(join(here, "articles.ts"), "utf8");
    assert.match(src, /25,713/);
  });

  it("keeps Japanese fact values in Japanese", () => {
    for (const article of articles) {
      const jaFacts = Object.values(article.localizedFacts.ja).join("\n");
      const enFacts = Object.values(article.localizedFacts.en).join("\n");
      assert.notEqual(jaFacts, enFacts, `${article.id}: Japanese facts were copied from English`);
      assert.match(jaFacts, /[ぁ-んァ-ン一-龯]/, `${article.id}: Japanese facts have no Japanese script`);
    }
  });

  it("keeps source dates separate from any scheduled listing time", () => {
    for (const article of articles) {
      assert.match(article.sourcePublishedAt, /^\d{4}-\d{2}-\d{2}T/);
      if (article.sitePublishedAt) {
        assert.notEqual(article.sitePublishedAt, article.sourcePublishedAt);
        assert.match(article.sitePublishedAt, /^\d{4}-\d{2}-\d{2}T/);
      } else {
        assert.equal(article.siteModifiedAt, undefined);
      }
    }
  });

  it("requires sitePublishedAt on every publicly listed article", () => {
    for (const article of listArticles()) {
      assert.match(
        article.sitePublishedAt ?? "",
        /^\d{4}-\d{2}-\d{2}T/,
        `${article.id}: published articles must have sitePublishedAt`,
      );
      assert.ok(
        Date.parse(article.sitePublishedAt ?? "") <= Date.now() + 5 * 60_000,
        `${article.id}: sitePublishedAt must not be in the future`,
      );
      assert.notEqual(article.sitePublishedAt, article.sourcePublishedAt);
      if (article.draftCreatedAt) {
        assert.match(article.draftCreatedAt, /^\d{4}-\d{2}-\d{2}T/);
        assert.notEqual(article.draftCreatedAt, article.sourcePublishedAt);
      }
    }
  });

  it("treats records without sitePublishedAt as drafts and keeps them off public surfaces", () => {
    for (const article of listDraftArticles()) {
      assert.equal(article.sitePublishedAt, undefined);
      assert.equal(getArticleBySlug(article.slug), undefined);
      assert.equal(listArticles().some((entry) => entry.id === article.id), false);
      assert.equal(newsItems.some((item) => item.id === article.id), false);
    }
    assert.equal(listArticles().length + listDraftArticles().length, articles.length);
    assert.equal(newsItems.length, listArticles().length);
  });
});
