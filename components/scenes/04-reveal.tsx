"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { gsap } from "@/lib/gsap-setup";

/**
 * Slide 4 — Раскрытие. The brand emerges.
 *
 * Staged reveal on entry — no scroll pin (it had too much content to fit
 * in one viewport while pinned, which clipped on smaller screens).
 *
 * Sequence:
 *   intro       → "Мы знаем, что нужно делать."
 *   brand wall  → "CaseHire" + "КейсПодбор" (scale-up from soft blur)
 *   tagline     → "Платформа, которая измеряет..."
 */
export function Scene04Reveal() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const intro = stage.querySelector("[data-intro]");
      const brand = stage.querySelectorAll("[data-brand]");
      const tagline = stage.querySelector("[data-tagline]");

      if (reduceMotion) {
        gsap.set([intro, ...brand, tagline].filter(Boolean), {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "none",
        });
        return;
      }

      gsap.set(intro, { opacity: 0, y: 24 });
      gsap.set(brand, { opacity: 0, scale: 0.78, filter: "blur(14px)" });
      gsap.set(tagline, { opacity: 0, y: 18 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(intro, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" })
        .to(
          brand,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.18,
          },
          "+=0.15"
        )
        .to(
          tagline,
          { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" },
          "-=0.2"
        );
    },
    { scope: stageRef }
  );

  return (
    <Scene id="reveal" ariaLabel="Раскрытие бренда КейсПодбор · CaseHire">
      <div
        ref={stageRef}
        className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-32 lg:py-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at center, rgba(255,90,31,0.10), transparent 70%)",
          }}
        />

        <p
          data-intro
          className="font-display relative max-w-[24ch] text-paper"
          style={{ fontSize: "var(--text-h1)", lineHeight: 1.15 }}
        >
          Мы знаем,{" "}
          <span className="text-mute">что нужно делать.</span>
        </p>

        <div className="relative mt-12 flex flex-col items-center gap-3 sm:mt-16 sm:gap-4">
          <span
            data-brand
            className="font-display block text-paper"
            style={{
              fontSize: "var(--text-hero)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            CaseHire
          </span>
          <span
            data-brand
            className="font-display block text-flame"
            style={{
              fontSize: "var(--text-hero)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            КейсПодбор
          </span>
        </div>

        <p
          data-tagline
          className="relative mt-12 max-w-[40ch] text-lede text-mute sm:mt-16"
        >
          Платформа, которая измеряет{" "}
          <span className="text-paper">не то, что джун производит.</span> А то,{" "}
          <span className="text-paper">как он работает.</span>
        </p>
      </div>
    </Scene>
  );
}
