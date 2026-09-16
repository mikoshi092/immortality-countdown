import Link from "next/link";
import HeroCountdown from "./HeroCountdown";
import HeroVisual from "./HeroVisual";
import { countdown, heroEarlyYears } from "@/lib/countdown";

export default function Hero() {
  return (
    <section className="px-5 pt-10 pb-8 font-sans sm:px-6 sm:pt-12 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_30rem]">
          <div className="@container">
            <h1 className="font-serif text-4xl leading-[0.96] tracking-[-0.03em] text-[#17202a] sm:text-5xl md:text-6xl lg:text-7xl">
              Immortality Countdown
            </h1>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:mt-10 sm:text-xs">
              As early as
            </p>

            <p className="mt-1.5 flex max-w-full items-baseline gap-[0.32em] whitespace-nowrap sm:mt-2">
              <span className="font-serif lining-nums tabular-nums text-[clamp(3.13rem,13.8vw,8.1rem)] font-normal leading-none tracking-[-0.06em] text-[#17202a] [font-variant-numeric:lining-nums_tabular-nums] [font-feature-settings:'lnum'_1,'tnum'_1]">
                <HeroCountdown />
                <span className="sr-only">{heroEarlyYears}</span>
              </span>
              <span className="text-[clamp(1.2rem,4.5vw,2.55rem)] font-medium tracking-[0.28em] text-[#17202a]/42">
                YEARS
              </span>
            </p>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#17202a]/65 sm:mt-6 sm:text-lg">
              Until medical progress may begin to outrun biological aging.
            </p>

            {countdown.isComputed && (
              <p className="mt-3 max-w-md text-sm leading-6 text-[#17202a]/55">
                Early LEV scenario (P10): {countdown.earlyYear} — {heroEarlyYears}{" "}
                years from the model&apos;s {countdown.baseYear} baseline.
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link
                href="/model"
                className="inline-block w-fit border-b border-[#2f766d] pb-1 text-sm font-semibold text-[#2f766d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
              >
                How this early scenario is calculated →
              </Link>
              <Link
                href="/methodology"
                className="inline-block w-fit pb-1 text-sm font-medium text-[#17202a]/55 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
              >
                Methodology
              </Link>
            </div>
          </div>

          <HeroVisual earlyYear={countdown.earlyYear} locale="en" />
        </div>
      </div>
    </section>
  );
}
