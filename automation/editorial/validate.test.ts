import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fixtureCandidate, validMouseDraft } from "./fixtures";
import { validateDraft } from "./validate";

describe("editorial draft validation", () => {
  const candidate = fixtureCandidate();
  const slugs = new Set<string>();

  it("accepts a conservative bilingual mouse draft", () => {
    const result = validateDraft(validMouseDraft(candidate), candidate, slugs);
    assert.equal(result.ok, true);
  });

  it("rejects a fieldId that does not match the candidate", () => {
    const draft = validMouseDraft(candidate, {
      fieldId: "biomarkers-diagnostics",
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("fieldId")));
    }
  });

  it("rejects hype words", () => {
    const draft = validMouseDraft(candidate, {
      en: {
        ...validMouseDraft(candidate).en,
        headline: "A breakthrough for lifespan in mice",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("hype")));
    }
  });

  it("rejects a sourceUrl that does not match the candidate", () => {
    const draft = validMouseDraft(candidate, {
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/00000000/",
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("sourceUrl")));
    }
  });

  it("rejects a DOI that does not match the candidate", () => {
    const draft = validMouseDraft(candidate, { doi: "10.0000/other" });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("DOI")));
    }
  });

  it("rejects studySubjects that do not match the candidate", () => {
    const draft = validMouseDraft(candidate, { studySubjects: ["rats"] });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("studySubjects")));
    }
  });

  it("rejects Evidence upgrades", () => {
    const draft = validMouseDraft(candidate, { evidence: "Evidence B" });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("upgraded")));
    }
  });

  it("rejects English/Japanese number mismatches", () => {
    const draft = validMouseDraft(candidate, {
      ja: {
        ...validMouseDraft(candidate).ja,
        whatHappened: "マウス（n=480）では、10 mgの処置は寿命に対して有意ではなかった。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("mismatch")));
    }
  });

  it("rejects a number that is not in the source materials", () => {
    const draft = validMouseDraft(candidate, {
      en: {
        ...validMouseDraft(candidate).en,
        whatHappened:
          "In mice (n=48), 10 mg treatment extended lifespan by 37 percent, which was not significant.",
      },
      ja: {
        ...validMouseDraft(candidate).ja,
        whatHappened:
          "マウス（n=48）では、10 mgの処置は寿命を37 percent延ばしたが有意ではなかった。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("37")));
    }
  });

  it("rejects dropped negation", () => {
    const draft = validMouseDraft(candidate, {
      localizedFacts: {
        en: {
          ...validMouseDraft(candidate).localizedFacts.en,
          outcomes: "Lifespan increased in mice.",
          resultStatus: "positive",
        },
        ja: {
          ...validMouseDraft(candidate).localizedFacts.ja,
          outcomes: "マウスの寿命が延びた。",
          resultStatus: "positive",
        },
      },
      en: {
        headline: "Exercise extended lifespan in mice",
        dek: "A mouse study (n=48) found 10 mg treatment extended lifespan.",
        whatHappened: "In mice (n=48), 10 mg treatment extended lifespan.",
        whyItMatters: "A mouse result worth tracking.",
        realityCheck:
          "This is a mouse experiment. It does not show an effect on human lifespan.",
      },
      ja: {
        headline: "マウスの寿命が延びた",
        dek: "マウス（n=48）で10 mgの処置により寿命が延びた。",
        whatHappened: "マウス（n=48）では、10 mgの処置で寿命が延びた。",
        whyItMatters: "マウスの結果として追う価値はある。",
        realityCheck: "マウスの実験である。人の寿命への効果は示されていない。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("negation")));
    }
  });

  it("rejects animal research written as a human outcome", () => {
    const draft = validMouseDraft(candidate, {
      en: {
        ...validMouseDraft(candidate).en,
        headline: "Treatment helped patients live longer",
        whatHappened:
          "In mice (n=48), 10 mg treatment was not significant, but patients improved.",
      },
      ja: {
        ...validMouseDraft(candidate).ja,
        headline: "患者の寿命が延びた",
        whatHappened:
          "マウス（n=48）では10 mgは有意ではなかったが、患者は改善した。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("living-participant")));
    }
  });

  it("rejects a paper written with the science-news label and population placeholder", () => {
    const facts = validMouseDraft(candidate).localizedFacts;
    const draft = validMouseDraft(candidate, {
      localizedFacts: {
        en: {
          ...facts.en,
          studyDesign: "Science news report",
          populationOrModel: "Not assessed in this news report",
        },
        ja: {
          ...facts.ja,
          studyDesign: "科学ニュース報道",
          populationOrModel: "本報道では研究対象を検証していない",
        },
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.includes("paper was labeled as a science news report"));
      assert.ok(
        result.reasons.includes("paper used the news-report placeholder instead of its study population"),
      );
    }
  });

  it("rejects a trial registration written as an efficacy result", () => {
    const trial = fixtureCandidate({
      sourceUrl: "https://clinicaltrials.gov/study/NCT99999999",
      doi: undefined,
      title: "A study of compound X in aging",
      abstract: "This trial is recruiting. No results are posted.",
      studySubjects: ["living-people"],
      evidence: "Evidence E",
    });
    const draft = validMouseDraft(trial, {
      sourceUrl: trial.sourceUrl,
      doi: undefined,
      evidence: "Evidence E",
      studySubjects: ["living-people"],
      contentType: "trial-registration",
      localizedFacts: {
        en: {
          studyDesign: "Trial registration.",
          populationOrModel: "living-people",
          outcomes: "The treatment was effective and significantly improved survival.",
          limitations: "Registration only.",
          resultStatus: "effective",
        },
        ja: {
          studyDesign: "試験登録。",
          populationOrModel: "参加者",
          outcomes: "治療は有効で、生存を有意に改善した。",
          limitations: "登録のみ。",
          resultStatus: "effective",
        },
      },
      en: {
        headline: "Compound X was effective in participants",
        dek: "The trial was effective.",
        whatHappened:
          "The registered trial was effective and significantly improved survival in participants.",
        whyItMatters: "This looks like a result.",
        realityCheck: "Still needs caution and a longer explanation of limits.",
      },
      ja: {
        headline: "化合物Xが参加者で有効だった",
        dek: "試験は有効だった。",
        whatHappened: "登録された試験は有効性が示され、参加者の生存を改善した。",
        whyItMatters: "結果のように読めてしまう。",
        realityCheck: "登録は結果ではない、という限界を長く書いておく。",
      },
    });
    const result = validateDraft(draft, trial, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reasons.some((reason) => reason.includes("trial registration")),
      );
    }
  });

  it("rejects a draft missing one language", () => {
    const draft = validMouseDraft(candidate, {
      ja: {
        headline: "",
        dek: "",
        whatHappened: "",
        whyItMatters: "",
        realityCheck: "",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("Japanese") || reason.includes("both")));
    }
  });

  it("rejects a duplicate slug", () => {
    const draft = validMouseDraft(candidate);
    const result = validateDraft(
      draft,
      candidate,
      new Set([draft.slug]),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("duplicate slug")));
    }
  });

  it("rejects observational findings written as causal human outcomes", () => {
    const observational = fixtureCandidate({
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/99999998/",
      doi: "10.0000/fixture.observational",
      title: "Physical activity associated with later menopause",
      abstract:
        "A cross-sectional analysis associated physical activity with later menopause in 152,435 participants.",
      evidence: "Evidence C",
      studySubjects: ["living-people"],
      recordId: "pmid-99999998",
    });
    const draft = validMouseDraft(observational, {
      sourceUrl: observational.sourceUrl,
      doi: observational.doi,
      evidence: "Evidence C",
      studySubjects: ["living-people"],
      localizedFacts: {
        en: {
          studyDesign: "Cross-sectional observational analysis.",
          populationOrModel: "152,435 participants",
          sampleSize: "152,435",
          outcomes: "Physical activity delayed menopause.",
          limitations: "Observational only.",
          resultStatus: "causal claim",
        },
        ja: {
          studyDesign: "横断的な観察解析。",
          populationOrModel: "152,435人の参加者",
          sampleSize: "152,435",
          outcomes: "身体活動が閉経を遅らせた。",
          limitations: "観察のみ。",
          resultStatus: "causal claim",
        },
      },
      en: {
        headline: "Physical activity delayed menopause in participants",
        dek: "A study of 152,435 participants delayed menopause.",
        whatHappened:
          "Physical activity delayed menopause in 152,435 participants.",
        whyItMatters: "This would be a human causal result.",
        realityCheck: "Limits still need to be stated at useful length.",
      },
      ja: {
        headline: "身体活動が参加者の閉経を遅らせた",
        dek: "152,435人の参加者で閉経を遅らせた。",
        whatHappened: "身体活動は152,435人の参加者で閉経を遅らせた。",
        whyItMatters: "人での因果のように読めてしまう。",
        realityCheck: "観察研究の限界を、ここに長く書いておく必要がある。",
      },
    });
    const result = validateDraft(draft, observational, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("causal")));
    }
  });

  it("does not hide a Japanese editorial number gap behind shared English facts", () => {
    const draft = validMouseDraft(candidate, {
      ja: {
        ...validMouseDraft(candidate).ja,
        dek: "マウス実験で処置の効果は有意ではなかった。",
        whatHappened: "マウスでは処置は寿命に対して有意ではなかった。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reasons.some((reason) =>
          reason.includes("English/Japanese editorial number mismatch"),
        ),
      );
    }
  });

  it("detects a subject mismatch in dek and localized facts", () => {
    const base = validMouseDraft(candidate);
    const draft = validMouseDraft(candidate, {
      en: {
        headline: "Treatment was not significant for lifespan",
        dek: "A study (n=48) found 10 mg treatment was not significant for lifespan.",
        whatHappened: "In the reported assay (n=48), 10 mg treatment was not significant for lifespan.",
        whyItMatters: "A negative result still matters as a caution.",
        realityCheck:
          "This experiment does not show an effect on human lifespan and needs a longer caution.",
      },
      localizedFacts: {
        en: {
          ...base.localizedFacts.en,
          studyDesign: "Laboratory experiment. Not a human trial.",
          populationOrModel: "unspecified model",
          outcomes: "Lifespan change was not significant.",
          limitations: "Laboratory experiment only.",
          resultStatus: "not significant",
        },
        ja: base.localizedFacts.ja,
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reasons.some(
          (reason) =>
            reason.includes("locked subject mice is missing from English") ||
            reason.includes("subject kind animal appears in Japanese but not English"),
        ),
      );
    }
  });

  it("rejects hasResults=false written as posted results", () => {
    const trial = fixtureCandidate({
      sourceUrl: "https://clinicaltrials.gov/study/NCT99999999",
      doi: undefined,
      title: "A study of compound X in aging",
      abstract: "This trial is recruiting. No results are posted.",
      studySubjects: ["living-people"],
      evidence: "Evidence E",
      hints: {
        studyType: "INTERVENTIONAL",
        phases: ["PHASE2"],
        overallStatus: "RECRUITING",
        hasResults: false,
      },
    });
    const factsEn = {
      studyDesign: "Phase 2 trial registration. Recruiting. No results posted.",
      populationOrModel: "participants",
      trialPhase: "PHASE2",
      outcomes: "The posted results demonstrated a benefit in participants.",
      limitations: "Registration only.",
      resultStatus: "posted results",
    };
    const draft = validMouseDraft(trial, {
      sourceUrl: trial.sourceUrl,
      doi: undefined,
      evidence: "Evidence E",
      studySubjects: ["living-people"],
      contentType: "trial-registration",
      localizedFacts: {
        en: factsEn,
        ja: {
          studyDesign: "第2相の試験登録。募集中。結果は未掲載。",
          populationOrModel: "参加者",
          trialPhase: "PHASE2",
          outcomes: "結果が示された。",
          limitations: "登録のみ。",
          resultStatus: "posted results",
        },
      },
      en: {
        headline: "Compound X posted results in participants",
        dek: "A recruiting PHASE2 registration posted results.",
        whatHappened:
          "The recruiting PHASE2 trial posted results demonstrated a benefit in participants.",
        whyItMatters: "Registration is being read as a result.",
        realityCheck: "Registration is not an efficacy result and needs a longer caution.",
      },
      ja: {
        headline: "化合物Xが参加者で結果を報告した",
        dek: "募集中のPHASE2登録が結果を報告した。",
        whatHappened: "募集中のPHASE2試験で結果が示された。",
        whyItMatters: "登録が結果のように読めてしまう。",
        realityCheck: "登録は結果ではない、という限界を長く書いておく。",
      },
    });
    const result = validateDraft(draft, trial, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reasons.some((reason) => reason.includes("hasResults=false")),
      );
    }
  });

  it("holds a trial when only the last update is inside the window", () => {
    const trial = fixtureCandidate({
      sourceId: "clinicaltrials",
      sourceUrl: "https://clinicaltrials.gov/study/NCT02522611",
      doi: undefined,
      title: "An older trial record",
      abstract: "Participants may enroll. No results are posted.",
      studySubjects: ["living-people"],
      evidence: "Evidence E",
      windowMatch: { inWindow: true, matchedFields: ["lastUpdatePostDate"] },
      dateFields: {
        studyFirstPostDate: { raw: "2015-08-13", iso: "2015-08-13", precision: "day" },
        lastUpdatePostDate: { raw: "2026-10-05", iso: "2026-10-05", precision: "day" },
      },
      hints: { overallStatus: "NOT_YET_RECRUITING", hasResults: false, studyType: "INTERVENTIONAL" },
    });
    const draft = compliantTrialDraft(trial);
    const result = validateDraft(draft, trial, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.hold, true);
      assert.ok(result.reasons.some((reason) => reason.includes("no verified change description")));
    }
  });

  it("does not treat the word 登録 alone as a living-people mention", () => {
    const trial = fixtureCandidate({
      sourceId: "clinicaltrials",
      sourceUrl: "https://clinicaltrials.gov/study/NCT07859047",
      doi: undefined,
      title: "FES PET/CT planning study",
      abstract: "Participants will undergo FES PET/CT scans. No results are posted.",
      studySubjects: ["living-people"],
      evidence: "Evidence E",
      windowMatch: { inWindow: true, matchedFields: ["studyFirstPostDate", "lastUpdatePostDate"] },
      hints: { overallStatus: "ENROLLING_BY_INVITATION", hasResults: false, studyType: "OBSERVATIONAL" },
    });
    const base = compliantTrialDraft(trial);
    const draft = validMouseDraft(trial, {
      ...base,
      localizedFacts: {
        en: base.localizedFacts.en,
        ja: {
          ...base.localizedFacts.ja,
          populationOrModel: "登録に記載された対象。人数は示されていない。",
        },
      },
      ja: {
        ...base.ja,
        whatHappened: "観察研究の試験登録が公開された。全体の状態は招待による登録である。",
      },
    });
    const result = validateDraft(draft, trial, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reasons.includes("locked subject living people is missing from Japanese copy or facts"),
      );
    }
  });

  it("rejects Japanese copy left in English or written as an internal identifier", () => {
    const leftover = validMouseDraft(candidate, {
      ja: {
        ...validMouseDraft(candidate).ja,
        headline: "Exercise was not significant for lifespan in mice",
      },
    });
    const leftoverResult = validateDraft(leftover, candidate, slugs);
    assert.equal(leftoverResult.ok, false);
    if (!leftoverResult.ok) {
      assert.ok(leftoverResult.reasons.includes("Japanese headline is not written in Japanese"));
    }

    const identified = validMouseDraft(candidate, {
      localizedFacts: {
        en: validMouseDraft(candidate).localizedFacts.en,
        ja: {
          ...validMouseDraft(candidate).localizedFacts.ja,
          populationOrModel: "living-people",
        },
      },
    });
    const identifiedResult = validateDraft(identified, candidate, slugs);
    assert.equal(identifiedResult.ok, false);
    if (!identifiedResult.ok) {
      assert.ok(
        identifiedResult.reasons.includes("Japanese populationOrModel used an internal identifier"),
      );
    }
  });

  it("accepts Japanese copy that keeps gene names, drug names, and abbreviations", () => {
    const paper = fixtureCandidate({
      title: "Osimertinib and BRCA1 in cells",
      abstract:
        "Osimertinib and BRCA1 were tested in cells with FES PET/CT. The change was not significant (n=48).",
      studySubjects: ["cells-tissues-organoids"],
    });
    const draft = validMouseDraft(paper, {
      studySubjects: ["cells-tissues-organoids"],
      localizedFacts: {
        en: {
          studyDesign: "In vitro cell experiment. Not a human trial.",
          populationOrModel: "cells",
          sampleSize: "n=48",
          intervention: "Osimertinib",
          outcomes: "BRCA1 change was not significant in cells.",
          limitations: "Cell experiment only.",
          resultStatus: "not significant in cells",
        },
        ja: {
          studyDesign: "in vitro の細胞実験。人の試験ではない。",
          populationOrModel: "細胞",
          sampleSize: "n=48",
          intervention: "Osimertinib",
          outcomes: "細胞では BRCA1 の変化は有意ではなかった。",
          limitations: "細胞実験のみ。",
          resultStatus: "細胞で有意ではない",
        },
      },
      en: {
        headline: "Osimertinib did not change BRCA1 in cells",
        dek: "An in vitro study (n=48) used FES PET/CT and Osimertinib.",
        whatHappened:
          "In cells (n=48), Osimertinib and BRCA1 were tested with FES PET/CT and the change was not significant.",
        whyItMatters: "A negative cell result is a caution, not a therapy.",
        realityCheck: "This is a cell experiment. It does not show an effect on human lifespan.",
      },
      ja: {
        headline: "細胞で Osimertinib は BRCA1 を変えなかった",
        dek: "in vitro の細胞実験（n=48）で FES PET/CT と Osimertinib を用いた。",
        whatHappened:
          "細胞（n=48）で Osimertinib と BRCA1 を FES PET/CT とともに調べ、変化は有意ではなかった。",
        whyItMatters: "細胞での否定的な結果は注意として意味がある。人の治療ではない。",
        realityCheck: "細胞の実験である。人の寿命への効果は示されていない。",
      },
    });
    const result = validateDraft(draft, paper, slugs);
    assert.equal(result.ok, true, result.ok ? "" : result.reasons.join("; "));
  });

  it("accepts a first-posted trial that stays a plan and matches its status", () => {
    const trial = fixtureCandidate({
      sourceId: "clinicaltrials",
      sourceUrl: "https://clinicaltrials.gov/study/NCT07859046",
      doi: undefined,
      title: "FES PET/CT planning study",
      abstract: "Participants will undergo FES PET/CT scans. The purpose is to see how the scans can help. No results are posted.",
      studySubjects: ["living-people"],
      evidence: "Evidence E",
      relevanceScore: 75,
      significanceScore: 41,
      windowMatch: { inWindow: true, matchedFields: ["studyFirstPostDate", "lastUpdatePostDate"] },
      hints: { overallStatus: "ENROLLING_BY_INVITATION", hasResults: false, studyType: "OBSERVATIONAL" },
    });
    const result = validateDraft(compliantTrialDraft(trial), trial, slugs);
    assert.equal(result.ok, true, result.ok ? "" : result.reasons.join("; "));
  });
});

