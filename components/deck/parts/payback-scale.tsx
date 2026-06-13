/**
 * <PaybackScale> — slide 11 zone D: «Окупаемость» casino lock-in (landing_v2.md
 * §4 slide 11 + Director's cut, SUPERSEDED 2026-06-13: the physical payback
 * beam was replaced by a two-card lock-in flicker).
 *
 * JSX renders the FROZEN POST-BUILD state (the roulette has stopped on the
 * cheaper year) — the SSR/noscript frame. At runtime the slide's gsap hooks
 * own every state:
 *   DORMANT  — zone hidden, both cards neutral, glows off, strike undrawn.
 *   SETTLED  — zone at 40% opacity, both cards neutral, no verdict
 *              (Director's cut readability staging).
 *   BUILT    — the right card («год „Команды“») is LOCKED (flame border +
 *              glow); the left card («1,5 млн ₽» — замена плохого найма) is
 *              dimmed with a flame strike across the sum; the verdict line has
 *              risen below.
 *
 * The two cards are equal-weight on purpose — the flicker, not the layout,
 * carries the meaning (a slowing roulette that locks on the cheaper year).
 */
import { cn } from "@/lib/cn";

export function PaybackScale({ className }: { className?: string }) {
  return (
    <div data-zone-d className={cn("text-center", className)}>
      {/* Two equal lock-in cards: cost of a bad hire vs a year of «Команда». */}
      <div className="mx-auto grid max-w-[300px] grid-cols-2 gap-2 lg:max-w-[560px] lg:gap-3">
        {/* Left — the cost of a bad hire (sterile tone, struck out on lock). */}
        <div
          data-card-bad
          className="relative overflow-hidden rounded-xl border border-line bg-fog px-2 py-2 lg:px-3 lg:py-3"
        >
          <span
            data-card-glow
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,90,31,0.35), transparent 70%)",
            }}
          />
          <span className="relative inline-block whitespace-nowrap">
            <span
              data-sum-bad
              className="font-display text-[17px] font-semibold tabular-nums text-sterile lg:text-[22px]"
            >
              1,5 млн ₽
            </span>
            {/* Flame strike over the prevented cost — DrawSVG on lock. */}
            <svg
              data-strike-sum
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[0.2em] w-full -translate-y-1/2 overflow-visible"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 6.5 L100 3.5"
                fill="none"
                stroke="var(--color-flame)"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>
          <p className="mt-0.5 text-[10px] leading-snug text-mute lg:text-[12px]">
            замена плохого найма
          </p>
        </div>

        {/* Right — a year of «Команда» (flame tone, the locked winner). */}
        <div
          data-card-good
          className="relative overflow-hidden rounded-xl border border-line bg-fog px-2 py-2 lg:px-3 lg:py-3"
        >
          <span
            data-card-glow
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,90,31,0.35), transparent 70%)",
            }}
          />
          <span className="font-display relative whitespace-nowrap text-[17px] font-semibold tabular-nums text-flame lg:text-[22px]">
            588 тыс ₽
          </span>
          <p className="mt-0.5 text-[10px] leading-snug text-mute lg:text-[12px]">
            год „Команды“
          </p>
        </div>
      </div>

      {/* Verdict rises on lock; SHRM anchor stays the small print. */}
      <p
        data-verdict
        className="mx-auto mt-3 max-w-[42ch] text-[13px] leading-snug text-paper lg:mt-4 lg:text-[16px]"
      >
        один предотвращённый найм = 2,5 года „Команды“
      </p>
      <p data-shrm className="mt-1 text-[11px] text-dim lg:text-meta">
        SHRM: замена = 100% годовой зарплаты
      </p>
    </div>
  );
}
