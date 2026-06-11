/**
 * <BoundaryLine> — the trust-boundary line shared by slides 08 and 09
 * (landing_v2.md §3 boundary handoff, §4 slides 08/09).
 *
 * Two stacked SVG strokes: a 2px main stroke + an 18px low-opacity glow
 * stroke. Tones:
 *   "leak"        — slide 08 frozen (post-leak) state: solid leak red.
 *   "circulation" — slide 09: dashed sterile→flame→sterile gradient.
 *
 * P3 hooks: [data-boundary] / [data-boundary-stroke] / [data-boundary-glow].
 * DrawSVG draws the main stroke; the glow follows; slide 08's cool-down
 * recolors [data-boundary-stroke] back to line-strong.
 */
import { useId } from "react";
import { cn } from "@/lib/cn";

type BoundaryLineProps = {
  tone: "leak" | "circulation";
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

  const stroke =
    tone === "leak" ? "var(--color-leak)" : `url(#${gradId})`;
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
      {tone === "circulation" ? (
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
      ) : null}
      {/* 18px glow stroke under the 2px main stroke */}
      <line
        data-boundary-glow
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={glowStroke}
        strokeWidth={18}
        strokeOpacity={tone === "leak" ? 0.12 : 0.08}
        strokeLinecap="round"
      />
      <line
        data-boundary-stroke
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={tone === "circulation" ? "6 10" : undefined}
      />
    </svg>
  );
}
