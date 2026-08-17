"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const START = 99;
const END = 28;
const TOTAL_STEPS = START - END; // 71 transitions, 72 values incl. both ends
const SLOW_STEPS = 10;
const BASE_DELAY_MS = 17;
const MAX_EXTRA_DELAY_MS = 60;

// Fast, even steps for most of the count; the final SLOW_STEPS transitions
// ease in (quadratic) so the countdown visibly settles instead of snapping.
function delayForStep(stepIndex: number) {
  const stepsFromEnd = TOTAL_STEPS - 1 - stepIndex;
  if (stepsFromEnd >= SLOW_STEPS) return BASE_DELAY_MS;
  const t = 1 - stepsFromEnd / SLOW_STEPS;
  return BASE_DELAY_MS + t * t * MAX_EXTRA_DELAY_MS;
}

// useLayoutEffect no-ops (with a warning) during SSR; fall back to
// useEffect there so nothing tries to touch the DOM off the client.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HeroCountdown() {
  const [display, setDisplay] = useState(END);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    setDisplay(START);

    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      step += 1;
      setDisplay(START - step);
      if (step < TOTAL_STEPS) {
        timeoutId = setTimeout(tick, delayForStep(step));
      }
    };

    timeoutId = setTimeout(tick, delayForStep(0));

    return () => clearTimeout(timeoutId);
  }, []);

  return <span aria-hidden="true">{display}</span>;
}
