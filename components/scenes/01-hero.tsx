"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { gsap } from "@/lib/gsap-setup";

/**
 * Slide 1 — Заголовок.
 * Чёрный фон. Один свет в центр. Огромная типографика. Один тезис.
 *
 * Choreography:
 *  - Eyebrow → headline → byline appear in sequence on mount.
 *  - Headline is the visual anchor; copy lifted verbatim from ru_pitch.md:62.
 */
export function Scene01Hero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(stage.querySelectorAll("[data-line]"), { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        stage.querySelectorAll("[data-line]"),
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.18,
          delay: 0.35,
        }
      );

      // Soft pulse on the centered spotlight to suggest the "single light".
      const spot = stage.querySelector("[data-spotlight]");
      if (spot) {
        gsap.to(spot, {
          opacity: 0.85,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    },
    { scope: stageRef }
  );

  return (
    <Scene
      id="hero"
      ariaLabel="Заголовок: найм джунов в эпоху, когда результат больше не сигнал"
      pin={false}
    >
      <div
        ref={stageRef}
        className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
      >
        {/* Radial spotlight */}
        <div
          data-spotlight
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,90,31,0.18), transparent 60%)",
          }}
        />

        <p
          data-line
          className="relative mb-10 text-meta uppercase tracking-[0.32em] text-mute font-medium"
        >
          КейсПодбор · CaseHire
        </p>

        <h1
          data-line
          className="font-display relative max-w-[18ch] text-paper"
          style={{ fontSize: "var(--text-hero)" }}
        >
          Найм джунов в эпоху,{" "}
          <span className="text-flame">когда результат больше не сигнал.</span>
        </h1>

        <p
          data-line
          className="relative mt-12 text-meta uppercase tracking-[0.2em] text-dim"
        >
          Защита продукта · 2026
        </p>

        {/* Scroll affordance */}
        <div
          data-line
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-meta text-dim"
        >
          <span className="block animate-pulse">↓ листайте</span>
        </div>
      </div>
    </Scene>
  );
}
