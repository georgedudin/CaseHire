"use client";

/**
 * Slide 09 — Две аудитории · «Circulation — the living boundary»
 * (landing_v2.md §4 slide 09).
 *
 * P2 STATIC SKELETON — frozen state: boundary drawn (circulation tone,
 * zero red — recovery beat after slide 8), settled mockups, metrics at
 * value. The circulation pulse (MotionPath orb) lands in P3 using the
 * [data-pulse-from] / [data-pulse-to] anchors.
 *
 * Vertical budget (zero internal scroll, audited):
 *   1366×768: py-10 (80) + title ~42 + 20 + buyer column: eyebrow ~18 +
 *             12 + FIXED 584px box (scale(0.92) is paint-only — the box
 *             caps the LAYOUT height; 584 ≈ natural kanban ~364 + 12 +
 *             teamlead dense ~255, × 0.92) ≈ 756px ✓ (12px slack).
 *   375×620:  py-5 (40) + title 2 lines ~50 + 8 + kanban ~190 (one card
 *             per column <sm) + 6 + teamlead strip ~36 + boundary ~20 +
 *             IDE compact ~150 (lines 2–6 folded <sm) + 6 + chips ~47
 *             ≈ 610px ✓; eyebrows stay.
 *   1920:     2xl removes the scale(0.92) trick and the fixed box
 *             (spec: un-scaled at 1920) and restores py-12 → ~819px.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { BoundaryLine } from "@/components/deck/parts/boundary-line";
import { MetricChip } from "@/components/deck/parts/metric-chip";
import { HrKanban } from "@/components/mockups/hr-kanban";
import { TeamleadSetup } from "@/components/mockups/teamlead-setup";
import { CandidateIde } from "@/components/mockups/candidate-ide";

export function Slide09TwoAudiences() {
  const { ref } = useDeckSlide({
    id: "09-two-audiences",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="09-two-audiences"
      title="Две аудитории: один продукт, две аудитории первого класса"
      srSummary="Сторона заказчика: HR живёт в канбане позиций и ранжированной ленте, тимлид заполняет четыре слоя один раз. Сторона кандидата: веб-IDE потребительского уровня и метрики здоровья платформы — 84% завершивших, лояльность 9,1 из 10, 38% вернувшихся. Заказчик и кандидат разделены живой границей, через которую циркулирует ценность."
      className="py-5 md:py-10 2xl:py-12"
    >
      <h3
        data-title
        className="font-display text-[length:var(--text-h2)] text-paper"
      >
        Один продукт. Две аудитории первого класса.
      </h3>

      <div className="mt-2 grid gap-2 lg:mt-5 lg:grid-cols-[1fr_56px_1fr] lg:gap-0">
        {/* -------------------------------------------------------------
         * BUYER zone — HrKanban + TeamleadSetup (dense at lg, strip <lg).
         * scale(0.92) wrapper trick fits both cards at 1366 (§4.09);
         * un-scaled at 2xl (≈1920 target).
         * ----------------------------------------------------------- */}
        <div
          data-zone="buyer"
          className="flex min-w-0 flex-col gap-1.5 lg:gap-3"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-dim lg:text-[11px]">
            сторона заказчика
          </p>
          {/* Fixed-height box (§4.09): scale(0.92) is visual-only, so the
              wrapper must cap the LAYOUT height itself or the column keeps
              the unscaled 100% — lg:h value = measured natural stack × 0.92.
              Un-scaled (auto) again at 2xl per spec. */}
          <div className="flex flex-col gap-1.5 lg:h-[584px] lg:origin-top lg:scale-[0.92] lg:gap-3 2xl:h-auto 2xl:scale-100">
            <div data-pulse-to>
              <HrKanban />
            </div>
            <TeamleadSetup dense className="hidden lg:block" />
            <TeamleadSetup strip className="lg:hidden" />
          </div>
        </div>

        {/* -------------------------------------------------------------
         * Boundary — same geometry as slide 8, circulation tone (no red).
         * Vertical at lg, horizontal <lg; fog pill at mid-height.
         * ----------------------------------------------------------- */}
        <div
          data-divider
          className="relative flex items-center justify-center lg:py-2"
        >
          <BoundaryLine
            tone="circulation"
            orientation="vertical"
            className="hidden lg:block"
          />
          <BoundaryLine
            tone="circulation"
            orientation="horizontal"
            className="h-4 lg:hidden"
          />
          <span
            data-pill
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-fog px-3 py-0.5 text-[10px] text-mute lg:px-3 lg:py-1 lg:text-[11px]"
          >
            заказчик ↔ кандидат
          </span>
        </div>

        {/* -------------------------------------------------------------
         * CANDIDATE zone — CandidateIde compact + 3 metric chips.
         * ----------------------------------------------------------- */}
        <div
          data-zone="candidate"
          className="flex min-w-0 flex-col gap-1.5 lg:gap-3"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-dim lg:text-[11px]">
            сторона кандидата
          </p>
          <div data-pulse-from>
            <CandidateIde compact />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            <MetricChip label="% завершивших" value="84%" />
            <MetricChip label="лояльность" value="9,1/10" />
            <MetricChip label="% вернувшихся" value="38%" />
          </div>
        </div>
      </div>
    </Slide>
  );
}
