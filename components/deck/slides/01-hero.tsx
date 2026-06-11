"use client";

/**
 * Slide 01 — Титул · «Сигнал затухает» (landing_v2.md §4, slide 01).
 *
 * Motion implementation (P3). Entrance beats (paused tl, played by the
 * controller on the load case after fonts.ready + veil):
 *   0.0  spotlight 0→0.6 (1.2s sine.out)
 *   0.2  eyebrow rise (0.9s expo.out)
 *   0.5  headline SplitText LINES in overflow-clip masks, yPercent 110→0
 *        (1.1s expo.out, stagger 0.12)
 *   1.6  tagline + keyboard chrome (0.7s power2.out)
 *   1.95 line masks released (instant set — the waveform hangs below the
 *        flame word's line box and must not be clipped when it draws)
 *   2.2  DECAY — SplitText chars of «результат» only (9 glyphs): y+10,
 *        rotation random ±4°, opacity→0.28, power3.in, random stagger
 *        (amount 0.35 + 0.45/char = ghost complete at t=3.0); DrawSVG sine
 *        0→100%, then flat segment draws with its own opacity tween →0.25
 *        while the sine stroke dims to 0.25 (signal flatlines)
 *   3.0  hold 0.3s at ghost state
 *   3.3  REFORM — chars back to y0/rot0 but opacity 0.85; sine stroke back
 *        to 0.5. Stable at t=3.9s (≤4.0s budget, §2.1).
 *
 * Frozen state = the static render with spotlight pre-dimmed to 0.35 (§2.6
 * onLeave set — no exit tween). Idles (§2.5, killed on leave): spotlight
 * breathe 0.55↔0.8/4s · decay-reform compressed to 1.6s every ~7s · keycap
 * pulse 0.5↔1/2.4s. Reduced motion: the SSR markup IS the final state
 * (flame word at full opacity, waveform statically drawn) — no splits,
 * hooks are no-ops.
 *
 * Vertical budget (slide is flex-centered inside 100svh):
 *   375×620 : eyebrow ~20 + 24 gap + headline 5×~48 (hero floor 44px/1.05)
 *             ≈ 240 + 40 gap + tagline ~18 ≈ 342px + bottom chrome (absolute,
 *             32px from edge) → fits with >100px slack.
 *   1366×768: eyebrow ~20 + 40 + headline 3×~88 ≈ 264 + 56 + tagline ~18
 *             ≈ 400px centered → fits. @media (max-height:600px) steps the h1
 *             down one clamp stop (--text-display) as the safety net.
 */
import { gsap, SplitText } from "@/lib/gsap-setup";
import { breathe } from "@/lib/motion/idle";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

