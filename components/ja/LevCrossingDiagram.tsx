type Props = {
  /** Healthy years the model says medicine returns per calendar year today. */
  currentGain: number;
  /** The rate at which medicine keeps pace with time. 1.0 yr/yr. */
  threshold: number;
};

const X0 = 46;
const X1 = 302;
const Y_BASE = 134;
const Y_TOP = 26;

/** Where along the width the curve meets the threshold line. */
const CROSS_T = 0.72;

/**
 * The gain-rate readout as a concept diagram.
 *
 * A bar told the reader that 0.22 is some fraction of 1.00. It could not
 * show the thing the section is actually about: that 1.00 yr/yr is the
 * speed time itself runs at, and that LEV is the moment the curve meets
 * that line rather than a date on a calendar.
 *
 * The curve is a true exponential and leaves through the top of the
 * frame. Compounding returns are the whole premise of the LEV argument —
 * a curve that levelled off would be drawing the opposite claim — and it
 * matches the English concept diagram on the home page.
 *
 * The frame is derived from the curve rather than fixed: the ceiling is
 * whatever the exponential reaches at the right-hand edge, so the plot
 * is always exactly tall enough and the shape stays identical whatever
 * the model reports. Only the two endpoints are model output — where the
 * curve starts and the height of the line it has to reach. The path
 * between them is drawn, not forecast, which is what the caption says.
 */
export default function LevCrossingDiagram({ currentGain, threshold }: Props) {
  // Purely numerical guard. The section's copy assumes we are still short
  // of the threshold; this only keeps the logarithm finite and positive
  // if the model ever reports otherwise.
  const start = Math.min(
    Math.max(currentGain, threshold * 0.02),
    threshold * 0.95
  );

  const k = Math.log(threshold / start) / CROSS_T;
  const ceiling = start * Math.exp(k);

  const toX = (t: number) => X0 + t * (X1 - X0);
  const toY = (v: number) => Y_BASE - (v / ceiling) * (Y_BASE - Y_TOP);

  const STEPS = 64;
  const curve = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    const v = start * Math.exp(k * t);
    return `${i === 0 ? "M" : "L"} ${toX(t).toFixed(1)},${toY(v).toFixed(1)}`;
  }).join(" ");

  const thresholdY = toY(threshold);
  const startY = toY(start);
  const crossX = toX(CROSS_T);

  return (
    <svg
      viewBox="0 0 320 176"
      className="h-auto w-full"
      role="img"
      aria-labelledby="ja-lev-cross-title"
      aria-describedby="ja-lev-cross-desc"
    >
      <title id="ja-lev-cross-title">
        医学が取り戻す健康寿命と時間の経過が交差する概念図
      </title>
      <desc id="ja-lev-cross-desc">
        横軸は時間、縦軸は1年あたりに得られる健康寿命です。時間の経過を表す
        水平の破線が{threshold.toFixed(2)}年/年の高さに引かれ、医学の進歩を表す
        緑の曲線が現在の{currentGain.toFixed(2)}年/年から指数関数的に立ち上がって
        この線と交差し、さらに上へ抜けていきます。交差点がLEVです。
        曲線の形は説明のための概念図であり、予測ではありません。
      </desc>

      <line
        x1={X0}
        y1={Y_TOP - 6}
        x2={X0}
        y2={Y_BASE}
        stroke="#17202a"
        strokeOpacity="0.14"
      />
      <line
        x1={X0}
        y1={Y_BASE}
        x2={X1 + 8}
        y2={Y_BASE}
        stroke="#17202a"
        strokeOpacity="0.14"
      />

      {/* Time's own pace. Everything below this line is losing ground. */}
      <line
        x1={X0}
        y1={thresholdY}
        x2={X1}
        y2={thresholdY}
        stroke="#17202a"
        strokeOpacity="0.42"
        strokeWidth="1.1"
        strokeDasharray="4 3"
      />
      <text
        x={X0 + 4}
        y={thresholdY - 7}
        fill="#17202a"
        fillOpacity="0.6"
        fontSize="10"
      >
        時間の経過（1年に1年）
      </text>
      <text
        x={X1}
        y={thresholdY - 7}
        textAnchor="end"
        fill="#17202a"
        fillOpacity="0.6"
        fontSize="10"
        className="tabular-nums"
      >
        {threshold.toFixed(2)}
      </text>

      <text
        x={X1 - 50}
        y={Y_TOP + 22}
        textAnchor="end"
        fill="#2f766d"
        fontSize="10"
      >
        医学が取り戻す健康寿命
      </text>

      <path
        d={curve}
        fill="none"
        stroke="#2f766d"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Drops the starting value onto the axis so its label can sit
          below the frame — an exponential leaves no room beside it. */}
      <line
        x1={X0}
        y1={startY}
        x2={X0}
        y2={Y_BASE}
        stroke="#2f766d"
        strokeOpacity="0.3"
        strokeDasharray="2 3"
      />
      <circle cx={X0} cy={startY} r="3.4" fill="#2f766d" />
      <text x={X0 - 4} y={Y_BASE + 16} fill="#17202a" fillOpacity="0.7" fontSize="10">
        現在
        <tspan className="tabular-nums"> {currentGain.toFixed(2)}</tspan>
      </text>

      <circle
        cx={crossX}
        cy={thresholdY}
        r="6.5"
        fill="none"
        stroke="#2f766d"
        strokeWidth="1.3"
        strokeOpacity="0.55"
      />
      <circle cx={crossX} cy={thresholdY} r="3.6" fill="#2f766d" />
      <text
        x={crossX + 11}
        y={thresholdY + 16}
        fill="#2f766d"
        fontSize="11"
        fontWeight="600"
      >
        LEV
      </text>

      <text
        x={X1 + 8}
        y={Y_BASE + 16}
        textAnchor="end"
        fill="#17202a"
        fillOpacity="0.45"
        fontSize="9"
      >
        時間 →
      </text>
    </svg>
  );
}
