import type { FieldId } from "@/lib/fields";
import type { EvidenceLevel } from "@/lib/evidence";

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
    "id": "2026-10-03-exploring-the-mtdna-cgas-sting-signaling-imitations-in-cellular-senescen",
    "slug": "2026-10-03-exploring-the-mtdna-cgas-sting-signaling-imitations-in-cellular-senescen",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/42828712/",
    "sourceLabel": "PubMed",
    "doi": "10.1007/s10522-026-10515-z",
    "sourcePublishedAt": "2026-10-03T00:00:00Z",
    "draftCreatedAt": "2026-10-05T08:09:57.494Z",
    "discoveredAt": "2026-10-05T08:08:37.802Z",
    "fieldId": "rejuvenation-regeneration",
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
        "outcomes": "The review discusses the activation of the mtDNA-cGAS-STING signaling axis during cellular senescence, its role in inflammation, and potential biomarkers associated with senescence.",
        "limitations": "Specifics about assay standards, causal relationships, and therapeutic windows remain unclear.",
        "resultStatus": "Current evidence suggests that this signaling axis mainly contributes to the maintenance and amplification of the inflammatory senescence phenotype."
      },
      "ja": {
        "studyDesign": "科学ニュース報道",
        "populationOrModel": "本報道では研究対象を検証していない",
        "outcomes": "本レビューは、細胞老化におけるmtDNA-cGAS-STINGシグナル経路の活性化、その炎症への役割、および老化に関連するバイオマーカについて論じています。",
        "limitations": "アッセイ基準、因果関係、治療のウィンドウに関する詳細は明確ではありません。",
        "resultStatus": "現在の証拠は、このシグナル経路が主に炎症性老化表現型の維持と増幅に寄与することを示唆しています。"
      }
    },
    "en": {
      "headline": "Exploring the mtDNA-cGAS-STING Signaling Imitations in Cellular Senescence",
      "dek": "A recent review sheds light on mitochondrial dysfunction during cellular aging and its implications for immune responses.",
      "whatHappened": "The review details how the leakage of mitochondrial DNA can activate immune signaling pathways in senescent cells and emphasizes the complexity of these responses.",
      "whyItMatters": "Understanding these mechanisms could aid in identifying potential senescence-associated biomarkers and therapeutic targets.",
      "realityCheck": "While this research reveals intriguing insights into mitochondrial changes in aging cells, it does not suggest direct applications for longevity or anti-aging treatments at this time."
    },
    "ja": {
      "headline": "細胞老化におけるmtDNA-cGAS-STINGシグナルの制限を探る",
      "dek": "最近のレビューが、細胞の老化におけるミトコンドリア機能不全とその免疫応答への影響に光を当てています。",
      "whatHappened": "このレビューは、ミトコンドリアDNAの漏出が老化細胞における免疫シグナル経路を活性化する方法を詳述し、これらの応答の複雑さを強調しています。",
      "whyItMatters": "これらのメカニズムを理解することは、老化に関連するバイオマーカーや治療標的の特定に役立つ可能性があります。",
      "realityCheck": "この研究は、老化細胞におけるミトコンドリアの変化に関する興味深い洞察を提供していますが、現時点で長寿や抗老化治療への直接の応用を示唆するものではありません。"
    },
    "sitePublishedAt": "2026-10-05T08:09:57.494Z"
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
