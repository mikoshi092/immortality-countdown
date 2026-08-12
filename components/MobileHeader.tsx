export default function MobileHeader() {
  return (
    <header className="bg-[#141413]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2.5">
          {/* Same mark/path as app/icon.svg (the site favicon), reused
              here without its black square backing — the header's own
              near-black background already provides that contrast, and
              the stroke is already white, so no color inversion is
              needed. The favicon file itself is untouched. */}
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M10 32
                 C10 18 24 18 32 32
                 C40 46 54 46 54 32
                 C54 18 40 18 32 32
                 C24 46 10 46 10 32"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] leading-none text-white/90 sm:text-sm">
            immortality countdown
          </span>
        </div>

        <div
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-white/85"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </header>
  );
}
