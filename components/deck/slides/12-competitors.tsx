"use client";

/**
 * Slide 12 — Конкуренты · «Вердикт-таблица» (landing_v2.md §4 slide 12 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 12).
 *
 * NO build step (Director's cut cut it): the quote + pentagon beat
 * auto-chains ~1.5s after entrance settles — that timer lives INSIDE the
 * scene's P3 timeline (not the controller's build auto-chain, which is
 * build-slides-only), killed in onLeave.
 *
 * P2 STATIC SKELETON — renders the FROZEN POST-AUTO-CHAIN state:
 *   full table (competitor rows at 45%), quote card with flame left rule,
 *   verdict line + lit 80px pentagon, desktop footnote. ✗ are dim gray —
 *   NEVER red (§2.4); flame is the only accent.
 *
 * Vertical budgets (zero internal scroll):
 *   375×620  — py-6 → 572 avail: headline ~64 + table (80px header +
 *              6×~38px rows ≈ 310) + quote ~104 + verdict ~60 + gaps 34
 *              ≈ 572 ✓ (footnote cut on mobile per cut)
 *   1366×768 — py-8 → 704 avail: headline ~72 + table ~364 (56px header +
 *              6×48px rows + card chrome) + bottom zone ~140 + footnote 22
 *              + gaps 44 ≈ 642 ✓
 *   1920×1080 — table caps at 1080px wide; same ladder with air.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { VerdictTable } from "@/components/deck/parts/verdict-table";

export function Slide12Competitors() {
  const { ref } = useDeckSlide({
    id: "12-competitors",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="12-competitors"
      title="Конкуренты"
      srSummary={
        <>
          Мы не одни — и это хорошая новость. HackerRank, Codility (Cody),
          CodeSignal (Cosmo), CoderPad и Karat NextGen ($248 млн) дают ИИ в
          среде, но ни у одного нет канала на утечки, специализации под
          джунов, кейса под позицию и локального развёртывания в РФ.
          HackerRank, руководство 2025: «Задача — не детектить ИИ-читерство, а
          определять, когда помощь ИИ легитимна.» Пять осей. Не пересекаются
          ни с одним игроком. hh.ru, Skillaz и Поток автоматизируют воронку,
          но не оценивают процесс.
        </>
      }
      className="py-6 lg:py-8"
    >
      <div className="mx-auto max-w-[1080px]">
        {/* ---- Headline ---- */}
        <h3 className="font-display text-[length:var(--text-h1)] text-paper">
          Мы не одни. И&nbsp;это хорошая новость.
        </h3>

        {/* ---- The verdict table (frozen: rivals at 45%) ---- */}
        <VerdictTable className="mt-3 lg:mt-5" />

        {/* ---- Bottom zone: quote + verdict/pentagon (height reserved
                 in P3 to prevent CLS during the auto-chain) ---- */}
        <div className="mt-3 grid items-center gap-3 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
          <figure
            data-quote
            className="rounded-2xl border border-line border-l-2 border-l-flame bg-fog p-3 lg:p-4"
          >
            <blockquote className="text-[14px] italic leading-snug text-mute lg:text-[length:var(--text-lede)]">
              «Задача — не детектить ИИ-читерство, а&nbsp;определять, когда
              помощь ИИ легитимна.»
            </blockquote>
            <figcaption className="mt-1.5 text-[11px] text-dim lg:text-meta">
              — HackerRank, руководство 2025
            </figcaption>
          </figure>

          <div data-verdict className="flex items-center gap-3 lg:gap-4">
            {/* Pentagon seal — 48px mobile / 80px desktop (P3: DrawSVG). */}
            <svg
              data-pentagon
              aria-hidden="true"
              className="h-12 w-12 shrink-0 lg:h-20 lg:w-20"
              viewBox="0 0 100 100"
            >
              <path
                d="M50 4 L95.6 37.2 L78.2 90.8 L21.8 90.8 L4.4 37.2 Z"
                fill="var(--color-flame)"
                fillOpacity="0.1"
                stroke="var(--color-flame)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <p className="font-display max-w-[16ch] text-[20px] text-paper lg:text-[length:var(--text-h2)]">
              Пять осей. Не&nbsp;пересекаются ни&nbsp;с&nbsp;одним игроком.
            </p>
          </div>
        </div>

        {/* ---- Desktop-only footnote (cut on mobile per Director's cut) ---- */}
        <p data-footnote className="mt-3 hidden text-meta text-dim lg:block">
          hh.ru · Skillaz · Поток — автоматизируют воронку, но не оценивают
          процесс
        </p>
      </div>
    </Slide>
  );
}
