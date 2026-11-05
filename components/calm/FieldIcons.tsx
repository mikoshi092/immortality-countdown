import type { ReactNode } from "react";
import type { FieldId } from "@/lib/fields";

/**
 * Drawn SVG icon set for the eight-fields cards and the average panel
 * (owner request, 2026-11-05: the stock emoji read as AI-generated).
 *
 * One visual system across the whole set: 24×24 viewBox, 1.7 stroke,
 * round caps and joins, ink line work with a single teal accent per
 * icon — the same ink and teal as the calm palette in Sections.tsx.
 * Every icon is decorative: it always sits next to a visible text
 * label, so the set is aria-hidden.
 */
const INK = "#233252";
const TEAL = "#00a8a8";
const PAPER = "#ffffff";

function IconShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={INK}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

const FIELD_ICON_ART: Record<FieldId, ReactNode> = {
  // Flask holding a small molecule — the accent is the compound.
  "ai-drug-discovery": (
    <>
      <path d="M9.8 3h4.4v5.2l4.6 9.6a1.6 1.6 0 0 1-1.4 2.4H6.6a1.6 1.6 0 0 1-1.4-2.4L9.8 8.2V3z" />
      <g stroke={TEAL}>
        <path d="M11.2 12.6l1.9-.6M11.4 14.1l1.6 1.4M13.8 12.5v2" />
        <circle cx="10.3" cy="13.4" r="1.3" fill={PAPER} />
        <circle cx="14" cy="11.5" r="1" fill={PAPER} />
        <circle cx="13.6" cy="15.4" r="1" fill={PAPER} />
      </g>
    </>
  ),
  // Cog with a teal hub — machinery and infrastructure.
  "enabling-technology-automation": (
    <>
      <path d="M16.9 12h1.5M12 16.9v1.5M7.1 12H5.6M12 7.1V5.6M15.5 15.5l1.1 1.1M8.5 15.5l-1.1 1.1M8.5 8.5L7.4 7.4M15.5 8.5l1.1-1.1" />
      <circle cx="12" cy="12" r="4.9" />
      <circle cx="12" cy="12" r="1.7" stroke={TEAL} />
    </>
  ),
  // Shield with a living cell inside.
  "immune-engineering-cancer-control": (
    <>
      <path d="M12 3.2l6.8 2.4v5.3c0 4.5-2.9 7.4-6.8 9.4-3.9-2-6.8-4.9-6.8-9.4V5.6L12 3.2z" />
      <circle cx="12" cy="10.8" r="2.7" stroke={TEAL} />
      <circle cx="12" cy="10.8" r="0.6" fill={TEAL} stroke={TEAL} />
    </>
  ),
  // Gauge with a teal needle — measuring what was unmeasurable.
  "biomarkers-diagnostics": (
    <>
      <path d="M4.2 17.5a7.8 7.8 0 0 1 15.6 0" />
      <path d="M6.5 12l1.3 1.3M17.5 12l-1.3 1.3M12 9.7v2.2M6 20.6h12" />
      <path d="M12 17.5L15.8 12.4" stroke={TEAL} />
      <circle cx="12" cy="17.5" r="1.15" fill={PAPER} stroke={TEAL} />
    </>
  ),
  // Renewal arrow circling a young sprout.
  "rejuvenation-regeneration": (
    <>
      <path d="M18.4 8.3A7.4 7.4 0 1 1 13.3 4.7" />
      <path d="M10.6 3.2L13.3 4.7L12.2 7.6" />
      <g stroke={TEAL}>
        <path d="M12 17.4V12.4" />
        <path d="M12 13.8c-1.8.1-3-.7-3.4-2.3 1.7-.2 3 .8 3.4 2.3z" />
        <path d="M12 12.4c.5-1.6 1.7-2.3 3.3-2.2-.4 1.6-1.6 2.3-3.3 2.2z" />
      </g>
    </>
  ),
  // Heart with a maker's cross — repair and replacement.
  "organ-replacement-biofabrication": (
    <>
      <path d="M12 20.4C7.2 16.6 4.2 13.3 4.2 9.8 4.2 7.1 6 5.2 8.4 5.2c1.5 0 2.9.8 3.6 2C12.9 6 14.1 5.2 15.6 5.2 18 5.2 19.8 7.1 19.8 9.8c0 3.5-3 6.8-7.8 10.6" />
      <path d="M12 9.8v5M9.5 12.3h5" stroke={TEAL} />
    </>
  ),
  // Double helix with teal rungs.
  "gene-therapy-delivery": (
    <>
      <path d="M7 3.6C11 6.4 17 6.2 17 10.4 17 14.6 11 14.4 7 17.2" />
      <path d="M17 3.6C13 6.4 7 6.2 7 10.4 7 14.6 13 14.4 17 17.2" />
      <path d="M8.5 8.6h7M9.4 12.6h5.2M10.3 15.8h3.4" stroke={TEAL} />
    </>
  ),
  // Crosshair over a capsule — a drug aimed at aging itself.
  "geroscience-drugs-trials": (
    <>
      <circle cx="12" cy="12" r="6.4" />
      <path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3" />
      <g stroke={TEAL} transform="rotate(45 12 12)">
        <rect x="7.6" y="10.2" width="8.8" height="3.6" rx="1.8" />
        <path d="M12 10.2v3.6" />
      </g>
    </>
  ),
};

export function FieldIcon({
  id,
  className,
}: {
  id: FieldId;
  className?: string;
}) {
  return <IconShell className={className}>{FIELD_ICON_ART[id]}</IconShell>;
}

/** Globe for the average panel, drawn in the same hand as the set. */
export function GlobeIcon({ className }: { className?: string }) {
  return (
    <IconShell className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <ellipse cx="12" cy="12" rx="3.9" ry="8.6" stroke={TEAL} />
      <path d="M3.4 12h17.2M4.9 7.9c4.3 1.7 9.9 1.7 14.2 0M4.9 16.1c4.3-1.7 9.9-1.7 14.2 0" />
    </IconShell>
  );
}
