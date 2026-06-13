"use client";

/**
 * Slide 09 — Две аудитории · «Circulation — the living boundary»
 * (landing_v2.md §4 slide 09 + Director's cut). No build step.
 *
 * MOTION (P3):
 *   Entrance (readable ≤3.4s): title words rise → HrKanban + TeamleadSetup
 *   rise → teamlead micro-story (four status marks pop back.out(2) stagger
 *   0.12; layer-4 ticks 65→100% via textContent, then its flame % flips to
 *   a trust ✓) → boundary reveals top→bottom (clip-path on the svg — DrawSVG
 *   would destroy the 6/10 dash pattern, see deviation note) →
 *   CandidateIde rises, editor lines reveal via clip-path stagger 0.09 +
 *   caret → metric chips flip up rotationX −28°→0 WITH transformPerspective
 *   600 (binding) + count-ups (0→70% / 0→40 / 0→100%, static «≥» outside the
 *   counted node on chips 1–2; eyebrow «целевые метрики пилота»).
 *
 *   FIRST PULSE at t≈3.5 INSIDE the entrance tl: a 12px ember orb is born at
 *   the IDE status bar (tests flash trust), travels the measured path via
 *   MotionPathPlugin, the boundary dashes part around it (dashoffset nudge),
 *   lands on «Junior Backend · Go»: back.out(3) pop, 47→48, +12→+13 flame
 *   flash, metric underline sweep. The tick happens EXACTLY once — idle
 *   replays are arrival flashes only, no re-increments.
 *
 *   Idles: pulse replays every ~6s alternating arrival targets (kanban card
 *   flash / teamlead header glow) + underline sweep per arrival; boundary
 *   dash drift 20s linear; IDE caret blink.
 *
 *   Frozen state (= post-first-pulse): everything settled, kanban 48 / +13,
 *   layer-4 ✓ trust, metrics at value. setDormant restores 47 / +12 / 65%.
 *
 *   BINDING (Director's cut): pulse-path endpoints measured via gBCR AFTER
 *   the buyer column's scale(0.92) wrapper applies (gBCR includes CSS
 *   transforms; measured pristine at create, re-measured naturally by the
 *   useDeckSlide resize rebuild). Mobile: same code path — the measured
 *   endpoints make the orb travel bottom→top across the horizontal boundary.
 *
 * Vertical budget unchanged from the audited static skeleton (P2 header);
 * the metric underline adds ~5px under the chips row. Zero red (§2.4).
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { BoundaryLine } from "@/components/deck/parts/boundary-line";
import { MetricChip } from "@/components/deck/parts/metric-chip";
import { HrKanban } from "@/components/mockups/hr-kanban";
import { TeamleadSetup } from "@/components/mockups/teamlead-setup";
import { CandidateIde } from "@/components/mockups/candidate-ide";
import { addCountUp, countUpText, type CountUpOpts } from "@/lib/motion/count-up";

const METRICS: CountUpOpts[] = [
  { to: 70, suffix: "%", duration: 0.8, ease: "power2.out" },
  { to: 40, duration: 0.8, ease: "power2.out" },
  { to: 100, suffix: "%", duration: 0.8, ease: "power2.out" },
];
const PULSE_AT = 3.5; // first pulse — inside the entrance tl
const TRAVEL = 1.1;

export function Slide09TwoAudiences() {
  const { ref } = useDeckSlide({
    id: "09-two-audiences",
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const vis = (el: Element) => el.getClientRects().length > 0;

      const docStyle = getComputedStyle(document.documentElement);
      const token = (name: string, fallback: string) =>
        docStyle.getPropertyValue(name).trim() || fallback;
      const TRUST = token("--color-trust", "#22c55e");
      const FLAME = token("--color-flame", "#ff5a1f");
      const TRUST_BORDER = "rgba(34, 197, 94, 0.4)"; // border-trust/40
      const TRUST_BG = "rgba(34, 197, 94, 0.15)"; // bg-trust/15

      /* ---- targets ----------------------------------------------------- */
      const stageEl = root.querySelector<HTMLElement>(".slide") ?? root;
      const titleEl = q("[data-title]")[0];
      const riseBuyer = q("[data-rise-buyer]");
      const riseTeam = q("[data-rise-team]").filter(vis);
      const riseCand = q("[data-rise-cand]");
      const statuses = q("[data-layer-status]").filter(vis);
      const status4 = statuses.find(
        (el) => (el as HTMLElement).dataset.layerStatus === "4",
      ) as HTMLElement | undefined;
      const badge4 = q('[data-layer-badge="4"]').filter(vis)[0];
      const dots = q("[data-layer-dot]").filter(vis);
      const dot4 = q('[data-layer-dot="4"]').filter(vis)[0];
      const teamHead = q("[data-team-head]").filter(vis)[0];
      const boundarySvg = q("[data-boundary]").filter(vis)[0] as
        | Element
        | undefined;
      const boundaryRect = boundarySvg?.getBoundingClientRect();
      const boundaryVertical = boundaryRect
        ? boundaryRect.height >= boundaryRect.width
        : true;
      const strokes = boundarySvg
        ? Array.from(boundarySvg.querySelectorAll("[data-boundary-stroke]"))
        : [];
      const ideLines = q("[data-ide-line]").filter(vis);
      const ideCaret = q("[data-ide-caret]")[0];
      const testsEl = q("[data-ide-tests]")[0];
      const chips = q('[data-chip="metric"]');
      const chipVals = q("[data-chip-value]");
      const underline = q("[data-metric-underline]")[0];
      const orb = q("[data-orb]")[0];
      const kCount = q("[data-kanban-count]")[0];
      const kBadge = q("[data-kanban-badge]")[0];
      const kCard = kCount?.closest("[data-kanban-card]") ?? null;

      // Boundary reveal/conceal — clip-path, NOT DrawSVG: DrawSVG overwrites
      // stroke-dasharray and would erase the circulation dash pattern.
      const CLIP_OPEN = "inset(0% 0% 0% 0%)";
      const CLIP_SHUT = boundaryVertical
        ? "inset(0% 0% 100% 0%)" // draws top→bottom
        : "inset(0% 100% 0% 0%)"; // draws left→right

      /* ---- pulse geometry (pristine gBCR, AFTER CSS scale wrappers) ----- */
      const stageRect = stageEl.getBoundingClientRect();
      const rel = (r: DOMRect, cx = 0.5, cy = 0.5) => ({
        x: r.left + r.width * cx - stageRect.left - 6, // 12px orb → center it
        y: r.top + r.height * cy - stageRect.top - 6,
      });
      const startPt = testsEl ? rel(testsEl.getBoundingClientRect(), 0.5, 0.5) : null;
      const midPt = boundarySvg ? rel(boundarySvg.getBoundingClientRect()) : null;
      const kanbanPt = kCard ? rel(kCard.getBoundingClientRect(), 0.5, 0.4) : null;
      const teamPt = teamHead ? rel(teamHead.getBoundingClientRect()) : null;
      const pulseLive = Boolean(orb && startPt && midPt && kanbanPt);
      const pathTo = (end: { x: number; y: number }) =>
        [startPt!, midPt!, end].map((p) => ({ x: p.x, y: p.y }));

      const split = titleEl
        ? new SplitText(titleEl, { type: "words" })
        : null;

      /* ---- micro beats reused by entrance + idles ----------------------- */
      /** Arrival flash on the kanban card — visual only, never increments. */
      const addKanbanFlash = (tl: gsap.core.Timeline, at: number) => {
        if (kCard) {
          tl.to(kCard, { scale: 1.04, duration: 0.12, ease: "power1.out" }, at);
          tl.to(kCard, { scale: 1, duration: 0.35, ease: "back.out(3)" }, at + 0.12);
        }
        if (kBadge) {
          tl.fromTo(
            kBadge,
            { opacity: 0.3 },
            { opacity: 1, duration: 0.45, ease: "power2.out" },
            at,
          );
        }
      };
      /** Flame underline sweep beneath the metric chips (scaleX 0→1→fade). */
      const addUnderlineSweep = (tl: gsap.core.Timeline, at: number) => {
        if (!underline) return;
        tl.fromTo(
          underline,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: 0.55, ease: "power2.out" },
          at,
        );
        tl.to(underline, { opacity: 0, duration: 0.45, ease: "power1.in" }, at + 0.6);
        tl.set(underline, { scaleX: 0, opacity: 1 }, at + 1.1);
      };
      /** Orb travel: birth at the IDE status bar → boundary → `end`. */
      const addOrbTravel = (
        tl: gsap.core.Timeline,
        at: number,
        end: { x: number; y: number },
      ) => {
        tl.set(orb, { x: startPt!.x, y: startPt!.y, autoAlpha: 0, scale: 1 }, at);
        if (testsEl) {
          tl.to(testsEl, { color: TRUST, duration: 0.18, yoyo: true, repeat: 1 }, at);
        }
        tl.to(orb, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, at + 0.05);
        tl.to(
          orb,
          {
            motionPath: { path: pathTo(end), curviness: 1.2 },
            duration: TRAVEL,
            ease: "power1.inOut",
          },
          at + 0.05,
        );
        // Dashes part around the orb at the crossing (dashoffset nudge).
        if (strokes.length) {
          tl.to(
            strokes,
            {
              strokeDashoffset: "+=8",
              duration: 0.14,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
            },
            at + 0.05 + TRAVEL * 0.45,
          );
        }
        tl.to(
          orb,
          { autoAlpha: 0, scale: 0.5, duration: 0.2, ease: "power1.in" },
          at + 0.05 + TRAVEL,
        );
        return at + 0.05 + TRAVEL; // arrival time
      };

      /* ---- state setters ------------------------------------------------ */
      const setDormant = () => {
        if (split) gsap.set(split.words, { autoAlpha: 0, y: 24 });
        gsap.set([...riseBuyer, ...riseTeam, ...riseCand], {
          autoAlpha: 0,
          y: 32,
        });
        gsap.set([...statuses, ...dots], { scale: 0 });
        if (status4) {
          status4.textContent = "65%";
          gsap.set(status4, { clearProps: "color" });
        }
        if (badge4) {
          gsap.set(badge4, {
            clearProps: "borderColor,backgroundColor,color",
          });
        }
        if (dot4) gsap.set(dot4, { clearProps: "backgroundColor" });
        if (boundarySvg) gsap.set(boundarySvg, { clipPath: CLIP_SHUT });
        gsap.set(strokes, { strokeDashoffset: 0 });
        gsap.set(ideLines, { clipPath: "inset(0% 100% 0% 0%)" });
        gsap.set(ideCaret, { autoAlpha: 0 });
        if (testsEl) gsap.set(testsEl, { clearProps: "color" });
        gsap.set(chips, {
          autoAlpha: 0,
          rotationX: -28,
          transformPerspective: 600,
        });
        chipVals.forEach((el, i) => {
          el.textContent = countUpText(0, METRICS[i]);
        });
        gsap.set(underline, { scaleX: 0, opacity: 1 });
        gsap.set(orb, { autoAlpha: 0 });
        if (kCount) kCount.textContent = "47";
        if (kBadge) {
          kBadge.textContent = "+12";
          gsap.set(kBadge, { opacity: 1 });
        }
        if (kCard) gsap.set(kCard, { scale: 1 });
      };

      const setFrozen = () => {
        gsap.killTweensOf(
          [orb, kCard, kBadge, testsEl, underline, teamHead].filter(Boolean),
        );
        if (split) gsap.set(split.words, { autoAlpha: 1, y: 0 });
        gsap.set([...riseBuyer, ...riseTeam, ...riseCand], {
          autoAlpha: 1,
          y: 0,
        });
        gsap.set([...statuses, ...dots], { scale: 1 });
        if (status4) {
          status4.textContent = "✓";
          gsap.set(status4, { color: TRUST });
        }
        if (badge4) {
          gsap.set(badge4, {
            borderColor: TRUST_BORDER,
            backgroundColor: TRUST_BG,
            color: TRUST,
          });
        }
        if (dot4) gsap.set(dot4, { backgroundColor: TRUST });
        if (boundarySvg) gsap.set(boundarySvg, { clipPath: CLIP_OPEN });
        gsap.set(ideLines, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(ideCaret, { autoAlpha: 1 });
        if (testsEl) gsap.set(testsEl, { clearProps: "color" });
        gsap.set(chips, { autoAlpha: 1, rotationX: 0, transformPerspective: 600 });
        chipVals.forEach((el, i) => {
          el.textContent = countUpText(METRICS[i].to, METRICS[i]);
        });
        gsap.set(underline, { scaleX: 0, opacity: 1 });
        gsap.set(orb, { autoAlpha: 0 });
        // Post-first-pulse values — the pulse ticked exactly once (§4.09).
        if (kCount) kCount.textContent = "48";
        if (kBadge) {
          kBadge.textContent = "+13";
          gsap.set(kBadge, { opacity: 1 });
        }
        if (kCard) gsap.set(kCard, { scale: 1 });
      };

      /* ---- entrance (readable ≤3.4s; first pulse at 3.5s) ---------------- */
      const entrance = gsap.timeline({ paused: true });
      if (split) {
        entrance.fromTo(
          split.words,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 },
          0,
        );
      }
      entrance.fromTo(
        riseBuyer,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
        0.2,
      );
      entrance.fromTo(
        riseTeam,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
        0.35,
      );
      // Teamlead micro-story: four marks pop, layer-4 completes once.
      entrance.fromTo(
        [...statuses, ...dots],
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.12 },
        0.8,
      );
      if (status4) {
        const proxy = { v: 65 };
        entrance.to(
          proxy,
          {
            v: 100,
            duration: 0.45,
            ease: "power1.inOut",
            onUpdate: () => {
              status4.textContent = `${Math.round(proxy.v)}%`;
            },
          },
          1.3,
        );
        entrance.call(
          () => {
            status4.textContent = "✓";
          },
          [],
          1.8,
        );
        entrance.to(status4, { color: TRUST, duration: 0.25 }, 1.8);
        entrance.fromTo(
          status4,
          { scale: 1.25 },
          { scale: 1, duration: 0.3, ease: "back.out(2)" },
          1.8,
        );
      }
      if (badge4) {
        entrance.to(
          badge4,
          {
            borderColor: TRUST_BORDER,
            backgroundColor: TRUST_BG,
            color: TRUST,
            duration: 0.3,
          },
          1.8,
        );
      }
      if (dot4) {
        entrance.to(dot4, { backgroundColor: TRUST, duration: 0.3 }, 1.8);
      }
      // Boundary reveal top→bottom.
      if (boundarySvg) {
        entrance.fromTo(
          boundarySvg,
          { clipPath: CLIP_SHUT },
          { clipPath: CLIP_OPEN, duration: 0.8, ease: "power2.inOut" },
          1.0,
        );
      }
      // Candidate side: IDE rises, code "types itself" via line clip reveals.
      entrance.fromTo(
        riseCand,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
        1.6,
      );
      entrance.fromTo(
        ideLines,
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.4,
          ease: "power1.inOut",
          stagger: 0.09,
        },
        1.9,
      );
      entrance.set(ideCaret, { autoAlpha: 1 }, 2.7);
      // Metric chips flip up (rotationX with perspective — binding) + counts.
      entrance.fromTo(
        chips,
        { autoAlpha: 0, rotationX: -28, transformPerspective: 600 },
        {
          autoAlpha: 1,
          rotationX: 0,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.12,
        },
        2.7,
      );
      chipVals.forEach((el, i) => {
        addCountUp(entrance, 2.75 + i * 0.12, el, METRICS[i]);
      });
      // FIRST PULSE — ticks 47→48 / +12→+13 exactly once.
      if (pulseLive) {
        const arrive = addOrbTravel(entrance, PULSE_AT, kanbanPt!);
        addKanbanFlash(entrance, arrive);
        entrance.call(
          () => {
            if (kCount) kCount.textContent = "48";
            if (kBadge) kBadge.textContent = "+13";
          },
          [],
          arrive + 0.06,
        );
        addUnderlineSweep(entrance, arrive + 0.1);
      }

      /* ---- idles ---------------------------------------------------------- */
      const makeIdles = (): gsap.core.Animation[] => {
        const idles: gsap.core.Animation[] = [];
        if (ideCaret) {
          idles.push(
            gsap.to(ideCaret, {
              opacity: 0,
              duration: 0.5,
              ease: "steps(1)",
              repeat: -1,
              yoyo: true,
            }),
          );
        }
        if (strokes.length) {
          // Dash drift — dasharray period is 16px; 10 cycles over 20s.
          idles.push(
            gsap.fromTo(
              strokes,
              { strokeDashoffset: 0 },
              { strokeDashoffset: -160, duration: 20, ease: "none", repeat: -1 },
            ),
          );
        }
        if (pulseLive) {
          // Replays are FLASHES only — никогда не re-increment (§4.09 idle).
          // 4.6s lead-in keeps the first replay ~6s after the previous pulse
          // (entrance pulse / re-entry).
          const loop = gsap.timeline({ repeat: -1 }); // deck-contract: idle
          const a1 = addOrbTravel(loop, 4.6, kanbanPt!);
          addKanbanFlash(loop, a1);
          addUnderlineSweep(loop, a1 + 0.1);
          // Alternate target: the teamlead header glow.
          const t2 = a1 + 4.6;
          const a2 = addOrbTravel(loop, t2, teamPt ?? kanbanPt!);
          if (teamHead) {
            loop.to(
              teamHead,
              { color: FLAME, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" },
              a2,
            );
          }
          addUnderlineSweep(loop, a2 + 0.1);
          idles.push(loop);
        }
        return idles;
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="09-two-audiences"
      title="Две аудитории: один продукт, две аудитории первого класса"
      srSummary="Сторона заказчика: HR живёт в канбане позиций и ранжированной ленте, тимлид заполняет четыре слоя один раз. Сторона кандидата: веб-IDE потребительского уровня и целевые метрики пилота — доля завершающих сессию ≥ 70%, NPS кандидата ≥ 40, обратная связь каждому кандидату (100%). Заказчик и кандидат разделены живой границей, через которую циркулирует ценность."
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
          <p
            data-rise-buyer
            className="text-[10px] uppercase tracking-[0.25em] text-dim lg:text-[11px]"
          >
            сторона заказчика
          </p>
          {/* Fixed-height box (§4.09): scale(0.92) is visual-only, so the
              wrapper must cap the LAYOUT height itself or the column keeps
              the unscaled 100% — lg:h value = measured natural stack × 0.92.
              Un-scaled (auto) again at 2xl per spec. */}
          <div className="flex flex-col gap-1.5 lg:h-[584px] lg:origin-top lg:scale-[0.92] lg:gap-3 2xl:h-auto 2xl:scale-100">
            <div data-rise-buyer data-pulse-to>
              <HrKanban />
            </div>
            <div data-rise-team className="hidden lg:block">
              <TeamleadSetup dense />
            </div>
            <div data-rise-team className="lg:hidden">
              <TeamleadSetup strip />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
         * Boundary — same geometry as slide 8, circulation tone (no red).
         * Vertical at lg, horizontal <lg.
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
        </div>

        {/* -------------------------------------------------------------
         * CANDIDATE zone — CandidateIde compact + 3 metric chips.
         * ----------------------------------------------------------- */}
        <div
          data-zone="candidate"
          className="flex min-w-0 flex-col gap-1.5 lg:gap-3"
        >
          <p
            data-rise-cand
            className="text-[10px] uppercase tracking-[0.25em] text-dim lg:text-[11px]"
          >
            сторона кандидата
          </p>
          <div data-rise-cand data-pulse-from>
            <CandidateIde compact caret />
          </div>
          {/* Pushed to the column bottom at lg so the metrics block's lower
              edge aligns with the teamlead stack across the boundary. */}
          <div data-rise-cand className="lg:mt-auto">
            <p className="text-[9px] uppercase tracking-[0.2em] text-dim lg:text-[10px]">
              целевые метрики пилота
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-2 lg:mt-2 lg:gap-3">
              <MetricChip label="завершают сессию" value="70%" prefix="≥" />
              <MetricChip label="NPS кандидата" value="40" prefix="≥" />
              <MetricChip label="фидбэк" value="100%" />
            </div>
            {/* Flame underline — sweeps on each pulse arrival (idle). */}
            <div
              aria-hidden="true"
              data-metric-underline
              className="mt-1 h-px w-full origin-left bg-flame/70"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {/* Overlay layer (§1.5): the circulation orb, scene-contained. */}
      <div
        aria-hidden="true"
        data-orb-layer
        className="pointer-events-none absolute inset-0 z-20"
      >
        <span
          data-orb
          className="absolute left-0 top-0 block h-3 w-3 rounded-full bg-ember opacity-0"
          style={{ boxShadow: "0 0 14px 5px rgba(255, 90, 31, 0.45)" }}
        />
      </div>
    </Slide>
  );
}
