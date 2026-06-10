"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { CandidateIde } from "@/components/mockups/candidate-ide";

const STEPS = [
  {
    n: "01",
    actor: "Тимлид",
    duration: "Один раз",
    title: "Описывает 4 слоя",
    points: [
      "Стек или архитектура — паттерн или абзац описания.",
      "Идентичность команды — 5–7 ответов «как мы работаем».",
      "Бизнес-контекст — что строит компания, в 7 строках.",
      "Задача под позицию — 1–3 строки самой ценной работы джуна.",
    ],
    aside: "Никакой выгрузки базы кода. Никакой синхронизации с Atlassian.",
  },
  {
    n: "02",
    actor: "Кандидат",
    duration: "30 секунд",
    title: "Заходит в веб-IDE",
    points: [
      "Кликает по ссылке из отклика.",
      "Через 30 секунд внутри полноценной веб-IDE.",
      "Синтетическая база, живая БД, сервисы-заглушки.",
      "ИИ-напарник в чате — знает базу кода и команду.",
    ],
    aside: "Работает, как в первый день в офисе.",
  },
  {
    n: "03",
    actor: "Платформа",
    duration: "Каждое действие",
    title: "Записывает процесс",
    points: [
      "Какие файлы открыл первыми.",
      "Какие вопросы задал двум чатам.",
      "Какие тесты прогнал, где остановился перед опасной командой.",
      "Где ИИ наврал — и заметил ли он.",
    ],
    aside: "Тимлид получает не код. А ранжированную ленту, матрицу процесса и кнопку «посмотреть запись сессии».",
  },
] as const;

/**
 * Slide 5 — Как это работает.
 *
 * Three-step flow (Teamlead → Candidate → Platform) above a preview of
 * the candidate IDE mockup. Copy lifted from ru_pitch.md:189–209.
 *
 * Desktop: 3-column grid + IDE below as a tilted preview.
 * Mobile: vertical stack, IDE in compact mode.
 */
export function Scene05HowItWorks() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.1,
    y: 28,
  });

  return (
    <Scene id="how-it-works" ariaLabel="Как это работает: три шага" pin={false}>
      <div
        ref={revealRef}
        className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-24 lg:px-12"
      >
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          05 · Как это работает
        </p>
        <h2
          data-stagger
          className="font-display mt-6 max-w-[26ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Три шага. Один проход.{" "}
          <span className="text-mute">Без интеграций.</span>
        </h2>

        <ol
          role="list"
          className="mt-14 grid gap-6 sm:gap-8 lg:mt-20 lg:grid-cols-3"
        >
          {STEPS.map((step) => (
            <li
              key={step.n}
              data-stagger
              className="relative flex flex-col gap-5 rounded-2xl border border-line-strong bg-fog p-7 lg:p-8"
            >
              <header className="flex items-baseline justify-between">
                <span
                  className="font-display text-flame tabular-nums"
                  style={{ fontSize: "var(--text-h2)" }}
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <span className="text-meta uppercase tracking-[0.2em] text-dim">
                  {step.duration}
                </span>
              </header>

              <div>
                <p className="text-meta uppercase tracking-[0.2em] text-mute">
                  {step.actor}
                </p>
                <h3
                  className="font-display mt-1 text-paper"
                  style={{ fontSize: "var(--text-h2)", lineHeight: 1.1 }}
                >
                  {step.title}
                </h3>
              </div>

              <ul className="space-y-2 text-meta text-mute">
                {step.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-flame">
                      ·
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-auto border-t border-line pt-4 text-meta italic text-mute">
                {step.aside}
              </p>
            </li>
          ))}
        </ol>

        {/* IDE preview */}
        <div
          data-stagger
          aria-hidden="true"
          className="mt-14 hidden lg:block"
        >
          <CandidateIde className="mx-auto max-w-5xl" />
        </div>
      </div>
    </Scene>
  );
}
