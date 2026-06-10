"use client";

import { Scene } from "@/components/scroll/scene";
import { useReveal } from "@/components/scroll/hooks/use-reveal";
import { useCountUp } from "@/components/scroll/hooks/use-count-up";
import { cn } from "@/lib/cn";

type Tier = {
  name: string;
  price: string;
  period: string;
  limit: string;
  note: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Пилот",
    price: "15 000 ₽",
    period: "за 1 позицию",
    limit: "до 100 кандидатов",
    note: "Первое касание",
  },
  {
    name: "Команда",
    price: "49 000 ₽",
    period: "в месяц",
    limit: "5 позиций · 1 000 кандидатов",
    note: "Основной тариф",
    featured: true,
  },
  {
    name: "Рост",
    price: "149 000 ₽",
    period: "в месяц",
    limit: "20 позиций · 4 000 кандидатов",
    note: "+ расширенная аналитика",
  },
  {
    name: "Энтерпрайз",
    price: "от 400 000 ₽",
    period: "в год",
    limit: "под заказ",
    note: "+ локальное развёртывание",
  },
];

const COMPETITORS: [string, boolean, boolean, boolean, boolean, boolean, boolean][] =
  [
    ["HackerRank", true, false, false, true, false, false],
    ["Codility · Cody", true, false, false, true, false, false],
    ["CodeSignal · Cosmo", true, false, false, true, false, false],
    ["CoderPad", true, false, false, false, false, false],
    ["Karat NextGen", true, false, false, false, false, false],
    ["КейсПодбор", true, true, true, true, true, true],
  ];

const COMP_HEADERS = [
  "ИИ в среде",
  "Канал на утечки",
  "Под джунов",
  "Без живого интервьюера",
  "Кейс под позицию",
  "Локально в РФ",
];

