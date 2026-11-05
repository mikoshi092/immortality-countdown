import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { FaqItem } from "@/lib/faq";
import type { FieldId } from "@/lib/fields";
import { FOCUS_RING } from "@/lib/nav";
import type { SiteLocale } from "@/lib/locale";
import { FieldIcon } from "./FieldIcons";

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

/**
 * Display deformation (owner decision, 2026-11-05): on a strict
 * linear scale the arrival point strands far to the right and the
 * early points crush together, so track POSITIONS are mapped
 * through a piecewise scale — the first 30 points of gain stretch
 * across the left 57% of the track, the remaining 70 points across
 * the right 43%. The % values printed on the labels stay the
 * model's true values; only placement is deformed. The point
 * markers, pill ticks, labels and the "filled up to now" gradient
 * all anchor to the mapped position.
 */
function roadDisplayPct(pct: number): number {
  return pct <= 30 ? (pct / 30) * 57 : 57 + ((pct - 30) / 70) * 43;
}

export type RoadPoint = {
  /** The model's gain for the point's year, in percent (gain ×
   *  100). For the start and end points this is the value printed
   *  on the under-track label; the point's position on the track
   *  is `roadDisplayPct(pct)`, a deformed scale (see above). The
   *  events print no % of their own (owner decision, 2026-11-05:
   *  the 23/24/29% labels came off — the events are identified by
   *  their pills, which now carry the year instead). */
  pct: number;
  /** Percent line under the track, e.g. "22%" — start and end
   *  points only; events carry no under-track label. */
  pctLabel?: string;
  /** Year line under the percent, e.g. "2026年" — never wraps.
   *  For events this is data only (the year is displayed in the
   *  pill); it also keeps point keys self-describing. */
  when: string;
  /** Optional note line under the year (start and end points only),
   *  e.g. "いまここ" / "LEV到達" — never wraps. */
  note?: string;
  /** "start" and "end" render as larger circle markers on the track;
   *  an "event" renders as a small filled dot in its pill's tone,
   *  with the pill itself above the track. */
  marker: "start" | "event" | "end";
  /** Turning-point event pill above the track (events only). The
   *  `level` staggers the pills vertically so neighbours never
   *  collide: 1 sits closest to the track, 3 highest. */
  pill?: {
    label: string;
    /** The event's year, appended to the label inside the pill
     *  (owner decision, 2026-11-05 — the year moved into the pill
     *  when the under-track event labels were removed). Passed as
     *  the full suffix so each locale punctuates its own way:
     *  " (2028)" / "（2028年）". Rendered in the same type as the
     *  label at reduced opacity — a quieter echo, not a second
     *  style tier. */
    year: string;
    tone: "coral" | "navy" | "teal";
    level: 1 | 2 | 3;
    /** Centre of the pill, as a percent of the stage width. The
     *  pills fan out horizontally (owner's hand-edited mock,
     *  2026-11-05) instead of stacking in one column over their
     *  points: the coral pill sits left, the navy pill
     *  upper-left, the teal pill over its own point — and a
     *  diagonal leader line runs from each pill's bottom edge
     *  down to its point. `anchor` applies at sm and up,
     *  `anchorSm` below sm: the stage narrows much faster than
     *  the pills shrink. With the year inside the pill the set
     *  steps down to 10px below sm — at 11px the EN navy pill
     *  measured 294px on the 320px stage at 390px and clipped
     *  at any workable centre — and two centres move: the EN
     *  navy pill (276px even at 10px) centres at 50 below sm,
     *  and the JA coral pill (154px) needs 28 to clear the left
     *  edge. All values are verified against rendered captures
     *  in both locales. */
    anchor: number;
    anchorSm: number;
  };
};

/** Pill colorways: coral for the headline event, navy for the
 *  technology event, deep teal (#2f7d6a, life-science register) for
 *  the cell event. `line` / `lineOpacity` style the SVG leader line
 *  from the pill down to its point — the same muted tone strength
 *  the old vertical tick divs used (50% coral, 40% navy / teal). */
const ROAD_PILL_TONES = {
  coral: { pill: "bg-[#e8502f]", line: "#e8502f", lineOpacity: 0.5, dot: "bg-[#e8502f]" },
  navy: { pill: "bg-[#233252]", line: "#233252", lineOpacity: 0.4, dot: "bg-[#233252]" },
  teal: { pill: "bg-[#2f7d6a]", line: "#2f7d6a", lineOpacity: 0.4, dot: "bg-[#2f7d6a]" },
} as const;

