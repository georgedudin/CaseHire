"use client";

/**
 * Slide 06 — Как это работает · «The Generator» (landing_v2.md §4 slide 06
 * + Director's cut). HAS BUILD: gesture at lg+ (midpoint fixation), auto-
 * chain 1500ms after settle <lg — the controller owns arming/debounce.
 *
 * TWO VISUAL STAGES (both reachable by gsap.set):
 *   SETTLED — header + rail + plaques + generator stage in PRE-BUILD form:
 *     the seed console (4 dim layer chips + the seed line TYPED with a
 *     blinking flame caret — §2.3: caret typing is OWNED by this slide),
 *     world viewport = faint dot grid, ticker empty. The pre-build console
 *     is an absolutely-stacked overlay over the (autoAlpha-hidden) built
 *     interior, so the stage card never changes size (implementation note:
 *     "never tween the stage card's size").
 *   BUILT — seed docked at stage top, built world (tree / editor / schema /
 *     status), ticker chips. This is the static SSR render (reduced-motion
 *     final frame).
 *
 * Entrance (≤3.9s): header rise → step cards rise stagger 0.25 with chevron
 * DrawSVG 0.15s after each left card → plaques stamp 1.12→1 + «Никогда.»
 * underline DrawSVG → stage fades up, layer chips stagger x−8 → seed line
 * TYPES (SplitText chars opacity stagger ~0.013, fixed line box, zero
 * layout motion) with the caret alive.
 *
 * Build (≤3.2s one-shot): seed docks (scale 0.8 + translate to the stage-top
 * row, caret dies, console crossfades out) → file tree cascades x−8 stagger
 * 0.06 → editor snippet chars stagger (amount 0.8) → schema mini-diagram
 * DrawSVG + column names fade → two service chips ping 0.3s apart → tests
 * counter 0→12 textContent flipping to trust green → trace ticker awakens
 * (first chips slide in; the step-3 «всё» recording dot lights; «30 секунд»
 * flares ember once). Mobile plays the same beats on the micro-world, no
 * dock (the seed row IS the typing surface <lg).
 *
 * Idles — SETTLED: caret blink (steps), «30 секунд» chip breathe, dot grid
 * 4px drift on a 9s loop. BUILT: ticker appends one chip every ~4s
 * (translateX queue, ≤6 visible nodes, recycled pool), recording dots pulse.
 *
 * Vertical budget unchanged from the audited static skeleton (P2 header):
 * both stages share one layout — state flips are autoAlpha/transform only.
 * Color grammar §2.4: the customers.csv tag is AMBER, «⚠ персональные
 * данные» — no red on this slide.
 */
