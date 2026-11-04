import type { Article } from "@/data/articles";
import { FOCUS_RING } from "@/lib/nav";
import { topStoryRows } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * 本日の注目ニュース strip (approved calm mock): a light card directly
 * below the blue header band — never inside it — holding the top 3
 * articles by attention, then recency. The label blinks gently via the
 * CSS-only `.calm-blink` animation. Renders nothing when no article is
 * published yet.
 */
export default function TopStoriesStrip({
  articles,
  locale,
  now,
}: {
  articles: readonly Article[];
  locale: SiteLocale;
  now: Date;
}) {
  const rows = topStoryRows(articles, locale, now, 3);
  if (rows.length === 0) return null;
  return (
    <div className="mt-[18px] rounded-[18px] bg-white px-5 py-[14px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      <span className="calm-blink inline-block text-[0.92rem] font-extrabold text-[#e8502f]">
        {locale === "ja" ? "📣 本日の注目ニュース" : "📣 Today's top stories"}
      </span>
      <ul className="mt-2.5 list-none space-y-2 p-0">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-baseline gap-2 rounded-[10px] border border-[#dbe4f2] bg-[#f8fafd] px-3.5 py-2.5 text-[1.02rem] font-bold shadow-[0_1px_3px_rgba(35,50,82,0.05)]"
          >
            <span aria-hidden="true" className="shrink-0 text-[0.85rem]">
              🔥
            </span>
            <a
              href={row.href}
              {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`text-[#233252] transition-colors hover:text-[#e8502f] hover:underline ${FOCUS_RING}`}
            >
              {row.headline}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