export function Scene08Market() {
  const revealRef = useReveal<HTMLDivElement>({
    selector: "[data-stagger]",
    stagger: 0.1,
    y: 28,
  });

  const tam = useCountUp({ to: 99.3, decimals: 1, suffix: " млрд ₽" });
  const sam = useCountUp({ to: 3.85, decimals: 2, suffix: " млрд ₽" });
  const adopt = useCountUp({ to: 43, suffix: "%" });
  const planning = useCountUp({ to: 27, suffix: "%" });

  return (
    <Scene id="market" ariaLabel="Рынок, монетизация и конкуренты">
      <div ref={revealRef} className="scene-content">
        <p
          data-stagger
          className="text-meta uppercase tracking-[0.3em] text-dim"
        >
          08 · Рынок · Цена · Конкуренты
        </p>
        <h2
          data-stagger
          className="font-display mt-6 max-w-[30ch] text-paper"
          style={{ fontSize: "var(--text-display)" }}
        >
          Рынок есть.{" "}
          <span className="text-flame">Защищаемая ниша на нём — наша.</span>
        </h2>

        {/* (a) Market */}
        <section
          data-stagger
          aria-label="Рыночные оценки"
          className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-6"
        >
          <Stat
            ref={tam as React.RefObject<HTMLSpanElement>}
            label="TAM · HR-tech РФ"
            note="+38% за год · Smart Ranking"
            initial="0 млрд ₽"
            highlight
          />
          <Stat
            ref={sam as React.RefObject<HTMLSpanElement>}
            label="SAM · оценка и развитие"
            note="+38% за год · Smart Ranking"
            initial="0 млрд ₽"
          />
          <Stat
            ref={adopt as React.RefObject<HTMLSpanElement>}
            label="Уже используют ИИ в HR"
            note="Известия · 2025"
            initial="0%"
          />
          <Stat
            ref={planning as React.RefObject<HTMLSpanElement>}
            label="Тестируют для 2026"
            note="Известия · 2025"
            initial="0%"
          />
        </section>

        <p data-stagger className="mt-8 text-meta text-mute">
          <span className="text-paper">SOM 24 мес:</span> 20–35 млн ₽ годового
          дохода · 50–80 платящих компаний в среднем тарифе.
        </p>

        {/* (b) Pricing */}
        <section
          data-stagger
          aria-label="Тарифные планы"
          className="mt-14 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
        >
          {TIERS.map((t) => (
            <article
              key={t.name}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-5 sm:p-6",
                t.featured
                  ? "border-flame/50 bg-fog ring-1 ring-flame/30"
                  : "border-line-strong bg-fog"
              )}
            >
              <header className="flex items-center justify-between">
                <h3
                  className={cn(
                    "font-display",
                    t.featured ? "text-flame" : "text-paper"
                  )}
                  style={{ fontSize: "var(--text-h2)", lineHeight: 1 }}
                >
                  {t.name}
                </h3>
                {t.featured && (
                  <span className="rounded-full bg-flame px-2 py-0.5 text-[9px] uppercase tracking-widest text-ink">
                    основной
                  </span>
                )}
              </header>
              <div>
                <p
                  className="font-display tabular-nums text-paper"
                  style={{ fontSize: "var(--text-h2)", lineHeight: 1 }}
                >
                  {t.price}
                </p>
                <p className="text-meta text-mute">{t.period}</p>
              </div>
              <p className="text-meta text-mute">{t.limit}</p>
              <p className="mt-auto text-meta text-dim">{t.note}</p>
            </article>
          ))}
        </section>

        <div data-stagger className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <p className="rounded-xl border border-line-strong bg-fog p-4 text-meta text-mute">
            <span className="text-paper">Себестоимость сессии $1–3.</span>{" "}
            Контейнер + токены ИИ-напарника. Оплата только за завершённые
            сессии — не лицензионная подписка.
          </p>
          <p className="rounded-xl border border-flame/30 bg-fog p-4 text-meta text-mute">
            <span className="text-paper">Один предотвращённый плохой найм</span>{" "}
            окупает тариф «Команда»{" "}
            <span className="text-flame">на 2,5 года</span>{" "}
            (SHRM: 100% годовой зарплаты на замену).
          </p>
        </div>

        {/* (c) Competitors */}
        <section
          data-stagger
          aria-label="Конкуренты и наша защищаемая ниша"
          className="mt-14 sm:mt-20"
        >
          {/* Edge-to-edge horizontal scroll so the wide table stays readable
              on mobile without breaking the page layout. */}
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-meta">
              <thead>
                <tr className="text-mute">
                  <th className="sticky left-0 z-10 bg-ink py-3 pr-4 text-left font-normal">
                    Игрок
                  </th>
                  {COMP_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="border-b border-line px-3 py-3 text-center font-normal"
                    >
                      <span className="block max-w-[12ch]">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map(([name, ...cells]) => {
                  const isUs = name === "КейсПодбор";
                  return (
                    <tr
                      key={name as string}
                      className={cn(isUs && "bg-flame/5")}
                    >
                      <th
                        scope="row"
                        className={cn(
                          "sticky left-0 z-10 border-b border-line bg-ink py-3 pr-4 text-left font-normal",
                          isUs ? "text-flame" : "text-paper"
                        )}
                      >
                        {name}
                      </th>
                      {cells.map((has, i) => (
                        <td
                          key={`${name as string}-${i}`}
                          className="border-b border-line px-3 py-3 text-center"
                        >
                          <span
                            className={cn(
                              "inline-block",
                              has
                                ? isUs && i >= 1
                                  ? "text-flame"
                                  : "text-trust"
                                : "text-dim"
                            )}
                            aria-label={has ? "да" : "нет"}
                          >
                            {has ? "●" : "○"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p data-stagger className="mt-6 max-w-[68ch] text-lede text-mute">
            <span className="text-paper">Защищаемая ниша:</span> ловушка на
            работу с данными + ориентация на джунов + асинхронность + кейс под
            позицию + локальное развёртывание в РФ.
            <br className="hidden sm:block" />
            <span className="text-paper">Пять осей.</span> Не пересекаются ни с
            одним крупным игроком.
          </p>
        </section>
      </div>
    </Scene>
  );
}

const Stat = ({
  ref,
  label,
  note,
  initial,
  highlight,
}: {
  ref: React.RefObject<HTMLSpanElement>;
  label: string;
  note: string;
  initial: string;
  highlight?: boolean;
}) => (
  <figure className="border-t border-line-strong pt-6">
    <span
      ref={ref}
      className={cn(
        "font-display block tabular-nums",
        highlight ? "text-flame" : "text-paper"
      )}
      style={{ fontSize: "var(--text-h1)", lineHeight: 1 }}
    >
      {initial}
    </span>
    <figcaption className="mt-3 max-w-[24ch] text-meta text-mute">
      <span className="text-paper">{label}</span>
      <span className="mt-1 block text-[10px] uppercase tracking-widest text-dim">
        {note}
      </span>
    </figcaption>
  </figure>
);
