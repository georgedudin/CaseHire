"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/scroll/lenis-provider";

/**
 * Soft "magnetic" snap to scene boundaries — Apple-style.
 *
 * Not a hard snap. After the user stops scrolling for ~180 ms, we measure
 * the distance from `window.scrollY` to the nearest `section.scene-shell`
 * top. If we're within ±40% of viewport height of a boundary (and not
 * already there), Lenis glides to it over 700 ms.
 *
 * Discipline:
 *   - lg+ only. Phone touch-scroll gets in a fight with snap; we leave it.
 *   - prefers-reduced-motion: disabled entirely.
 *   - Keyboard nav (D6) targets the same section anchors — landing on one
 *     puts us at distance ≈ 0, so snap is a no-op.
 *   - If the user manually scrolls during snap, Lenis cancels the in-flight
 *     animation; the next stop re-evaluates.
 */

const SNAP_DELAY_MS = 180;
const SNAP_TOLERANCE_VH = 0.4;
const SNAP_DEAD_ZONE_PX = 6;
const SNAP_DURATION_S = 0.7;

export function ScrollSnap() {
  const lenis = useLenis();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snappingRef = useRef(false);

  useEffect(() => {
    if (!lenis) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const trySnap = () => {
      if (snappingRef.current) return;
      if (!window.matchMedia("(min-width: 1024px)").matches) return;

      const y = window.scrollY;
      const tol = window.innerHeight * SNAP_TOLERANCE_VH;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section.scene-shell")
      );
      if (sections.length === 0) return;

      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;
      for (const s of sections) {
        const d = Math.abs(s.offsetTop - y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = s;
        }
      }

      if (!nearest) return;
      if (nearestDist <= SNAP_DEAD_ZONE_PX) return; // already aligned
      if (nearestDist > tol) return; // too far — let the user be

      snappingRef.current = true;
      lenis.scrollTo(nearest, {
        duration: SNAP_DURATION_S,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // cubic ease-out
        onComplete: () => {
          snappingRef.current = false;
        },
      });
    };

    const onScroll = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(trySnap, SNAP_DELAY_MS);
    };

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lenis]);

  return null;
}
