import HeroCountdown from "./HeroCountdown";

// Original inline SVG double-helix watermark, hand-generated as a
// sine-wave polyline approximation (not a copied/traced asset).
const STRAND_A_PATH =
  "M 100,0 L 108.5,8 L 116.4,16 L 123.3,24 L 128.7,32 L 132.3,40 L 133.9,48 L 133.4,56 L 130.8,64 L 126.2,72 L 120,80 L 112.5,88 L 104.3,96 L 95.7,104 L 87.5,112 L 80,120 L 73.8,128 L 69.2,136 L 66.6,144 L 66.1,152 L 67.7,160 L 71.3,168 L 76.7,176 L 83.6,184 L 91.5,192 L 100,200 L 108.5,208 L 116.4,216 L 123.3,224 L 128.7,232 L 132.3,240 L 133.9,248 L 133.4,256 L 130.8,264 L 126.2,272 L 120,280 L 112.5,288 L 104.3,296 L 95.7,304 L 87.5,312 L 80,320 L 73.8,328 L 69.2,336 L 66.6,344 L 66.1,352 L 67.7,360 L 71.3,368 L 76.7,376 L 83.6,384 L 91.5,392 L 100,400 L 108.5,408 L 116.4,416 L 123.3,424 L 128.7,432 L 132.3,440 L 133.9,448 L 133.4,456 L 130.8,464 L 126.2,472 L 120,480 L 112.5,488 L 104.3,496 L 95.7,504 L 87.5,512 L 80,520 L 73.8,528 L 69.2,536 L 66.6,544 L 66.1,552 L 67.7,560 L 71.3,568 L 76.7,576 L 83.6,584 L 91.5,592 L 100,600 L 108.5,608 L 116.4,616 L 123.3,624 L 128.7,632 L 132.3,640 L 133.9,648 L 133.4,656 L 130.8,664 L 126.2,672 L 120,680 L 112.5,688 L 104.3,696 L 95.7,704 L 87.5,712 L 80,720 L 73.8,728 L 69.2,736 L 66.6,744 L 66.1,752 L 67.7,760 L 71.3,768 L 76.7,776 L 83.6,784 L 91.5,792 L 100,800 L 108.5,808 L 116.4,816";

const STRAND_B_PATH =
  "M 100,0 L 91.5,8 L 83.6,16 L 76.7,24 L 71.3,32 L 67.7,40 L 66.1,48 L 66.6,56 L 69.2,64 L 73.8,72 L 80,80 L 87.5,88 L 95.7,96 L 104.3,104 L 112.5,112 L 120,120 L 126.2,128 L 130.8,136 L 133.4,144 L 133.9,152 L 132.3,160 L 128.7,168 L 123.3,176 L 116.4,184 L 108.5,192 L 100,200 L 91.5,208 L 83.6,216 L 76.7,224 L 71.3,232 L 67.7,240 L 66.1,248 L 66.6,256 L 69.2,264 L 73.8,272 L 80,280 L 87.5,288 L 95.7,296 L 104.3,304 L 112.5,312 L 120,320 L 126.2,328 L 130.8,336 L 133.4,344 L 133.9,352 L 132.3,360 L 128.7,368 L 123.3,376 L 116.4,384 L 108.5,392 L 100,400 L 91.5,408 L 83.6,416 L 76.7,424 L 71.3,432 L 67.7,440 L 66.1,448 L 66.6,456 L 69.2,464 L 73.8,472 L 80,480 L 87.5,488 L 95.7,496 L 104.3,504 L 112.5,512 L 120,520 L 126.2,528 L 130.8,536 L 133.4,544 L 133.9,552 L 132.3,560 L 128.7,568 L 123.3,576 L 116.4,584 L 108.5,592 L 100,600 L 91.5,608 L 83.6,616 L 76.7,624 L 71.3,632 L 67.7,640 L 66.1,648 L 66.6,656 L 69.2,664 L 73.8,672 L 80,680 L 87.5,688 L 95.7,696 L 104.3,704 L 112.5,712 L 120,720 L 126.2,728 L 130.8,736 L 133.4,744 L 133.9,752 L 132.3,760 L 128.7,768 L 123.3,776 L 116.4,784 L 108.5,792 L 100,800 L 91.5,808 L 83.6,816";

const RUNGS: [number, number, number, number][] = [
  [123.3, 24, 76.7, 24], [133.9, 48, 66.1, 48], [126.2, 72, 73.8, 72], [104.3, 96, 95.7, 96],
  [80, 120, 120, 120], [66.6, 144, 133.4, 144], [71.3, 168, 128.7, 168], [91.5, 192, 108.5, 192],
  [116.4, 216, 83.6, 216], [132.3, 240, 67.7, 240], [130.8, 264, 69.2, 264], [112.5, 288, 87.5, 288],
  [87.5, 312, 112.5, 312], [69.2, 336, 130.8, 336], [67.7, 360, 132.3, 360], [83.6, 384, 116.4, 384],
  [108.5, 408, 91.5, 408], [128.7, 432, 71.3, 432], [133.4, 456, 66.6, 456], [120, 480, 80, 480],
  [95.7, 504, 104.3, 504], [73.8, 528, 126.2, 528], [66.1, 552, 133.9, 552], [76.7, 576, 123.3, 576],
  [123.3, 624, 76.7, 624], [133.9, 648, 66.1, 648], [126.2, 672, 73.8, 672], [104.3, 696, 95.7, 696],
  [80, 720, 120, 720], [66.6, 744, 133.4, 744], [71.3, 768, 128.7, 768], [91.5, 792, 108.5, 792],
  [116.4, 816, 83.6, 816],
];

function DnaWatermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 820"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d={STRAND_A_PATH} fill="none" stroke="#17202a" strokeWidth="2.2" />
      <path d={STRAND_B_PATH} fill="none" stroke="#17202a" strokeWidth="2.2" />
      {RUNGS.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#17202a" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 md:pt-20 md:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-0 h-full w-[260px] -rotate-[18deg] opacity-[0.12] sm:-right-12 sm:w-[320px] md:w-[380px]"
      >
        <DnaWatermark />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
          A conservative scientific estimate
        </p>

        <h1 className="mt-5 font-serif text-4xl leading-[0.98] tracking-[-0.03em] text-[#17202a] sm:text-6xl md:text-7xl">
          Immortality Countdown
        </h1>

        <p className="mt-10 text-7xl font-light leading-none tracking-[-0.04em] text-[#17202a] sm:mt-12 sm:text-8xl md:text-9xl">
          <HeroCountdown />
          <span className="sr-only">28</span>{" "}
          <span className="text-2xl font-normal tracking-[0.05em] text-[#17202a]/50 sm:text-3xl">
            YEARS
          </span>
        </p>

        <p className="mt-6 max-w-md text-base leading-7 text-[#17202a]/65 sm:text-lg">
          Until medical progress may begin to outrun biological aging.
        </p>

        {/* Placeholder anchor — no methodology page exists in this Preview */}
        <a
          href="#"
          className="mt-6 inline-block border-b border-[#17202a] pb-1 text-sm font-semibold text-[#17202a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
        >
          Why 28 years? →
        </a>
      </div>
    </section>
  );
}
