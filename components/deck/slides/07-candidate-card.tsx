"use client";

/**
 * Slide 07 — Карточка кандидата · «Evidence Boot» (landing_v2.md §4 slide 07
 * + Director's cut). No build step — slide 8 owns the deck's build.
 *
 * MOTION (P3):
 *   Entrance (settles ≤3.6s): headline rise → feed shell 0.98→1 → 5 rows
 *   rise stagger 0.07 in UNRANKED submission order with score count-ups →
 *   matrix card in, bars fill axis-by-axis (scaleX, stagger 0.13 per the
 *   cut) while the header average counts → digest stamps 1.06→1 with ONE
 *   amber ⚠ pulse (no typewriter, §2.3) → button/scrubber/caption fade,
 *   OVERLAPPED with the digest.
 *
 *   POST-SETTLE ONE-SHOT (Director's cut, slide-3 antithesis pattern):
 *   appended into the entrance tl after a ~2s gap (t≈5.6 — ≥1.5s of visibly
 *   unranked feed post-settle): Flip.getState(rows) → DOM reorder by score →
 *   Flip.from (0.9s power2.inOut, stagger 0.05). Соколова's flame ring fades
 *   in 0→1 and stays STATIC (§2.5 — idle life = the scrubber). will-change
 *   on rows only during the Flip window.
 *
 *   Idles: the scrubber playhead drags itself (translateX, 8s sine,
 *   repeatDelay 1.5s); ticks glow as crossed; crossing the amber 14:32 tick
 *   pulses the digest ⚠ once per pass. Killed on leave (controller).
 *
 *   Frozen state = RANKED feed (re-rank consumed): setFrozen applies the
 *   ranked DOM order instantly — ← re-entry never shows it un-ranking.
 *   setDormant restores submission order (orders derived from data-sub /
 *   data-rank, so both setters are idempotent across resize rebuilds).
 *
 * Vertical budget unchanged from the audited static skeleton (P2 header).
 * Color grammar §2.4: digest ⚠ + 14:32 tick are AMBER — slide 7 never
 * shows red (slide 8's flare owns red's first pixel).
 */
import { gsap, Flip } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { CandidateFeed } from "@/components/deck/parts/candidate-feed";
import { SessionScrubber } from "@/components/deck/parts/session-scrubber";
import { DEFAULT_AXES, ProcessMatrix } from "@/components/mockups/process-matrix";
import { addCountUp } from "@/lib/motion/count-up";

const FLIP_AT = 5.6; // ≥1.5s of unranked feed after the ~3.6s settle
const PLAYHEAD_POS = 0.68; // parked at the amber 14:32 tick
// Source of truth, never read back from the DOM (textContent writes survive
// the resize rebuild's ctx.revert).
const AVG_FINAL = Math.round(
  DEFAULT_AXES.reduce((a, b) => a + b.score, 0) / DEFAULT_AXES.length,
);

