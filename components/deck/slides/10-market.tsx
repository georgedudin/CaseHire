"use client";

/**
 * Slide 10 — Рынок · «Dive to the Ember» (landing_v2.md §4 slide 10 +
 * Director's cut; copy verbatim from ru_pitch_v2.md слайд 10).
 *
 * P3 MOTION — true two-stage geometry (replaces the P2 pre-composed dive):
 *   STAGE A («settled») — camera scale 1: TAM is a huge off-canvas arc
 *     (circle r=700 world units centered at 640,−80 — off the top edge)
 *     curving across the frame; SAM (r=138) fully visible lower-right
 *     INSIDE the arc; клин dashed ring small (r=47) at 40%; SOM an ember
 *     dot (r=12 world units ≈ 10–20px rendered — area-true ×3.9 vs клин).
 *     Left column shows stage-A stats: 99,3 / 3,85 + chips 43/27.
 *   STAGE B («built») — the DIVE: ONE transform on <g data-camera>
 *     (scale → maxScale about the ember cluster + pan to field center,
 *     capped at ~1.2s, power3.inOut = --ease-in-out-quart); TAM/SAM dim
 *     to 0.15; клин redraws crisp via DrawSVG **on a mask circle** (DrawSVG
 *     overwrites stroke-dasharray, so drawing the dashed ring directly
 *     would destroy the dash pattern); SOM relaxes to flame/20 fill + ring;
 *     goal label FADES up (no stamp — grammar reserved, §2.3); left column
 *     crossfades stage-A stats ↔ клин figures with numeric rolls. All HTML
 *     labels live OUTSIDE the scaled group.
 *
 * Zoom clamp (Director's cut, binding):
 *   maxScale = (0.73 × viewportH) / клинRingDiameterPx, additionally capped
 *   by 0.94 × field width (wide-viewport guard so the dived ring never
 *   clips horizontally) and by ×3 below lg (§5: mobile plays a REDUCED ×3
 *   dive — the raw formula over-computes there because the 164px field no
 *   longer approximates the viewport height).
 *   Verified at 1366×768: field ≈ 713×~520 → unit = 520/640 = 0.8125 →
 *   клинRingDiameterPx = 94 × 0.8125 ≈ 76.4 → maxScale = (0.73×768)/76.4
 *   ≈ 7.3 → dived клин diameter = 0.73×768 ≈ 561px ≤ 0.75×768 = 576 ✓.
 *
 * Entrance (≤3.4s): eyebrow+headline rise 0.0 · TAM arc DrawSVG 1.2s +
 *   «99,3» count-up (ru-RU comma) + source fade 0.3 · SAM scale 0.6→1
 *   back.out(1.4) + «3,85» 1.0 · chips 43/27 dock + counts 1.8 · клин to
 *   40% + SOM ember ignites scale 0→1 back.out(2) 2.4 → settle ≈2.95s.
 * Build (≤3.2s): camera dive 0→1.2 · TAM/SAM → 0.15 · stage-A column out
 *   0.05 · клин redraw 0.85→1.6 · клин figures crossfade + rolls 1.0 ·
 *   SOM fill+ring & goal label fade-up 2.0 → done ≈2.55s.
 * Idles: SETTLED — ember breathe scale 1→1.18 + halo 0.25↔0.5 (2.4s) +
 *   клин ring 360°/60s linear; BUILT — same ember breathe at dived size.
 *
 * Vertical budgets (zero internal scroll) — unchanged from the P2 audit;
 * the stage layers overlap via [grid-area:1/1], so the stat card height is
 * max(stage-A, stage-B) ≈ the audited stage-B stack:
 *   375×620  — py-6 → 572 avail: head ~120 + field 164 + card ~210 +
 *              gaps 24 ≈ 518 ✓
 *   1366×768 — py-8 → 704 avail: left col ≈ 540, field ≈ 520 ✓
 *   1920×1080 — same composition with air; field caps at 640px.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import type { SlideStage } from "@/components/deck/deck-controller";
import { addCountUp, countUpText } from "@/lib/motion/count-up";

/* World geometry (viewBox 0 0 640 640) — area-true radius ratios:
 * TAM/SAM ×5.07 (99,3/3,85), SAM/клин ×2.94 (~×3), клин/SOM ×3.9 (~×4). */
