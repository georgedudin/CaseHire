"use client";

/**
 * Slide 13 — Дорожная карта + финал · «Два испытуемых, одна матрица →
 * эпитафия» (landing_v2.md §4 slide 13 + Director's cut; copy verbatim
 * from ru_pitch_v2.md слайд 13).
 *
 * P3 MOTION. Three states, driven entirely by gsap — the JSX renders
 * NEUTRAL (Act I visible, refrain hidden via `invisible opacity-0`); the
 * veil/controller owns first paint, so SSR never shows a wrong frame:
 *   DORMANT — everything hidden/zeroed (pre-entrance).
 *   SETTLED — Act I final (matrix locked at 74 · 81), refrain hidden.
 *   BUILT   — Act I dimmed 0.05 / 0.97 / y −12, refrain epitaph over it,
 *             ember glow at 0.12 (the frozen state; reduced motion gets
 *             exactly this frame via the hook's setFrozen("built")).
 *
 * Entrance (≤4.0s, essentials lock at ~3.6):
 *   0.0  headline SplitText words rise (expo.out); split reverted on settle
 *   0.3  timeline spine DrawSVG l→r 1.2s power3.inOut; nodes pop scale 0→1
 *        back.out(1.6) as the stroke passes (pass times solved for the
 *        inOut-quart curve: 0.30/0.78/0.92/1.05), labels fade stagger 0.12
 *   1.2  split containers rise y:32→0 expo.out
 *   1.4  dual code reveal — lines flip opacity, a caret span hops rows;
 *        BOTH editors in parallel, human deliberately slower (0.38 vs
 *        0.32 s/line, cap 6 lines — the tail belongs to the idle loop)
 *   1.5  «+12 мес» flame ring DrawSVG + one 1→1.12→1 pulse (mobile: card)
 *   2.0→3.6  DualProcessMatrix fills: ember bars scaleX 0→score stagger
 *        0.14 expo.out, glass ticks land with back.out overshoot, score
 *        chips count up per axis, averages count to 74 / 81
 *   3.6  VERDICT PULSE — both average chips flare once, simultaneously
 *        (scale 1→1.12→1 + a 0.14s opacity flick): the only moment both
 *        columns move as one (Director's cut crest).
 *
 * Build (the epitaph, one-shot; compressed — last line lands ~3.1s):
 *   0.0  Act I → opacity 0.05, scale 0.97, y −12 (0.6s power2.in; the
 *        controller killed the idles on build start)
 *   0.3  «Результат умер.» SplitText chars rise (0.45s, stagger 0.02)
 *   1.0  line 2, same treatment
 *   1.9  «Кем бы он ни был.» in flame — 1.2s slow power1.out + ember glow
 *        div fading to 0.12
 *   3.3  glow breathes 2 cycles (sine 0.12↔0.075) and stops — stillness.
 *   Post-epitaph gestures no-op: the controller holds snap on the last
 *   slide and makeIdles() returns [] once built.
 *
 * Idles — SETTLED stage only: both carets blink (steps(1) opacity); every
 * ~4s one more code line reveals per editor (looping the 3-line tail
 * buffer); «+12 мес» ring breathes opacity 0.8↔0.5 at 5s — the sanctioned
 * callback to slide 4's ring (§2.5).
 *
 * Vertical budgets (zero internal scroll):
 *   375×620  — py-6 → 572 avail (Act I): headline ~64 + timeline rail
 *              ~48 + «+12 мес» card ~56 + chips ~52 + DualProcessMatrix
 *              (5 axes) ~220 + gaps 44 ≈ 484 ✓; refrain overlay ~330 ✓
 *   1366×768 — py-8 → 704 avail: headline ~64 + timeline ~110 + split
 *              ~350 (chips 24 + IDEs capped 320) + gaps 48 ≈ 572 ✓;
 *              refrain ~360 inside the overlay ✓
 *   1920×1080 — split gets air (max-w-7xl is the .slide-content cap).
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { CandidateIde } from "@/components/mockups/candidate-ide";
import {
  DualProcessMatrix,
  DEFAULT_DUAL_AXES,
  type DualProcessAxis,
} from "@/components/mockups/dual-process-matrix";
import { addCountUp } from "@/lib/motion/count-up";
import { breathe } from "@/lib/motion/idle";
import { cn } from "@/lib/cn";

type Milestone = {
  label: string;
  desc: string;
  flame?: boolean;
};

const MILESTONES: Milestone[] = [
  { label: "Сейчас", desc: "один шаблон · 10 пилотов · найм джунов" },
  {
    label: "+6 мес",
    desc: "больше ролей и отраслей · генерация под описание архитектуры",
  },
  {
    label: "+12 мес",
    desc: "оценка ИИ-агентов на той же инфраструктуре",
    flame: true,
  },
  { label: "Долгосрок", desc: "субстрат оценки интеллекта на работе" },
];

/** Entrance code-reveal cap; lines beyond it are the idle loop's buffer. */
const LINE_CAP = 6;
/** Spine pass times for the 4 nodes (power3.inOut over 0.3→1.5s draw). */
const NODE_POP_AT = [0.3, 0.78, 0.92, 1.05];

