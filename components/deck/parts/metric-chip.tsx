/**
 * <MetricChip> — candidate-side pilot-target metric (slide 09 «Две
 * аудитории», landing_v2.md §4 slide 09): «завершают сессию» ≥70% ·
 * «NPS кандидата» ≥40 · «фидбэк» 100%.
 *
 * P3 hooks: [data-chip="metric"] (rotateX flip-in with transformPerspective,
 * per the slide 09 Director's cut), [data-chip-value] (count-up target — the
 * inner <span>, so an optional static `prefix` like «≥» rides OUTSIDE the
 * counted node and survives count-up's per-frame textContent rewrite).
 */
import { cn } from "@/lib/cn";

export function MetricChip({
  label,
  value,
  prefix,
  className,
}: {
  label: string;
  value: string;
  prefix?: string;
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
      <p className="truncate text-[8px] uppercase tracking-[0.01em] text-dim lg:text-[11px] lg:tracking-[0.14em]">
        {label}
      </p>
      <p className="font-display mt-0.5 text-base tabular-nums text-paper lg:mt-1 lg:text-2xl">
        {prefix && <span className="text-mute">{prefix}&thinsp;</span>}
        <span data-chip-value>{value}</span>
      </p>
    </div>
  );
}
