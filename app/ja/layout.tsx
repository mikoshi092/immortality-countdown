import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";

/**
 * Japanese faces for every /ja route.
 *
 * They live here rather than the root layout because a full Japanese family
 * is ~130 unicode-range @font-face blocks. Putting them in the shared
 * layout stylesheet would add tens of KB of render-blocking CSS to every
 * English page.
 *
 * `preload: false` with no `subsets` is the required combination. Google
 * publishes no named subset that covers Japanese, so asking for
 * `["latin"]` would preload Latin while still shipping the whole family.
 *
 * The <style> with href + precedence is hoisted into <head> and deduped.
 * Footer sits outside this layout, so the same custom properties are
 * published at :root for Japanese routes only.
 */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: "variable",
  display: "swap",
  preload: false,
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: "variable",
  display: "swap",
  preload: false,
});

const JA_FONT_VARS = `:root{--font-noto-sans-jp:${notoSansJP.style.fontFamily};--font-noto-serif-jp:${notoSerifJP.style.fontFamily}}`;

export default function JapaneseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${notoSansJP.variable} ${notoSerifJP.variable} font-ja`}
    >
      <style href="ja-font-vars" precedence="high">
        {JA_FONT_VARS}
      </style>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify("ja")};`,
        }}
      />
      {children}
    </div>
  );
}
