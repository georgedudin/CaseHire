import { cn } from "@/lib/cn";

export type ProcessAxis = {
  label: string;
  /** 0..100 — fill percentage. */
  score: number;
  /** Pulse the bar (e.g. OPSEC leak detected). */
  pulse?: boolean;
};

/**
 * Canonical 10-axis process matrix used to score candidates' WAY of working.
 * Order matches `project_casehire_studio.md` memory and ru_product.md §
 * "Candidate card".
 */
export const DEFAULT_AXES: ProcessAxis[] = [
  { label: "Контекст-литеральность", score: 78 },
  { label: "Планирование", score: 64 },
  { label: "Специфичность промптов", score: 71 },
  { label: "Калибровка ИИ", score: 58 },
  { label: "Безопасность команд", score: 82 },
  { label: "Верификация", score: 69 },
  { label: "Восстановление", score: 54 },
  { label: "Артикуляция", score: 73 },
  { label: "Бизнес-литеральность", score: 47 },
  { label: "Цифровая гигиена", score: 89 },
];

type ProcessMatrixProps = {
  title?: string;
  subtitle?: string;
  axes?: ProcessAxis[];
  /** Highlight specific axis label (e.g. "Цифровая гигиена" → red pulse). */
  leakLabel?: string;
  className?: string;
};

export function ProcessMatrix({
  title = "Матрица процесса",
  subtitle,
  axes = DEFAULT_AXES,
  leakLabel,
  className,
}: ProcessMatrixProps) {
  return (
    <div
      role="img"
      aria-label={`${title}: ${axes.length} осей оценки процесса`}
      className={cn(
        "rounded-2xl border border-line-strong bg-fog p-5 shadow-2xl shadow-ink/40 sm:p-6 lg:p-7",
        className
      )}
    >
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <p className="text-meta uppercase tracking-[0.25em] text-dim">
            КейсПодбор · оценка
          </p>
          <h3
            className="font-display mt-1 text-paper"
            style={{ fontSize: "var(--text-h2)", lineHeight: 1.1 }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-meta text-mute">{subtitle}</p>
          )}
        </div>
        <span className="text-meta tabular-nums text-mute">
          {Math.round(
            axes.reduce((a, b) => a + b.score, 0) / axes.length
          )}{" "}
          / 100
        </span>
      </header>

      <ul role="list" className="space-y-2.5">
        {axes.map((axis, idx) => {
          const leak = leakLabel && axis.label === leakLabel;
          const finalScore = leak ? Math.min(axis.score, 18) : axis.score;
          const tier = colorFor(finalScore);
          return (
            <li key={`${axis.label}-${idx}`} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="grid grid-cols-[minmax(120px,180px)_minmax(0,1fr)] items-center gap-3">
                <span
                  className={cn(
                    "text-meta",
                    leak ? "text-leak" : "text-mute"
                  )}
                >
                  {axis.label}
                  {leak && (
                    <span className="ml-1.5 text-[10px] uppercase tracking-widest">
                      утечка
                    </span>
                  )}
                </span>
                <div
                  className={cn(
                    "relative h-2 overflow-hidden rounded-full bg-line",
                    leak && "animate-pulse"
                  )}
                >
                  <div
                    className={cn("h-full rounded-full transition-all", tier)}
                    style={{ width: `${finalScore}%` }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  "w-8 text-right font-mono text-[11px] tabular-nums",
                  leak ? "text-leak" : "text-mute"
                )}
              >
                {finalScore}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function colorFor(score: number): string {
  if (score >= 70) return "bg-trust";
  if (score >= 40) return "bg-flame";
  return "bg-leak";
}
