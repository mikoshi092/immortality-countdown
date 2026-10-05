import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fetchNatureNews, isRelevantDevelopment, isScienceNews, parseNatureNews } from "./science-news";
import { lookbackWindow } from "./fetch";
import { rankRecord, passesRankThresholds } from "./rank";
import { toCandidate } from "./normalize";
import { exclusionReasons } from "./noise";
import { generateDrafts } from "./editorial/generate";
import { validateDraft } from "./editorial/validate";
import { runIngest } from "./run";
import { SOURCES } from "./sources";
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
  en: { headline: title, dek: "Nature reports an early discovery at an AI biology laboratory.", whatHappened: "Researchers reported a repeating DNA pattern in a viral genome.", whyItMatters: "The report highlights AI-assisted biological discovery.", realityCheck: "Its function remains unknown; experimental applications remain to be investigated." },
  ja: { headline: "AI生物学研究所がウイルスゲノムの反復DNA配列を報告", dek: "NatureがAI生物学研究所の初期の発見を報じた。", whatHappened: "研究者らはウイルスゲノムの反復DNA配列を報告した。", whyItMatters: "AIを使った生物学研究の具体的な動きとして注目される。", realityCheck: "機能は未解明であり、実験での応用についても今後の検証が必要である。" },
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
