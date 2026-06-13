"use client";

/**
 * Slide 12 — Конкуренты · «Вердикт-таблица» (landing_v2.md §4 slide 12 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 12).
 *
 * NO build step (Director's cut): the quote + pentagon beat auto-chains
 * ~1.5s after the entrance settles — the gap lives INSIDE the entrance
 * timeline, so a gesture mid-gap (controller: finish-entrance) jumps
 * straight to the final frame, and onLeave's finishTimeline kills any
 * off-screen chaining for fast scrollers. One gesture leaves the slide.
 *
 * Entrance (settle ≈3.55s, then +1.5s gap, chain ends ≈7.8s):
 *   0.0  headline SplitText words rise (reverted post-chain, §6)
 *   0.3  table card + header in (y12, expo.out)
 *   0.6  five competitor rows cascade x−16 stagger 0.12; per row, cells
 *        stamp with 0.04s intra-row stagger — ✓ mute fade 0.2s, ✗ stamp
 *        scale 1.6→1 rotate −8°→0 back.out(2): 22 ✗ total, the sanctioned
 *        STAMP WALL (§2.3)
 *   2.1  КейсПодбор row: flame/8 sweep scaleX origin-left + row rise;
 *        col-1 trust ✓ quiet fade
 *   2.5  five flame ✓ LOCKS scale 2→1 back.out(3) stagger 0.16, each firing
 *        a ring span 1→1.6 fade; the competitor column above each lock dips
 *        to 60% for 0.15s — readable settle ≈3.55s, quote zone EMPTY
 *        (height reserved via autoAlpha — zero CLS)
 *   5.05 AUTO-CHAIN: rivals dim to 45% · quote card rises; the flame
 *        left-rule DRAWS (DrawSVG) while the quote reveals as a MASKED
 *        LINE-RISE (no typing, no caret — §2.3); a highlighter band sweeps
 *        line-by-line down the card (evidence being MARKED) · attribution
 *        fade · verdict words slam y16→0 while the pentagon draws 0→100%,
 *        each vertex syncing a table-✓ pulse 1.15× · footnote fades to dim
 * Idles: a random flame ✓ pulses 1.06 every ~7s (shuffled 35s cycle).
 *   Row border STATIC (binding).
 * Reduced motion: instant final post-chain frame (hook → setFrozen("built")).
 *
 * Vertical budgets (zero internal scroll) — unchanged from the P2 audit:
 *   375×620 ≈ 572 ✓ · 1366×768 ≈ 642 ✓ · 1920×1080 capped at 1080px wide.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { VerdictTable } from "@/components/deck/parts/verdict-table";

/** Auto-chain start: settle ≈3.55s + the spec's ~1.5s readable gap. */
const CHAIN_AT = 5.05;
/** Shuffled lock order for the idle pulse cycle (reads as random). */
const PULSE_ORDER = [2, 0, 4, 1, 3];

