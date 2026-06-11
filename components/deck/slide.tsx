"use client";

/**
 * <Slide> — the deck slide shell (landing_v2.md §4.1; replaces v1 <Scene>).
 *
 * Renders one snap unit:
 *   section.slide-wrap[data-deck-slide]   — 100svh (200svh at lg+ if hasBuild)
 *     div.slide                            — sticky stage, exactly one viewport
 *       sr-only h2 + sr-only summary
 *       div.slide-content                  — per-slide py-* overrides via className
 *
 * No ScrollTriggers, no exit fades — the DeckController owns all motion.
 */
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type SlideProps = {
  id: string;
  /** sr-only heading, e.g. «Ловушка на работу с данными». */
  title: string;
  /** sr-only paragraph carrying the slide's stats/claims (spec §6). */
  srSummary?: ReactNode;
  hasBuild?: boolean;
  /** Extra classes on .slide-content (per-slide vertical density). */
  className?: string;
  /** Stage background override (slide 5: "#000"). */
  background?: string;
  children: ReactNode;
};

export const Slide = forwardRef<HTMLElement, SlideProps>(function Slide(
  { id, title, srSummary, hasBuild = false, className, background, children },
  ref,
) {
  return (
    <section
      ref={ref}
      id={id}
      data-deck-slide={id}
      aria-labelledby={`${id}-title`}
      className={cn("slide-wrap", hasBuild && "slide-wrap--build")}
    >
      <div className="slide" style={background ? { background } : undefined}>
        <h2 id={`${id}-title`} className="sr-only">
          {title}
        </h2>
        {srSummary ? <p className="sr-only">{srSummary}</p> : null}
        {/* py-8 = the deck default; per-slide py-* overrides replace it via
            tailwind-merge (a CSS default would out-cascade the utilities). */}
        <div className={cn("slide-content py-8", className)}>{children}</div>
      </div>
    </section>
  );
});
