"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

type CountUpOptions = {
  /** Final numeric value. */
  to: number;
  /** Starting value. Defaults to 0. */
  from?: number;
  /** Tween duration in seconds. */
  duration?: number;
  /** Decimal places to render. Whole numbers by default. */
  decimals?: number;
  /** Sign prefix injected before the number (e.g. "−" for negative deltas). */
  prefix?: string;
  /** Suffix appended after the number (e.g. "%"). */
  suffix?: string;
  /**
   * Locale used by `Intl.NumberFormat` for thousands separator.
   * Russian audience: `ru-RU` gives a thin space separator.
   */
  locale?: string;
};

/**
 * Drive a number tween that updates the DOM text on every frame.
 * Triggers when the target element enters the viewport.
 *
 * Reduced motion: number is set instantly to its final state on mount.
 */
export function useCountUp({
  to,
  from = 0,
  duration = 1.8,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "ru-RU",
}: CountUpOptions) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      const render = (value: number) => {
        el.textContent = `${prefix}${formatter.format(value)}${suffix}`;
      };

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduceMotion) {
        render(to);
        return;
      }

      render(from);
      const proxy = { value: from };
      gsap.to(proxy, {
        value: to,
        duration,
        ease: "expo.out",
        onUpdate: () => render(proxy.value),
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    },
    { dependencies: [to, from, duration, decimals, prefix, suffix, locale] }
  );

  return ref;
}