import type { ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import type { SlideStage } from "@/components/deck/deck-controller";
import { breathe } from "@/lib/motion/idle";
import { cn } from "@/lib/cn";

/** Trace-event vocabulary for the built idle (echoes step 3's categories). */
const TRACE_POOL = [
  "команда · pytest -k refunds",
  "промпт · «почему падает тест №7?»",
  "файл · schema.sql",
  "команда · git diff",
  "промпт · «объясни stripe.Refund»",
  "файл · routes.py",
  "тест · 12 ✓",
];
const TRACE_GAP = 8; // gap-2 on the ticker row
const TRACE_CAP = 6; // max visible chips (spec: cap 6 nodes, recycle)

export function Slide06Generator() {
  const { ref } = useDeckSlide({
    id: "06-generator",
    hasBuild: true,
    autoChainMs: 1500, // <lg: build auto-chains 1.5s after the entrance settles
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const vis = (el: Element) => el.getClientRects().length > 0;

      const docStyle = getComputedStyle(document.documentElement);
      const token = (name: string, fallback: string) =>
        docStyle.getPropertyValue(name).trim() || fallback;
      const TRUST = token("--color-trust", "#22c55e");
      const MUTE = token("--color-mute", "#a1a1aa");
      const EMBER = token("--color-ember", "#ff8a4c");

      /* ---- targets ----------------------------------------------------- */
      const header = q("[data-header]")[0];
      const steps = q("[data-step]");
      const chevrons = q("[data-chevron] path").filter(vis);
      const plaques = q("[data-plaque]");
      const underline = q("[data-plaque-underline]").filter(vis);
      const stage = q("[data-stage]")[0];
      const stagePre = q("[data-stage-pre]")[0];
      const layerChips = q("[data-layer-chip]");
      const dotgrid = q("[data-dotgrid]")[0];
      const seedDock = q("[data-seed]")[0];
      const consoleSeed = q("[data-seed-console]")[0];
      const lgMode = Boolean(stagePre && vis(stagePre));
      const worldEl = lgMode ? q("[data-world]")[0] : q("[data-world-micro]")[0];
      const treeRows = q("[data-tree-row]").filter(vis);
      const editorEl = q("[data-editor]")[0];
      const schemaStrokes = q("[data-schema-stroke]").filter(vis);
      const schemaTexts = lgMode ? q("[data-schema-text]") : [];
      const statusRow = q("[data-status]")[0];
      const services = q("[data-service]");
      const testsEl = q("[data-tests]")[0];
      const trustWrap = q("[data-trust-wrap]")[0];
      const trustChips = q("[data-trust-chip]");
      const traceRow = q("[data-trace-row]")[0];
      const traceChips = q('[data-chip="trace"]');
      const recDots = q("[data-rec-dot]");
      const chip30s = q("[data-chip-30s]").filter(vis);

      // Stale dynamic ticker chips from a previous create (resize rebuild):
      // they are not React-owned, so removing them here is safe.
      root.querySelectorAll("[data-chip-dynamic]").forEach((el) => el.remove());

      // Typing surface: the console line at lg, the dock row itself <lg
      // (mobile has no dock beat — the seed types in place).
      const typedHost = lgMode ? consoleSeed : seedDock;
      const typedText = typedHost?.querySelector("[data-seed-text]") ?? null;
      const caretEl = lgMode
        ? q("[data-console-caret]")[0]
        : seedDock?.querySelector("[data-seed-caret]") ?? null;
      const seedSplit = typedText
        ? new SplitText(typedText, { type: "chars" })
        : null;
      const seedChars = seedSplit?.chars ?? [];
      const editorSplit =
        lgMode && editorEl ? new SplitText(editorEl, { type: "chars" }) : null;
      const editorChars = editorSplit?.chars ?? [];

      /* ---- dock geometry (pristine, pre-dormant) ------------------------ */
      let dockDX = 0;
      let dockDY = 0;
      if (lgMode && consoleSeed && seedDock) {
        gsap.set(consoleSeed, { clearProps: "transform" });
        const from = consoleSeed.getBoundingClientRect();
        const to = seedDock.getBoundingClientRect();
        dockDX = to.left - from.left;
        dockDY = to.top - from.top;
      }

      const writeTests = (v: number) => {
        if (testsEl) testsEl.textContent = `tests: ${Math.round(v)} ✓`;
      };

      /** gsap.set that skips empty target lists (breakpoint-absent nodes) —
       *  keeps the console clean of "GSAP target not found" warnings. */
      const setIf = (targets: Element[], vars: gsap.TweenVars) => {
        if (targets.length) gsap.set(targets, vars);
      };

      // Closure stage for makeIdles branching (controller owns real status).
      let phase: "dormant" | "settled" | "built" = "dormant";

      /* ---- ticker queue (built idle) ------------------------------------ */
      let traceIdx = 0;
      const chipPool: HTMLElement[] = [];
      const makeChipEl = (): HTMLElement => {
        const el = document.createElement("span");
        el.className =
          (traceChips[0] as HTMLElement | undefined)?.className ??
          "shrink-0 whitespace-nowrap rounded border border-line px-2 py-0.5 font-mono text-[10px] text-mute";
        el.dataset.chipDynamic = "";
        return el;
      };
      const cycleChip = () => {
        if (!traceRow) return;
        const visKids = (Array.from(traceRow.children) as HTMLElement[]).filter(
          (el) => el.style.display !== "none",
        );
        let shift = 0;
        if (visKids.length >= TRACE_CAP) {
          const old = visKids[0];
          shift = old.offsetWidth + TRACE_GAP;
          if (old.dataset.chipDynamic !== undefined) {
            traceRow.removeChild(old);
            chipPool.push(old);
          } else {
            // React-owned static chip: hide, never remove (reconciliation).
            gsap.set(old, { display: "none" });
          }
        }
        const el = chipPool.pop() ?? makeChipEl();
        el.textContent = TRACE_POOL[traceIdx++ % TRACE_POOL.length];
        gsap.set(el, { autoAlpha: 0, x: 0, display: "" });
        traceRow.appendChild(el);
        const rest = (Array.from(traceRow.children) as HTMLElement[]).filter(
          (k) => k.style.display !== "none",
        );
        if (shift > 0) {
          // translateX queue: compensate the removal instantly, ease back.
          gsap.set(rest, { x: shift });
          gsap.to(rest, { x: 0, duration: 0.45, ease: "power2.out" });
        }
        gsap.to(el, { autoAlpha: 1, duration: 0.35, ease: "power1.out" });
      };

      /* ---- state helpers ------------------------------------------------ */
      const setShellVisible = () => {
        gsap.set(header, { autoAlpha: 1, y: 0 });
        gsap.set(steps, { autoAlpha: 1, y: 0 });
        setIf(chevrons, { drawSVG: "100%" });
        gsap.set(plaques, { autoAlpha: 1, scale: 1 });
        setIf(underline, { drawSVG: "100%" });
        gsap.set(stage, { autoAlpha: 1, y: 0 });
      };

      /** Built interior hidden; console/dot-grid visible; seed typed. */
      const setPreInterior = () => {
        if (lgMode) {
          gsap.set(stagePre, { autoAlpha: 1 });
          gsap.set(layerChips, { autoAlpha: 1, x: 0 });
          gsap.set(dotgrid, { autoAlpha: 1, x: 0, y: 0 });
          gsap.set(seedDock, { autoAlpha: 0 });
          gsap.set(consoleSeed, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            clearProps: "willChange",
          });
        } else {
          gsap.set(seedDock, { autoAlpha: 1 });
        }
        setIf(seedChars, { opacity: 1 });
        gsap.set(caretEl, { autoAlpha: 1, opacity: 1 });
        gsap.set([worldEl, statusRow, trustWrap].filter(Boolean), {
          autoAlpha: 0,
        });
        gsap.set(treeRows, { autoAlpha: 0, x: -8 });
        setIf(editorChars, { opacity: 0 });
        setIf(schemaStrokes, { drawSVG: "0%" });
        setIf(schemaTexts, { autoAlpha: 0 });
        gsap.set(services, { autoAlpha: 0, scale: 0.9 });
        gsap.set(testsEl, { color: MUTE });
        writeTests(0);
        gsap.set(trustChips, { autoAlpha: 0, y: 4 });
        gsap.set(traceChips, { autoAlpha: 0, x: 16 });
        gsap.set(recDots, { autoAlpha: 0 });
        gsap.set(chip30s, { clearProps: "color", opacity: 1 });
      };

      /** The static SSR frame: docked seed + built world + ticker chips. */
      const setBuiltInterior = () => {
        if (lgMode) {
          gsap.set(stagePre, { autoAlpha: 0 });
          gsap.set(consoleSeed, { autoAlpha: 0, clearProps: "willChange" });
        }
        gsap.set(seedDock, { autoAlpha: 1 });
        setIf(seedChars, { opacity: 1 });
        gsap.set(caretEl, { autoAlpha: 0 });
        gsap.set([worldEl, statusRow, trustWrap].filter(Boolean), {
          autoAlpha: 1,
        });
        gsap.set(treeRows, { autoAlpha: 1, x: 0 });
        setIf(editorChars, { opacity: 1 });
        setIf(schemaStrokes, { drawSVG: "100%" });
        setIf(schemaTexts, { autoAlpha: 1 });
        gsap.set(services, { autoAlpha: 1, scale: 1 });
        gsap.set(testsEl, { color: TRUST });
        writeTests(12);
        gsap.set(trustChips, { autoAlpha: 1, y: 0 });
        if (traceRow) {
          gsap.set(Array.from(traceRow.children), { autoAlpha: 1, x: 0 });
        }
        gsap.set(recDots, { autoAlpha: 1, opacity: 1 });
        gsap.set(chip30s, { clearProps: "color", opacity: 1 });
      };

      const setFrozen = (stageName: SlideStage) => {
        // Kill ONLY the detached ticker-queue tweens (cycleChip's slide/fade)
        // — a broad killTweensOf would rip beats out of the still-paused
        // build timeline when freezing a settled-but-unbuilt slide.
        if (traceRow) gsap.killTweensOf(Array.from(traceRow.children));
        setShellVisible();
        if (stageName === "built") {
          setBuiltInterior();
          phase = "built";
        } else {
          setPreInterior();
          phase = "settled";
        }
      };

      const setDormant = () => {
        gsap.set(header, { autoAlpha: 0, y: 24 });
        gsap.set(steps, { autoAlpha: 0, y: 24 });
        setIf(chevrons, { drawSVG: "0%" });
        gsap.set(plaques, { autoAlpha: 0, scale: 1.12 });
        setIf(underline, { drawSVG: "0%" });
        gsap.set(stage, { autoAlpha: 0, y: 16 });
        setPreInterior();
        // Pre-typing console: chips queued, seed un-typed, caret off.
        gsap.set(layerChips, { autoAlpha: 0, x: -8 });
        setIf(seedChars, { opacity: 0 });
        gsap.set(caretEl, { autoAlpha: 0 });
        phase = "dormant";
      };

      /* ---- entrance (settles ≤3.9s) -------------------------------------- */
      const entrance = gsap.timeline({ paused: true });
      entrance.fromTo(
        header,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" },
        0,
      );
      steps.forEach((card, i) => {
        entrance.fromTo(
          card,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
          0.2 + i * 0.25,
        );
      });
      // Chevrons draw 0.15s after their left card starts landing.
      chevrons.forEach((chev, i) => {
        entrance.fromTo(
          chev,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.35, ease: "power2.out" },
          0.35 + i * 0.25,
        );
      });
      // Plaques stamp + «Никогда.» flame underline.
      entrance.fromTo(
        plaques,
        { autoAlpha: 0, scale: 1.12 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.4)",
          stagger: 0.12,
        },
        1.6,
      );
      entrance.fromTo(
        underline,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.4, ease: "power2.out" },
        1.85,
      );
      // Generator stage + console chips.
      entrance.fromTo(
        stage,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" },
        2.0,
      );
      if (lgMode) {
        entrance.fromTo(
          layerChips,
          { autoAlpha: 0, x: -8 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.06,
          },
          2.15,
        );
      }
      // The seed line TYPES (§2.3 — this slide owns the caret).
      entrance.set(caretEl, { autoAlpha: 1 }, 2.35);
      if (seedChars.length) {
        entrance.to(
          seedChars,
          { opacity: 1, duration: 0.05, ease: "none", stagger: 0.013 },
          2.4,
        );
      }
      entrance.call(() => {
        phase = "settled";
      });

      /* ---- build (one-shot ≤3.2s) ----------------------------------------- */
      const build = gsap.timeline({ paused: true });
      if (lgMode && consoleSeed) {
        // 1 — the seed docks; caret dies; console fades under it.
        build.set(consoleSeed, { willChange: "transform" }, 0);
        build.set(caretEl, { autoAlpha: 0 }, 0);
        build.to(
          consoleSeed,
          {
            x: dockDX,
            y: dockDY,
            scale: 0.8,
            transformOrigin: "left top",
            duration: 0.5,
            ease: "power3.inOut",
          },
          0,
        );
        build.to(
          [...layerChips, dotgrid].filter(Boolean),
          { autoAlpha: 0, duration: 0.3, ease: "power1.in" },
          0.05,
        );
        build.fromTo(
          seedDock,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25, ease: "power1.inOut" },
          0.38,
        );
        build.to(consoleSeed, { autoAlpha: 0, duration: 0.18 }, 0.42);
        build.set(stagePre, { autoAlpha: 0 }, 0.65);
        build.set(consoleSeed, { clearProps: "willChange" }, 0.65);
      } else {
        build.set(caretEl, { autoAlpha: 0 }, 0.2);
      }
      // 2 — the world materializes: tree cascade + editor type-in.
      build.set(testsEl, { color: MUTE }, 0);
      build.call(() => writeTests(0), [], 0);
      build.fromTo(
        worldEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
        0.2,
      );
      build.fromTo(
        treeRows,
        { autoAlpha: 0, x: -8 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.06,
        },
        0.3,
      );
      build.fromTo(
        statusRow,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
        0.5,
      );
      if (editorChars.length) {
        build.to(
          editorChars,
          { opacity: 1, duration: 0.05, ease: "none", stagger: { amount: 0.8 } },
          0.6,
        );
      }
      // 3 — schema.sql mini-diagram draws itself.
      if (schemaStrokes.length) {
        build.fromTo(
          schemaStrokes,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" },
          0.9,
        );
        build.fromTo(
          schemaTexts,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "power1.out", stagger: 0.08 },
          1.3,
        );
      }
      // Mobile trust chips (the step-2 environment list as product UI).
      if (trustWrap && vis(trustWrap)) {
        build.fromTo(
          trustWrap,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25 },
          1.5,
        );
        build.fromTo(
          trustChips,
          { autoAlpha: 0, y: 4 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 },
          1.6,
        );
      }
      // 4 — service chips ping; tests roll 0→12 and flip to trust green.
      services.forEach((s, i) => {
        build.fromTo(
          s,
          { autoAlpha: 0, scale: 0.9 },
          { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
          1.6 + i * 0.3,
        );
      });
      const testsProxy = { v: 0 };
      build.to(
        testsProxy,
        {
          v: 12,
          duration: 0.7,
          ease: "power1.inOut",
          onUpdate: () => writeTests(testsProxy.v),
        },
        1.9,
      );
      build.to(testsEl, { color: TRUST, duration: 0.3 }, 2.45);
      // 5 — the trace ticker awakens; «всё» records; «30 секунд» flares.
      build.fromTo(
        traceChips,
        { autoAlpha: 0, x: 16 },
        { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.15 },
        2.4,
      );
      build.fromTo(
        recDots,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25 },
        2.4,
      );
      if (chip30s.length) {
        build.to(chip30s, { color: EMBER, duration: 0.25 }, 2.4);
        build.set(chip30s, { clearProps: "color" }, 3.0);
      }
      build.call(() => {
        phase = "built";
      });

      /* ---- idles ------------------------------------------------------------ */
      const makeIdles = (): gsap.core.Animation[] => {
        if (phase === "built") {
          const idles: gsap.core.Animation[] = [];
          // Recording dots pulse (step-3 «всё» + the ticker rec dot).
          if (recDots.length) idles.push(breathe(recDots, 0.4, 1, 1.2));
          // Ticker appends one chip every ~4s (translateX queue, cap 6).
          const tick = gsap.timeline({ repeat: -1, repeatDelay: 3.8 }); // deck-contract: idle
          tick.call(cycleChip, [], 0);
          tick.to({}, { duration: 0.2 }, 0);
          idles.push(tick);
          return idles;
        }
        // SETTLED: blinking caret + breathing «30 секунд» + drifting dot grid.
        const idles: gsap.core.Animation[] = [];
        if (caretEl) {
          idles.push(
            gsap.to(caretEl, {
              opacity: 0,
              duration: 0.45,
              ease: "steps(1)",
              repeat: -1,
              yoyo: true,
            }),
          );
        }
        if (chip30s.length) idles.push(breathe(chip30s, 0.7, 1, 3));
        if (lgMode && dotgrid) {
          idles.push(
            gsap.to(dotgrid, {
              x: 4,
              y: -4,
              duration: 4.5,
              ease: "sine.inOut",
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
      id="06-generator"
      hasBuild
      title="Как это работает: три шага, один проход, без интеграций"
      srSummary="Тимлид настраивается один раз — четыре слоя контекста и одна-три строки про задачу позиции; никакой выгрузки базы кода. Кандидат через 30 секунд попадает в веб-IDE: синтетическая база кода, живая БД, сервисы-заглушки, тесты, ИИ-напарник — 20–40 минут реальной работы. Платформа записывает всё: каждый промпт, файл, команду, тест."
      className="py-8 lg:py-10"
    >
      <h3
        data-header
        className="font-display text-[length:var(--text-h1)] text-paper"
      >
        Три шага. Один проход. Без интеграций.
      </h3>

      {/* ---------------------------------------------------------------
       * Step rail — 3 cards + 2 SVG chevrons (lg). Mobile: 3 stacked rows
       * (number + title + boldest chip; plaques as small lines, §4.06 cut).
       * ------------------------------------------------------------- */}
      <div className="mt-3 grid gap-2 lg:mt-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-3">
        <StepCard
          n={1}
          title="Тимлид"
          keyChip="один раз"
          tagline={
            <>
              4 слоя · <b className="font-semibold text-paper">один раз</b>
            </>
          }
          detail={
            <>
              стек → «как мы работаем» → бизнес-контекст →{" "}
              <b className="font-semibold text-paper">1–3 строки</b> про задачу
              позиции
            </>
          }
          plaque={
            <>
              Никакой выгрузки базы кода.{" "}
              <span className="relative inline-block">
                Никогда.
                {/* Flame underline — DrawSVG at the plaque stamp beat. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 4"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-[3px] w-full"
                >
                  <line
                    data-plaque-underline
                    x1="1"
                    y1="2"
                    x2="99"
                    y2="2"
                    stroke="var(--color-flame)"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </>
          }
        />
        <Chevron />
        <StepCard
          n={2}
          title="Кандидат"
          keyChip="30 секунд"
          tagline={
            <>
              ссылка →{" "}
              <b data-chip-30s className="font-semibold text-paper">
                30 секунд
              </b>{" "}
              → веб-IDE
            </>
          }
          detail={
            <>
              синтетическая база кода · живая БД · сервисы-заглушки · тесты ·
              ИИ-напарник
            </>
          }
          plaque="20–40 минут реальной работы."
        />
        <Chevron />
        <StepCard
          n={3}
          title="Платформа"
          keyChip="всё"
          recDot
          tagline={
            <>
              записывает <b className="font-semibold text-paper">всё</b>
            </>
          }
          detail={<>каждый промпт · файл · команду · тест</>}
        />
      </div>

      {/* ---------------------------------------------------------------
       * Generator stage. The interior carries BOTH visual stages:
       * in-flow = the BUILT world (SSR/static frame), absolutely stacked
       * on top = the PRE-BUILD seed console + dot-grid viewport. State
       * flips are autoAlpha-only — the card never changes size.
       * ------------------------------------------------------------- */}
      <section
        data-stage
        aria-label="Сгенерированная среда кейса"
        className="mt-3 overflow-hidden rounded-2xl border border-line bg-fog lg:mt-6"
      >
        <div data-stage-inner className="relative">
          {/* Seed line — docked (built) / typing surface (<lg). */}
          <p
            data-seed
            className="border-b border-line bg-ink/30 px-3 py-2 font-mono text-[11px] leading-snug text-mute lg:px-4 lg:py-2.5 lg:text-xs"
          >
            <span aria-hidden="true" className="mr-1.5 text-flame">
              ›
            </span>
            <span data-seed-text>
              Реализовать batch-обработчик возвратов поверх stripe API, с
              корректным обращением к таблице{" "}
              <code className="text-paper">customers</code>. Покрыть тестами.
            </span>
            <span
              aria-hidden="true"
              data-seed-caret
              className="ml-1 inline-block h-3 w-[2px] translate-y-0.5 bg-flame lg:hidden"
            />
          </p>

          {/* Built world — full IDE anatomy at lg+ (tree / editor / schema). */}
          <div
            data-world
            className="hidden lg:grid lg:grid-cols-[190px_minmax(0,1fr)_230px]"
          >
            {/* File tree — candidate-ide path vocabulary. */}
            <aside className="border-r border-line bg-ink/20 p-3 font-mono text-[11px] text-mute">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-dim">
                payments
              </p>
              <ul className="space-y-1">
                <li data-tree-row>api/</li>
                <li data-tree-row className="ml-3">
                  routes.py
                </li>
                <li data-tree-row data-highlight className="ml-3 text-paper">
                  process_refund.py
                </li>
                <li data-tree-row>db/</li>
                <li data-tree-row className="ml-3">
                  schema.sql
                </li>
                <li data-tree-row className="ml-3 text-paper">
                  customers.csv
                </li>
                <li
                  data-tree-row
                  data-pii-tag
                  className="ml-3 text-[10px] text-amber-400"
                >
                  ⚠ персональные данные
                </li>
                <li data-tree-row className="mt-2">
                  README.md
                </li>
              </ul>
            </aside>

            {/* Editor snippet — product chrome, code allowed (§0). */}
            <div className="min-w-0 border-r border-line bg-ink/10 p-4 font-mono text-[11.5px] leading-relaxed text-mute">
              <pre className="overflow-hidden" data-editor>
                <code>
                  <span className="block">
                    <span className="text-sterile">def</span>{" "}
                    <span className="text-glass">process_refund_batch</span>
                    (refunds):
                  </span>
                  <span className="block pl-4">
                    rows = db.fetch(
                    <span className="text-ember">&quot;customers&quot;</span>,
                    refunds.ids)
                  </span>
                  <span className="block pl-4">
                    <span className="text-sterile">return</span>{" "}
                    stripe.Refund.create_batch(rows)
                  </span>
                  <span className="mt-2 block text-dim"># tests/test_refunds.py · 12 passed</span>
                </code>
              </pre>
            </div>

            {/* schema.sql mini-diagram. */}
            <div className="p-3">
              <svg
                data-schema
                viewBox="0 0 200 130"
                className="h-auto w-full"
                aria-hidden="true"
              >
                <rect
                  data-schema-stroke
                  x="10"
                  y="8"
                  width="180"
                  height="114"
                  rx="8"
                  fill="none"
                  stroke="var(--color-line-strong)"
                  strokeWidth="1.5"
                />
                <line
                  data-schema-stroke
                  x1="10"
                  y1="34"
                  x2="190"
                  y2="34"
                  stroke="var(--color-line-strong)"
                  strokeWidth="1.5"
                />
                <text
                  data-schema-text
                  x="20"
                  y="26"
                  className="fill-paper"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  customers
                </text>
                {["name · text", "email · text", "charge_id · text", "amount · int"].map(
                  (row, i) => (
                    <text
                      data-schema-text
                      key={row}
                      x="20"
                      y={54 + i * 18}
                      className="fill-mute"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                    >
                      {row}
                    </text>
                  ),
                )}
              </svg>
            </div>
          </div>

          {/* Mobile micro-world (Director's cut): a real generated surface —
              3-row tree, just smaller; never a checklist. */}
          <div data-world-micro className="lg:hidden">
            <ul className="space-y-1 px-3 py-2 font-mono text-[11px] text-mute">
              <li data-tree-row data-highlight className="text-paper">
                payments/api/process_refund.py
              </li>
              <li data-tree-row>payments/db/schema.sql</li>
              <li data-tree-row>
                payments/db/customers.csv{" "}
                <span data-pii-tag className="text-[10px] text-amber-400">
                  ⚠ персональные данные
                </span>
              </li>
            </ul>
          </div>

          {/* Status bar — trust-green test counter + mock-service chips. */}
          <div
            data-status
            className="flex items-center gap-3 border-t border-line bg-ink/30 px-3 py-2 font-mono text-[11px] text-mute lg:gap-4 lg:px-4"
          >
            <span className="hidden lg:inline">~/payments</span>
            <span data-service>stripe-mock ✓</span>
            <span data-service>живая БД ✓</span>
            <span data-tests className="ml-auto text-trust">
              tests: 12 ✓
            </span>
          </div>

          {/* Mobile trust chips — the step-2 environment list, kept as
              product UI (verbatim copy lives in the desktop card too). */}
          <div
            data-trust-wrap
            className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2 lg:hidden"
          >
            {[
              "синтетическая база кода",
              "живая БД",
              "сервисы-заглушки",
              "тесты",
              "ИИ-напарник",
            ].map((chip) => (
              <span
                key={chip}
                data-trust-chip
                className="rounded-full border border-line px-2 py-0.5 text-[10px] text-mute"
              >
                <span className="text-trust">✓</span> {chip}
              </span>
            ))}
          </div>

          {/* PRE-BUILD overlay — seed console (30%) + dot-grid viewport.
              Decorative duplicate of the seed copy → aria-hidden. */}
          <div
            aria-hidden="true"
            data-stage-pre
            // opacity-0 = the SSR/static frame is the BUILT world; the
            // pre-build console only exists once GSAP sets it visible.
            className="pointer-events-none absolute inset-0 hidden opacity-0 lg:grid lg:grid-cols-[minmax(0,32%)_1fr]"
          >
            <div className="flex flex-col gap-1.5 border-r border-line bg-ink/20 p-4">
              {[
                "стек",
                "«как мы работаем»",
                "бизнес-контекст",
                "задача позиции",
              ].map((chip) => (
                <span
                  key={chip}
                  data-layer-chip
                  className="self-start rounded border border-line px-2 py-0.5 text-[10px] text-dim"
                >
                  {chip}
                </span>
              ))}
              <p
                data-seed-console
                className="mt-2 font-mono text-[11px] leading-snug text-mute lg:text-xs"
              >
                <span className="mr-1.5 text-flame">›</span>
                <span data-seed-text>
                  Реализовать batch-обработчик возвратов поверх stripe API, с
                  корректным обращением к таблице{" "}
                  <code className="text-paper">customers</code>. Покрыть
                  тестами.
                </span>
                <span
                  data-console-caret
                  className="ml-1 inline-block h-3 w-[2px] translate-y-0.5 bg-flame"
                />
              </p>
            </div>
            {/* World viewport pre-build: a faint dot grid, drifting (idle). */}
            <div className="relative overflow-hidden">
              <div
                data-dotgrid
                className="absolute -inset-3 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--color-line-strong) 1px, transparent 1.4px)",
                  backgroundSize: "18px 18px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Trace ticker — 3 static mono chips (frozen mid-tick); the built
            idle appends into [data-trace-row] (translateX queue, cap 6). */}
        <div
          data-trace
          className="flex items-center gap-2 overflow-hidden border-t border-line bg-ink/40 px-3 py-1.5"
        >
          <span
            aria-hidden="true"
            data-rec-dot
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-flame"
          />
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-dim">
            запись
          </span>
          <div
            data-trace-row
            className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
          >
            {[
              "промпт · «как переписать на батч?»",
              "файл · process_refund.py",
              "тест · 12 ✓",
            ].map((chip) => (
              <span
                key={chip}
                data-chip="trace"
                className="shrink-0 whitespace-nowrap rounded border border-line px-2 py-0.5 font-mono text-[10px] text-mute"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Slide>
  );
}

/* ----------------------------------------------------------------------- */

function StepCard({
  n,
  title,
  keyChip,
  tagline,
  detail,
  plaque,
  recDot,
}: {
  n: number;
  title: string;
  keyChip: string;
  tagline: ReactNode;
  detail: ReactNode;
  plaque?: ReactNode;
  recDot?: boolean;
}) {
  return (
    <article
      data-step={n}
      className="flex flex-col rounded-2xl border border-line bg-fog px-3 py-2 lg:p-5"
    >
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-base text-flame lg:text-lg">
          0{n}
        </span>
        <h4 className="font-display text-base text-paper lg:text-lg">
          {title}
        </h4>
        {recDot ? (
          <span
            aria-hidden="true"
            data-rec-dot
            className="h-1.5 w-1.5 self-center rounded-full bg-flame"
          />
        ) : null}
        {/* Mobile: boldest chip only (§4.06 mobile rail). */}
        <span
          data-chip-30s={n === 2 ? "" : undefined}
          className="ml-auto rounded-full border border-line-strong px-2 py-0.5 text-[10px] font-semibold text-paper lg:hidden"
        >
          {keyChip}
        </span>
      </div>
      <p className="mt-1.5 hidden text-meta leading-snug text-mute lg:block">
        {tagline}
      </p>
      <p className="mt-1 hidden text-[12px] leading-snug text-dim lg:block">
        {detail}
      </p>
      {plaque ? (
        <p
          data-plaque
          className={cn(
            "mt-1.5 text-[11px] leading-snug text-flame",
            "lg:mt-auto lg:pt-3",
          )}
        >
          <span className="lg:rounded-lg lg:border lg:border-line-strong lg:px-2.5 lg:py-1">
            {plaque}
          </span>
        </p>
      ) : null}
    </article>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      data-chevron
      viewBox="0 0 40 24"
      className="hidden w-10 self-center text-line-strong lg:block"
    >
      <path
        d="M2 12h28m0 0-8-8m8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
