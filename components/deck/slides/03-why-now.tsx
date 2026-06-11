"use client";

/**
 * Slide 03 — Почему сейчас: ИИ выровнял всех · «Перцепционные ножницы»
 * (landing_v2.md §4, slide 03 + Director's cut).
 *
 * P2 static skeleton: final AUTO-CHAINED state — per the Director's cut there
 * is NO build step. The antithesis line is part of the final frozen state:
 * an absolutely-positioned centered overlay (zero flow height); the three
 * cards sit at 60% under it on desktop only (mobile cards do NOT dim).
 * Shopify/Coinbase chips carry their permanent rotations PRE-SET (−2°/+1.5°)
 * — no stamp grammar (reserved, §2.3).
 *
 * Motion hooks: data-headline · data-cards · data-card · data-antithesis ·
 * data-underline · data-chip · plus the parts' hooks (data-axis, data-bar-
 * ghost, data-bar-flame, data-bracket, data-dial-arc, data-needle, data-stat).
 *
 * Vertical budget:
 *   375×620 : py-6 (48) + headline ~56 (h2 floor 24px ×2) + 12 + scissors
 *             card ~190 + 8 + dial card ~150 + 8 + mandate ~110 ≈ 574 → fits.
 *             Antithesis overlay adds zero flow height.
 *   1366×768: py-10 (80) + headline ~80 + 24 + grid row ~400 (scissors ~380
 *             vs dial ~210 + mandate ~150 + gap) ≈ 584 → fits.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { ScissorsChart } from "@/components/deck/parts/scissors-chart";
import { TrustDial } from "@/components/deck/parts/trust-dial";

export function Slide03WhyNow() {
  const { ref } = useDeckSlide({
    id: "03-why-now",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="03-why-now"
      title="Почему сейчас: ИИ выровнял всех, но не сделал равными"
      srSummary="METR, строгий эксперимент, 2025: опытные разработчики с ИИ работали на 19% медленнее — и были уверены, что быстрее. Только 43% разработчиков доверяют точности ответов ИИ (Stack Overflow 2024). Shopify и Coinbase: ИИ-компетенция — критерий аттестации; инженеров без неё увольняют. Требование — есть. Инструмента, который его проверяет, — нет."
      className="py-6 lg:py-10"
    >
      <h3
        data-headline
        className="font-display text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-h1)]"
      >
        ИИ выровнял всех. <span className="text-mute">Но не сделал равными.</span>
      </h3>

      {/* Cards — dimmed to 60% under the antithesis overlay on desktop only. */}
      <div
        data-cards
        className="mt-3 grid gap-2 lg:mt-6 lg:grid-cols-12 lg:gap-6 lg:opacity-60"
      >
        {/* Scissors card */}
        <div
          data-card="metr"
          className="rounded-2xl border border-line bg-fog p-3 lg:col-span-7 lg:p-6"
        >
          <ScissorsChart />
          <p className="mt-2 text-[length:var(--text-meta)] leading-snug text-mute lg:mt-3">
            опытные разработчики с ИИ работали медленнее — и были уверены, что
            быстрее
          </p>
          <p className="mt-1 text-[length:var(--text-meta)] text-dim">
            METR, строгий эксперимент, 2025
          </p>
        </div>

        <div className="grid gap-2 lg:col-span-5 lg:gap-6">
          {/* Trust dial card */}
          <div
            data-card="trust"
            className="rounded-2xl border border-line bg-fog p-3 lg:p-6"
          >
            <div className="flex items-center gap-4 lg:gap-6">
              <TrustDial className="w-[96px] shrink-0 lg:w-[160px]" />
              <p
                data-stat="trust"
                className="font-display text-[clamp(2.75rem,4.5vw,4rem)] tabular-nums leading-none text-paper"
              >
                43%
              </p>
            </div>
            <p className="mt-2 text-[length:var(--text-meta)] leading-snug text-mute lg:mt-3">
              только столько разработчиков доверяют точности ответов ИИ
            </p>
            <p className="mt-1 text-[length:var(--text-meta)] text-dim">
              Stack Overflow 2024
            </p>
          </div>

          {/* Mandate card — chips with PRE-SET rotation, no stamp grammar. */}
          <div
            data-card="mandate"
            className="rounded-2xl border border-line bg-fog p-3 lg:p-6"
          >
            <div className="flex items-center gap-3">
              <span
                data-chip="shopify"
                className="inline-block rounded border border-line-strong px-3 py-1 text-[length:var(--text-meta)] uppercase tracking-[0.12em] text-paper"
                style={{ transform: "rotate(-2deg)" }}
              >
                Shopify
              </span>
              <span
                data-chip="coinbase"
                className="inline-block rounded border border-line-strong px-3 py-1 text-[length:var(--text-meta)] uppercase tracking-[0.12em] text-paper"
                style={{ transform: "rotate(1.5deg)" }}
              >
                Coinbase
              </span>
            </div>
            <p className="mt-2 text-[length:var(--text-meta)] leading-snug text-mute lg:mt-3 lg:text-[length:var(--text-body)]">
              ИИ-компетенция — критерий аттестации; инженеров без неё{" "}
              <span className="relative inline-block text-paper">
                увольняют
                <span
                  data-underline
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-flame"
                />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Antithesis — final auto-chained state, absolutely positioned overlay
          against the .slide stage (zero flow height, Director's cut). */}
      <div
        data-antithesis
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-5"
      >
        <p className="font-display max-w-[22ch] text-center text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-display)]">
          Требование — есть. Инструмента, который его проверяет, —{" "}
          <span className="text-flame">нет.</span>
        </p>
      </div>
    </Slide>
  );
}