export function Slide12Competitors() {
  const { ref } = useDeckSlide({
    id: "12-competitors",
    create: ({ root, reduced }) => {
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);
      const all = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel));

      /* ---- targets ---------------------------------------------------- */
      const headlineEl = one("[data-headline]")!;
      const tableEl = one("[data-table]")!;
      const rows = all('[data-row="competitor"]');
      const usRow = one('[data-row="us"]')!;
      const sweep = one("[data-us-sweep]")!;
      const crosses = all('[data-row="competitor"] [data-glyph="cross"]');
      const rivalChecks = all('[data-row="competitor"] [data-glyph="check"]');
      const trustCheck = one('[data-row="us"] [data-col="0"]');
      const locks = [1, 2, 3, 4, 5]
        .map((i) => one(`[data-row="us"] [data-col="${i}"]`))
        .filter(Boolean) as HTMLElement[];
      const lockRings = all("[data-lock-ring]");
      const colCells = (i: number) =>
        all(`[data-row="competitor"] [data-stamp-cell][data-col="${i}"]`);
      const quote = one("[data-quote]")!;
      const quoteText = one("[data-quote-text]")!;
      const rule = root.querySelector<SVGLineElement>("[data-quote-rule] line")!;
      const marker = one("[data-marker]")!;
      const attribution = one("[data-attribution]")!;
      const verdictText = one("[data-verdict-text]")!;
      const pentagon = root.querySelector<SVGPathElement>("[data-pentagon] path")!;
      const footnote = one("[data-footnote]")!;
      const allCells = [...crosses, ...rivalChecks, ...locks];

      /* ---- geometry (measured pristine, before setDormant) -------------- */
      // The us-row sweep overlay: a <tr> background can't transform, so the
      // flame/8 band is an absolute −z sibling sized from the live row.
      const tableRect = tableEl.getBoundingClientRect();
      const usRect = usRow.getBoundingClientRect();
      gsap.set(sweep, {
        top: usRect.top - tableRect.top,
        height: usRect.height,
      });
      // The highlighter band travels the quote text top→bottom.
      const markerH = Math.max(marker.offsetHeight, 1);
      const mStart = quoteText.offsetTop;
      const mEnd = Math.max(
        quoteText.offsetTop + quoteText.offsetHeight - markerH,
        mStart,
      );

      /* ---- SplitText (reverted post-chain / in setFrozen, §6) ----------- */
      // Pin the verdict's shrink-to-fit width to its natural (un-split) value
      // FIRST: it sits in an `auto` grid column, so an inline-block word split
      // otherwise narrows the column, which widens the 1fr quote column and
      // reflows BOTH on revert — the visible "jump". Pinned, the column (and
      // the quote beside it) stay put through the whole reveal. gsap.set is
      // ctx-tracked, so the resize rebuild clears + re-measures it.
      if (!reduced)
        gsap.set(verdictText, {
          width: Math.ceil(verdictText.getBoundingClientRect().width),
        });
      let headlineSplit: SplitText | null = reduced
        ? null
        : SplitText.create(headlineEl, { type: "words" });
      let quoteSplit: SplitText | null = reduced
        ? null
        : SplitText.create(quoteText, { type: "lines", mask: "lines" });
      let verdictSplit: SplitText | null = reduced
        ? null
        : SplitText.create(verdictText, { type: "words" });
      const revertSplits = () => {
        headlineSplit?.revert();
        quoteSplit?.revert();
        verdictSplit?.revert();
        headlineSplit = quoteSplit = verdictSplit = null;
      };

      /* ---- state setters ------------------------------------------------ */
      const setDormant = () => {
        if (headlineSplit)
          gsap.set(headlineSplit.words, { autoAlpha: 0, y: 24 });
        gsap.set(tableEl, { autoAlpha: 0, y: 12 });
        gsap.set(rows, { autoAlpha: 0, x: -16 });
        gsap.set(crosses, { autoAlpha: 0, scale: 1.6, rotation: -8 });
        gsap.set(rivalChecks, { autoAlpha: 0 });
        gsap.set(usRow, { autoAlpha: 0, y: 16 });
        gsap.set(sweep, { scaleX: 0 });
        if (trustCheck) gsap.set(trustCheck, { autoAlpha: 0 });
        gsap.set(locks, { autoAlpha: 0, scale: 2 });
        gsap.set(lockRings, { autoAlpha: 0, scale: 1 });
        gsap.set(quote, { autoAlpha: 0, y: 24 });
        gsap.set(rule, { drawSVG: "0%" });
        if (quoteSplit) gsap.set(quoteSplit.lines, { yPercent: 110 });
        gsap.set(marker, { autoAlpha: 0, y: mStart });
        gsap.set(attribution, { autoAlpha: 0 });
        if (verdictSplit)
          gsap.set(verdictSplit.words, { autoAlpha: 0, y: 16 });
        gsap.set(pentagon, { drawSVG: "0%", fillOpacity: 0 });
        gsap.set(footnote, { autoAlpha: 0 });
      };

      // One frozen frame for both stages: the post-auto-chain render.
      const setFrozen = () => {
        revertSplits(); // frozen frames use whole elements
        gsap.set(tableEl, { autoAlpha: 1, y: 0 });
        gsap.set(rows, { autoAlpha: 0.45, x: 0 });
        gsap.set(allCells, {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          opacity: 1,
        });
        if (trustCheck) gsap.set(trustCheck, { autoAlpha: 1, scale: 1 });
        gsap.set(usRow, { autoAlpha: 1, y: 0 });
        gsap.set(sweep, { scaleX: 1 });
        gsap.set(lockRings, { autoAlpha: 0, scale: 1 });
        gsap.set(quote, { autoAlpha: 1, y: 0 });
        gsap.set(rule, { drawSVG: "100%" });
        gsap.set(marker, { autoAlpha: 0 });
        gsap.set(attribution, { autoAlpha: 1 });
        gsap.set(pentagon, { drawSVG: "100%", fillOpacity: 0.1 });
        gsap.set(footnote, { autoAlpha: 1 });
      };

      if (reduced) {
        // Hook applies setFrozen("built") — the full post-chain frame.
        return { entrance: gsap.timeline({ paused: true }), setFrozen, setDormant };
      }

      /* ---- entrance + auto-chain (one timeline) -------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance.set(allCells, { willChange: "transform" }, 0);
      if (headlineSplit) {
        entrance.to(
          headlineSplit.words,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.06 },
          0,
        );
      }
      entrance.to(
        tableEl,
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" },
        0.3,
      );
      // Five competitor rows cascade; cells stamp per row (the ✗ wall).
      rows.forEach((row, k) => {
        const t = 0.6 + k * 0.12;
        entrance.to(
          row,
          { autoAlpha: 1, x: 0, duration: 0.35, ease: "power3.out" },
          t,
        );
        const cells = Array.from(
          row.querySelectorAll<HTMLElement>("[data-stamp-cell]"),
        );
        cells.forEach((cell, i) => {
          const tc = t + 0.1 + i * 0.04;
          if (cell.dataset.glyph === "cross") {
            entrance.to(
              cell,
              {
                autoAlpha: 1,
                scale: 1,
                rotation: 0,
                duration: 0.25,
                ease: "back.out(2)",
              },
              tc,
            );
          } else {
            entrance.to(cell, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, tc);
          }
        });
      });
      // КейсПодбор row: flame sweep + rise; col-1 trust ✓ quiet fade.
      entrance
        .to(sweep, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 2.1)
        .to(usRow, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 2.1);
      if (trustCheck)
        entrance.to(trustCheck, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 2.25);
      // Five flame ✓ LOCKS — each presses its competitor column.
      locks.forEach((lock, k) => {
        const t = 2.5 + k * 0.16;
        entrance.to(
          lock,
          { autoAlpha: 1, scale: 1, duration: 0.22, ease: "back.out(3)" },
          t,
        );
        if (lockRings[k]) {
          entrance
            .set(lockRings[k], { autoAlpha: 0.8, scale: 1 }, t)
            .to(
              lockRings[k],
              { autoAlpha: 0, scale: 1.6, duration: 0.4, ease: "power1.out" },
              t + 0.02,
            );
        }
        entrance.to(
          colCells(k + 1),
          { opacity: 0.6, duration: 0.15, ease: "power1.inOut", yoyo: true, repeat: 1 },
          t,
        );
      });
      entrance.set(allCells, { willChange: "auto" }, 3.6);
      // ---- readable settle ≈3.55s; quote zone stays EMPTY for ~1.5s ----
      // ---- the auto-chain (inside the tl — a mid-gap gesture jumps it) ----
      entrance
        .to(rows, { autoAlpha: 0.45, duration: 0.4, ease: "power1.inOut" }, CHAIN_AT)
        .to(quote, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, CHAIN_AT)
        .to(rule, { drawSVG: "100%", duration: 0.5, ease: "power2.inOut" }, CHAIN_AT + 0.1);
      if (quoteSplit) {
        entrance.to(
          quoteSplit.lines,
          { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.1 },
          CHAIN_AT + 0.2,
        );
      }
      entrance
        // Highlighter sweep — a masked band marking the evidence line-by-line.
        .set(marker, { autoAlpha: 1, y: mStart }, CHAIN_AT + 0.85)
        .to(marker, { y: mEnd, duration: 0.7, ease: "power1.inOut" }, CHAIN_AT + 0.85)
        .to(marker, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, CHAIN_AT + 1.55)
        .to(attribution, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, CHAIN_AT + 1.15);
      // Verdict words slam while the pentagon draws; vertices pulse the ✓s.
      if (verdictSplit) {
        entrance.to(
          verdictSplit.words,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out", stagger: 0.06 },
          CHAIN_AT + 1.45,
        );
      }
      entrance.to(
        pentagon,
        { drawSVG: "100%", duration: 0.8, ease: "power1.inOut" },
        CHAIN_AT + 1.45,
      );
      locks.forEach((lock, k) => {
        const t = CHAIN_AT + 1.61 + k * 0.16;
        entrance
          .to(lock, { scale: 1.15, duration: 0.08, ease: "power2.out" }, t)
          .to(lock, { scale: 1, duration: 0.12, ease: "power2.inOut" }, t + 0.08);
      });
      entrance
        .to(pentagon, { fillOpacity: 0.1, duration: 0.3, ease: "power1.inOut" }, CHAIN_AT + 2.25)
        .to(footnote, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, CHAIN_AT + 2.35)
        .call(() => revertSplits());

      /* ---- idles: random flame ✓ pulse every ~7s (rest is STILL) -------- */
      const makeIdles = (): gsap.core.Animation[] => {
        const loop = gsap.timeline({ repeat: -1 }); // deck-contract: idle
        PULSE_ORDER.forEach((idx, k) => {
          const g = locks[idx];
          if (!g) return;
          const t = 7 * (k + 1);
          loop
            .to(g, { scale: 1.06, duration: 0.15, ease: "sine.inOut" }, t)
            .to(g, { scale: 1, duration: 0.2, ease: "sine.inOut" }, t + 0.15);
        });
        loop.add(() => {}, 7 * (PULSE_ORDER.length + 1)); // pad the cycle
        return [loop];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
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
        <h3
          data-headline
          className="font-display text-[length:var(--text-h1)] text-paper"
        >
          Мы не одни. И&nbsp;это хорошая новость.
        </h3>

        {/* ---- The verdict table ---- */}
        <VerdictTable className="mt-3 lg:mt-5" />

        {/* ---- Bottom zone: quote + verdict/pentagon — height reserved
                 (autoAlpha keeps layout), so the auto-chain causes no CLS ---- */}
        <div className="mt-3 grid items-center gap-3 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
          <figure
            data-quote
            className="relative overflow-hidden rounded-2xl border border-line bg-fog p-3 pl-4 lg:p-4 lg:pl-5"
          >
            {/* Flame left-rule — drawn (DrawSVG) as the quote reveals. */}
            <svg
              data-quote-rule
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-[2px]"
              viewBox="0 0 2 100"
              preserveAspectRatio="none"
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="100"
                stroke="var(--color-flame)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Highlighter band — translateY sweep, evidence being MARKED. */}
            <span
              data-marker
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 right-0 top-0 h-[1.6em] bg-flame/10 opacity-0"
            />
            <blockquote
              data-quote-text
              className="text-[14px] italic leading-snug text-mute lg:text-[length:var(--text-lede)]"
            >
              «Задача — не детектить ИИ-читерство, а&nbsp;определять, когда
              помощь ИИ легитимна.»
            </blockquote>
            <figcaption
              data-attribution
              className="mt-1.5 text-[11px] text-dim lg:text-meta"
            >
              — HackerRank, руководство 2025
            </figcaption>
          </figure>

          <div data-verdict className="flex items-center gap-3 lg:gap-4">
            {/* Pentagon seal — 48px mobile / 80px desktop (DrawSVG). */}
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
            <p
              data-verdict-text
              className="font-display max-w-[16ch] text-[20px] text-paper lg:text-[length:var(--text-h2)]"
            >
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
