"use client";

import { Scene } from "@/components/scroll/scene";
import { useCountUp } from "@/components/scroll/hooks/use-count-up";
import { useReveal } from "@/components/scroll/hooks/use-reveal";

/**
 * Slide 2 — Боль. Two giant count-up numbers + closing line.
 */
export function Scene02Pain() {
  const minus60 = useCountUp({ to: 60, prefix: "−", suffix: "%" });
  const seven = useCountUp({ to: 7, suffix: "%" });
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.12,
    y: 32,
  });

  return (
    <Scene id="pain" ariaLabel="Боль: что не так с джунами в 2026">
      <div ref={revealRef} className="scene-content">
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          02 · Боль
        </p>

        <h2
          data-stagger
          className="font-display mt-6 max-w-[22ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Что не так с джунами в&nbsp;2026?
        </h2>

        <div
          data-stagger
          className="mt-14 grid gap-12 sm:mt-20 sm:gap-16 lg:mt-24 lg:grid-cols-2 lg:gap-20"
        >
          <figure className="border-t border-line-strong pt-7 sm:pt-8">
            <span
              ref={minus60 as React.RefObject<HTMLSpanElement>}
              className="font-display block text-flame tabular-nums"
              style={{ fontSize: "var(--text-hero)", lineHeight: 0.95 }}
              aria-label="минус 60 процентов"
            >
              −0%
            </span>
            <figcaption className="mt-5 max-w-[28ch] text-lede text-mute sm:mt-6">
              <span className="text-paper">Вакансий начального уровня</span>{" "}
              с&nbsp;2022 года.
              <span className="mt-2 block text-meta text-dim">
                IEEE Spectrum
              </span>
            </figcaption>
          </figure>

          <figure className="border-t border-line-strong pt-7 sm:pt-8">
            <span
              ref={seven as React.RefObject<HTMLSpanElement>}
              className="font-display block text-paper tabular-nums"
              style={{ fontSize: "var(--text-hero)", lineHeight: 0.95 }}
              aria-label="7 процентов"
            >
              0%
            </span>
            <figcaption className="mt-5 max-w-[32ch] text-lede text-mute sm:mt-6">
              <span className="text-paper">
                Доля свежих выпускников в&nbsp;найме крупных технокомпаний.
              </span>{" "}
              Минус 25% только за прошлый год.
              <span className="mt-2 block text-meta text-dim">
                SignalFire 2025
              </span>
            </figcaption>
          </figure>
        </div>

        <p
          data-stagger
          className="mt-14 max-w-[44ch] text-lede text-paper sm:mt-20 lg:mt-24"
        >
          Джуны больше никому не нужны.{" "}
          <span className="text-mute">
            А те, что нужны — неотличимы друг от друга.
          </span>
        </p>
      </div>
    </Scene>
  );
}
