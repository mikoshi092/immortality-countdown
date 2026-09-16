import Image from "next/image";

type Locale = "en" | "ja";

type Props = {
  earlyYear: number;
  locale: Locale;
};

const COPY: Record<
  Locale,
  { alt: string; caption: string; yearClass: string }
> = {
  en: {
    alt: "Abstract illustration of a profile overlaid with a double helix and dotted data figures.",
    caption: "EARLY LEV SCENARIO",
    yearClass:
      "font-serif text-[clamp(2.2rem,3.2vw,3.1rem)] font-medium leading-none tabular-nums text-[#2f766d]",
  },
  ja: {
    alt: "横顔の人物像に二重らせんと点描のデータ図が重なった抽象イラスト。医学と生物学のデータが人の身体に重なっていく様子を表しています。",
    caption: "早期シナリオ",
    yearClass:
      "font-ja-serif text-[clamp(2.2rem,3.2vw,3.1rem)] font-medium leading-none tabular-nums text-[#2f766d]",
  },
};

/**
 * Shared hero illustration for the English and Japanese homepages.
 *
 * The source is the existing `/ja/hero-lev.jpg` — no new image. Referenced
 * by public path with `fill`, so the box is reserved by the square wrapper
 * and the intrinsic size is never needed. The source is 3:2 with the figure
 * hard right and a wide empty field to its left, so `object-right` crops
 * that field away and leaves the subject filling the frame.
 *
 * `preload` rather than `priority` — Next 16 deprecated the latter in
 * favour of the former, and this is the page's only above-the-fold image.
 *
 * The left edge is masked into a fade instead of being cut square. The
 * crop line falls through scattered particles, and the illustration's
 * own cream is a shade warmer than the page (#f7f0e8 against #f7f5ef),
 * so a hard edge would read as a pasted-in rectangle.
 *
 * Japanese serif is applied only when `locale` is `"ja"`, so the English
 * homepage never depends on the Noto JP variables that `/ja` loads.
 */
export default function HeroVisual({ earlyYear, locale }: Props) {
  const copy = COPY[locale];

  return (
    <figure className="flex flex-col gap-5">
      {/* Stacked above the artwork rather than laid over its top-right
          corner. The sage disc in the illustration runs out to x=988 of
          1024 below y≈70, so an overlay there would sit on it at most
          widths. Above the frame it cannot collide with the figure.

          lg and up only: in the single-column layout the illustration
          lands directly above the stats strip, which already gives the
          early year in words. */}
      <figcaption className="hidden text-right lg:block">
        <p className={copy.yearClass}>{earlyYear}</p>
        <p
          lang={locale === "ja" ? "ja" : "en"}
          className={
            locale === "ja"
              ? "mt-2 text-[11px] font-semibold text-[#17202a]/45"
              : "mt-2 text-[9px] font-semibold tracking-[0.18em] text-[#17202a]/45"
          }
        >
          {copy.caption}
        </p>
      </figcaption>

      <div className="relative aspect-square w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_18%)]">
        <Image
          src="/ja/hero-lev.jpg"
          alt={copy.alt}
          fill
          preload
          sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 22rem, 100vw"
          className="object-cover object-right"
        />
      </div>
    </figure>
  );
}
