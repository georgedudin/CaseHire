/**
 * Scissors chart — slide 03 «Перцепционные ножницы» (landing_v2.md §4, slide 03).
 *
 * Static FINAL state: bars fully sheared. Sterile/dashed perception bar
 * extends RIGHT of the zero axis; flame reality bar extends LEFT past zero;
 * a bracket spans the vertical gap between the bar tips with −19% sitting in
 * it. Micro-tags annotate the bar tips (Director's cut: self-annotating bars).
 *
 * Motion hooks (P3): data-axis · data-bar-ghost · data-bar-flame ·
 * data-bracket · data-stat="metr" · data-tag-ghost · data-tag-flame.
 * Bars scale on `scaleX` from the axis; the bracket is DrawSVG-able.
 */

const CHART_VIEWBOX = "0 0 700 240";

export function ScissorsChart({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative">
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
            y="50"
            width="344"
            height="28"
            rx="3"
            fill="var(--color-sterile)"
            fillOpacity="0.4"
            stroke="var(--color-sterile)"
            strokeOpacity="0.7"
            strokeDasharray="6 4"
            style={{ transformOrigin: "266px 64px" }}
          />

          {/* Reality bar — flame gradient, extends LEFT past zero.
              transform-origin for the P3 shear: right edge at the axis. */}
          <rect
            data-bar-flame
            x="130"
            y="134"
            width="136"
            height="28"
            rx="3"
            fill="url(#scissors-flame-grad)"
            style={{ transformOrigin: "266px 148px" }}
          />

          {/* Bracket spanning the vertical gap between bar tips. */}
          <path
            data-bracket
            d="M128,78 L118,78 L118,134 L128,134"
            stroke="var(--color-mute)"
            strokeWidth="1.5"
          />
        </svg>

        {/* −19% — sits in the bracket gap between the sheared bars. */}
        <p
          data-stat="metr"
          className="font-display absolute left-[21%] top-[44%] -translate-y-1/2 text-[clamp(3.25rem,7vw,6rem)] tabular-nums leading-none text-ember"
        >
          −19%
        </p>

        {/* Micro-tags at the bar tips (Director's cut). */}
        <span
          data-tag-ghost
          className="absolute right-[8%] top-[12%] max-w-[18ch] text-right text-[11px] leading-tight text-sterile lg:text-[length:var(--text-meta)]"
        >
          были уверены, что быстрее
        </span>
        <span
          data-tag-flame
          className="absolute bottom-[12%] left-[4%] max-w-[14ch] text-[11px] leading-tight text-ember lg:text-[length:var(--text-meta)]"
        >
          работали медленнее
        </span>
      </div>
    </div>
  );
}
