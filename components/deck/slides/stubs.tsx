"use client";

/**
 * P1 verification stubs (plan Phase 1) — THROWAWAY, replaced by real slides
 * in P2. Three slides exercising every controller path:
 *   Stub A — plain slide: staggered entrance + count-up + idle breathe.
 *   Stub B — build slide (200svh sticky): entrance, then a build one-shot
 *            (score 89→18 + bar collapse) on the second gesture / midpoint.
 *   Stub C — SplitText entrance (fonts.ready gate + revert path).
 * Frozen/dormant setters are exhaustive so back-nav and dormancy are visible.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { addCountUp, countUpText } from "@/lib/motion/count-up";
import { breathe, pulse } from "@/lib/motion/idle";

export function StubA() {
  const { ref } = useDeckSlide({
    id: "stub-a",
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const lines = q("[data-line]");
      const stat = q("[data-stat]")[0];

      const entrance = gsap.timeline({ paused: true });
      entrance.fromTo(
        lines,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.12 },
      );
      addCountUp(entrance, 0.5, stat, { to: 60, prefix: "−", suffix: "%" });

      return {
        entrance,
        makeIdles: () => [breathe(q("[data-glow]"), 0.4, 0.8, 3)],
        setFrozen: () => {
          gsap.set(lines, { autoAlpha: 1, y: 0, clearProps: "willChange" });
          if (stat) stat.textContent = countUpText(60, { to: 60, prefix: "−", suffix: "%" });
        },
        setDormant: () => {
          gsap.set(lines, { autoAlpha: 0, y: 28 });
          if (stat) stat.textContent = countUpText(0, { to: 60, prefix: "−", suffix: "%" });
        },
      };
    },
  });

  return (
    <Slide ref={ref} id="stub-a" title="Стаб A — обычный слайд">
      <div className="mx-auto max-w-3xl text-center">
        <p data-line className="text-meta uppercase tracking-[0.3em] text-dim">
          стаб · A
        </p>
        <h3 data-line className="font-display mt-6 text-[length:var(--text-display)] text-paper">
          Обычный слайд: вход после фиксации
        </h3>
        <p data-line className="mt-10">
          <span data-stat data-glow className="font-display text-[length:var(--text-hero)] tabular-nums text-flame">
            −0%
          </span>
        </p>
      </div>
    </Slide>
  );
}

export function StubB() {
  const { ref } = useDeckSlide({
    id: "stub-b",
    hasBuild: true,
    autoChainMs: 1500,
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const panel = q("[data-panel]");
      const bar = q("[data-bar]")[0];
      const score = q("[data-score]")[0];
      const flag = q("[data-flag]")[0];

      const entrance = gsap.timeline({ paused: true });
      entrance.fromTo(
        panel,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.15 },
      );

      const build = gsap.timeline({ paused: true });
      build
        .to(bar ?? null, {
          scaleX: 0.18,
          backgroundColor: "#ef4444",
          duration: 1.1,
          ease: "power3.in",
        })
        .to(flag ?? null, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, "-=0.3");
      const proxy = { v: 89 };
      build.to(
        proxy,
        {
          v: 18,
          duration: 1.1,
          ease: "power3.in",
          onUpdate: () => {
            if (score) score.textContent = String(Math.round(proxy.v));
          },
        },
        0,
      );

      return {
        entrance,
        build,
        makeIdles: () => [pulse(q("[data-flag]"), 1.04, 1.6)],
        setFrozen: (stage) => {
          gsap.set(panel, { autoAlpha: 1, y: 0 });
          if (stage === "built") {
            gsap.set(bar ?? null, { scaleX: 0.18, backgroundColor: "#ef4444" });
            gsap.set(flag ?? null, { autoAlpha: 1, scale: 1 });
            if (score) score.textContent = "18";
          } else {
            gsap.set(bar ?? null, { scaleX: 0.89, backgroundColor: "#22c55e" });
            gsap.set(flag ?? null, { autoAlpha: 0, scale: 1.4 });
            if (score) score.textContent = "89";
          }
        },
        setDormant: () => {
          gsap.set(panel, { autoAlpha: 0, y: 32 });
          gsap.set(bar ?? null, { scaleX: 0.89, backgroundColor: "#22c55e" });
          gsap.set(flag ?? null, { autoAlpha: 0, scale: 1.4 });
          if (score) score.textContent = "89";
        },
      };
    },
  });

  return (
    <Slide ref={ref} id="stub-b" hasBuild title="Стаб B — слайд со встроенным шагом">
      <div className="mx-auto max-w-3xl">
        <p data-panel className="text-meta uppercase tracking-[0.3em] text-dim">
          стаб · B · два жеста
        </p>
        <h3 data-panel className="font-display mt-6 text-[length:var(--text-display)] text-paper">
          Жест 1 — обвал оси, жест 2 — выход
        </h3>
        <div data-panel className="mt-12 rounded-2xl border border-line-strong bg-fog p-8">
          <div className="flex items-center justify-between">
            <span className="text-mute">Цифровая гигиена</span>
            <span data-score className="font-display text-[length:var(--text-h1)] tabular-nums text-paper">
              89
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-line">
            <div
              data-bar
              className="h-2 origin-left rounded-full bg-trust"
              style={{ transform: "scaleX(0.89)" }}
            />
          </div>
          <p data-flag className="mt-6 text-meta text-leak opacity-0">
            ⚠ обнаружена утечка · стаб-маркер
          </p>
        </div>
      </div>
    </Slide>
  );
}

export function StubC() {
  const { ref } = useDeckSlide({
    id: "stub-c",
    create: ({ root }) => {
      const q = gsap.utils.selector(root);
      const headline = q("[data-split]")[0];
      const split = headline ? new SplitText(headline, { type: "chars" }) : null;

      const entrance = gsap.timeline({ paused: true });
      if (split) {
        entrance.fromTo(
          split.chars,
          { autoAlpha: 0, y: 14, rotation: () => gsap.utils.random(-6, 6) },
          { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6, ease: "expo.out", stagger: 0.025 },
        );
      }

      return {
        entrance,
        setFrozen: () => {
          if (split) gsap.set(split.chars, { autoAlpha: 1, y: 0, rotation: 0 });
        },
        setDormant: () => {
          if (split) gsap.set(split.chars, { autoAlpha: 0, y: 14 });
        },
      };
    },
  });

  return (
    <Slide ref={ref} id="stub-c" title="Стаб C — SplitText на кириллице">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-meta uppercase tracking-[0.3em] text-dim">стаб · C</p>
        <h3
          data-split
          className="font-display mt-6 text-[length:var(--text-display)] text-paper"
        >
          Результат больше не сигнал
        </h3>
      </div>
    </Slide>
  );
}
