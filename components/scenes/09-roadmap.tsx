"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { CandidateIde } from "@/components/mockups/candidate-ide";
import { ProcessMatrix } from "@/components/mockups/process-matrix";
import { gsap } from "@/lib/gsap-setup";
import { cn } from "@/lib/cn";

type Milestone = {
  when: string;
  sub: string;
  title: string;
  detail: string;
  highlight?: boolean;
};

const MILESTONES: Milestone[] = [
  {
    when: "Сейчас",
    sub: "v1",
    title: "Один шаблон. Десять пилотов.",
    detail: "Найм джунов. Мы сфокусированы. Мы выпускаем.",
  },
  {
    when: "+ 6 мес",
    sub: "v2",
    title: "Больше ролей. Больше отраслей.",
    detail: "Tier 2: генерация под описание архитектуры.",
  },
  {
    when: "+ 12 мес",
    sub: "v3",
    title: "Та же инфраструктура — для ИИ-агентов.",
    detail: "Cursor. Claude Code. Devin. Та же матрица процесса.",
    highlight: true,
  },
  {
    when: "Долгосрок",
    sub: "категория",
    title: "Субстрат для оценки интеллекта на работе.",
    detail: "Кем бы он ни был.",
  },
];

export function Scene09Roadmap() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.1,
    y: 28,
  });

  const closingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = closingRef.current;
      if (!el) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const lines = el.querySelectorAll<HTMLElement>("[data-closing-line]");
      if (reduceMotion) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        lines,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.25,
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: closingRef }
  );

  return (
    <Scene id="roadmap" ariaLabel="Дорожная карта и финал">
      <div ref={revealRef} className="scene-content">
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          09 · Куда мы идём
        </p>
        <h2
          data-stagger
          className="font-display mt-6 max-w-[26ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Это не HR-инструмент.{" "}
          <span className="text-flame">Это категория.</span>
        </h2>

        {/* Timeline — stacked on mobile, 2x2 on tablet, 4 across on desktop */}
        <ol
          role="list"
          className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-3"
        >
          {MILESTONES.map((m) => (
            <li
              key={m.when}
              data-stagger
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-5 sm:p-6",
                m.highlight
                  ? "border-flame/40 bg-fog ring-1 ring-flame/30"
                  : "border-line-strong bg-fog"
              )}
            >
              <div className="flex items-baseline justify-between">
                <p
                  className={cn(
                    "text-meta uppercase tracking-[0.2em]",
                    m.highlight ? "text-flame" : "text-mute"
                  )}
                >
                  {m.when}
                </p>
                <span className="text-[10px] tabular-nums text-dim">
                  {m.sub}
                </span>
              </div>
              <h3
                className="font-display text-paper"
                style={{ fontSize: "var(--text-h2)", lineHeight: 1.1 }}
              >
                {m.title}
              </h3>
              <p className="text-meta text-mute">{m.detail}</p>
            </li>
          ))}
        </ol>

        {/* Split-scene: human vs agent */}
        <div className="mt-14 sm:mt-20">
          <p
            data-stagger
            className="mb-5 text-center text-meta uppercase tracking-[0.25em] text-mute"
          >
            Одна задача · одна матрица процесса · два испытуемых
          </p>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div data-stagger className="flex flex-col gap-4">
              <SessionLabel tone="human">
                Сессия #4173 · Анна П. · junior backend
              </SessionLabel>
              <CandidateIde compact />
              <ProcessMatrix
                title="Матрица процесса"
                subtitle="итог сессии"
              />
            </div>
            <div data-stagger className="flex flex-col gap-4">
              <SessionLabel tone="agent">
                Сессия #4174 · Claude Code · агент
              </SessionLabel>
              <CandidateIde leak compact />
              <ProcessMatrix
                title="Матрица процесса"
                subtitle="итог сессии"
                leakLabel="Калибровка ИИ"
              />
            </div>
          </div>
        </div>

        {/* Closing line */}
        <div
          ref={closingRef}
          className="mx-auto mt-20 max-w-[48ch] text-center sm:mt-28"
        >
          <p
            data-closing-line
            className="font-display text-paper"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            Результат умер.
          </p>
          <p
            data-closing-line
            className="font-display mt-4 text-paper"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            Процесс — единственное, что осталось измерять.
          </p>
          <p
            data-closing-line
            className="font-display mt-4 text-flame"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            Кем бы он ни был.
          </p>
        </div>
      </div>
    </Scene>
  );
}

function SessionLabel({
  tone,
  children,
}: {
  tone: "human" | "agent";
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest",
        tone === "human"
          ? "border-glass/40 bg-glass/10 text-glass"
          : "border-flame/40 bg-flame/10 text-flame"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "human" ? "bg-glass" : "bg-flame"
        )}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}
