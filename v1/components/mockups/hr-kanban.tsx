import { cn } from "@/lib/cn";

type Position = {
  title: string;
  candidates: number;
  fresh: number;
};

const COLUMNS: { name: string; tone: "open" | "review" | "done"; positions: Position[] }[] = [
  {
    name: "Открыты",
    tone: "open",
    positions: [
      { title: "Junior Backend · Go", candidates: 47, fresh: 12 },
      { title: "Junior Data Analyst · SQL", candidates: 28, fresh: 6 },
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
        "rounded-2xl border border-line-strong bg-fog p-4 shadow-2xl shadow-ink/40 sm:p-5",
        className
      )}
    >
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-meta uppercase tracking-[0.25em] text-dim">HR</p>
          <h3
            className="font-display mt-0.5 text-paper"
            style={{ fontSize: "var(--text-h2)", lineHeight: 1.1 }}
          >
            Канбан позиций
          </h3>
        </div>
        <span className="rounded-full border border-line bg-ink/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-mute">
          этот месяц
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {COLUMNS.map((col) => (
          <div
            key={col.name}
            className="flex flex-col gap-2 rounded-xl border border-line bg-ink/20 p-2.5"
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
                className="rounded-lg border border-line bg-fog p-2.5"
              >
                <p className="text-meta text-paper line-clamp-2">{p.title}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-mute">
                  <span className="tabular-nums">
                    {p.candidates} кандидатов
                  </span>
                  {p.fresh > 0 && (
                    <span className="rounded-full bg-flame/15 px-1.5 py-0.5 text-flame">
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
