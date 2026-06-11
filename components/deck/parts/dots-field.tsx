/**
 * DotsField — slide 05's 16-dot convergence field (landing_v2.md §4, slide 05).
 *
 * Sixteen absolutely-positioned dots — a deliberate visual echo of slide 4's
 * 16 respondents (8 HR + 8 candidates). One dot is `flame`, fifteen are `dim`.
 * Positions are SEEDED (hardcoded ring, radius 28–38vmin around the slide
 * center) — deterministic for QA, never runtime-random (spec risk #5).
 *
 * The component renders geometry only; ALL placement and motion is GSAP-owned
 * by 05-reveal.tsx create(): each dot is anchored at the stage center
 * (left/top 50%) and offset via transforms (xPercent/yPercent −50 + x/y in px
 * computed from the vmin seeds below), so convergence is a pure x/y→0 tween.
 *
 * CSS default opacity-0 = the frozen/no-JS render (dots are motion-only and
 * invisible in the final state).
 */
export type DotSeed = {
  /** Ring offset from slide center, in vmin units. */
  x: number;
  y: number;
  /** Diameter, px (4–6). */
  size: number;
  flame?: boolean;
};

// Seeded ring: angles ~i·22.5° + jitter, radius 28–38vmin (28–38% of the min
// viewport dimension → ~215–292px at 1366×768, ~105–142px at 375×svh).
export const DOT_SEEDS: readonly DotSeed[] = [
  { x: 32.7, y: 4.6, size: 5 },
  { x: 24.9, y: 14.9, size: 4 },
  { x: 22.2, y: 28.4, size: 6 },
  { x: 8.0, y: 29.9, size: 4 },
  { x: -4.9, y: 34.7, size: 5 },
  { x: -14.4, y: 24.0, size: 4 },
  { x: -27.2, y: 20.5, size: 6 },
  { x: -29.1, y: 7.3, size: 5 },
  { x: -36.5, y: -5.8, size: 4 },
  { x: -24.6, y: -15.4, size: 6, flame: true },
  { x: -19.4, y: -26.7, size: 5 },
  { x: -8.7, y: -34.9, size: 4 },
  { x: 4.7, y: -29.6, size: 5 },
  { x: 18.0, y: -28.8, size: 6 },
  { x: 22.7, y: -16.5, size: 4 },
  { x: 34.1, y: -7.9, size: 5 },
];

export function DotsField() {
  return (
    <div
      data-dots-field
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {DOT_SEEDS.map((d, i) => (
        <span
          key={i}
          data-dot={d.flame ? "flame" : "dim"}
          className={`absolute left-1/2 top-1/2 rounded-full opacity-0 ${
            d.flame ? "bg-flame" : "bg-dim"
          }`}
          style={{ width: d.size, height: d.size }}
        />
      ))}
    </div>
  );
}
