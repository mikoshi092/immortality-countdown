import Link from "next/link";
import { fieldProgress } from "@/data/fields";
import { getFieldModel } from "@/lib/model-snapshot";

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

// No click navigation, no computed/official scoring — the bar fill is a
// one-time CSS transform animation (see .field-bar-fill in globals.css),
// not React state, so it never replays on filter interaction or re-render.
// Displayed scores come from lev/params.json through lib/model-snapshot.ts,
// so this homepage cannot drift from the published model. Long-form prose
// remains in data/fields.ts.
export default function FieldsProgress() {
  return (
    <section
      id="eight-fields"
      className="scroll-mt-20 px-5 pt-3 pb-8 sm:px-6 sm:pt-4 sm:pb-10"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
          Eight Fields of Progress
        </h2>
        <p className="mt-1 text-[11px] text-[#17202a]/40">
          Current model readiness scores · 8 of 8 fields scored
        </p>

        <div className="mt-5 space-y-4">
          {fieldProgress.map((field, index) => {
            const modelField = getFieldModel(field.slug);
            return (
              <div
                key={field.slug}
                className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <p className="text-sm text-[#17202a]/75 sm:w-56 sm:shrink-0">
                  {field.name}
                </p>
                <div className="flex w-full items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                    <div
                      className="field-bar-fill h-full origin-left rounded-full bg-[#2f766d]"
                      style={{
                        width: `${modelField.score}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  <p className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-[#17202a]">
                    {modelField.score}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Link
            href="/fields"
            className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
          >
            Explore all eight fields →
          </Link>
        </div>
      </div>
    </section>
  );
}
