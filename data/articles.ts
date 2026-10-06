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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
    },
    "sitePublishedAt": "2026-10-06T01:38:29.620Z"
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
        "studyDesign": "Observational study; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Evaluate how well FES PET/CT helps to diagnose ER-positive breast cancer, plan treatment, and assess treatment response.",
        "limitations": "Details on study population and findings are unavailable.",
        "resultStatus": "No results available",
        "intervention": "FES PET/CT imaging"
      },
      "ja": {
        "studyDesign": "観察研究; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "ER 陽性乳がんの診断、治療計画、治療反応の評価における FES PET/CT の有用性を評価する。",
        "limitations": "研究対象や結果に関する詳細は利用できません。",
        "resultStatus": "結果は利用できません",
        "intervention": "FES PET/CT イメージング"
      }
    },
    "en": {
      "headline": "FES PET/CT Imaging Seek to Guide ER-Positive Breast Cancer Treatment",
      "dek": "A study intends to assess the effectiveness of FES PET/CT scans in diagnosing and managing ER-positive breast cancer.",
      "whatHappened": "Researchers are evaluating the impact of FES PET/CT imaging on diagnosing and assessing treatment in patients with estrogen receptor-positive breast cancer. This involves participants undergoing scans as part of standard care.",
      "whyItMatters": "Determining how effectively FES PET/CT aids in the management of ER-positive breast cancer may enhance treatment planning for patients.",
      "realityCheck": "This study is in the enrolling phase and does not yet provide outcome results. It does not imply an established treatment for patients."
    },
    "ja": {
      "headline": "ER陽性乳がん治療のための FES PET/CT イメージングの効果を探る",
      "dek": "FES PET/CT スキャンが ER 陽性乳がんの診断と管理にどのように寄与するかを評価する研究が進行中です。",
      "whatHappened": "研究者たちは、エストロゲン受容体陽性乳がん患者における診断および治療評価のための FES PET/CT イメージングの影響を評価しています。参加者は標準的なケアの一環としてスキャンを受けることになります。",
      "whyItMatters": "FES PET/CT が ER 陽性乳がんの管理にどれだけ効果的であるかを決定することは、患者の治療計画を改善する可能性があります。",
      "realityCheck": "この研究は参加者募集中であり、まだ結果は提供されていません。患者への確立された治療法を示唆するものではありません。"
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
  },
  {
    "id": "2019-11-29-new-phase-iii-trial-evaluates-osimertinib-with-bevacizumab-for-lung-canc",
    "slug": "2019-11-29-new-phase-iii-trial-evaluates-osimertinib-with-bevacizumab-for-lung-canc",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04181060",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2019-11-29T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
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
        "outcomes": "Investigating the effect on cancer control and overall survival",
        "limitations": "Details about study population and outcomes are unavailable",
        "resultStatus": "Results not posted",
        "intervention": "Combination of osimertinib and bevacizumab vs. osimertinib alone",
        "trialPhase": "PHASE3"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "がんの制御と全体的な生存への影響を調査中",
        "limitations": "研究対象や結果に関する詳細は不明",
        "resultStatus": "結果は未掲載",
        "intervention": "オシメルチニブとベバシズマブの併用 vs. オシメルチニブ単独",
        "trialPhase": "PHASE3"
      }
    },
    "en": {
      "headline": "New Phase III Trial Evaluates Osimertinib with Bevacizumab for Lung Cancer",
      "dek": "Study assesses potential benefits of combining an EGFR inhibitor with an anti-angiogenic agent.",
      "whatHappened": "A phase III trial is currently recruiting to compare osimertinib combined with bevacizumab against osimertinib alone in patients with EGFR-mutant lung cancer.",
      "whyItMatters": "This research aims to explore whether the combination treatment can enhance cancer control and potentially improve survival.",
      "realityCheck": "While the study is focused on cancer treatment, it is still in the recruitment phase and results are not yet available."
    },
    "ja": {
      "headline": "新しいフェーズIII試験が肺癌に対するオシメルチニブとベバシズマブの併用を評価",
      "dek": "EGFR阻害剤と抗血管新生薬の併用の潜在的利益を調査しています。",
      "whatHappened": "フェーズIII試験が現在、EGFR変異肺癌患者においてオシメルチニブとベバシズマブの併用をオシメルチニブ単独と比較するために被験者を募集中です。",
      "whyItMatters": "この研究は、併用療法ががんの制御を強化し、潜在的に生存率を改善できるかどうかを探求することを目的としています。",
      "realityCheck": "この研究はがん治療に焦点を当てているものの、まだ募集段階であり、結果は現在利用できません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04181060",
      "title": "Osimertinib With or Without Bevacizumab as Initial Treatment for Patients With EGFR-Mutant Lung Cancer",
      "publishedAt": "2019-11-29T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This phase III trial compares the effect of bevacizumab and osimertinib combination vs. osimertinib alone for the treatment of non-small cell lung cancer that has spread outside of the lungs (stage IIIB-IV) and has a change (mutation) in a gene called EGFR. The EGFR protein is involved in cell signaling pathways that control cell division and survival. Sometimes, mutations in the EGFR gene cause EGFR proteins to be made in higher than normal amounts on some types of cancer cells. This causes cancer cells to divide more rapidly. Osimertinib may stop the growth of tumor cells by blocking EGFR that is needed for cell growth in this type of cancer. Bevacizumab is in a class of medications called antiangiogenic agents. It works by stopping the formation of blood vessels that bring oxygen and nutrients to tumor. This may slow the growth and spread of tumor. Giving osimertinib with bevacizumab may control cancer for longer and help patients live longer as compared to osimertinib alone.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 55,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04181060",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2019-11-29",
          "iso": "2019-11-29",
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
        "id": "NCT04181060"
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
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2020-03-19-national-cancer-institute-launches-cancer-moonshot-biobank-for-research",
    "slug": "2020-03-19-national-cancer-institute-launches-cancer-moonshot-biobank-for-research",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04314401",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2020-03-19T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Longitudinal study",
        "populationOrModel": "living-people",
        "outcomes": "Not assessed in this news report",
        "limitations": "Details on specific outcomes or analyses are unavailable.",
        "resultStatus": "Science news report",
        "intervention": "none"
      },
      "ja": {
        "studyDesign": "縦断的研究",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "本報道では研究結果を検証していない",
        "limitations": "具体的な結果や分析に関する詳細は利用できません。",
        "resultStatus": "科学ニュース報道",
        "intervention": "なし"
      }
    },
    "en": {
      "headline": "National Cancer Institute Launches Cancer Moonshot Biobank for Research",
      "dek": "A longitudinal study collecting samples to understand cancer progression.",
      "whatHappened": "The National Cancer Institute has initiated the Cancer Moonshot Biobank, a longitudinal study aiming to collect tissue and blood samples from cancer patients alongside their medical information.",
      "whyItMatters": "This biobank aims to enhance understanding of how cancer develops and changes over time, which could inform better treatment strategies, although specific outcomes from this study have not yet been reported.",
      "realityCheck": "While this initiative is noteworthy for advancing cancer research, it does not offer immediate benefits or results related to treatment or longevity."
    },
    "ja": {
      "headline": "国立がん研究所ががんムーンショットバイオバンクを立ち上げ",
      "dek": "がんの進行を理解するための縦断的研究を実施。",
      "whatHappened": "国立がん研究所は、がん患者からの組織および血液サンプルに加えて医療情報を収集することを目的としたがんムーンショットバイオバンクという縦断的研究を開始した。",
      "whyItMatters": "このバイオバンクは、がんの進展と変化を理解することで、より良い治療戦略を情報提供することを目的としているが、具体的な研究結果はまだ報告されていない。",
      "realityCheck": "この取り組みはがん研究を進める上で注目に値するが、治療や長寿に関連する即座の利点や結果を提供するものではない。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04314401",
      "title": "National Cancer Institute \"Cancer Moonshot Biobank\"",
      "publishedAt": "2020-03-19T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This trial collects multiple tissue and blood samples, along with medical information, from cancer patients. The \"Cancer Moonshot Biobank\" is a longitudinal study. This means it collects and stores samples and information over time, throughout the course of a patient's cancer treatment. By looking at samples and information collected from the same people over time, researchers hope to better understand how cancer changes over time and over the course of medical treatments.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04314401",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2020-03-19",
          "iso": "2020-03-19",
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
        "id": "NCT04314401"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2021-02-12-new-educational-materials-for-genetic-testing-under-development-for-dive",
    "slug": "2021-02-12-new-educational-materials-for-genetic-testing-under-development-for-dive",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT04751435",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2021-02-12T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
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
        "outcomes": "Participants' feedback on educational materials will be used for improvement.",
        "limitations": "Details on specific participant demographics and their responses are unavailable.",
        "resultStatus": "No results available",
        "intervention": "Developing new educational materials about genetic testing"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "参加者のフィードバックを利用して教育資料の改善を行う。",
        "limitations": "具体的な参加者の人口統計や彼らの回答に関する詳細は入手できない。",
        "resultStatus": "結果は利用できない",
        "intervention": "遺伝子検査に関する新しい教育資料の開発"
      }
    },
    "en": {
      "headline": "New Educational Materials for Genetic Testing Under Development for Diverse Cancer Patient Groups",
      "dek": "Researchers aim to create culturally relevant resources regarding genetic testing for cancer patients.",
      "whatHappened": "A study is being conducted to develop educational materials about genetic testing, focusing on diverse linguistic and cultural groups.",
      "whyItMatters": "This initiative seeks to improve understanding of genetic testing options among cancer patients, potentially impacting treatment choices.",
      "realityCheck": "The development of educational materials does not imply any treatment or outcomes related to longevity."
    },
    "ja": {
      "headline": "多様な癌患者グループのための遺伝子検査に関する教育資料が開発中",
      "dek": "研究者は、癌患者向けの遺伝子検査に関する文化的に関連したリソースを作成することを目指しています。",
      "whatHappened": "遺伝子検査に関する教育資料を開発するための研究が行われており、多様な言語と文化のグループに焦点を当てています。",
      "whyItMatters": "この取り組みは、癌患者に対する遺伝子検査オプションの理解を深め、治療の選択に影響を与える可能性があります。",
      "realityCheck": "教育資料の開発は、寿命に関連する治療や結果を示唆するものではありません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT04751435",
      "title": "Developing New Educational Materials About Genetic Testing for a Diverse Group of Cancer Patients",
      "publishedAt": "2021-02-12T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "Genetic testing is a type of test that detects changes to the genes-the DNA instructions that are passed on from the mother and father. The results of a genetic test can confirm whether the participant has a genetic disorder, which is a disease caused in whole or in part by changes to the genes. Genetic testing can also help determine a person's chance of getting or passing on a genetic disorder. Genetic tests use a sample of blood, hair, skin, or other tissue, and they can look at one gene or multiple genes at the same time. Genetic testing may change the options for treating people with certain types of cancer. For example, some medications are more helpful for the treatment of cancer in people with certain gene changes (mutations).\n\nThe researchers are doing this study to develop new educational materials about genetic testing for people who speak different languages and have diverse cultural and educational backgrounds. During the study, the staff will interview participants with diverse cultural and educational backgrounds and ask them to review a sample of the educational materials that have been developed so far. Participants will give their opinions on these materials, and the researchers will use participants' feedback to improve the materials.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT04751435",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2021-02-12",
          "iso": "2021-02-12",
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
        "id": "NCT04751435"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2023-02-22-effects-of-jing-si-herbal-tea-on-bladder-cancer-symptoms-under-investiga",
    "slug": "2023-02-22-effects-of-jing-si-herbal-tea-on-bladder-cancer-symptoms-under-investiga",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT05739071",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-02-22T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional trial registration; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Effects on lower urinary tract symptoms after intravesical therapy in bladder cancer patients",
        "limitations": "No results available; details on sample size and specific conditions not provided.",
        "resultStatus": "Results not yet available",
        "intervention": "JING SI HERBAL TEA"
      },
      "ja": {
        "studyDesign": "介入試験の登録; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "膀胱癌患者における膀胱内治療後の下部尿路症状への影響",
        "limitations": "結果は未発表; サンプルサイズや具体的な病状に関する詳細は提供されていない。",
        "resultStatus": "結果はまだ入手できていない",
        "intervention": "JING SI HERBAL TEA"
      }
    },
    "en": {
      "headline": "Effects of JING SI HERBAL TEA on Bladder Cancer Symptoms Under Investigation",
      "dek": "A new trial explores how herbal tea influences urinary tract symptoms post-intravesical therapy in bladder cancer patients.",
      "whatHappened": "The study is registered to evaluate the impact of JING SI HERBAL TEA on urinary tract symptoms after treatment in bladder cancer patients, but results have not yet been reported.",
      "whyItMatters": "Investigating herbal remedies like JING SI HERBAL TEA could provide insights into adjunct treatments for managing symptoms in cancer patients.",
      "realityCheck": "No verified results are available yet, and the effects of JING SI HERBAL TEA on urinary issues remain uncertain."
    },
    "ja": {
      "headline": "膀胱癌の症状に対するJING SI HERBAL TEAの効果が調査中",
      "dek": "新しい試験が、膀胱癌患者における膀胱内治療後の尿路症状に対するハーブティーの影響を探る。",
      "whatHappened": "この研究は、膀胱癌患者の治療後の尿路症状に対するJING SI HERBAL TEAの影響を評価するために登録されていますが、結果はまだ報告されていません。",
      "whyItMatters": "JING SI HERBAL TEAのようなハーブ療法の調査は、癌患者の症状管理における補助的治療への洞察を提供する可能性があります。",
      "realityCheck": "信頼できる結果はまだ得られておらず、JING SI HERBAL TEAが尿路の問題に与える影響は不確かです。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT05739071",
      "title": "JING SI HERBAL TEA and Urinary Tract Symptoms in Bladder Cancer",
      "publishedAt": "2023-02-22T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "To identify the effects of JING SI HERBAL TEA in the treatment of lower urinary tract symptoms after intravesical therapy in patients with bladder cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ENROLLING_BY_INVITATION; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT05739071",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-02-22",
          "iso": "2023-02-22",
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
        "id": "NCT05739071"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "ENROLLING_BY_INVITATION"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2023-05-06-reflexion-pet-ct-imaging-performance-compared-to-standard-imaging-in-can",
    "slug": "2023-05-06-reflexion-pet-ct-imaging-performance-compared-to-standard-imaging-in-can",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT05844306",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-05-06T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
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
        "outcomes": "Improvement of PET-CT imaging on the RefleXion system",
        "limitations": "Details about specific patient population and outcomes are not provided",
        "resultStatus": "No results available",
        "intervention": "RefleXion Medical Radiotherapy System (RMRS) imaging compared to standard PET-CT imaging"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "RefleXionシステムにおけるPET-CT imagingの改善",
        "limitations": "特定の患者集団と結果に関する詳細は提供されていない",
        "resultStatus": "結果は利用できません",
        "intervention": "RefleXion Medical Radiotherapy System (RMRS) imagingと標準PET-CT imagingの比較"
      }
    },
    "en": {
      "headline": "RefleXion PET/CT Imaging Performance Compared to Standard Imaging in Cancer Patients",
      "dek": "A study evaluates the imaging capabilities of the RefleXion system against standard PET-CT methods.",
      "whatHappened": "The clinical trial investigates how the RefleXion Medical Radiotherapy System (RMRS) imaging compares to standard fludeoxyglucose F-18 PET-CT imaging across various malignancies.",
      "whyItMatters": "Improving PET-CT imaging could enhance the delivery of radiotherapy by facilitating real-time targeting of tumors.",
      "realityCheck": "While the study explores improvements in imaging, no specific outcomes or patient data have been verified yet."
    },
    "ja": {
      "headline": "がん患者におけるRefleXion PET/CT imaging性能の標準画像診断との比較",
      "dek": "RefleXionシステムの画像診断能力が標準PET-CT手法とどのように比較されるかを評価する研究。",
      "whatHappened": "この臨床試験は、さまざまな悪性腫瘍における標準フルデオキシグルコースF-18 PET-CT imagingと比較して、RefleXion Medical Radiotherapy System (RMRS) imagingを調査します。",
      "whyItMatters": "PET-CT imagingの改善は、腫瘍をリアルタイムでターゲットにすることが可能になり、放射線療法の実施を向上させる可能性があります。",
      "realityCheck": "この研究は画像診断の改善を探求しているものの、具体的な結果や患者データはまだ確認されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT05844306",
      "title": "RefleXion PET/CT Imaging Performance in Patients With Various Malignancies",
      "publishedAt": "2023-05-06T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This clinical trial examines RefleXion Medical Radiotherapy System (RMRS) imaging to the standard of care (SOC) fludeoxyglucose F-18 (\\[18F\\]-FDG)- positron emission tomography (PET)-computed tomography (CT) imaging in patients with various cancers (malignancies). PET is an established imaging technique that utilizes small amounts of radioactivity attached to very minimal amounts of tracer, in the case of this research, \\[18F\\]-FDG. Because some cancers take up \\[18F\\]-FDG, cancer cells can be seen with PET. CT utilizes x-rays that traverse body from the outside. CT images provide an exact outline of organs and potential inflammatory tissue where it occurs in patient's body. The RefleXion system is designed to facilitate delivery of biology-guided radiotherapy (BgRT). The RMRS uses PET emissions to guide radiotherapy delivery in real-time and has been studied for use with FDG (which is an agent used in standard PET-CT scans that targets glucose). Information gathered from this study may help researchers to improve PET-CT imaging on the RefleXion system. This information will be used in the future to improve planning and delivery of radiotherapy that will target (in real time) the signal released from the \\[18F\\]-FDG-PET-CT tracer. Comparing the imaging from the standard of care \\[18F\\]-FDG-PET-CT with the \\[18F\\]-FDG imaging from RMRS may help improve the quality of the imaging captured and determine if imaging can be done on the RMRS at the same time as planning for radiation therapy, which would reduce the number of scans needed to plan for radiation for cancer.",
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence E",
      "relevanceScore": 85,
      "significanceScore": 40,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in title: aging; field terms in abstract: clinical trial; cancer treatment or therapeutic research in title/abstract (+25); interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT05844306",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-05-06",
          "iso": "2023-05-06",
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
        "id": "NCT05844306"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2023-09-28-new-trial-investigates-adding-durvalumab-to-chemotherapy-for-breast-canc",
    "slug": "2023-09-28-new-trial-investigates-adding-durvalumab-to-chemotherapy-for-breast-canc",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06058377",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-09-28T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
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
        "outcomes": "Preventing cancer recurrence in patients with MP2 stage II-III hormone receptor positive, HER2 negative breast cancer",
        "limitations": "Details on sample size and specific results not available",
        "resultStatus": "No results reported yet",
        "intervention": "Adding durvalumab to usual chemotherapy"
      },
      "ja": {
        "studyDesign": "フェーズIII試験；科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "MP2ステージII-IIIホルモン受容体陽性、HER2陰性乳癌患者における癌再発予防",
        "limitations": "サンプルサイズや具体的な結果に関する詳細は不明",
        "resultStatus": "結果はまだ報告されていない",
        "intervention": "通常の化学療法にdurvalumabを追加する"
      }
    },
    "en": {
      "headline": "New Trial Investigates Adding Durvalumab to Chemotherapy for Breast Cancer",
      "dek": "Researchers are testing whether combining an immunotherapy drug with standard chemotherapy will improve outcomes for patients with certain breast cancer types.",
      "whatHappened": "A phase III trial aims to compare the effectiveness of standard chemotherapy alone against chemotherapy combined with durvalumab in treating patients with hormone receptor positive, HER2 negative breast cancer.",
      "whyItMatters": "This research could potentially lead to new treatment strategies for patients with specific cancer profiles, enhancing the effectiveness of current therapies.",
      "realityCheck": "This study is still recruiting participants and has yet to report any results, leaving the effectiveness of this treatment combination unverified."
    },
    "ja": {
      "headline": "乳癌治療における化学療法の追加治療としてのDurvalumabの研究開始",
      "dek": "研究者たちは、標準化学療法と免疫療法薬の併用が特定の乳癌患者の治療結果を改善するかどうかをテストしています。",
      "whatHappened": "フェーズIII試験が、ホルモン受容体陽性、HER2陰性乳癌患者における通常の化学療法とdurvalumabを併用した治療の効果を比較することを目的としています。",
      "whyItMatters": "この研究は、特定の癌プロファイルを持つ患者に対する新しい治療戦略の可能性を示唆し、現在の治療法の有効性を高めることが期待されます。",
      "realityCheck": "この研究はまだ参加者を募集しており、結果は未報告のため、この治療の効果は確認されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06058377",
      "title": "Adding an Immunotherapy Drug, MEDI4736 (Durvalumab), to the Usual Chemotherapy Treatment (Paclitaxel, Cyclophosphamide, and Doxorubicin) for Stage II-III Breast Cancer",
      "publishedAt": "2023-09-28T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This phase III trial compares the addition of an immunotherapy drug (durvalumab) to usual chemotherapy versus usual chemotherapy alone in treating patients with MammaPrint High 2 Risk (MP2) stage II-III hormone receptor positive, HER2 negative breast cancer. Immunotherapy with monoclonal antibodies, such as durvalumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Chemotherapy drugs, such as paclitaxel, doxorubicin, and cyclophosphamide work in different ways to stop the growth of tumor cells, either by killing the cells, by stopping them from dividing, or by stopping them from spreading. There is some evidence from previous clinical trials that people who have a MammaPrint High 2 Risk result may be more likely to respond to chemotherapy and immunotherapy. Adding durvalumab to usual chemotherapy may be able to prevent the cancer from returning for patients with MP2 stage II-III hormone receptor positive, HER2 negative breast cancer.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 55,
      "significanceScore": 55,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); late-phase registered trial; interventional Phase 3/4 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06058377",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-09-28",
          "iso": "2023-09-28",
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
        "id": "NCT06058377"
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
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2023-11-18-investigating-cryocompression-s-role-in-alleviating-chemo-induced-neurop",
    "slug": "2023-11-18-investigating-cryocompression-s-role-in-alleviating-chemo-induced-neurop",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06139458",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2023-11-18T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Noninferiority design for an interventional trial",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Incidence and degree of chemotherapy-induced peripheral neuropathy, patient tolerability, and satisfaction",
        "limitations": "Details on the study population and sample size are unavailable",
        "resultStatus": "Science news report",
        "intervention": "Cryotherapy wraps plus compression therapy (cryocompression) versus cryotherapy wraps alone"
      },
      "ja": {
        "studyDesign": "非劣性デザインの介入試験",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "化学療法誘発性末梢神経障害の発生率と程度、患者の忍耐性、スタッフの満足度",
        "limitations": "研究対象やサンプルサイズに関する詳細は入手できません",
        "resultStatus": "科学ニュース報道",
        "intervention": "冷凍療法ラップと圧迫療法（クリオ圧迫療法）対冷凍療法ラップ単独"
      }
    },
    "en": {
      "headline": "Investigating Cryocompression's Role in Alleviating Chemo-Induced Neuropathy",
      "dek": "New trial explores the impact of combined cryotherapy and compression on cancer patients.",
      "whatHappened": "Researchers are launching a trial to assess the benefits of cryocompression compared to cryotherapy alone for managing peripheral neuropathy caused by chemotherapy in gynecologic cancer patients.",
      "whyItMatters": "Understanding effective supportive therapies in cancer treatment can enhance patient care and satisfaction.",
      "realityCheck": "This is a trial currently recruiting participants, with results not yet available. The safety and effectiveness of the interventions have not been demonstrated."
    },
    "ja": {
      "headline": "クリオ圧迫療法が化学療法誘発性神経障害の緩和に及ぼす影響を調査",
      "dek": "新しい試験が癌患者における冷凍療法と圧迫療法の効果を探求する。",
      "whatHappened": "研究者たちは、婦人科癌患者において化学療法による末梢神経障害の管理に対する冷凍療法と圧迫療法の効果を評価する試験を開始する。",
      "whyItMatters": "癌治療における有効な支援療法を理解することは、患者ケアと満足度を向上させることに繋がる。",
      "realityCheck": "これは現在参加者を募集している試験であり、結果はまだ得られていません。介入の安全性と効果はまだ確認されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06139458",
      "title": "Cryocompression to Reduce Chemotherapy-induced Peripheral Neuropathy in Gynecologic Cancer - COHORT 2",
      "publishedAt": "2023-11-18T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "The investigators aim to determine the effect of cryotherapy wraps plus compression therapy (henceforth referred to as cryocompression) versus cryotherapy wraps alone on the incidence and degree of chemotherapy-induced peripheral neuropathy in patients with gynecologic cancer using a noninferiority design. The investigators also aim to determine the effect of cryocompression versus cryotherapy on patient tolerability and patient and staff satisfaction.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06139458",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2023-11-18",
          "iso": "2023-11-18",
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
        "id": "NCT06139458"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2024-02-23-study-on-urolithin-a-s-impact-on-insulin-in-older-adults-underway",
    "slug": "2024-02-23-study-on-urolithin-a-s-impact-on-insulin-in-older-adults-underway",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT06274749",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2024-02-23T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Randomized triple-masked controlled clinical trial; Science news report",
        "populationOrModel": "Individuals aged 55 or older with a BMI of 27 or higher",
        "outcomes": "Insulin levels and other hormones involved in glucose regulation",
        "limitations": "No results available yet; limited information on detailed outcomes",
        "resultStatus": "No results available",
        "intervention": "UA gelcaps taken daily, with a placebo control"
      },
      "ja": {
        "studyDesign": "無作為三重盲検対照臨床試験; 科学ニュース報道",
        "populationOrModel": "55歳以上、BMI27以上の個人",
        "outcomes": "血糖調節に関与するインスリンレベルなどのホルモン",
        "limitations": "まだ結果が利用できず、詳細な結果については限られた情報のみ",
        "resultStatus": "結果は利用できず",
        "intervention": "日常的に使用されるUAゲルカプセルとプラセボ対照"
      }
    },
    "en": {
      "headline": "Study on Urolithin A's Impact on Insulin in Older Adults Underway",
      "dek": "A new clinical trial aims to test the effects of Urolithin A supplementation on glucose metabolism in older adults.",
      "whatHappened": "A randomized controlled trial is currently recruiting participants to investigate whether Urolithin A can improve insulin levels and glucose regulation in adults aged 55 and older.",
      "whyItMatters": "Understanding how Urolithin A influences insulin could lead to better management of glucose levels in aging populations, though the implications for diabetes treatment remain unclear.",
      "realityCheck": "While this trial is in progress, no results are yet available, making it vital to avoid assumptions about the effectiveness of Urolithin A for improving health outcomes."
    },
    "ja": {
      "headline": "Urolithin Aのインスリンへの影響に関する研究が進行中",
      "dek": "新しい臨床試験が高齢者におけるUrolithin Aの補充効果をテストすることを目指している。",
      "whatHappened": "無作為対照試験が現在参加者を募集しており、55歳以上の成人におけるUrolithin Aがインスリンレベルと血糖調節に与える影響を調査する。",
      "whyItMatters": "Urolithin Aがインスリンに及ぼす影響を理解することは、高齢者の血糖レベル管理に役立つ可能性があるが、糖尿病治療への影響は不透明である。",
      "realityCheck": "この試験は進行中であり、結果はまだ利用できないため、Urolithin Aが健康結果を改善するという仮定を避けることが重要である。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT06274749",
      "title": "Effects of Urolithin A Supplementation on Glucose Metabolism in Healthy Adults 55 >= Years Old: A Randomized Triple-Masked Controlled Clinical Trial",
      "publishedAt": "2024-02-23T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "Background:\n\nAs people age, the cells in the pancreas that produce insulin begin to release less of this hormone, and levels of blood glucose (sugar) rise. This can lead to illnesses such as diabetes. Urolithin A (UA) is a natural nutritional supplement that may improve how the body controls blood glucose.\n\nObjective:\n\nTo learn if UA improves levels of insulin and other hormones that help control blood glucose.\n\nEligibility:\n\nPeople aged 55 years and older with a body mass index of 27 or higher.\n\nDesign:\n\nParticipants will have 6 clinic visits over 8 weeks.\n\nParticipants will be screened. They will have a physical exam with blood and urine tests and a test of their heart function.\n\nUA gelcaps are taken by mouth every morning at home. Half of participants will take UA. The other half will take a placebo. The placebo looks like the study drug but does not contain any medicine. Participants will not know which they are taking.\n\nParticipants will have tests during the study including:\n\nOral glucose tolerance: Participants will drink a sweet liquid. Blood will be drawn at intervals over the next 3 hours.\n\nContinuous glucose monitor: A sensor with a needle that goes just under the skin will be placed on the upper arm. Participants will wear this sensor throughout the study.\n\nExercise. Participants will walk on a treadmill while their heart rate, hearth rhythm, and blood pressure are monitored. They will walk in a hallway at normal and fast paces.\n\nImaging scans of the thigh; scans of the brain are optional....",
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in title: clinical trial, randomized; interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT06274749",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2024-02-23",
          "iso": "2024-02-23",
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
        "id": "NCT06274749"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2025-06-11-evaluating-sustainable-diet-and-exercise-for-older-women-s-metabolic-hea",
    "slug": "2025-06-11-evaluating-sustainable-diet-and-exercise-for-older-women-s-metabolic-hea",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07015307",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-06-11T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional trial registration; aims to evaluate the impact of sustainable diet and exercise programs.",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Monitoring of body composition, functional capacity, strength, fatigue perception, sleep quality, and emotional well-being.",
        "limitations": "Details on effectiveness and specific outcomes remain unavailable at this stage.",
        "resultStatus": "Science news report",
        "intervention": "Participants assigned to supervised physical training, personalized dietary guidance based on the Mediterranean diet, or both."
      },
      "ja": {
        "studyDesign": "介入試験の登録；持続可能な食事および運動プログラムの影響を評価することを目的としています。",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "体組成、機能的能力、筋力、疲労感、睡眠の質、感情的健康のモニタリング。",
        "limitations": "有効性や具体的な結果に関する詳細は、この段階では利用できません。",
        "resultStatus": "科学ニュース報道",
        "intervention": "参加者は、監視下の身体トレーニング、地中海食に基づく個別の食事指導、またはその両方に割り当てられます。"
      }
    },
    "en": {
      "headline": "Evaluating Sustainable Diet and Exercise for Older Women's Metabolic Health",
      "dek": "A trial seeks to measure the impact of tailored programs on health outcomes.",
      "whatHappened": "A new interventional trial will assess how supervised physical training and dietary guidance affect older women’s metabolic health over several weeks.",
      "whyItMatters": "This initiative explores a holistic approach to improving health conditions among older women, particularly concerning metabolic disorders.",
      "realityCheck": "While the study aims to provide insights into sustainable interventions for older women, results are not yet available, and the overall effectiveness remains uncertain."
    },
    "ja": {
      "headline": "高齢女性の代謝健康のための持続可能な食事と運動プログラムの評価",
      "dek": "プログラムの健康結果に対する影響を測定する試みです。",
      "whatHappened": "新しい介入試験が、監視下の身体トレーニングと食事指導が高齢女性の代謝健康に与える影響を数週間にわたって評価します。",
      "whyItMatters": "この取り組みは、高齢女性の健康状態、特に代謝障害の改善に向けた包括的アプローチを探ります。",
      "realityCheck": "この研究は高齢女性のための持続可能な介入についての洞察を提供することを目指していますが、結果はまだ利用できず、全体的な有効性は不明です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07015307",
      "title": "Sustainable Exercise and Nutrition Programs for Managing Metabolic Disorders in Older Women",
      "publishedAt": "2025-06-11T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This study aims to evaluate the impact of sustainable diet and exercise programs on metabolic health and quality of life in older women. Participants will be assigned to different intervention groups including supervised physical training, personalized dietary guidance based on the Mediterranean dietary pattern, or a combination of both. The programs will be implemented over several weeks, with continuous monitoring of variables such as body composition, functional capacity, strength, fatigue perception, sleep quality, and emotional well-being. The project also includes the development of a digital platform to support remote engagement and long-term health behavior change.",
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in title: aging; no field-specific terms; assigned the generic geroscience bucket; interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=ACTIVE_NOT_RECRUITING; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07015307",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-06-11",
          "iso": "2025-06-11",
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
        "id": "NCT07015307"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "ACTIVE_NOT_RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2025-09-23-exploring-dose-escalated-radiotherapy-for-ewing-sarcoma-the-bear-trial",
    "slug": "2025-09-23-exploring-dose-escalated-radiotherapy-for-ewing-sarcoma-the-bear-trial",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07188532",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-09-23T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "biomarkers-diagnostics",
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
        "outcomes": "Potential improved disease control for patients with large tumors and unfavorable characteristics.",
        "limitations": "Details on specific outcomes and biomarkers related to treatment effectiveness are unavailable.",
        "resultStatus": "Results not posted yet.",
        "intervention": "Biologically-adapted, dose-escalated radiotherapy"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "大きな腫瘍や好ましくない特徴を持つ患者における病気の制御が向上する可能性。",
        "limitations": "治療効果に関連する特定の成果やバイオマーカーに関する詳細は不明。",
        "resultStatus": "結果はまだ公表されていない。",
        "intervention": "生物学的適応を受けた、高用量放射線療法"
      }
    },
    "en": {
      "headline": "Exploring Dose-Escalated Radiotherapy for Ewing Sarcoma: The BEAR Trial",
      "dek": "This trial investigates a targeted radiotherapy approach potentially enhancing outcomes for patients with Ewing sarcoma.",
      "whatHappened": "The BEAR Trial is currently recruiting participants to evaluate the effects of biologically-adapted, dose-escalated radiotherapy on Ewing sarcoma, focusing on dosing based on tumor size and characteristics.",
      "whyItMatters": "This approach may offer insights into personalized treatment strategies in oncology by tailoring radiation therapy to specific tumor profiles.",
      "realityCheck": "While the trial aims for improved disease management, the effectiveness of this radiotherapy approach remains to be established in future results."
    },
    "ja": {
      "headline": "ユーイング肉腫のための高用量放射線療法の探求：BEAR試験",
      "dek": "この試験では、ユーイング肉腫患者の結果を向上させる可能性のある放射線治療アプローチを調査しています。",
      "whatHappened": "BEAR試験は、腫瘍サイズや特徴に基づいた生物学的適応型高用量放射線療法の効果を評価するために参加者を募集中です。",
      "whyItMatters": "このアプローチは、特定の腫瘍特性に基づいて放射線療法を調整することで、オンクロジーにおける個別化治療戦略への洞察を提供する可能性があります。",
      "realityCheck": "試験は病気管理の改善を目指していますが、この放射線療法アプローチの有効性は将来の結果で確立される必要があります。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07188532",
      "title": "Biologically-Adapted, Dose-Escalated Radiotherapy for the Treatment of Ewing Sarcoma, BEAR Trial",
      "publishedAt": "2025-09-23T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This clinical trial evaluates the effect of radiotherapy doses based on tumor size and tumor-specific characteristics (biologically-adapted) in treating patients with Ewing sarcoma. Radiotherapy uses high energy x-rays, particles, or radioactive seeds to kill tumor cells and shrink tumors. Conventional radiotherapy uses minimal imaging support to determine the positioning of radiotherapy. Hypofractionated radiotherapy delivers higher doses of radiotherapy over a shorter period of time and may kill more tumor cells and have fewer side effects. Dose-escalated radiotherapy uses doses that are higher than those used in conventional radiotherapy. Larger tumor sizes and other tumor-specific characteristics have been shown to be related to poorer outcomes. In addition, after dose-escalated radiotherapy, patients with larger tumors have demonstrated improved control of the disease at the primary tumor site. Giving biologically-adapted, dose-escalated radiotherapy may reduce the return of the cancer at the primary tumor site in patients with Ewing sarcoma with large tumors and other unfavorable characteristics. This clinical trial also evaluates the role of biomarkers in patients with Ewing sarcoma. Studying samples of blood and tumor tissue from patients with Ewing sarcoma in the laboratory may help doctors learn more about predicting the amount of disease and the likelihood of the cancer coming back.",
      "fieldId": "biomarkers-diagnostics",
      "evidence": "Evidence E",
      "relevanceScore": 60,
      "significanceScore": 40,
      "reason": "field=biomarkers-diagnostics; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in abstract: biomarker; cancer treatment or therapeutic research in title/abstract (+25); interventional trial; phase not specified in the fetched record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07188532",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-09-23",
          "iso": "2025-09-23",
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
        "id": "NCT07188532"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "INTERVENTIONAL",
        "phases": [
          "NA"
        ],
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2025-09-25-metastatic-lung-cancer-study-explores-body-composition-relation-to-immun",
    "slug": "2025-09-25-metastatic-lung-cancer-study-explores-body-composition-relation-to-immun",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07192926",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2025-09-25T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Retrospective, single-center observational cohort study",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Progression-free survival (PFS) and overall survival (OS) assessed using Cox proportional hazards regression models",
        "limitations": "Details on associations of baseline CTI and CXI are not fully specified and require further study.",
        "resultStatus": "Science news report",
        "intervention": "Immune checkpoint inhibitor (ICI)-based therapy"
      },
      "ja": {
        "studyDesign": "後ろ向き単施設観察コホート研究",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "コックス比例ハザード回帰モデルを使用して評価された無増悪生存期間（PFS）および全生存期間（OS）",
        "limitations": "ベースラインのCTIおよびCXIとの関連性の詳細は完全に特定されておらず、さらなる研究が必要である。",
        "resultStatus": "科学ニュース報道",
        "intervention": "免疫チェックポイント阻害剤（ICI）ベースの治療"
      }
    },
    "en": {
      "headline": "Metastatic Lung Cancer Study Explores Body Composition Relation to Immunotherapy Outcomes",
      "dek": "New findings from a cohort study examine how body composition markers correlate with survival in patients undergoing immune therapy.",
      "whatHappened": "The study evaluated the relationship between inflammatory-metabolic indices and survival rates in patients with metastatic non-small cell lung cancer treated with immune checkpoint inhibitors, focusing on various computed tomography-derived body composition metrics.",
      "whyItMatters": "Understanding the impact of body composition on treatment outcomes could provide insights into personalized care approaches for lung cancer patients.",
      "realityCheck": "This study is observational and does not confirm effective treatment strategies; findings must be validated in further research."
    },
    "ja": {
      "headline": "転移性肺癌研究、免疫療法の成果に対する体組成との関連を探る",
      "dek": "コホート研究からの新たな発見が、免疫療法を受ける患者の生存に体組成マーカーがどのように関連するかを調べる。",
      "whatHappened": "この研究は、免疫チェックポイント阻害剤による治療を受けた転移性非小細胞肺癌患者の生存率と炎症代謝指数との関係を調査し、各種のCT由来の体組成指標に焦点を当てました。",
      "whyItMatters": "体組成が治療結果に与える影響を理解することは、肺癌患者への個別化医療アプローチについての洞察を提供する可能性があります。",
      "realityCheck": "この研究は観察的であり、効果的な治療戦略を確認するものではなく、結果はさらなる研究で検証される必要があります。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07192926",
      "title": "Body Composition and Inflammatory-Metabolic Indices in Immunotherapy-Treated Metastatic Non-Small Cell Lung Cancer: The SARC-CTI Study",
      "publishedAt": "2025-09-25T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This retrospective, single-center observational cohort study evaluates inflammatory-metabolic, cachexia-related, and computed tomography (CT)-derived body-composition markers in patients with metastatic non-small cell lung cancer (mNSCLC) treated with immune checkpoint inhibitor (ICI)-based therapy.\n\nThe study includes 155 consecutive adult patients who initiated ICI-based therapy at Ankara Etlik City Hospital between December 2022 and March 2025. Baseline assessments include the C-reactive protein-triglyceride glucose index (CTI), cachexia index (CXI), CT-derived skeletal muscle index (SMI), skeletal muscle attenuation, sarcopenia status, body weight, and clinical characteristics.\n\nThe principal survival outcomes are progression-free survival (PFS) and overall survival (OS). Associations of baseline CTI and CXI with PFS and OS are evaluated using Cox proportional hazards regression models. The incremental prognostic performance of CTI and CXI beyond conventional clinical factors is further explored using discrimination, calibration, and decision-curve analyses.\n\nEarly longitudinal changes in CT-derived body composition and body weight are evaluated in a landmark cohort of 140 patients with an eligible follow-up CT performed 8-12 weeks after ICI initiation. Associations of early skeletal muscle and body-weight changes with subsequent PFS and OS are assessed using landmark survival analyses.\n\nThe survival data cutoff is June 11, 2026.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 36,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus=COMPLETED; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07192926",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2025-09-25",
          "iso": "2025-09-25",
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
        "id": "NCT07192926"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "COMPLETED"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-02-17-exploring-nk-cell-therapy-for-colorectal-cancer-spread-the-chip-crc-tria",
    "slug": "2026-02-17-exploring-nk-cell-therapy-for-colorectal-cancer-spread-the-chip-crc-tria",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07411599",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-02-17T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Interventional trial registration; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Determination of the highest safe dose of NK cells for administration",
        "limitations": "No verified study population or results outlined",
        "resultStatus": "No results available for this trial registration",
        "intervention": "Combination of NK cells administered intravenously and intraperitoneally with cetuximab",
        "trialPhase": "Phase 1/2"
      },
      "ja": {
        "studyDesign": "介入試験登録; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "NK細胞の投与における最高安全用量の決定",
        "limitations": "検証された研究対象や結果は示されていない",
        "resultStatus": "この試験登録に対する結果は利用可能ではない",
        "intervention": "セツキシマブと併用した静脈内および腹腔内投与のNK細胞",
        "trialPhase": "第1/2相"
      }
    },
    "en": {
      "headline": "Exploring NK Cell Therapy for Colorectal Cancer Spread: The Chip-CRC Trial",
      "dek": "The Chip-CRC trial aims to identify the optimal use of NK cells with cetuximab for colorectal cancer that has spread to the peritoneum.",
      "whatHappened": "Researchers are investigating a combination therapy using NK cells and cetuximab for patients with colorectal cancer-related peritoneal carcinomatosis.",
      "whyItMatters": "This trial may provide insight into the safe dosage of NK cell therapy, which could contribute to future cancer treatment strategies.",
      "realityCheck": "Currently, there are no results available, and the effectiveness and safety of this combination therapy remain unverified."
    },
    "ja": {
      "headline": "大腸癌転移に対するNK細胞治療の探求: Chip-CRC試験",
      "dek": "Chip-CRC試験は、腹膜に転移した大腸癌患者に対してセツキシマブとのNK細胞の最適使用を特定することを目指しています。",
      "whatHappened": "研究者たちは、大腸癌に関連する腹膜癌症に対してNK細胞とセツキシマブを併用する治療法を調査しています。",
      "whyItMatters": "この試験は、NK細胞治療の安全な用量に関する洞察を提供する可能性があり、将来の癌治療戦略に寄与することが期待されます。",
      "realityCheck": "現時点では結果は出ておらず、この併用療法の有効性と安全性は検証されていません。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07411599",
      "title": "Dual Administration Of Intraperitoneal And Intravenous TROP2-Directed CAR-NK With TGF-Beta Receptor 2 (TGFBR2) Knock Out (KO) Therapy For Colorectal Cancer-Related Peritoneal Carcinomatosis: A Phase 1/2 Trial (\"Chip-CRC Trial\")",
      "publishedAt": "2026-02-17T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "To find the highest dose of NK cells that can be given by vein and intraperitoneally (given directly into the abdominal cavity) in combination with cetuximab to patients with colorectal cancer that has spread to the peritoneum.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 48,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07411599",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-02-17",
          "iso": "2026-02-17",
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
        "id": "NCT07411599"
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
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-04-23-ruxolitinib-and-azacitidine-a-new-approach-for-aml-patients-post-transpl",
    "slug": "2026-04-23-ruxolitinib-and-azacitidine-a-new-approach-for-aml-patients-post-transpl",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07548983",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-04-23T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "rejuvenation-regeneration",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Phase I trial; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "To assess the side effects, best dose, safety, tolerability, and effectiveness in treating AML patients undergoing alloHSCT",
        "limitations": "Details on specific outcomes and results are unavailable as this is a trial registry entry.",
        "resultStatus": "No results posted",
        "intervention": "Ruxolitinib monotherapy followed by Rux plus azacitidine maintenance therapy"
      },
      "ja": {
        "studyDesign": "第I相試験; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "alloHSCTを受けるAML患者における副作用、最適用量、安全性、忍容性、有効性を評価すること",
        "limitations": "具体的な結果や成果に関する詳細は不明であり、これは試験登録情報です。",
        "resultStatus": "結果は提示されていない",
        "intervention": "Ruxolitinib単独療法からRuxとazacitidine維持療法を併用"
      }
    },
    "en": {
      "headline": "Ruxolitinib and Azacitidine: A New Approach for AML Patients Post-Transplant",
      "dek": "A phase I trial explores a novel therapy for acute myeloid leukemia patients undergoing stem cell transplantation.",
      "whatHappened": "This trial investigates the effects of ruxolitinib followed by maintenance therapy with azacitidine in AML patients post-allogeneic stem cell transplantation.",
      "whyItMatters": "Finding effective post-transplant treatments for AML is critical, given the high risk of complications like graft-versus-host disease.",
      "realityCheck": "This research has not yet provided results, emphasizing the need for caution when interpreting preliminary findings."
    },
    "ja": {
      "headline": "RuxolitinibとAzacitidine：移植後のAML患者への新しいアプローチ",
      "dek": "第I相試験が急性骨髄性白血病患者の幹細胞移植後の新しい治療法を探る。",
      "whatHappened": "この試験では、Ruxolitinibとその後のazacitidine維持療法が、合併症リスクの高いAML患者に与える影響を調査しています。",
      "whyItMatters": "AMLの移植後治療としての有効な選択肢を見つけることは、細胞移植後の合併症リスクを考えると重要です。",
      "realityCheck": "この研究は結果をまだ提供しておらず、初期の結果を解釈する際には注意が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07548983",
      "title": "Ruxolitinib With Azacitidine Maintenance for the Treatment of Patients With Acute Myeloid Leukemia Undergoing Reduced Intensity Allogeneic Stem Cell Transplantation",
      "publishedAt": "2026-04-23T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This phase I trial studies the side effects and best dose of ruxolitinib (Rux) therapy alone (monotherapy) followed by Rux plus azacitidine (AZA) maintenance therapy and to see how well it works in treating patients with acute myeloid leukemia (AML) who are undergoing reduced intensity allogeneic hematopoietic stem cell transplantation (alloHSCT). AlloHSCT provides the only chance for cure for many patients with AML. AlloHSCT is a procedure in which a person receives blood-forming stem cells (cells from which all blood cells develop) from a genetically similar, but not identical, donor. This is often a sister or brother, but could be an unrelated donor. One of the common reasons for death after an alloHSCT is graft versus host disease (GVHD), which occurs when the transplanted cells from the donor attacks the recipient's normal cells. Ruxolitinib is in a class of medications called kinase inhibitors. It works to treat GVHD by blocking the signals of the cells that cause GVHD. Azacitidine is in a class of medications called demethylation agents. It works by helping the bone marrow to produce normal blood cells and by killing abnormal cells in the bone marrow. Giving Rux after the transplant may stop GVHD from occurring. Maintenance therapy with AZA, may help prevent or delay cancer from coming back. Giving Rux monotherapy followed by Rux plus AZA maintenance therapy may be safe, tolerable, and/or effective in treating patients with AML who are undergoing alloHSCT.",
      "fieldId": "rejuvenation-regeneration",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 42,
      "reason": "field=rejuvenation-regeneration; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: stem cell; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 1 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07548983",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-04-23",
          "iso": "2026-04-23",
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
        "id": "NCT07548983"
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
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-07-15-dce-mri-makes-strides-in-assessing-treatment-for-pancreatic-cancer",
    "slug": "2026-07-15-dce-mri-makes-strides-in-assessing-treatment-for-pancreatic-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07705919",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-07-15T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
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
        "outcomes": "Assessment of treatment response for borderline resectable pancreatic cancer",
        "limitations": "Details on the effectiveness of DCE-MRI are unavailable.",
        "resultStatus": "No results posted.",
        "intervention": "DCE-MRI with standard clinical evaluation"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "境界切除可能な膵臓癌における治療反応の評価",
        "limitations": "DCE-MRIの有効性に関する詳細は不明です。",
        "resultStatus": "結果は未投稿。",
        "intervention": "標準臨床評価とともに行われるDCE-MRI"
      }
    },
    "en": {
      "headline": "DCE-MRI Makes Strides in Assessing Treatment for Pancreatic Cancer",
      "dek": "Dynamic contrast enhanced MRI aims to improve treatment response evaluation for patients with borderline resectable pancreatic cancer.",
      "whatHappened": "A new clinical trial is testing how effective dynamic contrast enhanced magnetic resonance imaging (DCE-MRI) is for assessing the treatment response of patients with borderline resectable pancreatic cancer.",
      "whyItMatters": "DCE-MRI could lead to better treatment evaluations, potentially improving the management of patients whose cancer is still operable with the right pre-surgical treatment.",
      "realityCheck": "It's crucial to note that the study is still in the recruiting phase, and results have not been posted yet, meaning claims about effectiveness remain unverified."
    },
    "ja": {
      "headline": "膵臓癌の治療評価におけるDCE-MRIの進展",
      "dek": "動的コントラスト強調MRIが境界切除可能な膵臓癌患者に対する治療反応評価の改善を目指しています。",
      "whatHappened": "新しい臨床試験が、境界切除可能な膵臓癌患者の治療反応を評価するための動的コントラスト強調磁気共鳴イメージング（DCE-MRI）の効果をテストしています。",
      "whyItMatters": "DCE-MRIは治療評価を改善する可能性があり、適切な手術前治療が行われる患者の管理に貢献できるかもしれません。",
      "realityCheck": "この研究はまだ参加者を募集中であり、結果は未投稿のため、有効性に関する主張は未検証であることに注意が必要です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07705919",
      "title": "DCE-MRI for Neoadjuvant Treatment Assessment in Patients With Borderline Resectable Pancreatic Cancer",
      "publishedAt": "2026-07-15T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This clinical trial tests how well dynamic contrast enhanced magnetic resonance imaging (DCE-MRI) with standard clinical evaluation works to assess treatment response for patients with pancreatic cancer that may be able to be removed by surgery (borderline resectable). Borderline resectable pancreatic cancer (BRPC) is a certain type of pancreatic cancer that involves the arteries or veins near the pancreas. With the right treatment before surgery, it can be removed (resected) successfully. An MRI (magnetic resonance imaging) scan creates clear images of the structures inside the body using a large magnet, radio waves, and a computer. DCE-MRI can be used to calculate the blood perfusion. Blood perfusion can show disease status. Using DCE-MRI as part of standard clinical evaluation may provide a more accurate treatment response assessment for patients with BRPC.",
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence E",
      "relevanceScore": 60,
      "significanceScore": 48,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; aging/longevity terms in abstract: aging; field terms in abstract: clinical trial; cancer treatment or therapeutic research in title/abstract (+25); interventional Phase 2 from the registry snapshot; LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition; OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07705919",
      "dateFields": {
        "studyFirstPostDate": {
          "raw": "2026-07-15",
          "iso": "2026-07-15",
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
        "id": "NCT07705919"
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
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-10-05-study-on-radiotherapy-techniques-in-advanced-esophageal-cancer",
    "slug": "2026-10-05-study-on-radiotherapy-techniques-in-advanced-esophageal-cancer",
    "sourceUrl": "https://clinicaltrials.gov/study/NCT07858630",
    "sourceLabel": "ClinicalTrials.gov",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence E",
    "studySubjects": [
      "living-people"
    ],
    "contentType": "trial-registration",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Prospective observational cohort study; Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Locoregional tumor control, recurrence patterns, survival, treatment-related toxicity, lymphocyte reduction, completion of immunotherapy",
        "limitations": "Participants receive treatment based on routine clinical practice, not a controlled trial",
        "resultStatus": "No results published",
        "intervention": "Not assigned to specific radiotherapy strategy; treatment according to routine clinical practice"
      },
      "ja": {
        "studyDesign": "前向き観察コホート研究; 科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "局所腫瘍コントロール、再発パターン、生存率、治療関連の毒性、リンパ球減少、免疫療法の完了",
        "limitations": "参加者はコントロール試験ではなく、日常の臨床実践に基づいて治療を受ける",
        "resultStatus": "結果は未発表",
        "intervention": "特定の放射線治療戦略には割り当てられない; 日常の臨床実践に基づいた治療"
      }
    },
    "en": {
      "headline": "Study on Radiotherapy Techniques in Advanced Esophageal Cancer",
      "dek": "Research aims to evaluate radiotherapy strategies in conjunction with immunotherapy for esophageal cancer.",
      "whatHappened": "This observational study plans to assess various radiotherapy target volume delineation patterns in patients undergoing treatment.",
      "whyItMatters": "The findings may lead to improved treatment approaches that effectively control tumors while minimizing radiation exposure.",
      "realityCheck": "Current results are not available, and the study is still in the recruitment phase."
    },
    "ja": {
      "headline": "進行食道癌における放射線治療技術の研究",
      "dek": "研究は、食道癌の免疫療法と併せた放射線治療戦略を評価することを目指しています。",
      "whatHappened": "この観察研究は、治療を受ける患者におけるさまざまな放射線治療ターゲットボリュームの定義パターンを評価する予定です。",
      "whyItMatters": "この調査結果は、腫瘍を効果的にコントロールしつつ、放射線被ばくを最小限に抑える治療アプローチの改善につながる可能性があります。",
      "realityCheck": "現在の結果は利用できず、研究はまだ募集段階です。"
    },
    "sourceCheck": {
      "sourceId": "clinicaltrials",
      "sourceUrl": "https://clinicaltrials.gov/study/NCT07858630",
      "title": "Radiotherapy Target Volume Delineation in Locally Advanced Esophageal Cancer in the Immunotherapy Era",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "abstract": "This prospective observational cohort study will evaluate different radiotherapy target volume delineation patterns in patients with locally advanced esophageal squamous cell carcinoma receiving radiotherapy combined with immunotherapy.\n\nIn routine clinical practice, physicians may use different margins around the primary tumor and different approaches to regional lymph node irradiation. The study will not assign participants to a specific radiotherapy strategy. Instead, participants will receive treatment according to routine clinical practice, and the actual radiotherapy plans will be recorded and analyzed.\n\nThe study will compare locoregional tumor control, recurrence patterns, survival, treatment-related toxicity, lymphocyte reduction, and completion of immunotherapy among patients receiving different target volume strategies. The main objective is to evaluate 2-year locoregional recurrence-free survival and to identify radiotherapy approaches that may achieve effective tumor control while reducing unnecessary radiation exposure and treatment-related toxicity.",
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence E",
      "relevanceScore": 50,
      "significanceScore": 45,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence E; trial registration or update only; not evidence that an intervention works in humans; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); observational registry record; StudyFirstPostDate is inside the lookback window (new public registration); OverallStatus is RECRUITING on a record first posted in-window; significance here is trial-activity triage, not evidence of human efficacy; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "NCT07858630",
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
        "id": "NCT07858630"
      },
      "studySubjects": [
        "living-people"
      ],
      "hints": {
        "studyType": "OBSERVATIONAL",
        "hasResults": false,
        "overallStatus": "RECRUITING"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-10-05-study-highlights-neuroprotection-of-black-rice-wine-in-aging-mice",
    "slug": "2026-10-05-study-highlights-neuroprotection-of-black-rice-wine-in-aging-mice",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42758096/",
    "sourceLabel": "PubMed",
    "doi": "10.1039/d6fo02522f",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
    "evidence": "Evidence D",
    "studySubjects": [
      "mice"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "BRW improved cognitive performance, ameliorated gut dysbiosis, reduced systemic LPS, and preserved hippocampal neurons.",
        "limitations": "Details about sample size and study population are unavailable.",
        "resultStatus": "Findings demonstrate that BRW provides neuroprotection via microbiota-gut-brain axis modulation.",
        "intervention": "Black rice wine (BRW) compared with vitamin C (VC), aleurone-removed BRW (AR-BRW), and 12% ethanol"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "BRWは認知機能を改善し、腸内のディスバイオシスを軽減し、全身のLPSを減少させ、海馬ニューロンを保護した。",
        "limitations": "サンプルサイズや研究対象に関する詳細は利用できない。",
        "resultStatus": "BRWが腸-脳軸を介した神経保護を提供することを示す結果。",
        "intervention": "黒米ワイン（BRW）をビタミンC（VC）、アレウローヌを除去したBRW（AR-BRW）、および12%エタノールと比較"
      }
    },
    "en": {
      "headline": "Study Highlights Neuroprotection of Black Rice Wine in Aging Mice",
      "dek": "Black rice wine may modulate the microbiota-gut-brain axis, potentially mitigating cognitive decline.",
      "whatHappened": "Research indicates that black rice wine, through its unique chemical profile, improved cognitive function in a mouse model of aging, contrasting with other interventions.",
      "whyItMatters": "Understanding how dietary components like black rice wine influence cognitive health could inform future nutritional strategies in aging populations.",
      "realityCheck": "This study is based on a mouse model and does not imply any direct effects on human cognitive decline or a ready treatment."
    },
    "ja": {
      "headline": "黒米ワインの老化マウスにおける神経保護作用を示す研究",
      "dek": "黒米ワインは腸-脳軸を調整し、認知機能の低下を緩和する可能性がある。",
      "whatHappened": "研究によると、黒米ワインは独自の化学特性により老化マウスモデルで認知機能を改善したとされている。",
      "whyItMatters": "黒米ワインのような食事成分が認知の健康に与える影響を理解することは、高齢者の栄養戦略に情報を提供する可能性がある。",
      "realityCheck": "この研究はマウスモデルに基づいており、人間の認知機能の低下に対する直接的な効果や治療法を示唆するものではない。"
    },
    "sourceCheck": {
      "sourceId": "pubmed",
      "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42758096/",
      "title": "Black rice wine attenuates cognitive decline via modulation of the microbiota-gut-brain axis in D-galactose-induced aging mice",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "doi": "10.1039/d6fo02522f",
      "abstract": "Gut microbiota dysbiosis contributes to cognitive decline and is modifiable through dietary interventions. Black rice wine (BRW), a traditional Chinese fermented alcoholic beverage enriched with phenolics and containing ethanol, raises the question of whether its complex matrix confers neuroprotection. To address this, we investigated the effect of BRW on cognitive decline and microbiota-gut-brain axis (MGBA) mechanisms in a D-galactose-induced aging mouse model, using vitamin C (VC), aleurone-removed BRW (AR-BRW), and 12% ethanol as comparator groups. Metabolomic profiling revealed distinct flavonoid enrichment in BRW compared with AR-BRW. Following a 10-week treatment, BRW ameliorated gut dysbiosis, including suppression of lipopolysaccharide (LPS)-associated Desulfovibrio enrichment of acetate-producing Blautia , leading to increased SCFAs and reduced systemic LPS, which in turn restored intestinal barrier integrity. Notably, BRW preferentially enriched known flavonoid-metabolizing taxa, including Eubacterium_oxidoreducens_group and Lachnospiraceae_UCG-010 , compared with AR-BRW. Concurrently, BRW attenuated microglial activation and astrocytic reactivity, preserved hippocampal neurons, and improved cognitive performance. Hierarchical clustering revealed a marked separation. For behavioral parameters, BRW and VC clustered with the control group, whereas AR-BRW and ethanol aligned with the D-galactose model. Importantly, for microbiota-metabolite-barrier indices, only BRW retained this alignment with the control group. In contrast, despite its behavioral efficacy, VC aligned with AR-BRW, whereas ethanol remained associated with the D-galactose model. Collectively, BRW exerted ethanol-independent neuroprotection superior to that of AR-BRW via an MGBA mechanism distinct from that of VC. This effect can be attributed to its unique phytochemical profile, highlighting its potential as a dietary strategy to attenuate age-related cognitive decline by targeting the MGBA.",
      "authors": [
        "Tan S",
        "Peng B"
      ],
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence D",
      "relevanceScore": 50,
      "significanceScore": 31,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence D; study subjects recorded: mice; animal experiment (mice, mouse); mentions of human relevance do not upgrade this; aging/longevity terms in title: aging; no field-specific terms; assigned the generic geroscience bucket; base 20; not set from Evidence letter; title focuses on aging biology, senescence, or an aging clock (+6); text reports a control comparison (+5); no effect size, novelty, or causality is inferred beyond the wording above; significance is triage of reported content, not a calibrated scientific index; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "42758096",
      "dateFields": {
        "publicationDate": {
          "raw": "2026 Oct 5",
          "iso": "2026-10-05",
          "precision": "day"
        },
        "entrezDate": {
          "raw": "2026/09/18 10:43",
          "iso": "2026-09-18T10:43:00Z",
          "precision": "datetime"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "publicationDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the PubMed adapter from PMID using the current PubMed record URL (pubmed.ncbi.nlm.nih.gov). NCBI E-utilities documents the PubMed web interface at pubmed.ncbi.nlm.nih.gov; NCBI Web Link Help also documents https://www.ncbi.nlm.nih.gov/pubmed/{pmid} as an equivalent record link.",
        "id": "42758096"
      },
      "studySubjects": [
        "mice"
      ],
      "hints": {
        "pubTypes": [
          "Journal Article"
        ],
        "journal": "Food & function"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-10-05-oncolytic-virus-enhances-t-cell-response-in-breast-cancer-model",
    "slug": "2026-10-05-oncolytic-virus-enhances-t-cell-response-in-breast-cancer-model",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42830336/",
    "sourceLabel": "PubMed",
    "doi": "10.1186/s43556-026-00570-w",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence D",
    "studySubjects": [
      "mice"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Enhanced T-cell responses, tumor growth delay, improved survival in tumor-bearing mice.",
        "limitations": "Details on specific sample sizes or statistical analysis methods were not provided.",
        "resultStatus": "Preliminary findings suggest potential for TNBC immunotherapy.",
        "intervention": "rAd.DCN.CD40L oncolytic adenovirus"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "T細胞応答の強化、腫瘍成長の遅延、腫瘍を有するマウスにおける生存率の改善。",
        "limitations": "特定のサンプルサイズや統計分析手法に関する詳細は提供されていなかった。",
        "resultStatus": "TNBC免疫療法の可能性を示唆する予備的な結果。",
        "intervention": "rAd.DCN.CD40L腫瘍溶菌ウイルス"
      }
    },
    "en": {
      "headline": "Oncolytic Virus Enhances T-Cell Response in Breast Cancer Model",
      "dek": "New findings reveal a combination of decorin and CD40 ligand in an oncolytic adenovirus boosts immune activation against aggressive breast cancer.",
      "whatHappened": "The study explored the efficacy of rAd.DCN.CD40L, an oncolytic adenovirus co-delivering decorin and CD40 ligand, in enhancing antitumor activity against triple-negative breast cancer (TNBC).",
      "whyItMatters": "This research highlights the potential of combinatorial immunotherapy strategies in addressing the aggressive nature of TNBC and activating T-cell responses for improved cancer treatment.",
      "realityCheck": "The exact mechanisms behind the observed phenomena are not yet completely understood, and further research is needed to confirm the findings in clinical settings."
    },
    "ja": {
      "headline": "腫瘍溶菌ウイルスが乳がんモデルにおけるT細胞応答を強化",
      "dek": "新たな発見は、腫瘍溶菌ウイルスにデコリンおよびCD40リガンドを組み合わせることで、攻撃的な乳がんに対する免疫活性化を促すことを示唆している。",
      "whatHappened": "この研究では、デコリンとCD40リガンドを共配信する腫瘍溶菌ウイルスrAd.DCN.CD40Lが、三重陰性乳がん（TNBC）に対する抗腫瘍活性を高める効果を検証した。",
      "whyItMatters": "この研究は、TNBCの攻撃的な性質に対処し、T細胞応答を活性化するための併用免疫療法戦略の可能性を強調している。",
      "realityCheck": "観察された現象の背後にある正確なメカニズムはまだ完全には理解されておらず、臨床的状況で結果を確認するためのさらなる研究が必要です。"
    },
    "sourceCheck": {
      "sourceId": "pubmed",
      "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42830336/",
      "title": "Oncolytic virus encoding decorin and the CD40 ligand boosts T-cell response and achieves a durable antitumor response during breast cancer treatment",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "doi": "10.1186/s43556-026-00570-w",
      "abstract": "Triple-negative breast cancer (TNBC) remains an aggressive disease with limited treatment options. Oncolytic adenoviruses represent a promising platform, but their efficacy as single agents is often insufficient. This study examined whether an oncolytic adenovirus co-delivering decorin (DCN) and CD40 ligand (CD40L), designated rAd.DCN.CD40L, could enhance antitumor activity and immune activation against TNBC. Recombinant adenoviruses expressing DCN (rAd.DCN), CD40L (rAd.CD40L), or both proteins were constructed and evaluated in breast cancer cells using cell viability, apoptosis, migration, invasion, and damage-associated molecular pattern (DAMP) release assays. Compared with rAd.DCN or rAd.CD40L alone, rAd.DCN.CD40L triggered greater apoptosis and tumor cell death and elicited more pronounced DAMP release. Co-culture experiments also revealed enhanced dendritic cell function following rAd.DCN.CD40L treatment. For in vivo evaluation, syngeneic 4T1 and EMT-6 subcutaneous tumor models and a 4T1 lung metastasis model were employed. rAd.DCN.CD40L substantially delayed tumor growth and improved survival in tumor-bearing mice. Flow cytometric and histological analyses further confirmed enhanced local and systemic T-cell responses, elevated CD8⁺ T-cell activity, and modulated inflammatory macrophage phenotypes. Mechanistically, western blot analysis showed that rAd.DCN.CD40L may contribute to extracellular matrix remodeling and the down-regulation of the expression of epithelial-mesenchymal transition (EMT)-associated genes. Notably, CD8⁺ T-cell depletion markedly attenuated the therapeutic efficacy of rAd.DCN.CD40L, demonstrating that CD8⁺ T cells are critical functional effectors of tumor control. Collectively, these findings indicate that a DCN- and CD40L-armed oncolytic adenovirus represents a promising combinatorial strategy for TNBC immunotherapy, and warrants further preclinical and clinical investigation.",
      "authors": [
        "Ning Y",
        "Rong Y",
        "Meng H",
        "Lin Y",
        "Chen W",
        "Shi Q",
        "Zhang S",
        "Li H",
        "Yang Y"
      ],
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence D",
      "relevanceScore": 50,
      "significanceScore": 37,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence D; study subjects recorded: mice; animal experiment (mice); mentions of human relevance do not upgrade this; field terms in title: cancer; cancer treatment or therapeutic research in title/abstract (+25); base 20; not set from Evidence letter; cell survival or viability is not scored as organism lifespan; reported a cancer outcome, not an organism lifespan change (+12); text reports a control comparison (+5); no effect size, novelty, or causality is inferred beyond the wording above; significance is triage of reported content, not a calibrated scientific index; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "42830336",
      "dateFields": {
        "publicationDate": {
          "raw": "2026 Oct 5",
          "iso": "2026-10-05",
          "precision": "day"
        },
        "entrezDate": {
          "raw": "2026/10/04 23:51",
          "iso": "2026-10-04T23:51:00Z",
          "precision": "datetime"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "publicationDate",
          "entrezDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the PubMed adapter from PMID using the current PubMed record URL (pubmed.ncbi.nlm.nih.gov). NCBI E-utilities documents the PubMed web interface at pubmed.ncbi.nlm.nih.gov; NCBI Web Link Help also documents https://www.ncbi.nlm.nih.gov/pubmed/{pmid} as an equivalent record link.",
        "id": "42830336"
      },
      "studySubjects": [
        "mice"
      ],
      "hints": {
        "pubTypes": [
          "Journal Article"
        ],
        "journal": "Molecular biomedicine"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-10-05-unexpected-discoveries-in-induced-treg-cell-generation-and-functionality",
    "slug": "2026-10-05-unexpected-discoveries-in-induced-treg-cell-generation-and-functionality",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42831457/",
    "sourceLabel": "PubMed",
    "doi": "10.1002/2211-5463.70349",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "immune-engineering-cancer-control",
    "evidence": "Evidence D",
    "studySubjects": [
      "cells-tissues-organoids"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Age-related differences in the generation of induced Treg cells were investigated; no differences were found in Foxp3 + CD4 + cells between age groups. The cytokine TGF-β did not influence Foxp3 expression levels or suppressive activity.",
        "limitations": "The low frequency of Treg cells in human peripheral blood limits extensive study.",
        "resultStatus": "Preliminary findings suggest that Foxp3 alone does not define bona fide iTreg cells."
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "誘導型Treg細胞の生成における年齢に関連する差異を調査したが、年齢群間でFoxp3 + CD4 +細胞に差異は見られなかった。サイトカインTGF-βがFoxp3の発現レベルや抑制活性に影響を及ぼさなかったことが驚きである。",
        "limitations": "ヒト末梢血中のTreg細胞の低頻度が、広範な研究を制限している。",
        "resultStatus": "初期の発見は、Foxp3単独では真正なiTreg細胞を定義しない可能性を示唆している。"
      }
    },
    "en": {
      "headline": "Unexpected Discoveries in Induced Treg Cell Generation and Functionality",
      "dek": "Recent investigations reveal surprising findings about Treg cell characteristics in different age groups.",
      "whatHappened": "Research into the generation of induced regulatory T cells (iTreg) has highlighted that age does not influence the production of these immune cells as previously thought. Factors expected to play a role, such as TGF-β, showed no impact on the resulting cell characteristics.",
      "whyItMatters": "Understanding the behavior and characteristics of Treg cells is crucial for immune system research and potential therapies. The surprising lack of age-related differences could reshape how these cells are understood in the context of immune aging.",
      "realityCheck": "Despite the findings, significant gaps remain in understanding how Treg cells function in older individuals, as well as the implications for human health and disease."
    },
    "ja": {
      "headline": "誘導型Treg細胞生成の予期せぬ発見",
      "dek": "最近の調査は、異なる年齢層におけるTreg細胞の特徴について驚くべき結果を明らかにした。",
      "whatHappened": "誘導型制御T細胞 (iTreg) の生成に関する研究は、年齢がこれらの免疫細胞の産生に影響を与えないことを強調している。TGF-βなど、予想される要因は結果として得られる細胞の特性に影響を与えなかった。",
      "whyItMatters": "Treg細胞の行動と特性を理解することは、免疫系研究や潜在的な治療法にとって重要である。年齢関連の差異がないことの驚きは、これらの細胞が免疫老化の文脈でどのように理解されるかを再考させるかもしれない。",
      "realityCheck": "発見にもかかわらず、高齢者におけるTreg細胞の機能や人間の健康および疾患における影響に関する理解には依然として重要なギャップが残っている。"
    },
    "sourceCheck": {
      "sourceId": "pubmed",
      "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42831457/",
      "title": "In vitro generation of regulatory T cells: A challenging tool for studying immune aging in humans",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "doi": "10.1002/2211-5463.70349",
      "abstract": "Regulatory T (Treg) cells play a key role in immune tolerance and homeostasis. They prevent exaggerated immune responses, autoimmunity, and are crucial in graft-versus-host responses. On the other hand, their presence in many tumors is associated with a poor prognosis. In aged individuals, Treg populations are modified with a strong bias toward an effector phenotype and a reduced number of naïve Treg cells, but little is known about the functionality of human Treg cells in old age. The low frequency of Treg cells in human peripheral blood is the main limitation to studying them. Therefore, the development of induced Treg (iTreg) cells has become a valuable tool for in vitro research on peripheral Treg cells. Following a gold-standard protocol to generate iTreg in vitro, we aimed to investigate age-related differences in the generation of iTreg cells. However, we detected some unexpected results regarding Foxp3 induction and iTreg functionality. We found no differences in Foxp3 + CD4 + generated cells between young and older individuals. Surprisingly, the presence of the cytokine TGF-β did not play a role in either Foxp3 expression levels or in the suppressive activity of the resulting cells, regardless of the age of the donors. Therefore, we hypothesize that Foxp3 alone does not adequately define bona fide iTreg cells, and the presence of TGF-β is not essential for the in vitro differentiation of human conventional CD4 + T cells into suppressive Foxp3 + cells.",
      "authors": [
        "Muller L",
        "Bleher J",
        "Weinberger B",
        "Rocamora-Reverte L"
      ],
      "fieldId": "immune-engineering-cancer-control",
      "evidence": "Evidence D",
      "relevanceScore": 75,
      "significanceScore": 31,
      "reason": "field=immune-engineering-cancer-control; evidence=Evidence D; study subjects recorded: cells-tissues-organoids; cell, tissue, in-vitro, or organoid experiment (in vitro); human-derived material is not a study in living people; aging/longevity terms in title: aging; field terms in title: immune; base 20; not set from Evidence letter; title focuses on aging biology, senescence, or an aging clock (+6); text reports a control comparison (+5); no effect size, novelty, or causality is inferred beyond the wording above; significance is triage of reported content, not a calibrated scientific index; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "42831457",
      "dateFields": {
        "publicationDate": {
          "raw": "2026 Oct 5",
          "iso": "2026-10-05",
          "precision": "day"
        },
        "entrezDate": {
          "raw": "2026/10/05 06:53",
          "iso": "2026-10-05T06:53:00Z",
          "precision": "datetime"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "publicationDate",
          "entrezDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the PubMed adapter from PMID using the current PubMed record URL (pubmed.ncbi.nlm.nih.gov). NCBI E-utilities documents the PubMed web interface at pubmed.ncbi.nlm.nih.gov; NCBI Web Link Help also documents https://www.ncbi.nlm.nih.gov/pubmed/{pmid} as an equivalent record link.",
        "id": "42831457"
      },
      "studySubjects": [
        "cells-tissues-organoids"
      ],
      "hints": {
        "pubTypes": [
          "Journal Article"
        ],
        "journal": "FEBS open bio"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
  },
  {
    "id": "2026-10-05-unraveling-genomic-determinants-of-blinatumomab-response-in-adult-b-all",
    "slug": "2026-10-05-unraveling-genomic-determinants-of-blinatumomab-response-in-adult-b-all",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42832396/",
    "sourceLabel": "PubMed",
    "doi": "10.1182/blood.2026033793",
    "sourcePublishedAt": "2026-10-05T00:00:00Z",
    "draftCreatedAt": "2026-10-06T04:32:51.964Z",
    "discoveredAt": "2026-10-06T04:09:00.675Z",
    "fieldId": "geroscience-drugs-trials",
    "evidence": "Evidence D",
    "studySubjects": [
      "cells-tissues-organoids"
    ],
    "contentType": "paper",
    "countdownImpact": "none",
    "localizedFacts": {
      "en": {
        "studyDesign": "Science news report",
        "populationOrModel": "Not assessed in this news report",
        "outcomes": "Identified genomic determinants associated with response to treatment in B-ALL.",
        "limitations": "Small sample sizes for several subtypes require confirmation.",
        "resultStatus": "Findings highlight genomic subtypes that influence blinatumomab efficacy.",
        "intervention": "Addition of blinatumomab to chemotherapy"
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "B-ALLにおける治療反応に関連するゲノム決定因子を特定。",
        "limitations": "いくつかのサブタイプのサンプルサイズが小さいため確認が必要。",
        "resultStatus": "blinatumomabの有効性に影響を与えるゲノムサブタイプに関する発見。",
        "intervention": "化学療法へのblinatumomabの追加"
      }
    },
    "en": {
      "headline": "Unraveling Genomic Determinants of Blinatumomab Response in Adult B-ALL",
      "dek": "A study analyzes genomic data of 569 adults to identify molecular subtypes related to treatment response.",
      "whatHappened": "The ECOG-ACRIN E1910 study has revealed 23 molecular subtypes linked to the efficacy of blinatumomab plus chemotherapy in adults with B-cell acute lymphoblastic leukemia.",
      "whyItMatters": "Understanding these genomic subtypes could help tailor therapies and improve outcomes for patients with B-ALL.",
      "realityCheck": "While the findings suggest interesting associations, they do not confirm any treatment efficacy or readiness for clinical application."
    },
    "ja": {
      "headline": "成人B-ALLにおけるblinatumomab反応のゲノム決定因子を解明",
      "dek": "569人の成人のゲノムデータを分析し、治療反応に関連する分子サブタイプを特定。",
      "whatHappened": "ECOG-ACRIN E1910研究により、成人のB細胞急性リンパ芽球性白血病において、化学療法と併用したblinatumomabの有効性に関連する23の分子サブタイプが明らかになった。",
      "whyItMatters": "これらのゲノムサブタイプを理解することで、B-ALL患者に対する治療法の調整と結果の改善が期待できる。",
      "realityCheck": "研究結果は興味深い関連性を示唆しているが、治療効果や臨床応用の準備が整っていることは確認されていない。"
    },
    "sourceCheck": {
      "sourceId": "pubmed",
      "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42832396/",
      "title": "Genomic drivers of leukemia and blinatumomab response in adult acute lymphoblastic leukemia - the ECOG-ACRIN E1910 study",
      "publishedAt": "2026-10-05T00:00:00Z",
      "fetchedAt": "2026-10-06T04:09:00.675Z",
      "doi": "10.1182/blood.2026033793",
      "abstract": "The bispecific CD19/CD3 T-cell engaging antibody blinatumomab is efficacious in front-line therapy in B-cell acute lymphoblastic leukemia (B-ALL) but the biological determinants of response and resistance are incompletely understood. To examine the genomic determinants of outcome, we analyzed genomic and clinical data of 569 adults registered to the ECOG-ACRIN E1910 study of blinatumomab in BCR::ABL1-negative B-ALL (ClinicalTrials.gov NCT02003222). We identified 23 molecular subtypes including the high-risk subtypes BCR::ABL1 (20%), BCR::ABL1-like (18%), low hypodiploid (14%) and KMT2A-R (12%), and 267 putative driver genes. We identified a subtype characterized by CEBPA overexpression or elevated CEBPB expression due to chromosomal translocation-mediated enhancer hijacking, or insertions downstream of CEBPA that generate neoenhancers. Attainment of MRD-negativity patients after induction and intensification chemotherapy was more common in PAX5alt, TCF3::PBX1 and ZNF384-R B-ALL, and less common in BCR::ABL1-like and KMT2A-R B-ALL. Integration of genomic and clinical data suggested that the addition of blinatumomab to chemotherapy was associated with improved relapse-free and overall survival for several B-ALL subtypes, including hyperdiploid, PAX5alt, PAX5 P80R, BCR::ABL1-like JAK-STAT and KMT2A-R B-ALL, although small sample sizes for several subtypes indicate that confirmation is required. Alteration of TP53 or mutations associated with myeloid clonal hematopoiesis of indeterminate potential (CHIP) were identified in 15.3% and 9.8% of patients, respectively. The presence of these mutations was associated with older age at diagnosis and inferior outcome to chemotherapy. In summary, we define the landscape of genomic alterations of adult B-ALL, and identify genomic subtypes that may influence the efficacy of blinatumomab when combined with chemotherapy.",
      "authors": [
        "Zhong X",
        "Roberts KG",
        "Wei H",
        "Sun Z",
        "Montefiori LE",
        "Kumar A",
        "Iacobucci I",
        "Baviskar P",
        "Gao Q",
        "Pölönen P",
        "Pruett-Miller SM",
        "Schreiber RM",
        "Chang TC",
        "Zhang W",
        "Lei S",
        "Rampersaud E",
        "Fan Y",
        "Wu G",
        "Mattison RJ",
        "Zhang Y",
        "Racevskis J",
        "Lazarus HM",
        "Rowe JM",
        "Arber DA",
        "Wieduwilt MJ",
        "Abou Mourad Y",
        "Shami PJ",
        "Baer MR",
        "Asch AS",
        "O'Dwyer KM",
        "Hall A",
        "Liedtke M",
        "Bergeron J",
        "Wood BL",
        "Pratz KW",
        "Dinner SN",
        "Frey NV",
        "Gore SD",
        "Bhatnagar B",
        "Atallah EL",
        "Uy GL",
        "Jeyakumar D",
        "Lin TL",
        "Willman CL",
        "Podoltsev NA",
        "DeAngelo DJ",
        "Patel S",
        "Elliott MA",
        "Advani AS",
        "Tzachanis D",
        "Vachhani P",
        "Bhave RR",
        "Sharon E",
        "Little RF",
        "Erba HP",
        "Stone RM",
        "Tallman MS",
        "Yang JJ",
        "Luger SM",
        "Paietta E",
        "Litzow MR",
        "Mullighan CG"
      ],
      "fieldId": "geroscience-drugs-trials",
      "evidence": "Evidence D",
      "relevanceScore": 50,
      "significanceScore": 40,
      "reason": "field=geroscience-drugs-trials; evidence=Evidence D; study subjects recorded: cells-tissues-organoids; cell, tissue, in-vitro, or organoid experiment (overexpression); human-derived material is not a study in living people; aging/longevity terms in abstract: aging; no field-specific terms; assigned the generic geroscience bucket; cancer treatment or therapeutic research in title/abstract (+25); base 20; not set from Evidence letter; abstract reports an intervention applied in this study (+8); reported a cancer outcome, not an organism lifespan change (+12); no effect size, novelty, or causality is inferred beyond the wording above; significance is triage of reported content, not a calibrated scientific index; thresholds: relevance>=50, significance>=30; Scores are rule-based triage, not a calibrated scientific index.",
      "recordId": "42832396",
      "dateFields": {
        "publicationDate": {
          "raw": "2026 Oct 5",
          "iso": "2026-10-05",
          "precision": "day"
        },
        "entrezDate": {
          "raw": "2026/10/05 13:14",
          "iso": "2026-10-05T13:14:00Z",
          "precision": "datetime"
        }
      },
      "windowMatch": {
        "inWindow": true,
        "matchedFields": [
          "publicationDate",
          "entrezDate"
        ]
      },
      "urlOrigin": {
        "kind": "constructed-from-id",
        "rule": "Constructed in the PubMed adapter from PMID using the current PubMed record URL (pubmed.ncbi.nlm.nih.gov). NCBI E-utilities documents the PubMed web interface at pubmed.ncbi.nlm.nih.gov; NCBI Web Link Help also documents https://www.ncbi.nlm.nih.gov/pubmed/{pmid} as an equivalent record link.",
        "id": "42832396"
      },
      "studySubjects": [
        "cells-tissues-organoids"
      ],
      "hints": {
        "pubTypes": [
          "Journal Article"
        ],
        "journal": "Blood"
      }
    },
    "sitePublishedAt": "2026-10-06T04:32:51.964Z"
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
