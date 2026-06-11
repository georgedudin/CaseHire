"use client";

/**
 * Slide 05 — Раскрытие · «Точка воспламенения» (landing_v2.md §4, slide 05).
 *
 * P2 static skeleton: final state only — wordmark + sub-wordmark + caption at
 * ~78% viewport height over true black (#000 via the Slide background prop),
 * static ember glow behind. The 16-dot convergence field and the flash
 * overlay are MOTION-ONLY (invisible at final) and are deliberately NOT
 * rendered in P2 — they land with the P3 timeline.
 *
 * Motion hooks: data-glow · data-wordmark · data-subwordmark · data-caption.
 * Chrome hiding on this slide is the deck manifest's concern (§1.5).
 *
 * Vertical budget (trivial — easiest responsive case in the deck):
 *   375×620 : wordmark ~52 + 16 + sub-wordmark ~28 ≈ 96 centered; caption at
 *             78% (~484px) — no collision, zero overflow risk.
 *   1366×768: wordmark ~100 + 16 + sub-wordmark ~40 ≈ 156 centered; caption
 *             at ~599px — clear of the stack (centered block ends ~462px).
 */
import { gsap } from "@/lib/gsap-setup";
import { Slide } from "@/components/deck/slide";
import { useDeckSlide } from "@/components/deck/deck-context";

export function Slide05Reveal() {
  const { ref } = useDeckSlide({
    id: "05-reveal",
    create: () => ({
      entrance: gsap.timeline({ paused: true }),
      setFrozen: () => {},
      setDormant: () => {},
    }),
  });

  return (
    <Slide
      ref={ref}
      id="05-reveal"
      title="Раскрытие: CaseHire — КейсПодбор"
      srSummary="CaseHire. КейсПодбор. Мы знаем, что нужно делать."
      background="#000"
    >
      {/* Static ember glow — idle breathe (0.06↔0.12) lands in P3.
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

      <div className="relative mx-auto text-center">
        <p
          data-wordmark
          className="font-display text-[length:var(--text-hero)] font-extrabold leading-none tracking-[-0.03em] text-paper"
        >
          CaseHire
        </p>
        <p
          data-subwordmark
          className="font-display mt-4 text-[length:var(--text-h2)] font-semibold text-ember"
        >
          КейсПодбор
        </p>
      </div>

      {/* Caption at ~78% viewport height — absolute against the .slide stage. */}
      <p
        data-caption
        className="absolute left-1/2 top-[78%] w-full -translate-x-1/2 px-5 text-center text-[length:var(--text-lede)] text-mute"
      >
        Мы знаем, что нужно делать.
      </p>
    </Slide>
  );
}
