"use client";

import { forwardRef, useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";
import { cn } from "@/lib/cn";

type SceneProps = {
  /** Stable id for the `<section>` — also wires `aria-labelledby`. */
  id: string;
  /** Visually-hidden accessible name shown to AT (slide title). */
  ariaLabel: string;
  /**
   * Approximate scroll length (in viewport heights) the pin should consume.
   * Desktop only — mobile/tablet collapse the pin entirely.
   */
  pinLength?: number;
  /** Disable pinning entirely (e.g. for the hero or text-only beats). */
  pin?: boolean;
  /** Optional background color override; defaults to `--color-ink`. */
  background?: string;
  /** Extra utility classes for the stage. */
  className?: string;
  children: ReactNode;
};

/**
 * One full-viewport "moment" in the scroll narrative.
 *
 * Responsive choreography:
 *  - ≥1024px (desktop): pins for `pinLength` viewport-heights, scrubbed.
 *  - <1024px (mobile/tablet): no pin, gentle fade-in on enter — matches
 *    Apple's own product-page behavior (theatrical pins are a desktop affordance).
 *  - `prefers-reduced-motion: reduce`: bails entirely; content renders inert.
 *
 * Accessibility:
 *  - Semantic <section aria-labelledby> with a visually-hidden <h2>.
 *  - `contain: layout paint` (via .scene-shell) keeps CLS isolated.
 *  - Content inside the stage remains in the DOM throughout — AT sees full text.
 */
export const Scene = forwardRef<HTMLElement, SceneProps>(function Scene(
  {
    id,
    ariaLabel,
    pinLength = 1.5,
    pin = true,
    background,
    className,
    children,
  },
  forwardedRef
) {
  const localRef = useRef<HTMLElement>(null);
  const setRefs = (node: HTMLElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useGSAP(
    () => {
      const section = localRef.current;
      if (!section) return;
      const stage = section.querySelector<HTMLDivElement>(".scene-stage");
      if (!stage) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isMobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, isReduced } = context.conditions ?? {};

          if (isReduced) {
            gsap.set(stage, { opacity: 1, y: 0 });
            return;
          }

          if (isDesktop && pin) {
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: `+=${pinLength * 100}%`,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            });
          }

          if (isMobile) {
            gsap.fromTo(
              stage,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: localRef, dependencies: [pin, pinLength] }
  );

  return (
    <section
      ref={setRefs}
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scene-shell", className)}
      style={background ? { background } : undefined}
    >
      <h2 id={`${id}-title`} className="sr-only">
        {ariaLabel}
      </h2>
      <div className="scene-stage">{children}</div>
    </section>
  );
});
