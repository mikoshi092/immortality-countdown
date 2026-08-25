import Image from "next/image";

type Props = {
  earlyYear: number;
};

/**
 * The hero illustration.
 *
 * Referenced by public path with `fill`, so the box is reserved by the
 * square wrapper and the intrinsic size is never needed. The source is
 * 3:2 with the figure hard right and a wide empty field to its left, so
 * `object-right` crops that field away and leaves the subject filling
 * the frame. Nothing about the layout depends on the image loading.
 *
 * `preload` rather than `priority` — Next 16 deprecated the latter in
 * favour of the former, and this is the page's only above-the-fold
 * image, so it is the one place on the site where preloading is correct.
 *
 * The left edge is masked into a fade instead of being cut square. The
 * crop line falls through scattered particles, and the illustration's
 * own cream is a shade warmer than the page (#f7f0e8 against #f7f5ef),
 * so a hard edge would read as a pasted-in rectangle. The fade lets it
 * bleed into the page the way a printed feature does.
 */
export default function HeroVisual({ earlyYear }: Props) {
  return (
    <figure className="flex flex-col gap-5">
      {/* Stacked above the artwork rather than laid over its top-right
          corner. The sage disc in the illustration runs out to x=988 of
          1024 below y≈70, so an overlay there would sit on it at most
          widths — and would have to be re-checked against the crop every
          time the artwork is redrawn. Above the frame it cannot collide.

          lg and up only: in the single-column layout the illustration
          lands directly above the stats strip, which already gives the
          median year in words. */}
      <figcaption className="hidden text-right lg:block">
        <p className="font-ja-serif text-[clamp(2.2rem,3.2vw,3.1rem)] font-medium leading-none tabular-nums text-[#2f766d]">
          {earlyYear}
        </p>
        <p
          lang="en"
          className="mt-2 text-[9px] font-semibold tracking-[0.18em] text-[#17202a]/45"
        >
          EARLY 10% LEV YEAR
        </p>
      </figcaption>

      <div className="relative aspect-square w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_18%)]">
        <Image
          src="/ja/hero-lev.jpg"
          alt="横顔の人物像に二重らせんと点描のデータ図が重なった抽象イラスト。医学と生物学のデータが人の身体に重なっていく様子を表しています。"
          fill
          preload
          sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 22rem, 100vw"
          className="object-cover object-right"
        />
      </div>
    </figure>
  );
}
