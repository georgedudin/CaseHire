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
   * `flow` (default): scene grows to its content, min one viewport tall.
   *   Content above 100svh scrolls through normally — no overflow:hidden.
   * `pin`: scene is pinned for `pinLength` viewport-heights and the
   *   children own a scrubbed timeline. Content must fit in one screen.
   */
  mode?: "flow" | "pin";
  /** Pin length in viewport heights — only used when mode="pin". */
  pinLength?: number;
  /** Inline background override. Defaults to `--color-ink`. */
  background?: string;
  /** Extra utility classes on the section. */
  className?: string;
  children: ReactNode;
};

/**
 * One full-viewport "moment" in the scroll narrative.
 *
 * Responsive behavior:
 *  - Pin mode triggers ONLY on desktop with no reduced-motion preference.
 *    Mobile/reduced-motion get an entry fade instead.
 *  - Flow mode doesn't pin anywhere — children handle their own reveals.
 *
 * Accessibility:
 *  - <section aria-labelledby> with a visually-hidden <h2>.
 *  - `contain: layout paint` keeps CLS isolated per scene.
 *  - DOM content is always present; opacity/transform changes don't
 *    hide content from assistive tech.
 */
export const Scene = forwardRef<HTMLElement, SceneProps>(function Scene(
  { id, ariaLabel, mode = "flow", pinLength = 1.5, background, className, children },
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
      if (mode !== "pin") return;
      const section = localRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
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
      );

      return () => mm.revert();
    },
    { scope: localRef, dependencies: [mode, pinLength] }
  );

  return (
    <section
      ref={setRefs}
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scene-shell",
        mode === "pin" ? "scene-shell--pin" : "scene-shell--flow",
        className
      )}
      style={background ? { background } : undefined}
    >
      <h2 id={`${id}-title`} className="sr-only">
        {ariaLabel}
      </h2>
      <div className="scene-stage">{children}</div>
    </section>
  );
});
