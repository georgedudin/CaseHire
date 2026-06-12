/**
 * Perception-gap chart — slide 03 «ощущение vs замер» (landing_v2.md §4,
 * slide 03; diverging-columns redesign 2026-06-12 #2, supersedes the
 * same-day "survey rows": two same-direction bars carrying opposite signs
 * (+20 / −19) contradicted their own numbers — sign must be encoded by
 * DIRECTION, not by a glyph).
 *
 * Static FINAL state: profit/loss grammar. One horizontal ZERO line; the
 * dashed sterile «ощущение» column grows UP from it (+20, height 66u), the
 * flame «замер» column FALLS BELOW it (−19, height 62.7u) — proportional,
 * almost equal, opposite sides: the paradox is the picture. A small «0»
 * tick names the line. Labels live in the mirror quadrants (each column's
 * empty other side), x-centered on their column: «ощущение / были уверены,
 * что быстрее» below the line under the up-column, «замер / работали
 * медленнее» above the line over the down-column. Numbers at the tips:
 * «+20%» centered above the up-column, «−19%» ember HERO right of the
 * down-column. Numbers/labels are HTML overlays sized in cqw (wrapper is a
 * @container) so they scale with the CARD and never drift off the SVG.
 * Nothing touches the zero line — every overlay keeps explicit clearance
 * (the glued-to-the-line bug of the previous two designs is structural
 * here, not tuned).
 *
 * Motion hooks (P3): data-baseline (the zero line) · data-zero (the «0»
 * tick) · data-bar-ghost · data-bar-flame · data-bar-flame-glow (idle ember
 * pulse overlay, opacity 0 at rest) · data-stat="ghost" · data-stat="metr" ·
 * data-tag-ghost · data-tag-flame. Columns scale on `scaleY` FROM the zero
 * line (origins "165 140" ghost-bottom / "385 140" flame-top — keep the
 * slide's svgOrigins in sync). The dashed ghost column is never DrawSVG'd
 * (DrawSVG erases stroke-dasharray); dasharray period 10 divides the −20
 * idle dashoffset loop, so the drift is seamless.
 */

const CHART_VIEWBOX = "0 0 700 240";

export function PerceptionGapChart({ className }: { className?: string }) {
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
            {/* Vertical flame gradient — hottest at the zero line, cooling
                toward the fallen tip. */}
            <linearGradient
              id="perception-flame-grad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--color-flame)" />
              <stop offset="100%" stopColor="var(--color-ember)" />
            </linearGradient>
          </defs>

          {/* The zero line — the chart's only axis. */}
          <line
            data-baseline
            x1="40"
            y1="140"
            x2="660"
            y2="140"
            stroke="var(--color-line-strong)"
            strokeWidth="2"
          />
          <text
            data-zero
            x="26"
            y="140"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fill="var(--color-dim)"
          >
            0
          </text>

          {/* «ощущение» — sterile, 40% fill + dashed outline (imaginary).
              Grows UP from the line: height 3.3×20 = 66. */}
          <rect
            data-bar-ghost
            x="110"
            y="74"
            width="110"
            height="66"
            rx="3"
            fill="var(--color-sterile)"
            fillOpacity="0.4"
            stroke="var(--color-sterile)"
            strokeOpacity="0.7"
            strokeDasharray="6 4"
            style={{ transformOrigin: "165px 140px" }}
          />

          {/* «замер» — flame gradient. FALLS below the line: 3.3×19 = 62.7. */}
          <rect
            data-bar-flame
            x="330"
            y="140"
            width="110"
            height="62.7"
            rx="3"
            fill="url(#perception-flame-grad)"
            style={{ transformOrigin: "385px 140px" }}
          />

          {/* Ember glow overlay over the flame column — idle pulse only (P3),
              opacity 0 at rest and in every frozen frame. */}
          <rect
            data-bar-flame-glow
            x="330"
            y="140"
            width="110"
            height="62.7"
            rx="3"
            fill="var(--color-ember)"
            opacity="0"
            style={{ transformOrigin: "385px 140px" }}
          />
        </svg>

        {/* Labels — mirror quadrants, x-centered on their columns, with
            explicit clearance from the zero line. */}
        <span
          data-tag-ghost
          className="absolute left-[23.6%] top-[64%] flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap text-center leading-tight"
        >
          <span className="text-[10px] uppercase tracking-[0.14em] text-dim lg:text-[12px]">
            ощущение
          </span>
          <span className="text-[10px] text-sterile lg:text-[length:var(--text-meta)]">
            были уверены, что быстрее
          </span>
        </span>
        <span
          data-tag-flame
          className="absolute bottom-[44%] left-[55%] flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap text-center leading-tight"
        >
          <span className="text-[10px] uppercase tracking-[0.14em] text-dim lg:text-[12px]">
            замер
          </span>
          <span className="text-[10px] text-ember lg:text-[length:var(--text-meta)]">
            работали медленнее
          </span>
        </span>

        {/* +20% — centered above the up-column's tip (column center x =
            165/700 = 23.6%; tip y = 74/240 → number centered at ~21.7%). */}
        <p
          data-stat="ghost"
          className="font-display absolute left-[23.6%] top-[21.7%] -translate-x-1/2 -translate-y-1/2 text-[length:clamp(1rem,3.4cqw,1.75rem)] tabular-nums leading-none text-sterile"
        >
          +20%
        </p>

        {/* −19% — the HERO, right of the fallen column (column right edge =
            440/700 ≈ 62.9%; left-[65.7%] keeps a gap), vertically on the
            column's body BELOW the zero line. cqw scales it with the card;
            the 1.75rem floor keeps it stat-sized on 375. */}
        <p
          data-stat="metr"
          className="font-display absolute left-[65.7%] top-[74%] -translate-y-1/2 text-[length:clamp(1.75rem,8.5cqw,4rem)] tabular-nums leading-none text-ember"
        >
          −19%
        </p>
      </div>
    </div>
  );
}
