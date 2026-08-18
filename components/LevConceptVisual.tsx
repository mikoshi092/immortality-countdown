"use client";

import { useEffect, useRef, useState } from "react";

const AGING_PATH = "M 44,142 L 278,108";
const PROGRESS_PATH =
  "M 44.0,142.0 L 52.4,141.7 L 60.7,141.3 L 69.1,140.9 L 77.4,140.4 L 85.8,139.9 L 94.1,139.2 L 102.5,138.4 L 110.9,137.6 L 119.2,136.5 L 127.6,135.4 L 135.9,134.0 L 144.3,132.4 L 152.6,130.5 L 161.0,128.4 L 169.4,125.9 L 177.7,123.0 L 186.1,119.7 L 194.4,115.8 L 202.8,111.3 L 211.1,106.1 L 219.5,100.0 L 227.9,93.0 L 236.2,84.9 L 244.6,75.4 L 252.9,64.5 L 261.3,51.8 L 269.6,37.1 L 278.0,20.0";

const SVG_FONT =
  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";

export default function LevConceptVisual() {
  const rootRef = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={rootRef}
      className={`lev-concept-visual w-full bg-transparent font-sans ${drawn ? "is-drawn" : ""}`}
      aria-labelledby="lev-concept-title"
      aria-describedby="lev-concept-note"
    >
      <figcaption
        id="lev-concept-title"
        className="text-[11px] font-semibold leading-4 tracking-[0.01em] text-[#17202a]/70"
      >
        When progress outpaces aging
      </figcaption>

      <div className="lev-plot-reveal mt-1.5 bg-transparent">
        <svg
          viewBox="0 0 300 176"
          className="h-auto w-full bg-transparent"
          role="img"
          aria-labelledby="lev-svg-title"
          aria-describedby="lev-svg-desc"
        >
          <title id="lev-svg-title">
            Conceptual diagram of longevity escape velocity
          </title>
          <desc id="lev-svg-desc">
            A modest gray line labeled Passage of time / aging rises steadily.
            A solid teal curve labeled Medical progress starts gradually, then
            steepens exponentially and crosses the gray line at a point labeled
            LEV. The chart illustrates the idea of medical progress outpacing
            aging. It is not a forecast or measured data.
          </desc>

          <line
            x1="36"
            y1="18"
            x2="36"
            y2="148"
            stroke="#17202a"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
          <line
            x1="36"
            y1="148"
            x2="292"
            y2="148"
            stroke="#17202a"
            strokeOpacity="0.14"
            strokeWidth="1"
          />

          <text
            className="lev-halo-text"
            x="11"
            y="82"
            textAnchor="middle"
            fill="#17202a"
            fillOpacity="0.45"
            fontSize="8"
            fontFamily={SVG_FONT}
            transform="rotate(-90 11 82)"
          >
            Healthy lifespan gained
          </text>
          <text
            className="lev-halo-text"
            x="48"
            y="164"
            fill="#17202a"
            fillOpacity="0.48"
            fontSize="8"
            fontFamily={SVG_FONT}
          >
            Passage of time / aging
          </text>
          <text
            className="lev-halo-text"
            x="268"
            y="164"
            textAnchor="end"
            fill="#17202a"
            fillOpacity="0.45"
            fontSize="8"
            fontFamily={SVG_FONT}
          >
            Time
          </text>

          <path
            d={AGING_PATH}
            fill="none"
            stroke="#17202a"
            strokeOpacity="0.32"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          <path
            d={PROGRESS_PATH}
            fill="none"
            stroke="#2f766d"
            strokeWidth="2.05"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <text
            className="lev-halo-text"
            x="214"
            y="32"
            fill="#2f766d"
            fontSize="8"
            fontFamily={SVG_FONT}
          >
            Medical progress
          </text>

          <g transform="translate(178 123)">
            <circle
              className="lev-pulse-ring"
              r="6"
              fill="none"
              stroke="#2f766d"
              strokeWidth="1.5"
            />
            <circle className="lev-dot-core" r="3.2" fill="#2f766d" />
            <text
              className="lev-label lev-halo-text"
              x="14"
              y="-11"
              fill="#2f766d"
              fontSize="9"
              fontWeight="600"
              fontFamily={SVG_FONT}
            >
              LEV
            </text>
          </g>
        </svg>
      </div>

      <p
        id="lev-concept-note"
        className="mt-1.5 text-[10px] leading-4 text-[#17202a]/45"
      >
        Illustrative concept — not a forecast or measured data.
      </p>
    </figure>
  );
}
