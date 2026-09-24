import type { ArticleFacts, CountdownImpact } from "@/data/articles";
import type { SiteLocale } from "@/lib/locale";

export const IMPACT_COPY: Record<
  SiteLocale,
  Record<CountdownImpact, string>
> = {
  en: {
    none: "NO — NOT YET",
    watch: "WATCHING",
  },
  ja: {
    none: "まだ動かさない",
    watch: "継続観察",
  },
};

export const ARTICLE_UI = {
  en: {
    field: "Field",
    date: "Date",
    evidence: "Evidence",
    signal: "The signal",
    whatHappened: "What happened",
    whyItMatters: "Why it matters",
    realityCheck: "Reality check",
    countdown: "Does this move the countdown?",
    source: "Source",
    modelNote:
      "The LEV model is re-evaluated about twice a year, or sooner after an extraordinary event. A typical research article does not change the countdown.",
    readSource: "Read the primary source",
    backToList: "Latest research",
    otherLanguage: "日本語で読む",
    studyDesign: "Study design",
    population: "Population / model",
    sampleSize: "Sample size",
    intervention: "Intervention",
    outcomes: "Outcomes",
    limitations: "Limitations",
    trialPhase: "Trial phase",
    resultStatus: "Result status",
    listTitle: "Latest News",
    listDek:
      "Selected research updates. Read the article here, then open the primary source.",
    listEmpty: "No research updates currently meet the publication criteria.",
    rssLabel: "RSS",
    englishField: "",
  },
  ja: {
    field: "分野",
    date: "日付",
    evidence: "Evidence",
    signal: "要点",
    whatHappened: "何が起きたか",
    whyItMatters: "なぜ重要か",
    realityCheck: "限界",
    countdown: "予測への影響",
    source: "出典",
    modelNote:
      "LEVモデルは原則として半年ごとに再評価します。重大な出来事がある場合のみ臨時審査します。通常の研究記事では予測年数を変えません。",
    readSource: "一次出典を読む",
    backToList: "最新研究の一覧",
    otherLanguage: "Read in English",
    studyDesign: "研究デザイン",
    population: "対象・モデル",
    sampleSize: "サンプル数",
    intervention: "介入",
    outcomes: "結果",
    limitations: "限界",
    trialPhase: "試験相",
    resultStatus: "結果の位置づけ",
    listTitle: "最新研究",
    listDek:
      "長寿研究の更新情報を、要点と限界に分けて紹介します。詳細は各記事末尾の一次資料をご確認ください。",
    listEmpty: "現在、公開基準を満たす新しい研究情報はありません。",
    rssLabel: "RSS",
    englishField: "（英語）",
  },
} as const;

const FACT_ROWS: {
  key: keyof ArticleFacts;
  labelKey:
    | "studyDesign"
    | "population"
    | "sampleSize"
    | "intervention"
    | "outcomes"
    | "limitations"
    | "trialPhase"
    | "resultStatus";
}[] = [
  { key: "studyDesign", labelKey: "studyDesign" },
  { key: "populationOrModel", labelKey: "population" },
  { key: "sampleSize", labelKey: "sampleSize" },
  { key: "intervention", labelKey: "intervention" },
  { key: "outcomes", labelKey: "outcomes" },
  { key: "limitations", labelKey: "limitations" },
  { key: "trialPhase", labelKey: "trialPhase" },
  { key: "resultStatus", labelKey: "resultStatus" },
];

export function visibleFactRows(facts: ArticleFacts) {
  return FACT_ROWS.filter((row) => {
    const value = facts[row.key];
    return typeof value === "string" && value.trim().length > 0;
  }).map((row) => ({
    key: row.key,
    labelKey: row.labelKey,
    value: facts[row.key] as string,
  }));
}
