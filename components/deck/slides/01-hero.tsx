"use client";

/**
 * Slide 01 — Титул · «Сигнал затухает» (landing_v2.md §4, slide 01).
 *
 * P2 static skeleton: final settled state only. Motion (SplitText decay/reform,
 * DrawSVG waveform, spotlight breathe, keycap pulse) lands in P3/P4 against the
 * data-* hooks below: data-spotlight · data-line · data-flame-word ·
 * data-wave-sine · data-wave-flat · data-keycap · data-scroll-hint.
 *
 * Vertical budget (slide is flex-centered inside 100svh):
 *   375×620 : eyebrow ~20 + 24 gap + headline 5×~48 (hero floor 44px/1.05)
 *             ≈ 240 + 40 gap + tagline ~18 ≈ 342px + bottom chrome (absolute,
 *             32px from edge) → fits with >100px slack.
 *   1366×768: eyebrow ~20 + 40 + headline 3×~88 ≈ 264 + 56 + tagline ~18
 *             ≈ 400px centered → fits. @media (max-height:600px) steps the h1
 *             down one clamp stop (--text-display) as the safety net.
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

export function Slide01Hero() {
  const { ref } = useDeckSlide({
    id: "01-hero",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="01-hero"
      title="Титул: найм джунов в эпоху, когда результат больше не сигнал"
      srSummary="КейсПодбор · CaseHire. Найм джунов в эпоху, когда результат больше не сигнал. Защита продукта · 2026."
    >
      {/* Spotlight — static at final opacity 0.6; onLeave dims to 0.35 (P3).
          Painted as a background gradient on an inset-0 layer so the glow can
          never inflate the stage's scrollWidth/scrollHeight (overflow audit).
          Radii match the old 110vmin/140vmin discs (fade ended at 60% of the
          farthest-corner radius → ≈47vmin / ≈60vmin). */}
      <div
        data-spotlight
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [--spot-r:47vmin] lg:[--spot-r:60vmin]"
        style={{
          background:
            "radial-gradient(circle var(--spot-r) at 50% 42%, rgba(255,90,31,0.18) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center lg:max-w-6xl">
        <p
          data-line
          className="text-[length:var(--text-meta)] uppercase tracking-[0.32em] text-mute"
        >
          КейсПодбор · CaseHire
        </p>

        <h1
          data-headline
          aria-label="Найм джунов в эпоху, когда результат больше не сигнал."
          className="font-display mx-auto mt-6 max-w-[18ch] text-[length:var(--text-hero)] font-bold text-paper lg:mt-8 [@media(max-height:600px)]:text-[length:var(--text-display)]"
        >
          Найм джунов в эпоху, когда{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span data-flame-word className="text-flame">
              результат
            </span>
            {/* Waveform — sibling of the SplitText target (Director's cut):
                two paths sharing one endpoint, sine (50%) → flat (25%). */}
            <svg
              aria-hidden="true"
              data-waveform
              viewBox="0 0 200 20"
              fill="none"
              className="absolute left-0 top-full w-full"
              preserveAspectRatio="none"
            >
              <path
                data-wave-sine
                d="M0,10 q8.75,-12 17.5,0 q8.75,12 17.5,0 q8.75,-12 17.5,0 q8.75,12 17.5,0 q8.75,-12 17.5,0 q8.75,12 17.5,0 q8.75,-12 17.5,0 q8.75,12 17.5,0"
                stroke="var(--color-flame)"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
              <path
                data-wave-flat
                d="M140,10 L200,10"
                stroke="var(--color-flame)"
                strokeWidth="2"
                strokeOpacity="0.25"
              />
            </svg>
          </span>{" "}
          больше не&nbsp;сигнал.
        </h1>

        <p
          data-line
          className="mt-10 text-[length:var(--text-meta)] tracking-[0.2em] text-dim"
        >
          Защита продукта · 2026
        </p>
      </div>

      {/* Keyboard/scroll chrome — absolute against the .slide stage. */}
      <div
        data-scroll-hint
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[length:var(--text-meta)] text-dim"
      >
        <span>↓ листайте</span>
        <span className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
          <kbd
            data-keycap
            className="flex h-[22px] w-[22px] items-center justify-center rounded border border-line-strong bg-fog text-xs text-dim"
          >
            ↓
          </kbd>
          <kbd
            data-keycap
            className="flex h-[22px] w-[22px] items-center justify-center rounded border border-line-strong bg-fog text-xs text-dim"
          >
            →
          </kbd>
        </span>
      </div>
    </Slide>
  );
}
