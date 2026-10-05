import type { RankedRecord } from "./types";
import { isScienceNews } from "./science-news";

const BIOLOGY_AGING =
  /\b(senescen|senolytic|geroscience|healthspan|lifespan|epigenetic clock|biological age|rejuvenation|rapamycin|metformin|organoid|crispr|biomarker|histopatholog|parabiosis)\b/i;

/**
 * Hard exclusions. These are not relevance discounts.
 * A record matching any of these must not become a publish candidate.
 */
export function exclusionReasons(record: RankedRecord): string[] {
  const title = record.title.toLowerCase();
  const abstract = (record.abstract ?? "").toLowerCase();
  const text = `${title}\n${abstract}`;
  const reasons: string[] = [];
  const scienceNews = isScienceNews(record);

  if (
    /\b(celebrity|celebrities|gossip|tabloid|hollywood|kardashian|influencer gossip)\b/i.test(
      text,
    )
  ) {
    reasons.push("celebrity or gossip coverage");
  }

  if (
    /\b(buy now|shop now|add to cart|discount code|order now|free shipping)\b/i.test(text) &&
    /\b(cream|serum|cosmetic|makeup|anti-wrinkle|beauty)\b/i.test(text)
  ) {
    reasons.push("cosmetic or beauty-product promotion");
  } else if (
    /\b(cosmetic product|beauty brand|skincare launch|anti-wrinkle cream for sale)\b/i.test(
      text,
    )
  ) {
    reasons.push("cosmetic or beauty-product promotion");
  }

  if (
    (/\b(buy now|shop now|add to cart|discount code|supplement store|order today)\b/i.test(
      text,
    ) &&
      /\b(supplement|nmn|resveratrol|longevity pill)\b/i.test(text)) ||
    /\b(dietary supplement for sale|buy .{0,40}supplement)\b/i.test(text)
  ) {
    reasons.push("supplement sales copy");
  }

  if (/\bretract(?:ed|ion notice|ion of)\b/i.test(text)) {
    reasons.push("retracted article");
  }

  const pubTypes = (record.hints?.pubTypes ?? []).map((value) => value.toLowerCase());
  const opinion =
    pubTypes.some((type) =>
      ["editorial", "comment", "letter", "news", "press release", "opinion"].some((label) =>
        type.includes(label),
      ),
    ) ||
    /\b(press release|editorial|commentary|letter to the editor|opinion piece)\b/i.test(
      `${record.title} ${pubTypes.join(" ")}`,
    );
  if (opinion && !scienceNews) {
    reasons.push("editorial, opinion, or press release without primary research");
  }

  if (
    /\b(retirement age|social security|ageing society|aging population census|birthday)\b/i.test(
      text,
    ) &&
    !BIOLOGY_AGING.test(text)
  ) {
    reasons.push("general social or demographic age article");
  }

  const agingTokens = [...text.matchAll(/\b(anti-?age?ing|longevity|human|aging|ageing|senescence|geroscience|healthspan|lifespan)\b/gi)].map(
    (match) => match[1].toLowerCase().replace("ageing", "aging").replace("antiaging", "anti-aging"),
  );
  const distinctive = agingTokens.filter(
    (token) => !["anti-aging", "longevity", "human"].includes(token),
  );
  if (
    agingTokens.length > 0 &&
    !scienceNews &&
    distinctive.length === 0 &&
    !BIOLOGY_AGING.test(text)
  ) {
    reasons.push("only generic anti-aging, longevity, or human wording");
  } else if (
    /\blongevity\b/i.test(text) &&
    !BIOLOGY_AGING.test(text) &&
    distinctive.filter((token) => token !== "longevity").length === 0 &&
    (record.reason ?? "").includes("no field-specific terms")
  ) {
    reasons.push("longevity keyword without longevity-research content");
  }

  if (record.sourceId === "pubmed" && !record.doi) {
    reasons.push("DOI missing; primary source cannot be confirmed");
  }

  if (!record.sourceUrl?.startsWith("https://")) {
    reasons.push("primary source URL is missing");
  }

  const subjects = record.studySubjects ?? [];
  if (
    (record.evidence === "Evidence D" || record.evidence === "Evidence E") &&
    !scienceNews &&
    subjects.length === 0
  ) {
    reasons.push("animal or cell species could not be identified for preclinical work");
  }

  if (
    record.evidence === "Evidence E" &&
    /classification basis insufficient/i.test(record.reason)
  ) {
    reasons.push("study class could not be determined");
  }

  return [...new Set(reasons)];
}
