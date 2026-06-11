/**
 * Trust dial — slide 03, the "stuck gauge" (landing_v2.md §4, slide 03).
 *
 * Static FINAL state: 180° gauge, arc filled to 43% of the sweep in glass
 * (#60a5fa), needle stuck at 43% (−12.6° off vertical). The needle's idle
 * "tries to climb, falls back" loop is P3; it rotates around (100,100).
 *
 * Motion hooks: data-dial-track · data-dial-arc · data-needle.
 * Geometry: center (100,100), r=80; 43% of 180° = 77.4° from the left stop →
 * arc endpoint (82.55, 21.93); needle rotation −12.6° from vertical.
 */

export function TrustDial({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 112"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Track — full 180° sweep */}
      <path
        data-dial-track
        d="M20,100 A80,80 0 0 1 180,100"
        stroke="var(--color-line-strong)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Filled arc — stuck at 43% */}
      <path
        data-dial-arc
        d="M20,100 A80,80 0 0 1 82.55,21.93"
        stroke="var(--color-glass)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Needle at 43% of sweep */}
      <line
        data-needle
        x1="100"
        y1="100"
        x2="100"
        y2="34"
        stroke="var(--color-paper)"
        strokeWidth="3"
        strokeLinecap="round"
        transform="rotate(-12.6 100 100)"
        style={{ transformOrigin: "100px 100px" }}
      />
      <circle cx="100" cy="100" r="5" fill="var(--color-line-strong)" />
    </svg>
  );
}
