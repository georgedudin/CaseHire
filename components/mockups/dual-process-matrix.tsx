import { cn } from "@/lib/cn";

export type DualProcessAxis = {
  label: string;
  /** 0..100 — human session score (glass tick on the track). */
  human: number;
  /** 0..100 — agent session score (ember fill on the track). */
  agent: number;
};

/**
 * Slide-13 canon: same 9 axes as the v2 ProcessMatrix. Averages land on
 * human 74 · agent 81 (the «74 · 81» beat). The agent leads on
 * verification-shaped axes (проверка, точность промптов, гигиена); the
 * human leads on артикуляция and восстановление.
 */
export const DEFAULT_DUAL_AXES: DualProcessAxis[] = [
  { label: "понимание контекста", human: 76, agent: 82 },
  { label: "планирование", human: 71, agent: 84 },
  { label: "точность промптов", human: 70, agent: 88 },
  { label: "калибровка ИИ", human: 68, agent: 79 },
  { label: "безопасность команд", human: 80, agent: 86 },
  { label: "проверка", human: 66, agent: 91 },
  { label: "восстановление", human: 69, agent: 64 },
  { label: "артикуляция", human: 84, agent: 62 },
  { label: "цифровая гигиена", human: 82, agent: 90 },
];

const nf = new Intl.NumberFormat("ru-RU");

type DualProcessMatrixProps = {
  title?: string;
  subtitle?: string;
  axes?: DualProcessAxis[];
  /**
   * Render only the first N axes (slide 13 mobile shows 5 of 9). The header
   * averages stay computed over the FULL list — they are the product's
   * canonical verdict («74 · 81»), not an average of what happens to fit.
   */
  maxAxes?: number;
  className?: string;
};

/**
 * One matrix, two test subjects — the slide-13 money shot. Each axis is a
 * bullet chart: an ember fill (agent score) racing a glass tick marker
 * (human score) on the same track. Bars are ALWAYS visible (4px on phones,
 * 6px at sm+).
 *
 * GSAP hooks (static render IS the final state; GSAP animates on top):
 *   span[data-dual-agent][data-axis]        — ember fill, scaleX, origin left
 *   span[data-dual-human][data-axis]        — glass tick (2px × track height)
 *   span[data-dual-score-human][data-axis]  — per-axis human numeral
 *   span[data-dual-score-agent][data-axis]  — per-axis agent numeral
 *   span[data-dual-average-human]           — header human average
 *   span[data-dual-average-agent]           — header agent average
 * No css transitions anywhere — the slide-13 timeline owns all motion.
 */
export function DualProcessMatrix({
  title = "Матрица процесса",
  subtitle,
  axes = DEFAULT_DUAL_AXES,
  maxAxes,
  className,
}: DualProcessMatrixProps) {
  const shown = maxAxes ? axes.slice(0, maxAxes) : axes;
  const avgHuman = Math.round(
    axes.reduce((a, b) => a + b.human, 0) / axes.length
  );
  const avgAgent = Math.round(
    axes.reduce((a, b) => a + b.agent, 0) / axes.length
  );

  return (
    <div
      role="img"
      aria-label={`${title}: человек ${avgHuman} из 100, ИИ-агент ${avgAgent} из 100 — одна шкала, ${axes.length} осей`}
      className={cn(
        "rounded-2xl border border-line-strong bg-fog p-4 shadow-2xl shadow-ink/40 sm:p-5",
        className
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
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
        <div className="shrink-0 text-right">
          <p className="text-meta tabular-nums">
            <span data-dual-average-human="" className="text-glass">
              {nf.format(avgHuman)}
            </span>
            <span className="text-dim"> · </span>
            <span data-dual-average-agent="" className="text-ember">
              {nf.format(avgAgent)}
            </span>
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-widest">
            <span className="text-glass/70">человек</span>
            <span className="text-dim"> · </span>
            <span className="text-ember/70">агент</span>
          </p>
        </div>
      </header>

      <ul role="list" className="space-y-2">
        {shown.map((axis, idx) => (
          <li
            key={`${axis.label}-${idx}`}
            className="flex items-center gap-2.5"
          >
            <span
              title={axis.label}
              className="min-w-0 flex-none basis-28 truncate text-[11px] text-mute sm:basis-36 sm:text-[12px] lg:basis-44"
            >
              {axis.label}
            </span>
            {/* One track, two subjects: ember fill = agent, glass tick = human */}
            <span className="relative block h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line sm:h-1.5">
              <span
                data-dual-agent=""
                data-axis={axis.label}
                className="absolute inset-0 block rounded-full bg-ember"
                style={{
                  transform: `scaleX(${axis.agent / 100})`,
                  transformOrigin: "left",
                }}
              />
              <span
                data-dual-human=""
                data-axis={axis.label}
                className="absolute inset-y-0 w-0.5 bg-glass"
                style={{ left: `${axis.human}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums">
              <span
                data-dual-score-human=""
                data-axis={axis.label}
                className="text-glass"
              >
                {axis.human}
              </span>
              <span className="text-dim"> · </span>
              <span
                data-dual-score-agent=""
                data-axis={axis.label}
                className="text-ember"
              >
                {axis.agent}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
