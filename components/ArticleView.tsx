import Link from "next/link";
import type { Article } from "@/data/articles";
import { FIELD_LABELS } from "@/lib/fields";
import { FIELD_LABELS_JA } from "@/lib/ja";
import { FOCUS_RING } from "@/lib/nav";
import type { SiteLocale } from "@/lib/locale";
import {
  ARTICLE_UI,
  IMPACT_COPY,
  visibleFactRows,
} from "@/lib/article-copy";
import { articlePath, newsIndexPath } from "@/lib/article-seo";

export default function ArticleView({
  article,
  locale,
}: {
  article: Article;
  locale: SiteLocale;
}) {
  const copy = article[locale];
  const ui = ARTICLE_UI[locale];
  const fieldLabel =
    locale === "ja" ? FIELD_LABELS_JA[article.fieldId] : FIELD_LABELS[article.fieldId];
  const otherLocale: SiteLocale = locale === "ja" ? "en" : "ja";

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs font-medium text-[#17202a]/50">
        <Link
          href={newsIndexPath(locale)}
          className={`font-semibold text-[#2f766d] hover:underline ${FOCUS_RING}`}
        >
          {ui.backToList}
        </Link>
      </p>

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            {ui.field}
          </dt>
          <dd className="mt-1">
            <Link
              href={`/fields/${article.fieldId}`}
              className={`font-medium text-[#2f766d] hover:underline ${FOCUS_RING}`}
            >
              {fieldLabel}
              {ui.englishField}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            {ui.date}
          </dt>
          <dd className="mt-1 text-[#17202a]/75">
            <time dateTime={article.sourcePublishedAt}>
              {article.sourcePublishedAt.slice(0, 10)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
            {ui.evidence}
          </dt>
          <dd className="mt-1 text-[#17202a]/75">{article.evidence}</dd>
        </div>
      </dl>

      <h1 className="mt-5 text-[clamp(1.5rem,4vw,2.15rem)] font-semibold leading-tight text-[#17202a]">
        {copy.headline}
      </h1>
      <p className="mt-4 text-base leading-7 text-[#17202a]/70 sm:text-lg sm:leading-8">
        {copy.dek}
      </p>

      <section className="mt-8 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
          {ui.signal}
        </h2>
        <dl className="mt-4 space-y-3">
          {visibleFactRows(article.localizedFacts[locale]).map((row) => (
            <div key={row.key}>
              <dt className="text-xs font-semibold text-[#17202a]/55">{ui[row.labelKey]}</dt>
              <dd className="mt-0.5 text-sm leading-6 text-[#17202a]/80">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section title={ui.whatHappened}>{copy.whatHappened}</Section>
      <Section title={ui.whyItMatters}>{copy.whyItMatters}</Section>
      <Section title={ui.realityCheck} italic>
        {copy.realityCheck}
      </Section>

      <section className="mt-8 border-t border-black/8 pt-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
          {ui.countdown}
        </h2>
        <p className="mt-2 text-lg font-semibold tracking-wide text-[#17202a]">
          {IMPACT_COPY[locale][article.countdownImpact]}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#17202a]/60">{ui.modelNote}</p>
      </section>

      <section className="mt-8 border-t border-black/8 pt-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
          {ui.source}
        </h2>
        <p className="mt-2 text-sm text-[#17202a]/75">{article.sourceLabel}</p>
        {article.doi ? (
          <p className="mt-1 text-xs text-[#17202a]/45">DOI {article.doi}</p>
        ) : null}
        <a
          href={article.sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
          className={`mt-3 inline-block text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
        >
          {ui.readSource} →
        </a>
      </section>

      <p className="mt-10 text-sm">
        <Link
          href={articlePath(otherLocale, article.slug)}
          hrefLang={otherLocale}
          className={`font-semibold text-[#2f766d] hover:underline ${FOCUS_RING}`}
        >
          {ui.otherLanguage}
        </Link>
      </p>
    </article>
  );
}

function Section({
  title,
  children,
  italic = false,
}: {
  title: string;
  children: string;
  italic?: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
        {title}
      </h2>
      <p
        className={`mt-2 text-base leading-7 text-[#17202a]/75 ${
          italic ? "italic text-[#17202a]/65" : ""
        }`}
      >
        {children}
      </p>
    </section>
  );
}
