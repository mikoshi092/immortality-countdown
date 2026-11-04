import Link from "next/link";
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

export function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h2 className="text-center text-[clamp(1.4rem,4vw,1.9rem)] font-extrabold leading-[1.4] text-[#233252]">
        {title}
      </h2>
      {sub ? (
        <p className="mt-2 text-center text-[clamp(0.92rem,2.6vw,1rem)] text-[#4a5878]">{sub}</p>
      ) : null}
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
};

/** Scenario range bar: earliest (the endpoint) / standard pace / latest. */
export function RangeBar({ points, note }: { points: RangePoint[]; note: string }) {
  return (
    <>
      <div className="relative mx-auto my-[38px] max-w-[680px]">
        <div className="h-2 rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a_45%,#b8c4de)]" />
        {points.map((point) => (
          <div
            key={point.year}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${
              point.highlight
                ? "h-[26px] w-[26px] border-4 border-[#e8502f] bg-[#ffe9e2]"
                : "h-[18px] w-[18px] border-4 border-[#4a5878]"
            }`}
            style={{ left: point.left }}
          >
            {point.hideYear ? null : (
              <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.95rem] font-extrabold text-[#233252]">
                {point.year}
              </span>
            )}
            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-[0.8rem] font-bold text-[#4a5878]">
              {point.tag}
            </span>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-11 max-w-[620px] text-center text-[0.95rem]">{note}</p>
    </>
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

export type MilestoneStep = { gain: string; when: string; state: "done" | "next" | "final" };

/**
 * A turning-point event in the wider world, pinned to the milestone
 * axis at `left` (the five steps sit at 10/30/50/70/90% of the row).
 * Events are NOT model output: they render as filled pills in a band
 * above the axis — a large coral pill for the headline event, a smaller
 * navy pill for a secondary one — visually separate from the stepper's
 * outline circles, each with a short tick down toward its point. A
 * "small" event has no step of its own, so it also gets a filled dot
 * on the axis line itself. Owner decision, 2026-11-04.
 */
export type TimelineEvent = {
  label: string;
  /** Optional year shown inside a small marker (e.g. "2030"). */
  year?: string;
  /** Position on the stepper axis, as a CSS left value (e.g. "30%"). */
  left: string;
  size: "large" | "small";
};

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
  const largeEvents = events?.filter((event) => event.size === "large") ?? [];
  const smallEvents = events?.filter((event) => event.size === "small") ?? [];
  return (
    <div className="relative mt-[30px] rounded-[14px] border-[3px] border-[#7d97bd] bg-white px-4 py-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      {events && events.length > 0 ? (
        <>
          {eventsCaption ? (
            <p className="flex items-center gap-1.5 text-[0.75rem] font-bold text-[#4a5878]">
              <span
                aria-hidden="true"
                className="inline-block h-[10px] w-[10px] rounded-full bg-[#e8502f]"
              />
              <span
                aria-hidden="true"
                className="inline-block h-[10px] w-[10px] rounded-full bg-[#233252]"
              />
              {eventsCaption}
            </p>
          ) : null}
          <div className="relative h-[118px]">
            {smallEvents.map((event) => (
              <span
                key={event.label}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#233252] px-3 py-1.5 text-[clamp(0.66rem,2.7vw,0.82rem)] font-bold leading-[1.25] text-white shadow-[0_1px_5px_rgba(35,50,82,0.25)]"
                style={{ left: event.left }}
              >
                {event.year ? (
                  <span className="mr-1.5 font-extrabold">{event.year}</span>
                ) : null}
                {event.label}
              </span>
            ))}
            {smallEvents.map((event) => (
              <span
                key={`tick-${event.label}`}
                aria-hidden="true"
                className="absolute top-[34px] h-[8px] w-[3px] -translate-x-1/2 rounded bg-[#233252]/40"
                style={{ left: event.left }}
              />
            ))}
            {largeEvents.map((event) => (
              <span
                key={event.label}
                className="absolute top-[48px] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e8502f] px-[18px] py-2 text-[clamp(1.02rem,4.6vw,1.4rem)] font-extrabold leading-[1.25] text-white shadow-[0_2px_10px_rgba(232,80,47,0.35)]"
                style={{ left: event.left }}
              >
                {event.label}
              </span>
            ))}
            {largeEvents.map((event) => (
              <span
                key={`tick-${event.label}`}
                aria-hidden="true"
                className="absolute top-[100px] h-[18px] w-[3px] -translate-x-1/2 rounded bg-[#e8502f]/50"
                style={{ left: event.left }}
              />
            ))}
          </div>
        </>
      ) : null}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-[6%] right-[6%] top-[16px] h-[6px] rounded-full bg-[linear-gradient(90deg,#00a8a8_10%,#dbe7f5_10%)]"
        />
        {smallEvents.map((event) => (
          <span
            key={`dot-${event.label}`}
            aria-hidden="true"
            className="absolute top-[19px] z-10 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#233252] shadow-[0_1px_4px_rgba(35,50,82,0.3)]"
            style={{ left: event.left }}
          />
        ))}
        <div className="relative flex">
          {steps.map((step) => (
            <div key={step.gain} className="flex-1 px-0.5 text-center">
              <div
                className={`mx-auto flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] bg-white text-[1.05rem] ${
                  step.state === "done"
                    ? "border-[#00a8a8] bg-[#e6fbfb]"
                    : step.state === "final"
                      ? "border-[#e8502f] bg-[#ffe9e2]"
                      : "border-[#c9d4e8]"
                }`}
              >
                {step.state === "done" ? "✅" : step.state === "final" ? "🚀" : "→"}
              </div>
              <div className="mt-2 text-[clamp(1rem,3.4vw,1.25rem)] font-extrabold">{step.gain}</div>
              <div className="mt-0.5 text-[0.78rem] font-bold leading-[1.5] text-[#4a5878]">
                {step.when}
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
  heading: string;
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
