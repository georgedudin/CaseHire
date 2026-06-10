"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { useCountUp } from "@/components/scroll/hooks/use-count-up";
import { cn } from "@/lib/cn";

type Card = {
  who: "HR" | "Кандидат";
  numerator: number;
  denominator: number;
  quote: string;
};

const CARDS: Card[] = [
  {
    who: "HR",
    numerator: 6,
    denominator: 8,
    quote: "Все резюме одинаковые. Я не могу отфильтровать никого до собеса.",
  },
  {
    who: "HR",
    numerator: 5,
    denominator: 8,
    quote: "Домашние тестовые обесценились. ChatGPT решает за кандидата.",
  },
  {
    who: "Кандидат",
    numerator: 8,
    denominator: 8,
    quote: "После отказа — просто тишина. Месяц молчания.",
  },
];

export function Scene03Interviews() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.14,
    y: 32,
  });

  // Count the fraction numerators on enter — lands the pitch beat
  // "восемь из восьми. восемь из восьми."
  const ref0 = useCountUp({ to: CARDS[0].numerator, duration: 1.2 });
  const ref1 = useCountUp({ to: CARDS[1].numerator, duration: 1.2 });
  const ref2 = useCountUp({ to: CARDS[2].numerator, duration: 1.2 });
  const numRefs = [ref0, ref1, ref2];

  return (
    <Scene id="interviews" ariaLabel="16 глубинных интервью">
      <div ref={revealRef} className="scene-content">
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          03 · Глубинные интервью
        </p>

        <h2
          data-stagger
          className="font-display mt-6 max-w-[26ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          16 интервью. Услышали{" "}
          <span className="text-flame">одно и то же.</span>
        </h2>

        <p data-stagger className="mt-4 text-lede text-mute">
          8 нанимающих менеджеров + 8 кандидатов-джунов.
        </p>

        <ul
          data-stagger
          role="list"
          className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 md:grid-cols-3 md:gap-5 lg:mt-20 lg:gap-6"
        >
          {CARDS.map((card, idx) => (
            <li
              key={`${card.who}-${idx}`}
              data-stagger
              className={cn(
                "flex min-h-[16rem] flex-col gap-6 rounded-2xl border border-line-strong bg-fog p-6 sm:p-7 md:min-h-[18rem] lg:p-8",
                card.numerator === card.denominator &&
                  "border-flame/40 ring-1 ring-flame/20"
              )}
            >
              <header className="flex items-center justify-between">
                <span className="text-meta uppercase tracking-[0.25em] text-mute">
                  {card.who}
                </span>
                <span
                  className={cn(
                    "text-meta uppercase tracking-[0.2em]",
                    card.numerator === card.denominator
                      ? "text-flame"
                      : "text-dim"
                  )}
                  aria-hidden="true"
                >
                  крик души
                </span>
              </header>

              <p
                className="font-display tabular-nums leading-none"
                style={{ fontSize: "var(--text-display)" }}
                aria-label={`${card.numerator} из ${card.denominator}`}
              >
                <span
                  ref={numRefs[idx] as React.RefObject<HTMLSpanElement>}
                  className={
                    card.numerator === card.denominator
                      ? "text-flame"
                      : "text-paper"
                  }
                >
                  0
                </span>
                <span className="text-dim">/{card.denominator}</span>
              </p>

              <blockquote className="text-lede text-paper">
                «{card.quote}»
              </blockquote>
            </li>
          ))}
        </ul>

        <dl
          data-stagger
          className="mt-10 grid gap-4 text-meta text-mute sm:mt-14 md:grid-cols-2 md:gap-10"
        >
          <div className="flex gap-3">
            <span aria-hidden="true" className="text-flame">
              +
            </span>
            <p>
              <span className="text-paper">7 из 8 HR:</span>{" "}
              «Хотим предфильтр до часа собеседования.»
            </p>
          </div>
          <div className="flex gap-3">
            <span aria-hidden="true" className="text-flame">
              +
            </span>
            <p>
              <span className="text-paper">7 из 8 кандидатов:</span>{" "}
              «Короткие практические задачи с реальным контекстом — это честный
              формат.»
            </p>
          </div>
        </dl>
      </div>
    </Scene>
  );
}
