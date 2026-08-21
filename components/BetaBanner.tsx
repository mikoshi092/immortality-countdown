export default function BetaBanner() {
  return (
    <div className="border-b border-white/10 bg-[#141413]">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#2f766d]"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
            Public Beta
          </span>
        </span>
        <p className="text-[11px] leading-4 text-white/55 sm:text-xs">
          The countdown model and news pipeline are under development.
          Scores are model inputs and may change as evidence is reviewed.
        </p>
      </div>
    </div>
  );
}
