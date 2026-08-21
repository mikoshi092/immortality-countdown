import { REGULATORY_READINESS } from "@/lib/model-snapshot";

// Progress-bar fill animation (0 → full width, 1.6s, reduced-motion aware)
// is defined as a CSS-only keyframe in app/globals.css under the class
// `.readiness-bar-fill` — no JS is used, so there is no hydration risk
// and the animation does not replay on re-render. The bar's real width
// is set inline below from lev/params.json, not by the animation, so the
// correct final size renders even if the animation never runs.
export default function ReadinessCard() {
  return (
    <section className="px-5 pb-2 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-sm font-medium text-[#17202a]/80">
                {REGULATORY_READINESS.label}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/55">
                Model input · Last reviewed {REGULATORY_READINESS.lastReviewed}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
              <div
                className="readiness-bar-fill h-full rounded-full bg-[#2f766d]"
                style={{ width: `${REGULATORY_READINESS.score}%` }}
              />
            </div>
            <p className="shrink-0 text-lg font-semibold tabular-nums text-[#17202a] sm:text-xl">
              {REGULATORY_READINESS.score} <span className="text-sm font-normal text-[#17202a]/45">/ 100</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
