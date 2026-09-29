type MapField = {
  id: string;
  label: string;
  score: number;
};

type Props = {
  fields: MapField[];
  earlyYear: number;
};

const CX = 430;
const CY = 210;
const R = 54;
const LEFT_X = 262;
const RIGHT_X = 598;
const ROWS = [54, 158, 262, 366];

/**
 * The eight fields drawn as tracks converging on LEV.
 *
 * Each track is a faint full-length line with a teal segment laid over
 * it, and the teal covers exactly `score` percent of the distance to the
 * centre — `pathLength={100}` normalises every curve to 100 units, so
 * the dash length is the score with no conversion. That makes the score
 * the geometry rather than a caption next to it, and it stays honest
 * when the numbers move.
 *
 * Four fields a side rather than eight around a circle: Japanese labels
 * are long, and a true radial layout would put them at angles where they
 * either collide or need rotating.
 *
 * Hidden below `lg`. SVG text does not reflow, so at phone widths these
 * labels would scale down to a few pixels — and the eight cards directly
 * beneath already carry the same names and the same scores, so nothing
 * is lost by leaving the map out there.
 */
export default function TechnologyMap({ fields, earlyYear }: Props) {
  return (
    <figure className="mt-10 hidden lg:block">
      <svg
        viewBox="0 0 860 420"
        className="mx-auto h-auto w-full max-w-4xl"
        role="img"
        aria-labelledby="ja-tech-map-title"
        aria-describedby="ja-tech-map-desc"
      >
        <title id="ja-tech-map-title">
          8つの研究分野とLEVの関係図
        </title>
        <desc id="ja-tech-map-desc">
          8分野が左右に4つずつ並び、それぞれが中央のLEVへ線でつながっています。
          線の塗られている長さが、その分野の現在の成熟度スコアにあたります。
          {fields.map((f) => `${f.label}は${f.score}。`).join("")}
        </desc>

        {fields.map((field, index) => {
          const isLeft = index < 4;
          const y = ROWS[index % 4];
          const nodeX = isLeft ? LEFT_X : RIGHT_X;
          const edgeX = isLeft ? CX - R : CX + R;
          const c1X = isLeft ? nodeX + 60 : nodeX - 60;
          const c2X = isLeft ? edgeX - 32 : edgeX + 32;
          const track = `M ${nodeX},${y} C ${c1X},${y} ${c2X},${CY} ${edgeX},${CY}`;

          const lines = splitLabel(field.label);
          const textX = isLeft ? nodeX - 16 : nodeX + 16;
          const anchor = isLeft ? "end" : "start";
          const firstLineY = lines.length > 1 ? y - 14 : y - 3;

          return (
            <g key={field.id}>
              <path
                d={track}
                fill="none"
                stroke="#17202a"
                strokeOpacity="0.12"
                strokeWidth="1.6"
              />
              <path
                d={track}
                fill="none"
                stroke="#2f766d"
                strokeWidth="2.2"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${field.score} 100`}
              />

              <circle cx={nodeX} cy={y} r="5" fill="#2f766d" />

              {lines.map((line, i) => (
                <text
                  key={line}
                  x={textX}
                  y={firstLineY + i * 17}
                  textAnchor={anchor}
                  fill="#17202a"
                  fontSize="14"
                  fontWeight="600"
                >
                  {line}
                </text>
              ))}

              <text
                x={textX}
                y={firstLineY + lines.length * 17 + 2}
                textAnchor={anchor}
                fill="#17202a"
                fillOpacity="0.45"
                fontSize="12"
                className="tabular-nums"
              >
                {field.score} / 100
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={R} fill="#2f766d" />
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="25"
          fontWeight="600"
          letterSpacing="0.04em"
        >
          LEV
        </text>
        <text
          x={CX}
          y={CY + 23}
          textAnchor="middle"
          fill="#ffffff"
          fillOpacity="0.75"
          fontSize="12"
          className="tabular-nums"
        >
          {earlyYear}年
        </text>
      </svg>

      <figcaption className="mx-auto mt-4 max-w-2xl text-center text-[11px] leading-5 text-[#17202a]/45">
        線の塗られた長さが各分野の現在の成熟度スコアです。中央の年は早期シナリオで、
        8分野の合計や平均ではありません。
      </figcaption>
    </figure>
  );
}

/**
 * Long field names are broken at their own 「・」 rather than at a fixed
 * character count, and never shortened into a second set of Japanese
 * names — a parallel label list would drift out of step with the model
 * taxonomy the moment either side changed.
 */
function splitLabel(label: string): string[] {
  if (label.length <= 8) return [label];

  const at = label.indexOf("・");
  if (at < 0 || at === label.length - 1) return [label];

  return [label.slice(0, at + 1), label.slice(at + 1)];
}
