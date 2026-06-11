import { cn } from "@/lib/cn";

type Position = {
  title: string;
  candidates: number;
  fresh: number;
  /**
   * Slide 9's circulation pulse lands on this card: the candidate count
   * numeral gets `[data-kanban-count]` and the «+N» badge gets
   * `[data-kanban-badge]` so GSAP can tick them (47→48, +12→+13).
   */
  pulse?: boolean;
  /** Hidden <sm — the phone budget (slide 9: kanban ≤ ~170px) keeps one card per column. */
  mobileHidden?: boolean;
};

const COLUMNS: { name: string; tone: "open" | "review" | "done"; positions: Position[] }[] = [
  {
    name: "Открыты",
    tone: "open",
    positions: [
      { title: "Junior Backend · Go", candidates: 47, fresh: 12, pulse: true },
      {
        title: "Junior Data Analyst · SQL",
        candidates: 28,
        fresh: 6,
        mobileHidden: true,
      },
    ],
  },
  {
    name: "На ревью",
    tone: "review",
    positions: [
      { title: "Junior Frontend · React", candidates: 63, fresh: 3 },
    ],
  },
  {
    name: "Закрыто",
    tone: "done",
    positions: [
      { title: "Junior QA · Python", candidates: 51, fresh: 0 },
    ],
  },
];

export function HrKanban({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Кабинет HR: канбан позиций"
      className={cn(
        "rounded-2xl border border-line-strong bg-fog p-3 shadow-2xl shadow-ink/40 sm:p-5",
        className
      )}
    >
      <header className="mb-1.5 flex items-baseline justify-between sm:mb-4">
        {/* <sm the eyebrow docks inline with the title (one ~20px row). */}
        <div className="flex min-w-0 items-baseline gap-1.5 sm:block">
          <p className="text-[10px] uppercase tracking-[0.25em] text-dim sm:text-meta">
            HR
          </p>
          <h3
            className="font-display truncate text-sm text-paper sm:mt-0.5 sm:text-[length:var(--text-h2)]"
            style={{ lineHeight: 1.1 }}
          >
            Канбан позиций
          </h3>
        </div>
        <span className="rounded-full border border-line bg-ink/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-mute">
          этот месяц
        </span>
      </header>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {COLUMNS.map((col) => (
          <div
            key={col.name}
            className="flex flex-col gap-1.5 rounded-xl border border-line bg-ink/20 p-1.5 sm:gap-2 sm:p-2.5"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
              <span
                className={cn(
                  col.tone === "open" && "text-flame",
                  col.tone === "review" && "text-glass",
                  col.tone === "done" && "text-trust"
                )}
              >
                {col.name}
              </span>
              <span className="text-dim tabular-nums">
                {col.positions.length}
              </span>
            </div>
            {col.positions.map((p) => (
              <article
                key={p.title}
                data-kanban-card={p.pulse ? "" : undefined}
                className={cn(
                  "rounded-lg border border-line bg-fog p-1.5 sm:p-2.5",
                  p.mobileHidden && "hidden sm:block"
                )}
              >
                <p className="text-[11px] leading-snug text-paper line-clamp-2 sm:text-meta sm:leading-[1.6]">
                  {p.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center justify-between gap-y-0.5 text-[10px] text-mute sm:mt-2">
                  <span className="tabular-nums">
                    <span data-kanban-count={p.pulse ? "" : undefined}>
                      {p.candidates}
                    </span>{" "}
                    кандидатов
                  </span>
                  {p.fresh > 0 && (
                    <span
                      data-kanban-badge={p.pulse ? "" : undefined}
                      className="rounded-full bg-flame/15 px-1.5 py-0.5 text-flame"
                    >
                      +{p.fresh}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
