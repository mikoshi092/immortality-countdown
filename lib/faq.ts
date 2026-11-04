import { countdown, heroEarlyYears } from "@/lib/countdown";
import type { SiteLocale } from "@/lib/locale";

export type FaqItem = {
  question: string;
  /** Canonical plain-text answer — the only form the FAQPage JSON-LD
   *  ever sees. */
  answer: string;
  /** JA only: the same answer split into phrase units, rendered as
   *  nowrap spans so lines break between phrases, never mid-phrase
   *  (a single-character orphan showed up in the LEV answer). The
   *  parts concatenate to `answer` byte-for-byte. */
  answerParts?: string[];
};

/**
 * Top-page FAQ: the "when?" questions people actually search with,
 * answered straight from the same countdown numbers the hero shows.
 * One array per locale, consumed by both the rendered section and the
 * FAQPage JSON-LD on the same page, so the two can never drift apart.
 *
 * Answers are the site's model estimates, phrased as estimates: the
 * early scenario is the endpoint, with the standard pace and the late
 * scenario kept as the range. Wording stays plain — no simulation or
 * scenario-count language on a public surface.
 */
export function faqItems(locale: SiteLocale): FaqItem[] {
  const { earlyYear, medianYear, lateYear, currentGain } = countdown;
  const gain = currentGain.toFixed(2);
  if (locale === "ja") {
    return [
      {
        question: "不老不死はいつ実現するの？",
        answer: `早ければ${earlyYear}年、あと${heroEarlyYears}年ほどです。長寿研究の進み具合をもとにした当サイトの計算では、標準のペースで${medianYear}年、遅れれば${lateYear}年という幅があります。`,
        answerParts: [
          `早ければ${earlyYear}年、`,
          `あと${heroEarlyYears}年ほどです。`,
          "長寿研究の進み具合を",
          "もとにした",
          "当サイトの計算では、",
          `標準のペースで${medianYear}年、`,
          `遅れれば${lateYear}年という`,
          "幅があります。",
        ],
      },
      {
        question: "永遠の命はいつ手に入る？",
        answer: `鍵は「寿命脱出速度（LEV）」に届くことです。そこを過ぎると、生きているあいだに寿命の延びが老化に追いつくようになります。その到達が、早ければ${earlyYear}年です。`,
        answerParts: [
          "鍵は",
          "「寿命脱出速度（LEV）」に",
          "届くことです。",
          "そこを過ぎると、",
          "生きているあいだに",
          "寿命の延びが",
          "老化に追いつくように",
          "なります。",
          "その到達が、",
          `早ければ${earlyYear}年です。`,
        ],
      },
      {
        question: "寿命脱出速度とは？いつ到達するの？",
        answer: `1年生きるあいだに、寿命が1年以上延びるようになる転換点のことです。「寿命回避速度」と呼ばれることもあります。いまの伸びは1年で約${gain}年分。この伸びが1.00に届いたときが到達で、早ければ${earlyYear}年です。`,
        answerParts: [
          "1年生きるあいだに、",
          "寿命が1年以上",
          "延びるようになる",
          "転換点のことです。",
          "「寿命回避速度」と",
          "呼ばれることも",
          "あります。",
          "いまの伸びは",
          `1年で約${gain}年分。`,
          "この伸びが",
          "1.00に届いたときが",
          "到達で、",
          `早ければ${earlyYear}年です。`,
        ],
      },
    ];
  }
  return [
    {
      question: "When will humans become immortal?",
      answer: `At the earliest, in ${earlyYear} — about ${heroEarlyYears} years from now. Based on how longevity research is progressing, this site's model puts arrival in ${medianYear} at the standard pace, and as late as ${lateYear} if progress slows.`,
    },
    {
      question: "When will we get eternal life?",
      answer: `The key is reaching longevity escape velocity. Past that point, life expectancy starts gaining on aging while you are still alive. That arrival comes in ${earlyYear} at the earliest.`,
    },
    {
      question: "What is longevity escape velocity, and when will we reach it?",
      answer: `It is the turning point where each year you live adds more than a year to your life expectancy. The gain is currently about ${gain} years per year; arrival is when it reaches 1.00 — in ${earlyYear} at the earliest.`,
    },
  ];
}

/** FAQPage structured data built from the same items the page renders. */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