const avgOf = (key: "human" | "agent") =>
  Math.round(
    DEFAULT_DUAL_AXES.reduce((sum, a) => sum + a[key], 0) /
      DEFAULT_DUAL_AXES.length,
  );
const AVG_HUMAN = avgOf("human"); // 74
const AVG_AGENT = avgOf("agent"); // 81

function SessionChip({
  tone,
  children,
}: {
  tone: "glass" | "ember";
  children: string;
}) {
  return (
    <p
      data-session-chip={tone}
      className={cn(
        "inline-block self-start rounded-full border px-2.5 py-1 font-mono text-[11px] lg:text-[12px]",
        tone === "glass"
          ? "border-glass/40 bg-glass/10 text-glass"
          : "border-ember/40 bg-ember/10 text-ember",
      )}
    >
      {children}
    </p>
  );
}

export function Slide13Finale() {
  const { ref } = useDeckSlide({
    id: "13-finale",
    hasBuild: true,
    // No timer anywhere (amended 2026-06-12): the epitaph waits for a
    // gesture — key/wheel at lg+, tap on <lg (controller's handleTap).
    autoChainMs: 0,
    create: ({ root, reduced }) => {
      const lg = window.matchMedia("(min-width: 1024px)").matches;
      const all = <T extends Element = HTMLElement>(sel: string) =>
        Array.from(root.querySelectorAll<T>(sel));
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);

      /* ---------- element registry ---------- */
      const act1 = one("[data-act1]");
      const headline = one("[data-headline]");
      const spine = root.querySelector<SVGLineElement>("[data-spine] line");
      const nodes = all("[data-node]");
      const nodeLabels = all("[data-node] p");
      const ring = root.querySelector<SVGCircleElement>("[data-node-ring]");
      const ringSvg = one("[data-node-ring-svg]");
      const mobCard = one("[data-mob-card]");
      const rises = all("[data-rise]");
      const refrain = one("[data-refrain]");
      const glow = one("[data-refrain-glow]");
      const refrainLines = all("[data-refrain-line]");

      const agentBars = all("[data-dual-agent]");
      const humanTicks = all("[data-dual-human]");
      const humanScores = all("[data-dual-score-human]");
      const agentScores = all("[data-dual-score-agent]");
      const avgHumanEls = all("[data-dual-average-human]");
      const avgAgentEls = all("[data-dual-average-agent]");
      const avgChips = [...avgHumanEls, ...avgAgentEls];

      const axisByLabel = new Map(
        DEFAULT_DUAL_AXES.map((a, i) => [a.label, { a, i }]),
      );
      const eachAxis = (
        els: HTMLElement[],
        fn: (el: HTMLElement, ax: DualProcessAxis, i: number) => void,
      ) => {
        for (const el of els) {
          const hit = axisByLabel.get(el.getAttribute("data-axis") ?? "");
          if (hit) fn(el, hit.a, hit.i);
        }
      };

      // Inline <span> chips need a box to scale (one-time, ctx-reverted).
      gsap.set(avgChips, { display: "inline-block", transformOrigin: "50% 50%" });

      /* ---------- SplitText (skipped under reduced motion) ---------- */
      // Self-heal guard: revert a previous split if a rebuild ever races
      // the ctx revert (double-splitting nests spans and breaks metrics).
      type Splittable = HTMLElement & { _chSplit?: SplitText };
      const split = (el: HTMLElement, type: "words" | "chars" | "words, chars") => {
        const rec = el as Splittable;
        rec._chSplit?.revert();
        const s = new SplitText(el, { type });
        rec._chSplit = s;
        return s;
      };
      let headlineSplit: SplitText | null =
        !reduced && headline ? split(headline, "words") : null;
      // Refrain lines char-rise, but split as "words, chars" — the word
      // wrappers keep glyphs from breaking mid-word and keep the comma
      // («единственное,») attached, so the animating split wraps identically
      // to the reverted native text. Bare "chars" let the browser break
      // between any glyphs (orphaned comma, ragged wrap) and then snap on
      // revert@3.2 — the visible "jump".
      let lineSplits: SplitText[] = reduced
        ? []
        : refrainLines.slice(0, 2).map((l) => split(l, "words, chars"));
      const revertHeadlineSplit = () => {
        headlineSplit?.revert();
        headlineSplit = null;
      };
      const revertLineSplits = () => {
        for (const s of lineSplits) s.revert();
        lineSplits = [];
      };

      /* ---------- editors: code lines + caret hop targets ---------- */
      type Editor = {
        caret: HTMLElement;
        lines: HTMLElement[];
        pos: { x: number; y: number }[];
        step: number; // s/line — human deliberately slower than the agent
      };
      const editors: Editor[] = [];
      if (lg && !reduced) {
        for (const [tone, step] of [
          ["human", 0.38],
          ["agent", 0.32],
        ] as const) {
          const caret = one(`[data-caret="${tone}"]`);
          const wrap = caret?.parentElement;
          if (!caret || !wrap) continue;
          // CodeLine rows only (the mobile fold-ellipsis row is display:none
          // at lg and the sm:contents wrapper generates no box).
          const lines = Array.from(
            wrap.querySelectorAll<HTMLElement>("pre code div.whitespace-pre"),
          ).filter((el) => el.offsetParent !== null);
          const wrapRect = wrap.getBoundingClientRect();
          const pos = lines.map((line) => {
            const text = (line.lastElementChild ?? line).getBoundingClientRect();
            return {
              // Long lines clip behind the editor's overflow — keep the
              // caret inside the panel instead of floating past its border.
              x: Math.min(text.right - wrapRect.left + 3, wrapRect.width - 14),
              y: text.top - wrapRect.top + Math.max(0, (text.height - 14) / 2),
            };
          });
          editors.push({ caret, lines, pos, step });
        }
      }

      /* ---------- state setters ---------- */
      // makeIdles branches on this: BUILT returns [] (stillness is the point).
      let stage: "settled" | "built" = "settled";

      const setDormant = () => {
        gsap.set(act1, { opacity: 1, scale: 1, y: 0 });
        if (headlineSplit) gsap.set(headlineSplit.words, { y: 24, autoAlpha: 0 });
        if (spine) gsap.set(spine, { drawSVG: "0%" });
        gsap.set(all("[data-node-dot]"), { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(nodeLabels, { autoAlpha: 0, y: 8 });
        if (ring) gsap.set(ring, { drawSVG: "0%" });
        if (ringSvg)
          gsap.set(ringSvg, { scale: 1, opacity: 0.8, transformOrigin: "50% 50%" });
        if (mobCard) gsap.set(mobCard, { autoAlpha: 0, y: 12 });
        gsap.set(rises, { autoAlpha: 0, y: 32 });
        for (const ed of editors) {
          gsap.set(ed.lines, { autoAlpha: 0 });
          gsap.set(ed.caret, { autoAlpha: 0 });
        }
        gsap.set(agentBars, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(humanTicks, { autoAlpha: 0, x: -10 });
        for (const el of [...humanScores, ...agentScores, ...avgChips])
          el.textContent = "0";
        if (refrain) gsap.set(refrain, { autoAlpha: 0 });
        if (glow) gsap.set(glow, { opacity: 0 });
      };

      const setFrozen = (s: "settled" | "built") => {
        stage = s;
        // Splits are entrance-/build-only; frozen frames use whole elements.
        // (Reverting line splits here is safe: "settled" only happens after
        // the entrance, and "built" means the build can never play again.)
        revertHeadlineSplit();
        if (s === "built") revertLineSplits();
        gsap.set(
          act1,
          s === "built"
            ? { opacity: 0.05, scale: 0.97, y: -12 }
            : { opacity: 1, scale: 1, y: 0 },
        );
        if (spine) gsap.set(spine, { drawSVG: "100%" });
        gsap.set(all("[data-node-dot]"), { scale: 1 });
        gsap.set(nodeLabels, { autoAlpha: 1, y: 0 });
        if (ring) gsap.set(ring, { drawSVG: "100%" });
        if (ringSvg) gsap.set(ringSvg, { scale: 1, opacity: 0.8 });
        if (mobCard) gsap.set(mobCard, { autoAlpha: 1, y: 0 });
        gsap.set(rises, { autoAlpha: 1, y: 0 });
        for (const ed of editors) {
          gsap.set(ed.lines.slice(0, LINE_CAP), { autoAlpha: 1 });
          gsap.set(ed.lines.slice(LINE_CAP), { autoAlpha: 0 });
          const p = ed.pos[Math.min(LINE_CAP, ed.lines.length) - 1];
          if (p)
            gsap.set(ed.caret, {
              x: p.x,
              y: p.y,
              autoAlpha: s === "built" ? 0 : 1,
            });
        }
        eachAxis(agentBars, (el, ax) =>
          gsap.set(el, { scaleX: ax.agent / 100, transformOrigin: "left center" }),
        );
        gsap.set(humanTicks, { autoAlpha: 1, x: 0 });
        eachAxis(humanScores, (el, ax) => {
          el.textContent = String(ax.human);
        });
        eachAxis(agentScores, (el, ax) => {
          el.textContent = String(ax.agent);
        });
        for (const el of avgHumanEls) el.textContent = String(AVG_HUMAN);
        for (const el of avgAgentEls) el.textContent = String(AVG_AGENT);
        gsap.set(avgChips, { scale: 1, opacity: 1 });
        if (refrain)
          gsap.set(refrain, { autoAlpha: s === "built" ? 1 : 0 });
        if (s === "built") gsap.set(refrainLines, { autoAlpha: 1, y: 0 });
        if (glow) gsap.set(glow, { opacity: s === "built" ? 0.12 : 0 });
      };

      if (reduced) {
        // Hook applies setFrozen("built") itself; timelines never play.
        return { entrance: gsap.timeline({ paused: true }), setFrozen, setDormant };
      }

      /* ---------- entrance (≤4.0s) ---------- */
      const entrance = gsap.timeline({ paused: true });
      if (headlineSplit)
        entrance.to(
          headlineSplit.words,
          { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.045 },
          0,
        );
      if (spine)
        entrance.to(
          spine,
          { drawSVG: "100%", duration: 1.2, ease: "power3.inOut" },
          0.3,
        );
      nodes.forEach((li, i) => {
        const t = NODE_POP_AT[i] ?? NODE_POP_AT[NODE_POP_AT.length - 1];
        const dot = li.querySelector("[data-node-dot]");
        if (dot)
          entrance.to(
            dot,
            { scale: 1, duration: 0.25, ease: "back.out(1.6)" },
            t,
          );
        entrance.to(
          li.querySelectorAll("p"),
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.12 },
          t + 0.08,
        );
      });
      entrance.to(
        rises,
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 },
        1.2,
      );
      for (const ed of editors) {
        ed.lines.slice(0, LINE_CAP).forEach((line, i) => {
          const t = 1.4 + i * ed.step;
          entrance.set(
            ed.caret,
            { x: ed.pos[i].x, y: ed.pos[i].y, autoAlpha: 1 },
            t,
          );
          entrance.to(line, { autoAlpha: 1, duration: 0.16, ease: "none" }, t);
        });
      }
      if (ring)
        entrance.to(
          ring,
          { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" },
          1.5,
        );
      if (ringSvg)
        entrance
          .to(ringSvg, { scale: 1.12, duration: 0.16, ease: "power2.out" }, 1.9)
          .to(ringSvg, { scale: 1, duration: 0.24, ease: "power2.inOut" }, 2.06);
      if (mobCard)
        entrance.to(
          mobCard,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          1.5,
        );

      // Matrix fill t=2.0→3.6 (both instances: 9-axis desktop, 5-axis mobile).
      const tAxis = (i: number) => 2.0 + i * 0.14;
      eachAxis(agentBars, (el, ax, i) =>
        entrance.to(
          el,
          { scaleX: ax.agent / 100, duration: 0.5, ease: "expo.out" },
          tAxis(i),
        ),
      );
      eachAxis(humanTicks, (el, _ax, i) =>
        entrance.to(
          el,
          { autoAlpha: 1, x: 0, duration: 0.45, ease: "back.out(2.5)" },
          tAxis(i) + 0.1,
        ),
      );
      eachAxis(humanScores, (el, ax, i) =>
        addCountUp(entrance, tAxis(i) + 0.05, el, {
          to: ax.human,
          duration: 0.5,
          ease: "power1.out",
        }),
      );
      eachAxis(agentScores, (el, ax, i) =>
        addCountUp(entrance, tAxis(i) + 0.05, el, {
          to: ax.agent,
          duration: 0.5,
          ease: "power1.out",
        }),
      );
      for (const el of avgHumanEls)
        addCountUp(entrance, 2.2, el, {
          to: AVG_HUMAN,
          duration: 1.4,
          ease: "power1.inOut",
        });
      for (const el of avgAgentEls)
        addCountUp(entrance, 2.2, el, {
          to: AVG_AGENT,
          duration: 1.4,
          ease: "power1.inOut",
        });

      // VERDICT PULSE — the Act I crest: one simultaneous flare on both
      // average chips as the verdicts lock (Director's cut, binding).
      entrance
        .to(avgChips, { scale: 1.12, duration: 0.16, ease: "power2.out" }, 3.6)
        .to(avgChips, { scale: 1, duration: 0.24, ease: "power2.inOut" }, 3.76)
        .to(
          avgChips,
          { opacity: 0.55, duration: 0.07, ease: "none", yoyo: true, repeat: 1 },
          3.6,
        );
      // Headline split is entrance-only — revert on settle (§6).
      entrance.call(() => revertHeadlineSplit());

      /* ---------- build: the epitaph (one-shot) ---------- */
      const build = gsap.timeline({ paused: true });
      build.call(
        () => {
          stage = "built";
        },
        undefined,
        0,
      );
      build.set(act1, { willChange: "transform" }, 0);
      if (refrain) build.set(refrain, { autoAlpha: 1 }, 0);
      build.to(
        act1,
        { opacity: 0.05, scale: 0.97, y: -12, duration: 0.6, ease: "power2.in" },
        0,
      );
      const [split1, split2] = lineSplits;
      if (split1)
        build.fromTo(
          split1.chars,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.02 },
          0.3,
        );
      if (split2)
        build.fromTo(
          split2.chars,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.02 },
          1.0,
        );
      if (refrainLines[2])
        build.fromTo(
          refrainLines[2],
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.2, ease: "power1.out" },
          1.9,
        );
      if (glow)
        build.to(glow, { opacity: 0.12, duration: 1.2, ease: "power1.out" }, 1.9);
      build.set(act1, { willChange: "auto" }, 3.2);
      build.call(() => revertLineSplits(), undefined, 3.2);
      // Glow breathes exactly 2 cycles, then total stillness (deck ends).
      if (glow)
        build.to(
          glow,
          { opacity: 0.075, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 3 },
          3.3,
        );

      /* ---------- idles (SETTLED only — BUILT is stillness) ---------- */
      const makeIdles = () => {
        if (stage === "built") return [];
        const idles: gsap.core.Animation[] = [];
        if (ringSvg) idles.push(breathe(ringSvg, 0.8, 0.5, 5));
        editors.forEach((ed, e) => {
          idles.push(
            gsap.to(ed.caret, {
              opacity: 0,
              duration: 0.55,
              ease: "steps(1)",
              repeat: -1,
              yoyo: true,
            }),
          );
          const buffer = ed.lines.slice(LINE_CAP);
          const restPos = ed.pos[Math.min(LINE_CAP, ed.lines.length) - 1];
          if (buffer.length === 0 || !restPos) return;
          const every = ed.step > 0.35 ? 4.6 : 4; // human types slower
          const loop = gsap.timeline({ repeat: -1, delay: e * 1.7 }); // deck-contract: idle
          buffer.forEach((line, i) => {
            const t = every * (i + 1);
            const p = ed.pos[LINE_CAP + i];
            if (p) loop.set(ed.caret, { x: p.x, y: p.y }, t);
            loop.to(line, { autoAlpha: 1, duration: 0.2, ease: "none" }, t);
          });
          const tEnd = every * (buffer.length + 1);
          loop.to(buffer, { autoAlpha: 0, duration: 0.35, ease: "none" }, tEnd);
          loop.set(ed.caret, { x: restPos.x, y: restPos.y }, tEnd + 0.35);
          idles.push(loop);
        });
        return idles;
      };

      return { entrance, build, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="13-finale"
      hasBuild
      title="Дорожная карта и финал"
      srSummary={
        <>
          Это не HR-инструмент. Это категория. Дорожная карта: сейчас — один
          шаблон, 10 пилотов, найм джунов; через 6 месяцев — больше ролей и
          отраслей, генерация под описание архитектуры; через 12 — оценка
          ИИ-агентов на той же инфраструктуре; долгосрок — субстрат оценки
          интеллекта на работе. На экране две сессии на одной задаче — Анна
          П., junior backend, и Claude Code, агент — оцениваемые одной
          матрицей процесса. Результат умер. Процесс — единственное, что
          осталось измерять. Кем бы он ни был.
        </>
      }
      className="py-6 lg:py-8"
    >
      <div className="relative">
        {/* ================= Act I =================
            JSX is neutral (fully visible); setDormant/setFrozen drive the
            dim — SETTLED must be reachable, so no hardcoded inline dim. */}
        <div data-act1 aria-hidden="true">
          {/* Headline */}
          <h3
            data-headline
            className="font-display text-[length:var(--text-h1)] text-paper"
          >
            Это не HR-инструмент.{" "}
            <span className="text-flame">Это категория.</span>
          </h3>

          {/* Timeline — horizontal SVG spine + 4 nodes (DrawSVG l→r). */}
          <div data-timeline className="mt-5 lg:mt-8">
            <div className="relative">
              <svg
                data-spine
                aria-hidden="true"
                className="absolute left-0 top-[5px] h-[2px] w-full"
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100"
                  y2="1"
                  stroke="var(--color-line-strong)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <ol className="relative grid grid-cols-4 gap-2 lg:gap-6">
                {MILESTONES.map((m) => (
                  <li key={m.label} data-node={m.label}>
                    <span
                      data-node-dot
                      className="relative block h-3 w-3"
                    >
                      <span
                        className={cn(
                          "absolute inset-[2px] rounded-full",
                          m.flame ? "bg-flame" : "bg-mute",
                        )}
                      />
                      {m.flame ? (
                        // Ring: DrawSVG stroke-in (circle) + scale-pulse /
                        // breathe idle (the sanctioned slide-4 ring callback).
                        // The scale/opacity tweens target this SPAN, never the
                        // <svg>: a CSS transform on an outer <svg> carries
                        // transform-box:view-box, which real Safari renders
                        // with a positional offset even at identity — that
                        // floated the flame ring off the spine (Chromium and
                        // headless WebKit don't reproduce it). A span scales
                        // around its border-box centre identically in every
                        // engine, and sizing the box via a non-replaced span
                        // (not a bare inset-sized <svg>) also kills Safari's
                        // replaced-element intrinsic-size ambiguity.
                        <span
                          data-node-ring-svg
                          aria-hidden="true"
                          className="absolute -inset-1 block overflow-visible [transform-box:border-box]"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-full w-full overflow-visible"
                          >
                            <circle
                              data-node-ring
                              cx="10"
                              cy="10"
                              r="9"
                              stroke="var(--color-flame)"
                              strokeWidth="1.5"
                              transform="rotate(-90 10 10)"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                    <p
                      className={cn(
                        "font-display mt-5 text-[13px] font-semibold lg:text-[15px]",
                        m.flame ? "text-flame" : "text-paper",
                      )}
                    >
                      {m.label}
                    </p>
                    {/* Mobile: rail of dots + labels only; descriptions are
                        desktop-only (the «+12 мес» card carries it below). */}
                    <p
                      className={cn(
                        "mt-1 hidden max-w-[24ch] text-meta leading-snug lg:block",
                        m.flame ? "text-flame/80" : "text-dim",
                      )}
                    >
                      {m.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            {/* Mobile-only highlighted «+12 мес» card (other descs cut —
                the speaker carries them). */}
            <div
              data-mob-card
              className="mt-3 rounded-xl border border-flame/40 bg-flame/8 p-3 lg:hidden"
            >
              <p className="text-[13px] leading-snug text-mute">
                <span className="font-display font-semibold text-flame">
                  +12 мес
                </span>{" "}
                — оценка ИИ-агентов на той же инфраструктуре
              </p>
            </div>
          </div>

          {/* Split — human session · dual matrix · agent session. */}
          <div data-split className="mt-5 lg:mt-8">
            {/* Desktop: two compact IDEs flank the shared matrix. */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_minmax(300px,360px)_1fr] lg:items-center lg:gap-5">
              <div data-rise className="flex flex-col">
                <SessionChip tone="glass">
                  Сессия #4173 · Анна П. · junior backend
                </SessionChip>
                <div className="relative mt-2">
                  <CandidateIde compact className="max-h-[320px]" />
                  <span
                    data-caret="human"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-3.5 w-0.5 bg-glass opacity-0"
                  />
                </div>
              </div>
              <div data-rise className="self-center">
                <DualProcessMatrix />
              </div>
              <div data-rise className="flex flex-col">
                <SessionChip tone="ember">
                  Сессия #4174 · Claude Code · агент
                </SessionChip>
                <div className="relative mt-2">
                  <CandidateIde compact className="max-h-[320px]" />
                  <span
                    data-caret="agent"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-3.5 w-0.5 bg-ember opacity-0"
                  />
                </div>
              </div>
            </div>
            {/* Mobile: IDEs cut; chips stack over one 5-axis dual matrix
                (dual bars are the money shot — bars stay visible, §5). */}
            <div className="lg:hidden">
              <div data-rise className="flex flex-col gap-1.5">
                <SessionChip tone="glass">
                  Сессия #4173 · Анна П. · junior backend
                </SessionChip>
                <SessionChip tone="ember">
                  Сессия #4174 · Claude Code · агент
                </SessionChip>
              </div>
              <div data-rise className="mt-3">
                <DualProcessMatrix maxAxes={5} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= Act II — the refrain epitaph =================
            Hidden in JSX (invisible/opacity-0); setFrozen("built") and the
            build timeline reveal it. Reduced motion gets the frozen frame. */}
        <div
          data-refrain
          className="invisible absolute inset-0 flex flex-col items-center justify-center gap-3 text-center opacity-0 lg:gap-4"
        >
          {/* Faint ember radial glow — pre-rendered gradient, opacity-only. */}
          <div
            data-refrain-glow
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] lg:h-[480px] lg:w-[480px]"
            style={{
              background:
                "radial-gradient(circle, var(--color-ember) 0%, transparent 65%)",
            }}
          />
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-paper [text-wrap:balance]"
          >
            Результат умер.
          </p>
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-paper [text-wrap:balance]"
          >
            Процесс — единственное, что осталось измерять.
          </p>
          <p
            data-refrain-line
            className="font-display relative max-w-[24ch] text-[length:var(--text-display)] text-flame [text-wrap:balance]"
          >
            Кем бы он ни был.
          </p>
        </div>
      </div>
    </Slide>
  );
}
