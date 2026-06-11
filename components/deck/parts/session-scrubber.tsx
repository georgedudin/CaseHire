/**
 * <SessionScrubber> — session-recording scrubber for slide 07
 * (landing_v2.md §4 slide 07): 220px track, 5 event ticks, the 14:32 tick
 * amber, playhead parked AT the amber tick (frozen / reduced-motion state).
 *
 * P3 hooks: [data-playhead] (self-dragging idle: translateX across the
 * track, 8s sine loop), [data-tick="amber"] (sympathetic digest-⚠ pulse on
 * crossing), [data-tick="event"].
 */
import { cn } from "@/lib/cn";

const TICKS: { pos: number; amber?: boolean }[] = [
  { pos: 8 },
  { pos: 26 },
  { pos: 47 },
  { pos: 68, amber: true }, // 14:32 — the API-key digest moment
  { pos: 90 },
];

const PLAYHEAD_POS = 68; // parked at the 14:32 tick

export function SessionScrubber({ className }: { className?: string }) {
  return (
    <div
      data-scrubber
      aria-hidden="true"
      className={cn("relative h-4 w-[220px] shrink-0", className)}
    >
      <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-line-strong" />
      {TICKS.map((t) => (
        <span
          key={t.pos}
          data-tick={t.amber ? "amber" : "event"}
          className={cn(
            "absolute top-1/2 h-2 w-0.5 -translate-y-1/2 rounded-full",
            t.amber ? "bg-amber-400" : "bg-dim",
          )}
          style={{ left: `${t.pos}%` }}
        />
      ))}
      <span
        data-playhead
        className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-paper"
        style={{ left: `${PLAYHEAD_POS}%` }}
      />
    </div>
  );
}