export function Slide01Hero() {
  const { ref } = useDeckSlide({
    id: "01-hero",
    create: ({ root, reduced }) => {
      if (reduced) {
        // Static deck (§ slide-01 reduced note): the SSR markup already IS
        // the final reduced frame — flame word at FULL opacity, waveform
        // drawn at 50/25% stroke, spotlight 0.6, no loops. Nothing to set.
        return {
          entrance: gsap.timeline({ paused: true }),
          setFrozen: () => {},
          setDormant: () => {},
        };
      }

      const spotlight = root.querySelector<HTMLElement>("[data-spotlight]")!;
      const headline = root.querySelector<HTMLElement>("[data-headline]")!;
      const flameWord = root.querySelector<HTMLElement>("[data-flame-word]")!;
      const sine = root.querySelector<SVGPathElement>("[data-wave-sine]")!;
      const flat = root.querySelector<SVGPathElement>("[data-wave-flat]")!;
      const hint = root.querySelector<HTMLElement>("[data-scroll-hint]")!;
      const keycaps = root.querySelectorAll<HTMLElement>("[data-keycap]");
      // Document order: [0] = eyebrow, [1] = tagline.
      const [eyebrow, tagline] = Array.from(
        root.querySelectorAll<HTMLElement>("[data-line]"),
      );

      // Lines first (masked rise), then chars on the flame span only — the
      // waveform SVG is a SIBLING of the flame span, never a split target.
      // Both splits are context-tracked → ctx.revert() restores the DOM on
      // the hook's debounced-resize rebuild. SplitText's default aria mode
      // keeps the h1 aria-label and aria-hides the split spans.
      const lineSplit = SplitText.create(headline, {
        type: "lines",
        mask: "lines",
      });
      const lines = lineSplit.lines;
      const masks = lines.map((l) => l.parentElement as HTMLElement);
      const charSplit = SplitText.create(flameWord, { type: "chars" });
      const chars = charSplit.chars; // «результат» — 9 glyphs

      const setDormant = () => {
        gsap.set(spotlight, { autoAlpha: 0 });
        gsap.set(eyebrow, { autoAlpha: 0, y: 24 });
        gsap.set(lines, { autoAlpha: 0, yPercent: 110 });
        gsap.set(masks, { overflow: "clip" });
        gsap.set([tagline, hint], { autoAlpha: 0, y: 16 });
        gsap.set(chars, { y: 0, rotation: 0, opacity: 1, willChange: "auto" });
        gsap.set(keycaps, { opacity: 1 });
        gsap.set([sine, flat], { drawSVG: "0%", strokeOpacity: 0.5 });
      };

      // Settled and built are the same frame here (no build step). Spotlight
      // freezes at 0.35 — the §2.6 onLeave dim, darker than the idle range,
      // so slide 2 receives a quieter ink. Everything else = static render.
      const setFrozen = () => {
        gsap.set(spotlight, { autoAlpha: 0.35 });
        gsap.set(eyebrow, { autoAlpha: 1, y: 0 });
        gsap.set(lines, { autoAlpha: 1, yPercent: 0 });
        gsap.set(masks, { overflow: "visible" });
        gsap.set([tagline, hint], { autoAlpha: 1, y: 0 });
        gsap.set(chars, { y: 0, rotation: 0, opacity: 0.85, willChange: "auto" });
        gsap.set(keycaps, { opacity: 1 });
        gsap.set(sine, { drawSVG: "100%", strokeOpacity: 0.5 });
        gsap.set(flat, { drawSVG: "100%", strokeOpacity: 0.25 });
      };

      const entrance = gsap.timeline({ paused: true });
      entrance
        // will-change on the 9 char spans only while they move (cleared in setFrozen)
        .set(chars, { willChange: "transform, opacity" }, 0)
        .to(spotlight, { autoAlpha: 0.6, duration: 1.2, ease: "sine.out" }, 0)
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" }, 0.2)
        .set(lines, { autoAlpha: 1 }, 0.5)
        .to(
          lines,
          { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 },
          0.5,
        )
        .to(
          [tagline, hint],
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
          1.6,
        )
        .set(masks, { overflow: "visible" }, 1.95)
        // DECAY — ghost complete at t=3.0
        .to(
          chars,
          {
            y: 10,
            rotation: "random(-4,4)",
            opacity: 0.28,
            duration: 0.45,
            ease: "power3.in",
            stagger: { amount: 0.35, from: "random" },
          },
          2.2,
        )
        .to(sine, { drawSVG: "100%", duration: 0.45, ease: "power1.inOut" }, 2.2)
        .to(
          flat,
          { drawSVG: "100%", strokeOpacity: 0.25, duration: 0.3, ease: "none" },
          2.65,
        )
        .to(sine, { strokeOpacity: 0.25, duration: 0.35, ease: "power1.out" }, 2.65)
        // hold 3.0→3.3 · REFORM — the word never fully recovers (0.85)
        .to(
          chars,
          {
            y: 0,
            rotation: 0,
            opacity: 0.85,
            duration: 0.4,
            ease: "expo.out",
            stagger: { amount: 0.2 },
          },
          3.3,
        )
        .to(sine, { strokeOpacity: 0.5, duration: 0.4, ease: "power1.out" }, 3.3);

      const makeIdles = () => {
        gsap.set(chars, { willChange: "transform, opacity" });
        // Beats 5–7 compressed to 1.6s, firing every ~7s (5.4s solid hold
        // before the first cycle and between cycles — §2.5 + slide spec).
        const decayLoop = gsap.timeline({ delay: 5.4, repeat: -1, repeatDelay: 5.4 }); // deck-contract: idle
        decayLoop
          .to(
            chars,
            {
              y: 10,
              rotation: "random(-4,4)",
              opacity: 0.28,
              duration: 0.4,
              ease: "power3.in",
              stagger: { amount: 0.2, from: "random" },
            },
            0,
          )
          .to(sine, { strokeOpacity: 0.25, duration: 0.4, ease: "power1.out" }, 0.2)
          .to(
            chars,
            {
              y: 0,
              rotation: 0,
              opacity: 0.85,
              duration: 0.45,
              ease: "expo.out",
              stagger: { amount: 0.15 },
            },
            0.85,
          )
          .to(sine, { strokeOpacity: 0.5, duration: 0.45, ease: "power1.out" }, 0.85)
          .add(() => {}, 1.6); // pad the cycle to exactly 1.6s → 7.0s period
        return [
          breathe(spotlight, 0.55, 0.8, 4),
          decayLoop,
          breathe(keycaps, 0.5, 1, 2.4),
        ];
      };

      return { entrance, makeIdles, setFrozen, setDormant };
    },
  });

  return (
    <Slide
      ref={ref}
      id="01-hero"
      title="Титул: найм джунов в эпоху, когда результат больше не сигнал"
      srSummary="КейсПодбор · CaseHire. Найм джунов в эпоху, когда результат больше не сигнал. Защита продукта · 2026."
    >
      {/* Spotlight — SSR at final opacity 0.6 (reduced-motion frame); the
          motion hooks drive it 0→0.6 on entrance, breathe it 0.55↔0.8 idle,
          and freeze it at 0.35 in setFrozen (§2.6 onLeave dim, no exit tween).
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
