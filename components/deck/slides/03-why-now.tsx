"use client";

/**
 * Slide 03 — Почему сейчас: ИИ выровнял всех · «Перцепционные ножницы»
 * (landing_v2.md §4, slide 03 + Director's cut).
 *
 * P3 motion. NO build step (cut) — the antithesis AUTO-CHAINS as beats
 * appended INTO the entrance timeline after a 4s gap (chosen over a
 * makeIdles delayedCall: a gesture mid-gap hits the controller's
 * finish-entrance path and jumps dim + line to their end — exactly the
 * frozen state, so impatient presses can never strand the slide).
 *
 * Entrance (paused master tl, played on fixation):
 *   0.0   headline SplitText WORDS rise (y 24→0, stagger 0.05)
 *   0.2   scissors card fades · 0.3 zero-axis DrawSVG
 *   0.7   merged bar born at zero — both rects overlapped at axis mid-y,
 *         grown to a short neutral length (scaleX from the axis)
 *   1.2   THE SHEAR — ghost scaleX→1 right, flame scaleX→1 left, vertical
 *         separation y ±56→0, 0.9s power3.inOut; bracket DrawSVG follows
 *         (1.5); «−19%» counts DOWN −0→−19 (addCountUp, ru minus) while its
 *         color tweens paper→ember; bar-tip micro-tags fade (2.0)
 *   1.85  trust card fades · 2.1 dial arc DrawSVG to 43% sweep + needle
 *         −90°→−9° overshoot →−12.6° fallback (the "stuck" read) + 43% count
 *   2.75  mandate card fades · 2.9/3.05 Shopify/Coinbase chips FADE in with
 *         permanent rotations PRE-SET (NO slam/jolt — stamp grammar is
 *         reserved, §2.3) · 3.35 «увольняют» flame underline scaleX + color
 *   ≈3.8  STABLE READ — the slide is fully legible here.
 *   7.8   ANTITHESIS (settle + 4s, all form factors): cards dim to 5% /
 *         scale .965 / y −8 (0.5s quart.inOut ≡ power3.inOut) — slide 13's
 *         epitaph dim grammar, on ALL form factors (amended 2026-06-12: the
 *         old 60% desktop / undimmed mobile read as see-through collision);
 *         «Требование — есть.» word-rises first, 0.6s held pause, then the
 *         rest, «нет.» landing soft in flame (scale 1.15→1 power3.out — NOT
 *         the reserved notary slam). Timeline fully settles at ≈9.9s.
 *
 * Idles (killed on leave): needle tries to climb +2.5° and falls back
 * (bounce ≤3°) every ~3.5s; flame-bar ember glow pulse (overlay opacity
 * 0↔0.15, 4s sine); ghost bar dashed outline drift (dashoffset, seamless
 * period). Idles start after the full chain — by then the slide is frozen
 * scenery under the antithesis.
 *
 * Frozen = antithesis over dimmed cards — the static render.
 * Reduced motion: hooks are no-ops; the SSR markup (incl. opacity-5 on the
 * card grid) IS the final frame.
 *
 * Vertical budget:
 *   375×620 : py-6 (48) + headline ~56 + 12 + scissors card ~190 + 8 + dial
 *             card ~150 + 8 + mandate ~110 ≈ 574 → fits. Antithesis overlay
 *             adds zero flow height.
 *   1366×768: py-10 (80) + headline ~80 + 24 + grid row ~400 ≈ 584 → fits.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe } from "@/lib/motion/idle";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { ScissorsChart } from "@/components/deck/parts/scissors-chart";
import { TrustDial } from "@/components/deck/parts/trust-dial";

const PAPER = "#f5f5f7";
const MUTE = "#a1a1aa";
const EMBER = "#ff8a4c";

/** Merged-bar geometry: a short neutral stub each side of the axis. */
const GHOST_MERGED = 80 / 344;
const FLAME_MERGED = 80 / 136;

const SETTLE_T = 3.8;
const ANTI_T = SETTLE_T + 4; // binding: 4s after entrance settles

