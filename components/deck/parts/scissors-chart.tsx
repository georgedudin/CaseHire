/**
 * Scissors chart — slide 03 «Перцепционные ножницы» (landing_v2.md §4, slide 03).
 *
 * Static FINAL state: bars fully sheared. Sterile/dashed perception bar
 * extends RIGHT of the zero axis; flame reality bar extends LEFT past zero;
 * a bracket at the chart's left edge spans the vertical shear gap, and the
 * hero «−19%» fills that gap — bracket→axis, never crossing the axis. The
 * numeral is sized in cqw (the wrapper is a @container) so it scales with
 * the CARD, not the viewport — HTML overlay and SVG geometry can't drift
 * apart. Micro-tags annotate the bar tips (Director's cut: self-annotating
 * bars); single-line so they clear the bars at every container width.
 *
 * Motion hooks (P3): data-axis · data-bar-ghost · data-bar-flame ·
 * data-bar-flame-glow (idle ember pulse overlay, opacity 0 at rest) ·
 * data-bracket · data-stat="metr" · data-tag-ghost · data-tag-flame.
 * Bars scale on `scaleX` from the axis (centers y=52 / y=164 — keep the
 * slide's svgOrigins in sync); the bracket is DrawSVG-able.
 */

const CHART_VIEWBOX = "0 0 700 240";

export function ScissorsChart({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="@container relative">
        <svg
          viewBox={CHART_VIEWBOX}
          fill="none"
          aria-hidden="true"
          className="block h-auto w-full"
        >
          <defs>
            <linearGradient
              id="scissors-flame-grad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="var(--color-flame)" />
              <stop offset="100%" stopColor="var(--color-ember)" />
            </linearGradient>
          </defs>

          {/* Zero axis */}
          <line
            data-axis
            x1="266"
            y1="16"
            x2="266"
            y2="224"
            stroke="var(--color-line-strong)"
            strokeWidth="2"
          />

          {/* Perception bar — sterile, 40% fill + dashed outline (imaginary).
              transform-origin for the P3 shear: left edge at the axis. */}
          <rect
            data-bar-ghost
            x="266"
            y="38"
            width="344"
            height="28"
            rx="3"
            fill="var(--color-sterile)"
            fillOpacity="0.4"
            stroke="var(--color-sterile)"
            strokeOpacity="0.7"
            strokeDasharray="6 4"
            style={{ transformOrigin: "266px 52px" }}
          />

          {/* Reality bar — flame gradient, extends LEFT past zero.
              transform-origin for the P3 shear: right edge at the axis. */}
          <rect
            data-bar-flame
            x="130"
            y="150"
            width="136"
            height="28"
            rx="3"
            fill="url(#scissors-flame-grad)"
            style={{ transformOrigin: "266px 164px" }}
          />

          {/* Ember glow overlay over the flame bar — idle pulse only (P3),
              opacity 0 at rest and in every frozen frame. */}
          <rect
            data-bar-flame-glow
            x="130"
            y="150"
            width="136"
            height="28"
            rx="3"
            fill="var(--color-ember)"
            opacity="0"
            style={{ transformOrigin: "266px 164px" }}
          />

          {/* Bracket at the left edge, spanning the full shear gap. */}
          <path
            data-bracket
            d="M24,66 L14,66 L14,150 L24,150"
            stroke="var(--color-mute)"
            strokeWidth="1.5"
          />
        </svg>

        {/* −19% — fills the shear gap between bracket and axis. Center of the
            slot: x=(24+266)/2≈21%, y=108/240=45%. cqw keeps it inside the
            slot at every card width; the 2rem floor keeps it stat-sized on
            375 (gap is 84/240 of the svg height — the cap height always
            fits). */}
        <p
          data-stat="metr"
          className="font-display absolute left-[21%] top-[45%] -translate-x-1/2 -translate-y-1/2 text-[length:clamp(2rem,9.5cqw,4.25rem)] tabular-nums leading-none text-ember"
        >
          −19%
        </p>

        {/* Micro-tags at the bar tips (Director's cut) — single-line. */}
        <span
          data-tag-ghost
          className="absolute right-[8%] top-[4%] whitespace-nowrap text-[11px] leading-tight text-sterile lg:text-[length:var(--text-meta)]"
        >
          были уверены, что быстрее
        </span>
        <span
          data-tag-flame
          className="absolute bottom-[10%] left-[4%] whitespace-nowrap text-[11px] leading-tight text-ember lg:text-[length:var(--text-meta)]"
        >
          работали медленнее
        </span>
      </div>
    </div>
  );
}
