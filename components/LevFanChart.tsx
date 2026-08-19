import { trajectory, countdown } from "@/lib/countdown";

/**
 * Fan chart of the rate of gain in remaining healthy life expectancy.
 * Pure SVG, server-rendered, no chart library and no client JS — the
 * whole page stays static.
 *
 * Colour job here is sequential, not categorical: one hue, bands receding
 * toward the surface as probability density falls. The site's teal
 * (#2f766d) is the single hue; the escape-velocity threshold is drawn in
 * ink rather than a fifth colour so it reads as an axis, not a series.
 */

const W = 760;
const H = 340;
const PAD = { t: 18, r: 20, b: 42, l: 52 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;
const G_MAX = 2.5;

const YEAR_MIN = trajectory[0].year;
const YEAR_MAX = trajectory[trajectory.length - 1].year;

const fx = (year: number) => PAD.l + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * plotW;
const fy = (g: number) => PAD.t + plotH - (Math.min(g, G_MAX) / G_MAX) * plotH;

type Key = "p10" | "p25" | "p50" | "p75" | "p90";

const linePath = (key: Key) =>
  trajectory
    .map((d, i) => `${i === 0 ? "M" : "L"}${fx(d.year).toFixed(1)},${fy(d[key]).toFixed(1)}`)
    .join("");

const bandPath = (lo: Key, hi: Key) => {
  const up = trajectory
    .map((d, i) => `${i === 0 ? "M" : "L"}${fx(d.year).toFixed(1)},${fy(d[hi]).toFixed(1)}`)
    .join("");
  const down = [...trajectory]
    .reverse()
    .map((d) => `L${fx(d.year).toFixed(1)},${fy(d[lo]).toFixed(1)}`)
    .join("");
  return `${up}${down}Z`;
};

const Y_TICKS = [0, 0.5, 1, 1.5, 2, 2.5];
const X_TICKS = [2026, 2046, 2066, 2086, 2106, 2126];

export default function LevFanChart() {
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Rate of gain in remaining healthy life expectancy from ${YEAR_MIN} to ${YEAR_MAX}. The median crosses the escape-velocity threshold of 1.0 around ${countdown.medianYear}, with an 80 percent interval from ${countdown.earlyYear} to ${countdown.lateYear}.`}
      >
        {Y_TICKS.map((g) => (
          <g key={g}>
            <line
              x1={PAD.l}
              y1={fy(g)}
              x2={W - PAD.r}
              y2={fy(g)}
              stroke="#17202a"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
            <text
              x={PAD.l - 9}
              y={fy(g) + 3.5}
              textAnchor="end"
              fill="#17202a"
              fillOpacity={0.45}
              fontSize={10.5}
            >
              {g.toFixed(1)}
            </text>
          </g>
        ))}

        <path d={bandPath("p10", "p90")} fill="#2f766d" fillOpacity={0.16} />
        <path d={bandPath("p25", "p75")} fill="#2f766d" fillOpacity={0.26} />
        <path
          d={linePath("p50")}
          fill="none"
          stroke="#2f766d"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1={PAD.l}
          y1={fy(1)}
          x2={W - PAD.r}
          y2={fy(1)}
          stroke="#17202a"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text
          x={PAD.l + 8}
          y={fy(1) - 9}
          fill="#17202a"
          fillOpacity={0.7}
          fontSize={11}
          fontWeight={600}
        >
          escape velocity · 1.0
        </text>

        <line
          x1={PAD.l}
          y1={PAD.t + plotH}
          x2={W - PAD.r}
          y2={PAD.t + plotH}
          stroke="#17202a"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        {X_TICKS.map((year) => (
          <text
            key={year}
            x={fx(year)}
            y={PAD.t + plotH + 18}
            textAnchor="middle"
            fill="#17202a"
            fillOpacity={0.45}
            fontSize={10.5}
          >
            {year}
          </text>
        ))}
        <text x={PAD.l} y={H - 6} fill="#17202a" fillOpacity={0.45} fontSize={10.5}>
          healthy years gained per calendar year
        </text>
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#17202a]/60">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded bg-[#2f766d]" />
          median
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-4 rounded-sm bg-[#2f766d] opacity-[0.26]"
          />
          50% interval
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-4 rounded-sm bg-[#2f766d] opacity-[0.16]"
          />
          80% interval
        </span>
      </figcaption>
    </figure>
  );
}
