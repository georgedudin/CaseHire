"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { HrKanban } from "@/components/mockups/hr-kanban";
import { TeamleadSetup } from "@/components/mockups/teamlead-setup";
import { CandidateIde } from "@/components/mockups/candidate-ide";

/**
 * Slide 7 — Кто что заполняет.
 *
 * The B2B2C scene: two sides of the market shown explicitly side by side.
 * Buyer side = HR (canban) + Teamlead (4-layer setup).
 * Candidate side = Web IDE + two chats.
 *
 * Copy verbatim from ru_pitch.md:259–288.
 */
export function Scene07WhoFills() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.12,
    y: 28,
  });

  return (
    <Scene id="who-fills" ariaLabel="Кто что заполняет: две аудитории" pin={false}>
      <div
        ref={revealRef}
        className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-20 lg:px-12"
      >
        <p data-stagger className="text-meta uppercase tracking-[0.3em] text-dim">
          07 · Кто что заполняет
        </p>
        <h2
          data-stagger
          className="font-display mt-6 max-w-[28ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Один продукт.{" "}
          <span className="text-flame">Две аудитории первого класса.</span>
        </h2>

        {/* The 3-mockup row */}
        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[1fr_1fr_auto_1.2fr] lg:gap-6">
          {/* HR */}
          <div data-stagger className="flex flex-col gap-3">
            <Tag tone="buyer">HR · кабинет</Tag>
            <HrKanban />
            <p className="text-meta text-mute">
              Канбан позиций. Ранжированная лента кандидатов на каждой.
              Самая частая поверхность — мы спроектировали её для скорости.
            </p>
          </div>

          {/* Teamlead */}
          <div data-stagger className="flex flex-col gap-3">
            <Tag tone="buyer">Тимлид · настройка</Tag>
            <TeamleadSetup />
            <p className="text-meta text-mute">
              Заполняет четыре слоя <span className="text-paper">один раз</span>.
              Дальше — превью кейса, одобряет и забывает.
            </p>
          </div>

          {/* Divider — buyer/candidate boundary */}
          <div
            data-stagger
            aria-hidden="true"
            className="relative hidden flex-col items-center justify-center lg:flex"
          >
            <div className="h-full w-px bg-line-strong" />
            <div className="absolute flex flex-col items-center gap-2 rounded-full border border-line-strong bg-ink px-3 py-2">
              <span className="text-[9px] uppercase tracking-widest text-mute">
                заказчик
              </span>
              <span className="text-paper">↔</span>
              <span className="text-[9px] uppercase tracking-widest text-mute">
                кандидат
              </span>
            </div>
          </div>

          {/* Candidate */}
          <div data-stagger className="flex flex-col gap-3">
            <Tag tone="candidate">Кандидат · веб-IDE</Tag>
            <CandidateIde compact />
            <p className="text-meta text-mute">
              Полноценная IDE с двумя чатами. После сессии —{" "}
              <span className="text-paper">портативный артефакт-портфолио</span>
              , который он прикрепит к будущим откликам.
            </p>
            <div
              className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-line-strong bg-fog p-3 text-center text-meta"
              aria-label="Опережающие индикаторы здоровья платформы"
            >
              <Metric value="73%" label="завершили" />
              <Metric value="+58" label="NPS" />
              <Metric value="34%" label="вернулись" />
            </div>
          </div>
        </div>

        {/* B2B2C closing line */}
        <p
          data-stagger
          className="mx-auto mt-12 max-w-[64ch] text-center text-lede text-mute lg:mt-16"
        >
          <span className="text-paper">Доля завершивших и NPS кандидата —</span>{" "}
          опережающие индикаторы здоровья всей платформы. Если кандидат уходит —
          воронка иссякает, заказчик уходит за ним.
        </p>
      </div>
    </Scene>
  );
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "buyer" | "candidate";
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${
        tone === "buyer"
          ? "border-glass/30 bg-glass/10 text-glass"
          : "border-flame/30 bg-flame/10 text-flame"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "buyer" ? "bg-glass" : "bg-flame"
        }`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        className="font-display tabular-nums text-paper"
        style={{ fontSize: "var(--text-h2)", lineHeight: 1.05 }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-dim">{label}</p>
    </div>
  );
}