export function Slide03WhyNow() {
  const { ref } = useDeckSlide({
    id: "03-why-now",
    create: ({ root, reduced }) => {
      if (reduced) {
        // Static deck: SSR markup IS the final frame (antithesis visible,
        // cards dimmed via opacity-5). Hooks are no-ops.
        return {
          entrance: gsap.timeline({ paused: true }),
          setFrozen: () => {},
          setDormant: () => {},
        };
      }

      const headline = root.querySelector<HTMLElement>("[data-headline]")!;
      const cardsWrap = root.querySelector<HTMLElement>("[data-cards]")!;
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
      const axis = root.querySelector<SVGLineElement>("[data-axis]")!;
      const ghost = root.querySelector<SVGRectElement>("[data-bar-ghost]")!;
      const flame = root.querySelector<SVGRectElement>("[data-bar-flame]")!;
      const glow = root.querySelector<SVGRectElement>("[data-bar-flame-glow]")!;
      const bracket = root.querySelector<SVGPathElement>("[data-bracket]")!;
      const statMetr = root.querySelector<HTMLElement>('[data-stat="metr"]')!;
      const tagGhost = root.querySelector<HTMLElement>("[data-tag-ghost]")!;
      const tagFlame = root.querySelector<HTMLElement>("[data-tag-flame]")!;
      const dialArc = root.querySelector<SVGPathElement>("[data-dial-arc]")!;
      const needle = root.querySelector<SVGLineElement>("[data-needle]")!;
      const statTrust = root.querySelector<HTMLElement>('[data-stat="trust"]')!;
      const chips = Array.from(root.querySelectorAll<HTMLElement>("[data-chip]"));
      const underline = root.querySelector<HTMLElement>("[data-underline]")!;
      const fireWord = root.querySelector<HTMLElement>("[data-fire-word]")!;
      const antiLine = root.querySelector<HTMLElement>("[data-antithesis] p")!;

      // GSAP owns the needle's transform from here (svgOrigin); drop the
      // static attribute so the parses can never stack origins.
      needle.removeAttribute("transform");

      // Splits (fonts are gated by useDeckSlide; context-tracked → resize
      // rebuild reverts them). Both are entrance-only → reverted post-use.
      const headSplit = SplitText.create(headline, { type: "words" });
      const antiSplit = SplitText.create(antiLine, { type: "words" });
      const hWords = headSplit.words;
      const aWords = antiSplit.words;
      // «Требование — есть.» | «Инструмента, который его проверяет, —» | «нет.»
      const iEst = aWords.findIndex((w) =>
        (w.textContent ?? "").trim().startsWith("есть"),
      );
      const wordsA = aWords.slice(0, iEst + 1);
      const wordsB = aWords.slice(iEst + 1, aWords.length - 1);
      const wordNo = aWords[aWords.length - 1];

      let headAlive = true;
      const revertHead = () => {
        if (!headAlive) return;
        headAlive = false;
        headSplit.revert();
      };
      let antiAlive = true;
      const revertAnti = () => {
        if (!antiAlive) return;
        antiAlive = false;
        antiSplit.revert();
      };

      const setDormant = () => {
        gsap.set(hWords, { autoAlpha: 0, y: 24 });
        // Motion owns the wrapper's opacity (overrides the static opacity-5):
        // cards play their entrance undimmed; the antithesis dims them later.
        gsap.set(cardsWrap, { opacity: 1, scale: 1, y: 0 });
        gsap.set(cards, { autoAlpha: 0, y: 16 });
        gsap.set(axis, { drawSVG: "0%" });
        gsap.set(ghost, {
          autoAlpha: 0,
          scaleX: 0.02,
          y: 56,
          svgOrigin: "266 52",
          strokeDashoffset: 0,
        });
        gsap.set(flame, { autoAlpha: 0, scaleX: 0.02, y: -56, svgOrigin: "266 164" });
        gsap.set(glow, { opacity: 0 });
        gsap.set(bracket, { drawSVG: "0%" });
        gsap.set(statMetr, { autoAlpha: 0, color: PAPER });
        statMetr.textContent = countUpText(-0, { suffix: "%" });
        gsap.set([tagGhost, tagFlame], { autoAlpha: 0, y: 8 });
        gsap.set(dialArc, { drawSVG: "0%" });
        gsap.set(needle, { svgOrigin: "100 100", rotation: -90 });
        statTrust.textContent = countUpText(0, { suffix: "%" });
        gsap.set(chips, { autoAlpha: 0, y: 8 }); // rotations stay PRE-SET
        gsap.set(underline, { scaleX: 0 });
        gsap.set(fireWord, { color: MUTE });
        gsap.set([...wordsA, ...wordsB], { autoAlpha: 0, y: 14 });
        gsap.set(wordNo, { autoAlpha: 0, scale: 1.15, transformOrigin: "50% 80%" });
      };

      const setFrozen = () => {
        revertHead();
        revertAnti();
        gsap.killTweensOf([needle, ghost, glow]);
        gsap.set(headline, { autoAlpha: 1 });
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        gsap.set(cardsWrap, { opacity: 0.05, scale: 0.965, y: -8 });
        gsap.set(axis, { drawSVG: "100%" });
        gsap.set(ghost, {
          autoAlpha: 1,
          scaleX: 1,
          y: 0,
          svgOrigin: "266 52",
          strokeDashoffset: 0,
        });
        gsap.set(flame, { autoAlpha: 1, scaleX: 1, y: 0, svgOrigin: "266 164" });
        gsap.set(glow, { opacity: 0 });
        gsap.set(bracket, { drawSVG: "100%" });
        gsap.set(statMetr, { autoAlpha: 1, clearProps: "color" });
        statMetr.textContent = countUpText(-19, { suffix: "%" });
        gsap.set([tagGhost, tagFlame], { autoAlpha: 1, y: 0 });
        gsap.set(dialArc, { drawSVG: "100%" });
        gsap.set(needle, { svgOrigin: "100 100", rotation: -12.6 });
        statTrust.textContent = countUpText(43, { suffix: "%" });
        gsap.set(chips, { autoAlpha: 1, y: 0 });
        gsap.set(underline, { scaleX: 1 });
        gsap.set(fireWord, { clearProps: "color" });
        // Antithesis: splits reverted above → the intact line is visible.
      };

      /* ----------------------------------------------------------------
       * Entrance + auto-chained antithesis (single timeline)
       * ---------------------------------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance
        .to(hWords, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 }, 0)
        .to(cards[0], { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2)
        .to(axis, { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" }, 0.3)
        // merged bar born at zero
        .to([ghost, flame], { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.7)
        .to(ghost, { scaleX: GHOST_MERGED, duration: 0.45, ease: "power2.out" }, 0.7)
        .to(flame, { scaleX: FLAME_MERGED, duration: 0.45, ease: "power2.out" }, 0.7)
        // THE SHEAR
        .to(ghost, { scaleX: 1, y: 0, duration: 0.9, ease: "power3.inOut" }, 1.2)
        .to(flame, { scaleX: 1, y: 0, duration: 0.9, ease: "power3.inOut" }, 1.2)
        .to(statMetr, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 1.2)
        .to(statMetr, { color: EMBER, duration: 0.9, ease: "power2.inOut" }, 1.2)
        .to(bracket, { drawSVG: "100%", duration: 0.5, ease: "power2.inOut" }, 1.5)
        .to(
          [tagGhost, tagFlame],
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 },
          2.0,
        );
      addCountUp(entrance, 1.2, statMetr, {
        to: -19,
        from: -0,
        duration: 0.9,
        ease: "power3.inOut",
        suffix: "%",
      });
      entrance
        .to(cards[1], { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.85)
        .to(dialArc, { drawSVG: "100%", duration: 0.8, ease: "power2.out" }, 2.1)
        // needle: overshoot to −9°, fall back to −12.6° — the stuck read
        .to(needle, { rotation: -9, duration: 0.55, ease: "power2.out" }, 2.1)
        .to(needle, { rotation: -12.6, duration: 0.35, ease: "power2.inOut" }, 2.65);
      addCountUp(entrance, 2.1, statTrust, {
        to: 43,
        duration: 0.8,
        ease: "power2.out",
        suffix: "%",
      });
      entrance
        .to(cards[2], { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 2.75)
        .to(chips[0], { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 2.9)
        .to(chips[1], { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 3.05)
        .to(fireWord, { color: PAPER, duration: 0.4, ease: "power1.out" }, 3.35)
        .to(underline, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 3.35)
        .call(revertHead, [], SETTLE_T + 0.05);

      // ANTITHESIS — 4s after settle, all form factors (Director's cut).
      // Cards drop to 5% (slide 13's epitaph dim) so the line owns the frame.
      entrance.to(
        cardsWrap,
        { opacity: 0.05, scale: 0.965, y: -8, duration: 0.5, ease: "power3.inOut" },
        ANTI_T,
      );
      entrance
        // «Требование — есть.» — last word lands ≈ ANTI_T+0.61
        .to(
          wordsA,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.08 },
          ANTI_T,
        )
        // 0.6s held pause, then the rest of the line
        .to(
          wordsB,
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05 },
          ANTI_T + 1.21,
        )
        // «нет.» — soft flame landing (scale 1.15→1; NOT the reserved slam)
        .to(
          wordNo,
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" },
          ANTI_T + 1.76,
        )
        .call(revertAnti, [], ANTI_T + 2.15);

      /* ----------------------------------------------------------------
       * Idles
       * ---------------------------------------------------------------- */
      const makeIdles = () => {
        const climb = gsap.timeline({ delay: 1.2, repeat: -1, repeatDelay: 3.1 }); // deck-contract: idle
        climb
          .to(needle, { rotation: -10.1, duration: 0.4, ease: "power1.out" })
          .to(needle, { rotation: -12.6, duration: 0.7, ease: "bounce.out" });
        // Ghost outline drift: dasharray period is 10 → offset −20 loops seamlessly.
        const drift = gsap.to(ghost, {
          strokeDashoffset: -20,
          duration: 6,
          ease: "none",
          repeat: -1,
        });
        return [climb, drift, breathe(glow, 0, 0.15, 4)];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
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

      {/* Cards — dimmed to 5% under the antithesis overlay (the class is the
          reduced-motion/SSR final frame; gsap owns it in the motion path). */}
      <div
        data-cards
        className="mt-3 grid gap-2 opacity-5 lg:mt-6 lg:grid-cols-12 lg:gap-6"
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
              <span data-fire-word className="relative inline-block text-paper">
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
