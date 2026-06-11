import { cn } from "@/lib/cn";

export type ProcessAxis = {
  label: string;
  /** 0..100 — fill percentage. */
  score: number;
};

/** v2 canon — the 9 verbatim axes from landing_v2.md, slide 7. */
export const DEFAULT_AXES: ProcessAxis[] = [
  { label: "понимание контекста", score: 78 },
  { label: "планирование", score: 64 },
  { label: "точность промптов", score: 71 },
  { label: "калибровка ИИ", score: 58 },
  { label: "безопасность команд", score: 82 },
  { label: "проверка", score: 69 },
  { label: "восстановление", score: 54 },
  { label: "артикуляция", score: 73 },
  { label: "цифровая гигиена", score: 89 },
];

const nf = new Intl.NumberFormat("ru-RU");

type ProcessMatrixProps = {
  title?: string;
  subtitle?: string;
  axes?: ProcessAxis[];
  /** Label of the axis to mark as leak — clamps score & turns it red. */
  leakLabel?: string;
  /**
   * Opt-in: render the bars on <sm too (4px tall). Default false — the stock
   * mobile state hides bars and shows tier chips; slides 7/8/13 opt in
   * because the fills are the money shot (landing_v2.md §5).
   */
  barsOnMobile?: boolean;
  /**
   * Opt-in GSAP mode: bar fills become inner `span[data-matrix-fill]` set via
   * `transform: scaleX()` with NO css transition, score numerals get
   * `[data-matrix-score]`, header average gets `[data-matrix-average]`.
   * Static (SSR / reduced-motion) render is the FINAL state — GSAP animates
   * from 0 on top of it.
   */
  animated?: boolean;
  /**
   * Opt-in: slide 8's desktop bottom band (Director's cut ~210px budget) —
   * p-4 chrome, eyebrow dropped, smaller title, tighter row rhythm. Default
   * false so every other call site keeps the stock rendering.
   */
  dense?: boolean;
  className?: string;
};

export function ProcessMatrix({
  title = "Матрица процесса",
  subtitle,
  axes = DEFAULT_AXES,
  leakLabel,
  barsOnMobile = false,
  animated = false,
  dense = false,
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
        "rounded-2xl border border-line-strong bg-fog shadow-2xl shadow-ink/40",
        dense ? "p-4" : "p-3 sm:p-6 lg:p-7",
        className
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-4",
          dense ? "mb-2.5" : "mb-2.5 sm:mb-5"
        )}
      >
        <div className="min-w-0">
          {!dense && (
            <p className="hidden text-meta uppercase tracking-[0.25em] text-dim sm:block">
              КейсПодбор · оценка
            </p>
          )}
          <h3
            className={cn(
              "font-display text-paper",
              dense
                ? "text-lg"
                : "text-base sm:mt-1 sm:text-[length:var(--text-h2)]"
            )}
            style={{ lineHeight: 1.1 }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-meta text-mute">{subtitle}</p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 tabular-nums text-mute",
            dense ? "text-meta" : "text-[11px] sm:text-meta"
          )}
        >
          <span data-matrix-average={animated ? "" : undefined}>
            {nf.format(averaged)}
          </span>{" "}
          / 100
        </span>
      </header>

      <ul role="list" className={dense ? "space-y-2" : "space-y-1 sm:space-y-2.5"}>
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
                  leak still reads as a red signal. Redundant (and hidden)
                  when the bars themselves show on mobile. */}
              {!barsOnMobile && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full sm:hidden",
                    tier,
                    leak && "animate-pulse"
                  )}
                />
              )}
              <span
                title={axis.label}
                className={cn(
                  "min-w-0 truncate",
                  barsOnMobile
                    ? "flex-none basis-32 text-[11px] leading-tight sm:basis-44 sm:text-meta sm:leading-[1.6] lg:basis-52"
                    : "flex-1 text-[12px] sm:flex-none sm:basis-44 sm:text-meta lg:basis-52",
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
                  "relative flex-1 overflow-hidden rounded-full bg-line",
                  barsOnMobile ? "block h-1 sm:h-2" : "hidden h-2 sm:block",
                  leak && "animate-pulse"
                )}
              >
                {animated ? (
                  <span
                    data-matrix-fill=""
                    data-axis={axis.label}
                    className={cn(
                      "absolute inset-0 block rounded-full",
                      tier
                    )}
                    style={{
                      transform: `scaleX(${finalScore / 100})`,
                      transformOrigin: "left",
                    }}
                  />
                ) : (
                  <div
                    className={cn("h-full rounded-full transition-all", tier)}
                    style={{ width: `${finalScore}%` }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "w-8 text-right font-mono text-[11px] tabular-nums",
                  leak ? "text-leak" : "text-mute"
                )}
              >
                <span
                  data-matrix-score={animated ? "" : undefined}
                  data-axis={animated ? axis.label : undefined}
                >
                  {finalScore}
                </span>
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
