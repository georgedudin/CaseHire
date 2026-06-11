"use client";

/**
 * Lenis provider v2 — carried from v1 minus the ScrollTrigger glue
 * (`ScrollTrigger.update` on scroll is gone; there is no ScrollTrigger).
 *
 * Contract:
 * - One RAF: `autoRaf: false`, Lenis driven from `gsap.ticker` so GSAP
 *   timelines and scroll share a single clock.
 * - `prefers-reduced-motion: reduce` → the Lenis instance is destroyed on
 *   mount and native scroll takes over entirely (v1 merely skipped the RAF
 *   glue, which would leave a wheel-intercepting zombie instance).
 */
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-setup";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenisRef.current?.lenis?.destroy();
      return;
    }

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false, // iOS: keep native inertia
        touchMultiplier: 1.6,
        autoRaf: false, // we drive RAF via gsap.ticker
      }}
    >
      {children}
    </ReactLenis>
  );
}
