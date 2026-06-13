"use client";

/**
 * Slide 08 — Ещё одно. Ловушка на работу с данными · «Граница под
 * напряжением» (landing_v2.md §4 slide 08 + Director's cut). The deck's
 * cinematic peak: red's first pixel is this slide's flare (§2.4).
 *
 * MOTION (P3) — two visual states + one build:
 *   PRE-leak (frozen "settled"): neutral gradient boundary, safe bubble,
 *     гигиена 89 trust-green, amber chip border, zero red, no vignette.
 *   POST-leak (frozen "built"): leak bubble + flag, гигиена 18 leak-red,
 *     boundary cooled to line-strong, vignette 0.06 — the wounded-cool frame.
 *
 * Entrance (≤3.6s): plaque → title per-word rise → boundary DrawSVG
 * top→bottom + glow lag → panes x∓32 → bubbles rise (stagger 0.18) → chip
 * lands back.out(1.7) → bottom band fades + «11%» count-up.
 *
 * Build (one-shot ≤3.2s, midpoint fixation at lg / auto-chain <lg): ghost
 * chip lifts and travels a shallow MotionPath arc into the external input;
 * at the crossing the full-bleed FLARE detonates (0→0.85→0.25, 0.12s
 * attack), the stage shakes x ±4px ×3, the boundary strobes leak-red;
 * safe→leak bubble crossfade, flag stamps (1.4→1 back.out(2)); «цифровая
 * гигиена» rolls 89→18 (power3.in) with bar scaleX + trust→leak recolor
 * and the average 80→66; flare settles into the 0.12 vignette.
 *
 * §2.6 — NO exit tween: the boundary cooling is a TIMED POST-BUILD IDLE
 * BEAT (~2s after the leak settles, inside makeIdles): leak strokes fade,
 * line-strong fades in, vignette eases to 0.06. The exit freeze-frame is
 * already near-neutral; slide 9 opens red-free.
 *
 * HARD re-budget per Director's cut (1366×768, py-8, audited):
 *   py-8 (64) + top band ~59 + 14 + panes FIXED 380 + 14 + bottom band ~210
 *   ≈ 741px ✓. 375×620: pin disabled, auto-chain after settle; single-axis
 *   «цифровая гигиена» strip replaces the 5-axis matrix <lg.
 *
 * RED IS ALLOWED HERE AND ONLY HERE (§2.4) — and only from the flare on:
 * pre-leak even the file chip border is gsap-set to amber (the agent text's
 * «leak-tinted border» loses to the binding «red's first pixel is the
 * flare»); the crossing flips it to leak. The «персональные данные» marker
 * stays AMBER throughout (предупреждение, not нарушение).
 */
import type { HTMLAttributes, ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import type { SlideStage } from "@/components/deck/deck-controller";
import { BoundaryLine } from "@/components/deck/parts/boundary-line";
import { FileChip } from "@/components/deck/parts/file-chip";
import { FlareOverlay } from "@/components/deck/parts/flare-overlay";
import { ProcessMatrix } from "@/components/mockups/process-matrix";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe, pulse } from "@/lib/motion/idle";

/** Compact 5-axis variant for the bottom band — incl. the crashed axis.
 *  Averages: pre-leak (гигиена 89) → 80, post-leak (18) → 66. */
const TRAP_AXES = [
  { label: "понимание контекста", score: 84 },
  { label: "точность промптов", score: 78 },
  { label: "безопасность команд", score: 80 },
  { label: "проверка", score: 71 },
  { label: "цифровая гигиена", score: 18 }, // post-leak: crashed 89 → 18
];

const LEAK_AXIS = "цифровая гигиена";
const STAT_OPTS = { to: 11, duration: 0.8, suffix: "%" };
const CROSS = 0.9; // build: chip-meets-boundary beat
const CRASH = 1.35; // build: matrix crash beat

