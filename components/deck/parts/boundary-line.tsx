/**
 * <BoundaryLine> — the trust-boundary line shared by slides 08 and 09
 * (landing_v2.md §3 boundary handoff, §4 slides 08/09).
 *
 * Two stacked SVG strokes: a 2px main stroke + an 18px low-opacity glow
 * stroke. Tones:
 *   "leak"        — static solid leak red (legacy frozen render).
 *   "circulation" — slide 09: dashed sterile→flame→sterile gradient.
 *   "trap"        — slide 08's animated stack: the boundary lives through
 *                   three states (neutral live wire → leak strobe → cooled
 *                   line-strong), each its own stroke crossfaded by GSAP via
 *                   opacity only — no color tweens, no filters:
 *                     [data-boundary-glow="neutral"|"leak"]   18px glows
 *                     [data-boundary-stroke="neutral"]        gradient wire
 *                     [data-boundary-stroke="leak"]           violation red
 *                     [data-boundary-stroke="cool"]           wounded-cool
 *                     [data-boundary-runner]                  idle 40px
 *                       bright segment (strokeDashoffset loop, pre-build)
 *                   The SSR default shows the cooled post-leak frame (the
 *                   slide's frozen "built" state, matching reduced-motion).
 *
 * Slide 08's cool-down recolors nothing: it fades the leak stroke out and
 * the cool stroke in (§2.6 timed post-build idle beat).
 */
import { useId } from "react";
import { cn } from "@/lib/cn";

type BoundaryLineProps = {
  tone: "leak" | "circulation" | "trap";
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function BoundaryLine({
  tone,
  orientation = "vertical",
  className,
}: BoundaryLineProps) {
  const rawId = useId();
  const gradId = `boundary-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const vertical = orientation === "vertical";

  const x1 = vertical ? "50%" : "0%";
  const y1 = vertical ? "0%" : "50%";
  const x2 = vertical ? "50%" : "100%";
  const y2 = vertical ? "100%" : "50%";
  const pos = { x1, y1, x2, y2 };

  const gradient = (
    <defs>
      <linearGradient
        id={gradId}
        gradientUnits="userSpaceOnUse"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
      >
        <stop offset="0%" stopColor="var(--color-sterile)" />
        <stop offset="50%" stopColor="var(--color-flame)" />
        <stop offset="100%" stopColor="var(--color-sterile)" />
      </linearGradient>
    </defs>
  );

  if (tone === "trap") {
    return (
      <svg
        aria-hidden="true"
        data-boundary
        data-tone={tone}
        className={cn(
          "block",
          vertical ? "h-full w-6" : "h-6 w-full",
          className,
        )}
      >
        {gradient}
        {/* Glows under the 2px strokes — full-strength paint, ALL state is
            CSS opacity so GSAP crossfades stay compositor-only. */}
        <line
          data-boundary-glow="neutral"
          {...pos}
          stroke="var(--color-flame)"
          strokeWidth={18}
          strokeLinecap="round"
          className="opacity-0"
        />
        <line
          data-boundary-glow="leak"
          {...pos}
          stroke="var(--color-leak)"
          strokeWidth={18}
          strokeLinecap="round"
          className="opacity-0"
        />
        <line
          data-boundary-stroke="neutral"
          {...pos}
          stroke={`url(#${gradId})`}
          strokeWidth={2}
          strokeLinecap="round"
          className="opacity-0"
        />
        <line
          data-boundary-stroke="leak"
          {...pos}
          stroke="var(--color-leak)"
          strokeWidth={2}
          strokeLinecap="round"
          className="opacity-0"
        />
        {/* Default-visible: the cooled post-leak frame (frozen "built"). */}
        <line
          data-boundary-stroke="cool"
          {...pos}
          stroke="var(--color-line-strong)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          data-boundary-runner
          {...pos}
          stroke="var(--color-sterile)"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="opacity-0"
        />
      </svg>
    );
  }

  const stroke = tone === "leak" ? "var(--color-leak)" : `url(#${gradId})`;
  const glowStroke =
    tone === "leak" ? "var(--color-leak)" : "var(--color-flame)";

  return (
    <svg
      aria-hidden="true"
      data-boundary
      data-tone={tone}
      className={cn(
        "block",
        vertical ? "h-full w-6" : "h-6 w-full",
        className,
      )}
    >
      {tone === "circulation" ? gradient : null}
      {/* 18px glow stroke under the 2px main stroke */}
      <line
        data-boundary-glow
        {...pos}
        stroke={glowStroke}
        strokeWidth={18}
        strokeOpacity={tone === "leak" ? 0.12 : 0.08}
        strokeLinecap="round"
      />
      <line
        data-boundary-stroke
        {...pos}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={tone === "circulation" ? "6 10" : undefined}
      />
    </svg>
  );
}
