import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { countdown } from "@/lib/countdown";

export const alt = "Immortality Countdown";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "A provisional longevity estimate",
      title: "years until medical progress may outrun aging",
      figure: String(countdown.years),
      note: countdown.isComputed
        ? `80% interval ${countdown.earlyYear}–${countdown.lateYear} · ${countdown.draws.toLocaleString()} simulations`
        : "Tracking humanity's progress toward outrunning aging",
    }),
    { ...size }
  );
}
