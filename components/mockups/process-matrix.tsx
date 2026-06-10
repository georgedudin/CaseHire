import { cn } from "@/lib/cn";

export type ProcessAxis = {
  label: string;
  /** 0..100 — fill percentage. */
  score: number;
};

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
  /** Label of the axis to mark as leak — clamps score & turns it red. */
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
  const averaged = Math.round(
    axes.reduce((a, b) => a + b.score, 0) / axes.length
  );

  return (
    <div
      role="img"
      aria-label={`${title}: ${axes.length} осей оценки процесса`}
      className={cn(
        "rounded-2xl border border-line-strong bg-fog p-5 shadow-2xl shadow-ink/40 sm:p-6 lg:p-7",
        className
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
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
        <span className="shrink-0 text-meta tabular-nums text-mute">
          {averaged} / 100
        </span>
      </header>

      <ul role="list" className="space-y-2.5">
        {axes.map((axis, idx) => {
          const leak = leakLabel && axis.label === leakLabel;
          const finalScore = leak ? Math.min(axis.score, 18) : axis.score;
          const tier = colorFor(finalScore);
          return (
            <li
              key={`${axis.label}-${idx}`}
              className="flex items-center gap-3"
            >
              {/* Tier chip — visible on phone where the bar is hidden, so the
                  leak still reads as a red signal. */}
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full sm:hidden",
                  tier,
                  leak && "animate-pulse"
                )}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-meta sm:flex-none sm:basis-44 lg:basis-52",
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
                  "relative hidden h-2 flex-1 overflow-hidden rounded-full bg-line sm:block",
                  leak && "animate-pulse"
                )}
              >
                <div
                  className={cn("h-full rounded-full transition-all", tier)}
                  style={{ width: `${finalScore}%` }}
                />
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
