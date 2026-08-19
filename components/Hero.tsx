import Link from "next/link";
import Image from "next/image";
import HeroCountdown from "./HeroCountdown";
import LevConceptVisual from "./LevConceptVisual";
import { countdown, formatPercent } from "@/lib/countdown";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-transparent px-5 pt-10 pb-10 font-sans sm:px-6 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-[42%] max-w-[13.5rem] items-center justify-end overflow-hidden sm:w-[38%] sm:max-w-[17rem] md:w-[34%] md:max-w-[22rem] lg:max-w-[24rem]"
      >
        {/* Was a 1.4 MB, 937×1678 source for a slot that is never wider than
            ~384 CSS px, with no `sizes`, so next/image built a srcset around
            the intrinsic width and shipped far more pixels than the layout
            could use. Now 768 px wide (2× the largest slot), grayscale,
            palette-quantised, and told what size it actually renders at. */}
        <Image
          src="/dna-helix-sketch.png"
          alt=""
          width={768}
          height={1375}
          sizes="(min-width: 1024px) 24rem, (min-width: 768px) 22rem, (min-width: 640px) 17rem, 13.5rem"
          className="pointer-events-none h-[92%] w-auto max-h-[36rem] origin-center rotate-[18deg] object-contain opacity-[0.13] sm:max-h-[42rem] md:h-[108%] md:max-h-none md:translate-x-[8%]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
          A provisional longevity estimate
        </p>

        <h1 className="mt-4 font-serif text-4xl leading-[0.96] tracking-[-0.03em] text-[#17202a] sm:mt-5 sm:text-5xl md:text-6xl lg:text-7xl">
          Immortality Countdown
        </h1>

        <div className="mt-7 flex flex-col md:mt-9 md:flex-row md:items-start md:gap-16 lg:mt-10 lg:gap-24">
          <div className="contents min-w-0 md:block">
            <p className="order-1 flex max-w-full items-baseline gap-[0.32em] whitespace-nowrap">
              <span className="font-serif lining-nums tabular-nums text-[clamp(3.13rem,13.8vw,8.1rem)] font-normal leading-none tracking-[-0.06em] text-[#17202a] [font-variant-numeric:lining-nums_tabular-nums] [font-feature-settings:'lnum'_1,'tnum'_1]">
                <HeroCountdown />
                <span className="sr-only">{countdown.years}</span>
              </span>
              <span className="text-[clamp(1.2rem,4.5vw,2.55rem)] font-medium tracking-[0.28em] text-[#17202a]/42">
                YEARS
              </span>
            </p>

            <p className="order-3 mt-5 max-w-md text-[15px] leading-7 text-[#17202a]/65 sm:mt-6 sm:text-lg md:order-none">
              Until medical progress may begin to outrun biological aging.
            </p>

            {/* A bare point estimate implies a precision the evidence does not
                support. The interval is the honest headline, and it is also
                the more interesting one. */}
            {countdown.isComputed && (
              <p className="order-3 mt-3 max-w-md text-sm leading-6 text-[#17202a]/55 md:order-none">
                Median of {countdown.draws.toLocaleString()} simulations —
                central estimate {countdown.medianYear}, 80% interval{" "}
                <span className="font-semibold text-[#17202a]/75">
                  {countdown.earlyYear}–{countdown.lateYear}
                </span>
                . {formatPercent(countdown.probabilityReached)} of runs reach it
                at all.
              </p>
            )}

            <div className="order-4 mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 md:order-none">
              <Link
                href="/model"
                className="inline-block w-fit border-b border-[#2f766d] pb-1 text-sm font-semibold text-[#2f766d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
              >
                Why {countdown.years} years? →
              </Link>
              <Link
                href="/methodology"
                className="inline-block w-fit pb-1 text-sm font-medium text-[#17202a]/55 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
              >
                Methodology
              </Link>
            </div>
          </div>

          <div className="order-2 mt-8 w-full max-w-[18rem] md:order-none md:mt-2 md:w-[17.5rem] md:shrink-0">
            <LevConceptVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
