/**
 * <PaybackScale> — slide 11 zone D: «Весы окупаемости» (landing_v2.md §4
 * slide 11 + Director's cut).
 *
 * JSX renders the FROZEN POST-BUILD state (beam tipped −7°, pans
 * counter-rotated +7°, stamp + SHRM visible) — the SSR/noscript frame.
 * At runtime the slide's gsap hooks own every state:
 *   DORMANT  — zone hidden, beam level, stamp/SHRM hidden.
 *   SETTLED  — zone at 40% opacity, beam LEVEL (±0.3° waiting sway idle),
 *              numbers dim, no stamp (Director's cut readability staging).
 *   BUILT    — «1,5 млн ₽» counted up, beam −7° (1° overshoot settle),
 *              pans counter-rotated (text stays level), stamp slammed
 *              (sanctioned, §2.3), SHRM line visible; ±0.4° micro-sway.
 *
 * Geometry: rotate(-7deg) drops the LEFT end (CSS positive = clockwise),
 * i.e. the heavier «замена плохого найма» pan sinks — real-scale physics.
 */
import { cn } from "@/lib/cn";

export function PaybackScale({ className }: { className?: string }) {
  return (
    <div data-zone-d className={cn("text-center", className)}>
      {/* Stamp zone floats above the fulcrum (spec zone D). */}
      <p
        data-stamp
        className="font-display mx-auto max-w-[36ch] text-[14px] leading-snug text-paper lg:text-[length:var(--text-lede)]"
      >
        Один предотвращённый плохой найм окупает «Команду» на 2,5 года
      </p>
      <p data-shrm className="mt-1 text-[11px] text-dim lg:text-meta">
        SHRM: замена = 100% годовой зарплаты
      </p>

      {/* Beam assembly — mobile beam span ~300px, desktop ~560px. */}
      <div className="relative mx-auto mt-2 h-[88px] w-full max-w-[300px] lg:mt-3 lg:h-[104px] lg:max-w-[560px]">
        {/* Flame fulcrum (static triangle, below the beam line). */}
        <svg
          aria-hidden="true"
          className="absolute left-1/2 top-[10px] h-[18px] w-[20px] -translate-x-1/2"
          viewBox="0 0 20 18"
        >
          <path d="M10 0 L20 18 L0 18 Z" fill="var(--color-flame)" />
        </svg>

        {/* Beam, tipped −7°: left (heavy) end down. */}
        <div
          data-beam
          className="absolute left-0 right-0 top-[8px] origin-center -rotate-[7deg]"
        >
          <div className="h-1 w-full rounded-full bg-line-strong" />

          {/* Left pan — sterile tone: the cost of a bad hire. */}
          <div
            data-pan-left
            className="absolute left-0 top-1 w-[136px] origin-top rotate-[7deg] lg:w-[200px]"
          >
            <div className="mx-auto h-3 w-px bg-line-strong" />
            <div className="rounded-xl border border-sterile/40 bg-fog px-2 py-1.5">
              <p
                data-pan-label
                className="text-[10px] leading-snug text-mute lg:text-[12px]"
              >
                <span
                  data-pan-num
                  className="font-display whitespace-nowrap font-semibold tabular-nums text-sterile"
                >
                  1,5 млн ₽
                </span>{" "}
                — замена плохого найма
              </p>
            </div>
          </div>

          {/* Right pan — flame tone: a year of «Команда». */}
          <div
            data-pan-right
            className="absolute right-0 top-1 w-[136px] origin-top rotate-[7deg] lg:w-[200px]"
          >
            <div className="mx-auto h-3 w-px bg-line-strong" />
            <div className="rounded-xl border border-flame/50 bg-fog px-2 py-1.5">
              <p className="text-[10px] leading-snug text-mute lg:text-[12px]">
                <span className="font-display whitespace-nowrap font-semibold tabular-nums text-flame">
                  588 тыс ₽
                </span>{" "}
                — год „Команды“
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
