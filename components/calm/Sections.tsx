import Link from "next/link";
import type { ReactNode } from "react";
import type { FaqItem } from "@/lib/faq";
import { FOCUS_RING } from "@/lib/nav";
import type { SiteLocale } from "@/lib/locale";

/**
 * Presentational sections shared by the calm top pages (EN + JA), built
 * to the approved mock (files/toppage_mock_calm_2026-11-04.html): plain
 * background, standard sans, thin borders and light shadows, color only
 * where it carries meaning. All server components — the only client
 * islands on these pages are the count-up and the age calculator.
 */

export const CALM_INK = "#233252";
export const CALM_SOFT = "#4a5878";
export const CALM_CORAL = "#e8502f";
export const CALM_TEAL = "#00a8a8";

export function SectionHeading({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h2 className="text-center text-[clamp(1.4rem,4vw,1.9rem)] font-extrabold leading-[1.4] text-[#233252] [word-break:auto-phrase]">
        {title}
      </h2>
      {sub ? (
        <p className="mt-2 text-center text-[clamp(0.92rem,2.6vw,1rem)] text-[#4a5878] [word-break:auto-phrase]">
          {sub}
        </p>
      ) : null}
    </>
  );
}

/**
 * Phrase-unit spans for Japanese copy: each part renders as a
 * whitespace-nowrap inline span, so a line break can only fall
 * BETWEEN parts — never mid-phrase (「延びるようにな／る」). Browsers
 * with `word-break: auto-phrase` get the same policy from the
 * container class; the spans carry it where that is unsupported
 * (notably iOS Safari). Parts concatenate to the exact original
 * string — no copy change. Owner report, 2026-11-04.
 */
export function Phrases({ parts }: { parts: string[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="whitespace-nowrap">
          {part}
        </span>
      ))}
    </>
  );
}

export type RangePoint = {
  year: number;
  tag: string;
  left: string;
  highlight?: boolean;
  /** Suppress the year label above the dot when the page already states
   *  that year as the hero's standalone arrival line (JA hero: 2061). */
  hideYear?: boolean;
  /** The end tag is too long to sit beside the middle tag on one
   *  mobile line (EN "Earliest · the endpoint"): let it wrap onto a
   *  second line below sm instead of colliding. The note below the
   *  bar then takes extra mobile margin to clear the taller tag. */
  wrapTagOnMobile?: boolean;
  /** Years-to-go sub-line under the year ("あと35年" / "35 years to
   *  go"), rendered in the same label block as the year so it
   *  inherits the mobile end anchoring (design review, 2026-11-05).
   *  Shown even when the year itself is hidden (JA endpoint). */
  yearsToGo?: string;
};

/**
 * Scenario range bar: earliest (the endpoint) / standard pace /
 * latest. Labels center on their dot — except on mobile, where the
 * first point's labels anchor to the dot's left edge and the last
 * point's to its right edge: centered, the end labels overflowed the
 * screen (the JA left tag lost its first characters). Dots stay at
 * their data positions and the middle label stays centered; ≥sm
 * rendering is unchanged. Owner report, 2026-11-04.
 *
 * Each point's label block also carries a years-to-go sub-line under
 * the year (design review, 2026-11-05); the two-line block is why
 * the bar's top margin is larger than its bottom margin.
 */
