import { ImageResponse } from "next/og";

export const alt = "Immortality Countdown";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#f7f5ef",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#315c52",
            marginBottom: 28,
          }}
        >
          A provisional longevity estimate
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "#17202a",
            lineHeight: 1.05,
          }}
        >
          Immortality Countdown
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 34,
            color: "rgba(23, 32, 42, 0.6)",
            maxWidth: 980,
          }}
        >
          Tracking humanity&apos;s progress toward outrunning aging
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
