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

    const factsEn = {
      studyDesign: isTrial
        ? "Trial registration. Not a completed efficacy study."
        : "As stated in the provided title and abstract.",
      populationOrModel: subjects,
      ...(sample ? { sampleSize: sample } : {}),
      outcomes: abstract.slice(0, 400),
      limitations: realityEn,
      resultStatus: isTrial
        ? "Registration or status update only."
        : "As stated in the provided abstract.",
    };

    return {
      localizedFacts: {
        en: factsEn,
        ja: {
          studyDesign: isTrial
            ? "試験登録。有効性を示した完了試験ではない。"
            : "提供されたタイトルと抄録に記されたとおり。",
          populationOrModel: subjects,
          ...(sample ? { sampleSize: sample } : {}),
          outcomes: abstract.slice(0, 400),
          limitations: realityJa,
          resultStatus: isTrial
            ? "登録または状態の更新のみ。"
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

function extractSample(text: string): string | undefined {
  const match = text.match(/\b(n\s*=\s*\d+|\d{1,3}(?:,\d{3})+|\d{2,})/i);
  return match?.[0];
}