export function RangeBar({ points, note }: { points: RangePoint[]; note: ReactNode }) {
  const anyWrappedTag = points.some((point) => point.wrapTagOnMobile);
  return (
    <>
      <div className="relative mx-auto mb-[38px] mt-[64px] max-w-[680px]">
        <div className="h-2 rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a_45%,#b8c4de)]" />
        {points.map((point, index) => {
          const align =
            index === 0 ? "start" : index === points.length - 1 ? "end" : "center";
          const alignClass =
            align === "start"
              ? "max-sm:left-0 max-sm:translate-x-0"
              : align === "end"
                ? "max-sm:left-auto max-sm:right-0 max-sm:translate-x-0"
                : "";
          return (
            <div
              key={point.year}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${
                point.highlight
                  ? "h-[26px] w-[26px] border-4 border-[#e8502f] bg-[#ffe9e2]"
                  : "h-[18px] w-[18px] border-4 border-[#4a5878]"
              }`}
              style={{ left: point.left }}
            >
              {point.hideYear && !point.yearsToGo ? null : (
                <span
                  className={`absolute bottom-[calc(100%+8px)] left-1/2 flex -translate-x-1/2 flex-col items-center ${alignClass} ${
                    align === "start"
                      ? "max-sm:items-start"
                      : align === "end"
                        ? "max-sm:items-end"
                        : ""
                  }`}
                >
                  {point.hideYear ? null : (
                    <span className="whitespace-nowrap text-[0.95rem] font-extrabold leading-[1.25] text-[#233252]">
                      {point.year}
                    </span>
                  )}
                  {point.yearsToGo ? (
                    <span className="whitespace-nowrap text-[0.72rem] font-bold leading-[1.3] text-[#4a5878]">
                      {point.yearsToGo}
                    </span>
                  ) : null}
                </span>
              )}
              <span
                className={`absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-[0.8rem] font-bold text-[#4a5878] ${alignClass} ${
                  point.wrapTagOnMobile
                    ? "max-sm:w-[104px] max-sm:whitespace-normal max-sm:text-left max-sm:leading-[1.35]"
                    : ""
                }`}
              >
                {point.tag}
              </span>
            </div>
          );
        })}
      </div>
      <p
        className={`mx-auto mt-11 max-w-[620px] text-center text-[0.95rem] [word-break:auto-phrase] ${
          anyWrappedTag ? "max-sm:mt-[60px]" : ""
        }`}
      >
        {note}
      </p>
    </>
  );
}

/**
 * Calm native <details> disclosure: the surface shows only the
 * summary row (a one-line label with a chevron that flips on open);
 * the folded content stays in the prerendered HTML, so it works
 * without JS and search engines still read it. The default marker
 * is hidden; the row keeps a ~44px tap height. Owner decision,
 * 2026-11-04 — conclusion on the surface, depth on tap.
 */
export function Disclosure({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="group">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-center gap-1.5 text-[0.95rem] font-bold text-[#4a7fb5] [&::-webkit-details-marker]:hidden">
        {label}
        <span
          aria-hidden="true"
          className="text-[0.75rem] transition-transform duration-200 group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      {children}
    </details>
  );
}

/** Two-row LEV gauge: where the gain rate is now vs the 1.00 goal. */
export function LevGauge({
  nowLabel,
  nowValueText,
  nowPct,
  goalLabel,
  goalValueText,
  note,
}: {
  nowLabel: string;
  nowValueText: string;
  nowPct: number;
  goalLabel: string;
  goalValueText: string;
  note: string;
}) {
  return (
    <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[0.95rem] font-bold">
        <span>{nowLabel}</span>
        <span>{nowValueText}</span>
      </div>
      <div className="mt-2 h-[22px] overflow-hidden rounded-full bg-[#eef2f9]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#57b8ff,#00a8a8)]"
          style={{ width: `${nowPct}%` }}
        />
      </div>
      <div className="mt-[22px] flex flex-wrap items-baseline justify-between gap-2 text-[0.95rem] font-bold">
        <span>{goalLabel}</span>
        <span>{goalValueText}</span>
      </div>
      <div className="mt-2 h-[22px] overflow-hidden rounded-full bg-[#eef2f9]">
        <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a)]" />
      </div>
      <p className="mt-4 text-center text-[0.92rem] font-bold">{note}</p>
    </div>
  );
}

export type MilestoneStep = {
  gain: string;
  /** Year line, e.g. "2026年" — rendered on its own line, never wraps.
   *  Only the first ("now") and last (arrival) steps carry one: the
   *  intermediate steps' crossing years are model internals, not
   *  milestones (owner decision, 2026-11-04), so they stay pure scale
   *  ticks. A missing line renders as a blank line, keeping the
   *  two-line slot — and the row's alignment — identical. */
  when?: string;
  /** Note line under the year, e.g. "いまここ" — its own line, never
   *  wraps. The halfway step keeps its note with no year above it. */
  note?: string;
  state: "done" | "next" | "final";
};

/**
 * A turning-point event in the wider world, pinned to the milestone
 * axis at `left` (the five steps sit at 10/30/50/70/90% of the row).
 * Events are NOT model output: they render as filled pills in a band
 * above the axis — a large coral pill for the headline event, smaller
 * pills for the secondary ones (navy, deep teal) — visually separate
 * from the stepper's outline circles, each with a short tick down
 * toward its point. A "small" event has no step of its own, so it
 * also gets a filled dot on the axis line itself. A small event can
 * sit on the lower row (`row: "lower"`, level with the large pill)
 * when the top row would crowd. Owner decision, 2026-11-04.
 *
 * On mobile (below sm) the absolute layout collapses, so the band
 * becomes a centered stack instead: caption, then the large pill,
 * then the small pills in chronological order — no ticks. The pills
 * are static there and the axis dot stays as-is. Owner report, 2026-11-04.
 * The stacked panel then read too large on phones, so below sm the
 * panel also compacts: tighter padding and band gaps, smaller pills,
 * 34px step circles (axis line and event dot re-centered to match),
 * and one-notch-smaller gain and year lines. The note line keeps the
 * fit-driven size from the two-line structure — the longest notes
 * ("around · halfway") have no slack to give at 360px. ≥sm sizes are
 * untouched. Owner report, 2026-11-04.
 */
export type TimelineEvent = {
  label: string;
  /** Optional year shown inside the marker, before the label
   *  (e.g. "2030" on the small pills, "2028" on the large pill). */
  year?: string;
  /** Position on the stepper axis, as a CSS left value (e.g. "30%"). */
  left: string;
  size: "large" | "small";
  /** Small-pill colorway (default "navy"). */
  tone?: "navy" | "teal";
  /** Desktop band row for a small pill: "upper" (default, top row) or
   *  "lower" (level with the large pill). Mobile stacks regardless. */
  row?: "upper" | "lower";
};

/** Small-pill colorways: navy for the technology event, deep teal
 *  (#2f7d6a, life-science register) for the cell event. The large
 *  headline pill is always coral. */
const SMALL_EVENT_TONES = {
  navy: { pill: "bg-[#233252]", tick: "bg-[#233252]/40", dot: "bg-[#233252]" },
  teal: { pill: "bg-[#2f7d6a]", tick: "bg-[#2f7d6a]/40", dot: "bg-[#2f7d6a]" },
} as const;

/** Five-step milestone stepper keyed to the early scenario. */
export function Milestones({
  steps,
  events,
  eventsCaption,
}: {
  steps: MilestoneStep[];
  events?: TimelineEvent[];
  eventsCaption?: string;
}) {
  const smallEvents = events?.filter((event) => event.size === "small") ?? [];
  // DOM order is chronological (2028 → 2030 → 2036) so the band
  // reads in year order to screen readers and text extraction.
  // Placement is absolute on desktop and order-class driven on
  // mobile, so the visuals are unchanged (design review, 2026-11-05).
  const orderedEvents = [...(events ?? [])].sort(
    (a, b) => Number(a.year ?? 0) - Number(b.year ?? 0),
  );
  return (
    <div className="relative mt-[30px] rounded-[14px] border-[3px] border-[#7d97bd] bg-white px-4 py-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)] max-sm:px-3 max-sm:py-5">
      {events && events.length > 0 ? (
        <>
          {eventsCaption ? (
            <p className="flex items-center gap-1.5 text-[0.75rem] font-bold text-[#4a5878] max-sm:justify-center">
              <span
                aria-hidden="true"
                className="inline-block h-[10px] w-[10px] rounded-full bg-[#e8502f]"
              />
              {smallEvents.map((event) => (
                <span
                  key={`caption-${event.label}`}
                  aria-hidden="true"
                  className={`inline-block h-[10px] w-[10px] rounded-full ${SMALL_EVENT_TONES[event.tone ?? "navy"].dot}`}
                />
              ))}
              {eventsCaption}
            </p>
          ) : null}
          <div className="relative h-[118px] max-sm:mt-2 max-sm:flex max-sm:h-auto max-sm:flex-col max-sm:items-center max-sm:gap-2">
            {orderedEvents.map((event) => {
              if (event.size === "large") {
                return (
                  <span
                    key={event.label}
                    className="absolute top-[48px] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e8502f] px-[18px] py-2 text-[clamp(1.02rem,4.6vw,1.4rem)] font-extrabold leading-[1.25] text-white shadow-[0_2px_10px_rgba(232,80,47,0.35)] max-sm:static max-sm:order-1 max-sm:translate-x-0 max-sm:px-4 max-sm:py-1.5 max-sm:text-[1.02rem]"
                    style={{ left: event.left }}
                  >
                    {event.year ? (
                      <span className="mr-1.5 font-extrabold">{event.year}</span>
                    ) : null}
                    {event.label}
                  </span>
                );
              }
              const tone = SMALL_EVENT_TONES[event.tone ?? "navy"];
              const lower = event.row === "lower";
              return (
                <span
                  key={event.label}
                  className={`absolute -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[clamp(0.66rem,2.7vw,0.82rem)] font-bold leading-[1.25] text-white shadow-[0_1px_5px_rgba(35,50,82,0.25)] ${tone.pill} ${lower ? "top-[48px]" : "top-0"} max-sm:static max-sm:order-2 max-sm:translate-x-0 max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.62rem]`}
                  style={{ left: event.left }}
                >
                  {event.year ? (
                    <span className="mr-1.5 font-extrabold">{event.year}</span>
                  ) : null}
                  {event.label}
                </span>
              );
            })}
            {orderedEvents.map((event) => {
              if (event.size === "large") {
                return (
                  <span
                    key={`tick-${event.label}`}
                    aria-hidden="true"
                    className="absolute top-[100px] h-[18px] w-[3px] -translate-x-1/2 rounded bg-[#e8502f]/50 max-sm:hidden"
                    style={{ left: event.left }}
                  />
                );
              }
              const tone = SMALL_EVENT_TONES[event.tone ?? "navy"];
              const lower = event.row === "lower";
              return (
                <span
                  key={`tick-${event.label}`}
                  aria-hidden="true"
                  className={`absolute w-[3px] -translate-x-1/2 rounded ${tone.tick} ${lower ? "top-[84px] h-[34px]" : "top-[34px] h-[8px]"} max-sm:hidden`}
                  style={{ left: event.left }}
                />
              );
            })}
          </div>
        </>
      ) : null}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-[6%] right-[6%] top-[16px] h-[6px] rounded-full bg-[linear-gradient(90deg,#00a8a8_10%,#dbe7f5_10%)] max-sm:top-[14px]"
        />
        {smallEvents.map((event) => (
          <span
            key={`dot-${event.label}`}
            aria-hidden="true"
            className={`absolute top-[19px] z-10 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(35,50,82,0.3)] ${SMALL_EVENT_TONES[event.tone ?? "navy"].dot} max-sm:top-[17px]`}
            style={{ left: event.left }}
          />
        ))}
        <div className="relative flex">
          {steps.map((step) => (
            <div key={step.gain} className="flex-1 px-0.5 text-center">
              <div
                className={`mx-auto flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] bg-white text-[1.05rem] max-sm:h-[34px] max-sm:w-[34px] max-sm:text-[0.95rem] ${
                  step.state === "done"
                    ? "border-[#00a8a8] bg-[#e6fbfb]"
                    : step.state === "final"
                      ? "border-[#e8502f] bg-[#ffe9e2]"
                      : "border-[#c9d4e8]"
                }`}
              >
                {step.state === "done" ? "✅" : step.state === "final" ? "🚀" : "→"}
              </div>
              <div className="mt-2 text-[clamp(1rem,3.4vw,1.25rem)] font-extrabold max-sm:mt-1.5 max-sm:text-[0.95rem]">
                {step.gain}
              </div>
              <div className="mt-0.5 font-bold leading-[1.5] text-[#4a5878]">
                <div className="whitespace-nowrap text-[0.78rem] max-sm:text-[0.74rem]">
                  {step.when ?? " "}
                </div>
                <div className="whitespace-nowrap text-[clamp(0.38rem,1.85vw,0.78rem)]">
                  {step.note ?? " "}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Status chip banding by readiness score (owner decision, 2026-11-04). */
export function fieldChip(score: number, locale: SiteLocale): { label: string; className: string } {
  if (score >= 50) {
    return {
      label: locale === "ja" ? "🟢 加速中" : "🟢 Accelerating",
      className: "bg-[#e5f8ee] text-[#0c7a43]",
    };
  }
  if (score >= 40) {
    return {
      label: locale === "ja" ? "🟡 前進中" : "🟡 Advancing",
      className: "bg-[#fff6db] text-[#8a6d00]",
    };
  }
  return {
    label: locale === "ja" ? "🟠 土台づくり中" : "🟠 Building foundations",
    className: "bg-[#ffefe6] text-[#b34a12]",
  };
}

export type FieldCardData = { key: string; emoji: string; name: string; blurb: string; score: number };

export function FieldCards({ fields, locale }: { fields: FieldCardData[]; locale: SiteLocale }) {
  return (
    <div className="mt-[22px] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
      {fields.map((field) => {
        const chip = fieldChip(field.score, locale);
        return (
          <div
            key={field.key}
            className="rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-5 shadow-[0_1px_6px_rgba(35,50,82,0.06)]"
          >
            <div className="text-[1.15rem]" aria-hidden="true">
              {field.emoji}
            </div>
            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-[1.02rem] font-extrabold leading-[1.4]">
              {field.name}
              <span
                className={`whitespace-nowrap rounded-full px-2 py-px text-[0.7rem] font-extrabold ${chip.className}`}
              >
                {chip.label}
              </span>
            </h3>
            <p className="mt-1 min-h-[3.3em] text-[0.85rem] leading-[1.65] text-[#4a5878]">
              {field.blurb}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#eef2f9]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#00a8a8,#57b8ff)]"
                  style={{ width: `${field.score}%` }}
                />
              </div>
              <b className="text-[1.05rem]">
                {field.score}
                <span className="text-[0.8rem]">%</span>
              </b>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * FAQ panel as a native <details> accordion: the question is the
 * summary row (＋ flips to × on open), the answer the collapsible
 * body; the first item starts open. All answers stay in the
 * prerendered HTML. Items come from lib/faq.ts, the same array that
 * feeds the page's FAQPage JSON-LD, so what search engines read is
 * what visitors read. Owner decision, 2026-11-04.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className={`group ${index > 0 ? "mt-4 border-t border-[#e3eaf5]" : ""}`}
        >
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 font-extrabold [word-break:auto-phrase] [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="shrink-0 text-[1.05rem] font-bold text-[#4a7fb5] transition-transform duration-200 group-open:rotate-45"
            >
              ＋
            </span>
          </summary>
          <div className="mt-2 [word-break:auto-phrase]">
            {item.answerParts ? <Phrases parts={item.answerParts} /> : item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

/** Closing block + fine print, shared by both top pages. The fine print
 *  arrives as separate short paragraphs (basis of the figure first, the
 *  not-a-promise line second) so the disclosure stays readable. */
export function Closing({
  heading,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  finePrint,
  locale,
}: {
  heading: ReactNode;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  finePrint: string[];
  locale: SiteLocale;
}) {
  return (
    <>
      <section className="pb-2 pt-[52px] text-center">
        <div className="text-[0.85rem] font-extrabold tracking-[0.35em] text-[#4a5878]">
          DEATH IS A BUG
        </div>
        <h2 className="mt-[14px] text-[clamp(1.4rem,4vw,1.9rem)] font-extrabold leading-[1.5]">
          {heading}
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className={`inline-block rounded-full bg-[#00a8a8] px-[26px] py-[13px] font-extrabold text-white transition-colors hover:bg-[#57b8ff] ${FOCUS_RING}`}
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className={`inline-block rounded-full border-[3px] border-[#7d97bd] bg-white px-[24px] py-[11px] font-extrabold text-[#233252] transition-colors hover:border-[#57b8ff] ${FOCUS_RING}`}
          >
            {secondaryLabel}
          </Link>
        </div>
      </section>
      <div className="mb-10 mt-10 rounded-xl border-2 border-dashed border-[#7d97bd] bg-white px-5 py-4 text-[0.8rem] leading-[1.8] text-[#4a5878]">
        {finePrint.map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-2" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
      <p className="pb-8 text-center text-[0.82rem] font-bold text-[#4a5878]">
        {locale === "ja"
          ? "Immortality Countdown — 長寿研究のいまを追う"
          : "Immortality Countdown — Tracking Longevity Escape Velocity"}
      </p>
    </>
  );
}
