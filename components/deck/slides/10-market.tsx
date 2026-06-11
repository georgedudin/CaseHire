"use client";

/**
 * Slide 10 — Рынок · «Dive to the Ember» (landing_v2.md §4 slide 10 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 10).
 *
 * P2 STATIC SKELETON — renders the FROZEN POST-BUILD (dived) state:
 *   клин dashed ring crisp · flame SOM circle ~72px with the goal label
 *   beside it · TAM/SAM arcs at 0.15 · left column shows клин figures ·
 *   kicker «Не фантазия — арифметика.» · stage-A headline numbers kept
 *   on screen small/dim in the left column.
 * P3 adds: entrance count-ups, the camera dive (scale on [data-camera],
 *   maxScale = (0.73 × viewportH) / клинRingDiameter — true pre-dive
 *   geometry replaces this pre-composed dived drawing), ring rotation
 *   idle, ember breathe; mobile auto-chains a reduced ×3 zoom.
 *
 * Vertical budgets (zero internal scroll):
 *   375×620  — py-6 → 572 avail: eyebrow+headline ~120 + field 164 +
 *              stat card ~174 (p-3, space-y-1.5) + kicker 22 + gaps 32
 *              ≈ 512 ✓ (py-8/180px field busted 620 by 25px — audited)
 *   1366×768 — py-8 → 704 avail: left col ≈ 512 (headline 3×~56px at
 *              --text-h1 + клин stack 120 + chips 32 + stage-A 68 +
 *              kicker 28); right field caps at 560px ✓
 *              (headline uses --text-h1, not --text-display: the display
 *              clamp at 1366 inside a 38% column busts the 768 budget)
 *   1920×1080 — same composition with air; field caps at 640px.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

export function Slide10Market() {
  const { ref } = useDeckSlide({
    id: "10-market",
    hasBuild: true,
    // <lg: reduced ×3 dive auto-chains 1.5s after settle (Director's cut, §5).
    autoChainMs: 1500,
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="10-market"
      hasBuild
      title="Рынок"
      srSummary={
        <>
          Российский HR-tech — 99,3 млрд ₽ в 2024, плюс 38% за год (Smart
          Ranking). Наш сегмент — оценка и развитие — 3,85 млрд ₽, +38%. 43%
          компаний уже используют ИИ в HR, 27% тестируют для 2026 (Известия).
          Клин: 400–800 компаний, нанимающих 10–50 джунов в год; средний чек
          400–900 тыс ₽/год; потолок клина 160–720 млн ₽. Цель на 24 мес:
          20–35 млн ₽, 50–80 платящих. Не фантазия — арифметика.
        </>
      }
      className="py-6 lg:py-8"
    >
      <div className="grid gap-y-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-4">
        {/* ---- Zone 1: eyebrow + headline (left column, row 1) ---- */}
        <div className="lg:col-start-1 lg:row-start-1">
          <p
            data-eyebrow
            className="text-meta uppercase tracking-[0.32em] text-dim"
          >
            Рынок
          </p>
          <h3 className="font-display mt-3 max-w-[16ch] text-[length:var(--text-h1)] text-paper">
            Рынок есть. И&nbsp;он растёт на&nbsp;38% в&nbsp;год.
          </h3>
        </div>

        {/* ---- Zone 2: circle field, dived state (right, spans rows) ---- */}
        <div className="relative h-[164px] w-full lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:max-h-[640px]">
          <svg
            className="h-full w-full"
            viewBox="0 0 640 640"
            aria-hidden="true"
          >
            {/* P3: camera dive = single transform on this group. */}
            <g data-camera>
              {/* TAM — off-canvas planet horizon, dimmed in the dived state. */}
              <circle
                data-tam
                cx="820"
                cy="-180"
                r="900"
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
                opacity="0.15"
                vectorEffect="non-scaling-stroke"
              />
              {/* SAM — arc crossing the lower-right corner, dimmed. */}
              <circle
                data-sam
                cx="700"
                cy="700"
                r="600"
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
                opacity="0.15"
                vectorEffect="non-scaling-stroke"
              />
              {/* Клин — crisp dashed ring (P3: 60s rotation idle). */}
              <circle
                data-klin
                cx="320"
                cy="320"
                r="230"
                fill="none"
                stroke="var(--color-mute)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                opacity="0.8"
                vectorEffect="non-scaling-stroke"
              />
              {/* SOM glow halo (pre-rendered, opacity-only in P3). */}
              <circle
                data-som-glow
                cx="320"
                cy="320"
                r="64"
                fill="var(--color-flame)"
                fillOpacity="0.12"
              />
              {/* SOM — the flame ember, ~72px at desktop render size. */}
              <circle
                data-som
                cx="320"
                cy="320"
                r="41"
                fill="var(--color-flame)"
                fillOpacity="0.2"
                stroke="var(--color-flame)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {/* Goal label — HTML overlay beside the SOM circle (never inside
              the scaled group: no blurry text through the P3 camera move). */}
          <div
            data-goal
            className="absolute left-1/2 top-1/2 ml-[28px] max-w-[140px] -translate-y-1/2 lg:ml-[56px] lg:max-w-none"
          >
            <p className="text-[12px] leading-snug text-mute lg:text-meta">
              цель на 24 мес:{" "}
              <span className="font-display font-semibold tabular-nums text-flame lg:whitespace-nowrap">
                20–35 млн ₽
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-dim lg:text-[13px]">
              50–80 платящих
            </p>
          </div>
        </div>

        {/* ---- Zone 3: stat stack (left column, row 2) ---- */}
        <div className="rounded-2xl border border-line bg-fog p-3 lg:col-start-1 lg:row-start-2 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
          {/* Клин figures — the dived stage-B stack (prominent). */}
          <div data-klin-figures className="space-y-1.5 lg:space-y-2.5">
            <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
              <span className="font-display font-semibold tabular-nums">
                400–800 компаний
              </span>{" "}
              <span className="text-dim">(10–50 джунов в год)</span>
            </p>
            <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
              средний чек{" "}
              <span className="font-display font-semibold tabular-nums">
                400–900 тыс ₽/год
              </span>
            </p>
            <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
              потолок клина{" "}
              <span className="font-display font-semibold tabular-nums">
                160–720 млн ₽
              </span>
            </p>
          </div>

          {/* Docked chips 43% / 27% + (Известия). */}
          <div
            data-chips
            className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:mt-4"
          >
            <span className="rounded-full border border-line bg-fog px-2.5 py-1 text-[11px] text-mute lg:border-line-strong lg:text-[12px]">
              <span className="font-semibold tabular-nums text-paper">43%</span>{" "}
              компаний уже используют ИИ в HR
            </span>
            <span className="rounded-full border border-line bg-fog px-2.5 py-1 text-[11px] text-mute lg:border-line-strong lg:text-[12px]">
              <span className="font-semibold tabular-nums text-paper">27%</span>{" "}
              тестируют для 2026
            </span>
            <span className="text-[11px] text-dim">(Известия)</span>
          </div>

          {/* Stage-A headline numbers — dimmed/secondary in the dived state
              so the frozen frame keeps 99,3 / 3,85 on screen. */}
          <div data-stage-a className="mt-3 space-y-1 opacity-60 lg:mt-4">
            <p className="text-[12px] leading-snug text-mute lg:text-[13px]">
              <span className="font-display font-semibold tabular-nums text-paper">
                99,3 млрд ₽
              </span>{" "}
              <span className="text-dim">
                российский HR-tech, 2024, +38% · Smart Ranking
              </span>
            </p>
            <p className="text-[12px] leading-snug text-mute lg:text-[13px]">
              <span className="font-display font-semibold tabular-nums text-paper">
                3,85 млрд ₽
              </span>{" "}
              <span className="text-dim">
                наш сегмент: оценка и развитие, +38%
              </span>
            </p>
          </div>

          {/* Kicker — frozen-state closer (P3: fades up at build end). */}
          <p
            data-kicker
            className="font-display mt-3 text-[15px] font-semibold text-paper lg:mt-5 lg:text-[length:var(--text-lede)]"
          >
            Не фантазия — арифметика.
          </p>
        </div>
      </div>
    </Slide>
  );
}
