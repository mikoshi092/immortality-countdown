import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { countdown, heroEarlyYears } from "@/lib/countdown";

export const alt = "Immortality Countdown";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "As early as",
      title: "years — early LEV scenario",
      figure: String(heroEarlyYears),
      note: countdown.isComputed
        ? `From ${countdown.baseYear} · calendar ${countdown.earlyYear} · early side of ${countdown.draws.toLocaleString()} simulations`
        : "Tracking humanity's progress toward outrunning aging",
    }),
    { ...size }
  );
}
