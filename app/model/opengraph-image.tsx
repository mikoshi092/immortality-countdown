import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { countdown } from "@/lib/countdown";

export const alt = "How the Immortality Countdown is computed";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: `The model · v${countdown.paramsVersion}`,
      title: "Every parameter published. Fixed seed. Reproducible.",
      note: `Today: ${countdown.currentGain.toFixed(2)} healthy years gained per calendar year. Escape velocity needs 1.00.`,
    }),
    { ...size }
  );
}
