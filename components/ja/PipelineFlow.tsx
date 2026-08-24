type Props = {
  regulatoryScore: number;
  lastReviewed: string;
};

type Stage = { ja: string; en: string; gate?: boolean };

const STAGES: readonly Stage[] = [
  { ja: "研究", en: "Research" },
  { ja: "臨床試験", en: "Clinical Trials" },
  { ja: "規制", en: "Regulation", gate: true },
  { ja: "製造", en: "Manufacturing" },
  { ja: "社会実装", en: "Society" },
];

/**
 * The path a result has to travel before it moves the countdown, drawn
 * as five stages on one rail.
 *
 * Built from HTML rather than SVG because SVG text cannot reflow: five
 * Japanese labels in a fixed viewBox would shrink to a few pixels on a
 * phone. Here the rail simply turns vertical below `sm`.
 *
 * Every marker sits in the same 14px box so that its centre lands on the
 * rail in both orientations, and each marker is filled with the page
 * background so the rail passes behind it rather than through it.
 *
 * Only the regulation stage carries a number, and that is not an
 * editorial choice — it is the only stage the model scores. Inventing
 * figures for the other four to make the row look uniform is exactly the
 * kind of thing this diagram exists to avoid.
 */
export default function PipelineFlow({ regulatoryScore, lastReviewed }: Props) {
  return (
    <figure className="mt-8">
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute left-[6.5px] top-3 bottom-3 block w-px bg-black/12 sm:hidden"
        />
        <span
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-[7px] hidden h-px bg-black/12 sm:block"
        />

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-5 sm:gap-3">
          {STAGES.map((stage, index) => (
            <li
              key={stage.en}
              className="relative flex items-start gap-3.5 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
            >
              <span className="relative mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center sm:mt-0">
                {stage.gate ? (
                  <>
                    <span className="absolute inline-flex h-3.5 w-3.5 rounded-full border border-[#2f766d]/45 bg-[#f7f5ef]" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f766d]" />
                  </>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#17202a]/30 ring-4 ring-[#f7f5ef]" />
                )}
              </span>

              <div className="sm:mt-3">
                <p className="font-mono text-[10px] tabular-nums text-[#17202a]/40">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p
                  className={`mt-0.5 text-sm font-semibold leading-6 ${
                    stage.gate ? "text-[#2f766d]" : "text-[#17202a]"
                  }`}
                >
                  {stage.ja}
                </p>
                <p
                  lang="en"
                  className="text-[10px] font-medium tracking-[0.06em] text-[#17202a]/40"
                >
                  {stage.en}
                </p>

                {stage.gate ? (
                  <div className="mt-2.5 sm:mx-auto sm:max-w-[8.5rem]">
                    <p className="text-[10px] font-semibold text-[#2f766d]">
                      ボトルネック
                    </p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/8">
                      <div
                        className="readiness-bar-fill h-full rounded-full bg-[#2f766d]"
                        style={{ width: `${regulatoryScore}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-semibold tabular-nums text-[#17202a]">
                      {regulatoryScore}
                      <span className="font-normal text-[#17202a]/45">
                        {" "}
                        / 100
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <figcaption className="mt-6 max-w-2xl text-[11px] leading-5 text-[#17202a]/45">
        モデルが障壁としてスコア化しているのは「規制・社会実装の準備度」だけで、
        この値は規制から社会への普及までをまとめて評価したものです。研究、臨床試験、
        製造の3段階には個別のスコアを置いていません。最終確認 {lastReviewed}。
      </figcaption>
    </figure>
  );
}
