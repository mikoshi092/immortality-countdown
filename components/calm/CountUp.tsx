"use client";

import { useEffect, useState } from "react";

/**
 * Hero count-up island: animates 0 → target with an ease-out curve, per
 * the approved calm mock. The server-rendered value is the final number
 * (so no-JS and reduced-motion readers see the real figure immediately);
 * the animation restarts from 0 on mount only when motion is allowed.
 * The animated span is hidden from assistive technology and paired with
 * a static sr-only copy — the same pattern as components/HeroCountdown.
 */
export default function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <>
      <span aria-hidden="true">{value}</span>
      <span className="sr-only">{target}</span>
    </>
  );
}
