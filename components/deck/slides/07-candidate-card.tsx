"use client";

/**
 * Slide 07 — Карточка кандидата · «Evidence Boot» (landing_v2.md §4 slide 07).
 *
 * P2 STATIC SKELETON — renders the FROZEN state: RANKED feed (re-rank
 * consumed, flame ring static on row 1), all 9 matrix bars at value, digest
 * stamped, scrubber playhead parked at the amber 14:32 tick. Entrance + the
 * one-shot Flip re-rank land in P3 via the data-* hooks.
 *
 * Vertical budget (zero internal scroll, audited):
 *   1366×768: py-12 (96) + headline ~59 + 24 + max(feed ~374 + caption,
 *             matrix ~417 + digest/button ~61) ≈ 669px ✓ (~99px slack)
 *   375×620:  py-5 (40) + headline h2 ~25 + 8 + feed top-3 ~182 + 12 +
 *             matrix ~244 (p-3 / hidden eyebrow / 11px labels / space-y-1)
 *             + 10 + digest 2 lines ~51 + 8 + button ~35 ≈ 613px ✓;
 *             caption + scrubber are desktop-only per spec.
 *
 * Color grammar §2.4: the digest ⚠ and the 14:32 tick are AMBER — slide 7
 * never shows red (slide 8's flare must own red's first pixel).
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { CandidateFeed } from "@/components/deck/parts/candidate-feed";
import { SessionScrubber } from "@/components/deck/parts/session-scrubber";
import { ProcessMatrix } from "@/components/mockups/process-matrix";

export function Slide07CandidateCard() {
  const { ref } = useDeckSlide({
    id: "07-candidate-card",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="07-candidate-card"
      title="Карточка кандидата: тимлид получает не код"
      srSummary="Ранжированная лента кандидатов и матрица процесса из девяти осей: понимание контекста, планирование, точность промптов, калибровка ИИ, безопасность команд, проверка, восстановление, артикуляция, цифровая гигиена. Автоматическая выжимка: вставил файл с API-ключом во внешний чат в 14:32. Плюс запись сессии. Решение об интервью принимается на доказательствах, не на догадках."
      className="py-5 lg:py-12"
    >
      <h3
        data-headline
        className="font-display text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-h1)]"
      >
        Тимлид получает не код.
      </h3>

      <div className="mt-2 grid gap-3 lg:mt-6 lg:grid-cols-12 lg:gap-6">
        {/* Left 5 cols — ranked feed + closing caption. */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <CandidateFeed />
          {/* Caption is desktop-only (cut on mobile per the 375 budget). */}
          <p data-caption className="hidden text-meta text-dim lg:block">
            На доказательствах. Не на догадках.
          </p>
        </div>

        {/* Right 7 cols — matrix, digest, session controls. */}
        <div className="flex flex-col gap-2.5 lg:col-span-7 lg:gap-3">
          <div data-matrix>
            <ProcessMatrix animated barsOnMobile />
          </div>

          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
            {/* Digest row — amber ⚠, stamped (frozen) state. */}
            <p
              data-digest
              className="rounded-xl border border-line bg-fog px-3 py-2 text-[12px] leading-snug text-mute lg:py-2.5 lg:text-meta"
            >
              <span data-digest-warn className="text-amber-400">
                ⚠
              </span>{" "}
              вставил файл с API-ключом во внешний чат ·{" "}
              <span className="tabular-nums text-paper">14:32</span>
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                data-session-btn
                className="w-full rounded-full border border-line-strong bg-ink/40 px-4 py-1.5 text-[13px] text-paper lg:w-auto lg:py-2 lg:text-meta"
              >
                Запись сессии
              </button>
              {/* Scrubber: 220px track, playhead parked at 14:32 (amber). */}
              <SessionScrubber className="hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
