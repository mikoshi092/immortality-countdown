import Link from "next/link";
import type { Article } from "@/data/articles";
import { FIELD_LABELS } from "@/lib/fields";
import { FIELD_LABELS_JA } from "@/lib/ja";
import { FOCUS_RING } from "@/lib/nav";
import type { SiteLocale } from "@/lib/locale";
import { articlePath } from "@/lib/article-seo";

export default function ArticleTeaser({
  article,
  locale,
  featured = false,
}: {
  article: Article;
  locale: SiteLocale;
  featured?: boolean;
}) {
  const copy = article[locale];
  const fieldLabel =
    locale === "ja" ? FIELD_LABELS_JA[article.fieldId] : FIELD_LABELS[article.fieldId];
  const href = articlePath(locale, article.slug);
  const readLabel = locale === "ja" ? "記事を読む →" : "Read the article →";

  return (
    <article
      className={`rounded-lg border border-black/10 bg-white shadow-sm ${
        featured ? "p-5 sm:p-6" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#17202a]/50">
        <Link
          href={`/fields/${article.fieldId}`}
          className={`text-[#2f766d] hover:underline ${FOCUS_RING}`}
        >
          {fieldLabel}
          {locale === "ja" ? "（英語）" : ""}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{article.evidence}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.sourcePublishedAt}>
          {article.sourcePublishedAt.slice(0, 10)}
        </time>
      </div>

      <h3
        className={`mt-2 font-semibold text-[#17202a] ${
          featured ? "text-lg sm:text-xl" : "text-base sm:text-lg"
        }`}
      >
        <Link href={href} className={`hover:underline ${FOCUS_RING}`}>
          {copy.headline}
        </Link>
      </h3>

      <p
        className={`mt-2 leading-6 text-[#17202a]/70 ${
          featured ? "text-sm sm:text-base" : "text-sm"
        }`}
      >
        {copy.dek}
      </p>

      <Link
        href={href}
        className={`mt-4 inline-block text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
      >
        {readLabel}
      </Link>
    </article>
  );
}
