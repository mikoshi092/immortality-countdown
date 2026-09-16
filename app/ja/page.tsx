import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import HeroVisual from "@/components/HeroVisual";
import LevCrossingDiagram from "@/components/ja/LevCrossingDiagram";
import PipelineFlow from "@/components/ja/PipelineFlow";
import TechnologyMap from "@/components/ja/TechnologyMap";
import { countdown, heroEarlyYears } from "@/lib/countdown";
import { FIELD_IDS } from "@/lib/fields";
import { FIELD_LABELS_JA, FIELD_SUMMARIES_JA } from "@/lib/ja";
import { getFieldModel, REGULATORY_READINESS } from "@/lib/model-snapshot";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Japanese faces, loaded by this route and no other.
 *
 * They are declared here rather than in the root layout because a full
 * Japanese family is ~130 unicode-range @font-face blocks: putting them
 * in the shared layout stylesheet added 65 KB gzipped of render-blocking
 * CSS to every English page, which is exactly what "do not touch the
 * English pages" rules out. Imported from a page, the CSS lands in this
 * route's own chunk.
 *
 * `preload: false` with no `subsets` is the required combination. Google
 * publishes no named subset that covers Japanese, so asking for
 * `["latin"]` would preload Latin while still shipping the whole family;
 * omitting subsets keeps the full unicode-range coverage and next/font
 * then emits no <link rel="preload"> at all. The browser downloads a
 * Japanese chunk only when it has a glyph in that range to draw.
 *
 * `weight: "variable"` covers 400 through 600 from one file set instead
 * of one ~130-file set per static weight.
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

/**
 * The variable classes above only reach what is inside <main>. <Footer />
 * is rendered by the root layout as a sibling of `children`, so on /ja it
 * would be the one Japanese block left in an OS fallback face. Publishing
 * the same two custom properties at :root closes that gap.
 *
 * React hoists a <style> carrying `href` + `precedence` into <head> and
 * dedupes it, and because this element is only rendered by this route,
 * English pages never receive it. The values are build-time constants
 * from next/font, not input.
 */
const JA_FONT_VARS = `:root{--font-noto-sans-jp:${notoSansJP.style.fontFamily};--font-noto-serif-jp:${notoSerifJP.style.fontFamily}}`;

const title =
  "寿命脱出速度（LEV）とは？不老長寿はいつ実現するのか | Immortality Countdown";
const description =
  "医療の進歩が老化の速度を追い越す「寿命脱出速度（LEV）」とは何か。長寿研究の進展を追い、Immortality Countdown独自モデルによる現在の到達予測を解説します。";

/**
 * Only the English home and this page carry hreflang, because they are
 * the only pair that exists in both languages. /model, /fields and the
 * rest have no Japanese counterpart, so claiming one there would be a
 * false alternate.
 *
 * Every URL here is written without a trailing slash: the site runs on
 * Next.js's default `trailingSlash: false`, where /ja/ redirects to /ja,
 * and a canonical pointing at a redirect is a canonical Google ignores.
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/ja",
    languages: {
      en: "/",
      ja: "/ja",
      "x-default": "/",
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/ja`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
};

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

/**
 * No negative tracking anywhere in this file. Tight letter-spacing is a
 * Latin display-type trick; applied to kana and kanji — which are drawn
 * on a full-width em square — it just collides the glyphs.
 */
const SECTION_HEADING =
  "font-ja-serif text-[clamp(1.5rem,4.6vw,2.2rem)] font-medium leading-[1.45] text-[#17202a]";

const BODY = "text-[15px] leading-8 text-[#17202a]/75 sm:text-base sm:leading-9";

/**
 * An editorial pull quote: a sentence already made in the surrounding
 * prose, set larger so a scanning reader picks up the argument without
 * reading the section.
 *
 * No quotation marks, no card, no tinted panel. A short accent rule and
 * the whitespace around it carry the emphasis, which is why the two
 * instances stay legible next to the section's other serif blocks —
 * every one of those is either ruled differently or set at a different
 * size. It stays inside the max-w-2xl text column rather than breaking
 * out of it, so the page keeps one measure throughout.
 */
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 max-w-2xl sm:my-12">
      <span aria-hidden="true" className="block h-0.5 w-10 bg-[#2f766d]" />
      <p className="font-ja-serif mt-5 text-[clamp(1.25rem,3.1vw,1.75rem)] font-medium leading-[1.75] text-[#17202a]">
        {children}
      </p>
    </blockquote>
  );
}

