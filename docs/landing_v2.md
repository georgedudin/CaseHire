# CaseHire Landing v2 — «Дека» · Design Spec

> The landing is a 13-slide Apple-keynote-style web deck. Source-of-truth chain: `product.md` (facts) → `ru_pitch_v2.md` (slide copy, verbatim, + speech timing) → **this file** (layout, motion, transitions, implementation contract). When the deck changes, this file changes with it.
>
> Provenance: 13 slide concepts were designed by parallel design agents (one per slide), then adversarially reviewed by a feasibility critic (GSAP/fps/viewport) and a narrative critic (escalation/variety/transitions). §4 carries the designs; every **«Director's cut»** block inside §4, and everything in §1–§3, is **binding** and overrides anything it contradicts in the agent text above it.

---

## 0 · Scope rails

- **Form factors:** phone (≤640, design at 375×~660 svh), laptop (1366×768), PC (1920×1080). The 640–1023 tablet band must not break; no design effort there.
- **One slide = one viewport.** Zero internal scrolling on any slide at any target size. Every slide spec carries its own vertical budget; §7 verifies them.
- **Copy:** all audience-facing strings are Russian, verbatim from `ru_pitch_v2.md`. Product-mockup chrome may contain code/paths. No new audience-facing English.
- **Keyboard nav is first-class:** → / ← / ↓ / ↑ / PgDn / PgUp / Home / End. The hero teaches it with keycap chrome.
- **Stack:** Next.js 16.2.9 · Tailwind 4 · GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, MorphSVG, Flip, MotionPath — all free) · Lenis 1.3 with the canonical glue (`lib/gsap-setup.ts` registers at module load; single RAF via `gsap.ticker`; `autoRaf:false`).

---

## 1 · Deck architecture

### 1.1 Slide shell & snap

Every slide is `<section class="slide">` — `height:100svh; width:100%; position:relative; overflow:hidden; contain:layout paint;` on `bg-ink` (slide 5 overrides to `#000`). The v1 flow-vs-pin dichotomy is retired for v2: **the deck is all fixed viewports by design**, and the v1 overflow bugs are solved by per-slide vertical budgets (§4), not by letting content flow. The flow-default memory rail applies to scroll-narrative sites; a deck is the case where pin-everything is correct *because every slide is designed to fit*.

Snap: Lenis-driven magnetism (already shipped on `feat/landing-v2`) snaps scroll to slide boundaries. Wheel/touch and keyboard both land on exact slide tops.

Padding: the deck does NOT use the v1 `.scene-content` 144px block-padding ladder. Deck slides use `.slide-content`: `max-width:80rem; margin-inline:auto; padding-inline:1.25rem/2rem/3rem; padding-block:2rem` base with per-slide overrides (`py-8`…`py-12`) as specced in §4. Vertical centering via flex on the slide stage.

### 1.2 Fixation contract (deck controller)

**Nothing animates while the viewport moves. No exceptions.** One deck controller owns the rule:

- A slide is **fixed** when its top is within ±2px of viewport top AND |Lenis velocity| < 0.05 for ≥100ms. The controller then emits `slide:fixed(id)`.
- Each scene registers exactly one **paused** master timeline; the controller `.play()`s it on `slide:fixed`. Scenes never create their own play-on-scroll ScrollTriggers for entrance choreography.
- On `slide:leave` (slide top crosses 15% out of viewport): the controller kills all idle loops and **`gsap.set`s the scene to its frozen state** (§1.4). Sets are instant — invisible during scroll, zero animation during travel.
- Slide 1 is the load case: its timeline plays after `document.fonts.ready` + 0.3s ink hold, no snap involved.

### 1.3 Build steps — one shared controller