export function Slide08Trap() {
  const { ref } = useDeckSlide({
    id: "08-trap",
    hasBuild: true,
    // <lg auto-chain: the controller arms this on TOP fixation, so the value
    // covers the full entrance (~3.4s) + the spec's «+1.5s after settle».
    autoChainMs: 1500, // after entrance settles (controller arms on onEntranceComplete)
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const vis = (el: Element) => el.getClientRects().length > 0;

      const docStyle = getComputedStyle(document.documentElement);
      const token = (name: string, fallback: string) =>
        docStyle.getPropertyValue(name).trim() || fallback;
      const LEAK = token("--color-leak", "#ef4444");
      const TRUST = token("--color-trust", "#22c55e");
      const MUTE = token("--color-mute", "#a1a1aa");
      const LEAK_BORDER = "rgba(239, 68, 68, 0.4)"; // border-leak/40
      const AMBER_BORDER = "rgba(251, 191, 36, 0.4)"; // amber-400/40, §2.4

      /* ---- targets ---------------------------------------------------- */
      const stageEl = root.querySelector<HTMLElement>(".slide") ?? root;
      const contentEl = root.querySelector<HTMLElement>(".slide-content");
      const plaque = q("[data-plaque]")[0];
      const titleEl = q("[data-title]")[0];
      const paneL = q('[data-panel="buddy"]')[0];
      const paneR = q('[data-panel="external"]')[0];
      const rises = q("[data-rise]");
      const chipEl = q('[data-chip="file"]')[0];
      const ghostEl = q("[data-ghost]")[0];
      const ghostChip = q('[data-chip="file-ghost"]')[0];
      const safeMsg = q('[data-msg="safe"]')[0];
      const leakMsg = q('[data-msg="leak"]')[0];
      const flagEl = q("[data-leak-flag]")[0];
      const inputRow = q("[data-input]")[0];
      const caretEl = q("[data-caret]")[0];
      const bottomEl = q("[data-bottom]")[0];
      const statEl = q("[data-quote-stat]")[0];
      const vignette = q("[data-vignette]")[0];
      const flareEl = q("[data-flare]")[0];
      // The ghost's coordinate origin: the ghost is absolute inside this
      // `inset-0` layer, so its transform x/y resolve against the layer's
      // PAINTED top-left — which is the reliable reference. (The sticky
      // `.slide`'s getBoundingClientRect can report its flow box, not its
      // pinned-paint box, mid-fixation — measuring travel against it strands
      // the ghost at lg/1920.) The flare overlay shares this `inset-0` box.
      const ghostLayerEl =
        root.querySelector<HTMLElement>("[data-ghost-layer]") ?? stageEl;

      // Boundary — only the visible instance (vertical lg / horizontal <lg);
      // a resize across the breakpoint rebuilds the whole context.
      const strokesN = q('[data-boundary-stroke="neutral"]').filter(vis);
      const strokesL = q('[data-boundary-stroke="leak"]').filter(vis);
      const strokesC = q('[data-boundary-stroke="cool"]').filter(vis);
      const glowsN = q('[data-boundary-glow="neutral"]').filter(vis);
      const glowsL = q('[data-boundary-glow="leak"]').filter(vis);
      const boundaryEl = q("[data-boundary]").find(vis) ?? null;
      const runnerEl =
        boundaryEl?.querySelector("[data-boundary-runner]") ?? null;

      // Leak-axis hooks: dense matrix (lg) + bespoke strip (<lg). The matrix
      // exposes fill/score/average; label color and the «утечка» suffix are
      // reached structurally (process-matrix is reference-only).
      const matrixLabel = root.querySelector(
        `[data-matrix] span[title="${LEAK_AXIS}"]`,
      );
      const matrixLeakWord = matrixLabel?.querySelector("span") ?? null;
      const matrixFill = root.querySelector(
        `[data-matrix-fill][data-axis="${LEAK_AXIS}"]`,
      );
      const matrixScore = root.querySelector(
        `[data-matrix-score][data-axis="${LEAK_AXIS}"]`,
      );
      const avgEl = root.querySelector("[data-matrix-average]");
      const stripFill = q("[data-strip-fill]")[0];
      const stripScore = q("[data-strip-score]")[0];
      const stripLabel = q("[data-strip-label]")[0];
      const stripValue = q("[data-strip-value]")[0];
      const stripLeakWord = q("[data-strip-leakword]")[0];

      const fills = [matrixFill, stripFill].filter(Boolean) as Element[];
      const labelEls = [matrixLabel, stripLabel].filter(Boolean) as Element[];
      // Include the matrix score's text-leak WRAPPER span: it paints no
      // glyphs of its own, but pre-leak the slide must compute zero leak-red.
      const scoreColorEls = [
        matrixScore,
        matrixScore?.parentElement,
        stripValue,
      ].filter(Boolean) as Element[];
      const leakWords = [matrixLeakWord, stripLeakWord].filter(
        Boolean,
      ) as Element[];
      const chipBorders = [chipEl, ghostChip].filter(Boolean) as Element[];

      const writeScores = (v: number) => {
        const txt = String(Math.round(v));
        if (matrixScore) matrixScore.textContent = txt;
        if (stripScore) stripScore.textContent = txt;
      };
      const writeAvg = (v: number) => {
        if (avgEl) avgEl.textContent = String(Math.round(v));
      };

      /* ---- travel geometry --------------------------------------------- */
      // clearProps + lgTravel + runLen are breakpoint-stable within a ctx and
      // measured once at create. The per-pixel coords are re-measured at build
      // PLAY (onBuildStart) so a no-resize reflow (late font settle) can't
      // strand the ghost below the target — see the slide-08 §4 implementation
      // note. geom is mutable; the build set/to read it and onBuildStart
      // rewrites the tagged tweens' vars + invalidate()s them.
      gsap.set(
        [paneL, paneR, chipEl, ghostEl, contentEl].filter(Boolean),
        { clearProps: "transform" },
      );
      const lgTravel = Boolean(inputRow && vis(inputRow)); // horizontal arc
      const targetEl = lgTravel ? inputRow : leakMsg;
      const bRectInit = boundaryEl?.getBoundingClientRect() ?? null;
      const runLen = bRectInit
        ? (lgTravel ? bRectInit.height : bRectInit.width)
        : 0;

      const geom = { sx: 0, sy: 0, ex: 0, ey: 0, ax: 0, ay: 0 };
      const measureTravel = () => {
        // The pulse idle may be mid-cycle when playBuild kills idles, so the
        // chip rect must be read at scale 1 (otherwise sx/sy drift).
        gsap.set(chipEl, { scale: 1 });
        // Origin = the ghost layer's painted box (the ghost's containing
        // block), NOT the sticky `.slide` — see ghostLayerEl note above.
        const originRect = ghostLayerEl.getBoundingClientRect();
        const chipRect = chipEl?.getBoundingClientRect() ?? originRect;
        const tRect = targetEl?.getBoundingClientRect() ?? originRect;
        const bRect = boundaryEl?.getBoundingClientRect() ?? null;

        geom.sx = chipRect.left - originRect.left;
        geom.sy = chipRect.top - originRect.top;
        geom.ex = tRect.left - originRect.left + 10;
        geom.ey = lgTravel
          ? tRect.top - originRect.top +
            Math.max(0, (tRect.height - chipRect.height) / 2)
          : tRect.top - originRect.top + 6;
        // Shallow arc: apex above the straight line (lg) / bowed right (<lg).
        geom.ax = lgTravel
          ? (geom.sx + geom.ex) / 2
          : Math.max(geom.sx, geom.ex) + 28;
        geom.ay = lgTravel
          ? Math.min(geom.sy, geom.ey) - 36
          : (geom.sy + geom.ey) / 2;

        // Flare epicenter = where the arc crosses the boundary. The flare
        // overlay shares the ghost layer's `inset-0` box, so vars resolve
        // against originRect (same painted frame, scroll-stable dimensions).
        const flareX = lgTravel
          ? (bRect ? bRect.left + bRect.width / 2 - originRect.left : geom.ax)
          : geom.ax + chipRect.width / 2;
        const flareY = lgTravel
          ? geom.ay + chipRect.height / 2
          : (bRect ? bRect.top + bRect.height / 2 - originRect.top : geom.ay);
        if (flareEl) {
          const pct = (v: number, span: number) =>
            `${gsap.utils.clamp(5, 95, (v / Math.max(span, 1)) * 100)}%`;
          gsap.set(flareEl, {
            "--flare-x": pct(flareX, originRect.width),
            "--flare-y": pct(flareY, originRect.height),
          });
        }
      };
      measureTravel(); // sane dormant values at create

      const split = titleEl ? new SplitText(titleEl, { type: "words" }) : null;

      // Closure stage for makeIdles branching (entrance/build .call()s and
      // the frozen setters keep it current; controller owns real status).
      let phase: "dormant" | "settled" | "built" = "dormant";
      let cooled = false;

      /* ---- state setters ----------------------------------------------- */
      const setPreLeak = () => {
        gsap.set(safeMsg, { autoAlpha: 1, y: 0 });
        gsap.set(leakMsg, { autoAlpha: 0 });
        gsap.set(flagEl, { autoAlpha: 0, scale: 1.4 });
        gsap.set(chipBorders, { borderColor: AMBER_BORDER });
        writeScores(89);
        writeAvg(80);
        gsap.set(fills, { scaleX: 0.89, backgroundColor: TRUST });
        gsap.set(labelEls, { color: MUTE });
        gsap.set(scoreColorEls, { color: TRUST });
        gsap.set(leakWords, { autoAlpha: 0 });
        gsap.set(strokesN, { opacity: 1 });
        gsap.set(glowsN, { opacity: 0.08 });
        gsap.set([...strokesL, ...glowsL, ...strokesC], { opacity: 0 });
        if (runnerEl) gsap.set(runnerEl, { opacity: 0 });
        gsap.set(caretEl, { opacity: 1 });
        gsap.set(vignette, { opacity: 0 });
        gsap.set(flareEl, { opacity: 0 });
        gsap.set(ghostEl, { autoAlpha: 0, scale: 1 });
      };

      const setPostLeak = () => {
        gsap.set(safeMsg, { autoAlpha: 0, y: 0 });
        gsap.set(leakMsg, { autoAlpha: 1 });
        gsap.set(flagEl, { autoAlpha: 1, scale: 1 });
        gsap.set(chipBorders, { borderColor: LEAK_BORDER });
        writeScores(18);
        writeAvg(66);
        gsap.set(fills, { scaleX: 0.18, backgroundColor: LEAK });
        gsap.set(labelEls, { color: LEAK });
        gsap.set(scoreColorEls, { color: LEAK });
        gsap.set(leakWords, { autoAlpha: 1 });
        // Cooled boundary — the §2.6 wounded-cool freeze frame.
        gsap.set([...strokesN, ...glowsN, ...strokesL, ...glowsL], {
          opacity: 0,
        });
        gsap.set(strokesC, { opacity: 1 });
        if (runnerEl) gsap.set(runnerEl, { opacity: 0 });
        gsap.set(caretEl, { opacity: 1 });
        gsap.set(vignette, { opacity: 0.06 });
        gsap.set(flareEl, { opacity: 0 });
        gsap.set(ghostEl, { autoAlpha: 0, scale: 1 });
      };

      const setShellVisible = () => {
        gsap.set(plaque, { autoAlpha: 1, scale: 1 });
        if (split) gsap.set(split.words, { autoAlpha: 1, y: 0 });
        gsap.set([paneL, paneR].filter(Boolean), { autoAlpha: 1, x: 0 });
        gsap.set(rises, { autoAlpha: 1, y: 0 });
        gsap.set(chipEl, { autoAlpha: 1, scale: 1 });
        gsap.set(bottomEl, { autoAlpha: 1, y: 0 });
        gsap.set(statEl, { scale: 1 });
        if (statEl) statEl.textContent = countUpText(11, STAT_OPTS);
        if (contentEl) gsap.set(contentEl, { x: 0 });
        gsap.set(strokesN, { drawSVG: "100%" });
        gsap.set(glowsN, { drawSVG: "100%" });
      };

      const setFrozen = (stage: SlideStage) => {
        setShellVisible();
        if (stage === "built") {
          setPostLeak();
          phase = "built";
          cooled = true;
        } else {
          setPreLeak();
          phase = "settled";
          cooled = false;
        }
      };

      const setDormant = () => {
        gsap.set(plaque, { autoAlpha: 0, scale: 0.94 });
        if (split) gsap.set(split.words, { autoAlpha: 0, y: 24 });
        gsap.set(paneL, { autoAlpha: 0, x: -32 });
        gsap.set(paneR, { autoAlpha: 0, x: 32 });
        gsap.set(rises, { autoAlpha: 0, y: 12 });
        gsap.set(chipEl, { autoAlpha: 0, scale: 0.9 });
        gsap.set(bottomEl, { autoAlpha: 0, y: 12 });
        gsap.set(statEl, { scale: 1 });
        if (statEl) statEl.textContent = countUpText(0, STAT_OPTS);
        if (contentEl) gsap.set(contentEl, { x: 0 });
        gsap.set(strokesN, { drawSVG: "0%" });
        gsap.set(glowsN, { drawSVG: "0%" });
        setPreLeak();
        gsap.set(safeMsg, { autoAlpha: 0, y: 12 }); // rises with the bubbles
        phase = "dormant";
      };

      /* ---- entrance (≤3.6s; lands the PRE-leak state) ------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance.fromTo(
        plaque,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" },
        0,
      );
      if (split) {
        entrance.fromTo(
          split.words,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "expo.out",
            stagger: 0.06,
          },
          0.2,
        );
      }
      entrance.fromTo(
        strokesN,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" },
        0.5,
      );
      entrance.fromTo(
        glowsN,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" },
        0.6,
      );
      entrance.fromTo(
        paneL,
        { autoAlpha: 0, x: -32 },
        { autoAlpha: 1, x: 0, duration: 0.8, ease: "expo.out" },
        0.7,
      );
      entrance.fromTo(
        paneR,
        { autoAlpha: 0, x: 32 },
        { autoAlpha: 1, x: 0, duration: 0.8, ease: "expo.out" },
        0.7,
      );
      entrance.fromTo(
        rises,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "expo.out",
          stagger: 0.18,
        },
        1.2,
      );
      entrance.fromTo(
        chipEl,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
        1.95,
      );
      entrance.fromTo(
        bottomEl,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" },
        2.6,
      );
      addCountUp(entrance, 2.6, statEl, STAT_OPTS);
      entrance.call(() => {
        phase = "settled";
      });

      /* ---- build (one-shot ≤3.2s; the leak) ----------------------------- */
      // Re-measure the travel geometry at PLAY (after killIdles, before the
      // ghost moves) and rewrite the two tagged tweens. MotionPath caches the
      // parsed path on vars, so we must assign a FRESH object literal, not
      // mutate the old one, then invalidate() both tweens.
      const onBuildStart = () => {
        measureTravel();
        const origin = build.getById("ghost-origin");
        if (origin) {
          origin.vars.x = geom.sx;
          origin.vars.y = geom.sy;
          origin.invalidate();
        }
        const travel = build.getById("ghost-travel");
        if (travel) {
          travel.vars.motionPath = {
            path: [
              { x: geom.sx, y: geom.sy },
              { x: geom.ax, y: geom.ay },
              { x: geom.ex, y: geom.ey },
            ],
            curviness: 1.25,
          };
          travel.invalidate();
        }
      };
      const build = gsap.timeline({ paused: true, onStart: onBuildStart });
      // Freeze pre-build idle leftovers; arm will-change for the hot phase.
      build.set([ghostEl, flareEl].filter(Boolean), {
        willChange: "transform, opacity",
      });
      if (runnerEl) build.set(runnerEl, { opacity: 0 }, 0);
      build.set(caretEl, { opacity: 1 }, 0);
      build.set(chipEl, { scale: 1 }, 0);
      // 7 — chip clone lifts and travels the arc; glow ramps as it nears.
      build.set(
        ghostEl,
        { id: "ghost-origin", x: geom.sx, y: geom.sy, autoAlpha: 1, scale: 1 },
        0,
      );
      build.to(ghostEl, { scale: 1.06, duration: 0.15, ease: "power1.out" }, 0);
      build.to(
        ghostEl,
        {
          id: "ghost-travel",
          motionPath: {
            path: [
              { x: geom.sx, y: geom.sy },
              { x: geom.ax, y: geom.ay },
              { x: geom.ex, y: geom.ey },
            ],
            curviness: 1.25,
          },
          duration: 0.85,
          ease: "power2.inOut",
        },
        0.05,
      );
      build.to(glowsN, { opacity: 0.3, duration: 0.5, ease: "power1.in" }, 0.35);
      // 8 — FLARE at the crossing + strobe + shake (red's first pixel).
      build.to(
        flareEl,
        { opacity: 0.85, duration: 0.12, ease: "power1.out" },
        CROSS,
      );
      build.to(
        flareEl,
        { opacity: 0.25, duration: 0.6, ease: "power2.out" },
        CROSS + 0.12,
      );
      build.to(
        ghostEl,
        { autoAlpha: 0, scale: 1, duration: 0.15, ease: "power1.in" },
        CROSS,
      );
      build.set(chipBorders, { borderColor: LEAK_BORDER }, CROSS);
      build.to([...strokesN, ...glowsN], { opacity: 0, duration: 0.1 }, CROSS);
      build.to(
        strokesL,
        {
          keyframes: { opacity: [0, 1, 0.2, 1, 0.4, 1], easeEach: "none" },
          duration: 0.5,
        },
        CROSS,
      );
      build.to(
        glowsL,
        { opacity: 0.8, duration: 0.12, ease: "power1.out" },
        CROSS,
      );
      if (contentEl) {
        build.to(
          contentEl,
          { keyframes: { x: [0, 4, -4, 3, -3, 2, 0] }, duration: 0.25, ease: "none" },
          CROSS,
        );
      }
      // 9 — bubble crossfade + leak flag stamps (sanctioned slam, §2.3).
      build.to(
        safeMsg,
        { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" },
        CROSS + 0.1,
      );
      build.to(
        leakMsg,
        { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" },
        CROSS + 0.1,
      );
      build.fromTo(
        flagEl,
        { autoAlpha: 0, scale: 1.4 },
        { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
        CROSS + 0.15,
      );
      // 10 — «цифровая гигиена» crashes 89→18; average rolls 80→66.
      const scoreProxy = { v: 89 };
      build.to(
        scoreProxy,
        {
          v: 18,
          duration: 1.1,
          ease: "power3.in",
          onUpdate: () => writeScores(scoreProxy.v),
        },
        CRASH,
      );
      const avgProxy = { v: 80 };
      build.to(
        avgProxy,
        {
          v: 66,
          duration: 1.1,
          ease: "power3.in",
          onUpdate: () => writeAvg(avgProxy.v),
        },
        CRASH,
      );
      build.to(
        fills,
        { scaleX: 0.18, backgroundColor: LEAK, duration: 1.1, ease: "power3.in" },
        CRASH,
      );
      build.to(
        labelEls,
        { color: LEAK, duration: 0.6, ease: "power2.in" },
        CRASH + 0.5,
      );
      build.to(
        scoreColorEls,
        { color: LEAK, duration: 0.6, ease: "power2.in" },
        CRASH + 0.5,
      );
      build.to(leakWords, { autoAlpha: 1, duration: 0.3 }, CRASH + 0.8);
      // 11 — flare settles into the persistent vignette; «11%» pulses once.
      const SETTLE = 2.15;
      build.to(
        flareEl,
        { opacity: 0, duration: 0.6, ease: "power2.inOut" },
        SETTLE,
      );
      build.to(
        vignette,
        { opacity: 0.12, duration: 0.6, ease: "power2.inOut" },
        SETTLE,
      );
      build.to(glowsL, { opacity: 0.12, duration: 0.6 }, SETTLE);
      build.to(
        statEl,
        { keyframes: { scale: [1, 1.06, 1] }, duration: 0.45, ease: "power1.inOut" },
        SETTLE,
      );
      build.set([ghostEl, flareEl].filter(Boolean), {
        clearProps: "willChange",
      });
      build.call(() => {
        phase = "built";
      });

      /* ---- idles -------------------------------------------------------- */
      const makeIdles = (): gsap.core.Animation[] => {
        if (phase === "built") {
          if (cooled) {
            // Post-cool wounded idle: barely-breathing vignette.
            return vignette ? [breathe(vignette, 0.05, 0.08, 5)] : [];
          }
          // §2.6 timed post-build idle beat: vignette breathes 0.12↔0.14↔0.10
          // for ~2s, then the boundary cools to line-strong and the vignette
          // eases to 0.06 — killed on leave, setFrozen("built") snaps to the
          // same cooled end state.
          const cool = gsap.timeline(); // deck-contract: idle
          cool.to(vignette, { opacity: 0.14, duration: 1, ease: "sine.inOut" }, 0);
          cool.to(vignette, { opacity: 0.1, duration: 1, ease: "sine.inOut" }, 1);
          cool.to(
            [...strokesL, ...glowsL],
            { opacity: 0, duration: 0.8, ease: "power2.inOut" },
            2,
          );
          cool.to(
            strokesC,
            { opacity: 1, duration: 0.8, ease: "power2.inOut" },
            2,
          );
          cool.to(
            vignette,
            { opacity: 0.06, duration: 0.8, ease: "power2.inOut" },
            2,
          );
          cool.call(
            () => {
              cooled = true;
            },
            undefined,
            2.8,
          );
          cool.to(
            vignette,
            { opacity: 0.08, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true },
            3.4,
          );
          return [cool];
        }
        // Pre-build (settled): live wire + breathing artifact + caret.
        const idles: gsap.core.Animation[] = [];
        if (runnerEl && runLen > 0) {
          gsap.set(runnerEl, {
            opacity: 1,
            strokeDasharray: `40 ${runLen + 40}`,
            strokeDashoffset: 40,
          });
          idles.push(
            gsap.to(runnerEl, {
              strokeDashoffset: -runLen,
              duration: 4,
              ease: "none",
              repeat: -1,
            }),
          );
        }
        if (chipEl) idles.push(pulse(chipEl, 1.03, 1.2));
        if (caretEl) {
          idles.push(
            gsap.to(caretEl, {
              opacity: 0,
              duration: 0.53,
              ease: "steps(1)",
              repeat: -1,
              yoyo: true,
            }),
          );
        }
        return idles;
      };

      return { entrance, build, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="08-trap"
      hasBuild
      title="Ещё одно: ловушка на работу с данными — два чата, одна граница"
      srSummary="Два чата с разными уровнями доверия: ИИ-напарник, который знает проект, и внешний публичный чат. Кандидат вставил файл customers.csv с пометкой «персональные данные» во внешний чат — обнаружена утечка по точному совпадению, ось «цифровая гигиена» обвалилась с 89 до 18. 11% всего, что вставляют в ChatGPT, — внутренняя информация (Cyberhaven, телеметрия 1,6 млн сотрудников)."
      className="py-6 lg:py-8"
    >
      {/* Persistent post-leak vignette — the slide's wounded-cool freeze
          frame (§4.08 cut). Absolute to .slide (sticky ancestor). */}
      <div
        aria-hidden="true"
        data-vignette
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 62% 40%, rgba(239,68,68,0.9), transparent 70%)",
        }}
      />

      {/* Top band ≤88px: plaque left, title centered at lg. */}
      <header data-band className="relative">
        <p
          data-plaque
          className="mb-1.5 inline-block rounded-full border border-line-strong bg-fog px-2.5 py-0.5 text-[12px] text-mute lg:absolute lg:left-0 lg:top-1/2 lg:mb-0 lg:-translate-y-1/2 lg:px-3 lg:py-1 lg:text-meta"
        >
          Ещё одно.
        </p>
        <h3
          data-title
          className="font-display text-[length:var(--text-h2)] text-paper lg:text-center lg:text-[length:var(--text-h1)]"
        >
          Два чата. <span className="text-flame">Одна граница.</span>
        </h3>
      </header>

      {/* Middle band: dual chat panes + boundary line, fixed 380px at lg. */}
      <div className="mt-2 grid gap-2 lg:mt-3.5 lg:grid-cols-[1fr_96px_1fr] lg:gap-0">
        {/* LEFT — ИИ-напарник (trusted). */}
        <article
          data-panel="buddy"
          className="flex flex-col gap-2 rounded-2xl border border-trust/30 bg-fog p-2.5 lg:h-[380px] lg:gap-3 lg:p-5"
        >
          <header className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-trust lg:text-meta">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-trust" />
              ИИ-напарник
            </span>
            <span className="text-[12px] text-mute lg:text-meta">
              знает ваш проект
            </span>
          </header>
          <div className="space-y-2 lg:space-y-2.5">
            <Bubble data-rise side="them" tone="trust">
              Файл <code className="text-mute">customers.csv</code> помечен{" "}
              <span className="text-amber-400">персональные данные</span>.
              Внутри кейса можно работать с ним напрямую.
            </Bubble>
            <Bubble data-rise side="me" className="hidden lg:block">
              окей. как переписать{" "}
              <code className="text-mute">stripe.Refund.create</code> на батч?
            </Bubble>
            <Bubble data-rise side="them" tone="trust" className="hidden lg:block">
              Покажу на 5 строках — пробежим вместе.
            </Bubble>
          </div>
          {/* The trap artifact — border is gsap-driven: amber pre-flare
              (§2.4), leak-tinted from the crossing on. */}
          <FileChip className="self-start" />
          <footer className="mt-auto hidden text-meta text-mute lg:block">
            <span className="text-paper">Доверенный канал.</span> Чувствительные
            артефакты — можно.
          </footer>
        </article>

        {/* Boundary — animated trap stack: neutral wire → leak strobe →
            cooled line-strong. Vertical at lg, horizontal <lg. */}
        <div className="flex items-center justify-center lg:h-[380px] lg:py-2">
          <BoundaryLine
            tone="trap"
            orientation="vertical"
            className="hidden lg:block"
          />
          <BoundaryLine
            tone="trap"
            orientation="horizontal"
            className="h-5 lg:hidden"
          />
        </div>

        {/* RIGHT — внешний публичный чат (untrusted). */}
        <article
          data-panel="external"
          className="flex flex-col gap-2 rounded-2xl border border-line-strong bg-fog p-2.5 lg:h-[380px] lg:gap-3 lg:p-5"
        >
          <header className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-sterile lg:text-meta">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sterile" />
              Внешний публичный чат
            </span>
            <span className="rounded-full border border-line bg-ink/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-sterile">
              Публичный
            </span>
          </header>
          <p className="hidden text-meta text-mute lg:block">
            сторонний сервис · не знает контекста
          </p>

          {/* Message slot — safe and leak absolutely stacked; the build
              crossfades safe → leak at the flare. Leak (taller) keeps the
              slot height stable across both states. */}
          <div className="relative">
            <div
              data-msg="safe"
              data-rise
              aria-hidden="true"
              className="absolute inset-0 opacity-0"
            >
              <Bubble side="me" tone="sterile">
                как переписать stripe.Refund.create на батч?
              </Bubble>
            </div>
            <div data-msg="leak">
              <Bubble side="me" tone="leak">
                перепиши на батч — вот данные:{" "}
                <code className="text-paper">name,email,charge_id,amount</code>
                <br />
                Маркова,Е.,m@…,ch_3Pq…,4500…
              </Bubble>
            </div>
          </div>

          {/* Leak flag — stamped at the crossing (sanctioned slam, §2.3). */}
          <p
            data-leak-flag
            className="rounded-lg border border-leak/40 bg-leak/10 px-3 py-1.5 text-[12px] leading-snug text-leak lg:py-2 lg:text-meta"
          >
            ⚠ обнаружена утечка: <code>customers.csv</code> · точное совпадение
          </p>

          {/* Input row — the chip's landing strip; caret blinks pre-build. */}
          <div
            data-input
            className="mt-auto hidden items-center gap-2 rounded-lg border border-line bg-ink/40 px-3 py-2 lg:flex"
          >
            <span aria-hidden="true" data-caret className="h-3.5 w-px bg-sterile" />
            <span className="text-meta text-dim">спросите что-нибудь…</span>
          </div>

          <footer className="hidden text-meta text-mute lg:block">
            <span className="text-paper">Недоверенный канал.</span>{" "}
            Чувствительные артефакты — нельзя.
          </footer>
        </article>
      </div>

      {/* Bottom band ~210px: compact 5-axis matrix (lg, dense, animated) +
          Cyberhaven quote. <lg the matrix collapses to the spec's bespoke
          single-axis «цифровая гигиена» strip — the leak crash stays visible
          on phones (scaleX + score hooks, same build timeline). */}
      <div
        data-bottom
        className="mt-2 grid items-center gap-2 lg:mt-3.5 lg:grid-cols-2 lg:gap-6"
      >
        <div data-matrix>
          <ProcessMatrix
            axes={TRAP_AXES}
            leakLabel={LEAK_AXIS}
            dense
            animated
            className="hidden lg:block"
          />
          <div
            data-leak-strip
            className="flex items-center gap-2.5 rounded-xl border border-line bg-fog px-3 py-2 lg:hidden"
          >
            <span
              data-strip-label
              className="shrink-0 text-[11px] leading-tight text-leak"
            >
              цифровая гигиена{" "}
              <span
                data-strip-leakword
                className="text-[9px] uppercase tracking-widest"
              >
                утечка
              </span>
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line animate-pulse">
              <span
                data-strip-fill
                className="absolute inset-0 block origin-left rounded-full bg-leak"
                style={{ transform: "scaleX(0.18)" }}
              />
            </div>
            <span
              data-strip-value
              className="w-7 shrink-0 text-right font-mono text-[11px] tabular-nums text-leak"
            >
              <span data-strip-score>18</span>
            </span>
          </div>
        </div>
        <figure data-quote className="flex flex-col gap-1.5 lg:gap-2">
          <p
            className="font-display text-[length:var(--text-lede)] text-paper lg:text-[length:var(--text-h2)]"
            style={{ lineHeight: 1.15 }}
          >
            <span data-quote-stat className="inline-block text-flame">
              11%
            </span>{" "}
            всего, что вставляют в ChatGPT — внутренняя информация.
          </p>
          <figcaption className="text-meta text-dim">
            Cyberhaven · телеметрия 1,6 млн сотрудников
          </figcaption>
        </figure>
      </div>

      {/* Overlay layer (§1.5): travelling ghost chip + the full-bleed flare.
          Both anchor to the sticky .slide stage (inset-0), scene-contained. */}
      <div
        aria-hidden="true"
        data-ghost-layer
        className="pointer-events-none absolute inset-0 z-20"
      >
        <span data-ghost className="absolute left-0 top-0 opacity-0">
          <FileChip ghost />
        </span>
      </div>
      <FlareOverlay />
    </Slide>
  );
}

/* ----------------------------------------------------------------------- */

/** Dual-chat bubble — carried over from v1 06-data-trap (strings verbatim). */
function Bubble({
  side,
  tone,
  className,
  children,
  ...rest
}: {
  side: "me" | "them";
  tone?: "trust" | "sterile" | "leak";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const base =
    "max-w-[92%] rounded-xl border px-3 py-1.5 text-[12px] leading-snug lg:py-2 lg:text-meta";
  const align = side === "me" ? "ml-auto" : "mr-auto";
  const variant =
    tone === "trust"
      ? "border-trust/30 bg-trust/10 text-paper"
      : tone === "leak"
        ? "border-leak/40 bg-leak/10 text-paper"
        : tone === "sterile"
          ? "border-line bg-ink/30 text-mute"
          : "border-line bg-ink/30 text-paper";
  return (
    <div className={`${base} ${align} ${variant} ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
}
