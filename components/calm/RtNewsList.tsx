import NewsRow from "@/components/calm/NewsRow";
import type { NewsRowData } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * A vertical wire list of news rows (see NewsRow), separated by single
 * thin plain rules — the divide also puts one rule above the optional
 * footnote (the mock's badge/bar legend), matching the approved
 * specimen C layout (2026-11-06).
 */
export default function RtNewsList({
  rows,
  locale,
  note,
}: {
  rows: NewsRowData[];
  locale: SiteLocale;
  note?: string;
}) {
  return (
    <div className="flex flex-col divide-y divide-[#cfcfcf]">
      {rows.map((row) => (
        <NewsRow key={row.key} row={row} locale={locale} />
      ))}
      {note ? (
        <p className="px-[2px] pb-3 pt-[11px] text-[0.8rem] text-[#4a5878]">{note}</p>
      ) : null}
    </div>
  );
}