Exactly **six slides carry an internal build step: 3, 6, 8, 10, 11, 13** *(amended 2026-06-12: slide 3's antithesis was promoted from a 4s auto-chain timer back to a gesture-gated build — user decision; the presenter wants the dim on a keypress/scroll, never on a clock)*. Slide 12 still auto-chains its second beat on a timer — see its Director's cut. (Build-step inflation was the #1 on-stage risk flagged in review; the mnemonic absorbs the sixth: "парадокс, продукт, деньги и финал".)

All five consume ONE shared `usePinnedBuild()` controller — never bespoke pin code per scene:

- Pin span `+=100%` with a single internal snap point at progress 0.5; Lenis snap includes it.
- **Gesture contract:** gesture 1 → if entrance timeline unfinished, jump it to end, then play the build (one-shot, never scrubbed); gesture 2 → exit the slide. → key maps identically. ← inside a pinned scene exits to the previous slide's frozen state — it never rewinds a build.
- Double-gesture debounce: input is swallowed until the build timeline completes.
- Below `lg` (no pin): the build auto-chains N seconds after entrance settles (N per slide spec), and the chained timeline is **killed in `onLeave`** — a fast scroller never gets builds firing off-screen. *Amended 2026-06-12:* a **tap on the current build slide is now a first-class <lg gesture** (finishes the entrance, else plays the pending build; taps never navigate). Slides **3 and 13 set `autoChainMs: 0`** — their builds fire ONLY on gesture/tap, never on a timer; 6/8/10/11 keep their timers (a tap simply beats the clock).
- `prefers-reduced-motion`: no pin, no auto-chain — the slide renders instantly in its final post-build state.

### 1.4 Frozen state & reverse traversal (binding)

During the 5-minute Q&A the speaker WILL navigate backwards. The global rule:

- Entrance timelines play **once per visit**. After settle (or after build, if consumed) the slide's end state is its **frozen state**.
- Re-entry from either direction shows the frozen state **instantly** (no replay of entrance) and restarts idle loops only.
- There is **no time-based dormancy reset** (amended during P1 verification, 2026-06-11 — the 2s reset would have made every Q&A back-jump replay entrances, since real back-jumps happen minutes later): a consumed slide stays frozen for the session's lifetime; rehearsal replays via page reload. Slides flung past without ever fixing stay dormant and play their entrance on first fixation.
- Frozen states per slide are listed in §3's registry; builds, once consumed, stay consumed for the session.

### 1.5 Layers & persistent chrome

Z-stack per slide: background layer (ink / gradients, opacity-only) → content layer → overlay layer (flare, flash, refrain — absolutely positioned INSIDE the slide; never `position:fixed`, because `contain:paint` on the shell makes fixed descendants scene-contained anyway).

Deck chrome (the only cross-slide fixed UI, mounted outside the slides): right-edge progress rail of 13 dots (current dot flame, clickable, `aria-label` per slide), bottom-left counter «01 / 13» in `text-meta dim`. Chrome hides on slide 5 (the black flash slide) and during slide 13's Act II via opacity. No other element crosses slide boundaries.

---

## 2 · Motion language

### 2.1 Tokens

- **Easings:** entrances `expo.out`; structural moves `power2.inOut` / `--ease-in-out-quart`; pops `back.out(1.4–2)`; physical drops `power3.in`. Never `bounce` except the slide-3 needle (≤3°).
- **Durations:** element entrance 0.4–0.9s; full entrance scenario settles ≤4.0s (target ≤3.6s); build one-shots ≤3.2s.
- **Staggers:** 0.04–0.18s. Grid staggers use GSAP `stagger:{grid}` over the FULL grid (see slide 2 cut).
- **Properties:** transform / opacity / SVG stroke (DrawSVG, dashoffset) only. No animated blur/filters, no width/height/box-shadow tweens. Bars are `scaleX` on inner spans, counters write `textContent`.
- Numbers format via `Intl.NumberFormat("ru-RU")` (thin-space thousands, comma decimals), `tabular-nums` everywhere a digit moves.

### 2.2 Count-ups: paused mode only (binding refactor)

The v1 `useCountUp` fires its own ScrollTrigger at `top 80%` — i.e. **before fixation**, which breaks the deck contract on six slides. **Refactor first, before any scene work:** `useCountUp` v2 returns a paused tween (or an `add(tl, position)` helper); the scene's master timeline owns playback; the internal ScrollTrigger is deleted. All v2 call sites use this mode; a grep check in CI asserts no scene file constructs a ScrollTrigger-driven counter.

### 2.3 Mechanic ownership registry (binding)

One signature mechanic per slide; nobody borrows:

| Mechanic | Owner | Everyone else |
|---|---|---|
| Char-level disintegration (SplitText chars) | 1 | — |
| Grid burn / particle ash | 2 | slide 1 idle embers only |
| Diverging bars + stuck gauge | 3 | — |
| Pip/tally sync + breathing flame ring (idle) | 4 | ring also on 13 (callback); static everywhere else |
| Convergence → flash | 5 | — |
| **Caret typing** | **6 (seed line)** | **13 (dual code reveal — line-level, thesis-bearing). Banned on 4 (masked line-rise) and 12 (highlighter sweep).** |
| FLIP reorder | 7 | — |
| Full-bleed red flare + shake | 8 | — |
| MotionPath orb crossing a boundary | 9 | 8's chip travel is an arc, different register (violation vs circulation) |
| Camera zoom (SVG group scale) | 10 | — |
| Physical beam/scale rotation | 11 | — |
| Stamp wall (✗/✓ slams) | 12 | slam grammar otherwise reserved to: 8 leak flag, 11 verdict, 13 epitaph |
| Dual-fill matrix + epitaph overlay | 13 | — |

**Stamp grammar reservation:** notary-slam (scale 1.4–1.6→1 + rotation settle + jolt) appears ONLY at: slide 8 leak flag, slide 11 «2,5 года» verdict, slide 12 ✗/✓ wall, slide 13 epitaph lines. Slide 3's Shopify/Coinbase chips fade in with rotation PRE-SET; slide 10's SOM goal fades up.

### 2.4 Color escalation grammar (binding)

`amber = предупреждение` (slides 6, 7 file tags & digests) → `red #ef4444 = нарушение` — **red's first pixel on screen is slide 8's flare.** Slide 6's PII tag is amber and reads «⚠ персональные данные» (not English). Slide 12's ✗ are dim gray. Full-bleed red exists only on slide 8.

### 2.5 Idle-state rules

Every slide settles into 1–3 subtle loops (≤0.15 opacity amplitude or ≤4% scale), all registered with the controller and killed on `slide:leave` + `document.hidden`. Breathing flame ring idle belongs to slides 4 and 13 only (7's ring and 12's row border are static — their slides already have living elements: the self-dragging scrubber, the random ✓ pulse).

### 2.6 No exit animations (binding)

No slide animates on the way out. Exit = frozen state + instant `gsap.set` adjustments in `onLeave` (slide 1 sets its spotlight dimmer; slide 8 reaches near-neutral via a timed post-build idle beat ~2s after the leak, so its freeze-frame is already cool). The three exit tweens proposed in agent specs (1, 8, 12) are deleted.

---

## 3 · Transition map & gesture contract

All 12 boundaries are **static-cut + semantic handoff**: the outgoing frozen frame composes against the incoming entrance. No DOM crosses a boundary.

| # | Boundary | Outgoing frozen frame | Handoff (what the eye/brain carries) |
|---|---|---|---|
| 1→2 | hero → боль | Headline, «результат» at 0.85, spotlight pre-dimmed via onLeave set | Char-dust of «результат» → tile-ash of the market: same ember language, escalated word→world |
| 2→3 | боль → почему сейчас | Scorched field: 40 lit tiles / 60 husks, counters at −60/7/+30 | Columnar tile rhythm primes bar-chart grammar; same ink, «next exhibit» |
| 3→4 | почему → интервью | Dimmed cards + gesture-built antithesis line, «нет.» in flame, static | «Инструмента нет» → «мы спросили 16 человек»: dots answer the missing instrument (verbal handoff, no cross-fade) |
| 4→5 | интервью → раскрытие | Flame-ringed 8/8 card + ember «Две стороны.» | Hard luminance drop to true black; retinal afterglow of the embers primes the flash |
| 5→6 | раскрытие → генератор | Wordmark + breathing ember glow | Chromatic only: ember glow → flame caret of the generator's input line |
| 6→7 | генератор → карточка | Built world, trace ticker frozen mid-tick | Recording → evidence: 7 boots bottom-up; its first beat reuses the trace-chip mono vocabulary |
| 7→8 | карточка → ловушка | Ranked feed + amber ⚠ digest «…14:32» | Eyes parked on the amber ⚠ — slide 8 pays it off in red |
| 8→9 | ловушка → аудитории | Post-leak, boundary already cooled to near-neutral (timed idle beat), vignette 0.06 | Same boundary-line geometry repurposed: violation → legitimate circulation; 9 opens with zero red |
| 9→10 | аудитории → рынок | Drawn boundary line, settled mockups, metrics at value | **Line → arc (canonical):** same 1px stroke weight, same draw direction; boundary becomes horizon |
| 10→11 | рынок → деньги | Dived state: flame-ringed «20–35 млн ₽» + kicker | Money register continuity: flame ring → «Команда» card ring; ru-RU numerals carry |
| 11→12 | деньги → конкуренты | Tipped beam + «2,5 года» stamp | Stamping cadence: the notary continues down a ledger (11's verdict → 12's ✗/✓ wall) |
| 12→13 | конкуренты → финал | Full table, dimmed rivals, lit pentagon + verdict (auto-chained) | Closed pentagon → line forward: 13's entrance draws the timeline; flame travels verdict → «+12 мес» ring |
| 13 | финал | Near-black, three refrain lines, static ember | Deck ends in stillness; further gestures no-op |

**Gesture map (presenter contract, amended 2026-06-12):** slides 1, 2, 4, 5, 7, 9, 12 → one gesture each. Slides **3, 6, 8, 10, 11, 13** → two gestures (build, then exit) — **18 gestures** to the built finale. Mnemonic for the speaker: *«парадокс, продукт, деньги и финал — по два нажатия»* (3 paradox, 6/8 product demo, 10/11 money, 13 finale). → always does the safe thing (finish entrance → play build → advance). Home/End jump to frozen states.

**Frozen-state registry:** 1 headline+ghost word · 2 scorched field · 3 built: antithesis over dimmed cards / settled: undimmed evidence (build pending) · 4 verdict wall, ring breathing · 5 wordmark+glow · 6 built world+ticker · 7 ranked feed (re-rank consumed) · 8 post-leak wounded-cool · 9 circulating boundary · 10 dived клин view · 11 tipped scale+stamp · 12 table+quote+pentagon · 13 refrain epitaph.

---

## 4 · Per-slide specs

> Agent design first (full fidelity), then the binding **Director's cut**. Where they conflict, the cut wins.


### Slide 01 — Титул · «Сигнал затухает»

**Intent & copy.** The deck opens by *demonstrating* its thesis typographically: the word «результат» literally stops being a signal. On-screen copy, verbatim from ru_pitch_v2.md: eyebrow «КейсПодбор · CaseHire», headline «Найм джунов в эпоху, когда результат больше не сигнал.», tagline «Защита продукта · 2026», and the scroll/keyboard chrome «↓ листайте» (carried over from v1, plus keycap glyphs `↓` `→`). No numbers, no logos — the 97% / 0 из 32 live in the speech only. One accent per slide: the decaying word.

**Layout — desktop (1366/1920).** Single centered column on ink. Spotlight: absolute radial-gradient div, `rgba(255,90,31,0.18)` → transparent at ~60%, ~140vmin diameter, centered slightly above mid. Eyebrow at top of block (`text-meta`, uppercase, `tracking-[0.32em]`, mute), 40px above headline. `<h1>` in Manrope at `--text-hero` (≈96–120px at 1920, ≈84px at 1366), `max-w-[18ch]`, natural wrap to 3 lines: «Найм джунов в эпоху,» / «когда результат» / «больше не сигнал.» Base color paper; ONLY the word «результат» is a flame span (`#ff5a1f`) — tighter focus than v1's whole-clause flame. Directly under «результат», hugging its width (~5–7ch), a 2px SVG waveform path (flame at 50% opacity): 4 sine periods ending in a flat segment. Tagline 56px below headline (`text-meta`, `tracking-[0.2em]`, dim). Bottom-center, 32px from edge: «↓ листайте» with two 22px keycap chips (`↓`, `→`) — 1px line-strong border, fog fill, dim glyphs — signaling keyboard nav is first-class.

**Layout — mobile (375×~660svh).** Same column, `px-5`. `--text-hero` clamps to 44px; headline wraps to 4–5 lines and stays under ~280px tall — comfortable inside svh with eyebrow/tagline. Spotlight shrinks to ~110vmin. Waveform scales with the word (it's positioned by a wrapper span, not absolute page coords). Keycaps drop; only «↓ листайте» remains. A `@media (max-height: 600px)` guard steps the h1 down one clamp stop (`--text-display`) so nothing clips.

**Signature wow-moment.** ~2.2s in, the flame word «результат» disintegrates char-by-char — each glyph drifts down, tilts, and dims to an ember-ghost while the waveform beneath it flatlines — then the chars pull back into place, but only to 0.85 opacity. The word never fully recovers. Judges watch the title prove itself before the speaker says a word.

**Animation timeline.** (fires after snap-fixation; slide 1 = after load + `document.fonts.ready`, with a 0.3s black hold)
1. t=0.0, 1.2s, `sine.out`: spotlight `opacity 0 → 0.6` (transform-free fade on the gradient div).
2. t=0.2, 0.9s, `expo.out`: eyebrow `y:24→0, opacity 0→1`.
3. t=0.5, 1.1s, `expo.out`, stagger 0.12s: headline — SplitText by *lines*, each line in an `overflow:hidden` mask wrapper, `yPercent:110→0`. Flame span included in its line; no separate entrance.
4. t=1.6, 0.7s, `power2.out`: tagline + keycap chrome `y:16→0, opacity 0→1`. Headline is now fully readable.
5. t=2.2, 0.8s, `power3.in`, per-char random stagger 0–0.35s: **decay** — SplitText *chars* of «результат» (9 glyphs): `y:+10px, rotation: random(-4°,4°), opacity → 0.28`. Simultaneously DrawSVG runs the waveform 0%→100% (sine draws, ends flat) and its stroke opacity drops to 0.25 on the flat tail.
6. t=3.0, 0.3s hold at ghost state.
7. t=3.3, 0.6s, `expo.out`, stagger 0.05s: **reform** — chars return to `y:0, rotation:0`, but opacity settles at **0.85**, waveform back to 50%. Stable, fully readable by **t≈3.9s**. ✓ under the 4s bar.

**Idle state.** Three quiet loops, all killed by ScrollTrigger `onLeave` (fixes the v1 "spotlight pulses into scene 02" bug): (a) spotlight breathes `0.55 ↔ 0.8`, 4s, `sine.inOut`, yoyo; (b) the decay-reform cycle (beats 5–7, compressed to 1.6s total) repeats every ~7s with a 5.4s solid hold — over the 30s slide it fires ~3 times, so it's statistically alive when the speaker lands «Результат больше не сигнал»; (c) keycaps pulse opacity `0.5↔1`, 2.4s, CSS.

**Build steps.** None. The title earns stillness; the build budget belongs to slide 8.

**Product-UX elements.** None — deliberately. The deck's only mockup-free slide besides 5; the product first appears at slide 6's generator. The keycap chrome is the one "UI" element, teaching judges the deck is keyboard-driven.

**Transition in.** Cold open: 0.3s pure-ink hold after fonts resolve, then beat 1. No Lenis movement involved — this is the load scenario.

**Transition out.** On scroll/→ away: all idle loops `kill()`ed instantly; an exit micro-tween (0.35s, only if motion budget allows during pre-snap) dims the spotlight to 0.35 so slide 2 receives a darker ink, ready for its tile-field to materialize. The ember-ghost chars of «результат» are the visual foreshadow of slide 2's burning vacancy tiles — same flame→ash language, different mechanic (char decay here, tile combustion there; no overlap).

**Reduced motion.** Everything renders at final static state instantly: headline full, «результат» at full flame opacity (not 0.85 — no implied motion), waveform shown as a static drawn sine-to-flat at 50% stroke opacity, spotlight fixed at 0.6, no loops, keycaps static.

**Implementation notes.** `components/scenes/01-hero.tsx` rewrite. GSAP: SplitText (`type:"lines"` masked + nested `type:"chars"` on the flame span only — 9 spans, trivial), DrawSVG (one path), one master `gsap.timeline`. Gate SplitText behind `document.fonts.ready` and revert/re-split on debounced resize. Accessibility: `aria-label` with the full headline on `<h1>`, `aria-hidden` on split spans. Perf: animate only `transform`/`opacity`/stroke; `will-change: transform` on the 9 char spans during loops only; spotlight is a single composited layer (opacity tweens, never gradient repaints). Remove v1's `overflow-hidden` from the stage so «↓ листайте» never clips on short viewports (per landing.md 4.1 issues).

**Risks.** (1) Font-load reflow breaking SplitText metrics — mitigated by `fonts.ready` gate + Manrope/Inter preload via next/font (both Cyrillic-confirmed). (2) 1366×768 vertical squeeze: 3 headline lines at max clamp + chrome ≈ 620px — fits; the `max-height` clamp step is the safety net. (3) Idle decay loop firing exactly mid-glance and reading as a glitch — mitigated by the 5.4s solid hold (word is fully legible >75% of the time) and by reform always completing in 0.6s. (4) Loop bleed into slide 2 — explicitly killed `onLeave`. (5) Char-span layout shift on split — chars are `display:inline-block` with fixed advance from the original glyph boxes; no kerning jump because the split happens once, pre-animation, while opacity is still building.


**Director's cut (binding).**
- **No exit tween.** The 0.35s spotlight dim during pre-snap violates §2.6 — replace with `gsap.set(spotlight, {opacity:0.35})` inside `onLeave` (instant, invisible during scroll).
- **Waveform = two paths** sharing one endpoint (sine segment + flat segment): DrawSVG sequences them; the flat path gets its own opacity tween (per-segment stroke opacity on one path isn't a thing). Keep the SVG a SIBLING positioned off the flame span's wrapper, outside the SplitText target, so `revert()`/re-split never touches it.
- Idle decay-reform loop and keycap pulse register with the deck controller (§2.5) and die in `onLeave`.

---

### Slide 02 — Боль: рынок обвалился · «Выжженное поле»

**Intent & copy.** The judge must *see* the market collapse, not read about it. 100 anonymous vacancy tiles = the 2022 entry-level market; 60 of them burn out in a wave while the counter ticks down in sync — statistics become a physical event. On-screen copy, verbatim: eyebrow «02 · Боль»; headline «Что не так с джунами в 2026?»; stat 1 «−60%» + «вакансий начального уровня с 2022 года · IEEE Spectrum»; stat 2 «7%» + «доля выпускников в найме крупных технокомпаний, −25% за год · SignalFire 2025»; closer «Безработица среди свежих выпускников: +30% с осени 2022.» Tiles carry no text — only 3 skeleton bars each (a ghost of a job posting), so no audience-facing English appears.

**Layout — desktop (1366/1920).** `.scene-content` (max-w 80rem), vertically centered. Row 1: eyebrow + headline (`--text-display`, font-display), full width, left-aligned. Row 2: two-column grid `lg:grid-cols-[minmax(380px,1fr)_minmax(340px,420px)] gap-x-16`. Left cell — THE FIELD: 10×10 CSS grid, tile `~34px` (1366) / `~44px` (1920), gap 6px → ~394/494px square. Each tile: `bg-fog`, `border-line`, `rounded-[4px]`, 3 inner 2px skeleton bars in `line-strong`; plus a pre-rendered absolutely-positioned ember-overlay div (gradient flame/ember, opacity 0) for the flash. Right cell — stats stacked: «−60%» (`--text-hero`, `text-flame`, tabular-nums) over caption (`text-lede text-mute`, source in `text-dim`); below, «7%» (`--text-hero`, `text-paper`) + caption. Row 3: closer line «Безработица среди свежих выпускников: +30% с осени 2022.» (`text-lede text-paper`, «+30%» bold), full width under the grid. Vertical budget at 768: ~64 headline + 24 + ~400 field + 24 + 32 closer ≈ 544px — comfortable.

**Layout — mobile (375 × ~660 svh).** Single column, `py-12` (not the 5rem ladder — height-critical). Order: eyebrow + headline (~96px, headline wraps to 2 lines at clamp floor) → field 10×10 at 24px tiles, gap 4px (~276px, centered) → stats as a 2-col row (`grid-cols-2`), numbers at hero clamp floor 44px so «−60%» and «7%» sit side by side (~110px with captions clamped to 2 lines, sources `text-meta`) → closer (~40px). Total ≈ 620px incl. gaps. Below 640px svh: container query steps tiles to 20px and hides skeleton bars (plain tiles). Skeleton bars also drop `<sm` to cut paint cost. The 640–1023 band inherits the mobile stack at larger clamps — no bespoke work, no overlap (fixes the documented v1 sm–md bleed by keeping stats 2-col from 480px up).

**Signature wow-moment.** The burn wave: a diagonal front sweeps the grid corner-to-corner; 60 pre-chosen tiles each flash ember for 90ms, then crumple downward (scaleY → 0.05, ±4° tilt) leaving a charred husk, releasing 1–2 ash motes that drift up and die — while «−60%» ticks integer-by-integer, one tick ≈ one dead vacancy. The judge remembers a wall of jobs turning to ash in front of a live counter.

**Animation timeline.** Single GSAP timeline, fired on snap-complete. (1) t=0, 0.5s, `expo.out`: eyebrow + headline `fromTo(y:24→0, autoAlpha:0→1)`, stagger 0.08. (2) t=0.3, amount 0.6s: all 100 tiles materialize — `fromTo(scale:0.9→1, autoAlpha:0→1)`, `stagger:{grid:[10,10], from:"start", amount:0.6}`, `power2.out` — one beat of a *healthy* market. (3) t=1.2 «burn», spread 1.6s via `stagger:{grid:[10,10], from:[0,0], amount:1.6}` over a precomputed deterministic set of 60 indices; per tile a 3-step micro-sequence: ember-overlay `autoAlpha 0→1→0` (0.09s, `power1.in`), then `to(scaleY:0.05, rotate:±4, autoAlpha:0.12, transformOrigin:"bottom", 0.24s, power3.in)`, then 1–2 ash motes (2×2px `bg-ember/60` spans) `to(y:-22±8, x:±8, autoAlpha:0, 0.5s, power1.out)`. (4) t=1.2, 1.6s, `ease:"none"`: counter object `{val:0→60}` on the same label «burn», `onUpdate` → `Intl.NumberFormat("ru-RU")` writes «−N%» — lockstep with the wave. (5) t=2.9, 0.7s, `expo.out`: «7%» counts 0→7, caption fades in (y:16→0). (6) t=3.3, 0.5s: closer reveals; inline «+30%» quick-ticks 0→30 (0.4s). Fully stable at t≈3.8s.

**Idle state.** Every ~4s one random charred husk exhales a single ash mote (same 0.5s drift tween, pooled spans). The «−60%» numeral breathes `opacity 1↔0.92` on an 5s sine loop. Nothing else moves.

**Build steps.** None — the 40s speech is fully served by the entrance; the slide stays a single snap point.

**Product-UX elements.** None by design — this is the only pure-data slide before the product appears; mockups would dilute the «боль». Tiles are abstract vacancy ghosts, deliberately faceless.

**Transition in.** From slide 1's typographic monolith (decaying «результат»): slide 2 arrives fully dormant (tiles at opacity 0, counters at «−0%»/«0%») — during scroll nothing plays, per deck contract. The hero's char-dust motif is answered here: what disintegrated as a *word* now disintegrates as a *market* — same ember dust language, escalated.

**Transition out.** The slide settles into a charred after-image: 40 survivors glowing fog against 60 husks. Slide 3 opens with diverging *bars* (perception vs reality) — a clean change of chart language; the surviving tiles' columnar rhythm visually primes the eye for bars. No exit animation; the scorched field is the freeze-frame judges scroll away from.

**Reduced motion.** Instant final state: 60 husks + 40 intact tiles rendered statically, counters printed at «−60%», «7%», «+30%», all text visible, zero loops/particles. Same DOM, one `prefers-reduced-motion` branch that skips the timeline and applies final classes.

**Implementation notes.** `components/scenes/02-pain.tsx` rebuild: `<Scene id="pain" ariaLabel="Боль: что не так с джунами в 2026">`, mode flow. Plain GSAP core + grid stagger — no SplitText/Flip/MorphSVG needed. Deterministic burn set: seeded shuffle of indices 0–99, slice 60, computed once (no hydration mismatch — compute in `useEffect` or hardcode the array). Counters via tween-object + `onUpdate`, `font-feature-settings:"tnum"` on Manrope numerals to kill width jitter. Particles: pooled, ≤120 spans desktop / ≤60 mobile (1 per tile), `autoAlpha:0` after use, `force3D:true`. Ember flash is opacity on a pre-rendered overlay — never animate box-shadow/filter. Grid `aria-hidden="true"` + an `sr-only` paragraph stating the three stats. `contain:layout paint` already on scene-shell.

**Risks.** (a) FPS: 60 collapse tweens — the 1.6s stagger caps concurrency at ~12 active tweens; transforms only; verified target is mid-laptop 60fps, fallback is dropping ash to 1 mote/tile. (b) Mobile height: 375×660 budget is ~620px — guarded by the 24→20px tile step-down container query and `py-12`; verify on 375×660 svh explicitly. (c) Counter/wave desync feels fake — both live on the same timeline label «burn» with `ease:none` on the counter, so they cannot drift. (d) Manrope tnum support — if tabular figures render inconsistently in Cyrillic context, wrap numerals in an Inter `tnum` span. (e) sm–md band: stats go 2-col from 480px, killing the v1 «enormous vertical bleed» issue.


**Director's cut (binding).**
- **Grid stagger fix:** `stagger:{grid:[10,10]}` over a 60-element subset scrambles the wave geometry. Stagger across ALL 100 tiles from `[0,0]` and no-op the 40 survivors inside the per-tile callback, OR precompute per-tile delays as `(row+col)·k + jitter` for the 60 burn indices and place each micro-sequence at its offset. Counter stays on the same timeline label either way.
- **Solemnize:** 1 ash mote per tile (not 1–2) and stretch the wave to ~2.0s — a funeral, not fireworks; this also protects slide 8's peak headroom (narrative critique).
- The «~12 concurrent tweens» claim is wrong (~31 tiles mid-sequence ≈ 60–90 active tweens). Design stands, but profile the burn on an Intel iGPU at 1920 first; fallback ladder: drop ember flash to a class toggle.

---

### Slide 03 — Почему сейчас: ИИ выровнял всех · «Ощущение vs замер»

*(Chart redesigned twice 2026-06-12. #1: the diverging "scissors" read as two unexplained bars → survey rows. #2 (same day, user roast): the survey rows put two SAME-direction, same-length bars next to a «+20%» and a «−19%» — the picture contradicted its own signs, and everything was glued to an unlabeled vertical line. Final grammar: **diverging vertical columns around a horizontal zero line** (profit/loss chart) — sign is encoded by DIRECTION, which needs no legend. The build step is restored, gesture-gated. Original "Перцепционные ножницы" text kept below where still accurate, amended inline.)*

**Intent & copy.** The slide stages the METR paradox as a profit/loss chart that refuses to balance: what developers FELT rises ABOVE zero (+20%), what the experiment MEASURED falls BELOW it (−19%) — two near-equal columns on opposite sides of one line. Everything else (trust dial, corporate stamps) is consequence. On-screen strings, verbatim: headline «ИИ выровнял всех. Но не сделал равными.»; fact 1: **−19%** + **+20%** (both citable, product.md §2: "19% slower, while developers still believed they'd been 20% faster") + row labels «ощущение» / «замер» + caption fragments «были уверены, что быстрее» / «работали медленнее» + caption «опытные разработчики с ИИ работали медленнее — и были уверены, что быстрее» + source «METR, строгий эксперимент, 2025»; fact 2: **43%** + «только столько разработчиков доверяют точности ответов ИИ» + «Stack Overflow 2024»; fact 3: **Shopify · Coinbase** + «ИИ-компетенция — критерий аттестации; инженеров без неё увольняют». Build-step line (verbatim from the speech in the same doc section): «Требование — есть. Инструмента, который его проверяет, — нет.»

**Layout — desktop (1366/1920), redesign #2 2026-06-12.** Headline top-left, `--text-h1` clamp, max 2 lines. Below: 12-col grid, gap 24px. **Cols 1–7, the Perception-gap card** (fog, rounded-2xl, content vertically centered): an SVG (viewBox 700×240) with ONE horizontal ZERO line (y=140, x 40→660) carrying a small dim «0» tick at its left end. Two columns 110 units wide, heights PROPORTIONAL to their values (k=3.3): the «ощущение» column (sterile `#94a3b8`, 40% fill + dashed outline = it's imaginary) GROWS UP from the line, height 66 (+20), x 110–220; the «замер» column (vertical flame→ember gradient, hottest at the line) FALLS BELOW it, height 62.7 (−19), x 330–440. Labels live in the mirror quadrants, x-centered on their columns, two stacked lines each (dim uppercase category + caption fragment in the column's tint): «ощущение / были уверены, что быстрее» BELOW the line under the up-column; «замер / работали медленнее» ABOVE the line over the down-column — each label fills the empty other side of its own column, with explicit clearance from the line (nothing is glued to the axis; that was the roast's padding bug). Numbers at the tips: **+20%** sterile, centered above the up-column (`clamp(1rem, 3.4cqw, 1.75rem)`); **−19%** ember HERO right of the fallen column, below the line (Manrope, tabular, `clamp(1.75rem, 8.5cqw, 4rem)` ≈55px at 1366). Sign = direction: up is faster, down is slower — no legend needed. Numbers/labels are HTML overlays sized in cqw (wrapper is a `@container`) so they scale with the CARD and can't drift off the SVG. Caption + source `--text-meta` in `dim` below. **Cols 8–12, stacked:** the **Trust dial card** (~200px): 180° SVG gauge, radius ~80px, track in `line-strong`, filled arc in `glass #60a5fa`, needle stuck at 43% of sweep; **43%** (~64px) right of the dial, caption + source under. Below it the **Mandate card** (~150px): two stamp chips «Shopify» / «Coinbase» (uppercase, 1px `line-strong` border, slight permanent rotation −2°/+1.5°), caption line with «увольняют» wrapped in a span for the flame highlight.

**Layout — mobile (375×~660svh).** Single column, 12px gaps. Headline `--text-h2`. Perception-gap card compressed (same 700×240 viewBox, proportional — chart ≈108px tall at 315px width): −19% at the 1.75rem clamp floor (~28px), +20% at its 1rem floor, labels 10px two-line, caption 12px/2 lines, source 10px — card ≈195px. Dial shrinks to radius 44px inline-left of a 44px «43%», one row ≈96px. Mandate card: stamps 11px chips side by side, caption 12px — ≈90px. Total ≈610px: fits 660svh with zero scroll. The antithesis is the BUILD: on <lg it plays on **tap** (no timer — `autoChainMs: 0`), dimming the three cards to 5% under the centered overlay line.

**Signature wow-moment.** The rise and the drop: confidence RISES — the dashed «ощущение» column climbs above zero while +20% counts up. A beat. Then reality FALLS — the flame «замер» column plunges below the same line to almost the same depth while −19% counts down in ember. Same magnitude, opposite sides of zero: judges read the paradox the way they read a profit/loss chart — instantly.

**Animation timeline.** (fires on snap-complete only)
1. t=0.00, 0.6s, `expo.out` — headline SplitText by words, y:24→0, opacity 0→1, stagger 0.05. «Но не сделал равными.» lands in `mute`.
2. t=0.30, 0.4s — the ZERO line DrawSVG 0→100% + «0» tick fades (0.4). *(redesign #2 2026-06-12: beats 2–4 replaced — no merged bar, no shear, no bracket, no rows)*
3. t=0.65–1.3 — THE RISE: «ощущение» label fades (0.65), the dashed column grows UP from the zero line (`scaleY` 0.02→1, 0.7s `power3.out`, origin on the line) while «+20%» counts 0→+20 above its tip (sterile).
4. t=1.45–2.3 — THE DROP: «замер» label fades (1.45), the flame column falls BELOW the line (`scaleY`, 0.8s `power3.inOut`, origin on the line) while «−19%» counts −0→−19 beside it (`addCountUp`, ru-RU minus) and its color tweens `paper→ember`.
5. t=2.10, 0.8s, `back.out(1.4)` — dial arc DrawSVG to 43% sweep; needle rotates −90°→−12.6° with one overshoot to −9° and fallback (the "stuck" read); 43% counts up in sync.
6. t=2.90, 0.25s + 0.25s — Shopify then Coinbase stamps: scale 1.6→1, rotate −8°→−2° / 6°→1.5°, opacity 0→1, `back.out(2)`; each lands with a 1-frame y-jolt (y:2→0) on the card.
7. t=3.40, 0.45s — «увольняют» highlight: a flame underline scaleX 0→1 (origin left) + text color `mute→paper`. Stable, fully readable at **t≈3.9s**.

**Idle state.** Every ~3.5s the needle tries to climb: rotate +2.5° over 0.4s `power1.out`, falls back over 0.7s `bounce.out` — trust visibly *stuck* at 43. Bottom flame bar carries a slow ember glow pulse (opacity of an overlay span, 4s sine). Sterile bar's dashed outline drifts (`stroke-dashoffset` loop, barely perceptible). All transform/opacity/stroke.

**Build steps (restored 2026-06-12, gesture-gated — `autoChainMs: 0`).** ONE internal snap (lg+ 200svh sticky wrapper; tap on <lg). On the speaker's «Требование — есть…» beat, next gesture: all three cards tween opacity→**0.05**, scale→0.965, y→−8 (0.5s `power3.inOut` — slide 13's epitaph dim grammar); the line «Требование — есть. Инструмента, который его проверяет, — нет.» enters at `--text-display`, centered, SplitText by words — «есть» lands first, 0.6s hold (the spoken pause), then «нет.» lands soft in flame (scale 1.15→1 `power3.out` — the notary slam stays reserved, §2.3). Next gesture leaves the slide. Frozen: built = dimmed cards + intact line; settled = undimmed evidence, build still pending on re-entry.

**Product-UX elements.** None of the 4.10 mockups — this is the evidence slide; the product first appears at slide 5/6. The dial and scissors are bespoke SVG, but they pre-teach the matrix-bar visual grammar (score bars, threshold colors) that `process-matrix` uses later.

**Transition in.** Slide 2 exits with its giant −60% / 7% counters; slide 3's headline rises from the same baseline rhythm — ink-on-ink, no background change, so the cut reads as "same investigation, next exhibit." Nothing here pre-animates; all motion waits for snap.

**Transition out.** The build line's «нет.» in flame is the last thing on screen; it fades as slide 4's 16-dot respondent grid populates — "no instrument exists, so we went and asked 16 people." Hand-off is a simple opacity exit; slide 4 owns its own entrance.

**Reduced motion.** Instant POST-BUILD composition (the hook applies `setFrozen("built")`): both rows at full length, +20% / −19% / 43% printed, stamps placed, «увольняют» underlined, cards dimmed to 5% with the intact antithesis line centered over them; no loops, no needle judder. *(amended 2026-06-12 with the build restore — matches slide 13's reduced behavior.)*

**Implementation notes.** `scenes/03-why-now.tsx` + `components/why-now/scissors-chart.tsx`, `trust-dial.tsx`, `mandate-stamps.tsx`. Plugins: ScrollTrigger (pin + single snap point at 0.5 progress), SplitText (headline, build line), DrawSVG (axis, bracket, dial arc). Counters via existing `useCountUp` with `Intl.NumberFormat('ru-RU')` for the proper minus. Needle: `<line>` with `transformOrigin` set via GSAP, never CSS rotate on the group. Bars are `<rect>`s scaled — set `will-change: transform` only during the timeline, clear after. Whole SVG ≤ ~700×420 viewBox, two of them — trivially 60fps.

**Risks.** (1) 1366×768 vertical overflow: the default 9rem block padding leaves only ~480px — this scene must use a compact padding override (`py-16 lg:py-20`), validated at 768px height with headline clamped to 44px. (2) Pin-mode keyboard nav: arrow-right must map to the internal snap first, then exit — reuse the slide-6 two-phase ScrollTrigger pattern already in the codebase. (3) Counting DOWN to −19 with `useCountUp`: verify it handles negative targets + minus-sign width shift — render in `font-variant-numeric: tabular-nums` and reserve the minus glyph from frame 0 at 0 opacity. (4) Long caption «опытные разработчики…быстрее» wraps to 3 lines at 375px — cap at 12px/1.4 and test; never truncate (it carries the paradox). (5) Idle needle bounce uses `bounce.out` — keep amplitude ≤3° so it reads as "stuck," not broken.


**Director's cut (binding).**
- ~~**Build step CUT** (build budget = 6/8/10/11/13 only). The antithesis line auto-chains 4s after entrance settles on ALL form factors.~~ **SUPERSEDED 2026-06-12 (user decision): the build is RESTORED, gesture-gated** — `hasBuild: true, autoChainMs: 0`; key/wheel at lg+, tap on <lg; the antithesis NEVER fires on a timer. Cards dim to **5% on ALL form factors** — slide 13's epitaph dim grammar (scale .965, y −8 kept; the earlier 60%-desktop/undimmed-mobile read as a see-through collision). The line renders as an absolutely-positioned centered overlay (zero flow height). Build budget is now 3/6/8/10/11/13 — see §1.3.
- **No stamp grammar** (reserved, §2.3): Shopify/Coinbase chips fade/slide in with their permanent −2°/+1.5° rotation PRE-SET — no slam, no jolt. The slide's motion identity is the stuck needle.
- **Self-annotating columns** (redesigned #2 2026-06-12): each column carries its two-line label in its mirror quadrant (category + caption fragment, x-centered on the column) and its number at the tip — «+20%» above the risen ghost, «−19%» hero beside the fallen flame; a «0» tick names the line. Sign = direction; nothing touches the axis.
- Idles (needle climb, dash drift, glow pulse) run during the settled wait and stop after the build (built = stillness).

---

### Slide 04 — Глубинные интервью · «Единогласие — 16 голосов»

**Intent & copy.** Turn raw interview tallies into a felt verdict: 16 real people, counted one by one, until the candidate side answers with total unanimity. I considered (a) a messenger-transcript wall and (b) a courtroom tally board, but chose the dot-ledger: it makes the *denominators* honest (dark dots = people who did NOT say it), which is exactly what builds judge trust before slide 5's reveal. On-screen copy, verbatim: «16 интервью. Услышали одно и то же.» · «8 нанимающих менеджеров + 8 кандидатов-джунов» · fractions **6/8 · 5/8 · 8/8** with quotes «Все резюме одинаковые. Я не могу отфильтровать никого до собеса.» / «Домашние тестовые обесценились. ChatGPT решает за кандидата.» / «После отказа — просто тишина. Месяц молчания.» · strips «7 из 8 HR: хотим предфильтр до часа собеседования» · «7 из 8 кандидатов: короткие практические задачи — честный формат» · kicker «Одна боль. Две стороны.» (verbatim from the speech, on screen as the closing line the speaker lands on).

**Layout — desktop (1366/1920).** One viewport, `.scene-content` (max 80rem), vertical rhythm top→bottom: (1) Headline, `--text-h1`, Manrope 700, centered. (2) Subtitle `--text-lede` `text-mute`; directly under it the **master ledger**: 16 dots in one row (two groups of 8, 28px gap between groups, dots 10px, gap 8px ≈ 300px wide), group captions in `--text-meta` `text-dim` — left group sterile-tinted (HR), right group ember-tinted (candidates). (3) Three quote cards in a row, each ~390×210px (`bg-fog`, `border-line`, rounded-2xl, p-6): top — fraction in `--text-display` Manrope (numerator paper, «/8» in dim at 0.5em), under it a strip of 8 **pips** (8×8px rounded squares); bottom — the quote in `--text-body` Inter, `text-mute`, role tag `HR`/`Кандидат` in meta caps above. Card 3 carries an SVG rounded-rect stroke overlay (flame ring, inset 0, strokeWidth 1.5). (4) Two strips: thin pill rows (`border-line`, meta/body text) — HR strip anchored left-of-center, candidate strip right-of-center, separated by a 1px vertical `line-strong` divider 40px tall. (5) Kicker «Одна боль. Две стороны.» — `--text-h2` Manrope, split visually: «Одна боль.» paper, «Две стороны.» ember. Total stack ≈ 620px — fits 768 with breathing room; at 1080 the gaps scale up via flex `justify-center`.

**Layout — mobile (375).** Cards become horizontal rows (~96px each): fraction + pips in a fixed 96px left column, quote right, `text-[14px]`. Master ledger dots shrink to 8px (row ≈ 240px, fits). Strips stack vertically as two full-width pills (divider becomes horizontal 24px). Headline `--text-h2` scale. Budget: header ~64 + subtitle/ledger ~56 + 3×96 cards + 16px gaps + strips ~88 + kicker ~40 ≈ 600px — fits 660svh with reduced block padding (override scene padding-block to 3rem here). Nothing is cut; quotes stay full.

**Signature wow-moment.** The 8/8 ignition. Cards 1–2 fill 6 and 5 pips and *leave visible dark gaps* — then card 3 fills all eight pips in flame with no gap, the flame ring draws itself around the card, and the matching 8 dots in the master ledger flare in sync. Unanimity you can see: the only card with no holes, burning.

**Animation timeline.** All beats fire only after snap fixation; total settle ≈ 3.6s.
1. t=0, 0.5s, `expo.out` — headline SplitText `lines` masked rise (yPercent 110→0, stagger 0.08).
2. t=0.25, 0.45s — subtitle fades; master ledger dots pop in (`scale 0→1, back.out(1.7)`, stagger 0.02 left→right) — the "16 people arrive" beat.
3. t=0.7 — cards 1→2→3 enter (`y 28→0, opacity 0→1`, 0.45s, `power3.out`, stagger 0.4). Per card, starting 0.15s after its entrance: numerator counts up (gsap object tween snapped to int, 0.7s) **synced pip-by-pip** with pips flipping `bg-line→bg-sterile` (cards 1–2) at stagger 0.1; quote does a fast type-in: SplitText `chars` opacity 0→1, stagger 0.012, ~0.8s per quote (reads as rapid typing, no caret needed on 1–2).
4. t=1.9 — card 3: pips flip to `bg-flame` (stagger 0.1, each with a 1.15→1 scale pop), numerator 0→8; at t=2.5 the SVG ring draws (DrawSVG 0%→100%, 0.6s, `power2.inOut`) while the 8 candidate dots in the master ledger pulse flame once — the «восемь из восьми» repeat in speech lands on a card that is *already* burning.
5. t=2.7, 0.5s, `power3.out` — strips slide in: HR from x:-40, candidate from x:+40, divider scales y 0→1.
6. t=3.1, 0.5s — kicker: «Одна боль.» fades up from left half, «Две стороны.» from right, meeting at the divider axis.

**Idle state.** (a) Card-3 flame ring breathes: stroke-opacity 0.55↔0.95, 3s `sine.inOut` yoyo. (b) A single "listening" cursor scans the master ledger: one dot at a time brightens 1.1× for 0.3s, advancing every 0.9s in a loop — the panel feels like it is still recording voices. (c) Nothing else moves.

**Build steps.** None. Fifty seconds of speech over a settled, readable verdict wall; the drama belongs to slides 5 and 8.

**Product-UX elements.** No product mockups — deliberate. This is the last pre-reveal slide; the absence of UI makes slide 5's wordmark and slide 7's booting product land harder. The "product" here is the research itself, behaving like an instrument.

**Transition in.** Slide 3 ends on cold statistical surfaces (bars, the 43% dial, corporate stamps). Slide 4 answers with humans: the first thing that moves is the 16-dot ledger popping alive — data points becoming people. No shared elements; the ink background is continuous, so the snap reads as the same room, new evidence.

**Transition out.** By exit, the only saturated elements are the flame ring and the ember «Две стороны.» — embers in the dark. Slide 5 opens on pure black hold; as slide 4 leaves the viewport its content does nothing (no exit tween — deck rule: nothing animates during scroll), so the judge's retina carries the ember glow into the black, priming the flash. The kicker's terminal period is literally the last lit pixel cluster before the hold.

**Reduced motion.** Everything renders in final state instantly: all numerators at value, pips filled, ring at full stroke, strips and kicker in place. No ledger scan, no ring breathing.

**Implementation notes.** `<Scene id="interviews" mode="flow">` (existing `03-interviews.tsx` evolves into this). Plugins: SplitText (headline lines + quote chars; call `revert()` after settle to restore clean DOM/a11y), DrawSVG (ring), core tweens for counts/pips. Numerator count via existing `useCountUp` pattern but driven inside the master timeline for pip sync. Pips/dots are plain divs animated on transform/opacity only; the ring is one `<rect rx="16" pathLength="100">` — cheap. Quote containers get fixed min-height per breakpoint so char-reveal never reflows layout. Trigger: `ScrollTrigger` `onSnapComplete`-gated master timeline, paused until fixation, matching the deck's global pattern. ~200 char spans + 40 small nodes — far under any fps budget.

**Risks.** (1) Mobile vertical overflow — the real risk; mitigate with the 96px horizontal card rows, 3rem block padding, and verify at 375×660 and 375×620. (2) SplitText on Cyrillic quotes — Manrope/Inter both ship Cyrillic; quotes use Inter chars, no ligature issues, but keep `aria-label` on the original paragraph and `aria-hidden` on spans. (3) Quote wrap jitter during char reveal — fixed min-height + `type:"lines,chars"` with line masking. (4) Stagger pile-up pushing settle past 4s — card stagger 0.4 with overlapping per-card internals keeps the critical path at 3.6s; if speech pacing tests feel rushed, trim quote char stagger to 0.008 before touching beat order. (5) Flame ring vs slide 8's red drama — ring is flame (#ff5a1f), never leak red, preserving the red reservation.


**Director's cut (binding).**
- **Typing removed** (mechanic belongs to 6/13, §2.3): quotes reveal via masked line-rise — SplitText `lines`, `yPercent:110→0`, ~0.4s/card. Faster to read; the pip-sync remains this slide's motion identity. Drop the «no caret needed» char-stagger entirely.
- Breathing flame ring on card 3 KEEPS its idle (this slide sets the motif up; 13 calls it back; everyone else static).
- Frozen state: full verdict wall; ledger-scan idle restarts on re-entry.

---

### Slide 05 — Раскрытие · «Точка воспламенения»

**Intent & copy.** The deck's single highest-contrast beat and shortest slide. After four slides of evidence, the screen goes truly black, the evidence compresses into one spark, and the spark detonates into the name. On-screen copy, verbatim and complete: **CaseHire** (wordmark), **КейсПодбор** (sub-wordmark), and one bottom line — *«Мы знаем, что нужно делать.»* Nothing else. The antithesis («не то, что джун производит — а то, как он работает») lives in the speech only; the screen stays monastic.

**Layout — desktop (1366/1920).** Dead-center vertical stack on pure `ink` (in fact darker: this slide's shell gets `background:#000` — the only true-black slide, making the flash read hotter). `CaseHire` in Manrope 800 at `--text-hero` top clamp (~110–120px at 1920, ~96px at 1366), `paper`, letter-spacing `-0.03em`. 16px below: `КейсПодбор` at `--text-h2` (~36px), `ember`, weight 600. The caption *«Мы знаем, что нужно делать.»* sits at ~78% viewport height, `--text-lede`, `mute`, Inter. Behind the wordmark: a static radial ember glow div (~900px diameter, `flame` at 8% center → transparent), opacity-animated only. The 16-dot field occupies a scattered ring of radius 28–38% of viewport min-dimension around center.

**Layout — mobile (375).** Identical composition — this slide is the easiest responsive case in the deck. `CaseHire` at hero clamp floor (~44–52px, fits 375px with margin), `КейсПодбор` ~24px, caption ~17px at ~80% svh. Dot ring radius shrinks to ~120px; flash overlay scale capped lower (2.0 instead of 2.4). Zero overflow risk.

**Signature wow-moment.** The causality of the flash. The flash is not decoration — sixteen dim dots (a deliberate visual echo of slide 4's 16-respondent grid; one of them `flame`, the rest `dim`) converge inward, compress into a single 6px ember point, hold for one breath — and *that point* detonates into the name. Judges feel: the research itself ignited the product. It is also the exact inverse of slide 1's mechanic — slide 1 disintegrates «результат» outward; slide 5 assembles the answer inward. No other slide converges-then-detonates.

**Animation timeline.** (fires only after snap fixation; total settle ≈ 3.2s)
1. **t=0 → 0.5s** — pure black hold. Everything at opacity 0, including the glow. Silence on screen while the speaker says «Мы знаем, что нужно делать».
2. **t=0.5, dur 0.3s** — 16 dots fade in (`autoAlpha 0→1`, stagger 0.015, `power2.out`) at pre-randomized ring positions (seeded, not runtime-random — deterministic for QA).
3. **t=0.9, dur 0.6s** — convergence: every dot tweens `x/y → 0` (transforms only), `power4.in` (`--ease-in-quart` feel), scale 1→0.5, opacity feathering to 0.7 on arrival. The flame dot arrives last (0.05s late) — it visually "swallows" the rest.
4. **t=1.5, dur 0.15s** — compression beat: the merged single 6px flame point pulses scale 1→1.6→1 (`back.out(3)`).
5. **t=1.65** — **FLASH**: full-bleed overlay div (radial gradient: white-hot core → `ember` → transparent, pre-rendered, `pointer-events:none`) does `opacity 0→1` in 0.1s, then `opacity →0` over 0.5s while `scale 0.3→2.4` (`expo.out`). One flash, peak <120ms — well inside WCAG 2.3.1 flash limits.
6. **t=1.7, dur 0.6s** — wordmark focus-pull: two stacked text layers. Back layer is a *statically* pre-blurred copy (`filter:blur(14px)` set once, never animated) at `opacity 1→0`; front sharp layer `opacity 0→1`, `scale 1.12→1`, `--ease-out-expo`. Reads as "проявляется из размытия" per the pitch doc, costs zero filter repaints.
7. **t=2.0, dur 0.5s** — `КейсПодбор` assembles: SplitText chars start at seeded offsets (±18px x, ±8px y, opacity 0) and snap into place, stagger 0.02, `expo.out`. Inward assembly — the mirror of slide 1's outward decay.
8. **t=2.7, dur 0.5s** — caption rises: `y 12→0`, `autoAlpha 0→1`, `power2.out`. Stable at **t≈3.2s**.

**Idle state.** The ember glow breathes: `opacity 0.06↔0.12`, 6s sine loop. Every ~5s a single 2px ember particle detaches from the baseline of «CaseHire» and drifts up 40px while fading (one particle at a time, transform+opacity only). The wordmark itself never moves — stillness is the point of this slide.

**Build steps.** None. This slide earns its drama in one breath; the build budget belongs to slide 8.

**Product-UX elements.** None — deliberately. The only slide in the deck with zero product surface; the brand IS the content. The 16-dot field is the sole "data" element, a callback to slide 4's respondent grid.

**Transition in.** Slide 4 ends with the ignited 8/8 card and decelerating speech («Одна боль. Две стороны. У нас есть ответ.»). Slide 5 receives it with *absence*: snapping down lands on true black — the hard luminance drop after slide 4's flame-ringed card is itself the transition. The reappearing 16 dots then read as slide 4's sixteen respondents carried forward, without any real cross-slide DOM handoff (nothing animates during viewport motion, so the echo is semantic, not literal).

**Transition out.** Slide 5 leaves a settled, breathing wordmark; the last warm element is the ember glow. Slide 6 opens with the generator's typed line and its caret styled in `flame` — the spark visually "moves into" the caret. Concretely: slide 5 needs no exit animation (deck rule: nothing moves during scroll); the continuity is purely chromatic — ember glow → flame caret.

**Reduced motion.** `gsap.matchMedia` (prefers-reduced-motion): timeline is skipped entirely; slide renders final static state — black, sharp wordmark, «КейсПодбор», caption, static glow at opacity 0.09. No dots, **no flash** (the flash is also a vestibular/photosensitivity concern — reduced-motion users never see it), no idle loops, no drifting particles.

**Implementation notes.** `<Scene id="reveal" ariaLabel="Раскрытие: CaseHire — КейсПодбор" mode="flow">` with a `bg-black` override. Components: `DotsField` (16 absolutely-positioned `<span>`s, seeded positions in a const array, GSAP tweens transforms only), `FlashOverlay` (single div, `will-change:transform,opacity`, removed from compositing after timeline via `clearProps`), `WordmarkFocusPull` (blurred layer `aria-hidden`, static filter), SplitText on «КейсПодбор» with `revert()` after settle so the accessibility tree gets the intact string. Master `gsap.timeline({paused:true})` played by the deck controller's `onSnapSettled` callback. Plugins: SplitText only. Fonts: Manrope covers Cyrillic for «КейсПодбор» — verified in the stack reference; never use Space Grotesk here.

**Risks.** (1) *Photosensitivity*: one flash, <120ms peak, never repeated — compliant, but cap overlay max luminance by keeping the white core ≤60% of overlay area. (2) *Blur layer cost*: pre-blurred 120px text is a one-time paint; ensure `filter` is set in CSS, not tweened, and the layer is `position:absolute` inside a `contain:paint` wrapper. (3) *Timing vs speech*: animation settles at 3.2s but the speech runs 20s — intentional; the judge reads the final state while hearing the antithesis. If the speaker is fast, nothing breaks (slide is static-stable). (4) *Hero clamp at 1366*: `CaseHire` at ~96px is ~640px wide — comfortably inside 1366; at 375 the clamp floor keeps it ~290px wide. No wrap possible (single word). (5) *Dot convergence на 60fps*: 16 nodes, transforms only — trivial; avoid per-frame random jitter, all paths precomputed.


**Director's cut (binding).**
- **Flash overlay sizing:** not full-bleed. A centered square at ~1.2× the viewport's max dimension, scaled 0.3→2.4 — half the compositor memory at peak. Position `absolute` within the slide (never `fixed` — `contain:paint` on the shell would scene-contain it anyway).
- Deck chrome (rail/counter) hides on this slide (§1.5).

---

### Slide 06 — Как это работает · «The Generator»

**Intent & copy.** Show the product's core magic trick live: one typed line of a teamlead becomes a full working sandbox, with zero integrations. On-screen copy (verbatim): header **«Три шага. Один проход. Без интеграций.»**; step cards — **«Тимлид»** / «4 слоя · один раз»: «стек → "как мы работаем" → бизнес-контекст → 1–3 строки про задачу позиции», plaque **«Никакой выгрузки базы кода. Никогда.»**; **«Кандидат»** / «ссылка → **30 секунд** → веб-IDE»: «синтетическая база кода · живая БД · сервисы-заглушки · тесты · ИИ-напарник», plaque **«20–40 минут реальной работы.»**; **«Платформа»** / «записывает **всё**»: «каждый промпт · файл · команду · тест». Seed line in the generator stage reuses the existing teamlead-setup case-preview string: «Реализовать batch-обработчик возвратов поверх stripe API, с корректным обращением к таблице `customers`. Покрыть тестами.»

**Layout — desktop (1366/1920).** Pinned scene (`mode="pin"`, lg+ guard already in Scene), compact block padding override (`py-10` instead of the 144px ladder). Three zones, total ≤ 768px: (1) header, one line, `--text-h1` (~48px), ~70px incl. margin; (2) **step rail** — `grid-cols-[1fr_auto_1fr_auto_1fr]`, three fog cards (~370×150px at 1366: flame step number, Manrope title, sub-copy in mute, plaque chip at bottom in `line-strong` border with flame text) separated by two 40px SVG chevron arrows; (3) **generator stage** — full-width fog card, `min(44vh, 400px)` tall: left 30% = seed console (4 dim layer chips stacked + mono input line with blinking flame caret), right 70% = world viewport (pre-build: faint dot grid; post-build: a `compact`-leaning CandidateIde-derived panel — file tree, editor snippet, `schema.sql` mini-diagram, status bar `tests: 12 ✓`), bottom 24px strip = trace ticker (empty pre-build).

**Layout — mobile (375).** No pin (Scene's matchMedia guard) → generation auto-chains after entrance. Header wraps to two lines (~30px). Rail becomes three stacked rows (~76px each): number + title + the boldest chip only («один раз» / «30 секунд» / «всё»), plaques as one small line under rows 1–2. Generator stage compresses to a ~230px console card: seed line types (wraps to 3 lines, mono 12px), then instead of the full IDE, four checklist rows tick in with trust ✓ — «синтетическая база кода», «живая БД», «сервисы-заглушки», «тесты» — plus the trace strip. Full IDE world is desktop-only.

**Signature wow-moment.** The judge watches one Russian sentence get typed — and on a single keypress that sentence *docks upward and generates an entire repo*: tree rows cascade, the `customers` table outline draws itself, the test counter rolls 0→12 green. The product demonstrates its UTP («никакой выгрузки — кейс из трёх строк») without a single word of explanation.

**Animation timeline.** All `paused: true`, fired on snap-complete event.
1. t=0, 0.6s, `--ease-out-expo`: header `fromTo(y:24, opacity:0 → 0,1)`.
2. t=0.2, stagger 0.25s × 3, 0.5s each, expo: step cards rise; chevrons DrawSVG (0.35s) each fire 0.15s after their left card lands.
3. t=1.6, 0.35s, `back.out(1.4)`: both plaques stamp (scale 1.12→1, opacity), «Никогда.» word gets a flame underline DrawSVG.
4. t=2.0, 0.4s: generator stage card fades up; layer chips stagger-in (0.06s × 4, x:-8).
5. t=2.4–3.8: seed line "types" — SplitText chars, `stagger: {each: 0.014, ease: "none"}`, opacity 0→1 (no layout motion), caret blink starts. **Stable, fully readable at ~3.8s.**

**Idle state.** Caret blinks (0.9s steps loop); the «30 секунд» chip breathes opacity 0.7↔1 (3s sine); dot grid in the world viewport drifts 4px on a 9s loop. All transform/opacity only.

**Build steps.** ONE internal snap, pressed by the speaker on «…платформа разворачивает реальный кейс» (~0:20 of the 55s speech):
1. +0s, 0.5s, `power3.inOut`: seed line docks — scales 0.8, translates to stage top (Flip or plain transform), caret dies.
2. +0.3s: file tree rows cascade (8 rows, stagger 0.06, x:-8/opacity) using candidate-ide paths verbatim (`payments/api/process_refund.py` highlighted, `customers.csv` with its `⚠ PII · internal` tag — tiny red accent, allowed); editor snippet chars stagger in (0.8s).
3. +0.9s, 1.0s: `schema.sql` mini-diagram — table rect + column dividers DrawSVG, column names fade.
4. +1.6s: two mock-service chips ping (scale 0.9→1 + opacity, 0.3s apart); status-bar test counter textContent-tweens 0→12 with `tests: 12 ✓` flipping to trust green.
5. +2.4s, 0.6s: trace ticker awakens — first entries slide in left-to-right echoing step 3's copy categories (prompt / file / command / test events as mono chips); step 3 card's «всё» gets a pulsing flame recording dot. Simultaneously step 2's «30 секунд» chip flares ember once. **Build settles ~3.2s.** Idle thereafter: ticker appends one chip every ~4s (translateX queue, oldest fades).

**Product-UX elements.** Reuses `teamlead-setup`'s 4-layer model (as the seed-console chips + the verbatim case-preview string) and a slimmed `candidate-ide` anatomy (tree paths, editor snippet, status bar) as the generated world. The mockups don't sit there — they are *manufactured on screen*, which is the UX argument for «без интеграций».

**Transition in.** Slide 5 ends on the wordmark over near-black with an ember radial. Slide 6 inherits pure ink; a faint ember afterglow gradient at the top edge fades out during beat 1 — the flash «cools down» into process.

**Transition out.** The built world + ticking trace strip are the last living things on screen — «записывает всё» hands directly to slide 7's thesis («Тимлид получает не код»): the recording we just watched becomes the candidate card's evidence. No special exit animation; the snap leaves mid-tick, slide 7 boots its feed.

**Reduced motion.** Instant final post-build state: rail complete, world fully built, trace strip showing three static chips, no caret, no loops. Build-step pin disabled (already gated by the Scene matchMedia guard).

**Implementation notes.** `scenes/06-how-it-works` rebuild: GSAP timeline + SplitText (typing), DrawSVG (chevrons, underline, schema), optional Flip (seed dock — plain x/y/scale tween is fine). Pre-render both stage states absolutely stacked; build crossfades/cascades them — never tween the stage card's size. Test counter via `textContent` snap tween on a tiny node. Mono stack: `ui-monospace, "SF Mono", Menlo` (no extra font load). Internal snap via ScrollTrigger `snap` on the pinned span; keyboard nav must treat the build as one step (→ advances build, next → leaves).

**Risks.** (1) 768px height: header + 150px rail + 400px stage + compact padding ≈ 720px — verify at 1366; if tight, rail drops to 132px (smaller sub-copy). (2) Seed line is ~110 chars — on 375 it wraps to 3 lines; reserve fixed height so typing causes zero reflow. (3) SplitText on Cyrillic + backticks: test `customers` inline-code chars don't break shaping. (4) Speaker mistiming the build keypress: the pre-build state must be self-sufficient (all three steps' copy already readable from entrance), so a late press costs drama, not information. (5) Ticker loop GC: cap chip queue at 6 nodes, recycle elements.


**Director's cut (binding).**
- **Amber, not red:** the file tag is «⚠ персональные данные» (amber) — matching slide 8's chip verbatim and the §2.4 grammar (red's first pixel is slide 8's flare). This also removes the audience-facing English «PII · internal».
- **Mobile micro-world, not checklist:** replace the four ✓ rows with a real generated surface — 3-row file tree (highlighted `process_refund.py` path) + status bar ticking «tests: 12 ✓» (~90px), trust chips beneath. The «без интеграций» proof must stay product UI, just smaller.
- Build = shared `usePinnedBuild` (gesture on lg+, auto-chain on mobile with `onLeave` kill).
- Frozen state: built world + ticker mid-tick (ticker idle restarts on re-entry).

---

### Slide 07 — Карточка кандидата · «Evidence Boot»
**Intent & copy.** The product boots and operates itself: a ranked feed reorders on evidence, the matrix fills, the digest stamps. The judge must feel "this dashboard is alive and nobody is touching it". On-screen strings (verbatim): headline **«Тимлид получает не код.»**; nine matrix axes **понимание контекста · планирование · точность промптов · калибровка ИИ · безопасность команд · проверка · восстановление · артикуляция · цифровая гигиена**; digest line **«⚠ вставил файл с API-ключом во внешний чат · 14:32»**; button **«Запись сессии»**; bottom caption **«На доказательствах. Не на догадках.»** (from the speech close — visible early so judges read while the speaker builds to it). Product-chrome eyebrow «КейсПодбор · оценка» comes from the existing mockup.

**Layout — desktop (1366/1920).** Compact-padding Scene (override `.scene-content` to `py-10 lg:py-12` — the default 144px block padding will not survive 768px). Top: headline, one line, `--text-h1` clamp (~48px at 1366), left-aligned. Below, a 12-col grid, gap 24px: **left 5 cols** — `CandidateFeed` card (~420×340px): 5 rows, each 56–60px: rank badge, Russian name («Соколова А.», «Михайлов Д.», «Ким Е.», «Волков С.», «Грачёва Н.»), role chip, score chip (87/74/71/58/52), tiny ⚠ chip on row 4. Under the feed, dim caption «На доказательствах. Не на догадках.» **Right 7 cols** — `ProcessMatrix` with the 9 verbatim axes (row rhythm tightened to ~30px, total ~360px incl. header with averaged /100 score). Hygiene axis scored **62** (flame tone) so the ⚠ digest is coherent — slide 8's 89→18 crash uses its own mini-matrix and is untouched. Directly under the matrix: the digest row (fog card, 1px line border, amber-tinted ⚠ glyph, `--text-meta`) and, on its right, the «Запись сессии» pill button + a 220px session scrubber (thin track, 5 event ticks, the 14:32 tick amber). Total height ≈ 64 + 24 + 380 + 60 ≈ 530px content — fits 768 with compact padding.

**Layout — mobile (375 / ~660svh).** Vertical stack, in narrative order: headline (`--text-h2`, may wrap to 2 lines) → feed compressed to **top-3 rows** (48px each) → matrix with a slide-specific variant that **shows bars on mobile** (4px-tall fills; the stock mockup hides bars `<sm`, which would kill the slide's core image) with labels at 12px, truncating → digest line (wraps to 2 lines max) → «Запись сессии» button full-width, scrubber hidden. Caption «На доказательствах…» cut on mobile.

**Signature wow-moment.** The feed appears in raw submission order — then **re-ranks itself**: row 4 (Соколова А., 87) glides up to position 1 with a soft flame ring while the others shuffle down, FLIP-animated, exactly as the speaker says «ранжированную ленту». Ranking shown as a *consequence of evidence*, not a static list. The ⚠ digest stamp at 14:32 is the second hook — it loads slide 8's gun.

**Animation timeline.** (fires only after snap fixation)
1. t=0.00, 0.5s, `power3.out` — headline `fromTo(opacity 0→1, y 24→0)`.
2. t=0.15, 0.4s, `power2.out` — feed card shell `scale 0.98→1, opacity 0→1`.
3. t=0.30, 0.45s each, stagger 0.07, `power3.out` — 5 rows rise in (`y 16→0`) in **unranked** order.
4. t=1.00, 0.9s, `power2.inOut` — **Flip re-rank**: `Flip.getState(rows)` → reorder DOM by score → `Flip.from(state, {stagger:0.05})`. Row 4→1 gains flame ring (`opacity 0→0.7`, 0.4s). Score chips count up via `useCountUp` (ru-RU) over the same window.
5. t=1.30 (overlapping), matrix card in (0.4s); then bars fill **axis by axis**: inner fill span `scaleX 0→score/100`, `transform-origin:left`, 0.5s each, stagger 0.18, `power3.out` — ninth bar (гигиена, flame-colored) lands ≈3.2s; header average counts to its /100 value in parallel.
6. t=3.30, 0.35s, `back.out(1.4)` — digest row **stamps**: `scale 1.06→1, opacity 0→1`; ⚠ glyph pulses amber once (no typewriter — that mechanic belongs to slide 4).
7. t=3.65, 0.3s — «Запись сессии» button + scrubber fade in. **Stable at ~3.95s.**

**Idle state.** The scrubber playhead **drags itself**: `translateX` across the 220px track, 8s loop, `sine.inOut`, 1.5s repeatDelay; each event tick glows briefly as the playhead crosses it; crossing the amber 14:32 tick triggers a sympathetic single pulse of the digest's ⚠ glyph (opacity 0.6→1→0.6). Top feed row's flame ring breathes (opacity 0.5↔0.8, 3s yoyo). Loops killed on scene leave and `document.hidden`.

**Build steps.** None — slide 8 owns the deck's build step; slide 7 stays single-beat to preserve rhythm.

**Product-UX elements.** New `CandidateFeed` mockup (this slide only — distinct from `hr-kanban`); existing `ProcessMatrix` with `axes` prop carrying the 9 verbatim labels, plus two new props: `animated` (disables built-in `transition-all` on width so GSAP owns the fill via scaleX) and `barsOnMobile`; new `SessionScrubber` (track + ticks + playhead). The matrix shows the live averaged score; the feed shows live count-up scores; the scrubber replays the session unattended.

**Transition in.** Slide 6 ends on the approved case-card collapse. Slide 7 receives it as cause→effect: brief ink hold (~0.2s post-snap), then the dashboard *boots* from the bottom up — the same case has now produced candidates. No shared morphing element across the snap boundary (deck rule: nothing animates while the viewport moves).

**Transition out.** The digest line is the verbal and visual hinge: the speaker reads «вставил файл с API-ключом…» verbatim, judges' eyes are parked on the amber ⚠ as they scroll. Slide 8 opens its dual-chat with the same ⚠ glyph vocabulary, paying it off in red. Slide 7 deliberately never uses full red — гигиена bar is flame, ⚠ is amber — so slide 8's red flare lands at full force.

**Reduced motion.** Instant final state: ranked feed (87 on top, ring static), all 9 bars at final widths (plain CSS width), digest and button visible, scrubber playhead parked at the 14:32 tick. No loops.

**Implementation notes.** `<Scene id="candidate-card" mode="flow">` with a slide-local padding override class. GSAP: core + **Flip** (only this slide uses it — keep import scene-local), `gsap.context()` scoped, timeline created paused and `.play()`-ed on the deck controller's "snap settled" event. `will-change: transform` applied to feed rows only for the Flip window, removed in `onComplete`. Bars animate `scaleX` on an inner span — never width. Count-ups write `textContent` (no layout thrash). Scrubber playhead is a single absolutely-positioned 2×14px node on `translateX`. Fonts already Cyrillic-safe (Manrope/Inter).

**Risks.** (1) **768px vertical squeeze** — the default padding ladder alone overflows; mitigation: compact padding override + 30px matrix rows + single-line headline; verify at 1366×768 explicitly. (2) **Flip + Lenis contention** — Flip during residual smoothing jitters; mitigation: gate timeline start on snap-settled callback, not ScrollTrigger enter. (3) **Long Cyrillic axis labels** («безопасность команд») truncating at `basis-44` — widen to `basis-52` at lg, `truncate` + full label in `title`. (4) **Mobile bars variant** risks regressing slides 6/9 which rely on bars-hidden behavior — make `barsOnMobile` opt-in, default false. (5) Digest line wrapping at 375 — allow 2 lines, reserve height so the stamp doesn't shift the button.


**Director's cut (binding).**
- **Let the unranked state breathe:** entrance settles with the feed in raw submission order (≥1.5s of visibly unranked feed). The Flip re-rank fires as a ONE-SHOT post-settle event at ~t=5–6s (same pattern as slide 9's first pulse) — close enough to the speaker's «ранжированную ленту» to read as causal. The slide is contract-stable at ~3s either way.
- **Entrance ≤3.6s:** matrix bar stagger 0.18→0.13; overlap beat 7 (button/scrubber) with the digest stamp at t≈3.3.
- Feed-row flame ring is STATIC (idle life = the self-dragging scrubber, §2.5).
- Frozen state: RANKED feed (re-rank consumed; ← re-entry never shows it un-ranking — rows stay DOM-reordered).

---

### Slide 08 — Ещё одно. Ловушка на работу с данными · «Граница под напряжением»

**Intent & copy.** The slide stages the trust boundary as a physical object — a vertical live wire between two chats — then violates it on a single gesture. On-screen copy, verbatim: plaque «Ещё одно.»; title «Два чата. Одна граница.» (flame on «Одна граница.»); left pane «ИИ-напарник» + «знает ваш проект»; right pane «Внешний публичный чат» + chip «ПУБЛИЧНЫЙ»; chat bubbles and leak flag reuse the existing 06-data-trap strings («Файл `customers.csv` помечен **персональные данные»…», «перепиши на батч — вот данные: name,email,charge_id…», «⚠ обнаружена утечка: customers.csv · точное совпадение»); footers «Доверенный канал. Чувствительные артефакты — можно.» / «Недоверенный канал. Чувствительные артефакты — нельзя.»; bottom quote «11% всего, что вставляют в ChatGPT — внутренняя информация.» + «Cyberhaven · телеметрия 1,6 млн сотрудников».

**Layout — desktop (1366/1920).** Pinned scene (`mode="pin"`). Top band (~120px): plaque top-left, title centered, --text-display. Middle band (~52% height): two chat panes ~560px wide each (1366) / 680px (1920), separated by a 96px gutter carrying a vertical SVG boundary line (2px stroke over an 18px low-opacity glow stroke). Left pane: header, three buddy bubbles, plus a draggable-looking file chip `customers.csv · ⚠ персональные данные` (leak-tinted border) docked under the bubbles. Right pane: header with «ПУБЛИЧНЫЙ» badge, one safe bubble, input row with blinking caret. Bottom band (~30%): left — `ProcessMatrix` (compact: 5 axes incl. «Цифровая гигиена» 89, ~300px tall); right — Cyberhaven quote, «11%» at --text-h1 in flame.

**Layout — mobile (375).** Pin disabled (<lg). Vertical stack with tightened block padding (py-10, override §3.2): plaque + title (--text-h2), left pane compressed to header + first buddy bubble + the file chip, a horizontal boundary line (full-width, 24px zone), right pane compressed to header + bubble + flag slot, then a bespoke single-axis strip «Цифровая гигиена» (label · animated bar · score — bars are NOT hidden here, fixing the documented mobile-invisible-leak bug), then the quote with «11%» large. Total ≈ 600px, fits 660svh. The chip travels vertically downward across the horizontal line.

**Signature wow-moment.** The chip crosses the wire: at the exact crossing pixel a full-bleed radial red flare detonates (the deck's ONLY full-screen red), the boundary line strobes and stays burning red, and on the matrix the «Цифровая гигиена» score rolls 89 → 18 while its bar collapses. The slide stays visibly "wounded" — faint red vignette — until exit.

**Animation timeline.**
*Entrance (fires after snap fixation, settles 3.6s):*
1. t=0.0, 0.5s, expo.out — plaque «Ещё одно.»: opacity 0→1, scale 0.94→1.
2. t=0.2, 0.7s, expo.out — title per-word fromTo (y:24→0, opacity, stagger 0.06).
3. t=0.5, 0.9s, power2.inOut — boundary line DrawSVG 0%→100% top→bottom; glow stroke follows at 0.1s lag.
4. t=0.7, 0.8s, expo.out — panes slide in (left x:-32→0, right x:32→0, opacity).
5. t=1.2–2.6, 0.35s each, stagger 0.18 — bubbles rise (y:12→0); file chip lands last with back.out(1.7) scale 0.9→1.
6. t=2.6, 0.8s — quote fades up; «11%» counts 0→11 (gsap textContent, snap:1).
*Build (one gesture; pinned internal snap, plays as a 2.4s one-shot AFTER the internal snap settles):*
7. t=0.0, 0.85s, power2.inOut — chip clone lifts (scale 1.06) and travels left-pane → right input along a shallow MotionPath arc; boundary glow opacity ramps 0.3→0.8 as it nears.
8. t=0.85, 0.12s in / 0.6s decay — FLARE: pre-painted full-bleed radial-gradient div (centered on crossing point) opacity 0→0.85→0.25; boundary stroke recolors to leak and double-strobes (opacity keyframes 1-0.2-1-0.4-1); stage shakes x ±4px, 3 cycles, 0.25s.
9. t=1.0, 0.35s — safe bubble crossfades out, leak bubble crossfades in (absolute-stacked); leak flag stamps (scale 1.4→1, opacity, back.out(2)).
10. t=1.3, 1.1s, power3.in + tiny bounce — matrix «Цифровая гигиена»: score rolls 89→18, bar scaleX 0.89→0.18 (transform-origin left), color trust→leak; matrix average rolls down in parallel.
11. t=2.0, 0.6s — flare settles to persistent vignette at opacity 0.12; «11%» pulses once (scale 1→1.06→1).

**Idle state.** Pre-build: a bright 40px segment travels down the boundary stroke every 4s (strokeDashoffset loop); file chip breathes scale 1↔1.03 (sine, 2.4s); caret blinks in right input. Post-build: vignette breathes opacity 0.10↔0.14; leak bar keeps Tailwind animate-pulse; boundary embers via slow stroke-opacity flicker 0.7↔1.

**Build steps.** One — the leak itself (beats 7–11). At lg+ the scene is pinned with one internal Lenis snap point; gesture 1 (wheel/→) snaps to it and fires the leak timeline once settled; gesture 2 leaves the slide. On mobile/reduced-pin contexts the leak auto-chains 1.5s after entrance settles.

**Product-UX elements.** `ProcessMatrix` with `leakLabel="Цифровая гигиена"` (extended with a `score-roll` ref hook + scaleX bars instead of width transition); bespoke `<Bubble>` dual-chat from existing 06-data-trap (copy reused verbatim); new `FileChip`, `BoundaryLine` (SVG), `FlareOverlay` components. The matrix demonstrates the actual product output: a measurable hygiene score crashing in real time.

**Transition in.** Slide 7 ends on the watch-item toast («вставил файл с API-ключом во внешний чат · 14:32») — its setup pays off here. Slide 8 enters near-black: only the plaque «Ещё одно.» is pre-positioned; everything else builds after fixation. No color bleed from 7.

**Transition out.** The boundary line is the handoff: on exit it cools from leak red back to line-strong neutral over the snap transition — slide 9 opens with its own living divider line, reading as the same boundary repurposed (заказчик ↔ кандидат). Vignette fades to 0 during the scroll.

**Reduced motion.** Instant final post-leak state: both panes, leak bubble + flag visible, matrix axis at 18 in red (no pulse), static 0.12 vignette, quote with «11%» set. No loops, no flare, no chip travel.

**Implementation notes.** GSAP: DrawSVG (boundary), MotionPathPlugin (chip arc), core tweens elsewhere; single master timeline per phase, triggered by the deck's snap-complete callback — never scrubbed. Flare = one fixed div with pre-painted radial-gradient, opacity-only (no blur, no filter). Glow = stacked SVG strokes, not CSS filter. Bars via scaleX wrappers; scores via textContent + snap. `will-change: transform, opacity` only on chip, flare, boundary during phases; removed after.

> **AMENDMENT 2026-06-13 (ui-fixes batch 2 — ghost travel geometry).** The chip-arc travel geometry was previously measured **once at mount** and baked as literals into the build timeline, so a no-resize-event reflow (late font settle) could strand the ghost below the external input. It is now re-measured **at build PLAY** via the build timeline's `onStart` (`measureTravel()`): it resets the chip to `scale: 1` (the pulse idle may be mid-cycle when `playBuild` kills idles), recomputes a mutable `geom`, rewrites the `--flare-x/-y` vars, then rewrites the `ghost-origin` set's `x/y` and the `ghost-travel` `.to`'s `motionPath` (a **fresh** object literal — MotionPath caches the parsed path on `vars`) and `invalidate()`s both tweens. The coordinate origin is the **ghost layer** (`[data-ghost-layer]`, the ghost's `inset-0` containing block), **not** the sticky `.slide` — a sticky element's `getBoundingClientRect()` can report its flow box rather than its pinned-paint box mid-fixation, which strands the ghost at lg/1920. The flare overlay shares that same `inset-0` box, so its vars resolve against the same painted frame. `clearProps`/`lgTravel`/`runLen` stay create-time (breakpoint-stable). Verified: ghost center lands inside `[data-input]` ±4px at 1366/1920 and after a 1366→1500 in-breakpoint resize; <lg the ghost lands within `[data-msg="leak"]` +24px.

**Risks.** (1) 1366×768 vertical squeeze: chat panes + matrix + quote ≈ 740px with the top band — cap pane bubble count at 3/1 and matrix at 5 axes; verify at 768 first. (2) Internal-snap race (old Phase A/B bug): leak timeline must gate on `entranceTl.progress()===1` — if the user double-gestures, jump entrance to end before firing. (3) Flare over the whole viewport must stay opacity-only or mid-laptops drop frames — no backdrop-filter, test on Intel iGPU. (4) Mobile auto-leak timing can collide with a fast scroll-away — kill the chained timeline in ScrollTrigger onLeave. (5) Cyrillic: all display text in Manrope/Inter (both Cyrillic-safe); no Space Grotesk.


**Director's cut (binding).**
- **1366×768 re-budget (this slide cannot be tight):** title at `--text-h1` (~48px), top band ≤88px; chat panes fixed 380px tall (3 bubbles left / 1 right as specced); bottom band content-sized ~210px; `py-8` override. Target total ≤720px, ~48px slack.
- **No exit tween:** the boundary cooling becomes a timed post-build idle beat — ~2s after the leak settles, boundary cools to `line-strong` and vignette drops to 0.06 as part of the wounded-idle. The exit freeze-frame is already near-neutral; slide 9 opens red-free with zero scroll-time animation.
- Build = shared `usePinnedBuild`; leak gates on `entranceTl.progress()===1` (double-gesture jumps entrance to end first). Mobile auto-leak +1.5s, killed in `onLeave`.
- Frozen state: post-leak wounded-cool (leak bubble + flag + crashed axis + 0.06 vignette).

---

### Slide 09 — Две аудитории · «Circulation — the living boundary»

**Intent & copy.** Slide 8 just showed the trust boundary as the place where value *leaks*. Slide 9 reuses that exact visual language — a glowing dashed boundary line — and inverts it: now the boundary is the productive interface between two first-class audiences, and value visibly *circulates* across it. On-screen copy, verbatim: title «Один продукт. Две аудитории первого класса.»; divider label «заказчик ↔ кандидат»; zone eyebrows «сторона заказчика» / «сторона кандидата»; candidate metric labels «% завершивших · лояльность · % вернувшихся». All other text lives inside the existing mockups (HrKanban, TeamleadSetup, CandidateIde — their hardcoded Russian strings).

**Layout — desktop (1366/1920).** Reduced block padding for this scene (`py-10 lg:py-12`, overriding the 9rem ladder — height budget demands it). Title at top, left-aligned, `--text-h2` (~40px), one line at 1366. Below: a 3-column grid `grid-cols-[1fr_56px_1fr]`, max-w 80rem. **Left column (buyer):** eyebrow «сторона заказчика» (meta, mute), then `HrKanban` (~210px) stacked over `TeamleadSetup` in a new `dense` mode (case-preview box + button hidden → ~240px). **Center column:** a vertical SVG boundary — dashed 2px stroke, gradient `sterile→flame→sterile`, with a fog pill at mid-height holding «заказчик ↔ кандидат» (writing-mode horizontal, 14px). **Right column (candidate):** eyebrow «сторона кандидата», `CandidateIde compact` (editor + chats hidden, ~320px), and under it a row of three metric chips (fog cards, 1px line border, ~90px tall): «% завершивших» 84%, «лояльность» 9,1/10, «% вернувшихся» 38% — values are product-mockup data, formatted ru-RU. At 1920 everything is the same grid, mockups un-scaled; at 1366 left-column wrapper gets `transform: scale(0.92)` with a fixed-height box so the two cards fit ~470px.

**Layout — mobile (375).** Vertical stack: title (`--text-h2` clamp low end, 2 lines max), buyer zone = `HrKanban` only (its 3-col grid survives 375 with line-clamp), `TeamleadSetup` collapses to a one-row strip: its own header strings «Тимлид» · «4 слоя контекста» · «15 мин один раз» plus four mini check-dots (same component, new `strip` render branch). Boundary becomes horizontal (32px tall, same label pill). Candidate zone = `CandidateIde compact` (editor-only, which is its natural <sm state, ~200px) + three metric chips in one row (labels shrink to 11px, values 20px). Pulse path runs bottom→top. Total ≈ 600px in 660 svh.

**Signature wow-moment.** The circulation pulse. A 12px ember orb is born at the IDE status bar (`tests: 12 ✓` flashes trust-green), travels along a drawn SVG path, *pierces the boundary line* (the dashes part around it for 200ms), and lands on the «Junior Backend · Go» kanban card: the card pops 1→1.04→1, «47 кандидатов» ticks to 48, badge «+12»→«+13» in flame. Judges literally watch a candidate finishing a session become a buyer-side number. This is «опережающие индикаторы» as a moving image — and the conceptual rhyme with slide 8 (same boundary, but now things cross it *legitimately*) is the thing they remember.

**Animation timeline.** (fires only after snap fixation)
1. t=0.0, 0.6s, expo.out — title words rise 24px + fade (SplitText by words, stagger 0.04).
2. t=0.2, 0.5s, expo.out — `HrKanban` rises 32px + fades in; t=0.35 `TeamleadSetup` follows.
3. t=0.8, 0.6s — teamlead layers: four ✓ circles pop in sequence (scale 0→1, back.out(2), stagger 0.12); layer 4 counts 65→100% (textContent tick) and its flame % swaps to a trust ✓ — the "заполняет один раз" micro-story completes.
4. t=1.0, 0.8s, power2.inOut — boundary draws top→bottom (DrawSVG 0→100%); t=1.55, 0.3s — label pill «заказчик ↔ кандидат» fades/scales in.
5. t=1.6, 0.5s — `CandidateIde` rises; t=1.9, 1.1s — visible editor lines reveal via per-line clip mask stagger (0.09/line), reading as "code typing itself"; cursor caret blinks at last line.
6. t=2.7, 0.7s, expo.out — three metric chips flip up (rotateX -28°→0, stagger 0.12); count-ups 0→84 / 0→9,1 / 0→38 via existing `useCountUp` (0.8s).
7. t=3.4 — readable steady state reached. t=3.5, 1.1s, power1.inOut — first circulation pulse runs (MotionPathPlugin along the measured SVG path); on arrival: kanban card scale pop (0.25s, back.out(3)), counter tick, badge flash.

**Idle state.** Pulse repeats every ~6s (gsap timeline `repeat:-1, repeatDelay:5`), alternating arrival targets: kanban card tick, then teamlead «4 слоя» header glow (the second audience-touch). Each pulse arrival also re-fires a soft flame underline sweep beneath the three metric chips (scaleX 0→1→0, 1.2s) — so whenever the speaker says «опережающие индикаторы», the metrics are plausibly alight. Boundary dashes drift slowly (stroke-dashoffset tween, 20s linear loop). Counter stays at 48 (tick animation replays as a flash, not a re-increment, to avoid runaway numbers).

**Build steps.** None. Slide 8 owns the deck's build; 9 is a single-shot 40-second slide. Keyboard → leaves immediately.

**Product-UX elements.** `HrKanban` (live: receives the pulse, counter ticks — "HR живёт в канбане каждый день"), `TeamleadSetup` in new `dense` prop (live: completes its 4th layer once, then never changes — "один раз"), `CandidateIde compact` (live: code reveals, tests-green status emits the pulse — consumer-grade surface), plus three new `MetricChip` components. The matrix-as-portfolio is *spoken*, not shown — slide 7 owns the matrix fill and slide 13 reuses it; duplicating here would dilute both.

**Transition in.** From slide 8's red leak peak: slide 9 opens cool and clean — ink background, zero red anywhere (the only slide-neighbor rule that matters). The boundary line is the bridge: it echoes slide 8's trust-boundary divider in geometry and dash pattern but draws in sterile/flame, not leak-red. Recovery beat after the cinematic peak.

**Transition out.** The final idle pulse orb is the visual seed for slide 10: a small ember point of light → slide 10's first market circle (99,3 млрд) blooms from a near-identical centered orb. The slide ends with all motion confined to that orb so the eye is pre-parked where slide 10 begins.

**Reduced motion.** Instant static final state: boundary fully drawn, all four layers ✓ 100%, code fully rendered, metrics at 84 / 9,1 / 38, kanban showing 48 кандидатов · +13. No pulse, no loops, no dash drift.

**Implementation notes.** `<Scene id="two-audiences" mode="flow">` with custom padding class. New file `scenes/09-two-audiences.tsx`; props added: `TeamleadSetup dense`, mobile `strip` branch. Pulse overlay: absolutely positioned SVG covering the grid container; path endpoints measured from `getBoundingClientRect()` of the IDE status bar and the kanban card, recomputed via `ResizeObserver` + on `matchMedia` flip (vertical path lg+, horizontal-to-vertical on mobile). GSAP: SplitText (words only — no char disintegration, that's slide 1's mechanic), DrawSVG (boundary), MotionPathPlugin (orb — core free plugin), count-ups via existing `useCountUp`. Orb = one 12px div, box-shadow glow (small surface, GPU-cheap); `will-change: transform` applied only during tween. No Flip — the kanban card *ticks*, it does not reorder (slide 7 owns FLIP).

**Risks.** (1) 1366×768 height: TeamleadSetup at full ~350px overflows — the `dense` prop is mandatory, plus the scale(0.92) wrapper; verify with the 80/112px padding override. (2) Pulse path drift after resize/zoom — ResizeObserver re-measure; kill+rebuild the idle timeline on change. (3) Counter tick must not mutate React state mid-render — animate a plain `<span ref>` textContent, real DOM stays "47" for SSR/a11y, `aria-hidden` on the animated copy. (4) Mobile kanban at 375 is cramped 3-col — already `line-clamp-2`; verify «Junior Data Analyst · SQL» wraps cleanly in Manrope. (5) Per-line clip reveal on the editor must use `clip-path` on 9 small line nodes, never width tweens.


**Director's cut (binding).**
- **rotateX needs perspective:** set `transformPerspective:600` in the chip tween (or `perspective:600px` on the chip row) — without it the flip renders as a flat squash.
- **Measure after transform:** pulse-path endpoints via gBCR AFTER the left column's scale(0.92) wrapper is set (and re-measure in the ResizeObserver), or the arc lands ~8% off.
- **Canonical handoff out = line→arc** (§3): the boundary line is the deterministic seed of slide 10's TAM arc. The «final pulse orb parks the eye» claim is deleted (unenforceable with a ~6s loop and user-timed exit); orb echo is a nice-to-have only.

> **AMENDMENT 2026-06-13 (ui-fixes batch 2 — remove the «заказчик ↔ кандидат» pill).** The fog pill that sat at the mid-height of the central divider is **deleted** — node, copy label, and every motion reference. The divider now reads as a clean circulation line on its own (the pulse crossing it carries the «boundary as living interface» meaning; the redundant text label was visual noise). This **supersedes** the following in this section: `(заказчик ↔ кандидат)` parenthetical in **Transition out** above (read «(its circulation divider)»); the «divider label «заказчик ↔ кандидат»» entry in the **Intent & copy** list (deleted); the «fog pill at mid-height holding «заказчик ↔ кандидат»» clause in **Layout — desktop** and the «same label pill» clause in **Layout — mobile** (no pill at any viewport); and **Animation-timeline beat 4** — the «t=1.55, 0.3s — label pill … fades/scales in» half is deleted (the boundary clip-reveal at t=1.0 stands alone). Slide 9 has **no build step**, so the 18-build walk count is untouched; the pill was `position:absolute`, so removing it shifts no divider layout. Verify: `[data-pill]` count = 0 at 375 / 1366 / 1920; the BoundaryLine still renders centered with no layout shift and no horizontal overflow on slide 9.

> **AMENDMENT 2026-06-13 (ui-fixes batch 2 — pilot-target metrics + honesty eyebrow).** The three candidate-side metric values **84% / 9,1/10 / 38%** were admitted product-mockup data (indefensible at Q&A) and are **replaced with pilot targets carrying an honesty eyebrow**. New copy, verbatim: an eyebrow «целевые метрики пилота» above the chip row, then «завершают сессию» **≥ 70%** · «NPS кандидата» **≥ 40** · «фидбэк» **100%**. The «≥» is a **static** sibling span rendered OUTSIDE `[data-chip-value]` (count-up rewrites the counted node's textContent every frame, so a glyph inside it would be erased); it is NOT routed through `CountUpOpts.prefix`. **Sourcing (Q&A-defensible):** ≥70% session-completion and NPS ≥ 40 are the pilot KPIs (`ru_pitch_v2.md`); **«фидбэк 100%» is a PRODUCT PROMISE, not a pitch KPI** — every candidate gets the evaluation-matrix artifact «по построению» (by construction), so it is a structural guarantee rather than a projected number. This **supersedes** in this section: (a) **Intent & copy** «candidate metric labels «% завершивших · лояльность · % вернувшихся»» → «завершают сессию · NPS кандидата · фидбэк», plus the new eyebrow «целевые метрики пилота»; (b) **Layout — desktop** «« % завершивших» 84%, «лояльность» 9,1/10, «% вернувшихся» 38% — values are product-mockup data» → «« завершают сессию» ≥ 70%, «NPS кандидата» ≥ 40, «фидбэк» 100% — pilot targets, with «≥» a static prefix outside the counted span»; (c) **Animation-timeline beat 6** count-ups «0→84 / 0→9,1 / 0→38» → «0→70% / 0→40 / 0→100%» (the static «≥» does not animate; NPS is a bare number, no suffix, no decimals); (d) **Reduced motion** «metrics at 84 / 9,1 / 38» → «metrics at ≥ 70% / ≥ 40 / 100%». Slide 9 still has **no build step** (18-walk count untouched); chip count stays 3; `[data-chip-value]` still matches the inner span (descendant query) and the flip target `[data-chip="metric"]` is unchanged. Verify: the three `[data-chip-value]` spans read exactly «70» / «40» / «100» (full chip text «70%» / «40» / «100%»); no «≥» inside any `[data-chip-value]`; eyebrow «целевые метрики пилота» is the first `<p>` in the metrics block; «завершают сессию» label not clipped at 375; srSummary no longer mentions 84 / 9,1 / 38.

---

### Slide 10 — Рынок · «Dive to the Ember»

**Intent & copy.** Make TAM→SOM honest and physical: every circle is area-true relative to its neighbor, and the SOM is deliberately almost invisible at first — a pulsing ember dot. The judge's takeaway: "they didn't inflate the market; they zoomed into their slice." On-screen strings (verbatim): «Рынок есть. И он растёт на 38% в год.» · «99,3 млрд ₽» + «российский HR-tech, 2024, +38% · Smart Ranking» · «3,85 млрд ₽» + «наш сегмент: оценка и развитие, +38%» · «43%» компаний уже используют ИИ в HR · «27%» тестируют для 2026 · «(Известия)» · «400–800 компаний» «(10–50 джунов в год)» · «средний чек 400–900 тыс ₽/год» · «потолок клина 160–720 млн ₽» · «цель на 24 мес: 20–35 млн ₽» · «50–80 платящих» · kicker «Не фантазия — арифметика.»

**Layout — desktop (1366/1920).** Two zones. Left column ~38% (max ~480px): eyebrow «Рынок», headline (--text-display, Manrope), then a stat stack that swaps per stage — stage A: 99,3 млрд ₽ (--text-h1, tabular-nums) with source line, 3,85 млрд ₽ below, and two docked chips 43% / 27% with «(Известия)». Right ~62%: the circle field — one SVG group. TAM circle radius ~700px, center off-canvas top-right, so only a huge arc curves across the frame ("bigger than the screen"). SAM circle r≈138px fully visible, offset lower-right inside the arc; клин dashed ring r≈47px inside SAM; SOM r≈12px — a flame ember dot inside клин. Sizes derived from true sqrt-area ratios between adjacent pairs (99,3/3,85 → ×5.1 radius; SAM/потолок ~×3; клин/SOM ~×4), so the picture itself is the arithmetic.

**Layout — mobile (375).** Stacked: headline, then circle field at ~42svh (TAM arc clipped at top, SAM/клин/ember below it), then a compact stat card with all stage-A AND stage-B numbers as four rows (клин figures included statically — no build step on mobile, pin is lg-gated). Chips 43/27 become one line. Kicker sits as last row. Everything fits 375×660 with text-meta labels; no internal scroll.

**Signature wow-moment.** The dive. On the speaker's «Наш клин…» one gesture scales the camera ×7 toward the ember: the TAM arc sweeps off-frame like a planet's horizon, the dashed клин ring snaps crisp, and the ember that was 12px now burns at ~80px with «цель на 24 мес: 20–35 млн ₽ · 50–80 платящих» stamping beside it. The market literally swallows the screen, and our target is the only thing left glowing.

**Animation timeline.** (fires after snap fixation only)
1. t=0.0, 0.6s, expo.out — eyebrow + headline reveal (y:24→0, opacity).
2. t=0.3, 1.2s, power2.inOut — TAM arc DrawSVG 0→100%; simultaneously 99,3 count-up (useCountUp, 1.6s expo.out, ru-RU comma decimal) + source line fades in.
3. t=1.0, 0.7s, back.out(1.4) — SAM circle scales 0.6→1 + opacity; 3,85 count-up (1.4s).
4. t=1.8, 0.5s, expo.out — chips 43% / 27% dock (y:16→0, stagger 0.12); count-ups 1.2s.
5. t=2.4, 0.5s — клин dashed ring fades to 40% opacity; SOM ember ignites (scale 0→1, back.out(2)). Stable, fully readable at ~3.2s.

**Idle state.** Ember breathes: scale 1→1.18 + glow-circle opacity 0.25→0.5, 2.4s sine.inOut yoyo repeat:-1. Клин dashed ring rotates 360° over 60s linear. Nothing else moves.

**Build steps.** ONE (earned). Internal snap on the speech beat «Наш клин»: (a) 0–1.6s in-out-quart — camera group transform: scale 1→7, origin at ember cluster; TAM/SAM strokes ease to opacity 0.15; stage-A left-column stats crossfade out 0.3s. (b) t=1.3, 0.8s — клин ring redraws via DrawSVG; left column crossfades in клин figures: «400–800 компаний» «(10–50 джунов в год)», «средний чек 400–900 тыс ₽/год», «потолок клина 160–720 млн ₽» — numeric parts roll up 1.2s. (c) t=2.2, 0.4s — SOM circle (now ~80px) fills flame/20 + flame ring; stamp «цель на 24 мес: 20–35 млн ₽» · «50–80 платящих» scales 1.15→1. (d) t=3.0, 0.4s — kicker «Не фантазия — арифметика.» fades up (text-paper, Manrope semibold). Next gesture exits the slide.

**Product-UX elements.** None — this is the deck's one pure-data slide; mockups would dilute the dive. The "product" here is honest geometry: area-true circles, ru-RU count-ups, dashed ring marking the клин boundary like a UI selection.

**Transition in.** Slide 9 ends on a straight animated boundary line dividing two audiences. Slide 10's first stroke is the TAM arc — the straight line of 9 conceptually becomes a curve: same 1px line-strong stroke weight, drawn in the same direction. Judges feel continuity: boundary → horizon.

**Transition out.** The slide leaves in its dived state: a flame-ringed circle holding «20–35 млн ₽». Slide 11 opens with money mechanics; the ember's flame accent hands off directly to the «Команда» card's flame border — same hue, same corner of the screen. SOM revenue → tariffs that produce it.

**Reduced motion.** Pin/build disabled (Scene matchMedia guard); render the dived composite statically: клин ring + flame SOM circle + full left-column stack showing all numbers at final values (99,3 / 3,85 / 43 / 27 / клин rows / SOM stamp / kicker). No loops, no ember pulse.

**Implementation notes.** `<Scene id="market" mode="pin" pinLength=1.5>` (pin lg+ only). One `<svg>` with a `<g data-camera>`; all circles use `vector-effect="non-scaling-stroke"` so strokes stay 1–1.5px through the ×7 zoom. Camera move = single GSAP `to(scale, x, y)` on the group (matrix transform, GPU-composited). All text lives in an HTML overlay layer, never inside the scaled group — labels crossfade between stage layers instead of counter-scaling (kills blurry-text and reflow risk). Plugins: DrawSVGPlugin (arc + клин ring), ScrollTrigger (pin + internal snap point at progress 0.5), existing `useCountUp` (tabular-nums, thin-space thousands, comma decimals: «99,3», «3,85»). Reuse house easings `--ease-out-expo` / `--ease-in-out-quart`.

**Risks.** (1) Zoomed-state overflow at 1366×768 — клин ring at ×7 must stay ≤560px diameter; clamp camera scale via a `Math.min(7, viewportH/110)` computed at mount. (2) FPS during dive: only one transform animates; pre-set `will-change: transform` on the camera group, remove after settle; glow is a pre-rendered radial-gradient circle (opacity tween only, no blur animation). (3) Long source line «российский HR-tech, 2024, +38% · Smart Ranking» wraps at 1366 — set max-width 32ch, allow 2 lines, reserve height to avoid shift. (4) Mobile cram: stat card rows at text-meta with 8px gaps verified against 660svh budget; if tight, «(Известия)» merges into the 43/27 row. (5) Ember invisible on bad projectors — back it with a 24px flame/15 halo so the dot reads even at low contrast.


**Director's cut (binding).**
- **Zoom clamp from the actual constraint:** `maxScale = (0.73 × viewportH) / клинRingDiameterPx` — at 768 that's ≈5.96, not 7. Recompute the dived ember size from the same scale (~72px — still reads) and verify the goal stamp fits beside it at 1366×768.
- **Dive capped at ~1.2s** so it reads as a zoom, not a set piece — slide 13 must out-rank it (escalation critique).
- **SOM goal label fades up** — no stamp (grammar reserved, §2.3).
- **Mobile gets the dive:** auto-play a reduced ×3 camera zoom 1.5s after entrance settles (same auto-chain pattern as 8's mobile leak), killed in `onLeave` — not a static composite.
- Build = shared `usePinnedBuild`. Frozen state: dived клин view + kicker.

---

### Slide 11 — Монетизация · «Весы окупаемости»

**Intent & copy.** The slide must read as accounting, not marketing: a machine that visibly earns. Three claims in speech order — model, cost, payback — each with its own physical metaphor: tariff cards (model), a stacking cost bar (cost), a tipping beam scale (payback). On-screen copy, verbatim: headline «Платят за завершённую сессию. Не за кресла.»; cards «Пилот» 15 000 ₽ · 1 позиция · 100 кандидатов / «Команда» 49 000 ₽/мес · 5 позиций · 1 000 кандидатов + chip «основной» / «Рост» 149 000 ₽/мес · 20 позиций · 4 000 кандидатов + аналитика / «Энтерпрайз» от 400 000 ₽/год + локальное развёртывание; cost strip «Себестоимость сессии $1–3» with segments «контейнер $0,15» · «ИИ-напарник $0,5–2» · «внешний канал и оценка — остальное» and «Маржа: ~70% на Пилоте, 75–85% на Энтерпрайзе»; scale pans «1,5 млн ₽ — замена плохого найма» / «588 тыс ₽ — год „Команды“»; stamp «Один предотвращённый плохой найм окупает „Команду“ на 2,5 года»; source line «SHRM: замена = 100% годовой зарплаты».

**Layout — desktop (1366/1920).** Tight vertical ladder, scene-content block padding overridden to `py-8 lg:py-10` (the default 144px ladder will not fit this density at 768px tall). Zone A: headline, `--text-h1` clamp (~44px at 1366), centered, one line at 1920 / two at 1366. Zone B (t+24px): 4-up tariff grid, `gap-4`, cards ~280×190px in `bg-fog` `border-line` rounded-2xl; «Команда» gets `z-10`, scale 1.04, flame SVG ring, top-right chip «основной» (flame bg, ink text). Zone C (t+20px): cost machine — a full-width 28px-tall track (`bg-fog`, `border-line`) with three stacked segments (sterile / glass / mute), labels beneath each, total «$1–3» in `--text-h2` flame at the right end; margin readout right-aligned under the track in `mute`. Zone D (t+20px): payback strip, ~130px tall — an SVG beam (full content width, 4px stroke `line-strong`, flame fulcrum triangle center) with two hanging pans: left pan card «1,5 млн ₽ — замена плохого найма» (sterile tone), right pan card «588 тыс ₽ — год „Команды“» (flame tone). Stamp zone floats above the fulcrum, empty until the build. Total ≈ 700px at 1366×768 — fits with breathing room at 1080.

**Layout — mobile (375 × ~660svh).** Headline ~26px, two lines. Tariffs become a 2×2 grid of compact cards (~165×104px): name 13px, price 16px semibold, limits collapsed to one 11px line («5 позиций · 1 000 кандидатов»). Cost track shrinks to 18px tall; segment labels move below as a 3-chip legend, margin line merges into the legend row. Beam strip keeps the metaphor but compresses: pans become 2-line chips, beam span ~320px, stamp text wraps to two lines at 15px. Nothing is cut — only compressed; SHRM source line is the single sacrifice if 660svh is exceeded (moves into the stamp card as a 10px footer).

**Signature wow-moment.** The beam scale tipping: «1,5 млн ₽» counts up, its pan physically drops, the beam rotates around the flame fulcrum, and the verdict «…окупает „Команду“ на 2,5 года» slams in like a notary stamp with a 2px jolt — the argument that buys, made physical.

**Animation timeline.** (fires only after snap fixation)
1. t=0, 0.6s, expo.out — headline SplitText by words, `y:16→0, opacity:0→1`, stagger 0.05.
2. t=0.4, 0.5s ea, expo.out, stagger 0.12 — tariff cards `y:24→0, opacity`; prices count up 0.8s (ru-RU, NBSP thousands).
3. t=1.3, 0.6s — «Команда» feature beat: card `scale 1→1.04` (back.out(1.4)), flame ring draws via DrawSVG around an SVG rect overlay, chip «основной» pops `scale 0.8→1`.
4. t=1.8 — cost machine: empty track fades in 0.2s; segments stack left→right via `scaleX` (`transform-origin:left`): sterile 0.25s → glass 0.35s → mute 0.3s, each label fading under its segment; «$1–3» count-up finishes t=2.9; margin readout fades t=2.8–3.1.
5. t=3.2, 0.5s — payback strip appears in dormant pre-state: beam level, pans visible, numbers at 40% opacity, no stamp. **Stable and fully readable by t≈3.8s.**
6. t≈3.7 (wink) — thin flame strike-through draws across «за кресла» in the headline, DrawSVG 0.4s — syncs with the speaker's «не лицензия по рабочим местам» irony.

**Idle state.** A skewed low-opacity highlight div translates across the «Команда» ring every ~6s (transform-only sheen); cost-bar total «$1–3» breathes opacity 1→0.85 on an 4s sine; pre-build beam holds a ±0.3° sine sway (3s period) hinting it is waiting.

**Build steps.** ONE, on the speech beat «И ключевая цифра» (~t+45s of the 60s slide). Scene pins on `lg+` with one internal snap. Gesture/→ advances: (a) left pan number counts up to «1,5 млн ₽» 0.8s, pan label brightens; (b) beam rotates −7° around the fulcrum, 0.9s `quart.inOut` with a 1° overshoot settle; pans counter-rotate +7° on their hinge points so text stays level (real-scale physics); right pan «588 тыс ₽» rises; (c) t+0.9: stamp «Один предотвращённый плохой найм окупает „Команду“ на 2,5 года» slams `scale 1.4→1, opacity 0→1`, 0.35s power4.out, with a 2px `y` jolt on the strip container; SHRM line fades in beneath, 0.4s. Post-build idle: beam micro-sway ±0.4°. Next gesture leaves the slide. Below `lg` and under reduced motion, the build plays automatically as timeline beats 7–9 right after entrance (Scene pin gate already handles this).

**Product-UX elements.** No 4.10 mockups here — this is the one purely financial slide; reusing the IDE/matrix would dilute slide 12's contrast. The tariff cards ARE the product surface: real pricing UI chrome (rounded-2xl fog cards, chip, limits) styled exactly like the mockup family so they read as screenshots of a pricing page, not a slide table.

**Transition in.** Slide 10 ends on the flame-highlighted «20–35 млн ₽» goal and the spoken «не фантазия — арифметика». Slide 11 answers arithmetic with arithmetic: same flame count-up language, same ru-RU number formatting, entrance starts with numbers (prices) rather than decoration — continuity of the money register, no shared DOM elements needed.

**Transition out.** The stamp gesture is the deliberate motif handoff: slide 12's verdict table stamps ✗/✓ with the same slam-scale language. The «2,5 года» stamp is the last thing moving; slide 12's first ✗ feels like the same notary continuing down a ledger.

**Reduced motion.** Everything renders instantly in the FINAL post-build state: headline with strike-through, cards with «Команда» featured, full cost bar with «$1–3», beam already tipped at −7°, stamp and SHRM line visible. No loops, no sway, no pin.

**Implementation notes.** `components/scenes/11-monetization.tsx` + child `payback-scale.tsx` (pure SVG: beam `<g>` with `transform-box: fill-box; transform-origin` at fulcrum; pans as `<foreignObject>`-free HTML cards positioned via the same rotation group — simpler: HTML cards absolutely positioned, rotated via GSAP on a shared wrapper, counter-rotated individually). Plugins: ScrollTrigger (fixation + pin + internal snap), SplitText (headline), DrawSVGPlugin (flame ring, strike-through). Count-ups need a timeline-driven variant of `useCountUp` — the existing hook fires at `top 80%`, which violates the fixation-gated rule; add a `paused` mode the master timeline plays. `will-change: transform` on the beam wrapper only during the build. All motion is transform/opacity/stroke; segments use `scaleX`, never width.

**Risks.** (1) 1366×768 vertical overflow — the biggest risk; mitigated by the `py-8` override, 190px card cap, `line-clamp-1` on tariff limit lines; verify at exactly 768 with browser chrome. (2) «Энтерпрайз» wrapping in a 165px mobile card — drop card title to 12px with `tracking-tight`; never hyphenate (verbatim rule). (3) Counter-rotated pan text shimmering on non-integer transforms — round the settle angle, `backface-visibility:hidden`. (4) Featured-card scale clipping neighbors — `overflow:visible` on the grid, `z-10` on «Команда». (5) Build-step pin fighting Lenis snap — reuse the exact two-phase ScrollTrigger pattern already proven in scene 06-data-trap. (6) `scaleX` distorting segment label text — labels live OUTSIDE the scaled bars, positioned under the track.


**Director's cut (binding).**
- **Readability staging (the 3-second read):** tariff PRICES render statically — no count-up (price tags, not measurements). Limits line appears only on «Команда»; other cards show name + price with limits at 50% dim. Zone D (beam) holds at 40% opacity until its build. The judge's 3s scan = headline → «Команда 49 000» → «$1–3». Count-ups remain ONLY on «$1–3» and «1,5 млн ₽» — the two numbers that are measurements (this also breaks the 9/10/11 count-up monotony).
- **Reduced-motion contradiction resolved:** reduced motion = instant final tipped state (as the dedicated section says). Auto-play of the build applies to `<lg` WITHOUT reduced motion only.
- **Mobile card width 160px** ((375−40−12)/2 ≈ 161): verify «Энтерпрайз» + «от 400 000 ₽/год» fit at 12px `tracking-tight`, no hyphenation.
- Build = shared `usePinnedBuild`. Frozen state: tipped beam + stamp + SHRM line.

---

### Slide 12 — Конкуренты · «Вердикт-таблица»

**Intent & copy.** Slide 11 ends with a stamped verdict («2,5 года»); slide 12 keeps the stamping language but turns it into a courtroom exhibit: a comparison matrix where competitors accumulate gray rejections and our row locks in. On-screen verbatim: headline «Мы не одни. И это хорошая новость.»; column heads «ИИ в среде / Канал на утечки / Под джунов / Без живого интервьюера / Кейс под позицию / Локально в РФ»; rows «HackerRank / Codility (Cody) / CodeSignal (Cosmo) / CoderPad / Karat NextGen / КейсПодбор»; quote «Задача — не детектить ИИ-читерство, а определять, когда помощь ИИ легитимна.» — «HackerRank, руководство 2025»; verdict «Пять осей. Не пересекаются ни с одним игроком.» Dim meta sub-label under Karat: «$248 млн» (numeral form of the speech fact). Desktop-only dim footnote (build step): «hh.ru · Skillaz · Поток — автоматизируют воронку, но не оценивают процесс» (verbatim speech).

**Layout — desktop (1366/1920).** Single centered column, max-w ~1080px. Top: headline at `--text-h1` (≈48px Manrope), left-aligned, ~72px zone. Center: the table as a `fog` rounded-2xl card with `line` borders — name column 200px + six criteria columns ~128px; header row 56px (two-line `text-meta` labels in `mute`, uppercase, 0.08em tracking); six body rows 52px each → card ≈ 380px tall. КейсПодбор row: `line-strong` top border, name in `paper` semibold, row bg `flame/8`. Bottom zone (~150px, height pre-reserved to prevent shift): left — quote card (fog, left flame 2px rule, italic Inter `--text-lede`, attribution in `dim`); right — verdict line at `--text-h2` with an 80px pentagon SVG seal (flame stroke 1.5px, `flame/10` fill) beside it. At 1920 everything scales via clamps; table caps at 1080px so columns never balloon.

**Layout — mobile (375).** Headline drops to ~30px. Criteria headers rotate to `writing-mode: vertical-rl`, 96px tall, 10px font; name column 112px (truncate: «Karat NextGen» → ellipsis with the «$248 млн» chip hidden); six glyph cells 36px wide, rows 44px → table ≈ 360px wide, fits with 8px gutters. Quote shrinks to 14px italic, 3 lines; verdict line 22px; pentagon shrinks to 48px inline before the verdict text. Footnote strip cut entirely. Vertical budget at 660svh: 60 + 360 + 110 + 70 + paddings — fits with no internal scroll.

**Signature wow-moment.** The pile-up-then-lock rhythm: 22 small gray ✗ stamps thud across five rows in two seconds — a wall of rejection — then the flame row sweeps in and five ✓ locks slam left-to-right with ring pulses, one per axis. On the build gesture, the pentagon draws itself while each of the five ✓ pulses in sync with its vertex — the table literally becomes the shape of the niche.

**Animation timeline.** (fires only after snap fixation)
1. t=0, 0.5s — headline: SplitText by words, y:24→0 + opacity, stagger 0.06, `--ease-out-expo`.
2. t=0.3, 0.4s — table card + header row: opacity 0→1, y:12→0, expo.out.
3. t=0.6–2.0 — five competitor rows cascade (x:-16→0 + opacity, 0.35s each, stagger 0.12, power3.out). As each row lands, its cells stamp with 0.04s intra-row stagger: ✓ (mute) fade in 0.2s; ✗ (dim, 14px) stamp scale 1.6→1 + rotation −8°→0 + opacity, 0.25s, back.out(2). 22 ✗ total — all transform/opacity.
4. t=2.1, 0.4s — КейсПодбор row: `flame/8` bg sweeps via scaleX 0→1 (origin left), row y:16→0; col-1 ✓ fades quietly (shared axis, no drama).
5. t=2.4–3.4 — five flame ✓ locks: each scale 2→1 + opacity, 0.22s, back.out(3), stagger 0.16; each fires a ring span (absolute, 1px ember border) scaling 1→1.6 with opacity→0 over 0.4s. Competitor ✗ columns above each lock dip to 60% opacity for 0.15s and recover — the lock "presses" the column.
6. t=3.5 — settle. Total 3.5s ≤ 4s budget. Quote/verdict zone stays empty (reserved height) — that emptiness is the setup for the build.

**Idle state.** КейсПодбор row's `flame/30` border breathes opacity 0.5↔0.85, 3s sine yoyo. Every ~7s one random flame ✓ does a 1.06 scale pulse (0.3s). Nothing else moves.

**Build steps.** ONE internal snap, triggered when the speaker reaches «И финальный штрих»: (a) t=0 — five competitor rows dim to 45% opacity (0.4s); quote card rises y:24→0 (0.4s), then the quote types as evidence: SplitText chars, opacity stagger 0.012s (~95 chars ≈ 1.2s), blinking caret span (opacity steps), attribution fades in 0.3s after; (b) t=+1.6 — verdict line SplitText words slam (y:16→0, 0.45s, expo.out) while pentagon DrawSVG strokes 0→100% over 0.8s; as the stroke passes each vertex, the corresponding table ✓ pulses 1.15× (5 synced pulses, 0.16s apart); fill `flame/10` fades in last; (c) desktop footnote «hh.ru · Skillaz · Поток…» fades in at 40% → settles `dim`. Next gesture leaves the slide.

**Product-UX elements.** None of the four reusable mockups — this slide is pure evidence chrome, by design (the table itself is the artifact). The pentagon visually rhymes with the 9-axis process-matrix bars seen on slides 7/8/13: same flame vocabulary, "axes" made literal.

**Transition in.** From slide 11's tipped payback scale: deck-level crossfade; the headline's word-stagger entrance reads as a continuation of 11's stamping cadence («2,5 года» stamp → «Мы не одни…» stamp). No shared elements — clean cut keeps 11's machine self-contained.

**Transition out.** The pentagon and verdict line are the last to fade (0.1s after the rest) as the deck scrolls; slide 13 opens by drawing its roadmap timeline left-to-right — a horizontal stroke answering the pentagon's closed stroke. Five axes sealed → one line forward.

**Reduced motion.** Entire slide renders instantly in post-build final state: full table, competitor rows at 45%, quote + attribution + verdict + drawn pentagon + footnote visible. No build snap point (slide becomes a single scroll stop), no loops, no caret blink.

**Implementation notes.** `components/scenes/12-competitors.tsx` + `verdict-table.tsx` (data-driven: `{name, meta?, cells: boolean[]}`). GSAP: ScrollTrigger (fixation gate + pinned build via one internal snap), SplitText (headline, quote, verdict), DrawSVG (pentagon path). Stamps = nested `<span>` pairs (glyph + ring) animated in one master timeline with staggers; set `will-change: transform` only during entrance, remove on complete. Pentagon = single `<path>`, `stroke-dasharray` driven by DrawSVG. Quote zone uses fixed `min-h` so the build never shifts layout (no CLS). ru typography: «ё», «—», «·» verbatim; Manrope display / Inter body.

**Risks.** (1) 7-column overflow at 1366 — header labels capped at 2 lines via fixed column widths; test «Без живого интервьюера» (longest) at `text-meta`, tighten tracking if it wraps to 3. (2) Mobile vertical-rl Cyrillic headers — verify Inter renders upright-rotated glyphs cleanly at 10px on iOS Safari; fallback: −60° transform rotation on absolutely positioned labels. (3) 22 staggered stamps — single timeline, transform-only, trivially 60fps; never animate borders/shadows, ring pulse is a transform-scaled span. (4) Build-step timing vs speech — quote typing finishes in 1.6s, well inside the speaker's «инкумбент признал» beat; if the speaker triggers the build late, the idle table still reads complete, so nothing depends on timing. (5) Red discipline — ✗ are `dim` gray, zero `leak` on this slide; flame is the only accent, preserving slide 8's red monopoly.


**Director's cut (binding).**
- **Build step CUT** (presenter gesture budget, §1.3): the quote + pentagon sequence auto-chains ~1.5s after the entrance settles (same pattern as 8's mobile leak), killed in `onLeave`. One gesture leaves the slide. The reserved empty quote zone still prevents CLS.
- **No typing, no caret** (§2.3): the quote reveals as a masked line-rise while the flame left-rule draws in (DrawSVG), followed by a line-by-line highlighter sweep down the card — evidence being MARKED, not typed; fits the courtroom register.
- **No staged exit fade** (§2.6): the full table + lit pentagon IS the static freeze-frame; the pentagon→timeline rhyme survives because 13's entrance draws the line.
- **No deck-level crossfade in:** standard snap cut; continuity = stamping cadence only.
- **Mobile headers:** short forms sized for the 96px vertical band — «ИИ в среде / Утечки / Джуны / Без интервью / Кейс / РФ» — with the full six axes in an `sr-only` legend. Never silently truncate the moat axes.
- КейсПодбор row border idle is STATIC (the random ✓ pulse is enough, §2.5).

---

### Slide 13 — Дорожная карта + финал · «Два испытуемых, одна матрица → эпитафия»

**Intent & copy.** Two acts in one pinned slide. Act I sells the +12-month horizon as inevitability: the roadmap draws itself, then the product literally demonstrates the future — a human session and a Claude Code session typing in parallel, graded by ONE shared process matrix. Act II (build step) clears the screen for the refrain and silence — the «Инвестирую!» moment. On-screen copy, verbatim: headline «Это не HR-инструмент. Это категория.»; milestones «Сейчас» / «один шаблон · 10 пилотов · найм джунов», «+6 мес» / «больше ролей и отраслей · генерация под описание архитектуры», «+12 мес» / «оценка ИИ-агентов на той же инфраструктуре», «Долгосрок» / «субстрат оценки интеллекта на работе»; refrain «Результат умер.» / «Процесс — единственное, что осталось измерять.» / «Кем бы он ни был.». Goldman/Cursor numbers stay in the speech only — the «Экран» spec doesn't list them, the speaker owns them. Session chrome (mockup UI): «Сессия #4173 · Анна П. · junior backend» (glass), «Сессия #4174 · Claude Code · агент» (ember).

**Layout — desktop (1366/1920).** Vertical stack inside `.scene-content`, ~700px usable at 768: (1) headline row, `--text-h1`, «Это категория.» in flame, ~80px; (2) timeline strip ~120px — one horizontal SVG spine with 4 nodes; labels above nodes (Manrope semibold), descriptions below at `text-meta text-dim`; «+12 мес» node gets a flame ring + flame-tinted description; (3) the split, ~420px, grid `[1fr_minmax(300px,360px)_1fr]`: left `<CandidateIde compact>` (editor-only, capped ~320px tall), center the new `<DualProcessMatrix>` (9 axes, dense 28px rows), right `<CandidateIde compact>` with agent-flavored editor content. Session labels sit as chips above each IDE. At 1920 the split gets air (max-w-7xl centered). Act II is an absolutely-positioned overlay: three refrain lines, `--text-display`, centered, `max-w-[24ch]` per line with `text-wrap:balance`, line 3 in flame.

**Layout — mobile (375).** Act I compresses: headline at clamp floor; timeline becomes a thin rail of 4 dots + labels only, with a single highlighted card under it showing the «+12 мес» description (the other descriptions are cut — the speaker carries them); IDEs are cut entirely, replaced by the two session chips stacked above one `<DualProcessMatrix>` showing 5 of 9 axes (new `maxAxes` prop) WITH bars (override the existing mobile bars-hidden behavior — dual bars are the money shot). Budget: 60+90+50+260 ≈ 460px < 660 svh. Act II identical, type at clamp floor.

**Signature wow-moment.** One matrix, two fills: every axis bar fills as a bullet chart — an ember bar (agent) racing a glass tick marker (human) on the same track, dual scores ticking up «74 · 81» — the product visibly grading a human and an AI agent with the same instrument. Then the world dims and the epitaph stamps in.

**Animation timeline.** All post-snap. (1) t=0, 0.6s, `expo.out`: SplitText words of headline rise y:24→0, opacity in. (2) t=0.3, 1.2s, `--ease-in-out-quart`: timeline spine DrawSVG 0→100% left-to-right; nodes pop scale 0→1 (`back.out(1.6)`, 0.25s each) as the spine passes; labels/descriptions fade up stagger 0.12. (3) t=1.5, 0.4s: «+12 мес» flame ring strokes itself (DrawSVG on a circle) + one scale pulse 1→1.12→1. (4) t=1.2, 0.7s, `expo.out`: split containers rise y:32→0; both editors begin line-by-line code reveal (lines flip opacity 0→1 with a caret span hopping rows, ~0.35s/line, both columns in parallel — human slightly slower, deliberately human). (5) t=2.0→3.6: DualProcessMatrix fills — 9 axes stagger 0.14s; each ember bar `scaleX` 0→score% (transform-origin left, 0.5s `expo.out`), glass tick lands with a 4px overshoot; dual count-ups via `useCountUp`. Stable and fully readable at ~3.8s.

**Idle state.** Both carets blink (CSS steps, opacity only); every ~4s one more code line reveals in each editor (looping a 6-line buffer); status bar `tests: 12 ✓` ticks to `13 ✓` once; the «+12 мес» ring breathes opacity 0.5↔0.8 at 5s sine. No motion on the matrix after settle.

**Build steps.** ONE, and this slide earns it — it carries the closing line of the entire pitch. Internal snap: next gesture (↓/→/scroll) triggers Act II. t=0, 0.6s `power2.in`: Act I wrapper drops to opacity 0.05, scale 0.97, y:-12 (kills all idle loops). t=0.4: «Результат умер.» — SplitText chars, opacity+y:18→0, 0.5s, stagger 0.02. t=1.3: line 2, same treatment. t=2.3, 1.4s, slow `power1.out`: «Кем бы он ни был.» in flame, plus a radial ember glow div behind it fading to opacity 0.12. t=4.5: glow's breathing loop (2 cycles) kills itself — total stillness. The speaker says the line, the screen holds, 2–3s of silence, jury writes «Инвестирую!». A further gesture does nothing (last slide; snap holds).

**Product-UX elements.** Two `<CandidateIde compact>` (existing, editor-only mode — deliberately avoiding the documented v1 crush of two full IDEs at lg). New `<DualProcessMatrix>` evolved from `process-matrix.tsx`: same card anatomy, but each axis renders one track with ember fill (agent score) + glass tick (human score) + paired score chips; header shows both averages. The agent editor content mirrors the human's task (`process_refund.py`) so «одна задача» reads literally.

**Transition in.** Slide 12 ends on five flame ✓ locks; slide 13's first flame accent is the «+12 мес» ring — the flame literally travels from verdict to horizon. Standard snap; nothing pre-animates during travel.

**Transition out.** None — the deck ends here. End state: near-black field, three lines, faint static ember. Stillness IS the transition.

**Reduced motion.** Both acts render instantly in their final states stacked as one static composition: headline + drawn timeline + filled dual matrix (IDEs static), refrain shown below the split at reduced size (flow, not overlay) so nothing requires a gesture. No loops, no carets.

**Implementation notes.** `components/scenes/13-finale.tsx`; plugins: ScrollTrigger (pin + one internal snap point, same pattern as slide 8), SplitText (headline + refrain — Manrope handles Cyrillic), DrawSVG (spine + ring). Bars animate via `scaleX` on inner divs (kill the component's `transition-all width` for this variant). Code reveal = pre-rendered spans toggled by a single timeline, ≤120 nodes total. Pin via the existing Lenis↔ScrollTrigger glue; keyboard → must map to: build not played → play build; build played → no-op.

**Risks.** (a) 768px overflow: split row is the squeeze — cap IDE editor at 8 lines and matrix rows at 28px; verify at 1366×768 first. (b) Refrain line 2 (41 chars) orphans at display size — `text-wrap:balance` + `max-w-[24ch]` forces an intentional 2-line break. (c) Double-gesture race during Act II type-in — debounce snap input until the build timeline completes (~3.7s). (d) SplitText + Cyrillic kerning at display size — test «единственное» hyphenation off, `white-space` managed per line. (e) FPS: ember glow is one pre-blurred radial-gradient div animated by opacity only — never animate filter/blur.


**Director's cut (binding).**
- **Act I crest (escalation fix):** when both matrix averages lock (~t=3.6), a synchronized «verdict pulse» — one simultaneous flare on the dual score chips, the only moment both columns move as one. This is what keeps the finale above slide 10's dive.
- **Reduced motion keeps the refrain as the overlay** (static, Act I wrapper at its dimmed 0.05/0.97 end state) — identical final frame, zero extra height; the flow-layout fallback in the agent spec violates the 768 budget and is deleted. Dual-matrix content carried by the `sr-only` description.
- «+12 мес» ring breathing idle is the sanctioned callback to slide 4's ring (§2.5).
- Build = shared `usePinnedBuild`; post-epitaph gestures no-op (snap holds; deck ends).
- Frozen state: refrain epitaph over dimmed Act I.


---

## 5 · Mobile deck rules

- Snap magnetism stays on; touch swipe scrolls naturally and magnetizes. No keyboard. *Amended 2026-06-12:* **tap on the current build slide = forward gesture** (finish entrance → play pending build; never navigates).
- Build-step slides auto-chain their build (per-slide delay, §4), with mandatory `onLeave` kill via the shared controller — **except slides 3 and 13 (`autoChainMs: 0`): their builds wait for a tap, never a timer** (amended 2026-06-12). Slide 10 mobile plays a reduced ×3 zoom (not static) — same auto-chain pattern.
- Every slide's mobile budget is computed in its spec; the global floor is **375×620** (small-phone svh), not just 660.
- Bars-on-mobile: `ProcessMatrix` gains an opt-in `barsOnMobile` (default false to protect other call sites); slides 7, 8, 13 set it — the leak crash and the dual-fill are the money shots and must be visible on phones.
- Particle counts halve on mobile (slide 2: 1 mote/tile; slide 5: dot ring radius ~120px; slide 8: same flare, cheaper glow).

## 6 · Performance & accessibility budget

- 60fps on Intel iGPU laptop at 1920 is the bar; profile slides 2 (burn wave) and 8 (flare) there first.
- Transform/opacity/stroke only; `will-change` applied per-window and cleared `onComplete`; pre-rendered gradients for every glow/flare (opacity tweens only); flash overlay is a ~1.2×max-viewport-dimension centered square, absolute in-slide.
- SplitText: gated on `document.fonts.ready`, `revert()` after settle wherever the split is entrance-only (4, 5, 9, 12, 13 headline), re-split on debounced resize. `aria-label` on originals, `aria-hidden` on spans.
- Reduced motion: every slide renders its FINAL (post-build) state instantly; no loops, no flash (slide 5's flash is also a photosensitivity concern — reduced-motion users never see it); slide 13's refrain stays an overlay (identical final frame, no extra height).
- Each slide keeps an `sr-only` paragraph carrying its stats/claims; the deck is fully readable by screen reader in document order.
- WCAG 2.3.1: slide 5 single flash <120ms, never repeated; slide 8 strobe is 3 opacity keyframes over 0.25s, under threshold.

## 7 · Verification checklist

Per slide × {375×620, 375×660, 1366×768, 1920×1080}:
1. Fits one viewport, zero internal scroll, nothing kisses the edges (the v1 «примыкание» bug class).
2. Nothing moves during scroll travel (record 60fps screen capture of a full deck walk; frame-step the boundaries).
3. Entrance settles ≤4s; build one-shots ≤3.2s; idle loops subtle and killed on leave.
4. Back-navigation: walk 13→1 with ←; every slide shows its frozen state instantly, no replays, no half-states.
5. Double-gesture spam on 6/8/10/11/13: no skipped builds, no double-fires.
6. Reduced-motion pass: full deck readable, static, fits.
7. Red audit: zero #ef4444 pixels before slide 8's flare (automated: screenshot-diff slides 1–7 against a red-mask).
8. ru-RU numerals: thin-space thousands, comma decimals, tabular alignment.
9. Keyboard: full pitch driveable with → only; Home/End work; rail dots clickable.
10. Lighthouse: LCP ≤2.0s (slide-1 headline), CLS 0, INP <200ms during deck walk.

## 8 · Build order

1. **Foundations:** deck controller (fixation events, frozen-state engine), `usePinnedBuild`, `useCountUp` v2 paused-mode refactor + call-site migration, deck chrome (rail/counter), slide shell CSS.
2. **Skeleton pass:** all 13 slides as static frozen states with final copy — verify every viewport budget BEFORE motion work.
3. **Motion pass A (spine):** slides 1, 5, 8, 13 — the emotional peaks; validate the contract end-to-end on the hardest cases (load scenario, flash, build+flare, two-act finale).
4. **Motion pass B:** slides 2, 3, 4 (evidence arc), then 6, 7 (product arc), then 9, 10, 11, 12 (business arc).
5. **Critic re-run:** rehearsal recording at 1366×768 against §7; mobile pass; reduced-motion pass.


---

## §7 Verification record — 2026-06-11 (P5, production build)

All gates run against `next build` + `next start`, headless Chromium (Playwright):
1. **Viewport fit:** 13 slides × {375×620, 375×660, 1366×768, 1920×1080} — 0 overflow (audit `audit-p5.mjs`, ISSUES (0)).
2. **Travel stillness:** frozen `gsap.set` on leave verified by mid-travel sampling (slide 8 stable) + frame-stepped P3/P4 integrated runs.
3. **Budgets:** every entrance ≤4.0s readable (worst: 06 at 3.9s), builds ≤3.2s — per-slide agent verification.
4. **Back-walk 13→1:** all frozen states instant, zero replays (twice: P3 + P4 integrated).
5. **Build-slide spam (6/8/10/11/13):** held at midpoint with build consumed, never skipped-with-unbuilt-state (incl. zero-gap key bursts).
6. **Reduced motion:** instant post-build finals, collapsed build wrappers, native jumps, no flash ever (P1 gates + reduced-mode audits).
7. **Red audit:** zero #ef4444 rendered before slide 8's flare across all states (computed-style scan; slide 8 pre-leak verified separately).
8. **ru-RU numerals:** thin-space thousands, comma decimals, U+2212 minus glyph-identical between counters and SSR finals.
9. **Keyboard:** full →-only drive (17 gestures to built finale), Home/End frozen jumps, rail-dot click → frozen state; deck ends in stillness.
10. **Web vitals (production):** LCP 652ms (≤2000), CLS 0.0000, no page errors. INP: gesture handlers are synchronous scroll dispatches; no long tasks observed during the walk.

Deviations from the original spec are recorded inline (§1.4 dormancy amendment; per-slide Director's-cut compliance noted in P3/P4 commit messages).

### §7 Addendum — 2026-06-12 (ui-fixes round: slide 03 build + tap gesture + chart redesign)

Gates run against `npm run dev`, headless Chromium (`/tmp/deck-verify/ui-fix-03b.mjs` + targeted re-checks):
1. **Slide 03 build conversion (1366/1920):** settled = undimmed cards + hidden antithesis; NO auto-dim 6.5s after settle (timer dead); gesture → build (cards 0.05 + line); second gesture → slide 4; back-walk restores frozen built instantly. Registry shows 19 points (new mid for slide 3).
2. **Gesture walk:** full →-only drive now = **18 gestures** to built finale (was 17; slide 3 takes two).
3. **Tap-as-gesture (375×620):** slide 3 — no auto-build 6s after settle; tap plays the build; tap never navigates; extra taps no-op. Slide 13 — no auto-epitaph 5s after settle; tap plays the epitaph (build✓ at ~8.2s incl. glow tail). Tap mid-entrance finishes the entrance (keyboard semantics).
4. **Timer regression:** slide 8 still auto-chains on mobile (~1.5s after settle); `playBuild` kills a pending timer so tap-before-timer can't double-play.
5. **Perception-gap chart, redesign #2 (375/1366/1920 + reduced):** ghost column sits ON the zero line, flame column hangs BELOW it; heights ∝ +20/−19 (ratio 1.053); +20% centered above its column; −19% right of the fallen column, inside the card; both labels padded off the line (the glued-text fix) and clear of columns and numbers — 12 geometry assertions × 4 contexts green.
6. **Reduced motion:** slide 3 renders the built frame (dim 0.05 + intact line + final chart) via the hook's `setFrozen("built")`.
7. Zero page errors in all contexts; `npm run build` + `lint:deck` clean.

### §7 Addendum — 2026-06-13 (ui-fixes round batch 2: slides 13 / 8 / 9 / 6 / 11)

1. **Slide 13 — milestone dots ride the spine:** the `[data-node-dot]` span gets `align-top`. The spine is `top-[5px] h-[2px]` (y 5..7, center 6); a top-aligned 12px (`h-3`) box centers at 6 — exact. The `inline-block` strut preserves the line-box height, so the milestone labels do **not** move (do not use `block`/`absolute` — they collapse the strut and shift labels ~12px up). Same className at all viewports. Verify: `|dotCenterY − spineCenterY| ≤ 1px` for all four dots at 375 / 1366 / 1920, measured at settled.

2. **Slide 8 — ghost travel geometry re-measured at build-play:** the chip-arc travel geometry now re-measures in the build timeline's `onStart` (`measureTravel()`) instead of being baked once at mount; the `ghost-origin` set and `ghost-travel` `motionPath` `.to` are id-tagged and rewritten (fresh path object) + `invalidate()`d at play. Coordinate origin switched from the sticky `.slide` to the `[data-ghost-layer]` containing block (sticky `getBoundingClientRect` reports the flow box, not the pinned-paint box, mid-fixation — the lg/1920 strand). See the slide-08 implementation-note AMENDMENT 2026-06-13. Verified (`/tmp/deck-verify/ui-fix-s8.mjs`, 20/20 green): ghost center inside `[data-input]` ±4px at 1366 & 1920 and after a 1366→1500 in-breakpoint resize (dxOut=dyOut=0.00); <lg tap-build lands the ghost within `[data-msg="leak"]` +24px; `npm run lint:deck` + `npm run build` green; no page errors.

3. **Slide 9 — «заказчик ↔ кандидат» pill removed:** the divider's fog pill node and all its motion references (`const pill`, `setDormant`/`setFrozen` `gsap.set`, entrance `fromTo`) are deleted; zero `pill` identifiers remain in the file. No build step on slide 9, so the 18-build walk is untouched; the pill was `position:absolute`, so the centered `BoundaryLine` does not shift. Verified (`/tmp/deck-verify/ui-fix-s9pill.mjs`, green at 375 / 1366 / 1920): `[data-pill]` count = 0, divider stays centered, no horizontal overflow / scroll delta on slide 9; `npm run lint:deck` green.

4. **Slide 9 — pilot-target metrics + honesty eyebrow:** the admitted-mockup metric values 84% / 9,1/10 / 38% are replaced with pilot targets «завершают сессию» ≥ 70% · «NPS кандидата» ≥ 40 · «фидбэк» 100%, under a new eyebrow «целевые метрики пилота». `MetricChip` gained an optional `prefix` rendered as a STATIC `text-mute` sibling span OUTSIDE the counted node; `data-chip-value` moved onto an inner `<span>` so count-up's per-frame `textContent` rewrite never erases the «≥». «фидбэк 100%» is documented as a product promise («по построению»), not a pitch KPI. Verified (`/tmp/deck-verify/ui-fix-s9metrics.mjs`, green at 375 / 1366 / 1920): the three `[data-chip-value]` spans read exactly «70» / «40» / «100» (full chip text «70%» / «40» / «100%»); no «≥» inside any `[data-chip-value]`; eyebrow is the first `<p>` in the metrics block; «завершают сессию» label not clipped at 375; srSummary no longer contains «84»; `npm run lint:deck` green.