export function Slide07CandidateCard() {
  const { ref } = useDeckSlide({
    id: "07-candidate-card",
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const vis = (el: Element) => el.getClientRects().length > 0;

      /* ---- targets ---------------------------------------------------- */
      const headline = q("[data-headline]")[0];
      const feed = q("[data-feed]")[0];
      const feedList = q("[data-feed-list]")[0];
      const rows = q("[data-feed-row]") as HTMLElement[];
      const bySub = [...rows].sort(
        (a, b) => Number(a.dataset.sub) - Number(b.dataset.sub),
      );
      const byRank = [...rows].sort(
        (a, b) => Number(a.dataset.rank) - Number(b.dataset.rank),
      );
      const ringEl = q("[data-ring]")[0];
      const scoreEls = rows.map(
        (r) => r.querySelector("[data-feed-score]") as HTMLElement,
      );
      const matrixWrap = q("[data-matrix]")[0];
      const fills = q("[data-matrix-fill]");
      const finals = fills.map((f) => Number(gsap.getProperty(f, "scaleX")));
      const avgEl = q("[data-matrix-average]")[0];
      const avgFinal = AVG_FINAL;
      const digest = q("[data-digest]")[0];
      const warn = q("[data-digest-warn]")[0];
      const button = q("[data-session-btn]")[0];
      const caption = q("[data-caption]")[0];
      const scrubber = q("[data-scrubber]")[0];
      const playhead = q("[data-playhead]")[0];
      const ticks = q("[data-tick]");
      const tail = [button, caption, scrubber].filter(Boolean);

      // Scrubber geometry: playhead repositions via transform only — left is
      // zeroed once, x carries the position (idle drags it, frozen parks it).
      const scrubberLive = scrubber && vis(scrubber);
      const trackW = scrubberLive ? scrubber.clientWidth - 2 : 0;
      if (scrubber) gsap.set(playhead, { left: 0 });
      const tickXs = ticks.map(
        (t) => (parseFloat((t as HTMLElement).style.left) / 100) * trackW,
      );

      /* ---- ranked / submission order (idempotent, data-driven) --------- */
      // NOTE: never gsap.killTweensOf(rows) here — that would rip the row
      // tweens out of the PAUSED entrance timeline when setDormant runs at
      // registration. Only the detached Flip animation is killed.
      let flipAnim: gsap.core.Timeline | null = null;
      const applyOrder = (order: HTMLElement[]) => {
        if (flipAnim) {
          flipAnim.kill();
          flipAnim = null;
        }
        for (const row of order) feedList.appendChild(row);
        gsap.set(rows, { clearProps: "transform,willChange" });
      };

      const runFlip = () => {
        const visRows = rows.filter(vis);
        gsap.set(visRows, { willChange: "transform" });
        const state = Flip.getState(visRows);
        for (const row of byRank) feedList.appendChild(row);
        flipAnim = Flip.from(state, {
          duration: 0.9,
          ease: "power2.inOut",
          stagger: 0.05,
          onComplete: () => {
            gsap.set(visRows, { clearProps: "willChange" });
            flipAnim = null;
          },
        });
      };

      /* ---- state setters ----------------------------------------------- */
      const setDormant = () => {
        applyOrder(bySub);
        gsap.set(headline, { autoAlpha: 0, y: 24 });
        gsap.set(feed, { autoAlpha: 0, scale: 0.98 });
        gsap.set(rows, { autoAlpha: 0, y: 16 });
        gsap.set(ringEl, { autoAlpha: 0 });
        scoreEls.forEach((el) => {
          if (el) el.textContent = "0";
        });
        gsap.set(matrixWrap, { autoAlpha: 0, y: 12 });
        gsap.set(fills, { scaleX: 0 });
        if (avgEl) avgEl.textContent = "0";
        gsap.set(digest, { autoAlpha: 0, scale: 1.06 });
        gsap.set(warn, { opacity: 1 });
        gsap.set(tail, { autoAlpha: 0, y: 8 });
        if (playhead) gsap.set(playhead, { x: trackW * PLAYHEAD_POS });
        gsap.set(ticks, { opacity: 1, scaleY: 1 });
      };

      const setFrozen = () => {
        gsap.killTweensOf([playhead, ...ticks, warn, ringEl].filter(Boolean));
        applyOrder(byRank);
        gsap.set(headline, { autoAlpha: 1, y: 0 });
        gsap.set(feed, { autoAlpha: 1, scale: 1 });
        gsap.set(rows, { autoAlpha: 1, y: 0 });
        gsap.set(ringEl, { autoAlpha: 1 });
        scoreEls.forEach((el) => {
          if (el) el.textContent = el.dataset.score ?? el.textContent;
        });
        gsap.set(matrixWrap, { autoAlpha: 1, y: 0 });
        fills.forEach((f, i) => gsap.set(f, { scaleX: finals[i] }));
        if (avgEl) avgEl.textContent = String(avgFinal);
        gsap.set(digest, { autoAlpha: 1, scale: 1 });
        gsap.set(warn, { opacity: 1 });
        gsap.set(tail, { autoAlpha: 1, y: 0 });
        if (playhead) gsap.set(playhead, { x: trackW * PLAYHEAD_POS });
        gsap.set(ticks, { opacity: 1, scaleY: 1 });
      };

      /* ---- entrance (settle ≤3.6s; Flip one-shot appended at 5.6s) ------ */
      const entrance = gsap.timeline({ paused: true });
      entrance.fromTo(
        headline,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
        0,
      );
      entrance.fromTo(
        feed,
        { autoAlpha: 0, scale: 0.98 },
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" },
        0.15,
      );
      // Rows rise in submission (DOM) order — bySub == DOM order at dormant.
      bySub.forEach((row, i) => {
        entrance.fromTo(
          row,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
          0.3 + i * 0.07,
        );
        const score = row.querySelector("[data-feed-score]") as HTMLElement;
        addCountUp(entrance, 0.45 + i * 0.07, score, {
          to: Number(score?.dataset.score ?? 0),
          duration: 0.9,
          ease: "power2.out",
        });
      });
      entrance.fromTo(
        matrixWrap,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        1.3,
      );
      // Bars fill axis-by-axis (Director's cut stagger 0.13) + average count.
      fills.forEach((f, i) => {
        entrance.fromTo(
          f,
          { scaleX: 0 },
          { scaleX: finals[i], duration: 0.5, ease: "power3.out" },
          1.5 + i * 0.13,
        );
      });
      addCountUp(entrance, 1.5, avgEl, {
        to: avgFinal,
        duration: 1.6,
        ease: "power2.out",
      });
      // Digest stamps with a single amber ⚠ pulse (no typewriter, §2.3).
      entrance.fromTo(
        digest,
        { autoAlpha: 0, scale: 1.06 },
        { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)" },
        3.1,
      );
      entrance.fromTo(
        warn,
        { opacity: 0.2 },
        { opacity: 1, duration: 0.22, yoyo: true, repeat: 1 },
        3.2,
      );
      entrance.set(warn, { opacity: 1 }, 3.7);
      // Button + scrubber + caption — overlapped with the digest (cut).
      entrance.fromTo(
        tail,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.06 },
        3.25,
      );
      // POST-SETTLE ONE-SHOT: the Flip re-rank (≥1.5s of unranked feed).
      entrance.call(runFlip, [], FLIP_AT);
      entrance.fromTo(
        ringEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
        FLIP_AT + 0.5,
      );
      // Pad so "entering" covers the Flip window (leave/gesture → progress(1)
      // → setFrozen snaps the ranked order; applyOrder kills the live Flip).
      entrance.to({}, { duration: 0.2 }, FLIP_AT + 1.1);

      /* ---- idles: the self-dragging scrubber (§2.5) --------------------- */
      const makeIdles = (): gsap.core.Animation[] => {
        if (!scrubberLive || !playhead) return [];
        const amberIdx = ticks.findIndex(
          (t) => (t as HTMLElement).dataset.tick === "amber",
        );
        const crossed = new Set<number>();
        const drag = gsap.fromTo(
          playhead,
          { x: 0 },
          {
            x: trackW,
            duration: 8,
            ease: "sine.inOut",
            repeat: -1,
            repeatDelay: 1.5,
            onRepeat: () => crossed.clear(),
            onUpdate: () => {
              const x = Number(gsap.getProperty(playhead, "x"));
              ticks.forEach((t, i) => {
                if (crossed.has(i) || x < tickXs[i]) return;
                crossed.add(i);
                // Tick glows as the playhead crosses it.
                gsap.fromTo(
                  t,
                  { scaleY: 1.6 },
                  { scaleY: 1, duration: 0.5, ease: "power2.out" },
                );
                if (i === amberIdx && warn) {
                  // Sympathetic single ⚠ pulse on the 14:32 crossing.
                  gsap.fromTo(
                    warn,
                    { opacity: 0.4 },
                    { opacity: 1, duration: 0.45, ease: "power1.out" },
                  );
                }
              });
            },
          },
        );
        return [drag];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="07-candidate-card"
      title="Карточка кандидата: тимлид получает не код"
      srSummary="Ранжированная лента кандидатов и матрица процесса из девяти осей: понимание контекста, планирование, точность промптов, калибровка ИИ, безопасность команд, проверка, восстановление, артикуляция, безопасность данных. Автоматическая выжимка: вставил файл с API-ключом во внешний чат в 14:32. Плюс запись сессии. Решение об интервью принимается на доказательствах, не на догадках."
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
            {/* Digest row — amber ⚠, stamped at t≈3.1. */}
            <p
              data-digest
              className="rounded-xl border border-line bg-fog px-3 py-2 text-[12px] leading-snug text-mute lg:py-2.5 lg:text-meta"
            >
              <span data-digest-warn className="inline-block text-amber-400">
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
              {/* Scrubber: 220px track; the playhead drags itself (idle). */}
              <SessionScrubber className="hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
