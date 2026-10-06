import type { FieldId } from "@/lib/fields";
import type { EvidenceLevel } from "@/lib/evidence";
import type { Candidate } from "../automation/types";

/**
 * Bilingual research articles.
 *
 * Locked identifiers — URL, DOI, field, evidence, subjects, and source
 * numbers — are shared. Display fact copy is language-specific and lives
 * in `localizedFacts.en` / `localizedFacts.ja`. Japanese is not a
 * translation of the English sentences.
 *
 * `countdownImpact` on automatic articles is `none` only. `watch` and `moved`
 * stay in the type for later human model notes; the news pipeline must not
 * set them.
 */

export const COUNTDOWN_IMPACTS = ["none", "watch"] as const;
export type CountdownImpact = (typeof COUNTDOWN_IMPACTS)[number];

export const CONTENT_TYPES = ["paper", "trial-registration", "review", "science-news"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export type ArticleFacts = {
  studyDesign: string;
  populationOrModel: string;
  /** Only when the source states a count that was opened and read. */
  sampleSize?: string;
  /** Only when an intervention exists in the source. */
  intervention?: string;
  outcomes: string;
  limitations: string;
  /** Only when a trial registration states a phase. */
  trialPhase?: string;
  resultStatus: string;
};

export type LocalizedFacts = {
  en: ArticleFacts;
  ja: ArticleFacts;
};

export type ArticleCopy = {
  headline: string;
  dek: string;
  whatHappened: string;
  whyItMatters: string;
  realityCheck: string;
};

export type Article = {
  id: string;
  slug: string;
  sourceUrl: `https://${string}`;
  sourceLabel: string;
  doi?: string;
  /** Date the primary source states. Not the on-site listing date. */
  sourcePublishedAt: string;
  /**
   * Scheduled listing time: the UTC instant when the automatic pipeline
   * wrote this article into the article file for the publish PR.
   * The merge commit time cannot be written back without a later push
   * to main, so this is not a guessed merge time. Required checks and
   * the merge may finish later; that delay is allowed.
   * Listings, routes, RSS, the sitemap, and Article JSON-LD use this
   * value only.
   */
  sitePublishedAt?: string;
  /** Date this on-site article was last edited after production publish. */
  siteModifiedAt?: string;
  /**
   * UTC when the article file for the publish PR was written.
   * Same instant as `sitePublishedAt` on automatic articles.
   * Never used as a public publish date.
   */
  draftCreatedAt?: string;
  discoveredAt?: string;
  fieldId: FieldId;
  evidence: EvidenceLevel;
  studySubjects: string[];
  contentType: ContentType;
  countdownImpact: CountdownImpact;
  localizedFacts: LocalizedFacts;
  en: ArticleCopy;
  ja: ArticleCopy;
  /** At most one article may be featured. Enforced in data/articles.test.ts. */
  featured?: boolean;
  /**
   * Candidate snapshot that passed the publish gate. Automatic articles
   * are re-checked against this record. It is not public article copy.
   * The original catalog articles use a separate checked excerpt list
   * and do not carry this field.
   */
  sourceCheck?: Candidate;
};

// Internal review note (not rendered): Nature Medicine body reports
// 25,713 WSIs; the abstract reports 25,712. Public copy uses the
// abstract figure and labels it as such.
export const articles: Article[] = [
  {
    "id": "2026-08-14-histological-aging-signatures",
    "slug": "2026-08-14-histological-aging-signatures",
    "sourceUrl": "https://www.nature.com/articles/s41591-026-04566-5",
    "sourceLabel": "Nature Medicine",
    "doi": "10.1038/s41591-026-04566-5",
    "sourcePublishedAt": "2026-08-14T00:00:00Z",
    "fieldId": "biomarkers-diagnostics",
    "evidence": "Evidence C",
    "studySubjects": [
      "deceased-donor-tissue",
      "living-people"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "featured": true,
    "localizedFacts": {
      "en": {
        "studyDesign": "Observational biomarker study. Deep-learning models were trained on histopathology whole-slide images to estimate tissue-specific biological age.",
        "populationOrModel": "Primary training data are GTEx postmortem tissues collected under a rapid autopsy protocol; 40 human tissue types. The paper also analyzes consented living-participant skin biopsies and blood samples from independent cohorts.",
        "sampleSize": "25,712 whole-slide images from 983 GTEx donors, as stated in the abstract",
        "outcomes": "The models estimated tissue-specific biological age. The resulting signatures were associated with established aging markers and with disease-relevant organ aging in independent cohorts.",
        "limitations": "This is observational biomarker research. The primary learning data are GTEx postmortem tissues. Living-participant skin biopsies and independent-cohort blood samples are additional materials, not an intervention trial. The models identify age-related signatures and disease associations; they do not show that changing a tissue-clock score improves health or lifespan.",
        "resultStatus": "Observational associations in human tissue images and independent cohorts. No intervention was tested."
      },
      "ja": {
        "studyDesign": "観察的なバイオマーカー研究。病理ホールスライド画像の深層学習モデルで、組織ごとの生物学的年齢を推定した。",
        "populationOrModel": "主な学習データは、急速剖検で採取されたGTExの死後組織である。40種類のヒト組織。論文は、同意を得た参加者の皮膚生検と、独立コホートの血液試料も扱っている。",
        "sampleSize": "抄録記載の、GTExドナー983人から得たホールスライド画像25,712枚",
        "outcomes": "モデルは組織ごとの生物学的年齢を推定した。得られた特徴は、既存の老化指標や、独立コホートにおける疾患に関連する臓器老化と関連していた。",
        "limitations": "介入試験ではない。主な学習データはGTExの死後組織である。同意を得た参加者の皮膚生検と独立コホートの血液試料も用いているが、観察的なバイオマーカー研究である。時計のスコアを動かしたところで健康や寿命が延びることは、この論文では示されていない。",
        "resultStatus": "ヒト組織画像と独立コホートでの観察的な関連。介入は試験していない。"
      }
    },
    "en": {
      "headline": "Deep-learning tissue clocks map aging across 40 human tissue types",
      "dek": "Image models trained primarily on GTEx postmortem histopathology estimated tissue-specific biological age and were associated with known aging markers and disease-related organ aging.",
      "whatHappened": "Researchers trained tissue-age models primarily on 25,712 histopathology whole-slide images from 40 tissue types across 983 GTEx donors, collected under a rapid autopsy protocol, as reported in the abstract. The paper also analyzed consented living-participant skin biopsies and blood samples from independent cohorts. The resulting signatures were associated with established aging markers and disease-relevant organ aging.",
      "whyItMatters": "Tissue architecture may provide another scalable way to measure organ-specific aging, which could later help biomarker validation and trial endpoints. That remains a measurement claim, not a treatment claim.",
      "realityCheck": "This is observational biomarker research. The primary learning data are GTEx postmortem tissues. The models identify age-related signatures and disease associations; they do not show that changing a tissue-clock score improves health or lifespan."
    },
    "ja": {
      "headline": "深層学習の組織時計が、40種類のヒト組織で老化の形を捉える",
      "dek": "主な学習データはGTExの死後組織である。病理画像から組織ごとの生物学的年齢を推定し、既存の老化指標や疾患に関連する臓器老化との関係を調べた観察研究。",
      "whatHappened": "研究チームは、抄録記載の25,712枚の病理ホールスライド画像を主な学習データとして用い、急速剖検で採取されたGTExのドナー983人、40種類の組織から組織ごとの生物学的年齢を推定するモデルを訓練した。論文は、同意を得た参加者の皮膚生検と独立コホートの血液試料も扱っている。得られた特徴は、既存の老化指標や、疾患に関連する臓器老化と関連していた。",
      "whyItMatters": "組織の構造そのものが、臓器ごとの老化を測る手がかりになり得る。将来のバイオマーカー検証や試験の評価項目を厚くする材料にはなる。ただし、これは測定の話であり、治療の話ではない。",
      "realityCheck": "介入試験ではない。主な学習データはGTExの死後組織である。時計のスコアを動かしたところで健康や寿命が延びることは、この論文では示されていない。"
    }
  },
  {
    "id": "2026-08-14-physical-activity-ovarian-aging",
    "slug": "2026-08-14-physical-activity-ovarian-aging",
    "sourceUrl": "https://www.nature.com/articles/s43587-026-01177-0",
    "sourceLabel": "Nature Aging",
    "doi": "10.1038/s43587-026-01177-0",
    "sourcePublishedAt": "2026-08-14T00:00:00Z",
    "fieldId": "rejuvenation-regeneration",
    "evidence": "Evidence C",
    "studySubjects": [
      "living-people",
      "mice"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Cross-sectional analyses of UK Biobank and NHANES, plus mouse experiments. Human analyses cannot establish temporal order.",
        "populationOrModel": "152,435 UK Biobank participants and 12,418 NHANES participants, together with mouse models including adiponectin-deficient mice.",
        "sampleSize": "152,435 UK Biobank participants; 12,418 NHANES participants",
        "intervention": "Physical activity in mice; adiponectin receptor agonist AdipoRon in mice. No intervention was assigned in the human analyses.",
        "outcomes": "In humans, higher physical activity was associated with premenopausal status, and among postmenopausal UK Biobank participants with age at menopause. In mice, physical activity delayed ovarian aging, adiponectin signaling was implicated, and AdipoRon delayed ovarian aging and extended reproductive lifespan.",
        "limitations": "The human analyses are cross-sectional and cannot establish that physical activity delayed menopause. Causal and mechanistic evidence comes from mice and should not be read as whole-body human rejuvenation.",
        "resultStatus": "Observational association in humans; experimental delay of ovarian aging in mice."
      },
      "ja": {
        "studyDesign": "UK BiobankとNHANESの横断解析に、マウス実験を加えた研究。人の解析だけでは時間的な前後関係は分からない。",
        "populationOrModel": "UK Biobankの参加者152,435人、NHANESの参加者12,418人、およびアディポネクチン欠損マウスを含むマウスモデル。",
        "sampleSize": "UK Biobank 152,435人、NHANES 12,418人",
        "intervention": "マウスでの身体活動。マウスでのアディポネクチン受容体作動薬AdipoRon。人の解析では介入を割り当てていない。",
        "outcomes": "人では、身体活動量の高さは閉経前の状態と関連し、UK Biobankの閉経後の参加者では閉経年齢とも関連していた。マウスでは身体活動が卵巣老化を遅らせ、アディポネクチンシグナルの関与が示され、AdipoRonは卵巣老化を遅らせて生殖寿命を延ばした。",
        "limitations": "人の解析は横断研究であり、身体活動が閉経を遅らせたとまでは言えない。因果と仕組みの証拠はマウスから来ている。全身のヒト若返りへ一般化すべきではない。",
        "resultStatus": "人では観察的な関連。マウスでは卵巣老化の実験的な遅延。"
      }
    },
    "en": {
      "headline": "Physical activity is associated with later menopause and delays ovarian aging in mice",
      "dek": "Large cross-sectional human analyses linked higher activity with later reproductive aging, while mouse experiments pointed to adiponectin signaling.",
      "whatHappened": "Cross-sectional analyses of 152,435 UK Biobank participants and 12,418 NHANES participants linked higher physical activity with a less advanced reproductive-aging profile, including an association with later menopause. In mice, physical activity delayed ovarian aging, with adiponectin signaling implicated in the effect. The adiponectin receptor agonist AdipoRon delayed ovarian aging and extended reproductive lifespan in mice.",
      "whyItMatters": "The paper adds human observational evidence and a mouse mechanism worth following. It does not show that exercise is a rejuvenation therapy in people.",
      "realityCheck": "The human analyses are cross-sectional and cannot establish that physical activity delayed menopause. The causal and mechanistic evidence comes from mice, so this should not be generalized to whole-body human rejuvenation."
    },
    "ja": {
      "headline": "身体活動量の高さは遅い閉経年齢と関連し、マウスでは卵巣老化を遅らせた",
      "dek": "大規模な横断研究で身体活動と生殖老化の関連が示され、マウス実験ではアディポネクチン経路が関与した。",
      "whatHappened": "UK Biobankの152,435人とNHANESの12,418人を対象にした横断解析では、身体活動量の高さは遅い閉経年齢と関連し、マウスでは卵巣老化を遅らせた。マウスではアディポネクチンシグナルの関与が示され、アディポネクチン受容体作動薬のAdipoRonは卵巣老化を遅らせ、生殖寿命を延ばした。",
      "whyItMatters": "人での観察と、マウスでの仕組みが同じ論文に載っている。身体活動やアディポネクチン経路を、卵巣老化の手がかりとして追う理由にはなる。人を若返らせる治療だと読む理由にはならない。",
      "realityCheck": "人の解析は横断研究であり、身体活動が閉経を遅らせたとまでは言えない。因果と仕組みの証拠はマウスから来ている。全身のヒト若返りへ一般化すべきではない。"
    }
  },
  {
    "id": "2026-08-11-tnfr1-intestinal-stem-cell-aging",
    "slug": "2026-08-11-tnfr1-intestinal-stem-cell-aging",
    "sourceUrl": "https://www.nature.com/articles/s43587-026-01170-7",
    "sourceLabel": "Nature Aging",
    "doi": "10.1038/s43587-026-01170-7",
    "sourcePublishedAt": "2026-08-11T00:00:00Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence D",
    "studySubjects": [
      "mice",
      "cells-tissues-organoids"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Mouse experiments, including heterochronic parabiosis, plus intestinal organoid assays.",
        "populationOrModel": "Young and old mice, heterochronic parabionts, and intestinal organoids.",
        "intervention": "TNF neutralization and other anti-inflammatory treatments in mice; TNF exposure in young organoids.",
        "outcomes": "The aged systemic environment impaired intestinal stem-cell function through TNF-TNFR1 signaling, mitochondrial dysfunction, and reduced fatty-acid oxidation. Organoid formation from aged crypts declined by about 30% in the reported assay. Anti-inflammatory drugs, including TNF antibodies, restored function in mice. TNFR1 knockout protected young intestinal stem cells from the old environment.",
        "limitations": "The causal experiments are in mice and organoids. They do not establish that TNF blockade or anti-inflammatory drugs slow human aging, and such treatments can carry clinically important risks.",
        "resultStatus": "Experimental findings in mice and organoids. No human outcome trial."
      },
      "ja": {
        "studyDesign": "異時性パラビオーシスを含むマウス実験と、腸管オルガノイドのアッセイ。",
        "populationOrModel": "若いマウスと老齢マウス、異時性パラビオント、腸管オルガノイド。",
        "intervention": "マウスでのTNF中和とその他の抗炎症処置。若いオルガノイドへのTNF曝露。",
        "outcomes": "老化した全身環境は、TNF-TNFR1シグナル、ミトコンドリアの障害、脂肪酸酸化の低下を通じて腸管幹細胞の働きを落とした。報告されたアッセイでは、老齢マウスの陰窩からのオルガノイド形成が約30%低下した。TNF抗体を含む抗炎症薬は、マウスで機能を回復させた。TNFR1欠損は、若い腸管幹細胞を古い環境から守った。",
        "limitations": "因果を示した実験はマウスとオルガノイドである。TNFの遮断や抗炎症薬が人の老化を遅らせることは示されていない。そうした治療には、臨床上無視できないリスクもあり得る。",
        "resultStatus": "マウスとオルガノイドでの実験結果。人でのアウトカム試験はない。"
      }
    },
    "en": {
      "headline": "Systemic TNF signaling drives intestinal stem-cell aging in mice",
      "dek": "Heterochronic parabiosis, mouse experiments, and organoids linked aged blood-borne TNF-TNFR1 signaling to declining intestinal stem-cell function.",
      "whatHappened": "Using heterochronic parabiosis, mouse experiments and organoids, researchers linked the aged systemic environment to impaired intestinal stem-cell function through TNF-TNFR1 signaling, mitochondrial dysfunction and reduced fatty-acid oxidation. Organoid formation from aged crypts declined by about 30% in the reported assay. Anti-inflammatory drugs, including TNF antibodies, restored function in mice, and intestinal TNFR1 knockout protected young stem cells from the old environment.",
      "whyItMatters": "The work supports inflammaging as a contributor to tissue stem-cell decline in mice and identifies TNF-TNFR1 signaling and cellular metabolism as mechanisms worth tracking. It is a mouse and organoid result.",
      "realityCheck": "The causal experiments are in mice and organoids. They do not establish that TNF blockade or anti-inflammatory drugs slow human aging, and such treatments can carry clinically important risks."
    },
    "ja": {
      "headline": "全身のTNFシグナルが、マウスの腸管幹細胞老化を進める",
      "dek": "異時性パラビオーシスとオルガノイド実験で、老化した体内環境のTNF-TNFR1シグナルが腸管幹細胞の働きを落とすことが示された。",
      "whatHappened": "異時性パラビオーシス、マウス実験、オルガノイドを用いた研究で、老化した全身環境がTNF-TNFR1シグナル、ミトコンドリアの障害、脂肪酸酸化の低下を通じて腸管幹細胞の働きを落とすことが示された。報告されたアッセイでは、老齢マウスの陰窩からのオルガノイド形成が約30%低下した。TNF抗体を含む抗炎症薬はマウスで機能を回復させ、腸管のTNFR1欠損は若い幹細胞を古い環境から守った。",
      "whyItMatters": "炎症老化が組織幹細胞の衰えに関わる、という見方をマウスで支える。TNF-TNFR1と細胞代謝は、今後追う価値のある経路ではある。人での結果ではない。",
      "realityCheck": "因果を示した実験はマウスとオルガノイドである。TNFの遮断や抗炎症薬が人の老化を遅らせることは示されていない。そうした治療には、臨床上無視できないリスクもあり得る。"
    }
  },
  {
    "id": "2015-08-13-exploring-resiniferatoxin-for-cancer-induced-bone-pain-relief",
    "slug": "2015-08-13-exploring-resiniferatoxin-for-cancer-induced-bone-pain-relief",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT02522611",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2015-08-13T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional study design; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Objective is to discover if RTX is safe and can reduce cancer-induced bone pain",
        "limitations": "Details on study population were not verified in this news report",
        "resultStatus": "No results available",
        "intervention": "Periganglionic Resiniferatoxin (RTX)",
        "trialPhase": "Phase 1 and Phase 2"
      },
      "ja": {
        "studyDesign": "介入研究デザイン; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "RTXが安全で癌性骨痛を軽減できるかを明らかにすることが目的",
        "limitations": "研究対象に関する詳細は本報道では検証されていない",
        "resultStatus": "結果は未発表",
        "intervention": "ペリガングリオン樹脂毒素 (RTX)",
        "trialPhase": "フェーズ1およびフェーズ2"
      }
    },
    "en": {
      "headline": "Exploring Resiniferatoxin for Cancer-Induced Bone Pain Relief",
      "dek": "A new trial aims to evaluate the safety of Resiniferatoxin in treating severe cancer-related pain.",
      "whatHappened": "A trial is being prepared to assess whether Periganglionic Resiniferatoxin can alleviate cancer-induced bone pain for patients with limited treatment options.",
      "whyItMatters": "If successful, this treatment could offer new hope for managing severe pain, improving quality of life among cancer patients.",
      "realityCheck": "No results are currently available and the study is not yet recruiting participants."
    },
    "ja": {
      "headline": "癌性骨痛の緩和に向けた樹脂毒素の探求",
      "dek": "新たな試験が重度の癌関連痛の治療における樹脂毒素の安全性を評価することを目指している。",
      "whatHappened": "ペリガングリオン樹脂毒素が治療方法が限られている患者の癌性骨痛を和らげる可能性を評価するための試験が準備中である。",
      "whyItMatters": "成功すれば、この治療法はがん患者の生活の質を向上させる新たな痛み管理の希望を提供することができる。",
      "realityCheck": "現在、結果は利用可能ではなく、研究は参加者を募集していない。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT02522611",
      "title": "Periganglionic Resiniferatoxin for the Treatment of Intractable Pain Due to Cancer-induced Bone Pain",
      "publishedAt": "2015-08-13T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nCancer-induced bone pain (CIBP) is common in people with cancer. Bone cancer can also lead to anxiety, depression, and reduced mobility and quality of life. Researchers believe a research drug called resiniferatoxin (RTX) may be able to help.\n\nObjective:\n\nTo learn whether RTX is safe and can reduce cancer induced bone pain.\n\nEligibility:\n\nPeople ages 18 and older with CIBP that is not relieved by standard treatments\n\nDesign:\n\nParticipants will have up to 6 outpatient visits over about 7 months. These will include:\n\nMedical history\n\nPhysical exam\n\nBlood and urine tests.\n\nThermal testing: a disk placed on the skin to test ability to sense temperature in and around the area of pain\n\nChest x-ray\n\nEKG: stickers are placed on the chest to measure heart signals\n\nECG: measures electrical activity of the heart\n\nParticipants will have 1 inpatient visit lasting 2-4 days. This will include:\n\nCatheter inserted into a vein in the arm. They are given anesthesia, sedation, and x-ray contrast.\n\nA needle is passed through the skin of the back to inject the RTX.\n\nParticipants will keep a log of the pain medications they take after surgery.\n\nParticipants will be called 1 week and 2, 3, and 4 months after the injection.\n\nParticipants will be mailed surveys and questionnaires to complete 2, 3, and 4 months after the injection.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=NOT_YET_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT02522611",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2015-08-13",
          "iso": "2015-08-13",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT02522611"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE1",
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "NOT_YET_RECRUITING"
      }
    }
  },
  {
    "id": "2019-10-08-understanding-autoimmunity-in-cancer-treatments",
    "slug": "2019-10-08-understanding-autoimmunity-in-cancer-treatments",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04119713",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2019-10-08T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Observational study",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Objectives include understanding the genetics and immune system features related to the development of immune-related adverse events (irAEs) after treatment with immune checkpoint inhibitors.",
        "limitations": "Details about specific patient characteristics or preliminary findings are not available.",
        "resultStatus": "Science news report"
      },
      "ja": {
        "studyDesign": "観察研究",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "目的は、免疫チェックポイント阻害剤による治療後に免疫関連有害事象（irAE）がどのように発生するかに関する遺伝子や免疫システムの特徴を理解することです。",
        "limitations": "特定の患者特性や初期の発見に関する詳細は利用できません。",
        "resultStatus": "科学ニュース報道"
      }
    },
    "en": {
      "headline": "Understanding Autoimmunity in Cancer Treatments",
      "dek": "New study investigates the genetic and immune factors behind immunotherapy-related adverse events.",
      "whatHappened": "A research study has been registered to explore how immune checkpoint inhibitors can lead to autoimmunity in some cancer patients.",
      "whyItMatters": "Insights could lead to better management strategies for patients undergoing immunotherapy and help identify those at higher risk for adverse events.",
      "realityCheck": "This report reveals a study's objectives but does not provide any verified results or conclusions about treatment outcomes."
    },
    "ja": {
      "headline": "癌治療における自己免疫の理解",
      "dek": "新しい研究が免疫療法関連の有害事象の背後にある遺伝的および免疫的要因を調査します。",
      "whatHappened": "免疫チェックポイント阻害剤がいくつかの癌患者において自己免疫を引き起こすメカニズムを探る研究が登録されました。",
      "whyItMatters": "この知見は、免疫療法を受ける患者に対するより良い管理戦略を導いたり、有害事象のリスクが高い患者を特定するのに役立つ可能性があります。",
      "realityCheck": "この報道は研究の目的を明らかにしていますが、治療結果に関する確認された結果や結論は提供していません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04119713",
      "title": "Autoimmunity After Checkpoint Blockade",
      "publishedAt": "2019-10-08T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "The purpose of this study is to better understand how the treatment of cancer with immune checkpoint inhibitors (ICI) leads to the development of autoimmunity. Specifically, we wish to understand the genetics and immune system features that cause a subset of cancer patients treated with checkpoint inhibitor therapy to develop an immune-related adverse event (irAE).",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: checkpoint; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04119713",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2019-10-08",
          "iso": "2019-10-08",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT04119713"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2020-02-13-exploring-immunotherapy-s-role-in-non-small-cell-lung-cancer-treatment",
    "slug": "2020-02-13-exploring-immunotherapy-s-role-in-non-small-cell-lung-cancer-treatment",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04267848",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2020-02-13T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Potential increase in survival times for patients with stage IIA, IIB, IIIA, or IIIB non-small cell lung cancer",
        "limitations": "Details on specific outcomes and patient responses are not available",
        "resultStatus": "Not available",
        "intervention": "Addition of pembrolizumab to usual chemotherapy",
        "trialPhase": "Phase III"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "ステージIIA、IIB、IIIA、またはIIIBの非小細胞肺癌患者における生存期間の潜在的な延長",
        "limitations": "特定の結果や患者の反応に関する詳細は提供されていない",
        "resultStatus": "未発表",
        "intervention": "通常の化学療法にペムブロリズマブを追加",
        "trialPhase": "フェーズIII"
      }
    },
    "en": {
      "headline": "Exploring Immunotherapy's Role in Non-Small Cell Lung Cancer Treatment",
      "dek": "A new trial investigates whether pembrolizumab can enhance outcomes when added to standard chemotherapy.",
      "whatHappened": "This ongoing phase III trial tests the combination of pembrolizumab, an immunotherapy drug, with standard chemotherapy for non-small cell lung cancer, aiming to improve patient survival prospects.",
      "whyItMatters": "Understanding the potential of combining treatments is crucial in the ongoing battle against lung cancer and could redefine standard care protocols.",
      "realityCheck": "While the study is looking into a promising combination, we do not yet know if this approach will effectively improve survival compared to chemotherapy alone."
    },
    "ja": {
      "headline": "非小細胞肺癌治療における免疫療法の役割を探る",
      "dek": "新しい試験が、通常の化学療法にペムブロリズマブを加えることで結果が向上するかどうかを調査しています。",
      "whatHappened": "この進行中のフェーズIII試験では、非小細胞肺癌に対する標準的な化学療法に免疫療法薬であるペムブロリズマブを組み合わせて患者の生存率を向上させることを目指しています。",
      "whyItMatters": "治療の組み合わせが持つ可能性を理解することは、肺癌との戦いにおいて重要であり、標準的な治療プロトコルを再定義する可能性があります。",
      "realityCheck": "この研究は有望な組み合わせを探求していますが、化学療法単独よりも生存率が向上するかどうかはまだ不明です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04267848",
      "title": "Testing the Addition of a Type of Drug Called Immunotherapy to the Usual Chemotherapy Treatment for Non-small Cell Lung Cancer, an ALCHEMIST Treatment Trial (Chemo-IO [ACCIO])",
      "publishedAt": "2020-02-13T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase III ALCHEMIST treatment trial tests the addition of pembrolizumab to usual chemotherapy for the treatment of stage IIA, IIB, IIIA or IIIB non-small cell lung cancer that has been removed by surgery. Immunotherapy with monoclonal antibodies, such as pembrolizumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Chemotherapy drugs, such as cisplatin, pemetrexed, carboplatin, gemcitabine hydrochloride, and paclitaxel, work in different ways to stop the growth of tumor cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. Giving pembrolizumab with usual chemotherapy may help increase survival times in patients with stage IIA, IIB, IIIA or IIIB non-small cell lung cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 55,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04267848",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2020-02-13",
          "iso": "2020-02-13",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT04267848"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE3"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2020-09-25-evaluating-cord-blood-derived-mscs-for-covid-19-ards-treatment",
    "slug": "2020-09-25-evaluating-cord-blood-derived-mscs-for-covid-19-ards-treatment",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04565665",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2020-09-25T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "rejuvenation-regeneration",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people",
      "cells-tissues-organoids"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional trial registration; phase 1 followed by phase 2 randomized trial.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "The trial aims to evaluate the feasibility of using cord blood-derived mesenchymal stem cells for treating COVID-19 related ARDS and compare their effect to standard care in a future phase.",
        "limitations": "Details on patient outcomes and specific effectiveness are not provided.",
        "resultStatus": "Science news report"
      },
      "ja": {
        "studyDesign": "介入試験の登録; フェーズ1の後にランダム化されたフェーズ2試験。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "この試験の目的は、コルド血由来の間葉系幹細胞を用いたCOVID-19関連のARDS治療の実現可能性を評価し、今後のフェーズで標準治療との比較を行うことです。",
        "limitations": "患者の結果や具体的な有効性についての詳細は提供されていません。",
        "resultStatus": "科学ニュース報道"
      }
    },
    "en": {
      "headline": "Evaluating Cord Blood-derived MSCs for COVID-19 ARDS Treatment",
      "dek": "A new trial investigates the potential use of stem cells from cord blood in treating severe respiratory issues caused by COVID-19.",
      "whatHappened": "This ongoing trial explores the feasibility of using cord blood-derived mesenchymal stem cells to treat patients suffering from COVID-19 related acute respiratory distress syndrome (ARDS).",
      "whyItMatters": "The findings could provide insights into the use of stem cells in managing severe COVID-19 complications, although detailed results are not yet available.",
      "realityCheck": "Results from this trial are still pending, and any assertions about effectiveness in patients are based on preliminary evaluations, requiring further validation."
    },
    "ja": {
      "headline": "COVID-19 ARDS治療のためのコルド血由来MSCの評価",
      "dek": "新しい試験がCOVID-19によって引き起こされる重度の呼吸器疾患の治療におけるコルド血の幹細胞使用の可能性を調査しています。",
      "whatHappened": "現在進行中のこの試験では、COVID-19関連の急性呼吸窮迫症候群（ARDS）に苦しむ患者の治療のために、コルド血由来の間葉系幹細胞を使用することの実現可能性を探ります。",
      "whyItMatters": "この研究の結果は、重度のCOVID-19合併症管理における幹細胞の使用に関する洞察を提供する可能性がありますが、詳細な結果はまだ利用可能ではありません。",
      "realityCheck": "この試験の結果はまだ保留中であり、患者における有効性に関する主張は予備評価に基づくものであり、更なる検証が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04565665",
      "title": "Study of Cord Blood Derived Mesenchymal Stem Cells for Treatment of Moderate, Severe or Critical Pneumonia",
      "publishedAt": "2020-09-25T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This is a phase I trial followed by a phase II randomized trial. The purpose of phase I study is the feasibility of treating patients with acute respiratory distress syndrome (ARDS) related to COVID-19 infection (COVID-19) with cord blood-derived mesenchymal stem cells (MSC). The purpose of the phase II trial is to compare the effect of MSC with standard of care in these patients. MSCs are a type of stem cells that can be taken from umbilical cord blood and grown into many different cell types that can be used to treat cancer and other diseases. The MSCs being used for infusion in this trial are collected from healthy, unrelated donors and are stored and grown in a laboratory. Giving MSC infusions may help control the symptoms of COVID-19 related ARDS.",
      "fieldId": "rejuvenation-regeneration",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=rejuvenation-regeneration; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: stem cell; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04565665",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2020-09-25",
          "iso": "2020-09-25",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT04565665"
      },
      "studySubjects": [
        "living-people",
        "cells-tissues-organoids"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE1",
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    }
  },
  {
    "id": "2021-09-05-study-examines-oxygen-utilization-in-her2-positive-breast-cancer-patient",
    "slug": "2021-09-05-study-examines-oxygen-utilization-in-her2-positive-breast-cancer-patient",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT05036252",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2021-09-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Observational study in trial registration",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Evaluation of oxygen usage during cardiopulmonary exercise tests.",
        "limitations": "No results available; details on the impact of mild cardiotoxicity on heart and lung function are unknown.",
        "resultStatus": "Science news report"
      },
      "ja": {
        "studyDesign": "試験登録における観察研究",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "心肺運動テストにおける酸素使用量の評価。",
        "limitations": "結果は利用できず、軽度の心毒性が心臓と肺機能に与える影響に関する詳細は不明。",
        "resultStatus": "科学ニュース報道"
      }
    },
    "en": {
      "headline": "Study Examines Oxygen Utilization in HER2-Positive Breast Cancer Patients with Cardiotoxicity",
      "dek": "Research aims to assess heart and lung function in women undergoing treatment.",
      "whatHappened": "This observational study registered looks at oxygen consumption during cardiopulmonary exercise tests in women with HER2-positive breast cancer experiencing mild cardiotoxicity post-treatment.",
      "whyItMatters": "Understanding oxygen usage can aid in evaluating heart and lung performance in patients receiving ongoing cancer treatment.",
      "realityCheck": "No results have been reported yet, and further details on implications remain unavailable."
    },
    "ja": {
      "headline": "HER2陽性乳がん患者における酸素利用に関する研究",
      "dek": "治療を受けている女性の心肺機能を評価することを目的としています。",
      "whatHappened": "この登録された観察研究は、治療後に軽度の心毒性を経験しているHER2陽性乳がんの女性における心肺運動テスト中の酸素消費を調査しています。",
      "whyItMatters": "酸素の使用量を理解することは、がん治療を受けている患者の心臓と肺のパフォーマンスを評価するのに役立つ可能性があります。",
      "realityCheck": "結果はまだ報告されておらず、影響に関するさらなる詳細は利用できません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT05036252",
      "title": "Study of Cardiopulmonary Exercise Testing in Women Who Have HER2-Positive Breast Cancer With Mild Cardiotoxicity",
      "publishedAt": "2021-09-05T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "The purpose of this study is to find out how much oxygen is used during a cardiopulmonary exercise test (CPET) in women who have mild cardiotoxicity after standard treatment for HER2-positive breast cancer, and to see whether the results of this test can be used to predict how well participants' heart and lungs will work if they continue to receive this kind of treatment.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT05036252",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2021-09-05",
          "iso": "2021-09-05",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT05036252"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    }
  },
  {
    "id": "2023-01-09-new-phase-iii-trial-evaluates-immunotherapy-for-hodgkin-lymphoma",
    "slug": "2023-01-09-new-phase-iii-trial-evaluates-immunotherapy-for-hodgkin-lymphoma",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT05675410",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-01-09T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Phase III trial; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Improvement in survival and/or fewer side effects",
        "limitations": "Details on study population and results not provided",
        "resultStatus": "Results not posted",
        "intervention": "Immunotherapy (brentuximab vedotin and nivolumab) added to standard treatment"
      },
      "ja": {
        "studyDesign": "第III相試験; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "生存率の改善および/または副作用の減少",
        "limitations": "研究対象や結果に関する詳細は提供されていない",
        "resultStatus": "結果は未投稿",
        "intervention": "標準治療に追加される免疫療法（ブレンツキシマブ・ベドチンとニボルマブ）"
      }
    },
    "en": {
      "headline": "New Phase III Trial Evaluates Immunotherapy for Hodgkin Lymphoma",
      "dek": "A trial is set to compare the effectiveness of standard therapy against an immunotherapy combination.",
      "whatHappened": "This Phase III trial is recruiting participants to compare standard chemotherapy, with or without radiation, to a combination of brentuximab vedotin and nivolumab added to the standard treatment for Hodgkin lymphoma.",
      "whyItMatters": "This research may shed light on whether adding immunotherapy could enhance survival rates and reduce side effects for patients with classical Hodgkin lymphoma.",
      "realityCheck": "While the trial is ongoing, no results are available yet, and the impact of the therapies in terms of survival improvement remains to be established."
    },
    "ja": {
      "headline": "ホジキンリンパ腫に対する免疫療法の新たな第III相試験が開始",
      "dek": "標準療法と免疫療法の効果を比較する試験が行われています。",
      "whatHappened": "この第III相試験では、ホジキンリンパ腫の標準的化学療法（放射線治療の有無にかかわらず）と、ブレンツキシマブ・ベドチンおよびニボルマブの組み合わせを比較するために参加者を募集しています。",
      "whyItMatters": "この研究は、免疫療法を追加することで、古典的ホジキンリンパ腫の患者の生存率が向上し、副作用が軽減されるかどうかを明らかにする可能性があります。",
      "realityCheck": "試験は進行中ですが、結果はまだ利用できず、治療法の生存改善に対する影響は未確定です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT05675410",
      "title": "A Study to Compare Standard Therapy to Treat Hodgkin Lymphoma to the Use of Two Drugs, Brentuximab Vedotin and Nivolumab",
      "publishedAt": "2023-01-09T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase III trial compares the effect of adding immunotherapy (brentuximab vedotin and nivolumab) to standard treatment (chemotherapy with or without radiation) to the standard treatment alone in improving survival in patients with stage I and II classical Hodgkin lymphoma. Brentuximab vedotin is in a class of medications called antibody-drug conjugates. It is made of a monoclonal antibody called brentuximab that is linked to a cytotoxic agent called vedotin. Brentuximab attaches to CD30 positive lymphoma cells in a targeted way and delivers vedotin to kill them. A monoclonal antibody is a type of protein that can bind to certain targets in the body, such as molecules that cause the body to make an immune response (antigens). Immunotherapy with monoclonal antibodies, such as nivolumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Chemotherapy drugs such as doxorubicin hydrochloride, bleomycin sulfate, vinblastine sulfate, dacarbazine, and procarbazine hydrochloride work in different ways to stop the growth of cancer cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. Cyclophosphamide is in a class of medications called alkylating agents. It works by damaging the cell's deoxyribonucleic acid (DNA) and may kill cancer cells. It may also lower the body's immune response. Etoposide is in a class of medications known as podophyllotoxin derivatives. It blocks a certain enzyme needed for cell division and DNA repair and may kill cancer cells. Vincristine is in a class of medications called vinca alkaloids. It works by stopping cancer cells from growing and dividing and may kill them. Prednisone is in a class of medications called corticosteroids. It is used to reduce inflammation and lower the body's immune response to help lessen the side effects of chemotherapy drugs. Radiation therapy uses high energy x-rays to kill tumor cells and shrink tumors. Adding immunotherapy to the standard treatment of chemotherapy with or without radiation may increase survival and/or fewer short-term or long-term side effects in patients with classical Hodgkin lymphoma compared to the standard treatment alone.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 65,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in abstract: immune, inflammation, cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT05675410",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-01-09",
          "iso": "2023-01-09",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT05675410"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE3"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2023-10-24-new-trial-compares-chemotherapy-plus-immunotherapy-in-lung-cancer",
    "slug": "2023-10-24-new-trial-compares-chemotherapy-plus-immunotherapy-in-lung-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06096844",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-10-24T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional phase III trial; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Comparison of the effects of combined treatment versus immunotherapy alone for lung cancer stabilization",
        "limitations": "No specific details on sample size or results provided.",
        "resultStatus": "No results posted",
        "intervention": "Combination of chemotherapy with immunotherapy (pembrolizumab)"
      },
      "ja": {
        "studyDesign": "介入フェーズ III 試験; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "肺癌の安定化のための併用治療と免疫療法単独の効果を比較",
        "limitations": "サンプルサイズや結果の具体的な詳細は提供されていません。",
        "resultStatus": "結果は未発表",
        "intervention": "化学療法と免疫療法（ペムブロリズマブ）の併用"
      }
    },
    "en": {
      "headline": "New Trial Compares Chemotherapy Plus Immunotherapy in Lung Cancer",
      "dek": "The ACHIEVE trial investigates the effects of combining chemotherapy with pembrolizumab for older adults with advanced lung cancer.",
      "whatHappened": "The phase III ACHIEVE trial is recruiting participants to compare the effects of adding chemotherapy to immunotherapy.",
      "whyItMatters": "Combining these treatments may enhance the body’s immune response against lung cancer, potentially impacting cancer management strategies.",
      "realityCheck": "While this trial explores a potentially beneficial combination therapy, the specific results and effectiveness remain unknown until the trial progresses."
    },
    "ja": {
      "headline": "化学療法と免疫療法の併用が肺癌に与える影響を比較する新たな試験",
      "dek": "ACHIEVE試験は、高齢の進行肺癌患者における化学療法とペムブロリズマブの併用の効果を調査します。",
      "whatHappened": "フェーズIIIのACHIEVE試験は、参加者を募集中で、化学療法を免疫療法に追加する効果を比較しています。",
      "whyItMatters": "これらの治療法を組み合わせることにより、肺癌に対する体の免疫応答が強化され、癌治療戦略に影響を与える可能性があります。",
      "realityCheck": "この試験は有益な併用療法を探求していますが、特定の結果と有効性は試験が進行するまで不明です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06096844",
      "title": "Chemotherapy Combined With Immunotherapy Versus Immunotherapy Alone for Older Adults With Stage IIIB-IV Lung Cancer, The ACHIEVE Trial",
      "publishedAt": "2023-10-24T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase III trial compares the effect of adding chemotherapy to immunotherapy (pembrolizumab) versus immunotherapy alone in treating patients with stage IIIB-IV lung cancer. Immunotherapy with monoclonal antibodies, such as pembrolizumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Chemotherapy drugs work in different ways to stop the growth of tumor cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. Giving pembrolizumab and chemotherapy may help stabilize lung cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 55,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06096844",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-10-24",
          "iso": "2023-10-24",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06096844"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE3"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2023-11-14-exploring-combined-immunotherapy-for-metastatic-cancer",
    "slug": "2023-11-14-exploring-combined-immunotherapy-for-metastatic-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06130826",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-11-14T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; Phase I trial",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Evaluating side effects, best dose, and effectiveness in treating unresectable metastatic colorectal cancer or CEA positive metastatic breast cancer.",
        "limitations": "Details about the exact outcomes and study population are not available.",
        "resultStatus": "No results posted",
        "intervention": "M5A-IL2 immunocytokine (M5A-ICK) combined with stereotactic body radiation therapy (SBRT)"
      },
      "ja": {
        "studyDesign": "科学ニュース報道; 第I相試験",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "切除不能な転移性結腸癌またはCEA陽性転移性乳癌に対する副作用、最適用量、治療効果の評価。",
        "limitations": "具体的な結果や研究対象についての詳細は利用できません。",
        "resultStatus": "結果は掲載されていません",
        "intervention": "M5A-IL2免疫サイトカイン（M5A-ICK）と定位体幹放射線療法（SBRT）の併用"
      }
    },
    "en": {
      "headline": "Exploring Combined Immunotherapy for Metastatic Cancer",
      "dek": "A new Phase I trial is investigating the safety and effectiveness of a novel immunocytokine combined with targeted radiation.",
      "whatHappened": "Researchers are studying the M5A-IL2 immunocytokine paired with stereotactic body radiation therapy (SBRT) to treat patients with unresectable metastatic colorectal cancer or CEA positive metastatic breast cancer. This trial aims to determine the best dose and evaluate side effects.",
      "whyItMatters": "Understanding how this combination affects cancer treatment could provide insights into enhancing immune responses in cancer therapies, but results have not yet been verified.",
      "realityCheck": "While promising, this trial is still in its early stages, and the actual effectiveness of these treatments remains unconfirmed."
    },
    "ja": {
      "headline": "転移性癌に対する併用免疫療法の探求",
      "dek": "新しい第I相試験が、標的放射線療法と併用した免疫サイトカインの安全性と効果を調査しています。",
      "whatHappened": "研究者たちは、切除不能な転移性結腸癌やCEA陽性転移性乳癌の患者を対象に、M5A-IL2免疫サイトカインとSBRTの併用について調査しています。この試験は最適用量を決定し、副作用を評価することを目指しています。",
      "whyItMatters": "この併用療法が癌治療にどのように影響するかを理解することは、癌療法における免疫反応を強化するための洞察を提供する可能性がありますが、結果はまだ確認されていません。",
      "realityCheck": "有望ではありますが、この試験はまだ初期段階であり、これらの治療法の実際の効果は確認されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06130826",
      "title": "Immune Response Activation for the Treatment of Unresectable Metastatic Colorectal Cancer or CEA Positive Metastatic Breast Cancer",
      "publishedAt": "2023-11-14T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase I trial studies the side effects and best dose of M5A-IL2 immunocytokine (M5A-ICK) combined with stereotactic body radiation therapy (SBRT) and to see how well they work in treating patients with colorectal cancer or xarcinoembryonic antigen (CEA) positive breast cancer that cannot be removed by surgery (unresectable) or has spread from where it first started (primary site) to other places in the body (metastatic). Carcinoembryonic Antigen (CEA) is a protein that is present in most colorectal cancers and in many other cancers, such as breast cancer, as well. SBRT uses special equipment to position a patient and deliver radiation to tumors with high precision. This method may kill tumor cells with fewer doses over a shorter period and cause less damage to normal tissue. Cytokines are signaling proteins that help control inflammation in the body. They allow the immune system to mount a defense if germs or cancer or other substances that can make people sick enter the body. Interleukin-2 (IL-2) is a powerful cytokine able to regulate the immune responses that are important for anticancer immunity. Immunocytokines (also called antibody-cytokine fusion proteins) are small proteins that regulate the activity of immune cells. The M5A-IL2 immunocytokine (M5A-ICK) combines the cancer targeting features of the M5A antibody with the immune system regulation properties of the cytokine IL-2. Giving M5A-ICK in combination with standard of care (SOC) SBRT may work better in treating patients with unresectable metastatic colorectal cancer or CEA positive metastatic breast cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 42,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: immune, cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 1 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06130826",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-11-14",
          "iso": "2023-11-14",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06130826"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE1"
        ],
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    }
  },
  {
    "id": "2024-03-27-investigating-immune-checkpoint-inhibitors-impact-on-heart-health",
    "slug": "2024-03-27-investigating-immune-checkpoint-inhibitors-impact-on-heart-health",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06332131",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2024-03-27T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Observational study; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Effects on heart and circulatory system",
        "limitations": "No sample size or verified subjects provided",
        "resultStatus": "Results have not been posted yet",
        "intervention": "Immune checkpoint inhibitors (ICI) therapy"
      },
      "ja": {
        "studyDesign": "観察研究; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "心臓および循環器系への影響",
        "limitations": "サンプルサイズや検証された対象は提供されていない",
        "resultStatus": "結果はまだ公開されていない",
        "intervention": "免疫チェックポイント阻害剤（ICI）治療"
      }
    },
    "en": {
      "headline": "Investigating Immune Checkpoint Inhibitors' Impact on Heart Health",
      "dek": "New observational study aims to explore how ICI therapy affects cardiac function in cancer patients.",
      "whatHappened": "Researchers are examining the effects of immune checkpoint inhibitors on coronary microvasculature in patients undergoing treatment for breast cancer or non-small cell lung cancer.",
      "whyItMatters": "Understanding the impact of cancer therapies on heart health is crucial for improving patient care and long-term outcomes.",
      "realityCheck": "This study is currently active but not recruiting participants, and no results have yet been made available."
    },
    "ja": {
      "headline": "免疫チェックポイント阻害剤が心臓の健康に与える影響の調査",
      "dek": "新しい観察研究が、がん患者におけるICI治療の心機能への影響を探ります。",
      "whatHappened": "研究者たちは、乳がんまたは非小細胞肺癌の治療を受けている患者における冠微小血管への免疫チェックポイント阻害剤の影響を調査しています。",
      "whyItMatters": "がん治療が心臓の健康に及ぼす影響を理解することは、患者ケアや長期的な結果の向上にとって重要です。",
      "realityCheck": "この研究は現在活動中ですが、参加者の募集は行っておらず、結果はまだ利用可能ではありません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06332131",
      "title": "Effects of Immune Checkpoint Inhibitors on Coronary Microvasculature",
      "publishedAt": "2024-03-27T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This is an observational study that includes patients with breast cancer or non-small cell lung cancer who will be treated with immune checkpoint inhibitor (ICI) therapy. The investigators will use echocardiograms, blood draws, and PET stress tests to understand how ICI therapy affects the heart and circulatory system.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: immune, checkpoint; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06332131",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2024-03-27",
          "iso": "2024-03-27",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06332131"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    }
  },
  {
    "id": "2024-08-23-exploring-safety-of-telisotuzumab-vedotin-for-lung-cancer",
    "slug": "2024-08-23-exploring-safety-of-telisotuzumab-vedotin-for-lung-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06568939",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2024-08-23T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Adverse events and change in disease activity",
        "limitations": "No detailed results provided",
        "resultStatus": "Ongoing recruitment for assessing safety",
        "intervention": "IV infusion of telisotuzumab vedotin at different doses",
        "trialPhase": "Phase 2"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "有害事象および病状の変化",
        "limitations": "詳細な結果は提供されていない",
        "resultStatus": "安全性評価のための募集が進行中",
        "intervention": "異なる用量でのテリソツズマブ ベドチンのIV投与",
        "trialPhase": "フェーズ2"
      }
    },
    "en": {
      "headline": "Exploring Safety of Telisotuzumab Vedotin for Lung Cancer",
      "dek": "A new trial examines how an experimental drug is administered to lung cancer patients.",
      "whatHappened": "This ongoing study assesses the safety profile of telisotuzumab vedotin via intravenous infusion in adult patients with non-small cell lung cancer.",
      "whyItMatters": "Understanding the safety of new cancer therapies is crucial for patient care and future treatment options.",
      "realityCheck": "Currently, there are no results available from this trial, and the actual impact of this treatment remains uncertain as it is still in the recruitment phase."
    },
    "ja": {
      "headline": "肺癌治療におけるテリソツズマブ ベドチンの安全性を探る",
      "dek": "新しい試験が、肺癌の患者に対して実験的な薬剤の投与方法を検討します。",
      "whatHappened": "この進行中の研究では、非小細胞肺癌の成人患者においてテリソツズマブ ベドチンの静脈内投与による安全性プロファイルを評価しています。",
      "whyItMatters": "新しい癌治療法の安全性を理解することは、患者のケアや将来の治療オプションにとって重要です。",
      "realityCheck": "現在、この試験からの結果は利用できず、この治療の実際の影響はまだ不確かであり、募集段階にあります。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06568939",
      "title": "A Study to Assess Adverse Events and How Intravenously (IV) Infused Telisotuzumab Vedotin (ABBV-399) Moves Through the Body as a Monotherapy in Adult Participants With Previously Treated Non-Squamous Non-Small Cell Lung Cancer (NSCLC)",
      "publishedAt": "2024-08-23T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Cancer is a condition where cells in a specific part of body grow and reproduce uncontrollably. Non-small cell lung cancer (NSCLC) is a solid tumor, a disease in which cancer cells form in the tissues of the lung. The purpose of this study is to assess how safe telisotuzumab vedotin is in adult participants with NSCLC. Change in disease activity and adverse events will be assessed.\n\nTelisotuzumab vedotin is an investigational drug being developed for the treatment of NSCLC. Participants will be randomly assigned a treatment of telisotuzumab vedotin in 1 of 3 arms at an 1:1:1 ratio. Each group receives intravenous (IV) infusion of telisotuzumab vedotin at different doses. Approximately 150 adult participants with c-Met overexpressing NSCLC will be enrolled in the study at approximately 80 to 90 sites worldwide.\n\nParticipants will receive IV telisotuzumab vedotin at 1 of 3 dose regimens as part of a 3 year study duration.\n\nThere may be higher treatment burden for participants in this trial compared to their standard of care. Participants will attend regular visits during the study at a hospital or clinic. The effect of the treatment will be checked by medical assessments, blood tests, checking for side effects and completing questionnaires.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06568939",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2024-08-23",
          "iso": "2024-08-23",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06568939"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2025-01-13-exploring-pembrolizumab-with-radiation-therapy-in-bladder-cancer",
    "slug": "2025-01-13-exploring-pembrolizumab-with-radiation-therapy-in-bladder-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06770582",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-01-13T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Phase II trial; Science news report.",
        "populationOrModel": "Not assessed in this news report.",
        "outcomes": "The combination may kill more tumor cells than chemotherapy with radiation in patients with non-muscle invasive bladder cancer.",
        "limitations": "Details remain unknown regarding the specific effects and outcomes of the treatment.",
        "resultStatus": "No results reported.",
        "intervention": "Pembrolizumab combined with radiation therapy.",
        "trialPhase": "Phase 2"
      },
      "ja": {
        "studyDesign": "第II相試験; 科学ニュース報道。",
        "populationOrModel": "本報道では研究対象を検証していない。",
        "outcomes": "非筋層浸潤膀胱癌患者において、放射線と化学療法の組み合わせよりも腫瘍細胞をより多く死滅させる可能性があります。",
        "limitations": "治療の具体的な影響と結果に関する詳細は不明のままです。",
        "resultStatus": "結果は報告されていない。",
        "intervention": "放射線療法と共にペムブロリズマブを使用。",
        "trialPhase": "第2相"
      }
    },
    "en": {
      "headline": "Exploring Pembrolizumab with Radiation Therapy in Bladder Cancer",
      "dek": "New trial investigates the potential of combining an immunotherapy drug with radiation for treatment.",
      "whatHappened": "The PARRC trial aims to assess whether pembrolizumab used alongside radiation can be more effective than conventional chemotherapy for non-muscle invasive bladder cancer.",
      "whyItMatters": "Understanding the effectiveness of immunotherapy combined with radiation could change treatment strategies in cancer therapy.",
      "realityCheck": "More research is needed to fully understand the outcomes and implications of this treatment strategy."
    },
    "ja": {
      "headline": "膀胱癌における放射線療法とペムブロリズマブの併用を探る",
      "dek": "新しい試験が免疫療法薬と放射線治療の組み合わせの可能性を調査します。",
      "whatHappened": "PARRC試験は、非筋層浸潤膀胱癌に対してペムブロリズマブと放射線療法の併用が標準の化学療法よりも効果的かどうかを評価することを目的としています。",
      "whyItMatters": "免疫療法と放射線療法の効果を理解することで、癌治療における治療戦略が変わる可能性があります。",
      "realityCheck": "この治療戦略の結果と影響を完全に理解するには、さらなる研究が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06770582",
      "title": "Testing the Addition of the Immunotherapy Drug, Pembrolizumab, to Radiation Therapy Compared to the Usual Chemotherapy Treatment During Radiation Therapy for Bladder Cancer, PARRC Trial",
      "publishedAt": "2025-01-13T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase II trial compares the use of pembrolizumab and radiation therapy to chemotherapy with cisplatin, gemcitabine, 5-fluorouracil or mitomycin-C and radiation therapy for the treatment of non-muscle invasive bladder cancer. Immunotherapy with monoclonal antibodies, such as pembrolizumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Chemotherapy drugs, such as cisplatin, gemcitabine, 5-fluorouracil or mitomycin-C, work in different ways to stop the growth of tumor cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. Radiation therapy uses high energy x-rays, particles, or radioactive seeds to kill cancer cells and shrink tumors. Giving pembrolizumab with radiation may kill more tumor cells than chemotherapy with radiation therapy in patients with non-muscle invasive bladder cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06770582",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-01-13",
          "iso": "2025-01-13",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06770582"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2025-02-11-comparative-study-of-new-anti-cancer-drug-combination-in-ewing-sarcoma-p",
    "slug": "2025-02-11-comparative-study-of-new-anti-cancer-drug-combination-in-ewing-sarcoma-p",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06820957",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-02-11T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; phase II/III trial comparing the effects of a new combination of anti-cancer drugs with usual treatment.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Comparative effectiveness against usual treatment with VDC/IE.",
        "limitations": "Details about specific outcomes and results are unavailable as the trial has been terminated.",
        "resultStatus": "No results reported.",
        "intervention": "Combination of vincristine, irinotecan, regorafenib (VIrR) with vincristine, doxorubicin, cyclophosphamide (VDC), ifosfamide and etoposide (IE)."
      },
      "ja": {
        "studyDesign": "科学ニュース報道; 新しい抗がん剤の組み合わせの効果と通常治療との比較の第II/III相試験。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "VDC/IEの通常治療に対する比較効果。",
        "limitations": "試験は終了したため、具体的な結果や詳細は不明。",
        "resultStatus": "結果は報告されていない。",
        "intervention": "ビンクリスチン、イリノテカン、レゴラフェニブ（VIrR）とビンクリスチン、ドキソルビシン、シクロフォスファミド（VDC）、イホスファミド、エトポシド（IE）の組み合わせ。"
      }
    },
    "en": {
      "headline": "Comparative Study of New Anti-Cancer Drug Combination in Ewing Sarcoma Patients Ends Without Results",
      "dek": "A terminated phase II/III trial compared a new combination treatment in newly diagnosed metastatic Ewing sarcoma.",
      "whatHappened": "The trial compared a combination of vincristine, irinotecan, and regorafenib with traditional regimens for Ewing sarcoma.",
      "whyItMatters": "This study highlights ongoing research efforts in the treatment of aggressive cancers, although the lack of results leaves key questions unanswered.",
      "realityCheck": "The trial was terminated, indicating that no conclusive data will emerge from this effort."
    },
    "ja": {
      "headline": "新しい抗がん剤の組み合わせに関する研究が結論なしに終了",
      "dek": "新たに診断された転移性ユーイング腫瘍患者における第II/III相試験が比較を行った。",
      "whatHappened": "ビンクリスチン、イリノテカン、レゴラフェニブの組み合わせを従来の治療法と比較する試験が行われた。",
      "whyItMatters": "この研究は、攻撃的ながんの治療における研究努力を強調しているが、結果が得られなかったことで重要な疑問が残る。",
      "realityCheck": "試験が終了したことは、この取り組みから結論のあるデータが得られないことを示している。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06820957",
      "title": "Testing a New Combination of Anti-cancer Drugs in Patients Newly Diagnosed With Ewing Sarcoma Who Have Cancer That Has Spread to Other Parts of the Body",
      "publishedAt": "2025-02-11T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase II/III trial compares the effect of vincristine, irinotecan, and regorafenib (VIrR) in combination with vincristine, doxorubicin, cyclophosphamide (VDC), ifosfamide and etoposide (IE) to usual treatment with VDC/IE for the treatment of newly diagnosed Ewing sarcoma or other round cell sarcomas that have spread from where they first started (primary site) to other places in the body (metastatic). Vincristine is in a class of medications called vinca alkaloids. It works by stopping tumor cells from growing and dividing and may kill them. Irinotecan is in a class of antineoplastic medications called topoisomerase I inhibitors. It blocks a certain enzyme needed for cell division and deoxyribonucleic acid (DNA) repair and may kill tumor cells. Regorafenib, a type of kinase inhibitor and a type of antiangiogenesis agent, blocks certain proteins, which may help keep tumor cells from growing. It may also prevent the growth of new blood vessels that tumors need to grow. Doxorubicin is in a class of medications called anthracyclines. Doxorubicin damages the cell's DNA and may kill tumor cells. It also blocks a certain enzyme needed for cell division and DNA repair. Cyclophosphamide is in a class of medications called alkylating agents. It works by damaging the cell's DNA and may kill tumor cells. It may also lower the body's immune response. Ifosfamide, a type of alkylating agent and a type of antimetabolite, attaches to DNA in cells and may kill tumor cells. Etoposide is in a class of medications known as podophyllotoxin derivatives. It blocks a certain enzyme needed for cell division and DNA repair and may kill tumor cells. Giving VIrR/VDC/IE may be more effective than usual treatment with VDC/IE in treating patients with newly diagnosed metastatic Ewing sarcoma or other round cell sarcomas.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 80,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=TERMINATED; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06820957",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-02-11",
          "iso": "2025-02-11",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06820957"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2",
          "PHASE3"
        ],
        "hasResults": false,
        "overallStatus": "TERMINATED"
      }
    }
  },
  {
    "id": "2025-03-14-exploring-new-combination-therapy-for-ras-mutated-multiple-myeloma",
    "slug": "2025-03-14-exploring-new-combination-therapy-for-ras-mutated-multiple-myeloma",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06876142",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-03-14T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "geroscience-drugs-trials",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; Interventional study",
        "populationOrModel": "People aged 18 and older with RRMM who have changes in their KRAS or NRAS genes.",
        "outcomes": "Safety and effectiveness of the combination therapy.",
        "limitations": "No results available; current registration status is suspended.",
        "resultStatus": "No results reported",
        "intervention": "Mirdametinib and sirolimus"
      },
      "ja": {
        "studyDesign": "科学ニュース報道; 介入研究",
        "populationOrModel": "18歳以上のRRMM患者で、KRASまたはNRAS遺伝子に変化がある人々。",
        "outcomes": "併用療法の安全性と有効性。",
        "limitations": "結果は利用できない; 現在の登録状況は一時停止中。",
        "resultStatus": "結果は報告されていません",
        "intervention": "ミルダメチニブおよびシロリムス"
      }
    },
    "en": {
      "headline": "Exploring New Combination Therapy for RAS Mutated Multiple Myeloma",
      "dek": "The study aims to evaluate mirdametinib and sirolimus for patients with relapsed refractory multiple myeloma.",
      "whatHappened": "Researchers are investigating a combined treatment approach using mirdametinib and sirolimus in patients with RAS mutations.",
      "whyItMatters": "This research focuses on targeted therapy for a challenging cancer type that typically has a poor response to existing treatments.",
      "realityCheck": "Details on the results and the specific impact on participants' health remain unknown as the study is currently suspended."
    },
    "ja": {
      "headline": "RAS変異を持つ多発性骨髄腫に対する新しい併用療法の探求",
      "dek": "この研究は、再発難治性多発性骨髄腫の患者に対するミルダメチニブとシロリムスの評価を目的としています。",
      "whatHappened": "研究者たちは、RAS変異を持つ患者に対してミルダメチニブとシロリムスを併用した治療法を調査しています。",
      "whyItMatters": "この研究は、既存の治療法に対して通常悪い反応を示す癌の種類に特化した治療に焦点を当てています。",
      "realityCheck": "結果や参加者の健康に対する具体的な影響に関する詳細は不明であり、現在研究は一時停止中です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06876142",
      "title": "Combination Therapy (Mirdametinib and Sirolimus) for RAS Mutated Relapsed Refractory Multiple Myeloma",
      "publishedAt": "2025-03-14T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nMultiple myeloma (MM) is a type of blood cancer that affects a person s immunity. MM returns after treatment (relapse) in almost all people; MM may also not respond to initial treatment (refractory). Many people with relapsed refractory MM (RRMM) also have changes in their KRAS and NRAS genes. Researchers want to try a new drug treatment that targets cancer with these changed genes.\n\nObjective:\n\nTo test 2 drugs (mirdametinib and sirolimus) in people with RRMM.\n\nEligibility:\n\nPeople aged 18 and older with RRMM who have changes in their KRAS or NRAS genes.\n\nDesign:\n\nParticipants will be screened. They will have blood tests and imaging scans. They will have an eye exam and a test of their heart function. They will need to provide proof of their disease status and of their KRAS or NRAS status. If neither is available, the tests will be repeated.\n\nParticipants will have a bone marrow biopsy: A needle will be inserted into a hipbone to draw out some soft tissue.\n\nThis study will be done in two parts. In the first part of this study, we will find a safe dose of mirdametinib combined with sirolimus. In the second part, we will learn more about how mirdametinib combined with sirolimus may work against RRMM.\n\nMirdametinib (capsules) and sirolimus (tablets) are taken by mouth. Participants will take both drugs at home on a 4-week cycle. They will take mirdametinib twice a day for the first 3 weeks of each cycle. They will take sirolimus once a day, every day, during each cycle.\n\nParticipants will have study visits once a week during the first cycle, and then on the first day of subsequent cycles. Blood, heart, imaging scans, and other tests will be repeated.\n\nTreatment with the study drugs will go on for 1 year. Then participants will have follow-up visits every 3 months for 4 more years.",
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence E",
      "relevanceScore": 75,
      "significanceScore": 48,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: sirolimus; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=SUSPENDED; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06876142",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-03-14",
          "iso": "2025-03-14",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06876142"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE1",
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "SUSPENDED"
      }
    }
  },
  {
    "id": "2025-03-30-gender-differences-in-gastric-cancer-treatment-under-scrutiny-in-germany",
    "slug": "2025-03-30-gender-differences-in-gastric-cancer-treatment-under-scrutiny-in-germany",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06902337",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-03-30T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; nationwide, retrospective cohort study",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Primary outcomes include hospital mortality and survival rates, while secondary endpoints include surgical complications, treatment modalities, and postoperative outcomes.",
        "limitations": "Details regarding sample size and specific demographic breakdowns are not available.",
        "resultStatus": "No results posted"
      },
      "ja": {
        "studyDesign": "科学ニュース報道; 全国規模の回顧的コホート研究",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "主な結果には入院死亡率と生存率が含まれ、二次的な指標には外科的合併症、治療法、術後の結果が含まれます。",
        "limitations": "サンプルサイズや特定の人口統計の内訳に関する詳細は利用できません。",
        "resultStatus": "結果は投稿されていません"
      }
    },
    "en": {
      "headline": "Gender Differences in Gastric Cancer Treatment Under Scrutiny in Germany",
      "dek": "A new cohort study highlights the need to explore how gender influences gastric cancer outcomes.",
      "whatHappened": "A retrospective cohort study is set to analyze nationwide data related to gender disparities in gastric cancer care in Germany.",
      "whyItMatters": "Understanding these disparities can lead to improved clinical guidelines and personalized treatment approaches for gastric cancer patients.",
      "realityCheck": "The study is ongoing and has not yet produced results. The analysis may reveal important insights, but further investigation will be needed to affirm any conclusions about gender differences."
    },
    "ja": {
      "headline": "ドイツにおける胃癌治療の性別差に関する調査",
      "dek": "新たなコホート研究が、性別が胃癌の結果にどのように影響するかを探求する必要性を浮き彫りにしています。",
      "whatHappened": "回顧的コホート研究が、ドイツにおける胃癌ケアに関する性別の不均衡に関連する全国データを分析する予定です。",
      "whyItMatters": "これらの不均衡を理解することで、胃癌患者向けの臨床ガイドラインや個別化された治療アプローチの改善につながる可能性があります。",
      "realityCheck": "この研究は進行中で、まだ結果は出ていません。分析は重要な洞察を明らかにするかもしれませんが、性別差についての結論を確認するにはさらなる調査が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06902337",
      "title": "Gender Differences in Gastric Cancer Care and Its Adherence to Guidelines in Germany",
      "publishedAt": "2025-03-30T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background: Gastric cancer is the fifth most common cancer globally and the fourth leading cause of cancer-related mortality. While gender differences in gastric cancer care are underexplored in Germany, international studies have revealed disparities in aspects such as histology, co-morbidities, treatment approaches, and survival outcomes. This study aims to explore gender-specific variations in clinical management and their impact on mortality, complications, and survival rates in gastric carcinoma patients in Germany.\n\nMethods: This nationwide, retrospective cohort study will analyze data from the German Diagnosis-Related Group statistic and regional clinical cancer registries from 2017 to 2021. The study will evaluate both datasets separately, providing a comprehensive view of gender differences in gastric cancer care. Primary outcomes include hospital mortality and survival rates, while secondary endpoints include surgical complications, treatment modalities, and postoperative outcomes. The analysis will investigate whether gender influences tumor characteristics, access to treatment, and therapy effectiveness. Statistical methods such as descriptive analysis, regression models, and survival analysis will be applied to identify gender-related variations in diagnosis, treatment, and outcomes.\n\nDiscussion: By identifying potential gender disparities in diagnosis, treatment, and outcomes, the findings may inform revisions to clinical guidelines and support the development of more personalized treatment strategies. This study aims to improve the quality of care for gastric cancer patients and promote more individualized, sex-sensitive medical practices.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=COMPLETED; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06902337",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-03-30",
          "iso": "2025-03-30",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT06902337"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "COMPLETED"
      }
    }
  },
  {
    "id": "2025-09-29-trial-examines-adding-chemo-to-surgery-for-advanced-head-and-neck-cancer",
    "slug": "2025-09-29-trial-examines-adding-chemo-to-surgery-for-advanced-head-and-neck-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07195734",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-09-29T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "This phase II trial tests the addition of chemotherapy or chemo-immunotherapy to standard salvage surgery followed by post operative radiation therapy and cisplatin for high risk patients with PD-L1 positive head and neck squamous cell carcinoma. Science news report.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Hypothesis that adding chemotherapy or chemo-immunotherapy may kill more tumor cells than salvage surgery alone.",
        "limitations": "Specific outcomes and efficiency remain unverified.",
        "resultStatus": "No results reported.",
        "intervention": "(olaparib and cemiplimab) added to standard care"
      },
      "ja": {
        "studyDesign": "この第II相試験では、PD-L1陽性の頭頸部扁平上皮癌の高リスク患者に対して、標準的な救済手術に化学療法または化学免疫療法を追加し、術後放射線療法とシスプラチンを続けることをテストします。科学ニュース報道。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "化学療法または化学免疫療法を追加することで、救済手術のみの場合よりも腫瘍細胞が多く死滅する可能性があるという仮説。",
        "limitations": "特定の成果や効率は未確認のままとなっています。",
        "resultStatus": "結果は報告されていません。",
        "intervention": "(オラパリブとセミプリマブ) を標準治療に追加"
      }
    },
    "en": {
      "headline": "Trial Examines Adding Chemo to Surgery for Advanced Head and Neck Cancer",
      "dek": "This phase II trial explores whether chemotherapy or chemo-immunotherapy improves outcomes for patients with recurring head and neck cancer.",
      "whatHappened": "The trial seeks to determine if adding carboplatin and paclitaxel (or their immunotherapy combination) to standard surgical approaches improves treatment response.",
      "whyItMatters": "Understanding if combinations of treatments can enhance cancer responses is vital for improving patient outcomes in advanced cases.",
      "realityCheck": "No results from this study have been reported yet, and further verification is needed to draw conclusions on treatment effectiveness."
    },
    "ja": {
      "headline": "進行した頭頸部癌に対する手術に化学療法を追加する試験",
      "dek": "この第II相試験では、再発した頭頸部癌患者の治療結果を改善するかどうかを探ります。",
      "whatHappened": "試験は、標準的な外科的アプローチにカルボプラチンとパクリタキセル（またはその免疫療法の組み合わせ）を追加することで治療反応が改善されるかどうかを確認しています。",
      "whyItMatters": "治療の組み合わせが癌の反応を高めるかどうかを理解することは、進行ケースでの患者の結果を改善するために重要です。",
      "realityCheck": "この研究からの結果はまだ報告されておらず、治療の有効性に関する結論を引き出すにはさらなる確認が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07195734",
      "title": "Testing the Addition of Chemotherapy or Chemo-Immunotherapy to the Usual Surgery for Advanced Head and Neck Cancer",
      "publishedAt": "2025-09-29T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase II trial tests the addition of chemotherapy, with carboplatin and paclitaxel, or chemo-immunotherapy, with carboplatin, paclitaxel and cemiplimab to standard salvage surgery followed by post operative radiation therapy and cisplatin for high risk patients, for the treatment of patients with PD-L1 positive head and neck squamous cell carcinoma that has come back and spread to nearby tissue or lymph nodes after a period of improvement (locally recurrent) or is persistent. Carboplatin is in a class of medications known as platinum-containing compounds. It works in a way similar to the anticancer drug cisplatin, but may be better tolerated than cisplatin. Carboplatin works by killing, stopping or slowing the growth of cancer cells. Paclitaxel is in a class of medications called antimicrotubule agents. It stops cancer cells from growing and dividing and may kill them. Immunotherapy with monoclonal antibodies, such as cemiplimab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Salvage surgery is surgery that takes place to remove tumor tissue after a failure of other treatment. High risk patients also receive radiation therapy uses high energy x-rays, particles, or radioactive seeds to kill cancer cells and shrink tumors. Cisplatin is in a class of medications known as platinum-containing compounds. It works by killing, stopping or slowing the growth of cancer cells. Adding chemotherapy or chemo-immunotherapy to standard salvage surgery may kill more tumor cells than salvage surgery alone in patients with PD-L1 positive locally recurrent or persistent head and neck squamous cell carcinoma.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07195734",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-09-29",
          "iso": "2025-09-29",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07195734"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2025-10-31-research-highlights-the-need-for-cardio-oncology-in-prostate-cancer-pati",
    "slug": "2025-10-31-research-highlights-the-need-for-cardio-oncology-in-prostate-cancer-pati",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07223385",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-10-31T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Reduce cardiovascular risk and improve cardiovascular risk prediction through the study of CHIP and metabolomics.",
        "limitations": "Details on specific outcomes and sample sizes are unavailable.",
        "resultStatus": "Results not yet posted",
        "intervention": "Early cardio-oncology intervention with aggressive guidelines-based cardiovascular optimization during ARPI therapy",
        "trialPhase": "Phase 2"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "CHIPおよびメタボロミクスを通じて心血管リスクを予測し、心血管リスクを低下させること。",
        "limitations": "特定のアウトカムおよびサンプルサイズに関する詳細は利用できません。",
        "resultStatus": "結果は未投稿",
        "intervention": "ARPI療法中の体系的な心臓腫瘍学介入と攻撃的なガイドラインに基づく心血管最適化",
        "trialPhase": "第2相"
      }
    },
    "en": {
      "headline": "Research Highlights the Need for Cardio-Oncology in Prostate Cancer Patients Undergoing ARPI Therapy",
      "dek": "A new intervention aims to fill critical gaps in cardiovascular risk management for prostate cancer patients treated with androgen receptor pathway inhibitors.",
      "whatHappened": "The study discusses the cardiovascular risks associated with androgen deprivation therapy in prostate cancer patients and tests an innovative cardio-oncology intervention for risk mitigation.",
      "whyItMatters": "Addressing cardiovascular risk in cancer patients is crucial, as traditional risk models may not suffice, especially for those undergoing specific treatments.",
      "realityCheck": "The identified gaps are significant, but the effectiveness of proposed interventions and their clinical outcomes remain unclear until results are available."
    },
    "ja": {
      "headline": "前立腺癌患者におけるARPI療法の心臓腫瘍学介入の必要性が明らかに",
      "dek": "新たな介入が、アンドロゲン受容体経路阻害剤で治療される前立腺癌患者の心血管リスク管理における重要なギャップを埋めることを目指している。",
      "whatHappened": "この研究では、前立腺癌患者におけるアンドロゲン除去療法と関連する心血管リスクについて論じ、リスク軽減のための革新的な心臓腫瘍学介入をテストする。",
      "whyItMatters": "癌患者の心血管リスクに対処することは重要であり、特定の治療を受けている患者においては伝統的なリスクモデルが十分でない可能性がある。",
      "realityCheck": "特定されたギャップは重要ですが、提案された介入の有効性と臨床結果は、結果が得られるまで不明です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07223385",
      "title": "High Cardiovascular Risk Intervention With Cardio-Oncology Consultation for Prostate Cancer Following Androgen Receptor Pathway Inhibitor (ARPI) Therapy (Heart-Safe)",
      "publishedAt": "2025-10-31T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "In patients with prostate cancer (PC), cardiovascular disease (CVD) causes significant morbidity and is the second leading cause of death. Both pre-existing CVD and the use of androgen deprivation therapy (ADT)-a key cornerstone of treatment for men with locally advanced or metastatic PC1,2 contribute to increased CV risk. ADT has been associated with adverse metabolic effects, including increased central adiposity, elevated low-density lipoprotein (LDL) levels, impaired glycemic control, and arterial wall remodeling and endothelial dysfunction\n\nThe data demonstrates that for most patients, the status quo is insufficient6 and there remains a critical gap in the early identification of high CV-risk PC patients who may benefit most from aggressive risk mitigation strategies. Mitigation strategies, like the addition of statins as primary prevention, have shown decrease in MI/CHD death across thousands of patients. Age-related expansion of hematopoietic clones carrying recurrent somatic mutations, termed clonal hematopoiesis of indeterminate potential (CHIP) has recently been identified as a significant driver of atherosclerosis, doubling the risk of coronary heart disease. Notably, while CHIP is detectable in \\~10% of persons over 70 years old, it is enriched in patients with solid malignancies, and radiotherapy exposure is among the most decisive risk factors for developing CHIP12-15. The inflammation-related metabolic signals are activated androgen signaling and exacerbated in patients with CHIP. However, the mechanistic link and clinical consequence are less understood. Therefore, it is critical to study the CV impact of CHIP and metabolic perturbations in patients with PC treated with ARSI therapy.\n\nWe plan to address these critical gaps by testing our innovative hypothesis that early cardio-oncology intervention with aggressive guidelines-based CV optimization during ARPI therapy will reduce CV risk and that CHIP and metabolomics will help identify adverse metabolic remodeling to improve CV risk prediction.\n\nRobust epidemiological and clinical trial data consistently demonstrate that patients with PC are poorly optimized from a CV risk modification perspective, and existing CV risk models do not perform well in patients with cancer. The data demonstrates that for most patients, the status quo is insufficient and there remains a critical gap in the early identification of high CV-risk PC patients who may benefit most from aggressive risk mitigation strategies.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07223385",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-10-31",
          "iso": "2025-10-31",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07223385"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2026-02-06-comparing-hormone-therapy-and-ribociclib-to-chemotherapy-for-high-stage-",
    "slug": "2026-02-06-comparing-hormone-therapy-and-ribociclib-to-chemotherapy-for-high-stage-",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07391774",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-02-06T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "This phase III trial compares standard of care hormone therapy plus ribociclib to chemotherapy followed by hormone therapy plus ribociclib for the treatment of patients with high anatomic stage breast cancer with low risk of the cancer returning (low risk recurrence).",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Hormone therapy plus ribociclib may work as well as chemotherapy followed by hormone therapy plus ribociclib.",
        "limitations": "Details on sample size and specific outcomes are not provided.",
        "resultStatus": "Science news report",
        "intervention": "Hormone therapy with ribociclib",
        "trialPhase": "PHASE3"
      },
      "ja": {
        "studyDesign": "本試験は、高解剖学的期の乳がんの患者に対して、標準的なホルモン療法とリボシクリブの併用と、化学療法に続くホルモン療法とリボシクリブの併用を比較するフェーズIII試験です。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "ホルモン療法とリボシクリブの併用は、化学療法に続くホルモン療法とリボシクリブの併用と同等の効果を持つ可能性があります。",
        "limitations": "サンプルサイズや具体的な結果に関する詳細は提供されていません。",
        "resultStatus": "科学ニュース報道",
        "intervention": "リボシクリブを用いたホルモン療法",
        "trialPhase": "フェーズ3"
      }
    },
    "en": {
      "headline": "Comparing Hormone Therapy and Ribociclib to Chemotherapy for High-Stage Breast Cancer",
      "dek": "A phase III trial is underway to evaluate the effectiveness of hormone therapy combined with ribociclib against chemotherapy followed by hormone therapy for breast cancer patients at low recurrence risk.",
      "whatHappened": "The RxFINE-Low trial is investigating whether hormone therapy paired with ribociclib is as effective as chemotherapy followed by hormone therapy in treating high anatomic stage breast cancer with low recurrence risk.",
      "whyItMatters": "This research could help determine more effective treatment options for patients with breast cancer that might reduce reliance on chemotherapy.",
      "realityCheck": "While the trial is in progress, results are not yet available, and the potential effectiveness of the therapies remains to be fully determined."
    },
    "ja": {
      "headline": "ホルモン療法とリボシクリブを高期乳がん治療における化学療法と比較",
      "dek": "フェーズIII試験が、低い再発リスクを持つ乳がん患者においてホルモン療法とリボシクリブの併用が化学療法の後に続くホルモン療法と同等かどうかを評価しています。",
      "whatHappened": "RxFINE-Low試験は、ホルモン療法とリボシクリブの併用が低い再発リスクを持つ高解剖学的期の乳がんに対して化学療法に続くホルモン療法よりも効果的かどうかを調査しています。",
      "whyItMatters": "この研究は、化学療法への依存を減らす可能性がある乳がん患者に対するより効果的な治療選択肢を決定するのに役立つかもしれません。",
      "realityCheck": "試験が進行中で結果はまだ利用できませんが、これらの療法の効果は完全には確定されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07391774",
      "title": "Testing Whether Hormone Therapy With Ribociclib is as Effective as Chemotherapy Followed by Hormone Therapy With Ribociclib for the Treatment of High Anatomic Stage Breast Cancer With Low Recurrence Risk, The RxFINE-Low Trial",
      "publishedAt": "2026-02-06T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This phase III trial compares standard of care hormone therapy plus ribociclib to chemotherapy followed by hormone therapy plus ribociclib for the treatment of patients with high anatomic stage breast cancer with low risk of the cancer returning (low risk recurrence). Ribociclib may stop the growth of tumor cells by blocking some of the enzymes needed for cell growth. Hormone therapy, with letrozole, anastrozole or exemestane, lowers the amount of estrogen made by the body. This may help stop the growth of tumor cells that need estrogen to grow. Chemotherapy drugs work in different ways to stop the growth of tumor cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. Hormone therapy plus ribociclib may work as well as chemotherapy followed by hormone therapy plus ribociclib for the treatment of high anatomic stage breast cancer with low recurrence risk.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 55,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07391774",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-02-06",
          "iso": "2026-02-06",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07391774"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE3"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2026-03-24-new-registry-aims-to-gather-data-on-very-rare-childhood-cancers",
    "slug": "2026-03-24-new-registry-aims-to-gather-data-on-very-rare-childhood-cancers",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07489378",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-03-24T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; observational study design.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Researchers aim to gather data on very rare cancers in children, teens, and young adults for future studies.",
        "limitations": "The information is based on recruitment of participants and does not include verified outcomes or results.",
        "resultStatus": "No results have been posted yet.",
        "intervention": "Participants will provide tumor tissue samples and may provide saliva or cheek swab samples for genetic testing."
      },
      "ja": {
        "studyDesign": "科学ニュース報道；観察研究デザイン。",
        "populationOrModel": "本報道では研究対象を検証していない。",
        "outcomes": "研究者は、子供、ティーンエイジャー、および若い成人の非常に稀な癌に関するデータを集め、将来の研究に役立てることを目指しています。",
        "limitations": "参加者の募集に基づく情報であり、検証された結果や成果は含まれていません。",
        "resultStatus": "結果はまだ公開されていません。",
        "intervention": "参加者は腫瘍組織サンプルを提供し、遺伝子検査のために唾液や頬のスワブサンプルを提供する可能性があります。"
      }
    },
    "en": {
      "headline": "New Registry Aims to Gather Data on Very Rare Childhood Cancers",
      "dek": "A new initiative by the NCI seeks to develop a registry for very rare solid tumors in children and young adults.",
      "whatHappened": "The NCI has launched a new registry for very rare cancers affecting children, teens, and young adults, aiming to collect vital data.",
      "whyItMatters": "Understanding very rare cancers can significantly enhance future treatment possibilities and research efforts.",
      "realityCheck": "The study is in the recruiting phase, and no results have yet been reported. All findings will require thorough validation."
    },
    "ja": {
      "headline": "新しい登録が非常に稀な小児癌に関するデータを収集することを目指す",
      "dek": "NCIによる新しい取り組みが子供や若者における非常に稀な固形腫瘍のレジストリを開発しようとしています。",
      "whatHappened": "NCIは、子供、ティーンエイジャー、若い成人に影響を与える非常に稀な癌の新しいレジストリを開始し、重要なデータを収集することを目指しています。",
      "whyItMatters": "非常に稀な癌を理解することは、将来の治療の可能性や研究努力を大幅に向上させることができます。",
      "realityCheck": "この研究は参加者を募集中であり、まだ結果は報告されていません。すべての結果は徹底的な検証を必要とします。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07489378",
      "title": "NCI Childhood Cancer Data Initiative (CCDI) Led Pediatric, Adolescent, and Young Adult Rare Cancer Registry for Very Rare Solid Tumors",
      "publishedAt": "2026-03-24T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nAll childhood cancers are rare, but some are called very rare. Very rare cancers are diagnosed in 2 or fewer out of 1 million people each year. Researchers want to gather data so they can learn more about these very rare cancers. They hope to use the data to develop future treatments.\n\nObjective:\n\nTo gather data for a registry of very rare cancers found in children, teens, and young adults.\n\nEligibility:\n\nPeople aged 1 month to 39 years newly diagnosed (within the past year) with a very rare cancer.\n\nDesign:\n\nParticipation will be by phone or email. No clinic visits are required.\n\nResearchers will look at the participant s medical records. They will ask for samples of tumor tissue that were already removed. They will use the samples for genetic testing. The results of these tests will be sent to the participant s own doctors.\n\nSome participants will be asked for saliva or cheek swab samples. They will receive a kit in the mail. They will spit into a tube or swab the inside of their cheek. They will mail the sample back to the lab.\n\nParticipants will fill out questionnaires once a year for 5 years. They will answer questions about:\n\nFamily history, such as other cancers in the family and their income, work, and education.\n\nDemographics, such as their gender, nationality, ethnicity, education, and work history.\n\nSymptoms and treatment for their cancer. This may include level of pain, and emotional and physical well-being.\n\nParticipants data will be added to a secure database for other researchers. Their data will be anonymous.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07489378",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-03-24",
          "iso": "2026-03-24",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07489378"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2026-04-13-tailored-stem-cell-transplantation-protocol-for-runx1-mutation-related-b",
    "slug": "2026-04-13-tailored-stem-cell-transplantation-protocol-for-runx1-mutation-related-b",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07524530",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-04-13T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "rejuvenation-regeneration",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "To determine how tailored doses may improve disease-free survival compared to historical expectations.",
        "limitations": "Details on the specific outcomes or data from the previous retrospective protocols were not provided.",
        "resultStatus": "Not yet recruiting.",
        "intervention": "Tailored chemotherapy and supportive care medications for patients with germline RUNX1 mutations."
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "カスタマイズされた投与が歴史的期待と比較して無病生存期間を改善するかどうかを確認すること。",
        "limitations": "以前のレトロスペクティブプロトコルからの具体的な結果またはデータについての詳細は提供されていません。",
        "resultStatus": "まだ募集していない。",
        "intervention": "RUNX1遺伝子変異を持つ患者のためのカスタマイズされた化学療法およびサポーティブケア薬。"
      }
    },
    "en": {
      "headline": "Tailored Stem Cell Transplantation Protocol for RUNX1 Mutation-Related Blood Cancers",
      "dek": "A new transplantation protocol aims to personalize chemotherapy for better outcomes in patients with RUNX1 mutations.",
      "whatHappened": "A prospective study is set to explore how individualized chemotherapy dosing may enhance disease-free survival rates for individuals with blood cancers linked to RUNX1 gene mutations. Screening of participants will occur ahead of the stem cell transplant procedure.",
      "whyItMatters": "Personalized treatments could provide insights into improving overall patient outcomes, especially in genetically influenced conditions such as blood cancers. The design aspects of this study may help in understanding the impact of tailored chemotherapy.",
      "realityCheck": "While this trial is designed to explore new treatment avenues, it remains in the planning stages and has not yet begun recruiting participants."
    },
    "ja": {
      "headline": "RUNX1変異関連の血液疾患に対するカスタマイズされた幹細胞移植プロトコル",
      "dek": "新しい移植プロトコルは、RUNX1変異を持つ患者のために化学療法を個別化することを目指しています。",
      "whatHappened": "個別の化学療法投与が、RUNX1遺伝子の変異に起因する血液がんの患者における無病生存率を改善する可能性を探るための前向き研究が計画されています。参加者のスクリーニングは幹細胞移植手術の前に行われます。",
      "whyItMatters": "個別化された治療法は、遺伝的影響を受ける状態、特に血液がんの患者における全体的な結果を改善する手助けをする可能性があります。今回の研究の設計は、個別化された化学療法の影響を理解する手助けになるかもしれません。",
      "realityCheck": "今回の試験は新しい治療法を探るために設計されていますが、まだ計画段階にあり、参加者の募集は始まっていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07524530",
      "title": "Stem Cell Transplantation for Participants With Germline RUNX1 Associated Blood Cancers",
      "publishedAt": "2026-04-13T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nSome blood cancers can be caused by germline variants (changes) in a person s RUNX1 gene. Germline variants are genetic inherited changes a person is born with. Stem cell transplants are used to treat many diseases including blood cancers. Stem cell transplantation for patients with germline RUNX1 mutation driven blood cancers is standard of care and available in most major medical centers. The difference with this transplantation protocol is that it is prospective, only available to participants with germline RUNX1 variants and designed to determine the extent to which tailoring chemotherapy and supportive care medication doses for each individual patient may improve outcomes compared to data derived from retrospective transplantation protocols for patients with RUNX1 varinats which is less accurate.\n\nObjective:\n\nThe primary objective of this protocol is to determine how tailored doses of chemotherapy and supportive care medications may improve disease free survival as compared to historical/expected disease free survival.\n\nEligibility:\n\nPeople aged 4 to 70 years with blood cancer caused by a RUNX1 gene mutation. Other participants are also needed: (1) stem cell donors; (2) relatives who do not have a mutation in the RUNX1 gene; and (3) healthy volunteers.\n\nDesign:\n\nParticipants with blood cancer will be screened during approximately 1-3 months before transplatation. They will have blood tests and tests of their heart and lung function. A sample of bone marrow may be taken.\n\nA flexible tube (central line) will be inserted into a vein in participants' chest or lower neck. This line will remain in place during the hospitalization and be used to draw blood and administer drugs. These lines are almost always transitioned to a peripherally inserted central catheter (PICC) line at the time of hospital discharge.\n\nParticipants will be inpatient for 4 to 5 weeks. They will receive drugs to prepare their body for the stem cell transplant. Some may also receive radiation treatment. Other tests will include imaging scans. The stem cell transplant will be given through the central line.\n\nAfter discharge from the clinic, participants will have follow-up visits at least once per week for approximately 100 days. Then they will have follow-up clinic visits for 3 years.\n\nDonors, relatives, and healthy volunteers may provide samples of blood, stool, and saliva. Adults may also opt to provide samples of skin and bone marrow.",
      "fieldId": "rejuvenation-regeneration",
      "evidence": "Evidence E",
      "relevanceScore": 75,
      "significanceScore": 48,
      "reason": "field=rejuvenation-regeneration; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: stem cell; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=NOT_YET_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07524530",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-04-13",
          "iso": "2026-04-13",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07524530"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "NOT_YET_RECRUITING"
      }
    }
  },
  {
    "id": "2026-05-08-new-vaccine-and-n-803-drug-combo-tested-for-early-stage-prostate-cancer",
    "slug": "2026-05-08-new-vaccine-and-n-803-drug-combo-tested-for-early-stage-prostate-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07574541",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-05-08T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Not specified in the news report",
        "limitations": "Details on outcomes are unavailable.",
        "resultStatus": "Not yet recruiting",
        "intervention": "TriAdeno vaccine and N-803",
        "trialPhase": "Phase 2"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "報道には明示されていない",
        "limitations": "結果についての詳細は利用できない。",
        "resultStatus": "まだ参加者を募集していない",
        "intervention": "TriAdenoワクチンとN-803",
        "trialPhase": "フェーズ2"
      }
    },
    "en": {
      "headline": "New Vaccine and N-803 Drug Combo Tested for Early-Stage Prostate Cancer",
      "dek": "A trial will evaluate the TriAdeno vaccine plus N-803 for managing low- or medium-risk prostate cancer.",
      "whatHappened": "Researchers are starting a clinical trial to evaluate the effectiveness of a new vaccine, TriAdeno, along with the N-803 drug in patients with early-stage prostate cancer. The trial is not yet recruiting participants.",
      "whyItMatters": "Prostate cancer management often involves active surveillance as a response to the disease's potential progression, making the evaluation of new therapies critical.",
      "realityCheck": "The study is still in the planning phase with no results yet available, and trial details, including participant responses, remain undeclared."
    },
    "ja": {
      "headline": "早期前立腺癌に対する新しいワクチンとN-803薬剤の組み合わせが試験予定",
      "dek": "TriAdenoワクチンとN-803を併用して、低リスクまたは中リスクの前立腺癌の管理を評価する臨床試験が開始されます。",
      "whatHappened": "研究者たちは、早期前立腺癌の患者を対象にTriAdenoワクチンとN-803薬剤の効果を評価する臨床試験を開始する予定ですが、まだ参加者の募集は始まっていません。",
      "whyItMatters": "前立腺癌の管理は、病気の進行に対する応答として主に積極的な監視が行われるため、新しい治療法の評価が重要です。",
      "realityCheck": "この研究はまだ計画段階にあり、結果はまだ利用できず、参加者の反応を含む試験の詳細も未公表です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07574541",
      "title": "Multitargeted Recombinant Ad5 PSA/MUC-1/Brachyury-Based Immunotherapy (TriAdeno) Vaccine With IL-15 Superagonist N-803 in Participants With Clinically Localized Prostate Cancer Undergoing Active Surveillance",
      "publishedAt": "2026-05-08T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nProstate cancer is the second most common cause of cancer-related death among men in the United States. Early-stage, low-grade prostate cancer is managed with active monitoring. However, 35% of men with this cancer will need treatment within 5 years because of tumor growth. Researchers want to know if a new vaccine that targets 3 anti-cancer proteins (TriAdeno) plus a drug (N-803) approved for bladder cancer can help stop prostate tumors from growing.\n\nObjective:\n\nTo test TriAdeno and N-803 in people with early-stage prostate cancer.\n\nEligibility:\n\nPeople aged 18 years and older with early-stage low- or medium-risk prostate cancer.\n\nDesign:\n\nParticipants will be screened. They will have a physical exam with blood tests. They will have a test of their heart function. They will have an imaging scan. They may have a rectal exam.\n\nTriAdeno is injected under the skin of the upper thigh; N-803 is injected under the skin of the abdomen. Participants will be treated in up to four 21-day cycles. They will get both injections on the first day of each cycle.\n\nParticipants may opt to complete a memory aid: They may record all of their symptoms for 7 days after each injection. They may also complete a questionnaire about their prostate symptoms.\n\nBlood tests, imaging scans, and other tests will be repeated during the study.\n\nA tissue sample (biopsy) of the tumor will be collected during or after cycle 2; a second biopsy may be taken about 1 year later.\n\nParticipants will have follow-up phone calls for 5 years....",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 75,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=NOT_YET_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07574541",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-05-08",
          "iso": "2026-05-08",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07574541"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "NOT_YET_RECRUITING"
      }
    }
  },
  {
    "id": "2026-09-01-examining-nemtabrutinib-s-potential-for-treatment-resistant-cll-sll",
    "slug": "2026-09-01-examining-nemtabrutinib-s-potential-for-treatment-resistant-cll-sll",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07796373",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-09-01T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report; Interventional trial design involving multiple assessments including biopsy and imaging.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Effectiveness and safety of nemtabrutinib in patients with CLL/SLL resistant to previous treatments.",
        "limitations": "The study has not yet started recruiting participants, and detailed outcomes are not available.",
        "resultStatus": "Ongoing study; results not available.",
        "intervention": "Nemtabrutinib administered orally once a day in 4-week cycles."
      },
      "ja": {
        "studyDesign": "科学ニュース報道; 複数の評価を含む介入試験デザイン。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "既存の治療に抵抗性のあるCLL/SLL患者におけるネムタブルチニブの効果と安全性。",
        "limitations": "まだ参加者の募集が開始されておらず、詳細な結果は利用できない。",
        "resultStatus": "進行中の研究; 結果は利用できない。",
        "intervention": "1日1回、4週間サイクルで経口投与されるネムタブルチニブ。"
      }
    },
    "en": {
      "headline": "Examining Nemtabrutinib's Potential for Treatment-Resistant CLL/SLL",
      "dek": "A new study aims to test nemtabrutinib in patients with chronic lymphocytic leukemia or small lymphocytic leukemia who are resistant to previous therapies.",
      "whatHappened": "The trial will assess the safety and effectiveness of nemtabrutinib in patients whose chronic lymphocytic leukemia or small lymphocytic leukemia continues to progress despite existing treatments.",
      "whyItMatters": "Understanding how new therapies like nemtabrutinib can work in treatment-resistant cases could expand options for patients with limited therapies.",
      "realityCheck": "The study is not yet recruiting, and no results have been reported. Its outcomes remain uncertain as they rely on future participant responses."
    },
    "ja": {
      "headline": "治療抵抗性CLL/SLLに対するネムタブルチニブの可能性を検討",
      "dek": "新しい研究が、既存の治療に抵抗性を持つ慢性リンパ性白血病または小リンパ性白血病患者におけるネムタブルチニブの試験を目指す。",
      "whatHappened": "この試験は、既存の治療法にもかかわらず進行する慢性リンパ性白血病または小リンパ性白血病患者に対するネムタブルチニブの安全性と有効性を評価します。",
      "whyItMatters": "ネムタブルチニブのような新しい治療法が治療抵抗性のケースでどのように作用するかを理解することは、限られた治療法しかない患者の選択肢を広げる可能性があります。",
      "realityCheck": "この研究はまだ参加者を募集しておらず、結果は報告されていません。そのため、結果は将来の参加者の反応に依存しており不確かです。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07796373",
      "title": "Nemtabrutinib for Chronic Lymphocytic Leukemia (CLL)/Small Lymphocytic Leukemia (SLL) Refractory to Covalent Bruton Tyrosine Kinase Inhibitor or Pirtobrutinib and Previously Treated With a BCL2 Inhibitor",
      "publishedAt": "2026-09-01T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "Background:\n\nChronic lymphocytic leukemia (CLL)/small lymphocytic leukemia (SLL) are diseases in which the body makes too many white blood cells that do not work properly. Because white cells play a role in immune function, people with CLL/SLL may be at greater risk of infections. CLL/SLL can be controlled with drugs, but many people develop resistance, and the treatments stop working.\n\nObjective:\n\nTo test a new drug (nemtabrutinib) in people with CLL/SLL.\n\nEligibility:\n\nPeople aged 18 years or older with CLL/SLL that persists despite treatment.\n\nDesign:\n\nParticipants will be screened. They will have imaging scans, blood and urine tests, and a test of their heart function. They will have a bone marrow biopsy: a sample of tissue and fluids will be drawn from inside their hip bone. They may also have a sample cut from a swollen lymph node, if one is safe to access.\n\nNemtabrutinib is a tablet taken by mouth. Participants will take the drug once a day at home in 4-week cycles. They will have clinic visits at least every 4 weeks for the first 6 months and then every 3 months after that.\n\nBiopsies, imaging exams, and other tests may be repeated at these visits. Participants may also undergo lymphapheresis: Blood will be drawn from a tube inserted into a vein. The blood will pass through a machine that separates out cancer and immune cells. The remaining blood will be returned to the body through a different tube.\n\nParticipants may stay in the study as long as the drug is helping them.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 60,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in abstract: immune, cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=NOT_YET_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07796373",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-09-01",
          "iso": "2026-09-01",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07796373"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "NOT_YET_RECRUITING"
      }
    }
  },
  {
    "id": "2026-09-30-exploring-new-combination-therapy-for-advanced-biliary-tract-cancer",
    "slug": "2026-09-30-exploring-new-combination-therapy-for-advanced-biliary-tract-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07850791",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-09-30T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Multicenter, phase II, interventional single-arm clinical study; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Survival, disease progression, safety",
        "limitations": "Details regarding participant demographics and specific outcomes are unavailable.",
        "resultStatus": "No results posted",
        "sampleSize": "38 participants",
        "intervention": "Sacituzumab tirumotecan plus pembrolizumab",
        "trialPhase": "Phase II"
      },
      "ja": {
        "studyDesign": "多施設、フェーズ II の介入単一群臨床試験; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "生存、疾患の進行、安全性",
        "limitations": "参加者の人口統計や具体的な結果に関する詳細は利用できません。",
        "resultStatus": "結果が投稿されていない",
        "sampleSize": "38名の参加者",
        "intervention": "サシツズマブ・ティルモテカンとペンブロリズマブの併用",
        "trialPhase": "フェーズ II"
      }
    },
    "en": {
      "headline": "Exploring New Combination Therapy for Advanced Biliary Tract Cancer",
      "dek": "A study investigates sacituzumab tirumotecan and pembrolizumab’s effects on survival and safety in advanced biliary tract cancer.",
      "whatHappened": "A phase II clinical trial is recruiting participants to test the combination therapy of sacituzumab tirumotecan with pembrolizumab for advanced biliary tract cancer.",
      "whyItMatters": "Understanding the effectiveness and safety of new treatments for advanced cancer types is crucial for developing future therapeutic options.",
      "realityCheck": "No results have been posted yet; it remains uncertain how effective this treatment will be."
    },
    "ja": {
      "headline": "進行した胆道癌に対する新しい併用療法の調査",
      "dek": "サシツズマブ・ティルモテカンとペンブロリズマブの併用が、胆道癌における生存と安全性に与える影響を調査する研究。",
      "whatHappened": "進行した胆道癌に対するサシツズマブ・ティルモテカンとペンブロリズマブの併用療法を試すためのフェーズ II 臨床試験が参加者を募集中です。",
      "whyItMatters": "進行癌の新しい治療法の効果と安全性を理解することは、将来の治療選択肢を開発するために重要です。",
      "realityCheck": "まだ結果が投稿されておらず、この治療法がどれほど効果的であるかは不明です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07850791",
      "title": "A Prospective Study of Sacituzumab Tirumotecan Plus Pembrolizumab for Advanced Biliary Tract Cancer",
      "publishedAt": "2026-09-30T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "The purpose of this study is to explore the effects of sacituzumab tirumotecan combined with pembrolizumab on survival, disease progression, and safety in patients with advanced biliary tract malignancies in the second-line and later settings. This is a multicenter, phase II, interventional single-arm clinical study. A total of 38 participants will be enrolled. Participants will receive the combination therapy until disease progression or unacceptable toxicity.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07850791",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-09-30",
          "iso": "2026-09-30",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07850791"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "PHASE2"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    }
  },
  {
    "id": "2026-10-05-fes-pet-ct-imaging-seek-to-guide-er-positive-breast-cancer-treatment",
    "slug": "2026-10-05-fes-pet-ct-imaging-seek-to-guide-er-positive-breast-cancer-treatment",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07859046",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T01:38:29.620Z",
    "discoveredAt": "2026-10-06T01:15:10.569Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Trial registration and research plan. Observational study. Overall status: enrolling by invitation. No results posted.",
        "populationOrModel": "Participants named in the registry record. The record does not state a sample size.",
        "intervention": "FES PET/CT imaging",
        "outcomes": "No results are posted.",
        "limitations": "This is a first public registration, not a completed study. Enrolling by invitation is not an open call for participants. No treatment effect is reported.",
        "resultStatus": "Trial registration and research plan. No results posted."
      },
      "ja": {
        "studyDesign": "試験登録・研究計画。観察研究。全体の状態は招待による登録。結果は未掲載。",
        "populationOrModel": "登録に記載された参加者。登録上、人数は示されていない。",
        "intervention": "FES PET/CT イメージング",
        "outcomes": "結果は未掲載である。",
        "limitations": "これは完了した研究ではなく、初回公開された試験登録である。招待による登録は、広く参加者を募る状態ではない。治療効果は報告されていない。",
        "resultStatus": "試験登録・研究計画。結果は未掲載。"
      }
    },
    "en": {
      "headline": "Registry Lists an FES PET/CT Study for ER-Positive Breast Cancer",
      "dek": "ClinicalTrials.gov posted an observational registration that is enrolling by invitation. No results are posted.",
      "whatHappened": "Registry record NCT07859046 is an observational study of FES PET/CT in estrogen receptor-positive breast cancer. The record says its purpose is to see how the scans can help doctors diagnose that cancer, plan treatment, and check treatment response. Participants undergo the scans as part of regular cancer care or study procedures. The overall status is enrolling by invitation.",
      "whyItMatters": "A first public registration shows what the study plans to ask. It does not show whether the imaging changes care.",
      "realityCheck": "No results are posted. Enrolling by invitation is not an open call for participants, and the registration is not a completed study or an established treatment."
    },
    "ja": {
      "headline": "ER陽性乳がんを対象にした FES PET/CT の試験登録が公開された",
      "dek": "ClinicalTrials.gov に観察研究の登録が公開され、状態は招待による登録である。結果は未掲載である。",
      "whatHappened": "登録 NCT07859046 は、エストロゲン受容体陽性の乳がんを対象に FES PET/CT を用いる観察研究である。診断、治療の計画、治療反応の確認にスキャンがどう役立つかを見る、という目的が記されている。参加者は通常の診療または試験手順の一環でスキャンを受ける。全体の状態は招待による登録である。",
      "whyItMatters": "初回の公開登録は、研究が何を問う予定かを示す。画像検査が診療を変えるかは示していない。",
      "realityCheck": "結果は未掲載である。招待による登録は広く参加者を募る状態ではなく、完了した研究でも確立した治療でもない。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07859046",
      "title": "18F-FES PET/CT in the Treatment Planning, and Response Assessment of ER-Positive Breast Cancer",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T01:15:10.569Z",
      "abstract": "This study uses FES PET/CT imaging to evaluate estrogen receptor-positive breast cancer. FES PET/CT is a type of imaging that can show whether breast cancer cells have estrogen receptors. The purpose of this study is to see how well FES PET/CT can help doctors: (1) diagnose ER-positive breast cancer, (2) plan the best treatment, and (3) check how well treatment is working. Participants will undergo FES PET/CT scans as part of their regular cancer care or study procedures. The results may help improve how doctors use imaging to guide treatment decisions for patients with ER-positive breast cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 75,
      "significanceScore": 41,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; StudyFirstPostDate is inside the lookback window (new public registration); OverallStatus=ENROLLING_BY_INVITATION; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07859046",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        },
        "lastUpdatePostDate": {
          "raw": "2026-10-05",
          "iso": "2026-10-05",
          "precision": "day"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "studyFirstPostDate",
          "lastUpdatePostDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.",
        "id": "NCT07859046"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "ENROLLING_BY_INVITATION"
      }
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
  }
] as Article[];

export function isPublishedArticle(
  article: Article,
): article is Article & { sitePublishedAt: string } {
  return Boolean(article.sitePublishedAt);
}

export function listArticles(): Article[] {
  return articles
    .filter(isPublishedArticle)
    .sort(
      (a, b) =>
        new Date(b.sourcePublishedAt).getTime() -
        new Date(a.sourcePublishedAt).getTime(),
    );
}

export function listDraftArticles(): Article[] {
  return articles.filter((article) => !isPublishedArticle(article));
}

export function getArticleBySlug(slug: string): Article | undefined {
  return listArticles().find((article) => article.slug === slug);
}

export function getArticleById(id: string): Article | undefined {
  return listArticles().find((article) => article.id === id);
}

export function featuredArticle(): Article | undefined {
  return listArticles().find((article) => article.featured);
}

export function articleSitemapDate(article: Article): Date | undefined {
  if (!isPublishedArticle(article)) return undefined;
  if (article.siteModifiedAt) return new Date(article.siteModifiedAt);
  return new Date(article.sitePublishedAt);
}