const WORLD = 640;
const SAM_C = { x: 430, y: 330, r: 138 };
const KLIN = { x: 455, y: 365, r: 47 };
const SOM_R = 12;
const EMBER_ORIGIN = `${KLIN.x} ${KLIN.y}`;
const SAM_ORIGIN = `${SAM_C.x} ${SAM_C.y}`;
/** Pan that recenters the ember cluster on the field while diving. */
const CENTER_DX = WORLD / 2 - KLIN.x; // -135
const CENTER_DY = WORLD / 2 - KLIN.y; // -45
/** TAM arc: circle r=700 at (640,−80) — the in-frame segment, padded. */
const TAM_D = "M -36 101 A 700 700 0 0 0 762 609";

const TAM_OPTS = { to: 99.3, duration: 1.6, decimals: 1 };
const SAM_OPTS = { to: 3.85, duration: 1.4, decimals: 2 };
const CHIP_OPTS = [
  { to: 43, duration: 1.2, suffix: "%" },
  { to: 27, duration: 1.2, suffix: "%" },
];

export function Slide10Market() {
  const { ref } = useDeckSlide({
    id: "10-market",
    hasBuild: true,
    // <lg: reduced ×3 dive auto-chains 1.5s after settle (Director's cut, §5).
    autoChainMs: 1500,
    create: ({ root, reduced }) => {
      const lg = window.matchMedia("(min-width: 1024px)").matches;
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);
      const all = (sel: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(sel));

      /* ---- targets ---------------------------------------------------- */
      const head = all("[data-head]");
      const svgEl = root.querySelector<SVGSVGElement>("[data-field-svg]")!;
      const camera = svgEl.querySelector<SVGGElement>("[data-camera]")!;
      const tam = svgEl.querySelector<SVGPathElement>("[data-tam]")!;
      const sam = svgEl.querySelector<SVGCircleElement>("[data-sam]")!;
      const klin = svgEl.querySelector<SVGCircleElement>("[data-klin]")!;
      const klinMask = svgEl.querySelector<SVGCircleElement>("[data-klin-mask]")!;
      const som = svgEl.querySelector<SVGCircleElement>("[data-som]")!;
      const halo = svgEl.querySelector<SVGCircleElement>("[data-som-glow]")!;
      const goal = one("[data-goal]")!;
      const layerA = one("[data-layer-a]")!;
      const rowsA = all("[data-a-row]");
      const layerB = one("[data-layer-b]")!;
      const chips = all("[data-chip-pill]");
      const chipNums = all("[data-chip-num]");
      const tamNum = one("[data-count-tam]");
      const samNum = one("[data-count-sam]");
      const rolls = all("[data-roll]");

      /* ---- zoom clamp (measured against the live field) ----------------- */
      const rect = svgEl.getBoundingClientRect();
      const unit = Math.max(Math.min(rect.width, rect.height), 1) / WORLD;
      const klinDiaPx = 2 * KLIN.r * unit;
      let maxScale = (0.73 * window.innerHeight) / klinDiaPx;
      maxScale = Math.min(maxScale, (0.94 * Math.max(rect.width, 1)) / klinDiaPx);
      if (!lg) maxScale = Math.min(maxScale, 3); // §5: mobile = reduced ×3 dive
      maxScale = Math.max(maxScale, 1.5);
      const somDivedR = SOM_R * unit * maxScale;

      // Goal label hugs the dived ember's right edge (HTML, outside camera).
      gsap.set(goal, { x: somDivedR + (lg ? 20 : 12), yPercent: -50 });

      const rollTarget = (el: HTMLElement) => Number(el.dataset.roll ?? 0);

      let stage: "settled" | "built" = "settled";

      /* ---- state setters ------------------------------------------------ */
      const setDormant = () => {
        stage = "settled";
        gsap.set(head, { autoAlpha: 0, y: 24 });
        gsap.set(tam, { drawSVG: "0%", opacity: 1 });
        gsap.set(klinMask, { drawSVG: "100%" });
        gsap.set(sam, { autoAlpha: 0, scale: 0.6, svgOrigin: SAM_ORIGIN, opacity: 1 });
        gsap.set(klin, { opacity: 0, rotation: 0, svgOrigin: EMBER_ORIGIN });
        gsap.set(som, {
          scale: 0,
          svgOrigin: EMBER_ORIGIN,
          fillOpacity: 1,
          strokeOpacity: 0,
        });
        gsap.set(halo, { opacity: 0 });
        gsap.set(camera, { scale: 1, x: 0, y: 0, svgOrigin: EMBER_ORIGIN });
        gsap.set(layerA, { autoAlpha: 1, y: 0 });
        gsap.set(rowsA, { autoAlpha: 0 });
        if (tamNum) tamNum.textContent = countUpText(0, TAM_OPTS);
        if (samNum) samNum.textContent = countUpText(0, SAM_OPTS);
        gsap.set(chips, { autoAlpha: 0, y: 16 });
        chipNums.forEach((el, i) => {
          el.textContent = countUpText(0, CHIP_OPTS[i] ?? CHIP_OPTS[0]);
        });
        gsap.set(layerB, { autoAlpha: 0, y: 8 });
        for (const el of rolls) el.textContent = "0";
        gsap.set(goal, { autoAlpha: 0, y: 12 });
      };

      const setFrozen = (s: SlideStage) => {
        stage = s === "built" ? "built" : "settled";
        gsap.set(head, { autoAlpha: 1, y: 0 });
        gsap.set(tam, { drawSVG: "100%" });
        gsap.set(klinMask, { drawSVG: "100%" });
        gsap.set(sam, { autoAlpha: 1, scale: 1, svgOrigin: SAM_ORIGIN });
        gsap.set(klin, { rotation: 0, svgOrigin: EMBER_ORIGIN });
        gsap.set(som, { scale: 1, svgOrigin: EMBER_ORIGIN });
        if (tamNum) tamNum.textContent = countUpText(99.3, TAM_OPTS);
        if (samNum) samNum.textContent = countUpText(3.85, SAM_OPTS);
        chipNums.forEach((el, i) => {
          const opts = CHIP_OPTS[i] ?? CHIP_OPTS[0];
          el.textContent = countUpText(opts.to, opts);
        });
        for (const el of rolls)
          el.textContent = countUpText(rollTarget(el), { to: rollTarget(el) });
        gsap.set(chips, { autoAlpha: 1, y: 0 });
        if (stage === "built") {
          gsap.set(camera, {
            scale: maxScale,
            x: CENTER_DX,
            y: CENTER_DY,
            svgOrigin: EMBER_ORIGIN,
          });
          gsap.set([tam, sam], { opacity: 0.15 });
          gsap.set(klin, { opacity: 0.85 });
          gsap.set(som, { fillOpacity: 0.2, strokeOpacity: 1 });
          gsap.set(halo, { opacity: 0.35 });
          gsap.set(layerA, { autoAlpha: 0, y: -8 });
          gsap.set(layerB, { autoAlpha: 1, y: 0 });
          gsap.set(goal, { autoAlpha: 1, y: 0 });
        } else {
          gsap.set(camera, { scale: 1, x: 0, y: 0, svgOrigin: EMBER_ORIGIN });
          gsap.set([tam, sam], { opacity: 1 });
          gsap.set(klin, { opacity: 0.4 });
          gsap.set(som, { fillOpacity: 1, strokeOpacity: 0 });
          gsap.set(halo, { opacity: 0.3 });
          gsap.set(layerA, { autoAlpha: 1, y: 0 });
          gsap.set(rowsA, { autoAlpha: 1 });
          gsap.set(layerB, { autoAlpha: 0, y: 8 });
          gsap.set(goal, { autoAlpha: 0, y: 12 });
        }
      };

      if (reduced) {
        // Hook applies setFrozen("built") itself — the dived composite.
        return { entrance: gsap.timeline({ paused: true }), setFrozen, setDormant };
      }

      /* ---- entrance (stage A, settle ≈2.95s ≤3.4) ----------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance
        .to(head, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.08 }, 0)
        .to(tam, { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" }, 0.3)
        .to(rowsA[0] ?? [], { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.3);
      addCountUp(entrance, 0.35, tamNum, TAM_OPTS);
      entrance
        .to(sam, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 1.0)
        .to(rowsA[1] ?? [], { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 1.0);
      addCountUp(entrance, 1.05, samNum, SAM_OPTS);
      entrance.to(
        chips,
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.12 },
        1.8,
      );
      chipNums.forEach((el, i) =>
        addCountUp(entrance, 1.85 + i * 0.12, el, CHIP_OPTS[i] ?? CHIP_OPTS[0]),
      );
      entrance
        .to(klin, { opacity: 0.4, duration: 0.5, ease: "power1.inOut" }, 2.4)
        .to(som, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 2.4)
        .to(halo, { opacity: 0.3, duration: 0.5, ease: "power1.inOut" }, 2.45)
        .call(() => {
          stage = "settled";
        });

      /* ---- build: THE DIVE (one-shot, done ≈3.05s ≤3.2) ----------------- */
      const build = gsap.timeline({ paused: true });
      build
        // (a) camera 1→maxScale toward the ember, capped ~1.2s (binding).
        .to(
          camera,
          {
            scale: maxScale,
            x: CENTER_DX,
            y: CENTER_DY,
            duration: 1.2,
            ease: "power3.inOut", // --ease-in-out-quart
            svgOrigin: EMBER_ORIGIN,
          },
          0,
        )
        .to([tam, sam], { opacity: 0.15, duration: 0.5, ease: "power1.inOut" }, 0)
        .to(layerA, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power1.in" }, 0.05)
        // (b) клин redraw (mask circle — dash pattern survives) + figures.
        .set(klinMask, { drawSVG: "0%" }, 0.85)
        .set(klin, { opacity: 0.85 }, 0.85)
        .to(klinMask, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" }, 0.9)
        .to(layerB, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.0);
      for (const el of rolls) {
        addCountUp(build, 1.05, el, {
          to: rollTarget(el),
          duration: 1.2,
          ease: "power2.out",
        });
      }
      build
        // (c) SOM fills flame/20 + ring; goal label FADES up (no stamp, §2.3).
        .to(som, { fillOpacity: 0.2, strokeOpacity: 1, duration: 0.4 }, 2.0)
        .to(halo, { opacity: 0.35, duration: 0.4 }, 2.0)
        .to(goal, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 2.05)
        .call(() => {
          stage = "built";
        });

      /* ---- idles --------------------------------------------------------- */
      const makeIdles = (): gsap.core.Animation[] => {
        const idles: gsap.core.Animation[] = [
          // Ember breathe — both stages (built: same breathe at dived size).
          gsap.fromTo(
            som,
            { scale: 1 },
            {
              scale: 1.18,
              svgOrigin: EMBER_ORIGIN,
              duration: 2.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
          ),
          gsap.fromTo(
            halo,
            { opacity: stage === "built" ? 0.3 : 0.25 },
            { opacity: 0.5, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 },
          ),
        ];
        if (stage !== "built") {
          idles.push(
            gsap.to(klin, {
              rotation: 360,
              svgOrigin: EMBER_ORIGIN,
              duration: 60,
              ease: "none",
              repeat: -1,
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
          20–35 млн ₽, 50–80 платящих.
        </>
      }
      className="py-6 lg:py-8"
    >
      <div className="grid gap-y-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-4">
        {/* ---- Zone 1: eyebrow + headline (left column, row 1) ---- */}
        <div className="lg:col-start-1 lg:row-start-1">
          <p
            data-head
            className="text-meta uppercase tracking-[0.32em] text-dim"
          >
            Рынок
          </p>
          <h3
            data-head
            className="font-display mt-3 max-w-[16ch] text-[length:var(--text-h1)] text-paper"
          >
            Рынок есть. И&nbsp;он растёт на&nbsp;38% в&nbsp;год.
          </h3>
        </div>

        {/* ---- Zone 2: circle field — STAGE-A geometry; the build dives the
                camera group (right, spans rows). JSX renders the stage-A
                frame; gsap owns both stages at runtime (veil covers SSR). ---- */}
        <div className="relative h-[164px] w-full lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:max-h-[640px]">
          <svg
            data-field-svg
            className="h-full w-full"
            viewBox="0 0 640 640"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="s10-glow">
                <stop offset="0%" stopColor="var(--color-flame)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--color-flame)" stopOpacity="0" />
              </radialGradient>
              {/* Клин redraw mask — DrawSVG runs HERE so the dashed ring's
                  own stroke-dasharray is never touched. */}
              <mask id="s10-klin-mask">
                <circle
                  data-klin-mask
                  cx={KLIN.x}
                  cy={KLIN.y}
                  r={KLIN.r}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="8"
                />
              </mask>
            </defs>
            {/* Camera dive = single transform on this group; all strokes are
                non-scaling so they stay 1.5px through the zoom. */}
            <g data-camera>
              {/* TAM — huge arc, center off-canvas top-right (r=700). */}
              <path
                data-tam
                d={TAM_D}
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              {/* SAM — fully visible circle inside the arc (r=138). */}
              <circle
                data-sam
                cx={SAM_C.x}
                cy={SAM_C.y}
                r={SAM_C.r}
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              {/* Клин — small dashed ring inside SAM (r=47). */}
              <circle
                data-klin
                cx={KLIN.x}
                cy={KLIN.y}
                r={KLIN.r}
                fill="none"
                stroke="var(--color-mute)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                opacity="0.4"
                mask="url(#s10-klin-mask)"
                vectorEffect="non-scaling-stroke"
              />
              {/* SOM glow halo — pre-rendered gradient, opacity-only. */}
              <circle
                data-som-glow
                cx={KLIN.x}
                cy={KLIN.y}
                r={28}
                fill="url(#s10-glow)"
                opacity="0.3"
              />
              {/* SOM — the ember (r=12 world units; solid dot in stage A,
                  flame/20 fill + ring after the dive). */}
              <circle
                data-som
                cx={KLIN.x}
                cy={KLIN.y}
                r={SOM_R}
                fill="var(--color-flame)"
                stroke="var(--color-flame)"
                strokeWidth="1.5"
                strokeOpacity="0"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {/* Goal label — HTML overlay beside the dived SOM (outside the
              scaled group; x is set from the computed dived ember radius). */}
          <div
            data-goal
            className="invisible absolute left-1/2 top-1/2 max-w-[140px] opacity-0 lg:max-w-none"
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

        {/* ---- Zone 3: stat stack — stage layers overlap via grid-area,
                crossfaded by the dive (left column, row 2) ---- */}
        <div className="rounded-2xl border border-line bg-fog p-3 lg:col-start-1 lg:row-start-2 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
          <div className="grid">
            {/* Stage A — headline numbers (prominent pre-dive). */}
            <div data-layer-a className="[grid-area:1/1] space-y-2 lg:space-y-4">
              <p data-a-row>
                <span className="font-display block text-[22px] font-semibold leading-none tabular-nums text-paper lg:text-[length:var(--text-h1)]">
                  <span data-count-tam>99,3</span> млрд ₽
                </span>
                <span className="mt-1 block max-w-[34ch] text-[11px] leading-snug text-dim lg:text-[13px]">
                  российский HR-tech, 2024, +38% · Smart Ranking
                </span>
              </p>
              <p data-a-row>
                <span className="font-display block text-[18px] font-semibold leading-none tabular-nums text-paper lg:text-[length:var(--text-h2)]">
                  <span data-count-sam>3,85</span> млрд ₽
                </span>
                <span className="mt-1 block max-w-[34ch] text-[11px] leading-snug text-dim lg:text-[13px]">
                  наш сегмент: оценка и развитие, +38%
                </span>
              </p>
            </div>

            {/* Stage B — клин figures (crossfade in with the dive). */}
            <div
              data-layer-b
              className="invisible [grid-area:1/1] opacity-0"
            >
              <div className="space-y-1.5 lg:space-y-2.5">
                <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
                  <span className="font-display font-semibold tabular-nums">
                    <span data-roll="400">400</span>–<span data-roll="800">800</span>{" "}
                    компаний
                  </span>{" "}
                  <span className="text-dim">(10–50 джунов в год)</span>
                </p>
                <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
                  средний чек{" "}
                  <span className="font-display font-semibold tabular-nums">
                    <span data-roll="400">400</span>–<span data-roll="900">900</span>{" "}
                    тыс ₽/год
                  </span>
                </p>
                <p className="text-[14px] text-paper lg:text-[length:var(--text-lede)]">
                  потолок клина{" "}
                  <span className="font-display font-semibold tabular-nums">
                    <span data-roll="160">160</span>–<span data-roll="720">720</span>{" "}
                    млн ₽
                  </span>
                </p>
              </div>
              {/* Stage-A headline numbers stay on screen small/dim in the
                  dived frame (frozen-state continuity). */}
              <div className="mt-3 space-y-1 opacity-60 lg:mt-4">
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
            </div>
          </div>

          {/* Docked chips 43% / 27% + (Известия) — persist through the dive. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:mt-4">
            <span
              data-chip-pill
              className="rounded-full border border-line bg-fog px-2.5 py-1 text-[11px] text-mute lg:border-line-strong lg:text-[12px]"
            >
              <span data-chip-num className="font-semibold tabular-nums text-paper">
                43%
              </span>{" "}
              компаний уже используют ИИ в HR
            </span>
            <span
              data-chip-pill
              className="rounded-full border border-line bg-fog px-2.5 py-1 text-[11px] text-mute lg:border-line-strong lg:text-[12px]"
            >
              <span data-chip-num className="font-semibold tabular-nums text-paper">
                27%
              </span>{" "}
              тестируют для 2026
            </span>
            <span data-chip-pill className="text-[11px] text-dim">
              (Известия)
            </span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
