import type { FieldId } from "@/lib/fields";

/**
 * Japanese display strings for the /ja landing page.
 *
 * These are display names only. The canonical taxonomy stays `FieldId`
 * from lib/fields.ts, and every score still comes from lev/params.json
 * through lib/model-snapshot.ts — nothing here is a model input, and
 * nothing here may be used as a key or a slug.
 *
 * Typing both maps as `Record<FieldId, string>` means adding a ninth
 * field to the model is a TypeScript error here rather than a silently
 * untranslated card.
 */
export const FIELD_LABELS_JA: Record<FieldId, string> = {
  "rejuvenation-regeneration": "若返り・再生",
  "biomarkers-diagnostics": "老化測定・診断",
  "geroscience-drugs-trials": "老化標的薬・臨床試験",
  "gene-therapy-delivery": "遺伝子治療・送達技術",
  "ai-drug-discovery": "AI創薬",
  "organ-replacement-biofabrication": "臓器置換・組織作製",
  "immune-engineering-cancer-control": "免疫・がん制御",
  "enabling-technology-automation": "研究自動化・基盤技術",
};

/** One-line summaries, kept faithful to each field's English description. */
export const FIELD_SUMMARIES_JA: Record<FieldId, string> = {
  "rejuvenation-regeneration":
    "老化細胞の除去、組織の再生、部分的リプログラミングなど、傷んだ細胞や組織を若い状態へ近づける技術。",
  "biomarkers-diagnostics":
    "老化の進みを測る指標で、「どれだけ老化しているか」を短期間で測る技術。",
  "geroscience-drugs-trials":
    "老化に関わる経路を標的にした薬剤と、それを人で検証する臨床試験。",
  "gene-therapy-delivery":
    "遺伝子編集や遺伝子治療そのものに加え、必要な細胞・臓器へ安全に届ける技術。",
  "ai-drug-discovery":
    "候補分子の探索、作用予測、臨床試験設計などをAIで速める領域。",
  "organ-replacement-biofabrication":
    "人工臓器、オルガノイド、再生臓器など、壊れた臓器を修復・交換する技術。",
  "immune-engineering-cancer-control":
    "免疫の老化、慢性炎症、がんを抑え、長く生きることで増えるリスクに対応する技術。",
  "enabling-technology-automation":
    "ロボット実験、自動実験、大量同時探索、計算基盤など、研究の速度そのものを上げる技術。",
};