function compliantTrialDraft(trial: ReturnType<typeof fixtureCandidate>) {
  return validMouseDraft(trial, {
    sourceUrl: trial.sourceUrl,
    doi: undefined,
    evidence: "Evidence E",
    studySubjects: ["living-people"],
    contentType: "trial-registration",
    localizedFacts: {
      en: {
        studyDesign:
          "Trial registration and research plan. Observational study. Overall status: enrolling by invitation. No results posted.",
        populationOrModel: "Participants named in the registry record.",
        outcomes: "No results are posted.",
        limitations: "The registration does not report a measured treatment effect.",
        resultStatus: "Trial registration and research plan. No results posted.",
      },
      ja: {
        studyDesign: "試験登録・研究計画。観察研究。全体の状態は招待による登録。結果は未掲載。",
        populationOrModel: "登録に記載された参加者。",
        outcomes: "結果は未掲載である。",
        limitations: "この登録は測定された治療効果を報告していない。",
        resultStatus: "試験登録・研究計画。結果は未掲載。",
      },
    },
    en: {
      headline: "Registry lists an imaging study",
      dek: "An observational registration is enrolling by invitation. No results are posted.",
      whatHappened:
        "Participants are listed in a newly posted observational registration. The overall status is enrolling by invitation.",
      whyItMatters: "The record states a plan. It does not show that the scan changes care.",
      realityCheck: "No results are posted. Enrolling by invitation is not a completed study.",
    },
    ja: {
      headline: "画像検査の試験登録が公開された",
      dek: "観察研究の登録が公開され、状態は招待による登録である。結果は未掲載である。",
      whatHappened: "参加者を含む観察研究の登録が公開された。全体の状態は招待による登録である。",
      whyItMatters: "この記録は計画を示している。検査が診療を変えるかは示していない。",
      realityCheck: "結果は未掲載である。招待による登録は完了した研究ではない。",
    },
  });
}
