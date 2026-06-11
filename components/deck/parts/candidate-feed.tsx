/**
 * <CandidateFeed> — ranked candidate list for slide 07 («Evidence Boot»,
 * landing_v2.md §4 slide 07). Static skeleton renders the FROZEN state:
 * RANKED order (the Flip re-rank is consumed), flame ring parked on row 1.
 *
 * Rows ~56px desktop / 40px mobile; mobile shows top-3 only (rows 4–5
 * hidden <lg per the slide 07 mobile spec).
 *
 * P3 hooks: [data-feed-row] (entrance rise + Flip re-rank), [data-rank],
 * [data-feed-score] (count-up targets), [data-feed-ring] (STATIC flame ring
 * per Director's cut — idle life belongs to the scrubber), [data-feed-warn]
 * (amber ⚠ chip on Волков С. — slide 7 warnings are amber, never red §2.4).
 */
import { cn } from "@/lib/cn";

type FeedRow = {
  rank: number;
  name: string;
  role: string;
  score: number;
  top?: boolean;
  warn?: boolean;
};

const ROWS: FeedRow[] = [
  { rank: 1, name: "Соколова А.", role: "бэкенд · Python", score: 87, top: true },
  { rank: 2, name: "Михайлов Д.", role: "бэкенд · Python", score: 74 },
  { rank: 3, name: "Ким Е.", role: "бэкенд · Python", score: 71 },
  { rank: 4, name: "Волков С.", role: "бэкенд · Python", score: 58, warn: true },
  { rank: 5, name: "Грачёва Н.", role: "бэкенд · Python", score: 52 },
];

export function CandidateFeed({ className }: { className?: string }) {
  return (
    <div
      data-feed
      className={cn(
        "rounded-2xl border border-line bg-fog p-3 lg:p-4",
        className,
      )}
    >
      <p className="mb-1.5 px-1 text-[10px] uppercase tracking-[0.2em] text-dim lg:mb-3">
        КейсПодбор · оценка
      </p>
      <ul className="space-y-1 lg:space-y-2">
        {ROWS.map((r) => (
          <li
            key={r.rank}
            data-feed-row
            data-rank={r.rank}
            data-feed-ring={r.top ? "" : undefined}
            className={cn(
              "flex min-h-[40px] items-center gap-2.5 rounded-xl border border-line bg-ink/30 px-3 lg:min-h-[56px] lg:gap-3",
              // Static flame ring on rank 1 (frozen state, Director's cut).
              r.top && "border-flame/50 ring-1 ring-flame/40",
              // Mobile: top-3 rows only (slide 07 mobile budget).
              r.rank > 3 ? "hidden lg:flex" : "flex",
            )}
          >
            <span className="w-5 shrink-0 text-center font-mono text-[11px] tabular-nums text-dim">
              {r.rank}
            </span>
            <span className="min-w-0 flex-1 truncate text-meta text-paper">
              {r.name}
            </span>
            {r.warn ? (
              <span
                data-feed-warn
                className="shrink-0 rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] leading-none text-amber-400"
              >
                ⚠
              </span>
            ) : null}
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-mute">
              {r.role}
            </span>
            <span
              data-feed-score
              className="font-display w-7 shrink-0 text-right text-base tabular-nums text-paper lg:text-lg"
            >
              {r.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
