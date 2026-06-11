/**
 * <FileChip> — the sensitive-artifact chip on slide 08 («Граница под
 * напряжением», landing_v2.md §4 slide 08).
 *
 * «customers.csv · ⚠ персональные данные». The leak-tinted BORDER is allowed
 * here only (slide 08); the warning text itself stays amber per the color
 * grammar (§2.4: amber = предупреждение, red = нарушение).
 *
 * P3 hooks: [data-chip="file"] — the build clones this node and runs it
 * across the boundary along a MotionPath arc.
 */
import { cn } from "@/lib/cn";

export function FileChip({ className }: { className?: string }) {
  return (
    <span
      data-chip="file"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-leak/40 bg-ink/40 px-2.5 py-1.5 font-mono text-[11px] leading-none",
        className,
      )}
    >
      <span className="text-paper">customers.csv</span>
      <span className="text-dim">·</span>
      <span className="text-amber-400">⚠ персональные данные</span>
    </span>
  );
}
