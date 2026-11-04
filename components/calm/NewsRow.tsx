import { FOCUS_RING } from "@/lib/nav";
import { relativeTimeEn, relativeTimeJa, type NewsRowData } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * One realtime-chart-style news item (approved calm mock), framed as its
 * own card: an hours badge on the left (NEW! under 12 hours, NEWS
 * otherwise), the headline as the link to the original article, a meta
 * line (field tag, source name, relative time) and an attention bar when
 * a signal exists.
 */
export default function NewsRow({ row, locale }: { row: NewsRowData; locale: SiteLocale }) {
  const relativeTime = locale === "ja" ? relativeTimeJa(row.hours) : relativeTimeEn(row.hours);
  return (
    <div className="flex gap-3 rounded-[10px] border-[3px] border-[#7d97bd] bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(35,50,82,0.05)]">
      <div className="w-[46px] shrink-0 self-start overflow-hidden rounded-lg bg-[#7d8194] text-center text-[0.6rem] font-extrabold leading-[1.3] text-white">
        <span className="block pt-1">{row.isNew ? "NEW!" : "NEWS"}</span>
        <b
          className={`mt-[3px] block pb-[3px] pt-[2px] text-[0.95rem] ${
            row.isNew ? "bg-[#9b59d0]" : "bg-[#b9bdd0]"
          }`}
        >
          {row.hours}
        </b>
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={row.href}
          {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`block text-[1.04rem] font-extrabold leading-[1.55] text-[#233252] transition-colors hover:text-[#e8502f] hover:underline ${FOCUS_RING}`}
        >
          {row.headline}
        </a>
        <div className="mt-[5px] flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-[#4a5878]">
          <span className="inline-block whitespace-nowrap rounded-full bg-[#eef4ff] px-2 py-px text-[0.72rem] font-bold text-[#3366bb]">
            {row.fieldEmoji} {row.fieldLabel}
          </span>
          <span>
            {row.sourceLabel} ・ {relativeTime}
          </span>
        </div>
        {row.attentionPct !== null ? (
          <div className="mt-[7px] flex items-center gap-2">
            <div
              className="h-[7px] w-[130px] overflow-hidden rounded-full bg-[#eef2f9]"
              role="img"
              aria-label={
                locale === "ja" ? `注目度 ${row.attentionPct}%` : `Attention ${row.attentionPct}%`
              }
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a)]"
                style={{ width: `${row.attentionPct}%` }}
              />
            </div>
            <span className="text-[0.72rem] font-bold text-[#4a5878]">
              {locale === "ja" ? `注目度 ${row.attentionPct}%` : `Attention ${row.attentionPct}%`}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
