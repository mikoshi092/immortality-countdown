import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectReportedStage, fetchNatureNews, isRelevantDevelopment, isScienceNews, parseNatureNews, parseRssFeed } from "./science-news";
import { lookbackWindow } from "./fetch";
import { attentionLevelFor, rankRecord, passesRankThresholds } from "./rank";
import { toCandidate } from "./normalize";
import { exclusionReasons } from "./noise";
import { generateDrafts } from "./editorial/generate";
import { validateDraft } from "./editorial/validate";
import { runIngest } from "./run";
import { enabledSources, SOURCES, sourceById } from "./sources";
import type { GeneratedCopy } from "./editorial/types";

// Synthetic reporting fixture; not a production article or a quotation.
const title = "AI biolab finds repeated DNA in a viral genome";
const summary = "Researchers announced an AI biology laboratory and reported a repeating DNA pattern in a viral genome. Its function remains unknown. The report describes an early discovery; experimental and therapeutic applications remain to be investigated.";
const url = "https://www.nature.com/articles/d41586-026-03039-6";
const window = lookbackWindow(new Date("2026-09-25T12:00:00Z"));
const rss = `<rdf:RDF><item><title>${title}</title><link>${url}</link><dc:date>2026-09-24</dc:date><description><![CDATA[${summary}]]></description></item></rdf:RDF>`;

const copy: GeneratedCopy = {
  countdownImpact: "none",
  localizedFacts: {
    en: { studyDesign: "Science news report", populationOrModel: "Not assessed in this news report", outcomes: "Reported DNA pattern", limitations: "Function remains unknown", resultStatus: "Science news report; early discovery" },
    ja: { studyDesign: "科学ニュース報道", populationOrModel: "本報道では研究対象を検証していない", outcomes: "DNA配列の報告", limitations: "機能は未解明", resultStatus: "科学ニュース報道・初期の発見" },
  },
  en: { headline: title, popHeadline: title, dek: "Nature reports an early discovery at an AI biology laboratory.", whatHappened: "Researchers reported a repeating DNA pattern in a viral genome.", whyItMatters: "The report highlights AI-assisted biological discovery.", realityCheck: "Its function remains unknown; experimental applications remain to be investigated." },
  ja: { headline: "AI生物学研究所がウイルスゲノムの反復DNA配列を報告", popHeadline: "ウイルスのゲノムに反復するDNA配列、AI生物学研究所が報告", dek: "NatureがAI生物学研究所の初期の発見を報じた。", whatHappened: "研究者らはウイルスゲノムの反復DNA配列を報告した。", whyItMatters: "AIを使った生物学研究の具体的な動きとして注目される。", realityCheck: "機能は未解明であり、実験での応用についても今後の検証が必要である。" },
};

describe("science-news discovery and publication", () => {
  it("admits an early AI biology discovery without pretending it is a clinical study", async () => {
    const ranked = rankRecord(parseNatureNews(rss, window)[0]);
    assert.equal(ranked.evidence, "Evidence E");
    assert.equal(passesRankThresholds(ranked), true);
    assert.deepEqual(exclusionReasons(ranked), []);
    const candidate = toCandidate(ranked);
    const report = await generateDrafts([candidate], { name: "mock", generate: async () => copy });
    assert.equal(report.drafts.length, 1, JSON.stringify(report.rejectedDrafts));
    const draft = report.drafts[0];
    assert.equal(draft.contentType, "science-news");
    assert.equal(draft.countdownImpact, "none");
    assert.deepEqual(draft.studySubjects, []);
    const changed = structuredClone(draft);
    changed.ja.realityCheck = "実験での応用についても今後の検証が必要である。";
    changed.localizedFacts.ja.limitations = "今後の検証が必要";
    const result = validateDraft(changed, candidate, new Set());
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.reasons.includes("source uncertainty must be preserved in both languages"));
    const upgraded = validateDraft({ ...draft, evidence: "Evidence C" }, candidate, new Set());
    assert.equal(upgraded.ok, false);
    const missingLabel = structuredClone(draft);
    missingLabel.localizedFacts.ja.studyDesign = "臨床研究";
    assert.equal(validateDraft(missingLabel, candidate, new Set()).ok, false);
  });

  it("connects the feed to the regular ingest pipeline", async () => {
    const report = await runIngest({ now: window.to, write: false, sources: SOURCES.filter(s => s.id === "nature-news"), httpGet: async () => new Response(rss) });
    assert.equal(report.sourceResults[0].status, "ok");
    assert.equal(report.candidates.length, 1, JSON.stringify(report));
  });

  it("holds a headline-only source instead of filling in facts", async () => {
    const candidate = toCandidate(rankRecord(parseNatureNews(rss.replace(summary, "Short summary"), window)[0]));
    const report = await generateDrafts([candidate], { name: "mock", generate: async () => copy });
    assert.equal(report.counts.held, 1);
    assert.equal(report.drafts.length, 0);
  });

  it("excludes unrelated AI launches, outside-window items, and unapproved URLs", () => {
    assert.equal(isRelevantDevelopment("AI company launches an advertising app"), false);
    assert.equal(parseNatureNews(rss.replace("2026-09-24", "2026-09-01"), window).length, 0);
    assert.equal(parseNatureNews(rss.replace("2026-09-24", "2026-09-26"), window).length, 0);
    assert.equal(parseNatureNews(rss.replace(url, "https://www.nature.com.evil.test/articles/d41586-026-03039-6"), window).length, 0);
    assert.equal(isScienceNews({ sourceId: "pubmed", sourceUrl: url }), false);
  });

  it("keeps transport and malformed-feed failures visible", async () => {
    assert.equal((await fetchNatureNews(window, async () => new Response("Unavailable", { status: 503 }))).status, "failed");
    assert.equal((await fetchNatureNews(window, async () => new Response("<html>not RSS</html>"))).status, "failed");
    assert.throws(() => parseNatureNews(rss.replace("2026-09-24", "invalid-date"), window));
    assert.throws(() => parseNatureNews(rss.replace("</item>", ""), window));
  });
});

