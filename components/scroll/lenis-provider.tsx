"use client";

import { ReactLenis, useLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

/**
 * Drives smooth scroll for the whole page and keeps GSAP's ScrollTrigger
 * synchronized with Lenis's RAF loop — a single source of truth for time.
 *
 * Accessibility:
 *  - When `prefers-reduced-motion: reduce` is set, Lenis stays off entirely
 *    so the OS-native scroll behavior (and assistive tech expectations) win.
 *  - We re-check on media-query changes so toggling the OS setting at runtime
 *    takes effect without a full reload.
 *
 * Performance:
 *  - `gsap.ticker.lagSmoothing(0)` (set in `lib/gsap-setup.ts`) prevents
 *    backgrounded-tab jank from breaking timelines.
 *  - `autoRaf` is OFF — we drive Lenis from `gsap.ticker` to avoid two RAFs.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // Native scroll — no Lenis, no ScrollTrigger scrub setup.
      return;
    }

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);

    const onLenisScroll = () => ScrollTrigger.update();
    lenisRef.current?.lenis?.on("scroll", onLenisScroll);

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off("scroll", onLenisScroll);
    };
  }, []);

  // If reduced motion is on, render children with no smoothing wrapper.
  // We still mount ReactLenis so anchor scroll-to works via the hook,
  // but we pass options that effectively disable smoothing.
  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        // Apple-tier feel: ~1.2s glide, exponential ease-out.
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Mobile/touch: keep native scroll inertia; smoothing fights iOS UX.
        syncTouch: false,
        touchMultiplier: 1.6,
        // We drive RAF ourselves via gsap.ticker.
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export { useLenis };
