"use client";

/**
 * Slide 03 — Почему сейчас: ИИ выровнял всех · «Ощущение vs замер»
 * (landing_v2.md §4, slide 03; build restored + chart redesigned 2026-06-12).
 *
 * P3 motion. BUILD slide (gesture-gated, autoChainMs: 0 — the antithesis
 * NEVER fires on a timer): key/wheel at lg+ (mid snap point), tap on <lg
 * (controller's handleTap). This supersedes the Director's-cut auto-chain.
 *
 * Entrance (paused master tl, played on fixation, ends ≈3.85s):
 *   0.0   headline SplitText WORDS rise (y 24→0, stagger 0.05)
 *   0.2   perception card fades · 0.3 left baseline DrawSVG
 *   0.65  «ощущение» row label fades
 *   0.7   ghost bar grows from the baseline (scaleX 0.02→1, power3.out)
 *         while «+20%» counts up at its tip (sterile)
 *   1.45  «замер» row label fades
 *   1.5   THE HIT — flame bar grows (power3.inOut) while «−19%» counts
 *         DOWN −0→−19 (addCountUp, ru minus) and its color tweens
 *         paper→ember; bars land at proportional lengths (440 vs 418 —
 *         almost equal, which IS the paradox)
 *   1.85  trust card fades · 2.1 dial arc DrawSVG to 43% sweep + needle
 *         −90°→−9° overshoot →−12.6° fallback (the "stuck" read) + 43% count
 *   2.75  mandate card fades · 2.9/3.05 Shopify/Coinbase chips FADE in with
 *         permanent rotations PRE-SET (NO slam/jolt — stamp grammar is
 *         reserved, §2.3) · 3.35 «увольняют» flame underline scaleX + color
 *   ≈3.85 SETTLED — fully legible; idles run while the presenter talks.
 *
 * Build (one-shot, ≈2.2s, on the speaker's «Требование — есть…» beat):
 *   0.0   cards dim to 5% / scale .965 / y −8 (slide 13's epitaph grammar,
 *         all form factors) — the antithesis owns the frame
 *   0.05  «Требование — есть.» word-rises · 0.6s held pause (the spoken
 *         pause) · 1.26 the rest · 1.81 «нет.» soft flame landing (scale
 *         1.15→1 power3.out — NOT the reserved notary slam) · 2.2 revertAnti.
 *
 * Idles (SETTLED only; built = stillness): needle tries to climb +2.5° and
 * falls back (bounce ≤3°) every ~3.5s; flame-bar ember glow pulse (0↔0.15,
 * 4s sine); ghost bar dashed outline drift (dashoffset, seamless period).
 *
 * Frozen: settled = undimmed cards, antithesis hidden (words re-armed for a
 * future build); built = dimmed cards + intact antithesis line.
 * Reduced motion: the hook applies setFrozen("built") — static final frame.
 *
 * Vertical budget:
 *   375×620 : py-6 (48) + headline ~56 + 12 + perception card ~180 (90px
 *             chart + caption/source) + 8 + dial card ~150 + 8 + mandate
 *             ~110 ≈ 560 → fits. Antithesis overlay adds zero flow height.
 *   1366×768: py-10 (80) + headline ~80 + 24 + grid row ~390 ≈ 574 → fits.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe } from "@/lib/motion/idle";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { PerceptionRowsChart } from "@/components/deck/parts/perception-rows-chart";
import { TrustDial } from "@/components/deck/parts/trust-dial";

const PAPER = "#f5f5f7";
const MUTE = "#a1a1aa";
const EMBER = "#ff8a4c";

const SETTLE_T = 3.8;

export function Slide03WhyNow() {
  const { ref } = useDeckSlide({
    id: "03-why-now",
    hasBuild: true,
    // Explicit 0: the antithesis NEVER auto-chains — gesture/tap only.
    autoChainMs: 0,
    create: ({ root, reduced }) => {
      const headline = root.querySelector<HTMLElement>("[data-headline]")!;
      const cardsWrap = root.querySelector<HTMLElement>("[data-cards]")!;
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
      const baseline = root.querySelector<SVGLineElement>("[data-baseline]")!;
      const ghost = root.querySelector<SVGRectElement>("[data-bar-ghost]")!;
      const flame = root.querySelector<SVGRectElement>("[data-bar-flame]")!;
      const glow = root.querySelector<SVGRectElement>("[data-bar-flame-glow]")!;
      const statGhost = root.querySelector<HTMLElement>('[data-stat="ghost"]')!;
      const statMetr = root.querySelector<HTMLElement>('[data-stat="metr"]')!;
      const tagGhost = root.querySelector<HTMLElement>("[data-tag-ghost]")!;
      const tagFlame = root.querySelector<HTMLElement>("[data-tag-flame]")!;
      const dialArc = root.querySelector<SVGPathElement>("[data-dial-arc]")!;
      const needle = root.querySelector<SVGLineElement>("[data-needle]")!;
      const statTrust = root.querySelector<HTMLElement>('[data-stat="trust"]')!;
      const chips = Array.from(root.querySelectorAll<HTMLElement>("[data-chip]"));
      const underline = root.querySelector<HTMLElement>("[data-underline]")!;
      const fireWord = root.querySelector<HTMLElement>("[data-fire-word]")!;
      const antiWrap = root.querySelector<HTMLElement>("[data-antithesis]")!;
      const antiLine = root.querySelector<HTMLElement>("[data-antithesis] p")!;

      // GSAP owns the needle's transform from here (svgOrigin); drop the
      // static attribute so the parses can never stack origins.
      needle.removeAttribute("transform");

      // Splits — motion path only (fonts are gated by useDeckSlide;
      // context-tracked → resize rebuild reverts them). The head split is
      // entrance-only; the anti split must SURVIVE settled freezes (the
      // build may still play later) and reverts on build end / built freeze.
      const headSplit = reduced ? null : SplitText.create(headline, { type: "words" });
      const antiSplit = reduced ? null : SplitText.create(antiLine, { type: "words" });
      const hWords = headSplit?.words ?? [];
      const aWords = antiSplit?.words ?? [];
      // «Требование — есть.» | «Инструмента, который его проверяет, —» | «нет.»
      const iEst = aWords.findIndex((w) =>
        (w.textContent ?? "").trim().startsWith("есть"),
      );
      const wordsA = aWords.slice(0, iEst + 1);
      const wordsB = aWords.slice(iEst + 1, aWords.length - 1);
      const wordNo = aWords[aWords.length - 1] ?? null;

      let headAlive = headSplit !== null;
      const revertHead = () => {
        if (!headAlive) return;
        headAlive = false;
        headSplit?.revert();
      };
      let antiAlive = antiSplit !== null;
      const revertAnti = () => {
        if (!antiAlive) return;
        antiAlive = false;
        antiSplit?.revert();
      };

      // makeIdles branches on this: BUILT returns [] (stillness is the point).
      let stage: "settled" | "built" = "settled";

      const setAntiWordsDormant = () => {
        if (!antiAlive) return;
        gsap.set([...wordsA, ...wordsB], { autoAlpha: 0, y: 14 });
        if (wordNo)
          gsap.set(wordNo, { autoAlpha: 0, scale: 1.15, transformOrigin: "50% 80%" });
      };

      const setDormant = () => {
        if (hWords.length) gsap.set(hWords, { autoAlpha: 0, y: 24 });
        // Motion owns the wrapper's opacity: cards play their entrance
        // undimmed; only the BUILD dims them.
        gsap.set(cardsWrap, { opacity: 1, scale: 1, y: 0 });
        gsap.set(cards, { autoAlpha: 0, y: 16 });
        gsap.set(baseline, { drawSVG: "0%" });
        gsap.set(ghost, {
          autoAlpha: 0,
          scaleX: 0.02,
          svgOrigin: "24 69",
          strokeDashoffset: 0,
        });
        gsap.set(flame, { autoAlpha: 0, scaleX: 0.02, svgOrigin: "24 151" });
        gsap.set(glow, { opacity: 0 });
        gsap.set(statGhost, { autoAlpha: 0 });
        statGhost.textContent = countUpText(0, { prefix: "+", suffix: "%" });
        gsap.set(statMetr, { autoAlpha: 0, color: PAPER });
        statMetr.textContent = countUpText(-0, { suffix: "%" });
        gsap.set([tagGhost, tagFlame], { autoAlpha: 0, y: 8 });
        gsap.set(dialArc, { drawSVG: "0%" });
        gsap.set(needle, { svgOrigin: "100 100", rotation: -90 });
        statTrust.textContent = countUpText(0, { suffix: "%" });
        gsap.set(chips, { autoAlpha: 0, y: 8 }); // rotations stay PRE-SET
        gsap.set(underline, { scaleX: 0 });
        gsap.set(fireWord, { color: MUTE });
        gsap.set(antiWrap, { autoAlpha: 0 });
        setAntiWordsDormant();
      };

      const setFrozen = (s: "settled" | "built") => {
        stage = s;
        revertHead();
        gsap.killTweensOf([needle, ghost, glow]);
        gsap.set(headline, { autoAlpha: 1 });
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        gsap.set(
          cardsWrap,
          s === "built"
            ? { opacity: 0.05, scale: 0.965, y: -8 }
            : { opacity: 1, scale: 1, y: 0 },
        );
        gsap.set(baseline, { drawSVG: "100%" });
        gsap.set(ghost, {
          autoAlpha: 1,
          scaleX: 1,
          svgOrigin: "24 69",
          strokeDashoffset: 0,
        });
        gsap.set(flame, { autoAlpha: 1, scaleX: 1, svgOrigin: "24 151" });
        gsap.set(glow, { opacity: 0 });
        gsap.set(statGhost, { autoAlpha: 1 });
        statGhost.textContent = countUpText(20, { prefix: "+", suffix: "%" });
        gsap.set(statMetr, { autoAlpha: 1, clearProps: "color" });
        statMetr.textContent = countUpText(-19, { suffix: "%" });
        gsap.set([tagGhost, tagFlame], { autoAlpha: 1, y: 0 });
        gsap.set(dialArc, { drawSVG: "100%" });
        gsap.set(needle, { svgOrigin: "100 100", rotation: -12.6 });
        statTrust.textContent = countUpText(43, { suffix: "%" });
        gsap.set(chips, { autoAlpha: 1, y: 0 });
        gsap.set(underline, { scaleX: 1 });
        gsap.set(fireWord, { clearProps: "color" });
        if (s === "built") {
          // Intact line over dimmed cards — the antithesis is the frame.
          revertAnti();
          gsap.set(antiWrap, { autoAlpha: 1 });
        } else {
          // Settled: antithesis hidden, words re-armed so a build after a
          // leave-and-return re-entry still plays cleanly (build uses .to).
          gsap.set(antiWrap, { autoAlpha: 0 });
          setAntiWordsDormant();
        }
      };

      if (reduced) {
        // Static deck: the hook applies setFrozen("built") itself.
        return { entrance: gsap.timeline({ paused: true }), setFrozen, setDormant };
      }

      /* ----------------------------------------------------------------
       * Entrance (ends at the stable read — the antithesis is the BUILD)
       * ---------------------------------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance
        .to(hWords, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 }, 0)
        .to(cards[0], { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2)
        .to(baseline, { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" }, 0.3)
        // the perception row — what it felt like
        .to(tagGhost, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.65)
        .to(ghost, { autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 0.7)
        .to(ghost, { scaleX: 1, duration: 0.7, ease: "power3.out" }, 0.7)
        .to(statGhost, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0.7);
      addCountUp(entrance, 0.7, statGhost, {
        to: 20,
        duration: 0.6,
        ease: "power2.out",
        prefix: "+",
        suffix: "%",
      });
      entrance
        // the measured row — THE HIT
        .to(tagFlame, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.45)
        .to(flame, { autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 1.5)
        .to(flame, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 1.5)
        .to(statMetr, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 1.5)
        .to(statMetr, { color: EMBER, duration: 0.8, ease: "power2.inOut" }, 1.5);
      addCountUp(entrance, 1.5, statMetr, {
        to: -19,
        from: -0,
        duration: 0.8,
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

      /* ----------------------------------------------------------------
       * Build — the antithesis (gesture-gated one-shot, ≈2.2s)
       * ---------------------------------------------------------------- */
      const build = gsap.timeline({ paused: true });
      build.call(
        () => {
          stage = "built";
        },
        undefined,
        0,
      );
      build.set(antiWrap, { autoAlpha: 1 }, 0);
      build.to(
        cardsWrap,
        { opacity: 0.05, scale: 0.965, y: -8, duration: 0.5, ease: "power3.inOut" },
        0,
      );
      build
        // «Требование — есть.» — last word lands ≈0.66
        .to(
          wordsA,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.08 },
          0.05,
        )
        // 0.6s held pause (the spoken pause), then the rest of the line
        .to(
          wordsB,
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05 },
          1.26,
        )
        // «нет.» — soft flame landing (scale 1.15→1; NOT the reserved slam)
        .to(
          wordNo,
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" },
          1.81,
        )
        .call(revertAnti, [], 2.2);

      /* ----------------------------------------------------------------
       * Idles — SETTLED only (built = stillness under the antithesis)
       * ---------------------------------------------------------------- */
      const makeIdles = () => {
        if (stage === "built") return [];
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

      return { entrance, build, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="03-why-now"
      hasBuild
      title="Почему сейчас: ИИ выровнял всех, но не сделал равными"
      srSummary="METR, строгий эксперимент, 2025: опытные разработчики с ИИ работали на 19% медленнее — и были уверены, что стали на 20% быстрее. Только 43% разработчиков доверяют точности ответов ИИ (Stack Overflow 2024). Shopify и Coinbase: ИИ-компетенция — критерий аттестации; инженеров без неё увольняют. Требование — есть. Инструмента, который его проверяет, — нет."
      className="py-6 lg:py-10"
    >
      <h3
        data-headline
        className="font-display text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-h1)]"
      >
        ИИ выровнял всех. <span className="text-mute">Но не сделал равными.</span>
      </h3>

      {/* Cards — JSX renders NEUTRAL (undimmed); the build/setFrozen("built")
          dim them to 5% under the antithesis. */}
      <div
        data-cards
        className="mt-3 grid gap-2 lg:mt-6 lg:grid-cols-12 lg:gap-6"
      >
        {/* Perception-rows card — content vertically centered: the card
            stretches to the right column's height at lg+. */}
        <div
          data-card="metr"
          className="flex flex-col justify-center rounded-2xl border border-line bg-fog p-3 lg:col-span-7 lg:p-6"
        >
          <PerceptionRowsChart />
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

      {/* Antithesis — the BUILD's payload, hidden in JSX (slide 13's refrain
          pattern); setFrozen("built") and the build timeline reveal it.
          Absolutely positioned overlay against the .slide stage (zero flow
          height). */}
      <div
        data-antithesis
        className="pointer-events-none invisible absolute inset-0 flex items-center justify-center px-5 opacity-0"
      >
        <p className="font-display max-w-[22ch] text-center text-[length:var(--text-h2)] text-paper lg:text-[length:var(--text-display)]">
          Требование — есть. Инструмента, который его проверяет, —{" "}
          <span className="text-flame">нет.</span>
        </p>
      </div>
    </Slide>
  );
}