/**
 * Pill stagger geometry. The stage is a fixed-height relative box
 * (204px, 196px below sm) with the track's centre line at top:116px
 * (112px below sm). Pills are anchored from the top by their BOTTOM
 * edge (the anchor top plus -translate-y-full), so their distance
 * above the track does not depend on the stage height: level 1
 * hangs 18px above the centre line (16px below sm), level 2 49px
 * (47px), level 3 80px (78px) — the arrangement in the owner's
 * 2026-11-05 sketch, where the 2030 pill rides highest. All three
 * pills share one type scale (owner cleanup, 2026-11-05: the
 * headline pill used to render far larger than the other two);
 * the level gaps are sized so each pill's band clears the next by
 * ~8px regardless of horizontal position.
 *
 * Leader lines: the pills fan out horizontally (owner's
 * hand-edited mock, 2026-11-05), so the old vertical tick divs
 * became diagonal SVG lines, one per event, drawn in two overlay
 * variants — desktop and below-sm — because the geometry differs
 * per breakpoint: each line runs from (pill anchor %, the level's
 * `lineTop` — the same value as the pill's bottom-edge anchor)
 * down to (the point's display %, just past the centre line:
 * 119px, 115px below sm). The SVGs use a 0–100 x-range (percent
 * of stage width) against a pixel y-range matching the stage
 * height, with non-scaling-stroke so lines stay 2px at any width.
 * The overlays sit under the pills (z-10) and markers (z-20).
 */
const ROAD_LEVELS = {
  1: { pillAnchor: "top-[98px] max-sm:top-[96px]", lineTop: 98, lineTopSm: 96 },
  2: { pillAnchor: "top-[67px] max-sm:top-[65px]", lineTop: 67, lineTopSm: 65 },
  3: { pillAnchor: "top-[36px] max-sm:top-[34px]", lineTop: 36, lineTopSm: 34 },
} as const;

/** Track centre line, per breakpoint (see the stage geometry
 *  above): leader lines end 3px past it, under the markers. */
const ROAD_LINE_END = 119;
const ROAD_LINE_END_SM = 115;

/**
 * Under-track label position. Only the start and end points carry
 * a label under the track (percent, year, note — ~53px tall from
 * this top): the events' % + year labels used to descend in a
 * one-row-per-point staircase under the left cluster, but the
 * owner removed them (2026-11-05) — the events now speak through
 * their pills alone, year included. The end label shares this
 * top, anchored to its right edge at the far right of the stage.
 */
const ROAD_LABEL_TOP = "top-[136px] max-sm:top-[130px]";

/**
 * The road to arrival: one horizontal track for the whole LEV gain
 * scale (0 → 1.00, shown as %), filled up to the current point, with
 * the turning-point events pinned ON the track at their gain
 * positions — a staggered pill above the track carrying the event
 * name and its year — and circle markers for the start (now) and
 * the arrival point, which keep the only under-track labels
 * (percent, year, note). This replaces the earlier two-part
 * display (a pill panel captioned 「世の中の転換点」 above a
 * separate five-step gain stepper) with the single unified
 * timeline from the owner's hand-drawn sketch. Owner decision,
 * 2026-11-05. The event positions are the model's own gains in
 * their years (derived by the pages through lib/countdown's
 * gainPercentAt), placed on the track through the deformed
 * display scale (roadDisplayPct) so the four left-hand points
 * spread across the track's left half. The events' under-track
 * % + year labels were removed by the owner (2026-11-05) — the
 * year moved into the pill text instead. The pills fan out
 * horizontally over the stage (each pill carries its own `anchor`
 * centre, per the owner's hand-edited mock, 2026-11-05), joined
 * to their points by diagonal SVG leader lines.
 *
 * Points render in the order given — chronological (2026 → 2028 →
 * 2030 → 2036 → 2061) — so screen readers and text extraction meet
 * them in year order; all placement is absolute. The end point's
 * label is anchored to its right edge so it never clips at the
 * panel edge (the same care as the range bar's end labels).
 */
