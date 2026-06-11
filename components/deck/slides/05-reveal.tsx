"use client";

/**
 * Slide 05 — Раскрытие · «Точка воспламенения» (landing_v2.md §4, slide 05 +
 * Director's cut).
 *
 * P3 motion: convergence → flash. 0.5s black hold · 16 seeded dots fade in
 * (the echo of slide 4's 16 respondents) · convergence to center (power4.in,
 * flame dot 0.05s late) · compression pulse · single FLASH (opacity 0→1 in
 * 0.1s, →0 over 0.5s while scale 0.3→2.4; peak <120ms — WCAG 2.3.1) ·
 * wordmark focus-pull (STATIC pre-blurred back layer fades out, sharp front
 * layer fades in — filter is never animated) · «КейсПодбор» SplitText chars
 * assemble from seeded offsets · caption rises. Stable at t≈3.2s.
 *
 * Idles: ember glow breathe 0.06↔0.12 (6s) + one pooled 2px ember particle
 * detaching from the wordmark baseline every ~5s (transform+opacity only).
 *
 * Frozen = exactly the static render: sharp wordmark, «КейсПодбор», caption,
 * glow at 0.09; dots/flash/blur invisible. Reduced motion: setFrozen only
 * (hook contract) — dots/flash additionally display:none, blur layer hidden
 * via autoAlpha (never paints).
 *
 * Motion hooks: data-glow · data-dots-field · data-dot · data-flash ·
 * data-wordmark-blur · data-wordmark · data-subwordmark · data-caption ·
 * data-particle. Chrome hiding on this slide is the deck manifest's concern.
 *
 * Vertical budget (trivial — easiest responsive case in the deck):
 *   375×620 : wordmark ~52 + 16 + sub-wordmark ~28 ≈ 96 centered; caption at
 *             78% (~484px) — no collision, zero overflow risk.
 *   1366×768: wordmark ~100 + 16 + sub-wordmark ~40 ≈ 156 centered; caption
 *             at ~599px — clear of the stack (centered block ends ~462px).
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";
import { DotsField, DOT_SEEDS } from "@/components/deck/parts/dots-field";
import { FlashOverlay } from "@/components/deck/parts/flash-overlay";
import { breathe } from "@/lib/motion/idle";

// Seeded char offsets for «КейсПодбор» (10 chars) — ±18px x / ±8px y, never
// runtime-random (deterministic for QA, same rule as the dot ring).
const CHAR_SEEDS: ReadonlyArray<readonly [number, number]> = [
  [-14, 6],
  [9, -8],
  [18, 5],
  [-7, -6],
  [12, 8],
  [-18, -4],
  [6, 7],
  [-10, -8],
  [15, -5],
  [-12, 4],
];

// Seeded baseline x-offsets (px from wordmark center) for the idle particle.
const PARTICLE_XS = [-104, 56, -32, 96, 8, -72] as const;

export function Slide05Reveal() {
  const { ref } = useDeckSlide({
    id: "05-reveal",
    create: ({ root, reduced }) => {
      const q = gsap.utils.selector(root);
      const glow = q("[data-glow]")[0] ?? null;
      const dotsField = q("[data-dots-field]")[0] ?? null;
      const dots = q("[data-dot]");
      const dimDots = q('[data-dot="dim"]');
      const flameDot = q('[data-dot="flame"]')[0] ?? null;
      const flash = q("[data-flash]")[0] ?? null;
      const blurLayer = q("[data-wordmark-blur]")[0] ?? null;
      const wordmark = q("[data-wordmark]")[0] ?? null;
      const sub = q("[data-subwordmark]")[0] ?? null;
      const caption = q("[data-caption]")[0] ?? null;
      const particle = q("[data-particle]")[0] ?? null;

      // Dot seeds are authored in vmin; resolved to px here (re-resolved on
      // every resize rebuild by useDeckSlide).
      const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
      // Mobile caps the flash expansion at 2.0 (spec, mobile layout).
      const flashMaxScale = window.innerWidth < 640 ? 2.0 : 2.4;

      // SplitText on «КейсПодбор»; reverted after settle so the a11y tree
      // gets the intact string back (spec implementation notes).
      const split = sub ? new SplitText(sub, { type: "chars" }) : null;
      let splitAlive = split !== null;
      const finishSplit = () => {
        if (split && splitAlive) {
          splitAlive = false;
          split.revert();
        }
      };

      /* ------------------------------------------------------------------
       * Entrance — fires on snap fixation, settles at t≈3.2s.
       * ------------------------------------------------------------------ */
      const entrance = gsap.timeline({ paused: true });
      // Flash is composited only for the duration of the entrance.
      entrance.set(flash, { willChange: "transform, opacity" }, 0);

      // 1. t=0–0.5 — pure black hold (nothing scheduled).

      // 2. t=0.5 — 16 dots fade in at their seeded ring positions.
      entrance.to(
        dots,
        { autoAlpha: 1, duration: 0.3, ease: "power2.out", stagger: 0.015 },
        0.5,
      );

      // 3. t=0.9 — convergence: transforms only, flame dot 0.05s late.
      entrance.to(
        dimDots,
        {
          x: 0,
          y: 0,
          scale: 0.5,
          autoAlpha: 0.7,
          duration: 0.6,
          ease: "power4.in",
          overwrite: "auto",
        },
        0.9,
      );
      entrance.to(
        flameDot,
        { x: 0, y: 0, scale: 0.5, duration: 0.6, ease: "power4.in", overwrite: "auto" },
        0.95,
      );

      // 4. t=1.5 — compression beat: merged point pulses 1→1.6→1 (relative).
      entrance.to(flameDot, { scale: 0.8, duration: 0.06, ease: "power2.in" }, 1.5);
      entrance.to(flameDot, { scale: 0.5, duration: 0.09, ease: "back.out(3)" }, 1.56);

      // 5. t=1.65 — FLASH. One flash, peak <120ms (opacity >0.9 ≈ 36ms,
      // >0.5 ≈ 200ms total — inside WCAG 2.3.1).
      entrance.fromTo(
        flash,
        { scale: 0.3 },
        { autoAlpha: 1, duration: 0.1, ease: "power2.in" },
        1.65,
      );
      entrance.to(flash, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 1.75);
      entrance.to(flash, { scale: flashMaxScale, duration: 0.5, ease: "expo.out" }, 1.75);
      // Dots are swallowed under the flash peak.
      entrance.set(dots, { autoAlpha: 0 }, 1.72);
      entrance.set(flash, { clearProps: "willChange" }, 2.4);

      // 6. t=1.7 — wordmark focus-pull: static pre-blurred back layer 1→0,
      // sharp front layer 0→1 + scale 1.12→1. Filter is NEVER tweened.
      entrance.set(blurLayer, { autoAlpha: 1 }, 1.7);
      entrance.to(blurLayer, { autoAlpha: 0, duration: 0.6, ease: "expo.out" }, 1.7);
      entrance.fromTo(
        wordmark,
        { autoAlpha: 0, scale: 1.12 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out" },
        1.7,
      );
      entrance.to(glow, { autoAlpha: 0.09, duration: 0.8, ease: "power2.out" }, 1.7);

      // 7. t=2.0 — «КейсПодбор» assembles inward from seeded offsets.
      if (split) {
        entrance.to(
          split.chars,
          { autoAlpha: 1, x: 0, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.02 },
          2.0,
        );
      }

      // 8. t=2.7 — caption rises. Stable at t≈3.2s.
      entrance.to(caption, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 2.7);
      entrance.call(finishSplit, [], 3.2);

      return {
        entrance,

        makeIdles: () => {
          const idles: gsap.core.Animation[] = [breathe(glow, 0.06, 0.12, 6)];
          if (particle) {
            // One pooled 2px ember detaches from the wordmark baseline every
            // ~5s (1.4s drift + 3.6s rest), cycling seeded x positions.
            let cycle = 0;
            gsap.set(particle, { x: PARTICLE_XS[0], y: 0, autoAlpha: 0 });
            const drift = gsap.timeline({ repeat: -1, repeatDelay: 3.6, delay: 1.6 }); // deck-contract: idle
            drift.eventCallback("onRepeat", () => {
              cycle = (cycle + 1) % PARTICLE_XS.length;
              gsap.set(particle, { x: PARTICLE_XS[cycle] });
            });
            drift
              .fromTo(
                particle,
                { y: 0, autoAlpha: 0 },
                { autoAlpha: 0.9, duration: 0.25, ease: "power1.out" },
              )
              .to(particle, { autoAlpha: 0, duration: 0.95, ease: "power1.in" }, 0.45)
              .fromTo(particle, { y: 0 }, { y: -40, duration: 1.4, ease: "power1.out" }, 0);
            idles.push(drift);
          }
          return idles;
        },

        // Exactly the static render: wordmark sharp, «КейсПодбор», caption,
        // glow 0.09; dots/flash/blur/particle invisible (entrance consumed).
        setFrozen: () => {
          finishSplit();
          gsap.set([dotsField, blurLayer, particle], { autoAlpha: 0 });
          gsap.set(flash, { autoAlpha: 0, scale: 0.3, clearProps: "willChange" });
          // Reduced motion: motion-only layers leave the rendering flow
          // entirely — the blur layer must never paint, the flash never show.
          if (reduced) gsap.set([dotsField, flash], { display: "none" });
          gsap.set(wordmark, { autoAlpha: 1, scale: 1 });
          gsap.set(sub, { autoAlpha: 1 });
          gsap.set(glow, { autoAlpha: 0.09 });
          gsap.set(caption, { autoAlpha: 1, y: 0 });
        },

        setDormant: () => {
          gsap.set(glow, { autoAlpha: 0 });
          gsap.set(dotsField, { autoAlpha: 1 });
          dots.forEach((el, i) => {
            const seed = DOT_SEEDS[i];
            if (!seed) return;
            gsap.set(el, {
              xPercent: -50,
              yPercent: -50,
              x: seed.x * vmin,
              y: seed.y * vmin,
              scale: 1,
              autoAlpha: 0,
            });
          });
          gsap.set(flash, { autoAlpha: 0, scale: 0.3 });
          gsap.set(blurLayer, { autoAlpha: 0 });
          gsap.set(wordmark, { autoAlpha: 0, scale: 1.12 });
          if (split && splitAlive) {
            split.chars.forEach((c, i) => {
              const s = CHAR_SEEDS[i % CHAR_SEEDS.length] ?? [0, 0];
              gsap.set(c, { autoAlpha: 0, x: s[0], y: s[1] });
            });
          }
          gsap.set(caption, { autoAlpha: 0, y: 12 });
          gsap.set(particle, { autoAlpha: 0 });
        },
      };
    },
  });

  return (
    <Slide
      ref={ref}
      id="05-reveal"
      title="Раскрытие: CaseHire — КейсПодбор"
      srSummary="CaseHire. КейсПодбор. Мы знаем, что нужно делать."
      background="#000"
    >
      {/* Static ember glow — idle breathe (0.06↔0.12, 6s) via makeIdles.
          Painted as a background gradient on an inset-0 layer so the glow can
          never inflate the stage's scrollWidth/scrollHeight (overflow audit).
          Radius matches the old min(900px,120vmin) disc, whose fade ended at
          60% of the farthest-corner radius → min(≈382px, ≈51vmin). */}
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          background:
            "radial-gradient(circle min(382px, 51vmin) at 50% 50%, var(--color-flame) 0%, transparent 100%)",
        }}
      />

      {/* Motion-only layers (invisible at final): dots below the flash,
          flash below the text stack (DOM order = paint order). */}
      <DotsField />
      <FlashOverlay />

      <div className="relative mx-auto text-center">
        <div className="relative">
          {/* Focus-pull back layer: STATICALLY pre-blurred copy — the filter
              is set once in CSS and never animated; only opacity tweens. */}
          <p
            data-wordmark-blur
            aria-hidden="true"
            className="font-display absolute inset-0 text-[length:var(--text-hero)] font-extrabold leading-none tracking-[-0.03em] text-paper opacity-0"
            style={{ filter: "blur(14px)" }}
          >
            CaseHire
          </p>
          <p
            data-wordmark
            className="font-display text-[length:var(--text-hero)] font-extrabold leading-none tracking-[-0.03em] text-paper"
          >
            CaseHire
          </p>
          {/* Pooled idle ember — detaches from the baseline every ~5s. */}
          <span
            data-particle
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 h-0.5 w-0.5 rounded-full bg-ember opacity-0"
          />
        </div>
        <p
          data-subwordmark
          className="font-display mt-4 text-[length:var(--text-h2)] font-semibold text-ember"
        >
          КейсПодбор
        </p>
      </div>

      {/* Caption at ~78% viewport height — absolute against the .slide stage.
          Centered via left-0/w-full so GSAP's y tween owns the transform. */}
      <p
        data-caption
        className="absolute left-0 top-[78%] w-full px-5 text-center text-[length:var(--text-lede)] text-mute"
      >
        Мы знаем, что нужно делать.
      </p>
    </Slide>
  );
}
