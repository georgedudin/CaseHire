"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { HrKanban } from "@/components/mockups/hr-kanban";
import { TeamleadSetup } from "@/components/mockups/teamlead-setup";
import { CandidateIde } from "@/components/mockups/candidate-ide";

/**
 * Slide 7 — Кто что заполняет.
 *
 * The B2B2C scene: both sides of the marketplace shown side by side.
 * Three mockup columns; a visible "buyer ↔ candidate" boundary marker
 * sits between the buyer (HR + Teamlead) and candidate columns.
 *
 * Mobile: vertical stack, boundary appears between cols 2 and 3.
 */
export function Scene07WhoFills() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.12,
    y: 28,
  });

  return (
    <Scene id="who-fills" ariaLabel="Кто что заполняет: две аудитории">
      <div ref={revealRef} className="scene-content">
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
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

        {/* Buyer section */}
        <div data-stagger className="mt-12 sm:mt-16">
          <SectionLabel tone="buyer">Сторона заказчика</SectionLabel>
          <div className="mt-5 grid gap-5 md:grid-cols-2 md:gap-5 lg:gap-6">
            <Column
              tag="HR · кабинет"
              tone="buyer"
              mockup={<HrKanban />}
              note="Канбан позиций и ранжированная лента кандидатов. Самая частая поверхность — спроектирована под скорость."
            />
            <Column
              tag="Тимлид · настройка"
              tone="buyer"
              mockup={<TeamleadSetup />}
              note={
                <>
                  Заполняет четыре слоя{" "}
                  <span className="text-paper">один раз</span>. Дальше — превью
                  кейса, одобряет и забывает.
                </>
              }
            />
          </div>
        </div>

        {/* Boundary */}
        <div
          data-stagger
          aria-hidden="true"
          className="my-10 flex items-center gap-4 sm:my-14"
        >
          <span className="h-px flex-1 bg-line-strong" />
          <span className="rounded-full border border-line-strong bg-ink px-3 py-1 text-[10px] uppercase tracking-widest text-mute">
            заказчик ↔ кандидат
          </span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        {/* Candidate section */}
        <div data-stagger>
          <SectionLabel tone="candidate">Сторона кандидата</SectionLabel>
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-6 lg:gap-8">
            <div className="flex flex-col gap-4">
              <Tag tone="candidate">Кандидат · веб-IDE</Tag>
              <CandidateIde />
            </div>
            <div className="flex flex-col gap-4">
              <Tag tone="candidate">Здоровье воронки</Tag>
              <div
                className="grid grid-cols-3 gap-2 rounded-2xl border border-line-strong bg-fog p-5 text-center text-meta"
                aria-label="Опережающие индикаторы здоровья платформы"
              >
                <Metric value="73%" label="завершили" />
                <Metric value="+58" label="NPS" />
                <Metric value="34%" label="вернулись" />
              </div>
              <p className="text-meta text-mute">
                После сессии — портативный артефакт-портфолио, который кандидат
                прикрепит к будущим откликам.
              </p>
            </div>
          </div>
        </div>

        <p
          data-stagger
          className="mx-auto mt-12 max-w-[64ch] text-center text-lede text-mute sm:mt-16"
        >
          <span className="text-paper">Доля завершивших и NPS кандидата</span>{" "}
          — опережающие индикаторы здоровья всей платформы. Уходит кандидат —
          иссякает воронка, уходит заказчик.
        </p>
      </div>
    </Scene>
  );
}

function Column({
  tag,
  tone,
  mockup,
  note,
}: {
  tag: string;
  tone: "buyer" | "candidate";
  mockup: React.ReactNode;
  note: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tag tone={tone}>{tag}</Tag>
      {mockup}
      <p className="text-meta text-mute">{note}</p>
    </div>
  );
}

function SectionLabel({
  tone,
  children,
}: {
  tone: "buyer" | "candidate";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`text-meta uppercase tracking-[0.25em] ${
        tone === "buyer" ? "text-glass" : "text-flame"
      }`}
    >
      {children}
    </p>
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