export function Milestones({ points }: { points: RoadPoint[] }) {
  const nowPoint = points.find((point) => point.marker === "start");
  return (
    <div className="relative mt-[30px] rounded-[14px] border-[3px] border-[#7d97bd] bg-white px-4 py-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)] max-sm:px-3 max-sm:py-5">
      <div className="relative h-[204px] max-sm:h-[196px]">
        {/* Track: the full gain scale, filled up to the current point. */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-[113px] h-[6px] rounded-full bg-[#dbe7f5] max-sm:top-[109px]"
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#57b8ff,#00a8a8)]"
            style={{ width: `${roadDisplayPct(nowPoint?.pct ?? 0)}%` }}
          />
        </div>
        {/* Leader lines: one diagonal per event, from its pill's
            bottom edge down to its point. Two overlay variants —
            the stage geometry differs below sm (see ROAD_LEVELS). */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full max-sm:hidden"
          viewBox="0 0 100 204"
          preserveAspectRatio="none"
        >
          {points.map((point) =>
            point.pill ? (
              <line
                key={`${point.pct}-${point.when}`}
                x1={point.pill.anchor}
                y1={ROAD_LEVELS[point.pill.level].lineTop}
                x2={roadDisplayPct(point.pct)}
                y2={ROAD_LINE_END}
                stroke={ROAD_PILL_TONES[point.pill.tone].line}
                strokeOpacity={ROAD_PILL_TONES[point.pill.tone].lineOpacity}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null,
          )}
        </svg>
        <svg
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full max-sm:block"
          viewBox="0 0 100 196"
          preserveAspectRatio="none"
        >
          {points.map((point) =>
            point.pill ? (
              <line
                key={`${point.pct}-${point.when}`}
                x1={point.pill.anchorSm}
                y1={ROAD_LEVELS[point.pill.level].lineTopSm}
                x2={roadDisplayPct(point.pct)}
                y2={ROAD_LINE_END_SM}
                stroke={ROAD_PILL_TONES[point.pill.tone].line}
                strokeOpacity={ROAD_PILL_TONES[point.pill.tone].lineOpacity}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null,
          )}
        </svg>
        {points.map((point) => {
          const tone = point.pill ? ROAD_PILL_TONES[point.pill.tone] : null;
          const level = point.pill ? ROAD_LEVELS[point.pill.level] : null;
          const displayPct = roadDisplayPct(point.pct);
          return (
            <div key={`${point.pct}-${point.when}`} className="contents">
              {point.pill && tone && level ? (
                <span
                  className={`absolute left-[var(--road-anchor)] z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold leading-[1.25] text-white max-sm:left-[var(--road-anchor-sm)] max-sm:px-2 max-sm:text-[10px] ${tone.pill} ${level.pillAnchor} ${
                    point.pill.tone === "coral"
                      ? "shadow-[0_2px_8px_rgba(232,80,47,0.3)]"
                      : "shadow-[0_1px_5px_rgba(35,50,82,0.25)]"
                  }`}
                  style={
                    {
                      "--road-anchor": `${point.pill.anchor}%`,
                      "--road-anchor-sm": `${point.pill.anchorSm}%`,
                    } as CSSProperties
                  }
                >
                  {point.pill.label}
                  <span className="opacity-80">{point.pill.year}</span>
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className={`absolute top-[116px] z-20 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_#ffffff,0_1px_3px_rgba(35,50,82,0.35)] max-sm:top-[112px] ${
                  point.marker === "start"
                    ? "h-[15px] w-[15px] bg-[#00a8a8]"
                    : point.marker === "end"
                      ? "h-[15px] w-[15px] bg-[#e8502f]"
                      : `h-[11px] w-[11px] ${tone?.dot ?? ""}`
                }`}
                style={{ left: `${displayPct}%` }}
              />
              {point.pctLabel ? (
                <div
                  className={`absolute text-center ${ROAD_LABEL_TOP} ${
                    point.marker === "end" ? "-translate-x-full" : "-translate-x-1/2"
                  }`}
                  style={{ left: `${displayPct}%` }}
                >
                  <div className="text-[15px] font-bold leading-[1.15] max-sm:text-[14px]">
                    {point.pctLabel}
                  </div>
                  <div className="mt-0.5 whitespace-nowrap text-[11px] font-bold leading-[1.45] text-[#4a5878]">
                    {point.when}
                  </div>
                  {point.note ? (
                    <div className="whitespace-nowrap text-[11px] font-bold leading-[1.45] text-[#4a5878]">
                      {point.note}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
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

export type FieldCardData = { key: string; icon: FieldId; name: string; blurb: string; score: number };

/**
 * Field cards in fixed lanes (owner report, 2026-11-05: bars and chips
 * sat at different heights from card to card). Each card is a flex
 * column — icon row, two-line title, the status chip on its own row
 * under the title, description, then the bar row pinned to the bottom
 * by margin-top:auto — and the grid stretches every card in a row to
 * the same height, so bars and percentages line up across the row.
 * The lane min-heights only apply once the grid can actually hold
 * more than one column (≥480px viewport); in a single column the
 * lanes size naturally so stacked cards carry no dead space. The
 * description reserves 3 lines in Japanese and 4 in English, the
 * longest blurb in each locale at card width.
 */
export function FieldCards({ fields, locale }: { fields: FieldCardData[]; locale: SiteLocale }) {
  return (
    <div className="mt-[22px] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
      {fields.map((field) => {
        const chip = fieldChip(field.score, locale);
        return (
          <div
            key={field.key}
            className="flex flex-col rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-5 shadow-[0_1px_6px_rgba(35,50,82,0.06)]"
          >
            <div className="flex h-7 items-start">
              <FieldIcon id={field.icon} className="h-7 w-7 shrink-0" />
            </div>
            <h3 className="mt-2 text-[1.02rem] font-extrabold leading-[1.4] min-[480px]:min-h-[2.8em]">
              {field.name}
            </h3>
            <div className="mt-1.5 flex items-center">
              <span
                className={`whitespace-nowrap rounded-full px-2 py-px text-[0.7rem] font-extrabold ${chip.className}`}
              >
                {chip.label}
              </span>
            </div>
            <p
              className={`mt-2 text-[0.85rem] leading-[1.65] text-[#4a5878] ${
                locale === "ja" ? "min-[480px]:min-h-[4.95em]" : "min-[480px]:min-h-[6.6em]"
              }`}
            >
              {field.blurb}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-3">
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
