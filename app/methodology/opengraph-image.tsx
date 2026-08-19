import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { countdown } from "@/lib/countdown";

export const alt = "Immortality Countdown methodology";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "Methodology",
      title: `Why ${countdown.years} years?`,
      note: "What the countdown measures, how it is scored, and where it is weakest.",
    }),
    { ...size }
  );
}
