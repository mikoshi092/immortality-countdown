import { fieldProgress } from "@/data/fields";

// No click navigation, no computed/official scoring — the bar fill is a
// one-time CSS transform animation (see .field-bar-fill in globals.css),
// not React state, so it never replays on filter interaction or re-render.
// Scores come straight from the PROVISIONAL data in data/fields.ts.
export default function FieldsProgress() {
  return (
    <section className="px-5 pt-3 pb-8 sm:px-6 sm:pt-4 sm:pb-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17202a]/70">
          Eight Fields of Progress
        </h2>
        <p className="mt-1 text-[11px] text-[#17202a]/40">
          Provisional data · 4 of 8 fields shown
        </p>

        <div className="mt-5 space-y-4">
          {fieldProgress.map((field, index) => (
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
                    className="field-bar-fill h-full w-full origin-left rounded-full bg-[#2f766d]"
                    style={
                      {
                        "--field-target": field.score / 100,
                        animationDelay: `${index * 100}ms`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <p className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-[#17202a]">
                  {field.score}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
