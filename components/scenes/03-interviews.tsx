"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
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

/**
 * Slide 3 — Глубинные интервью. «Крики души».
 *
 * Three cards stagger in on enter; copy verbatim from ru_pitch.md:110–149.
 * Mobile: vertical stack, desktop: 3-column grid.
 */
export function Scene03Interviews() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.14,
    y: 32,
  });

  return (
    <Scene
      id="interviews"
      ariaLabel="16 глубинных интервью с HR и кандидатами"
      pin={false}
    >
      <div
        ref={revealRef}
        className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-24 lg:px-12"
      >
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
          className="mt-16 grid gap-6 sm:gap-8 lg:mt-20 lg:grid-cols-3"
        >
          {CARDS.map((card, idx) => (
            <li
              key={`${card.who}-${idx}`}
              data-stagger
              className={cn(
                "group relative flex flex-col gap-8 rounded-2xl border border-line-strong bg-fog p-8 lg:p-10",
                card.numerator === card.denominator &&
                  "border-flame/40 bg-fog ring-1 ring-flame/20"
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
                className="font-display tabular-nums leading-none text-paper"
                style={{ fontSize: "var(--text-display)" }}
                aria-label={`${card.numerator} из ${card.denominator}`}
              >
                <span
                  className={
                    card.numerator === card.denominator
                      ? "text-flame"
                      : "text-paper"
                  }
                >
                  {card.numerator}
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
          className="mt-12 grid gap-4 text-meta text-mute lg:mt-16 lg:grid-cols-2 lg:gap-12"
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
