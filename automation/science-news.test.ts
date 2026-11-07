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
import { sourceLabelFromUrl } from "./editorial/from-candidate";
import type { GeneratedCopy } from "./editorial/types";
import type { RankedRecord } from "./types";

/** toCandidate requires a real field; every fixture here matches one. */
function candidateOf(ranked: RankedRecord) {
  assert.ok(ranked.fieldId, "fixture should match a field");
  return toCandidate({ ...ranked, fieldId: ranked.fieldId });
}

// Synthetic reporting fixture; not a production article or a quotation.
const title = "AI laboratory automation finds repeated DNA in a viral genome";
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
    const candidate = candidateOf(ranked);
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
    const candidate = candidateOf(rankRecord(parseNatureNews(rss.replace(summary, "Short summary"), window)[0]));
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
      ["nature-news", "sciencedaily-aging", "new-atlas-medical", "gen-news", "fierce-biotech", "fight-aging", "gigazine", "nazology-health", "science-portal", "nikkei-gooday", "univ-journal", "riken-press", "healthday-japan", "mynavi-news", "google-news-ja", "google-news-en"],
    );
    assert.equal(sourceById("pubmed")?.enabled, false);
    assert.equal(sourceById("clinicaltrials")?.enabled, false);
    assert.equal(sourceById("bloomberg-japan")?.enabled, false);
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

  it("admits Japanese pop-science article links and excludes non-article links", () => {
    // GIGAZINE encodes hyphens in feed links as &#45;; the parser's
    // plain-text decoding restores them before the pattern is applied.
    assert.equal(
      isScienceNews({ sourceId: "gigazine", sourceUrl: "https://gigazine.net/news/20261026-old-blood-cells-young-brain-cells/" }),
      true,
    );
    assert.equal(isScienceNews({ sourceId: "gigazine", sourceUrl: "https://gigazine.net/" }), false);
    assert.equal(
      isScienceNews({ sourceId: "nazology-health", sourceUrl: "https://nazology.kusuguru.co.jp/archives/205151" }),
      true,
    );
    assert.equal(
      isScienceNews({ sourceId: "nazology-health", sourceUrl: "https://nazology.kusuguru.co.jp/archives/category/life/health" }),
      false,
    );
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
    const candidate = candidateOf(rankRecord(parseRssFeed(source, sdRss, window)[0]));
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

// Real items captured verbatim (title, link, date, description) from
// the live Nazology health feed on 2026-11-04: an aged-rat liver
// rejuvenation report (positive) and a trolley-problem psychology
// item from the same feed (negative). Channel boilerplate is trimmed
// the same way as the ScienceDaily fixture above.
const nazoWindow = lookbackWindow(new Date("2026-11-04T06:00:00Z"));
const nazoRss = `<rss version="2.0"><channel><title>ナゾロジー</title>`
  + `<item><title>老いたラットの肝臓を若返らせたら悪玉コレステロールまで下がった</title><link>https://nazology.kusuguru.co.jp/archives/204272</link><pubDate>Mon, 02 Nov 2026 09:00:00 +0000</pubDate><description><![CDATA[肝臓は、血液に混じった不要な物を取り除く、体の掃除係のような臓器です。 年をとると、この掃除の力の一部が衰えることが、これまでの観察から分かってきました。 片付けきれずに血液に残る物の一つが、アルツハイマー病で脳にたまる物質です。 論文によると、アルツハイマー病の治療は、2004年以降、臨床試験の98%で失敗に終わっています。 100回挑んで、成功はわずか2回ほどという計算です。 そこで研究チームは、脳ではなく肝臓に目を向けました。 年老いたラットに、肝臓の血管を若い状態に戻すねらいの薬を、2週間与えたのです。 肝臓が若返ると、血液の中の何が、どこまで変わるのでしょうか？ 研究の詳細は、米南カリフォルニア大学らにより、2026年9月26日付で学術誌『Journal of Biological Chemistry』に掲載されました。]]></description></item>`
  + `<item><title>トロッコ問題は頭の中だけの話ではなかった、本物のお金で検証</title><link>https://nazology.kusuguru.co.jp/archives/205151</link><pubDate>Wed, 04 Nov 2026 01:30:00 +0000</pubDate><description><![CDATA[7人のグループの中で、あなたともう1人だけが1ドルずつもらい、残りの5人は何ももらっていません。 ここでスイッチを入れると、もう1人の1ドルが取り上げられ、5人に1ドルずつ配られます。 あなた自身の1ドルは、スイッチを入れても入れなくてもそのままです。 これは、1人を犠牲にして5人を救うかを問う有名な思考実験「トロッコ問題」を、お金に置き換えたものです。 ただし、誰も死なず、想像の話でもなく、動くお金は本物です。 ある研究チームは、この選択を実際に米国の大人たちに迫りました。 しかもその17か月前、同じ人たちには、考え方のくせや推論の力を測るテストを受けてもらっていました。 1年半近く前のテストの成績は、本物のお金を前にした選択と結びついているのでしょうか？ そして、「みんなの幸せを大事にする」と答える人は、本当にスイッチを入れるのでしょうか？ 研究の詳細は、学術誌『Judgment a…]]></description></item>`
  + `</channel></rss>`;

// Real items captured verbatim from the live GIGAZINE feed on
// 2026-11-04: an IT development announcement and a general-health
// running item. Both carry event words （開発/発表/報告） and must
// still fail the relevance branches.
const gigaRss = `<rss version="2.0"><channel><title>GIGAZINE</title>`
  + `<item><title>OpenAIがGitで超大規模リポジトリを運用するためのバックエンド「Pando」を開発</title><link>https://gigazine.net/news/20261104&#45;openai&#45;git&#45;pando/</link><pubDate>Wed, 04 Nov 2026 13:31:00 +0900</pubDate><description><![CDATA[OpenAIがバージョン管理システム「Git」を大規模モノレポに対応させるための社内バックエンド「Pando」を開発したことを発表しました。<p><b><a href="https://gigazine.net/news/20261104&#45;openai&#45;git&#45;pando/">続きを読む...</a></b></p>]]></description></item>`
  + `<item><title>歩くのと同じくらいゆっくりなランニングでも気分が良くなって認知機能が向上する</title><link>https://gigazine.net/news/20261103&#45;very&#45;slow&#45;running&#45;benefit&#45;brain/</link><pubDate>Tue, 03 Nov 2026 22:00:00 +0900</pubDate><description><![CDATA[ランニングは手軽に取り入れやすい運動のひとつですが、「すぐに疲れてしまうのでゆっくりでしか走れない」という悩みを抱えている人もいるはず。ところが、筑波大学などの研究チームが行った実験では、歩くのと同じくらいゆっくりなランニングであっても、メンタルヘルスや脳に良い影響が生じるとの結果が報告されています。<p><b><a href="https://gigazine.net/news/20261103&#45;very&#45;slow&#45;running&#45;benefit&#45;brain/">続きを読む...</a></b></p>]]></description></item>`
  + `</channel></rss>`;

describe("Japanese media gates", () => {
  it("admits a real Japanese rejuvenation report and ranks it on the same scale", () => {
    const source = sourceById("nazology-health")!;
    const records = parseRssFeed(source, nazoRss, nazoWindow);
    // Only the rat rejuvenation item survives; the trolley-problem
    // item from the same feed is off-topic and stays out.
    assert.equal(records.length, 1, JSON.stringify(records.map((record) => record.title)));
    const [record] = records;
    assert.equal(record.recordId, "204272");
    assert.equal(isScienceNews(record), true);

    // The summary cites past 臨床試験 failure rates as background for
    // an animal finding; the stated stage stays animals, not human.
    assert.equal(detectReportedStage(`${record.title} ${record.abstract ?? ""}`), "animals");

    const ranked = rankRecord(record);
    assert.equal(ranked.relevanceScore, 50);
    // 30 base + 10 animal stage + 15 ageing-core focus, as in English.
    assert.equal(ranked.significanceScore, 55);
    assert.equal(ranked.fieldId, "rejuvenation-regeneration");
    assert.equal(passesRankThresholds(ranked), true);
    assert.deepEqual(exclusionReasons(ranked), []);
  });

  it("connects a Japanese feed to the regular ingest pipeline", async () => {
    const report = await runIngest({ now: nazoWindow.to, write: false, sources: SOURCES.filter((s) => s.id === "nazology-health"), httpGet: async () => new Response(nazoRss) });
    assert.equal(report.sourceResults[0].status, "ok");
    assert.equal(report.candidates.length, 1, JSON.stringify(report.rejected));
    assert.equal(report.candidates[0].relevanceScore, 50);
    assert.equal(report.candidates[0].significanceScore, 55);
  });

  it("rejects real off-topic Japanese items: IT news and general health", () => {
    const source = sourceById("gigazine")!;
    assert.equal(parseRssFeed(source, gigaRss, nazoWindow).length, 0);
    assert.equal(
      isRelevantDevelopment("OpenAIがGitで超大規模リポジトリを運用するためのバックエンド「Pando」を開発 OpenAIがバージョン管理システム「Git」を大規模モノレポに対応させるための社内バックエンド「Pando」を開発したことを発表しました。"),
      false,
    );
    assert.equal(
      isRelevantDevelopment("歩くのと同じくらいゆっくりなランニングでも気分が良くなって認知機能が向上する ゆっくりなランニングであっても、メンタルヘルスや脳に良い影響が生じるとの結果が報告されています。"),
      false,
    );
    assert.equal(
      isRelevantDevelopment("トロッコ問題は頭の中だけの話ではなかった、本物のお金で検証 ある研究チームは、この選択を実際に米国の大人たちに迫りました。"),
      false,
    );
  });

  it("detects the stage a Japanese report states", () => {
    assert.equal(detectReportedStage("同社はその薬についてFDA承認を取得したと発表した"), "approved");
    assert.equal(detectReportedStage("セノリティクス薬の臨床試験で、被験者の歩行速度が改善した"), "human-study");
    assert.equal(detectReportedStage("培養細胞に化合物を加えたところ、老化細胞の割合が減った"), "cells");
    // A background mention of past clinical trials must not promote
    // an animal finding to the human stage.
    assert.equal(
      detectReportedStage("アルツハイマー病の治療は、2004年以降、臨床試験の98%で失敗に終わっています。そこで研究チームは、年老いたラットに薬を与えました。"),
      "animals",
    );
    // サルコペニア (sarcopenia) is not a monkey experiment.
    assert.equal(detectReportedStage("サルコペニアの予防には運動とタンパク質が有効とされる"), "not-stated");
    assert.equal(detectReportedStage("同社は新しいオフィスと提携を発表した"), "not-stated");
  });
});

// Real item captured verbatim (title, link, date, description) from
// the live RIKEN press feed on 2026-11-04: a report on how early-life
// nutrition shapes lifespan in flies. Channel boilerplate is trimmed
// the same way as the other captured fixtures above.
const rikenRss = `<rss version="2.0"><channel><title>理化学研究所 プレスリリース</title>`
  + `<item><guid>https://www.riken.jp/press/2026/20260924_1/index.html</guid><link>https://www.riken.jp/press/2026/20260924_1/index.html</link><title>幼少期の栄養が寿命を左右する仕組み</title><description> －貯蔵タンパク質が栄養記憶を担うことをハエで明らかに－</description><pubDate>Thu, 24 Sep 2026 00:00:00 +0900</pubDate></item>`
  + `</channel></rss>`;

// Synthetic fixtures in the exact URL and date shapes the live feeds
// emit (verified against the feeds on 2026-11-04); not production
// articles or quotations. The Gooday shape includes the tracking
// query the feed appends to every article link.
const goodayRss = `<rdf:RDF><item><title>規則正しい食事が老化の進行を遅らせる可能性を報告</title><link>https://gooday.nikkei.co.jp/atcl/column/15/050800004/100600399/?n_cid=nbpgdy_sied_rss</link><dc:date>2026-11-04T00:00:00+09:00</dc:date><description>1日3食を規則正しく食べることが、生物学的な老化の進行を遅らせるために重要である可能性が、日本の高齢者を対象とした研究で報告されました。</description></item></rdf:RDF>`;
const portalRss = `<rss version="2.0"><channel><title>サイエンスポータル</title>`
  + `<item><title>老化細胞を除去する化合物、マウスで寿命の延長を確認</title><link>https://scienceportal.jst.go.jp/newsflash/20261104_n01/</link><pubDate>Wed, 04 Nov 2026 07:22:13 +0000</pubDate><description>研究チームは、体内にたまった老化細胞を選択的に除去する化合物を開発し、マウスで寿命が延びることを確認したと発表しました。</description></item>`
  + `</channel></rss>`;
const mynaviRss = `<rdf:RDF><item><title>老化細胞を除去する薬の候補を開発、大学が発表</title><link>https://news.mynavi.jp/techplus/article/20261104-5299999/</link><dc:date>2026-11-04T17:27:54+09:00</dc:date><description>大学の研究チームが、体内に蓄積した老化細胞を除去する薬の候補物質を開発したと発表しました。再生医療への応用が期待されています。</description></item></rdf:RDF>`;
const novWindow = lookbackWindow(new Date("2026-11-04T12:00:00Z"));

describe("Tier-1 Japanese sources for the Japanese news face", () => {
  it("marks exactly the Japanese sources with language ja", () => {
    assert.deepEqual(
      SOURCES.filter((source) => source.language === "ja").map((source) => source.id),
      ["gigazine", "nazology-health", "science-portal", "nikkei-gooday", "univ-journal", "riken-press", "healthday-japan", "mynavi-news", "google-news-ja", "bloomberg-japan", "yomiuri", "asahi", "mainichi", "nikkei", "jiji", "kyodo", "tv-asahi", "nhk"],
    );
    assert.ok(SOURCES.every((source) => source.language === "ja" || source.language === "en"));
  });

  it("gives each new source its reader-facing label", () => {
    assert.equal(sourceLabelFromUrl("https://scienceportal.jst.go.jp/newsflash/20261104_n01/"), "サイエンスポータル");
    assert.equal(sourceLabelFromUrl("https://gooday.nikkei.co.jp/atcl/column/15/050800004/100600351/?n_cid=nbpgdy_sied_rss"), "日経Gooday");
    assert.equal(sourceLabelFromUrl("https://univ-journal.jp/1002963/"), "大学ジャーナル");
    assert.equal(sourceLabelFromUrl("https://www.riken.jp/press/2026/20261104_1/index.html"), "理化学研究所");
    assert.equal(sourceLabelFromUrl("https://healthdayjapan.com/health-news/2026/11/04/coffee-creamer-energy-intake"), "ヘルスデージャパン");
    assert.equal(sourceLabelFromUrl("https://news.mynavi.jp/techplus/article/20261104-5255465/"), "マイナビニュース");
  });

  it("admits article links from the new sources and excludes non-article links", () => {
    assert.equal(isScienceNews({ sourceId: "science-portal", sourceUrl: "https://scienceportal.jst.go.jp/newsflash/20261104_n01/" }), true);
    assert.equal(isScienceNews({ sourceId: "science-portal", sourceUrl: "https://scienceportal.jst.go.jp/stories/20261028_s01/" }), true);
    assert.equal(isScienceNews({ sourceId: "science-portal", sourceUrl: "https://scienceportal.jst.go.jp/" }), false);
    // The Gooday feed appends a tracking query to every article link.
    assert.equal(isScienceNews({ sourceId: "nikkei-gooday", sourceUrl: "https://gooday.nikkei.co.jp/atcl/column/15/050800004/100600351/?n_cid=nbpgdy_sied_rss" }), true);
    assert.equal(isScienceNews({ sourceId: "nikkei-gooday", sourceUrl: "https://gooday.nikkei.co.jp/atcl/report/24/102900105/102900001/" }), true);
    assert.equal(isScienceNews({ sourceId: "nikkei-gooday", sourceUrl: "https://gooday.nikkei.co.jp/" }), false);
    assert.equal(isScienceNews({ sourceId: "univ-journal", sourceUrl: "https://univ-journal.jp/1002963/" }), true);
    assert.equal(isScienceNews({ sourceId: "univ-journal", sourceUrl: "https://univ-journal.jp/column/20261001853/" }), true);
    assert.equal(isScienceNews({ sourceId: "univ-journal", sourceUrl: "https://univ-journal.jp/about/" }), false);
    assert.equal(isScienceNews({ sourceId: "riken-press", sourceUrl: "https://www.riken.jp/press/2026/20261104_1/index.html" }), true);
    assert.equal(isScienceNews({ sourceId: "riken-press", sourceUrl: "https://www.riken.jp/press/2026/20261104_1/" }), false);
    assert.equal(isScienceNews({ sourceId: "healthday-japan", sourceUrl: "https://healthdayjapan.com/health-news/2026/11/04/coffee-creamer-energy-intake" }), true);
    assert.equal(isScienceNews({ sourceId: "healthday-japan", sourceUrl: "https://healthdayjapan.com/health-news/" }), false);
    assert.equal(isScienceNews({ sourceId: "mynavi-news", sourceUrl: "https://news.mynavi.jp/article/20261104-5253473/" }), true);
    assert.equal(isScienceNews({ sourceId: "mynavi-news", sourceUrl: "https://news.mynavi.jp/techplus/article/20261104-5255465/" }), true);
    assert.equal(isScienceNews({ sourceId: "mynavi-news", sourceUrl: "https://news.mynavi.jp/premium/article/20261104-5255223/" }), true);
    assert.equal(isScienceNews({ sourceId: "mynavi-news", sourceUrl: "https://news.mynavi.jp/" }), false);
  });

  it("parses a real RIKEN lifespan press release on the existing gates", () => {
    const source = sourceById("riken-press")!;
    const records = parseRssFeed(source, rikenRss, lookbackWindow(new Date("2026-09-25T12:00:00Z")));
    assert.equal(records.length, 1, JSON.stringify(records.map((record) => record.title)));
    assert.equal(records[0].sourceId, "riken-press");
    assert.equal(isScienceNews(records[0]), true);
    const ranked = rankRecord(records[0]);
    assert.equal(passesRankThresholds(ranked), true);
  });

  it("parses the new feeds' document shapes: RDF with dc:date and RSS 2.0", () => {
    const gooday = parseRssFeed(sourceById("nikkei-gooday")!, goodayRss, novWindow);
    assert.equal(gooday.length, 1);
    assert.equal(gooday[0].sourceUrl, "https://gooday.nikkei.co.jp/atcl/column/15/050800004/100600399/?n_cid=nbpgdy_sied_rss");
    const portal = parseRssFeed(sourceById("science-portal")!, portalRss, novWindow);
    assert.equal(portal.length, 1);
    assert.equal(portal[0].sourceId, "science-portal");
    const mynavi = parseRssFeed(sourceById("mynavi-news")!, mynaviRss, novWindow);
    assert.equal(mynavi.length, 1);
    assert.equal(mynavi[0].sourceId, "mynavi-news");
  });
});

describe("business-event vocabulary (keyword-collection design, 2026-11)", () => {
  it("admits funding, partnership and acquisition stories that carry a field branch", () => {
    // The motivating case from the design: an AI drug-discovery funding
    // scoop whose headline has no research-event word.
    assert.equal(
      isRelevantDevelopment("Isomorphic Labs in talks to raise $5 billion for AI drug discovery"),
      true,
    );
    assert.equal(
      isRelevantDevelopment("AstraZeneca signs partnership deal with insitro on AI-powered drug discovery"),
      true,
    );
    assert.equal(
      isRelevantDevelopment("Merck taps Variational AI platform in acquisition of drug discovery startup"),
      true,
    );
    // The exact Bloomberg Japan headline the design captured from the
    // J1 feed (passes via 創薬 + AI + 調達; 協議 is not an event word).
    assert.equal(
      isRelevantDevelopment("アルファベット傘下のAI創薬アイソモーフィック、7890億円調達で協議"),
      true,
    );
    assert.equal(
      isRelevantDevelopment("長寿ベンチャー、大手製薬会社と提携を発表"),
      true,
    );
    assert.equal(
      isRelevantDevelopment("老化細胞を除去するセノリティクス企業が資金調達"),
      true,
    );
  });

  it("still rejects money stories with no field branch", () => {
    assert.equal(isRelevantDevelopment("Bakery chain raises prices after funding crunch"), false);
    assert.equal(isRelevantDevelopment("Investors deal blow to retail stocks in market rout"), false);
    assert.equal(isRelevantDevelopment("AI company launches an advertising app"), false);
    assert.equal(isRelevantDevelopment("地元のパン店、資金調達に成功"), false);
    // Pure IT funding: 人工知能 branch alone is not enough without biology.
    assert.equal(isRelevantDevelopment("IT企業、生成AIサービス拡大へ資金調達"), false);
    // 協議 alone is not an event word, even next to a field term.
    assert.equal(isRelevantDevelopment("AI創薬の業界団体、規制のあり方で協議"), false);
  });
});

describe("pattern-less science-news admission (keyword sources)", () => {
  it("admits any URL for the pattern-less keyword sources; the resolver is the admission control", () => {
    assert.equal(
      isScienceNews({
        sourceId: "google-news-ja",
        sourceUrl: "https://www.bloomberg.com/jp/news/articles/2026-11-05/isomorphic-labs",
      }),
      true,
    );
    assert.equal(
      isScienceNews({ sourceId: "google-news-en", sourceUrl: "https://example.com/story" }),
      true,
    );
    assert.equal(
      isScienceNews({ sourceId: "no-such-source", sourceUrl: "https://example.com/story" }),
      false,
    );
  });
});
