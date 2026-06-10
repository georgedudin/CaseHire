"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

/**
 * Slide 4 — Раскрытие. The brand emerges.
 *
 * Choreography (desktop, scrubbed against scroll):
 *   t=0.00 → "Мы знаем, что нужно делать."        fade in
 *   t=0.25 → previous line fades out, "CaseHire" scales up from 0.7
 *   t=0.50 → "КейсПодбор" appears below
 *   t=0.75 → tagline "не то, что джун производит. А то, как он работает." fades in
 *
 * Mobile/reduced-motion: stacked layout, all four lines visible, gentle
 * staggered fade — no scrub, no pin.
 */
export function Scene04Reveal() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isMobile:
            "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, isReduced } = context.conditions ?? {};

          const intro = stage.querySelector<HTMLElement>("[data-intro]");
          const brand = stage.querySelectorAll<HTMLElement>("[data-brand]");
          const tagline = stage.querySelector<HTMLElement>("[data-tagline]");

          if (isReduced) {
            gsap.set([intro, ...brand, tagline].filter(Boolean), {
              opacity: 1,
              scale: 1,
              y: 0,
            });
            return;
          }

          if (isDesktop) {
            // Initial state
            gsap.set(intro, { opacity: 0, y: 30 });
            gsap.set(brand, { opacity: 0, scale: 0.7, filter: "blur(12px)" });
            gsap.set(tagline, { opacity: 0, y: 20 });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: stage.parentElement, // the .scene-shell
                start: "top top",
                end: "+=180%",
                pin: true,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            tl.to(intro, { opacity: 1, y: 0, duration: 0.25 }, 0)
              .to(intro, { opacity: 0, y: -20, duration: 0.18 }, 0.32)
              .to(
                brand,
                {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 0.4,
                  stagger: 0.12,
                  ease: "expo.out",
                },
                0.42
              )
              .to(tagline, { opacity: 1, y: 0, duration: 0.3 }, 0.75);

            return;
          }

          if (isMobile) {
            gsap.set([intro, ...brand, tagline].filter(Boolean), {
              opacity: 0,
              y: 24,
            });
            gsap.fromTo(
              [intro, ...brand, tagline].filter(Boolean) as Element[],
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "expo.out",
                stagger: 0.18,
                scrollTrigger: {
                  trigger: stage,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: stageRef }
  );

  return (
    <Scene
      id="reveal"
      ariaLabel="Раскрытие бренда КейсПодбор · CaseHire"
      pin={false}
    >
      <div
        ref={stageRef}
        className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
      >
        {/* Vignette */}
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
          className="absolute font-display max-w-[24ch] text-paper"
          style={{ fontSize: "var(--text-h1)", lineHeight: 1.1 }}
        >
          Мы знаем,{" "}
          <span className="text-mute">что нужно делать.</span>
        </p>

        <div className="relative flex flex-col items-center gap-4 lg:gap-6">
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
          className="relative mt-12 max-w-[36ch] text-lede text-mute lg:mt-16"
        >
          Платформа, которая измеряет{" "}
          <span className="text-paper">не то, что джун производит.</span> А то,{" "}
          <span className="text-paper">как он работает.</span>
        </p>
      </div>
    </Scene>
  );
}
