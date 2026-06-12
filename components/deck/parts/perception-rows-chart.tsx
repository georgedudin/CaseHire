/**
 * Perception-rows chart — slide 03 «ощущение vs замер» (landing_v2.md §4,
 * slide 03; survey-style redesign 2026-06-12, supersedes the diverging
 * "scissors").
 *
 * Static FINAL state: two horizontal bars grow RIGHT from one left baseline,
 * lengths PROPORTIONAL to their values (k=22): the dashed sterile perception
 * bar = +20 (440 units), the flame measured bar = −19 (418 units) — almost
 * equal, which IS the paradox. Each row is self-explanatory: a label above
 * the bar (dim uppercase category + tinted caption fragment) and its number
 * at the bar tip — «+20%» sterile secondary, «−19%» ember HERO. Numbers are
 * sized in cqw (the wrapper is a @container) so they scale with the CARD and
 * the HTML overlays can never drift off the SVG geometry.
 *
 * Motion hooks (P3): data-baseline · data-bar-ghost · data-bar-flame ·
 * data-bar-flame-glow (idle ember pulse overlay, opacity 0 at rest) ·
 * data-stat="ghost" · data-stat="metr" · data-tag-ghost · data-tag-flame.
 * Bars scale on `scaleX` from the LEFT baseline (centers 24,69 / 24,151 —
 * keep the slide's svgOrigins in sync). The dashed ghost bar is never
 * DrawSVG'd (DrawSVG erases stroke-dasharray); dasharray period 10 divides
 * the −20 idle dashoffset loop, so the drift is seamless.
 */

const CHART_VIEWBOX = "0 0 700 200";

export function PerceptionRowsChart({ className }: { className?: string }) {
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
              id="perception-flame-grad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="var(--color-flame)" />
              <stop offset="100%" stopColor="var(--color-ember)" />
            </linearGradient>
          </defs>

          {/* Shared left baseline */}
          <line
            data-baseline
            x1="24"
            y1="24"
            x2="24"
            y2="176"
            stroke="var(--color-line-strong)"
            strokeWidth="2"
          />

          {/* Perception bar — sterile, 40% fill + dashed outline (imaginary).
              Length 22×20 = 440. transform-origin: left edge at baseline. */}
          <rect
            data-bar-ghost
            x="24"
            y="56"
            width="440"
            height="26"
            rx="3"
            fill="var(--color-sterile)"
            fillOpacity="0.4"
            stroke="var(--color-sterile)"
            strokeOpacity="0.7"
            strokeDasharray="6 4"
            style={{ transformOrigin: "24px 69px" }}
          />

          {/* Measured bar — flame gradient. Length 22×19 = 418. */}
          <rect
            data-bar-flame
            x="24"
            y="138"
            width="418"
            height="26"
            rx="3"
            fill="url(#perception-flame-grad)"
            style={{ transformOrigin: "24px 151px" }}
          />

          {/* Ember glow overlay over the flame bar — idle pulse only (P3),
              opacity 0 at rest and in every frozen frame. */}
          <rect
            data-bar-flame-glow
            x="24"
            y="138"
            width="418"
            height="26"
            rx="3"
            fill="var(--color-ember)"
            opacity="0"
            style={{ transformOrigin: "24px 151px" }}
          />
        </svg>

        {/* Row labels — single-line, above each bar: dim uppercase category +
            the binding caption fragment in the bar's tint. */}
        <span
          data-tag-ghost
          className="absolute left-[3.4%] top-[8%] flex items-baseline gap-2 whitespace-nowrap leading-tight"
        >
          <span className="text-[10px] uppercase tracking-[0.14em] text-dim lg:text-[12px]">
            ощущение
          </span>
          <span className="text-[11px] text-sterile lg:text-[length:var(--text-meta)]">
            были уверены, что быстрее
          </span>
        </span>
        <span
          data-tag-flame
          className="absolute left-[3.4%] top-[49%] flex items-baseline gap-2 whitespace-nowrap leading-tight"
        >
          <span className="text-[10px] uppercase tracking-[0.14em] text-dim lg:text-[12px]">
            замер
          </span>
          <span className="text-[11px] text-ember lg:text-[length:var(--text-meta)]">
            работали медленнее
          </span>
        </span>

        {/* +20% — secondary stat at the perception bar's tip (tip x = 464/700
            ≈ 66.3%, row center y = 69/200 = 34.5%). */}
        <p
          data-stat="ghost"
          className="font-display absolute left-[67.5%] top-[34.5%] -translate-y-1/2 text-[length:clamp(0.875rem,3.2cqw,1.5rem)] tabular-nums leading-none text-sterile"
        >
          +20%
        </p>

        {/* −19% — the HERO, at the measured bar's tip (tip x = 442/700 ≈
            63.1%, row center y = 151/200 = 75.5%). cqw keeps it inside the
            card at every width; the 2rem floor keeps it stat-sized on 375. */}
        <p
          data-stat="metr"
          className="font-display absolute left-[64.5%] top-[75.5%] -translate-y-1/2 text-[length:clamp(2rem,9.5cqw,4.25rem)] tabular-nums leading-none text-ember"
        >
          −19%
        </p>
      </div>
    </div>
  );
}
