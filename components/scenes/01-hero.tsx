"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

/**
 * Slide 1 — Заголовок.
 * Single dramatic moment that fills the first viewport. Flow-mode so
 * scroll behaves naturally below, but inner flex centers the content.
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

      const lines = stage.querySelectorAll("[data-line]");
      const spot = stage.querySelector("[data-spotlight]");

      if (reduceMotion) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }

      // Entry — scroll-triggered so it survives reload / scroll-restoration.
      // Hero starts above the fold, so "top 90%" fires effectively on mount,
      // but with the small delay we get the dramatic staged entrance.
      gsap.fromTo(
        lines,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.18,
          delay: 0.35,
          scrollTrigger: { trigger: stage, start: "top 90%", once: true },
        }
      );

      // Spotlight pulse — bounded to this scene's viewport.
      // We pause the tween when the hero leaves the viewport so it doesn't
      // bleed into scene 02, and resume it when we scroll back.
      if (spot) {
        const pulse = gsap.to(spot, {
          opacity: 0.85,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: false,
        });
        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: "bottom top",
          onLeave: () => pulse.pause(),
          onEnterBack: () => pulse.resume(),
        });
      }
    },
    { scope: stageRef }
  );

  return (
    <Scene
      id="hero"
      ariaLabel="Заголовок: найм джунов в эпоху, когда результат больше не сигнал"
    >
      <div
        ref={stageRef}
        className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-32"
      >
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
          className="relative mb-8 text-meta uppercase tracking-[0.32em] text-mute font-medium sm:mb-10"
        >
          КейсПодбор · CaseHire
        </p>

        <h1
          data-line
          className="font-display relative mx-auto max-w-[20ch] text-paper"
          style={{ fontSize: "var(--text-hero)" }}
        >
          Найм джунов в эпоху,{" "}
          <span className="text-flame">когда результат больше не сигнал.</span>
        </h1>

        <p
          data-line
          className="relative mt-10 text-meta uppercase tracking-[0.2em] text-dim sm:mt-14"
        >
          Защита продукта · 2026
        </p>

        <div
          data-line
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-meta text-dim"
        >
          <span className="block animate-pulse">↓ листайте</span>
        </div>
      </div>
    </Scene>
  );
}
