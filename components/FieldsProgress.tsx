import Link from "next/link";
import { fieldProgress } from "@/data/fields";

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

// No click navigation, no computed/official scoring — the bar fill is a
// one-time CSS transform animation (see .field-bar-fill in globals.css),
// not React state, so it never replays on filter interaction or re-render.
// Scores come straight from the PROVISIONAL data in data/fields.ts. This
// is a compact homepage summary only — full descriptions and per-field
// detail live on the dedicated /fields page.
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
          Provisional field taxonomy · Score pending for 4 of 8 fields
        </p>

        <div className="mt-5 space-y-4">
          {fieldProgress.map((field, index) =>
            field.status === "provisional" ? (
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
                        width: `${field.score}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  <p className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-[#17202a]">
                    {field.score}
                  </p>
                </div>
              </div>
            ) : (
              <div
                key={field.slug}
                className="flex items-center justify-between gap-4"
              >
                <p className="text-sm text-[#17202a]/75">{field.name}</p>
                <span className="shrink-0 rounded-full border border-black/15 bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#17202a]/55">
                  Score pending
                </span>
              </div>
            )
          )}
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
