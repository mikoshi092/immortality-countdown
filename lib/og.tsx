import type { ReactElement } from "react";

/**
 * Shared Open Graph card. Every page used to share one static image, so a
 * link to a field page looked identical on X, Slack and Reddit to a link to
 * the homepage. A distinct card per page — carrying that page's actual
 * number — is the cheapest click-through win available on Vercel.
 *
 * Kept to layout primitives Satori supports: flex only, explicit `display`
 * on every element, no CSS shorthand it cannot parse.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const CREAM = "#f7f5ef";
const INK = "#17202a";
const TEAL = "#315c52";

export function ogCard({
  eyebrow,
  title,
  figure,
  note,
}: {
  eyebrow: string;
  title: string;
  /** Big number, drawn beside the title when present. */
  figure?: string;
  note?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: CREAM,
        padding: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TEAL,
          marginBottom: 26,
        }}
      >
        {eyebrow}
      </div>

      <div style={{ display: "flex", alignItems: "baseline" }}>
        {figure ? (
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              color: INK,
              marginRight: 32,
              lineHeight: 1,
            }}
          >
            {figure}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: figure ? 62 : 90,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: INK,
            lineHeight: 1.05,
            maxWidth: figure ? 660 : 1040,
          }}
        >
          {title}
        </div>
      </div>

      {note ? (
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            color: "rgba(23, 32, 42, 0.6)",
            maxWidth: 1000,
          }}
        >
          {note}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontSize: 24,
          color: "rgba(23, 32, 42, 0.45)",
        }}
      >
        immortalitycountdown.com
      </div>
    </div>
  );
}
