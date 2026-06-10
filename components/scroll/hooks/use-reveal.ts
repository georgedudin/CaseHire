"use client";

import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-setup";

type RevealOptions = {
  /** CSS selector (within the scope) that selects each child to stagger. */
  selector: string;
  /** Stagger between children in seconds. */
  stagger?: number;
  /** Y translate distance in pixels for the from-state. */
  y?: number;
  /** Tween duration in seconds. */
  duration?: number;
  /** When `true`, animation plays once. When `false`, plays both directions. */
  once?: boolean;
  /** Trigger position in `ScrollTrigger.start` syntax. */
  start?: string;
};

/**
 * Staggered fade + translate reveal for a set of children.
 *
 * Reduced motion: children are set instantly to their visible state; no scroll trigger.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  selector,
  stagger = 0.08,
  y = 24,
  duration = 0.9,
  once = true,
  start = "top 80%",
}: RevealOptions): RefObject<T | null> {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const targets = root.querySelectorAll<HTMLElement>(selector);
      if (targets.length === 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduceMotion) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: "expo.out",
          stagger,
          scrollTrigger: {
            trigger: root,
            start,
            toggleActions: once
              ? "play none none none"
              : "play none none reverse",
            once,
          },
        }
      );
    },
    { scope: ref, dependencies: [selector, stagger, y, duration, once, start] }
  );

  return ref;
}
