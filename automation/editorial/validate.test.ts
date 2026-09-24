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
});
