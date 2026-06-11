/**
 * <CandidateFeed> — ranked candidate list for slide 07 («Evidence Boot»,
 * landing_v2.md §4 slide 07 + Director's cut).
 *
 * SSR/JSX renders the rows in RAW SUBMISSION ORDER (Михайлов → Соколова →
 * Ким → Грачёва → Волков): the entrance shows the feed visibly unranked for
 * ≥1.5s, then the one-shot Flip re-rank reorders the DOM by score. The
 * FROZEN state is RANKED — slide 07's setFrozen applies the ranked DOM order
 * instantly (no Flip), keyed off [data-sub] / [data-rank].
 *
 * Rows ~56px desktop / 40px mobile; mobile shows the top-3 candidates only
 * (Грачёва/Волков hidden <lg per the slide 07 mobile spec — they are also
 * the bottom two of the ranked order, so the mobile frame stays coherent
 * before AND after the re-rank).
 *
 * P3 hooks: [data-feed-row] (entrance rise + Flip re-rank), [data-sub]
 * (submission position), [data-rank] (ranked position), [data-feed-score]
 * (count-up targets), [data-ring] (flame ring OVERLAY on Соколова — opacity
 * 0→0.7 at the re-rank, STATIC after per Director's cut; idle life belongs
 * to the scrubber), [data-feed-warn] (amber ⚠ on Волков С. — slide 7
 * warnings are amber, never red §2.4).
 */
import { cn } from "@/lib/cn";

type FeedRow = {
  /** Raw submission position (initial DOM order). */
  sub: number;
  /** Evidence rank (post-Flip DOM order). */
  rank: number;
  name: string;
  role: string;
  score: number;
  top?: boolean;
  warn?: boolean;
};

/** Submission order — deliberately unranked (74 above 87). */
const ROWS: FeedRow[] = [
  { sub: 1, rank: 2, name: "Михайлов Д.", role: "бэкенд · Python", score: 74 },
  { sub: 2, rank: 1, name: "Соколова А.", role: "бэкенд · Python", score: 87, top: true },
  { sub: 3, rank: 3, name: "Ким Е.", role: "бэкенд · Python", score: 71 },
  { sub: 4, rank: 5, name: "Грачёва Н.", role: "бэкенд · Python", score: 52 },
  { sub: 5, rank: 4, name: "Волков С.", role: "бэкенд · Python", score: 58, warn: true },
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
      <ul data-feed-list className="space-y-1 lg:space-y-2">
        {ROWS.map((r) => (
          <li
            key={r.rank}
            data-feed-row
            data-sub={r.sub}
            data-rank={r.rank}
            className={cn(
              "relative min-h-[40px] items-center gap-2.5 rounded-xl border border-line bg-ink/30 px-3 lg:min-h-[56px] lg:gap-3",
              // Mobile: top-3 candidates only (slide 07 mobile budget).
              r.rank > 3 ? "hidden lg:flex" : "flex",
            )}
          >
            {/* Flame ring — separate overlay so GSAP can fade it (border/ring
                utilities are not opacity-animatable). SSR = visible (frozen /
                reduced-motion frame); the slide hides it pre-re-rank. */}
            {r.top ? (
              <span
                aria-hidden="true"
                data-ring
                className="pointer-events-none absolute -inset-px rounded-xl border border-flame/50 ring-1 ring-flame/40"
              />
            ) : null}
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
              data-score={r.score}
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