const sdSummary = "In a new study, researchers report that a senolytic compound extended the median lifespan of aged mice. The work is preclinical; whether it is safe or effective in people remains unknown and human tests have not begun.";
const sdRss = `<rss version="2.0"><channel><title>Healthy Aging News -- ScienceDaily</title>`
  + `<item><title>Senolytic drug extends lifespan in aged mice</title><link>https://www.sciencedaily.com/releases/2026/09/260924103000.htm</link><pubDate>Thu, 24 Sep 2026 10:30:00 GMT</pubDate><description>${sdSummary}</description></item>`
  + `<item><title>Healthy Aging</title><link>https://www.sciencedaily.com/news/health_medicine/healthy_aging/</link><pubDate>Thu, 24 Sep 2026 09:00:00 GMT</pubDate><description>Section page that must not become a record.</description></item>`
  + `</channel></rss>\n<!-- cached Thu, 24 Sep 2026 12:00:00 GMT -->`;

const mediaCopy: GeneratedCopy = {
  countdownImpact: "none",
  localizedFacts: {
    en: { studyDesign: "Science news report", populationOrModel: "Not assessed in this news report", outcomes: "An extended median lifespan in aged mice was reported", limitations: "A preclinical mouse study; safety and effect in people remain unknown", resultStatus: "Science news report" },
    ja: { studyDesign: "科学ニュース報道", populationOrModel: "本報道では研究対象を検証していない", outcomes: "高齢マウスの寿命中央値の延長が報じられた", limitations: "マウスでの前臨床研究であり、人での安全性や効果は不明である", resultStatus: "科学ニュース報道" },
  },
  en: { headline: "Senolytic drug extends lifespan in aged mice, report says", popHeadline: "A senolytic drug helped aged mice live longer", dek: "A media report describes a senolytic drug extending median lifespan in aged mice.", whatHappened: "Researchers reported that aged mice given a senolytic drug lived longer, with an extended median lifespan.", whyItMatters: "It is a step forward for drugs that target aged cells, at the animal stage.", realityCheck: "This is a report of a mouse experiment. Whether it is safe or effective in people remains unknown." },
  ja: { headline: "老化マウスの寿命を延ばすセノリティクス薬が報じられた", popHeadline: "年老いたマウスの寿命が延びた！セノリティクス薬に新しい動き", dek: "海外メディアが、高齢マウスで寿命の延長がみられたセノリティクス薬を報じた。", whatHappened: "高齢のマウスにセノリティクス薬を投与したところ、寿命の中央値が延びたと報じられた。", whyItMatters: "老化した細胞を狙う薬の研究が、動物実験の段階で前に進んだ。", realityCheck: "これはマウスの実験の報道である。人での安全性や効果は不明で、今後の検証が必要である。" },
};

