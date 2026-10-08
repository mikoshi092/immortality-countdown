import type { EditorialProvider, EditorialPromptInput, GeneratedCopy } from "./types";

/**
 * Deterministic provider for tests and local dry-runs without an API key.
 * It copies numbers and subjects already present in the prompt materials
 * and never calls the network.
 */
export class MockEditorialProvider implements EditorialProvider {
  readonly name = "mock" as const;
  readonly model = "mock";

  async generate(input: EditorialPromptInput): Promise<GeneratedCopy> {
    const subjectsEn = subjectPhrase(input.studySubjects, "en");
    const subjectsJa = subjectPhrase(input.studySubjects, "ja");
    const sample = extractSample(input.abstract ?? "");
    const sampleEn = sample ? ` Sample size ${sample}.` : "";
    const sampleJa = sample ? ` 標本サイズは${sample}。` : "";
    const isTrial = input.contentType === "trial-registration";
    const isNews = input.contentType === "science-news";
    const isAnimal = input.studySubjects.some((value) =>
      ["mice", "rats", "minipigs", "zebrafish", "flies", "worms"].includes(value),
    );
    const isLiving = input.studySubjects.includes("living-people");
    const isTissue = input.studySubjects.some((value) =>
      value === "human-tissue" || value === "deceased-donor-tissue",
    );
    const isCell = input.studySubjects.includes("cells-tissues-organoids");

    const whatEn = isTrial
      ? `A trial registration titled "${input.title}" was posted. The listed subjects are ${subjectsEn}. Registration is not a result.`
      : `The source materials describe work in ${subjectsEn}.${sampleEn}`;
    const whatJa = isTrial
      ? `「${input.title}」という試験登録が公開された。対象は${subjectsJa}である。登録は結果ではない。`
      : `提供された資料に基づく研究であり、対象は${subjectsJa}である。${sampleJa}`;

    const realityEn =
      (isAnimal || isTissue || isCell) && !isLiving
        ? "The experiments are in animals, cells, or tissue samples, not a result in living people."
        : "This brief must not be over-read. See the source for design and limits.";
    const realityJa =
      (isAnimal || isTissue || isCell) && !isLiving
        ? "実験は動物、細胞、または組織試料であり、生きている人での結果ではない。"
        : "この要約を過大に読んではいけない。デザインと限界は出典を当たること。";

    const statusLine = trialStatusLine(input.overallStatus);
    const factsEn = {
      studyDesign: isNews
        ? "Science news report"
        : isTrial
          ? `Trial registration and research plan. ${statusLine.en} No results posted.`
          : "As stated in the provided title and abstract.",
      populationOrModel: isNews
        ? "Not assessed in this news report"
        : subjectsEn,
      ...(sample ? { sampleSize: sample } : {}),
      outcomes: isTrial ? "No results are posted." : `Findings are limited to ${subjectsEn}.`,
      limitations: realityEn,
      resultStatus: isNews
        ? "Science news report"
        : isTrial
          ? "Trial registration and research plan. No results posted."
          : "As stated in the provided abstract.",
    };

    return {
      localizedFacts: {
        en: factsEn,
        ja: {
          studyDesign: isNews
            ? "科学ニュース報道"
            : isTrial
              ? `試験登録・研究計画。${statusLine.ja}結果は未掲載。`
              : "提供されたタイトルと抄録に記されたとおり。",
          populationOrModel: isNews
            ? "本報道では研究対象を検証していない"
            : subjectsJa,
          ...(sample ? { sampleSize: sample } : {}),
          outcomes: isTrial ? "結果は未掲載である。" : `結果は${subjectsJa}に限られる。`,
          limitations: realityJa,
          resultStatus: isNews
            ? "科学ニュース報道"
            : isTrial
              ? "試験登録・研究計画。結果は未掲載。"
              : "提供された抄録に記されたとおり。",
        },
      },
      en: {
        headline: input.title.slice(0, 140),
        dek: isTrial
          ? `A trial registration covering ${subjectsEn} was posted.`
          : `Source-backed brief covering ${subjectsEn}.${sampleEn}`,
        whatHappened: whatEn.slice(0, 800),
        whyItMatters:
          "Worth tracking as a research update. It does not by itself move the countdown.",
        realityCheck: realityEn,
      },
      ja: {
        headline: isTrial
          ? `${subjectsJa}を対象とする試験登録が公開された`
          : `${subjectsJa}を対象とする研究が資料に記された`,
        dek: isTrial
          ? `${subjectsJa}を対象とする試験登録が公開された。`
          : `対象は${subjectsJa}である。${sampleJa}`,
        whatHappened: whatJa.slice(0, 800),
        whyItMatters:
          "研究更新として追う価値はある。これだけでカウントダウンは動かない。",
        realityCheck: realityJa,
      },
      countdownImpact: "none",
    };
  }
}

const SUBJECT_EN: Record<string, string> = {
  "living-people": "living participants",
  "human-tissue": "human tissue",
  "deceased-donor-tissue": "deceased-donor tissue",
  "cells-tissues-organoids": "cells or organoids",
  mice: "mice",
  rats: "rats",
  minipigs: "minipigs",
  zebrafish: "zebrafish",
  flies: "flies",
  worms: "worms",
};

const SUBJECT_JA: Record<string, string> = {
  "living-people": "生きている参加者",
  "human-tissue": "ヒト組織",
  "deceased-donor-tissue": "死後ドナー組織",
  "cells-tissues-organoids": "細胞またはオルガノイド",
  mice: "マウス",
  rats: "ラット",
  minipigs: "ミニブタ",
  zebrafish: "ゼブラフィッシュ",
  flies: "ショウジョウバエ",
  worms: "線虫",
};

function subjectPhrase(subjects: readonly string[], lang: "en" | "ja"): string {
  if (subjects.length === 0) {
    return lang === "ja" ? "資料上は対象が特定されていない" : "unspecified subjects";
  }
  const map = lang === "ja" ? SUBJECT_JA : SUBJECT_EN;
  return subjects.map((value) => map[value] ?? value).join(lang === "ja" ? "と" : ", ");
}

function trialStatusLine(status: string | undefined): { en: string; ja: string } {
  switch ((status ?? "").toUpperCase()) {
    case "RECRUITING":
      return { en: "Overall status: recruiting.", ja: "全体の状態は募集中。" };
    case "NOT_YET_RECRUITING":
      return { en: "Overall status: not yet recruiting.", ja: "全体の状態は未募集。" };
    case "ENROLLING_BY_INVITATION":
      return { en: "Overall status: enrolling by invitation.", ja: "全体の状態は招待による登録。" };
    case "ACTIVE_NOT_RECRUITING":
      return { en: "Overall status: active, not recruiting.", ja: "全体の状態は実施中で募集は終了。" };
    case "COMPLETED":
      return { en: "Overall status: completed.", ja: "全体の状態は完了。" };
    case "TERMINATED":
      return { en: "Overall status: terminated.", ja: "全体の状態は中止。" };
    case "SUSPENDED":
      return { en: "Overall status: suspended.", ja: "全体の状態は中断。" };
    default:
      return { en: "", ja: "" };
  }
}

function extractSample(text: string): string | undefined {
  const match = text.match(/\b(n\s*=\s*\d+|\d{1,3}(?:,\d{3})+|\d{2,})/i);
  return match?.[0];
}
