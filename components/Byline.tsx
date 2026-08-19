import Link from "next/link";
import { PUBLISHER } from "@/lib/site";
import { FOCUS_RING } from "@/lib/nav";

/**
 * Author attribution on the pages that make claims. Without a byline the
 * Person entity in the site's JSON-LD is not attached to any content, so
 * the E-E-A-T signal has nothing to attach to.
 */
export default function Byline({ reviewed }: { reviewed: string }) {
  return (
    <p className="mt-4 text-sm text-[#17202a]/55">
      By{" "}
      <Link href="/about" className={`font-medium text-[#17202a]/80 underline decoration-black/20 underline-offset-2 hover:decoration-black/50 ${FOCUS_RING}`}>
        {PUBLISHER.name}
      </Link>
      {" · Last reviewed "}
      <time dateTime={reviewed}>{reviewed}</time>
    </p>
  );
}
