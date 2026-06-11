/**
 * <MetricChip> — candidate-side health metric (slide 09 «Две аудитории»,
 * landing_v2.md §4 slide 09): «% завершивших» 84% · «лояльность» 9,1/10 ·
 * «% вернувшихся» 38%.
 *
 * P3 hooks: [data-chip="metric"] (rotateX flip-in with transformPerspective,
 * per the slide 09 Director's cut), [data-chip-value] (count-up target).
 */
import { cn } from "@/lib/cn";

export function MetricChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      data-chip="metric"
      className={cn(
        "rounded-xl border border-line bg-fog px-2 py-1.5 lg:px-4 lg:py-3",
        className,
      )}
    >
      <p className="truncate text-[9px] uppercase tracking-[0.01em] text-dim lg:text-[11px] lg:tracking-[0.14em]">
        {label}
      </p>
      <p
        data-chip-value
        className="font-display mt-0.5 text-base tabular-nums text-paper lg:mt-1 lg:text-2xl"
      >
        {value}
      </p>
    </div>
  );
}
