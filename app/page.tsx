export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Immortality Countdown
          </p>

          <nav className="hidden gap-8 text-sm text-black/60 md:flex">
            <a href="#progress">Progress</a>
            <a href="#news">News</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-center px-6 py-24">
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#315c52]">
          A conservative scientific estimate
        </p>

        <h1 className="font-serif text-6xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-9xl">
          Immortality
          <br />
          Countdown
        </h1>

        <div className="mt-16 grid gap-10 border-t border-black/15 pt-10 md:grid-cols-2">
          <p className="text-7xl font-light tracking-[-0.06em] sm:text-8xl">
            28
            <span className="ml-4 text-2xl tracking-normal text-black/45">
              YEARS
            </span>
          </p>

          <div>
            <h2 className="text-2xl leading-snug">
              Until medical technology begins to outrun aging.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-black/60">
              A transparent, conservative estimate of humanity&apos;s progress
              toward Longevity Escape Velocity. This is not a promise of
              immortality.
            </p>

            <a
              className="mt-8 inline-block border-b border-black pb-1 text-sm font-semibold"
              href="#about"
            >
              Why 28 years?
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white" id="progress">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#315c52]">
            Research observatory
          </p>

          <h2 className="mt-5 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
            Tracking the science that could change the trajectory of human aging.
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24" id="about">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#315c52]">
          About the estimate
        </p>

        <h2 className="mt-5 font-serif text-4xl tracking-tight sm:text-5xl">
          Hope requires evidence.
        </h2>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-black/60">
          Immortality Countdown is an independent project observing how close
          humanity may be to controlling biological aging. The countdown is a
          model, not medical advice or a guarantee of individual lifespan.
        </p>
      </section>
    </main>
  );
}