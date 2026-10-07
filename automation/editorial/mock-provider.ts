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
    const subjects = input.studySubjects.join(", ") || "unspecified subjects";
    const abstract = input.abstract?.trim() || input.title;
    const sample = extractSample(abstract);
    const isTrial = input.contentType === "trial-registration";
    const isAnimal = input.studySubjects.some((value) =>
      ["mice", "rats", "minipigs", "zebrafish", "flies", "worms"].includes(value),
    );
    const isLiving = input.studySubjects.includes("living-people");
    const isTissue = input.studySubjects.some((value) =>
      value === "human-tissue" || value === "deceased-donor-tissue",
    );

    const whatEn = isTrial
      ? `A trial registration titled "${input.title}" was posted. Registration is not a result.`
      : `${abstract} The source materials describe work in ${subjects}.`;
    const whatJa = isTrial
      ? `「${input.title}」という試験登録が公開された。登録は結果ではない。`
      : `${abstract} 資料上の対象は${subjects}である。`;

    const realityEn =
      (isAnimal || isTissue) && !isLiving
        ? "The experiments are in animals, cells, or tissue samples, not a living-participant outcome trial."
        : "This brief must not be over-read. See the source for design and limits.";
    const realityJa =
      (isAnimal || isTissue) && !isLiving
        ? "実験は動物、細胞、または組織試料であり、生きている参加者のアウトカム試験ではない。"
        : "この要約を過大に読んではいけない。デザインと限界は出典を当たること。";

    const statusLine = trialStatusLine(input.overallStatus);
    const factsEn = {
      studyDesign: isTrial
        ? `Trial registration and research plan. ${statusLine.en} No results posted.`
        : "As stated in the provided title and abstract.",
      populationOrModel: subjects,
      ...(sample ? { sampleSize: sample } : {}),
      outcomes: isTrial ? "No results are posted." : abstract.slice(0, 400),
      limitations: realityEn,
      resultStatus: isTrial
        ? "Trial registration and research plan. No results posted."
        : "As stated in the provided abstract.",
    };

    return {
      localizedFacts: {
        en: factsEn,
        ja: {
          studyDesign: isTrial
            ? `試験登録・研究計画。${statusLine.ja}結果は未掲載。`
            : "提供されたタイトルと抄録に記されたとおり。",
          populationOrModel: subjects,
          ...(sample ? { sampleSize: sample } : {}),
          outcomes: isTrial ? "結果は未掲載である。" : abstract.slice(0, 400),
          limitations: realityJa,
          resultStatus: isTrial
            ? "試験登録・研究計画。結果は未掲載。"
            : "提供された抄録に記されたとおり。",
        },
      },
      en: {
        headline: input.title.slice(0, 140),
        dek: abstract.slice(0, 180),
        whatHappened: whatEn.slice(0, 800),
        whyItMatters:
          "Worth tracking as a research update. It does not by itself move the countdown.",
        realityCheck: realityEn,
      },
      ja: {
        headline: input.title.slice(0, 140),
        dek: abstract.slice(0, 180),
        whatHappened: whatJa.slice(0, 800),
        whyItMatters:
          "研究更新として追う価値はある。これだけでカウントダウンは動かない。",
        realityCheck: realityJa,
      },
      countdownImpact: "none",
    };
  }
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