describe("general media sources", () => {
  it("enables only media sources; PubMed and ClinicalTrials.gov stay registered but disabled", () => {
    assert.deepEqual(
      enabledSources().map((source) => source.id),
      ["nature-news", "sciencedaily-aging", "new-atlas-medical", "gen-news", "fierce-biotech", "fight-aging"],
    );
    assert.equal(sourceById("pubmed")?.enabled, false);
    assert.equal(sourceById("clinicaltrials")?.enabled, false);
    assert.ok(enabledSources().every((source) => source.type === "science-news"));
  });

  it("parses a general-media RSS item and excludes non-article links", () => {
    const source = sourceById("sciencedaily-aging")!;
    const records = parseRssFeed(source, sdRss, window);
    assert.equal(records.length, 1);
    const [record] = records;
    assert.equal(record.sourceId, "sciencedaily-aging");
    assert.equal(record.sourceName, "ScienceDaily (Healthy Aging)");
    assert.equal(record.recordId, "260924103000.htm");
    assert.equal(isScienceNews(record), true);
    assert.deepEqual(record.studySubjects, []);
  });

  it("parses Fierce Biotech's loose date format and anchor-wrapped titles", () => {
    const source = sourceById("fierce-biotech")!;
    const fierceRss = `<rss version="2.0"><channel><title>Fierce Biotech</title>`
      + `<item><title><a href="/biotech/aging-drug-maker-reports-phase-2-results">Aging drug maker reports phase 2 results</a></title><link>https://www.fiercebiotech.com/biotech/aging-drug-maker-reports-phase-2-results</link><pubDate>Nov 3, 2026 5:05am</pubDate><description>The company reported results from a phase 2 trial of its aging drug in adults with frailty, and said a larger trial is being designed.</description></item>`
      + `</channel></rss>`;
    const records = parseRssFeed(source, fierceRss, lookbackWindow(new Date("2026-11-04T12:00:00Z")));
    assert.equal(records.length, 1);
    assert.equal(records[0].title, "Aging drug maker reports phase 2 results");
    assert.equal(isScienceNews(records[0]), true);
  });

  it("detects the stage a report states, in priority order", () => {
    assert.equal(detectReportedStage("The FDA approved the drug after a review"), "approved");
    assert.equal(detectReportedStage("In a phase 2 clinical trial, 120 patients received the drug"), "human-study");
    assert.equal(detectReportedStage("After success in mice, a phase 1 trial in 40 patients began"), "human-study");
    assert.equal(detectReportedStage("Treated mice lived longer than controls"), "animals");
    assert.equal(detectReportedStage("In cell cultures, the compound restored function"), "cells");
    assert.equal(detectReportedStage("The company announced a partnership and a new office"), "not-stated");
  });

  it("bands significance into four attention levels", () => {
    assert.equal(attentionLevelFor(30), 1);
    assert.equal(attentionLevelFor(44), 1);
    assert.equal(attentionLevelFor(45), 2);
    assert.equal(attentionLevelFor(54), 2);
    assert.equal(attentionLevelFor(55), 3);
    assert.equal(attentionLevelFor(69), 3);
    assert.equal(attentionLevelFor(70), 4);
    assert.equal(attentionLevelFor(90), 4);
  });

  it("grades media significance by the stated stage and focus", () => {
    const source = sourceById("sciencedaily-aging")!;
    const ranked = rankRecord(parseRssFeed(source, sdRss, window)[0]);
    assert.equal(ranked.evidence, "Evidence E");
    assert.equal(ranked.relevanceScore, 50);
    // 30 base + 10 animal stage + 15 ageing-core focus.
    assert.equal(ranked.significanceScore, 55);
    assert.equal(passesRankThresholds(ranked), true);
  });

  it("publishes a media item with a pop headline and attention level, and guards the headline stage", async () => {
    const source = sourceById("sciencedaily-aging")!;
    const candidate = toCandidate(rankRecord(parseRssFeed(source, sdRss, window)[0]));
    const report = await generateDrafts([candidate], { name: "mock", generate: async () => mediaCopy });
    assert.equal(report.drafts.length, 1, JSON.stringify(report.rejectedDrafts));
    const draft = report.drafts[0];
    assert.equal(draft.contentType, "science-news");
    assert.equal(draft.attentionLevel, 3);
    assert.equal(draft.ja.popHeadline, mediaCopy.ja.popHeadline);
    assert.equal(draft.sourceLabel, "ScienceDaily");

    const upgraded = structuredClone(draft);
    upgraded.ja.popHeadline = "人の寿命も延ばせる！患者で効果を確認した";
    const upgradedResult = validateDraft(upgraded, candidate, new Set());
    assert.equal(upgradedResult.ok, false);
    if (!upgradedResult.ok) {
      assert.ok(upgradedResult.reasons.includes("headline presents the report as a human result beyond the stage the source states"));
    }

    const missingPop = structuredClone(draft);
    delete missingPop.ja.popHeadline;
    const missingResult = validateDraft(missingPop, candidate, new Set());
    assert.equal(missingResult.ok, false);
    if (!missingResult.ok) {
      assert.ok(missingResult.reasons.includes("science news requires a Japanese pop headline"));
    }
  });
});