const GATES = [
  {
    title: "人での試験と安全性",
    body: "マウスで効いても、人で効くとは限らない。治療にするには臨床試験と安全性の確認が要る。老化では「効いた」の測り方自体がまだ整っていない。必要な確認と、試験設計の遅れは別だ。",
  },
  {
    title: "制度と承認の経路",
    body: "安全性の審査は残す必要がある。一方で、老化を正面から治療対象として扱いづらい経路や、更新が遅いルールは、研究の速度を落とす。遅れの原因は規制だけではない。",
  },
  {
    title: "製造と費用",
    body: "量産できない治療は社会を変えない。製造、届け方、品質管理、価格を乗り越え、実験段階の治療を、使える医療へ落とし込む。",
  },
  {
    title: "社会に届けること",
    body: "届かない技術は、ないのと同じだ。保険、診断基準、アクセスを、これからの医療に合わせる。届く速度は、そのまま寿命に響く。",
  },
];

export default function JapaneseLandingPage() {
  const earlyYears = heroEarlyYears;
  const gain = countdown.currentGain;
  const draws = countdown.draws.toLocaleString("en-US");

  return (
    <main
      id="top"
      lang="ja"
      className={`${notoSansJP.variable} ${notoSerifJP.variable} font-ja min-h-screen bg-[#f7f5ef] text-[#17202a]`}
    >
      <style href="ja-font-vars" precedence="high">
        {JA_FONT_VARS}
      </style>

      <SiteHeader />

      <div className="border-b border-white/10 bg-[#141413]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-2">
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#2f766d]"
            />
            <span className="text-[11px] font-bold tracking-[0.14em] text-white/90">
              PUBLIC BETA
            </span>
          </span>
          <p className="text-[11px] font-medium leading-4 text-white/55 sm:text-xs">
            カウントダウンのモデルは開発中です。各スコアはモデルへの入力値であり、
            根拠の見直しにあわせて変わります。
          </p>
        </div>
      </div>

      <section className="px-5 pt-10 pb-8 sm:px-6 sm:pt-12 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {/* The illustration column widens at xl rather than taking its
              full size the moment the row splits, which keeps the drop in
              headline size across the lg boundary from being abrupt. */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_30rem]">
            {/* @container so the headline can be measured against this
                column instead of the viewport. Once the hero splits in
                two, a vw-based size knows nothing about the illustration
                taking a third of the row, and overruns the column. */}
            <div className="@container">
              {/* Latin display text, so the wide tracking here is the
                  right call — unlike on the Japanese headings below. */}
              <p className="text-xs font-semibold tracking-[0.22em] text-[#2f766d] sm:text-sm">
                DEATH IS A BUG
              </p>

              {/* Japanese has no spaces, so the browser may break a
                  heading between any two characters — including inside
                  「なる」 and between the number and 年. Marking the two
                  closing phrases nowrap makes 「…に / なるまで、 /
                  早ければあとX年。」 the only break points.

                  The clamp middle term matters as much as the spans.
                  Kanji, kana and 「」、。 are all drawn full-width, so the
                  opening phrase is exactly 12em wide and cannot break any
                  later than 「に」. Holding the size at or below one
                  twelfth of the column keeps that phrase on one line at
                  every width; anything larger hands the break back to the
                  browser, mid-word. */}
              <h1 className="font-ja-serif mt-4 max-w-3xl text-[clamp(1.35rem,8cqw,3.6rem)] font-medium leading-[1.32] sm:mt-5">
                死が「治療可能なバグ」に
                <span className="whitespace-nowrap">なるまで、</span>
                <span className="whitespace-nowrap">
                  早ければあと
                  <span className="lining-nums tabular-nums">{earlyYears}</span>
                  年。
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[#17202a]/50 sm:text-[13px] sm:leading-6">
                基準年{countdown.baseYear}からの年数。モデルの早期シナリオ（P10）は
                <span className="tabular-nums">{countdown.earlyYear}</span>年。
                <Link
                  href="/model"
                  className={`ml-2 font-medium text-[#2f766d] underline-offset-4 hover:underline ${FOCUS_RING}`}
                >
                  算出方法（英語）
                </Link>
              </p>

              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#17202a]/70 sm:text-lg sm:leading-9">
                医療の進歩が、老化の速度を追い越すまでの距離を、世界の研究とともに追う。
              </p>
            </div>

            <HeroVisual earlyYear={countdown.earlyYear} locale="ja" />
          </div>
        </div>
      </section>

      <section
        id="lev-toha"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>寿命脱出速度（LEV）という考え方</h2>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
            <div className={`max-w-2xl space-y-5 ${BODY}`}>
              <p>
                <strong className="font-semibold text-[#17202a]">
                  LEVは、1年あたりに得られる健康寿命が1年を超える地点です。延びた時間のあいだに次の治療へつながれば、老化の進行より医療の進歩が速くなる、という考え方です。
                </strong>
              </p>
              <p>
                現在のモデルは
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {gain.toFixed(2)}
                </span>
                年/年。LEVは
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {countdown.levThreshold.toFixed(2)}
                </span>
                年/年。いまは時間が勝っている。1.00を超えると、医療の進歩が老化の速度を追い越す、というのがこのモデルの見方です。
              </p>
            </div>

            <figure className="rounded-xl border border-black/10 bg-white px-5 py-5 shadow-sm lg:self-start">
              <figcaption className="text-xs font-semibold text-[#17202a]/60">
                1年あたりに得られる健康寿命
              </figcaption>

              <div className="mt-3">
                <LevCrossingDiagram
                  currentGain={gain}
                  threshold={countdown.levThreshold}
                />
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-black/8 pt-3">
                <p className="text-sm font-medium text-[#17202a]/70">
                  現在
                  <span className="ml-1.5 font-semibold tabular-nums text-[#17202a]">
                    {gain.toFixed(2)}
                  </span>
                  <span className="font-normal text-[#17202a]/45"> 年/年</span>
                </p>
                <p className="text-sm font-medium text-[#17202a]/70">
                  LEV到達時
                  <span className="ml-1.5 font-semibold tabular-nums text-[#17202a]">
                    {countdown.levThreshold.toFixed(2)}
                  </span>
                  <span className="font-normal text-[#17202a]/45"> 年/年</span>
                </p>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#17202a]/45">
                現在値は{countdown.baseYear}
                年時点のImmortality Countdownモデルによる推定値です。
                図の曲線はLEVという考え方を説明するための概念図で、
                予測した軌道ではありません。
              </p>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="why-now"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>なぜこれほど時間がかかるのか</h2>

          <p className={`mt-6 max-w-2xl ${BODY}`}>
            研究室の成功が患者に届くまでには、試験、安全性の確認、製造、届け方がある。
            必要な確認と、なくてもよい遅れは別だ。遅れの理由を規制だけに帰さない。
          </p>

          <PipelineFlow lastReviewed={REGULATORY_READINESS.lastReviewed} />

          <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GATES.map((gate, index) => (
              <div
                key={gate.title}
                className="rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm"
              >
                <p className="font-mono text-[11px] tabular-nums text-[#2f766d]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <dt className="mt-1.5 text-sm font-semibold leading-6 text-[#17202a]">
                  {gate.title}
                </dt>
                <dd className="mt-2 text-[13px] leading-6 text-[#17202a]/65">
                  {gate.body}
                </dd>
              </div>
            ))}
          </dl>

          <PullQuote>必要な確認は残す。なくてもよい遅れは、人が直せる。</PullQuote>

          <div className={`max-w-2xl ${BODY}`}>
            <p>
              Immortality Countdownは、8つの研究分野とは別に
              <strong className="font-semibold text-[#17202a]">
                「規制・社会実装の準備度」
              </strong>
              もモデルに入れている。承認され、量産され、必要な人に届かなければ、研究成果は健康寿命の延伸につながらない。
            </p>
          </div>

          <div className="mt-8 max-w-2xl rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <p className="text-sm font-semibold text-[#17202a]/80">
              規制・社会実装の準備度
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#17202a]/55">
              モデル入力値 · 最終確認 {REGULATORY_READINESS.lastReviewed}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                <div
                  className="readiness-bar-fill h-full rounded-full bg-[#2f766d]"
                  style={{ width: `${REGULATORY_READINESS.score}%` }}
                />
              </div>
              <p className="shrink-0 text-lg font-semibold tabular-nums text-[#17202a] sm:text-xl">
                {REGULATORY_READINESS.score}
                <span className="text-sm font-normal text-[#17202a]/45">
                  {" "}
                  / 100
                </span>
              </p>
            </div>
          </div>

          <p className="mt-6">
            <Link
              href="/model"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              モデルの計算方法と前提を見る（英語）→
            </Link>
          </p>
        </div>
      </section>

      <section
        id="eight-fields"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>LEVを動かす8つの研究分野</h2>

          <p className={`mt-6 max-w-2xl ${BODY}`}>
            このサイトのモデルは、8つの研究分野の進み方を見て到達時期を見積もっています。
            分野が遅れれば予測も遅れます。8つが同時に完成することが自然法則だという意味ではありません。
            スコアは各分野の現在地です。
          </p>

          <TechnologyMap
            fields={FIELD_IDS.map((id) => ({
              id,
              label: FIELD_LABELS_JA[id],
              score: getFieldModel(id).score,
            }))}
            earlyYear={countdown.earlyYear}
          />

          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FIELD_IDS.map((id, index) => {
              const field = getFieldModel(id);
              return (
                <li
                  key={id}
                  className="flex flex-col rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm"
                >
                  <p className="font-mono text-[11px] tabular-nums text-[#2f766d]">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="mt-1.5 text-sm font-semibold leading-6 text-[#17202a]">
                    {FIELD_LABELS_JA[id]}
                  </p>

                  <p className="mt-2 flex-1 text-[13px] leading-6 text-[#17202a]/65">
                    {FIELD_SUMMARIES_JA[id]}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                      <div
                        className="field-bar-fill h-full origin-left rounded-full bg-[#2f766d]"
                        style={{
                          width: `${field.score}%`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                    <p className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-[#17202a]">
                      {field.score}
                      <span className="text-[11px] font-normal text-[#17202a]/40">
                        /100
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6">
            <Link
              href="/fields"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              8分野それぞれの評価を読む（英語）→
            </Link>
          </p>
        </div>
      </section>

      <section
        id="when-lev"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>
            早期シナリオが示すのは、{countdown.earlyYear}年
          </h2>

          <div className={`mt-6 max-w-2xl space-y-5 ${BODY}`}>
            <p>
              この数字はAIの作文ではない。公開されたTypeScriptモデルが、固定シードで
              {draws}個のシナリオを走らせた結果だ。
            </p>
            <p>
              基準年{countdown.baseYear}年から数えて{earlyYears}年。
              早期側の分位点であり、最短の保証ではない。
              人で効く治療、適切な試験、創薬の加速。これらが進めば年数は縮む。停滞すれば伸びる。
            </p>
          </div>

          <div className="mt-10 max-w-2xl border-t border-black/8 pt-8 sm:mt-12">
            <p className="font-ja-serif text-[clamp(1.3rem,3.6vw,1.95rem)] font-medium leading-[1.7] text-[#17202a]">
              この<span className="tabular-nums">{earlyYears}</span>年を、より短い距離へ。
              <br />
              死を「治療可能なバグ」に変える時計を進める。
            </p>
            <p className={`mt-5 ${BODY}`}>
              Immortality Countdownは、長寿研究の進展を追い、予測を変えた根拠も公開する。
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/#latest-news"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              最新の研究アップデートを見る（英語）→
            </Link>
            <Link
              href="/methodology"
              className={`text-sm font-medium text-[#17202a]/55 underline-offset-4 hover:underline ${FOCUS_RING}`}
            >
              評価の方法（英語）
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
