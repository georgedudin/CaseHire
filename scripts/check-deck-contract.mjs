#!/usr/bin/env node
/**
 * Deck-contract check (landing_v2.md §2.2, §2.6 + plan decision #1).
 *
 * The v2 deck has exactly ONE scroll consumer (DeckController). Rules:
 *  1. ScrollTrigger is banned app-wide — nothing is scrubbed, everything is a
 *     fixation-gated one-shot. (v1's three independent scroll systems were
 *     the bug class this kills.)
 *  2. useReveal is retired — self-firing "top 80%" entrances violate the
 *     fixation contract.
 *  3. Slide files must not construct non-paused top-level timelines —
 *     the controller plays entrances/builds; only idle factories may run
 *     free, marked with a `// deck-contract: idle` comment on the same line.
 *
 * Scans app/, components/, lib/. /v1 is archive and exempt.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN_DIRS = ["app", "components", "lib"];
const SLIDE_DIR = join(ROOT, "components", "deck", "slides");
const EXT = /\.(ts|tsx|mts|css)$/;

const violations = [];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.test(name)) yield p;
  }
}

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const loc = `${rel}:${i + 1}`;
      if (/scrolltrigger/i.test(line) && !line.trimStart().startsWith("*")) {
        violations.push(`${loc} — ScrollTrigger is banned in v2 (one scroll consumer: DeckController)`);
      }
      if (/useReveal/.test(line)) {
        violations.push(`${loc} — useReveal is retired (fixation contract)`);
      }
      if (
        file.startsWith(SLIDE_DIR) &&
        /gsap\.timeline\s*\(/.test(line) &&
        !/paused\s*:\s*true/.test(line) &&
        !/deck-contract:\s*idle/.test(line)
      ) {
        violations.push(`${loc} — slide timelines must be paused:true (or marked \`// deck-contract: idle\`)`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error(`✗ deck-contract: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}
console.log("✓ deck-contract: clean");
