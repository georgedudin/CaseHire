# CaseHire Landing — Spec

> Evergreen inventory of the Apple-style scroll landing. **Every** scene, **every** block of text, **every** animation, **every** color token. The pitch source is `ru_pitch.md` (slides 1–9 map 1:1 onto scenes `01-hero` → `09-roadmap`); scene copy is verbatim from there. When the layout / motion changes, this file changes with it — no exceptions.
>
> The active diagnosis and remediation plan live in `~/.claude/plans/pull-memory-fluffy-backus.md` and in the commit history on `feat/landing-bootstrap`.

---

## 0 · Scope rails (read first)

- **Target form factors:** phone (≤640 px), laptop (≈1366–1440 px), PC (1920 px+). **No iPad / tablet** in the design budget — the 640–1023 range must not break, but we don't optimize for it.
- **Keyboard nav:** users step scene-by-scene with **Arrow Right / Arrow Left** (and the natural siblings ↓ / ↑ / PgDn / PgUp / Home / End). Implemented in `components/scroll/keyboard-nav.tsx`.
- Tailwind utilities `sm:` (640) and `md:` (768) continue to exist in the codebase as graceful-degradation defaults; we do not invest in them.

## 1 · Context

### 1.1 Why this doc exists

The CaseHire landing (`feat/landing-bootstrap`, 3 commits) renders all 9 pitch scenes + 4 mockups, but the user's eyes-on impression at `npm run dev` is **broken**:

- **Корявое, без переходов** — scenes cut abruptly, no inter-scene hand-off.
- **Примыкание к краю экрана** — content visibly touches the viewport edge.
- **Постоянное наложение айтемов** — items overlap inside scenes and across scene boundaries.
- **Без нормального клиппинга к слайду** — no soft snap / "magnetism" at scene checkpoints (an Apple-style requirement).

`landing.md` is the canonical inventory we work from to fix those bugs without losing fidelity to the locked pitch (`ru_pitch.md`). Every block of text, every animation, every color token is captured here so a fix is a surgical edit rather than a guess.

### 1.2 What this doc commits to

- **§2–§3** are descriptive: foundations + layout primitives that every scene reuses.
- **§4** is the per-scene inventory (1–9) + mockups (4). Russian strings quoted verbatim.
- **§5** is the cross-cutting diagnosis — which symptoms map to which root causes.
- **§6** is the remediation plan — what changes in what file, with the order of execution.
- **§7** is the verification checklist.

Pitch source: `ru_pitch.md` (slides 1–9 map 1:1 onto scenes `01-hero` → `09-roadmap`). Copy in scenes is **verbatim** from the pitch.

---

## 2 · Stack & glue

| Layer | Version / file | Notes |
|---|---|---|
| Framework | Next 16.2.9 (App Router, React 19.2.4, Turbopack) | `app/layout.tsx` mounts Manrope (display) + Inter (sans); both with `subsets: ["latin","cyrillic"]`. |
| Styling | Tailwind 4 (CSS-first via `@import "tailwindcss"` + `@theme {}`) | No `tailwind.config.js`. Tokens live in `app/globals.css`. |
| Motion | GSAP 3.15 + ScrollTrigger | Registered at module load in `lib/gsap-setup.ts` (before any child `useGSAP`). |
| Scroll | Lenis 1.3 (`lenis/react`) | `components/scroll/lenis-provider.tsx`: `autoRaf:false` + `gsap.ticker.add` → single RAF. `prefers-reduced-motion`: glue skipped, native scroll wins. |
| Composition root | `components/landing-scenes.tsx` | `<LenisProvider>` wraps all 9 scenes. |

### 2.1 Hooks (`components/scroll/hooks/`)

- `useCountUp({ to, from=0, duration=1.8, decimals=0, prefix, suffix, locale="ru-RU" })`
  Tweens a number with `Intl.NumberFormat` formatting; fires at `top 80%`, `once:true`. Reduced-motion: snaps to `to` immediately.
- `useReveal({ selector, stagger=0.08, y=24, duration=0.9, once=true, start="top 80%" })`
  Staggered `fromTo(opacity:0→1, y:24→0)` on `selector` children. Reduced-motion: instant final state.

### 2.2 Design tokens (`app/globals.css @theme`)

| Group | Tokens |
|---|---|
| Surfaces | `ink #0a0a0a`, `fog #131316`, `line #1f1f24`, `line-strong #2a2a31` |
| Text | `paper #f5f5f7`, `mute #a1a1aa`, `dim #71717a` |
| Brand & accents | `flame #ff5a1f`, `ember #ff8a4c`, `leak #ef4444`, `trust #22c55e`, `glass #60a5fa`, `sterile #94a3b8` |
| Type clamps | `--text-hero` 44→120px, `--text-display` 36→80px, `--text-h1` 30→56px, `--text-h2` 24→40px, `--text-lede` 18→24px, `--text-body` 16→18px, `--text-meta` 14px |
| Easing | `--ease-out-expo`, `--ease-in-out-quart` |

### 2.3 iOS / accessibility floor (already wired)

- `html { overscroll-behavior:none; }` — kills bounce that would fight Lenis.
- Skip-to-content link styled by `.skip-link`.
- `:focus-visible` outlined in flame at 2px offset 3px.
- Reduced-motion guards present in `LenisProvider`, `useCountUp`, `useReveal`, and the bigger per-scene timelines (`04-reveal`, `06-data-trap`, `09-roadmap`).

---

## 3 · Layout primitives

### 3.1 `<Scene>` wrapper (`components/scroll/scene.tsx`)

```tsx
<Scene id ariaLabel mode="flow"|"pin" pinLength=1.5 background className>
```

- Renders `<section class="scene-shell scene-shell--{mode}">` with an SR-only `<h2>` from `ariaLabel`.
- `mode="flow"` (default): `min-height: 100svh`, no `overflow:hidden`. Content above 100svh scrolls through normally.
- `mode="pin"`: `height: 100svh; overflow:hidden;` AND a GSAP `matchMedia` guard — pin only triggers on `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`. Outside that gate the scene behaves like flow.
- Inner `<div class="scene-stage">` — flex column; pin mode adds `align-items:center; justify-content:center`.
- `contain: layout paint` on every `.scene-shell` isolates CLS per scene.

### 3.2 `.scene-content` (the padding ladder)

```css
.scene-content { max-width: 80rem; margin-inline: auto;
                 padding-inline: 1.25rem; padding-block: 5rem; }
@media (min-width: 640px)  { .scene-content { padding-inline: 2rem; padding-block: 7rem; } }
@media (min-width: 1024px) { .scene-content { padding-inline: 3rem; padding-block: 9rem; } }
```

→ **20 / 32 / 48 px** inline gutters and **80 / 112 / 144 px** block padding. (We will revisit §3.2 in remediation — mobile gutter is part of the edge-touch bug.)

### 3.3 Current scene composition (top → bottom)

| # | File | Mode | Background | Notable embeds |
|---|---|---|---|---|
| 1 | `01-hero.tsx` | flow (no override) | radial flame overlay on ink | — |
| 2 | `02-pain.tsx` | flow | ink | 2 count-ups |
| 3 | `03-interviews.tsx` | flow | ink | 3 cards, flame-ring on card 3 |
| 4 | `04-reveal.tsx` | flow | ink + radial flame 10% | brand wordmark only |
| 5 | `05-how-it-works.tsx` | flow | ink | `CandidateIde` preview (lg+) |
| 6 | `06-data-trap.tsx` | flow + 2-phase ST | ink + tinted panes | `ProcessMatrix` (+ custom dual-chat) |
| 7 | `07-who-fills.tsx` | flow | ink | `HrKanban` + `TeamleadSetup` + `CandidateIde` |
| 8 | `08-market.tsx` | flow | ink | 4 count-ups, pricing grid, 6×6 table |
| 9 | `09-roadmap.tsx` | flow | ink | 2× `CandidateIde` + 2× `ProcessMatrix` |

---

## 4 · Per-scene inventory

### 4.1 Scene 01 — Hero

**File:** `components/scenes/01-hero.tsx` (109 L)

**Intent.** Opening viewport. One thesis, no logos, no icons. Sets the dark-paper tone.

**Wrapper.** `<Scene id="hero">` — flow. Inner stage div: `relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24 sm:px-8 sm:py-32`.

**DOM.**

```
section.scene-shell--flow
  div.scene-stage
    div ref=stageRef [flex center, min-h-svh, overflow-hidden, py-24/sm:py-32]
      div data-spotlight [absolute inset-0, radial flame, opacity 0.6, pointer-events-none]
      p   data-line     [text-meta, tracking-[0.32em], text-mute, mb-8 sm:mb-10]
      h1  data-line     [font-display, --text-hero, text-paper, max-w-[20ch]]
        span.text-flame
      p   data-line     [text-meta, tracking-[0.2em], text-dim, mt-10 sm:mt-14]
      div data-line     [absolute bottom-8 left-1/2 -translate-x-1/2, text-dim]
        span.animate-pulse
```

**Content (render order).**

1. Spotlight overlay: radial-gradient `rgba(255,90,31,0.18)` centered, fading to transparent ~60% out.
2. Eyebrow: `«КейсПодбор · CaseHire»` (uppercase, `0.32em` tracking, `text-mute`).
3. Hero headline `<h1>`: `«Найм джунов в эпоху, `<span class="text-flame">`когда результат больше не сигнал.`</span>`»` — single text-hero clamp, max-width 20ch.
4. Tagline: `«Защита продукта · 2026»` (uppercase, `0.2em` tracking, `text-dim`).
5. Scroll prompt: `↓ листайте` (anchored bottom-8, `text-dim`, Tailwind `.animate-pulse`).

**Colors.** `flame` (accent on the right clause + spotlight), `paper` (h1 base), `mute` (eyebrow), `dim` (tagline + prompt).

**Typography.** `font-display` on h1 with `--text-hero`. `text-meta` (eyebrow/tagline/prompt). Tight tracking via inline `tracking-[…]`.

**Animations.**

- Entry stagger on `[data-line]`: `fromTo(opacity:0→1, y:32→0)`, 1.1 s, `expo.out`, stagger 0.18 s, **delay 0.35 s on mount** (not scroll-triggered).
- Spotlight: yoyo `opacity:0.6 ↔ 0.85`, 3.2 s, `sine.inOut`, repeat infinite.
- Scroll prompt: pure CSS `.animate-pulse`.
- Reduced-motion: lines snap to final state; spotlight stays at 0.6.

**Responsive.** Padding `px-5 py-24` → `sm:px-8 sm:py-32`. `max-w-[20ch]` on h1 at all sizes.

**Issues.**

- Spotlight yoyo never stops — keeps pulsing while user reads scene 02 → distraction.
- Entry tweens fire on mount, not on scroll — wrong if hero is below the fold (rare for hero, but real for resized window / restoration scroll).
- `overflow-hidden` on the stage means the `↓ листайте` prompt is clipped if the viewport ever gets shorter than the headline.
- No exit animation on scroll-out → abrupt cut to scene 02.

---

### 4.2 Scene 02 — Pain

**File:** `components/scenes/02-pain.tsx` (92 L)

**Intent.** Two stark stats explain the junior-hiring crisis; closer line lands the thesis.

**Wrapper.** `<Scene id="pain" ariaLabel="Боль: что не так с джунами в 2026">` — flow.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=revealRef
    p   data-stagger    [text-meta, tracking-[0.3em], text-dim]
    h2  data-stagger    [font-display, --text-display, text-paper]
    div data-stagger.grid.gap-12.lg:grid-cols-2 [mt-14 sm:mt-20 lg:mt-24]
      figure.border-t.border-line-strong [pt-7 sm:pt-8]
        span ref=tamRef  [font-display, --text-hero, text-flame, lh 0.95, tabular-nums]
        figcaption.text-lede.text-mute [max-w-[28ch]]
      figure.border-t.border-line-strong [pt-7 sm:pt-8]
        span ref=samRef  [font-display, --text-hero, text-paper, lh 0.95, tabular-nums]
        figcaption.text-lede.text-mute [max-w-[32ch]]
    p   data-stagger    [text-lede, text-paper, max-w-[44ch], mt-14 sm:mt-20 lg:mt-24]
```

**Content.**

1. Eyebrow: `«02 · Боль»`.
2. Headline: `«Что не так с джунами в 2026?»`.
3. Left stat: `−60%` + caption `«Вакансий начального уровня с 2022 года»` + source `«IEEE Spectrum»`.
4. Right stat: `7%` + caption `«Доля свежих выпускников в найме крупных технокомпаний. Минус 25% только за прошлый год»` + source `«SignalFire 2025»`.
5. Closer: `«Джуны больше никому не нужны.` <span class="text-mute">`А те, что нужны — неотличимы друг от друга.`</span>`»`.

**Colors.** `flame` (−60), `paper` (7%, captions bold spans, closer), `mute` (captions, second half of closer), `dim` (eyebrow + sources), `line-strong` (figure top-borders).

**Typography.** `font-display` on h2 + both stat numbers (`--text-hero`, `tabular-nums`). `text-lede` captions. `text-meta` eyebrow/sources.

**Animations.**

- `useCountUp` ×2: `{to:60, prefix:"−", suffix:"%"}` (initial DOM text `«−0%»`); `{to:7, suffix:"%"}` (initial `«0%»`). Fires at `top 80%`, 1.8 s, `expo.out`, `once:true`.
- `useReveal` on `.scene-content`: `[data-stagger]` stagger 0.12 s, y 32. Applies to eyebrow → h2 → grid → closer.

**Responsive.** Grid 1-col mobile → `lg:grid-cols-2`. Gap `12 → 16 → 20`. Captions clamped 28/32 ch; closer 44 ch.

**Issues.**

- Two huge `--text-hero` numbers side-by-side at the **sm–md** range (640–1023 px) where grid is still 1-col but numbers are already at full clamp → enormous vertical bleed.
- No bottom block margin → closer can visually merge with scene 03's eyebrow.
- Entry stagger has no exit reverse — count-ups stay at final value forever (fine), but the reveal y-translate doesn't undo (also fine but means re-scroll feels static).

---

### 4.3 Scene 03 — Interviews

**File:** `components/scenes/03-interviews.tsx` (149 L)

**Intent.** Three "крик души" cards from 16 interviews; the 8/8 candidate card is the flame-highlighted closer.

**Wrapper.** `<Scene id="interviews" ariaLabel="16 глубинных интервью">` — flow.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=revealRef
    p   data-stagger              [eyebrow]
    h2  data-stagger.font-display
      «16 интервью. Услышали » span.text-flame«одно и то же.»
    p   data-stagger.text-lede.text-mute
    ul  data-stagger.grid.md:grid-cols-3
      li  data-stagger             ← Card 1: HR 6/8
      li  data-stagger             ← Card 2: HR 5/8
      li  data-stagger             ← Card 3: Candidate 8/8, border-flame/40 ring-1 ring-flame/20
    dl  data-stagger.md:grid-cols-2
      div  ← "+ 7/8 HR …"
      div  ← "+ 7/8 candidates …"
```

**Content.**

1. Eyebrow: `«03 · Глубинные интервью»`.
2. Headline: `«16 интервью. Услышали `<span class="text-flame">`одно и то же.`</span>`»`.
3. Subhead: `«8 нанимающих менеджеров + 8 кандидатов-джунов.»`.
4. Card 1 — badge `«HR»`, fraction `«6/8»`, quote `«Все резюме одинаковые. Я не могу отфильтровать никого до собеса.»`.
5. Card 2 — badge `«HR»`, fraction `«5/8»`, quote `«Домашние тестовые обесценились. ChatGPT решает за кандидата.»`.
6. Card 3 (flame highlight) — badge `«Кандидат»`, fraction `«8/8»`, quote `«После отказа — просто тишина. Месяц молчания.»`.
7. Strip: `«7 из 8 HR: «Хотим предфильтр до часа собеседования.»»`.
8. Strip: `«7 из 8 кандидатов: «Короткие практические задачи с реальным контекстом — это честный формат.»»`.

**Colors.** `paper` (headlines + quote bodies), `flame` (accent text, card 3 ring/border, `+` sign on strip), `dim` (separator dots + card 1–2 right badge), `mute` (subhead), `line-strong` (default card borders).

**Typography.** `font-display` + `--text-display` on h2 and on fraction numerators. `text-meta` on badges + strip. `text-lede` on quotes. `text-paper` quote bodies.

**Animations.**

- `useReveal` with `[data-stagger]`, stagger 0.14 s, y 32. **Selector matches both the parent `ul` AND its children** — that produces a nested stagger (parent fades, then each `<li>` fades on top of that). Slight visual jitter, not strictly a bug but worth tightening.
- No `useCountUp` on the fractions — they're static `<span>{card.numerator}</span>` text. (Pitch script reads "6 из 8" etc. with emphasis — animating the numerator counting up to 6, 5, 8 would land the beat harder.)
- Card 3 highlight is **static** — no pulse, no glow drift.

**Responsive.** Cards stack < `md`, 3-col `md+`. Card padding `p-6 → sm:p-7 → lg:p-8`. Strip 1-col mobile → 2-col `md+`.

**Issues.**

- Long card 2 quote (`«Домашние тестовые обесценились…»`) wraps inconsistently — at `md` (where 3-col first activates) the column is narrow and the quote can take 4–5 lines while card 1 takes 3. → **uneven card heights** — exactly the kind of "наложение" the user reported.
- Card 3 has the strongest emotional weight but no motion to match the pitch ("восемь из восьми. восемь из восьми").
- Strip `+ 7 из 8` and the eyebrow `+` sibling pattern uses thin Russian quotes inside Russian quotes (`«…«…»»`) — semantically fine, visually busy.

---

### 4.4 Scene 04 — Reveal

**File:** `components/scenes/04-reveal.tsx` (139 L)

**Intent.** Brand moment. Intro line → wordmark wall (CaseHire + КейсПодбор) → tagline.

**Wrapper.** `<Scene id="reveal">` — flow. Stage `flex flex-col items-center justify-center min-h-svh`. Radial flame overlay at 10% opacity.

**DOM.**

```
section.scene-shell--flow
  div.scene-stage [flex center, min-h-svh]
    div aria-hidden [absolute, radial flame 10%]
    p   data-intro   [--text-h1, text-paper, mute on second half]
    div [flex flex-col items-center gap-3 sm:gap-4]
      span data-brand [font-display, --text-hero, text-paper, lh 0.95, tracking -0.04em]
        «CaseHire»
      span data-brand [font-display, --text-hero, text-flame, lh 0.95]
        «КейсПодбор»
    p   data-tagline  [text-lede, text-mute base + text-paper highlights]
```

**Content.**

1. Intro: `«Мы знаем, `<span class="text-mute">`что нужно делать.`</span>`»` (h1-scale).
2. Brand wordmark stack:
   - `CaseHire` in `paper`.
   - `КейсПодбор` in `flame`.
3. Tagline: `«Платформа, которая измеряет `<span class="text-paper">`не то, что джун производит — а то, как он работает.`</span>`»`.

**Colors.** `paper` + `flame` on wordmarks; radial flame 10% behind. `mute`/`paper` mix on tagline.

**Typography.** `font-display` everywhere; `--text-h1` intro; `--text-hero` brand; `--text-lede` tagline. Tracking `-0.04em` on wordmarks.

**Animations.**

- Intro: `opacity:0→1, y:24→0`, 0.7 s, `expo.out`. ScrollTrigger `start:"top 70%"`, `toggleActions:"play none none reverse"`.
- Wordmarks: `opacity:0→1, scale:0.78→1, filter:blur(14px)→blur(0)`, 0.9 s, `expo.out`, stagger 0.18 s, delayed +0.15 s after intro.
- Tagline: `opacity:0→1, y:18→0`, 0.6 s. Overlaps brand by `-0.2 s`.
- Reduced-motion: all instant.

**Responsive.** Stage padding `py-24/sm:py-32` and `px-5/sm:px-8`. No max-width on wordmark spans.

**Issues.**

- `--text-hero` at 1440 px+ peaks at 7.5 rem (120 px) and tracking is tight (`-0.04em`). `КейсПодбор` is 10 chars × ~75–90 px effective per char → can hit ~800–900 px. Stage padding-inline is only 48 px at lg → wordmark may bleed right edge on 1024 px viewports.
- Blur 14 px at scale 0.78 looks soft on some GPUs; not a bug but worth pinning ease-out timing.
- No exit motion — wordmark stays at scale 1, and on scroll-out the next scene just appears.
- This is the **only** scene that's a strong candidate for `mode="pin"` with scrub (short, fits in one viewport), but it's currently flow. Pinning here would deliver the "Apple flash" moment the pitch describes ("микро-пауза. Вспышка.").

---

### 4.5 Scene 05 — How It Works

**File:** `components/scenes/05-how-it-works.tsx` (139 L)

**Intent.** Three step cards (Тимлид → Кандидат → Платформа), then a candidate-IDE preview at `lg+`.

**Wrapper.** `<Scene id="how-it-works" ariaLabel="Как это работает: три шага">` — flow.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=revealRef
    p   data-stagger.text-meta
    h2  data-stagger.font-display.--text-display
      «Три шага. Один проход. » span.text-mute«Без интеграций.»
    ol  role="list".grid.gap-5.md:grid-cols-3
      li data-stagger    ← Step 01 (4 bullet points + aside)
      li data-stagger    ← Step 02
      li data-stagger    ← Step 03
    div data-stagger.hidden.lg:block
      <CandidateIde className="mx-auto max-w-5xl" />
```

**Content (verbatim).**

1. Eyebrow: `«05 · Как это работает»`.
2. Headline: `«Три шага. Один проход. `<span class="text-mute">`Без интеграций.`</span>`»`.
3. **Step 01** — `«01»` (flame), badge `«Один раз»`, role `«Тимлид»`, title `«Описывает 4 слоя»`, bullets:
   - `«Стек или архитектура — паттерн или абзац описания.»`
   - `«Идентичность команды — 5–7 ответов «как мы работаем».»`
   - `«Бизнес-контекст — что строит компания, в 7 строках.»`
   - `«Задача под позицию — 1–3 строки самой ценной работы джуна.»`
   - Aside: `«Никакой выгрузки базы кода. Никакой синхронизации с Atlassian.»` (italic, `text-mute`).
4. **Step 02** — `«02»` (flame), badge `«30 секунд»`, role `«Кандидат»`, title `«Заходит в веб-IDE»`, bullets:
   - `«Кликает по ссылке из отклика.»`
   - `«Через 30 секунд внутри полноценной веб-IDE.»`
   - `«Синтетическая база, живая БД, сервисы-заглушки.»`
   - `«ИИ-напарник в чате — знает базу кода и команду.»`
   - Aside: `«Работает, как в первый день в офисе.»`.
5. **Step 03** — `«03»` (flame), badge `«Каждое действие»`, role `«Платформа»`, title `«Записывает процесс»`, bullets:
   - `«Какие файлы открыл первыми.»`
   - `«Какие вопросы задал двум чатам.»`
   - `«Какие тесты прогнал, где остановился перед опасной командой.»`
   - `«Где ИИ наврал — и заметил ли он.»`
   - Aside: `«Тимлид получает не код. А ранжированную ленту, матрицу процесса и кнопку «посмотреть запись сессии».»`.
6. **IDE preview** — `<CandidateIde className="mx-auto max-w-5xl" />`, `aria-hidden`, visible only at `lg+`.

**Colors.** Card surface `bg-fog`, border `border-line-strong`. Step numbers + bullet glyphs in `flame`. Body in `paper`/`mute`/`dim`. IDE preview brings in `leak/trust/glass/sterile` from the mockup.

**Typography.** `font-display` for h2 + step numbers + card titles (`--text-h2`). `text-meta` body. Asides italic.

**Animations.** `useReveal` only — stagger 0.1, y 28, `expo.out`, `top 80%`. Five top-level stagger targets (meta, h2, 3 cards, IDE).

**Responsive.** Cards: 1-col mobile, 3-col at `md+`. IDE preview `lg+` only.

**Issues.**

- **Pitch says "три блока в ряд, с иконками и стрелочками между ними".** The code has no SVG arrow connectors between cards. → narrative beat missing.
- IDE preview at `lg+` is visually heavy (`shadow-2xl shadow-ink/50` + `border-line-strong` + full editor with chat panes). Right below scene 05 sits scene 06's own dual-chat layout. → the **two IDE-shaped surfaces are stacked back-to-back with no transition** — exactly the "наложение" the user flagged.
- No cap on card content height → in the 3-col `md` layout, varied bullet lengths make uneven heights.
- IDE preview is `aria-hidden` (correct — it's decorative) but its mockup is _the same_ component reused in scene 06 + 07 + 09, with no visible affordance distinguishing "preview" from "real product". This is a brand consistency win and a "wait, didn't I just see this?" risk simultaneously.

---

### 4.6 Scene 06 — Data Trap (the UTP showpiece)

**File:** `components/scenes/06-data-trap.tsx` (257 L)

**Intent.** OPSEC honeypot demonstrated: trusted buddy (left) vs. untrusted external chat (right). On scroll, the external chat **swaps** to a leaked-CSV bubble; the process matrix's "Цифровая гигиена" axis pulses red. This is the pitch's strongest single beat.

**Wrapper.** `<Scene id="data-trap" ariaLabel="…">` — flow + custom 2-phase ScrollTrigger choreography.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=stageRef
    p   data-panel.text-meta       ← eyebrow
    h2  data-panel.font-display    ← title (flame on "Одна граница.")
    div.grid.lg:grid-cols-2
      article data-panel           ← LEFT pane (border-trust/30, bg-fog)
        header.text-trust          ← trust-dot + "ИИ-напарник" + "в курсе проекта"
        p.text-mute                ← "знает базу кода · знает команду · знает задачу"
        div.space-y-2              ← <Bubble> ×3 (trust tone)
        footer.text-paper          ← "Доверенный канал. Чувствительные артефакты — можно."
      article data-panel           ← RIGHT pane (border-line-strong)
        header.text-sterile        ← sterile-dot + "Внешний публичный чат" + badge "ПУБЛИЧНЫЙ"
        p.text-mute                ← "сторонний сервис · не знает контекста"
        div.relative.min-h-[6.5rem]
          div data-msg="safe"      ← safe Bubble (sterile tone, side="me")
          div data-msg="leak" hidden ← leaked Bubble (leak tone, side="me")
        div data-leak-flag hidden  ← "⚠ обнаружена утечка: customers.csv · точное совпадение"
        footer.text-paper          ← "Недоверенный канал. Чувствительные артефакты — нельзя."
    div.grid.lg:grid-cols-2
      div data-matrix              ← <ProcessMatrix leakLabel="Цифровая гигиена" subtitle="…"/>
      figure data-quote            ← Cyberhaven citation
```

**Content (verbatim).**

1. Eyebrow: `«06 · Ещё одно»`.
2. Title: `«Два чата. `<span class="text-flame">`Одна граница.`</span>`»`.
3. Left header: green dot + `«ИИ-напарник»` + `«в курсе проекта»`.
4. Left subtitle: `«знает базу кода · знает команду · знает задачу»`.
5. Left bubbles (tone="trust"):
   - them: ``«Файл `customers.csv` помечен `**`персональные данные`**`. Внутри кейса можно работать с ним напрямую.»``
   - me: ``«окей. как переписать `stripe.Refund.create` на батч?»``
   - them: `«Покажу на 5 строках — пробежим вместе.»`
6. Left footer: `«Доверенный канал. `<span class="text-mute">`Чувствительные артефакты — можно.`</span>`»`.
7. Right header: gray dot + `«Внешний публичный чат»` + chip `«ПУБЛИЧНЫЙ»`.
8. Right subtitle: `«сторонний сервис · не знает контекста»`.
9. Right safe bubble (tone="sterile", default visible): `«как переписать stripe.Refund.create на батч?»`.
10. Right leak bubble (tone="leak", visible after Phase B):
    `«перепиши на батч — вот данные: name,email,charge_id,amount`<br>`Маркова,Е.,m@…,ch_3Pq…,4500…»`.
11. Leak flag: `«⚠ обнаружена утечка: customers.csv · точное совпадение»`.
12. Right footer: `«Недоверенный канал. `<span class="text-mute">`Чувствительные артефакты — нельзя.`</span>`»`.
13. `<ProcessMatrix subtitle="Карточка кандидата · в реальном времени" leakLabel="Цифровая гигиена" />` — clamps that axis to ≤18, label turns red, bar `animate-pulse`.
14. Citation: `«`<span class="text-flame">`11%`</span>` всего, что вставляют в ChatGPT — внутренняя информация.»` + `«Каждый одиннадцатый сотрудник. Это и есть навык, которого нет ни у одного конкурента.»` + caption `«Cyberhaven · телеметрия 1,6 млн сотрудников»`.

**Colors.** `trust` (left pane border/dot/header + bubble bg `trust/10`), `sterile` (right pane dot/header), `line/line-strong` (right pane chrome), `leak` (right leak bubble + flag + matrix pulse axis), `flame` (11% + title accent), `paper`/`mute`/`dim` (body hierarchy).

**Typography.** `font-display` on h2 + on the 11% glyph. `text-meta` on header/footer chrome. `<code>` inherits text color; file paths in bubbles are wrapped in `<code>` tags.

**Animations.**

- **Phase A** — entry. ST start `top 75%`, `toggleActions:"play none none reverse"`.
  - `panels` (the 2 articles): `from {opacity:0, y:36}` → `to {opacity:1, y:0, stagger:0.16, dur:0.8, expo.out}`.
  - `matrix`: `from {opacity:0, y:28}` → `to {opacity:1, y:0, dur:0.7}`, position `-0.3` (overlaps panel end).
  - Quote NOT animated in Phase A.
- **Phase B** — leak reveal. ST start `top 35%`, `toggleActions:"play none none reverse"`.
  - safe msg: `{opacity:0, dur:0.25}`.
  - leak msg: `{opacity:1, dur:0.35}`, position `-0.1`.
  - leak flag: `{opacity:1, y:0, dur:0.3}`, position `-0.1`.
  - matrix axis pulse: CSS-only (`animate-pulse` from Tailwind keyframes) — toggles via `leak && axis.label===leakLabel` in the mockup.
  - quote: `{opacity:1, y:0, dur:0.45}`, position `-0.05`.
- Reduced-motion: all set to final state; safe msg hidden.

**Responsive.** Grid stacks at `<lg`, side-by-side at `lg+`. `ProcessMatrix` bars are `hidden sm:block` — on phones only scores show, no bars. Chat bubble max-width `92%`.

**Issues.**

- **Phase B fires while Phase A may still be running on fast scroll** (`top 75%` to `top 35%` is only ~40% viewport away). State swaps don't conflict (absolute positioning + opacity), but visually Phase A's panel slide may not be settled when the leak fires.
- **Two ScrollTriggers** instead of one timeline scrubbed by progress → no way for a snap mechanism to lock the user "between phases" cleanly. We want this scene to feel like *one stage* with the leak as its climax. → primary candidate for `mode="pin"` with a scrubbed timeline at lg+.
- ProcessMatrix bars hidden on mobile means the leak pulse is **invisible on mobile** — and this is the UTP scene. → on mobile we must replace bars with a vertical strip indicator or at minimum colorize the score text + add a label tag.
- Long file paths in code bubbles may wrap into IDE chrome at `sm` widths.
- Right pane uses `min-h-[6.5rem]` to reserve room for the swap. Long Russian content can overflow that band before Phase B if browser font metrics differ.

---

### 4.7 Scene 07 — Who Fills (B2B2C)

**File:** `components/scenes/07-who-fills.tsx` (197 L)

**Intent.** Three user types across the marketplace boundary — HR + Тимлид (buyer side) ↔ Кандидат (candidate side). Closes pitch criterion #3.

**Wrapper.** `<Scene id="who-fills" ariaLabel="Кто что заполняет: две аудитории">` — flow.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=revealRef
    p   data-stagger    ← eyebrow "07 · Кто что заполняет"
    h2  data-stagger.font-display
      «Один продукт. » span.text-flame «Две аудитории первого класса.»
    div data-stagger    ← BUYER section
      SectionLabel tone="buyer"  ← "Сторона заказчика" (text-glass)
      div.grid.md:grid-cols-2
        Column         ← HR · кабинет → <HrKanban>
        Column         ← Тимлид · настройка → <TeamleadSetup>
    div data-stagger aria-hidden ← divider with chip "заказчик ↔ кандидат"
    div data-stagger    ← CANDIDATE section
      SectionLabel tone="candidate" ← "Сторона кандидата" (text-flame)
      div.grid.md:grid-cols-[2fr_1fr]
        Column         ← Кандидат · веб-IDE → <CandidateIde>
        div            ← health metrics strip (3 Metric cards) + caption
    p   data-stagger    ← footer paragraph
```

**Content.**

1. Eyebrow: `«07 · Кто что заполняет»`.
2. Headline: `«Один продукт. `<span class="text-flame">`Две аудитории первого класса.`</span>`»`.
3. Buyer label: `«Сторона заказчика»` (text-glass chip).
4. HR column — tag `«HR · кабинет»`, `<HrKanban />`, caption `«Канбан позиций и ранжированная лента кандидатов. Самая частая поверхность — спроектирована под скорость.»`.
5. Teamlead column — tag `«Тимлид · настройка»`, `<TeamleadSetup />`, caption `«Заполняет четыре слоя один раз. Дальше — превью кейса, одобряет и забывает.»`.
6. Divider chip: `«заказчик ↔ кандидат»`.
7. Candidate label: `«Сторона кандидата»` (text-flame chip).
8. Candidate column — tag `«Кандидат · веб-IDE»`, `<CandidateIde />`.
9. Health metrics strip — tag `«Здоровье воронки»`, 3 `<Metric>` cards: `«73% завершили»`, `«+58 NPS»`, `«34% вернулись»`.
10. Metric caption: `«После сессии — портативный артефакт-портфолио, который кандидат прикрепит к будущим откликам.»`.
11. Footer: `«Доля завершивших и NPS кандидата — `<span class="text-paper">`опережающие индикаторы здоровья всей платформы.`</span>` Поэтому сторону кандидата мы проектируем как продукт первого класса, а не как «форму отклика».»`.

**Colors.** `glass` for buyer section accents; `flame` for candidate section + headline accent; `line-strong` for divider lines; `fog` for metric card surfaces; `paper`/`mute`/`dim` for body hierarchy; mockup palettes brought in.

**Typography.** `font-display` on h2 + `--text-display`. `text-meta`/`text-[10px]` for tags + chips. `text-lede` for footer with paper emphasis. Metric values `font-display` h2-scale.

**Animations.** `useReveal` only — 0.12 s stagger, y 28. ~6–7 sequential reveal waves. **No count-up on metrics** (73%, +58, 34% are static).

**Responsive.**

- HR + Teamlead grid: `md:grid-cols-2` (i.e. 2-col from `md`); stacks below.
- Candidate column: `md:grid-cols-[2fr_1fr]` (IDE wide + metrics sidebar).
- CandidateIde inside scales via its own breakpoints: `<sm` editor-only, `sm+` editor + stacked chats, `md+` tree + editor + chats.
- Divider: always horizontal with a centered chip — no vertical fallback.

**Issues.**

- **Three heavy mockups in one scene** → vertical bloat. On mobile (everything stacks): HrKanban ~250 px + TeamleadSetup ~350 px + CandidateIde ~450–500 px + the rest → easily 2,000 px of scene. Without snap, the user wanders.
- Mockup `shadow-2xl shadow-ink/40-50` bleeds outside the round-2xl card; with `contain: layout paint` on scene-shell, the shadow is clipped — which actually mutes the design intent.
- `«заказчик ↔ кандидат»` chip is `text-[10px]` — invisible on small screens; the boundary metaphor doesn't read.
- Metrics are static — pitch script says "опережающие индикаторы здоровья" with emphasis; count-up on 73% / +58 / 34% would land it.
- No inter-scene cushion vs. scene 06 (matrix-heavy) or scene 08 (stats-heavy). Three IDE-shape components in scenes 5/6/7 in a row reuse the same visual surface → fatigue.

---

### 4.8 Scene 08 — Market / Pricing / Competitors

**File:** `components/scenes/08-market.tsx` (312 L)

**Intent.** Three sub-panels in one scroll: market sizing (4 stats), pricing (4 tariffs), competitors (6×6 table). Closes pitch criteria #2 (УТП) and #4 (монетизация).

**Wrapper.** `<Scene id="market" ariaLabel="Рынок, монетизация и конкуренты">` — flow. (No pin: scene is too tall.)

**DOM (sub-panels delineated).**

```
section.scene-shell--flow
  div.scene-content ref=revealRef

    p   data-stagger    ← "08 · Рынок · Цена · Конкуренты"
    h2  data-stagger.font-display
      «Рынок есть. » span.text-flame «Защищаемая ниша на нём — наша.»

    section data-stagger      ← 8a · MARKET STATS
      .grid.gap-8.sm:grid-cols-2.lg:grid-cols-4
        <Stat ref=tam      highlight />  ← 99.3
        <Stat ref=sam                 />  ← 3.85
        <Stat ref=adopt               />  ← 43
        <Stat ref=planning            />  ← 27
    p   data-stagger      ← "SOM 24 мес: 20–35 млн ₽ / 50–80 платящих компаний"

    section data-stagger      ← 8b · PRICING
      .grid.gap-4.sm:grid-cols-2.lg:grid-cols-4
        <Tariff …>  ← Пилот
        <Tariff … featured>  ← Команда (border-flame/50 + ring-flame/30 + badge "основной")
        <Tariff …>  ← Рост
        <Tariff …>  ← Энтерпрайз
    div data-stagger.grid.sm:grid-cols-2 [cost notes]
      p          ← "Себестоимость сессии: $1–3 …"
      p border-flame/30 ← "Один предотвращённый плохой найм …"

    section data-stagger      ← 8c · COMPETITORS
      div.-mx-5.overflow-x-auto.px-5.sm:-mx-8.sm:px-8.lg:mx-0
        table.min-w-[760px].border-separate
          thead/tbody  ← 6 rows × 6 cols
          (sticky left-0 z-10 bg-ink on first column)
      p   data-stagger
        «Защищаемая ниша: 5 осей — ловушка на данные + джуны + асинхронность + кейс + РФ. Пять осей. Не пересекаются ни с одним крупным игроком.»
```

**Content (verbatim).**

**8a · Market stats:**

| ref | from | to | format | label | note |
|---|---|---|---|---|---|
| tam (highlight) | 0 | 99.3 | decimals:1, suffix:" млрд ₽" | «TAM · HR-tech РФ» | «+38% за год · Smart Ranking» |
| sam | 0 | 3.85 | decimals:2, suffix:" млрд ₽" | «SAM · оценка и развитие» | «+38% за год · Smart Ranking» |
| adopt | 0 | 43 | suffix:"%" | «Уже используют ИИ в HR» | «Известия · 2025» |
| planning | 0 | 27 | suffix:"%" | «Тестируют для 2026» | «Известия · 2025» |

SOM caption: `«SOM 24 мес: `<span class="text-paper">`20–35 млн ₽ годового дохода`</span>` · 50–80 платящих компаний в среднем тариф»`.

**8b · Pricing:**

| Tariff | Price | Period | Limit | Note |
|---|---|---|---|---|
| Пилот | 15 000 ₽ | за 1 позицию | до 100 кандидатов | «Первое касание» |
| **Команда** (featured) | 49 000 ₽ | в месяц | 5 позиций · 1 000 кандидатов | «Основной тариф» + badge «основной» |
| Рост | 149 000 ₽ | в месяц | 20 позиций · 4 000 кандидатов | «+ расширенная аналитика» |
| Энтерпрайз | от 400 000 ₽ | в год | под заказ | «+ локальное развёртывание» |

Cost notes:
- `«Себестоимость сессии: $1–3. Контейнер + токены ИИ-напарника. Оплата только за завершённые сессии — не лицензионная подписка.»`
- (flame border) `«Один предотвращённый плохой найм окупает тариф «Команда» на 2,5 года (SHRM: 100% годовой зарплаты на замену).»`.

**8c · Competitors (6 × 6).** Headers: `«ИИ в среде | Канал на утечки | Под джунов | Без живого интервьюера | Кейс под позицию | Локально в РФ»`. Rows:

| Player | ● / ○ |
|---|---|
| HackerRank | ● ○ ○ ● ● ○ |
| Codility · Cody | ● ○ ○ ● ○ ○ |
| CodeSignal · Cosmo | ● ○ ○ ● ○ ○ |
| hh.ru | ○ ○ ● ○ ○ ● |
| Karat NextGen | ● ○ ○ ○ ○ ○ |
| **КейсПодбор** | ● ● ● ● ● ● (flame on row name + all but first cell; trust on first cell) |

Niche caption (`data-stagger`): `«Защищаемая ниша: ловушка на работу с данными + ориентация на джунов + асинхронность + кейс под позицию + локальное развёртывание в РФ. `<span class="text-paper">`Шесть фичей.`</span>` Не пересекаются ни с одним крупным игроком.»`.

**Colors.** `flame` (headline accent, Команда price/header, КейсПодбор row label + i≥1 cells); `trust` (competitor `●` and КейсПодбор's i=0 cell); `paper`/`mute`/`dim` (text hierarchy); `bg-flame/5` (КейсПодбор row tint); `bg-fog` (card/stat surfaces); `border-line-strong` (default borders); `border-flame/30` (cost note 2); `border-flame/50 + ring-flame/30` (Команда card highlight).

**Typography.** `font-display` on h2 (`--text-display`); on stat numbers (`--text-h1`, tabular-nums); on tariff prices (`--text-h2`, tabular-nums). `text-meta` everywhere else. Table cells `text-center` glyphs.

**Animations.**

- 4 independent `useCountUp` instances — fire on each Stat's own viewport entry; `expo.out` 1.8 s; `ru-RU` thin-space thousands.
- One `useReveal` on the scene-content with selector `[data-stagger]`, stagger 0.1 s, y 28. Triggers eyebrow → h2 → stats section → SOM caption → pricing section → cost notes → competitor section → niche paragraph as one cascade.
- **No per-row reveal on the competitor table** (it's wrapped in a single `data-stagger`). No flash on the КейсПодбор row — only static tint.

**Responsive.**

- Stats: 1-col mobile → 2-col `sm` → 4-col `lg`.
- Tariffs: 1-col mobile → 2-col `sm` → 4-col `lg`. Cards `p-5 sm:p-6`.
- Table: `-mx-5 overflow-x-auto px-5` mobile (full-bleed scroll), `-mx-8 px-8` `sm+`, `mx-0` `lg`. First column `sticky left-0 z-10 bg-ink`.

**Issues.**

- **The horizontal scroll on the table = literal "примыкание к краю экрана"** — the table breaks out of the scene-content gutter on purpose, sitting flush against the viewport edges on mobile/tablet. There's **no scroll affordance** (no scrollbar styling, no edge fade, no "swipe →" hint), so users don't realize the right two columns (Кейс под позицию, Локально в РФ) exist on mobile — exactly the two cells that matter for our УТП.
- Scene is **very tall** — three sub-panels in one flow. On mobile, ~2,500 px tall. Without snap or pin, users skim past the most defensible beat (the table).
- Tariff cards at exactly `sm` (640 px) breakpoint: 2-col + gap-4 + p-6 → cards ≈300 px wide, total ≈616 px in a 640 px viewport with 32 px gutter → 8 px margin per side. Visually tight; on actual 640 px devices (rare but possible), cards kiss the edges of the scene-content gutter.
- Команда card highlight is correct visually but has no scroll-driven pulse / no "pick me" beat. The pitch script says "Основной тариф" with weight — we should land that.
- 4 count-ups firing on different scroll positions = staggered enter, which is fine; but the SOM caption (mt-8) appears *between* the stat grid and the pricing grid, easy to miss.

---

### 4.9 Scene 09 — Roadmap & finale

**File:** `components/scenes/09-roadmap.tsx` (241 L)

**Intent.** Four-point roadmap + human vs. agent split (the bonus criterion bait) + 3-line refrain. Closes the pitch.

**Wrapper.** `<Scene id="roadmap" ariaLabel="Дорожная карта и финал">` — flow.

**DOM.**

```
section.scene-shell--flow
  div.scene-content ref=revealRef
    p   data-stagger          ← "09 · Куда мы идём"
    h2  data-stagger.font-display
      «Это не HR-инструмент. » span.text-flame «Это категория.»
    ol  role="list".grid.gap-4.sm:grid-cols-2.lg:grid-cols-4
      li data-stagger  ← Сейчас (v1)
      li data-stagger  ← +6 мес (v2)
      li data-stagger  ← +12 мес (v3, highlight: border-flame/40 + ring-flame/30)
      li data-stagger  ← Долгосрок (категория)
    div.mt-14.sm:mt-20            ← SPLIT SCENE
      p data-stagger             ← prompt line
      div.grid.gap-6.lg:grid-cols-2
        div data-stagger         ← LEFT: human session
          SessionLabel tone="human"  ← "Сессия #4173 · Анна П. · junior backend"
          <CandidateIde />
          <ProcessMatrix subtitle="…" />
        div data-stagger         ← RIGHT: agent session
          SessionLabel tone="agent"  ← "Сессия #4174 · Claude Code · агент"
          <CandidateIde leak />
          <ProcessMatrix subtitle="…" leakLabel="Калибровка ИИ" />
    div ref=closingRef.mx-auto.mt-20.max-w-[40ch].text-center
      p data-closing-line       ← «Результат умер.»
      p data-closing-line       ← «Процесс — единственное, что осталось измерять.»
      p data-closing-line.text-flame ← «Кем бы он ни был.»
```

**Content (verbatim).**

1. Eyebrow: `«09 · Куда мы идём»`.
2. Headline: `«Это не HR-инструмент. `<span class="text-flame">`Это категория.`</span>`»`.
3. Milestones (MILESTONES array):
   - **Сейчас (v1):** `«Один шаблон. Десять пилотов.»` + `«Найм джунов. Мы сфокусированы. Мы выпускаем.»`.
   - **+6 мес (v2):** `«Больше ролей. Больше отраслей.»` + `«Tier 2: генерация под описание архитектуры.»`.
   - **+12 мес (v3, flame ring):** `«Та же инфраструктура — для ИИ-агентов.»` + `«Cursor. Claude Code. Devin. Та же матрица процесса.»`.
   - **Долгосрок (категория):** `«Субстрат для оценки интеллекта на работе.»` + `«Кем бы он ни был.»`.
4. Split prompt: `«Одна задача · одна матрица процесса · два испытуемых»`.
5. Left session: `«Сессия #4173 · Анна П. · junior backend»` (glass tone) + clean `<CandidateIde />` + `<ProcessMatrix subtitle="…" />`.
6. Right session: `«Сессия #4174 · Claude Code · агент»` (flame tone) + `<CandidateIde leak />` + `<ProcessMatrix subtitle="…" leakLabel="Калибровка ИИ" />`.
7. Closing refrain — three lines, third in `flame`:
   - `«Результат умер.»`
   - `«Процесс — единственное, что осталось измерять.»`
   - `«Кем бы он ни был.»`

**Colors.** `flame` (headline accent, v3 ring + border, agent session label, closing line 3); `glass` (human session label dot); `paper`/`mute`/`dim` (hierarchy); `fog` (card surfaces); mockup palettes in.

**Typography.** `font-display` on h2 + closing lines (`--text-display`, line-height 1.05); `text-meta` for milestone bodies; `text-paper` lines 1–2 of refrain, `text-flame` line 3.

**Animations.**

- `useReveal` on scene-content for milestone + split-scene staggers (0.1 s, y 28).
- Closing refrain: separate `useGSAP` on `closingRef` — `fromTo([data-closing-line], {opacity:0, y:40}, {opacity:1, y:0, stagger:0.25, dur:1.2, expo.out})`, ScrollTrigger `start:"top 75%"`, `toggleActions:"play none none reverse"`.
- Reduced-motion: refrain lines instant.

**Responsive.** Milestones: 1-col → `sm:grid-cols-2` → `lg:grid-cols-4`. Split: stacks `<lg`, 2-col `lg+`. Closing max-w 40 ch centered.

**Issues.**

- **Two `<CandidateIde />` side-by-side at lg = ~2 × 1000 px of IDE chrome** in a `max-w-7xl` (1280 px) container with 48 px inline padding → each IDE column gets ~580 px. The IDE has tree + editor + chats. Three regions in 580 px will crush. On 1024 px breakpoint (where the 2-col flips on) this is worst — IDE looks broken.
- **Closing refrain at peak (`--text-display` = 5 rem at lg+)** with `max-w-[40ch]` centered: `«Процесс — единственное, что осталось измерять.»` is 41 chars — orphan-prone.
- Closing refrain has no exit motion / hold — page just ends abruptly after line 3.
- The closing IS the bonus criterion ("Готов инвестировать!"). It deserves the most polished landing on the page; currently it's a stagger-fade like everything else.
- No bottom cushion → the section ends literally at the last `<p>`. Scrolling further reveals browser background.

---

### 4.10 Mockups (reusable surfaces)

#### `candidate-ide.tsx` (319 L)

- **Used in:** 05 (preview, `lg+`), 06 (visual reference only — scene 06 uses bespoke `<Bubble>` components, NOT this), 07 (candidate column), 09 (both sides of split).
- **Props:** `leak?: boolean` (default false) — pulses external bubble red + shows breach warning; `compact?: boolean` (default false) — editor-only at all breakpoints; `className?: string`.
- **Anatomy:** rounded-2xl card → title bar (3 colored dots + breadcrumb `~/payments/process_refund.py` + `КейсПодбор · сессия`) → body grid (tree | editor | chats) → status bar (`python · 3.13 · venv | tests: 12 ✓ | main`).
- **File tree (md+):** `payments/api/routes.py`, `payments/api/process_refund.py` (highlighted), `payments/db/schema.sql`, `payments/db/customers.csv` (red `⚠ PII · internal`), `README.md`, `.env` (red `⚠ secrets`).
- **Editor:** Python snippet `process_refund(customer_id, amount)` — 9 lines with line numbers, syntax-highlighted spans (Kw / Fn / Pn / St / Num).
- **Chats:** Buddy bubble `«Этот файл — обработчик возвратов. Перед изменением запусти тесты в \`tests/refund_test.py\`.»` + user `«а что с \`customers.csv\`?»`. External default: `«как переписать stripe.Refund.create на батч?»`. External (`leak`): `«перепиши на батч — вот данные: name,email,charge_id...»` + flag `«⚠ обнаружена утечка: customers.csv (точное совпадение)»`.
- **Colors:** every token from the system — ink/fog/line/line-strong, leak/flame/trust, paper/mute/dim/sterile/glass/ember.
- **State:** `leak` toggles external bubble bg (`bg-line text-mute` → `bg-leak/15 text-paper`) + adds `ring-2 ring-leak/60`. No GSAP inside — pure conditional class.
- **Responsive:** `<sm` editor-only · `sm+` editor + stacked chats (`grid-cols-[1fr_240px]`) · `md+` tree + editor + chats. `compact` forces editor-only at all sizes.
- **Bleed:** ~400–450 px tall at desktop; editor scrolls horizontally via `overflow-x-auto`; no scene-level overflow risk on its own — but two side-by-side at `lg` (scene 09) is the documented squeeze.

#### `process-matrix.tsx` (126 L)

- **Used in:** 06 (with `leakLabel="Цифровая гигиена"`), 09 (twice — clean + with `leakLabel="Калибровка ИИ"`).
- **Props:** `title?: string` (default `«Матрица процесса»`), `subtitle?: string`, `axes?: ProcessAxis[]` (default `DEFAULT_AXES`), `leakLabel?: string`, `className?: string`.
- **DEFAULT_AXES (10):** Контекст-литеральность 78 · Планирование 64 · Специфичность промптов 71 · Калибровка ИИ 58 · Безопасность команд 82 · Верификация 69 · Восстановление 54 · Артикуляция 73 · Бизнес-литеральность 47 · Цифровая гигиена 89.
- **Anatomy:** rounded-2xl card → header (`«КейсПодбор · оценка»` eyebrow + title + optional subtitle, right: averaged score `/100`) → axes list (`<ul>` with label / bar / score).
- **Bar mechanic:** `colorFor(score)` = `≥70 ? bg-trust : ≥40 ? bg-flame : bg-leak`. Width = `score%`. `transition-all` on width.
- **Leak mechanic:** if `leakLabel === axis.label`: score clamped to `Math.min(axis.score, 18)`, label gains `text-leak` + chip `«утечка»` (`text-[10px] uppercase`), bar container gains Tailwind `.animate-pulse`.
- **Colors:** ink/fog/line/line-strong, leak/flame/trust, paper/mute/dim.
- **Responsive:** Bars `hidden sm:block` — **on mobile only score numbers show, no bars**. Label `truncate` `<sm`, `basis-44` `sm`, `basis-52` `lg`.
- **Bleed:** ~350 px tall at desktop; sits comfortably; no scroll inside.

#### `hr-kanban.tsx` (103 L)

- **Used in:** 07 (HR column).
- **Props:** `className?: string`. All content hardcoded.
- **Anatomy:** rounded-2xl card → header (`«HR»` eyebrow + title `«Канбан позиций»` + chip `«этот месяц»`) → 3-col grid of columns (always `grid-cols-3`, no responsive breakpoint).
- **Content (verbatim):**
  - Column 1 — `«Открыты»` (flame tone):
    - `«Junior Backend · Go»` — 47 кандидатов · `+12` (flame badge)
    - `«Junior Data Analyst · SQL»` — 28 кандидатов · `+6`
  - Column 2 — `«На ревью»` (glass tone):
    - `«Junior Frontend · React»` — 63 кандидатов · `+3`
  - Column 3 — `«Закрыто»` (trust tone):
    - `«Junior QA · Python»` — 51 кандидатов · `+0` (no badge)
- **Colors:** ink/fog/line/line-strong, flame/glass/trust, paper/mute/dim.
- **State:** static; no animations; no props beyond className.
- **Responsive:** intrinsic 100% width; grid stays 3-col at all sizes. Padding `p-4 sm:p-5`. Position titles `line-clamp-2`.
- **Bleed:** ~200–250 px tall; sits comfortably.

#### `teamlead-setup.tsx` (108 L)

- **Used in:** 07 (Teamlead column). _(Note: prior agent ran scene 09 against the wrong assumption — the actual scene 09 uses CandidateIde + ProcessMatrix only.)_
- **Props:** `className?: string`. All content hardcoded.
- **Anatomy:** rounded-2xl card → header (`«Тимлид»` eyebrow + title `«4 слоя контекста»` + right `«15 мин один раз»` in trust) → layers list (4 `<li>` with number circle / content / status) → case preview box with button.
- **Layers (LAYERS):**
  1. `«Стек / окружение»` — `«Шаблон или абзац описания»` — 100% ✓
  2. `«Идентичность команды»` — `«5–7 ответов»` — 100% ✓
  3. `«Бизнес-контекст»` — `«~300 слов»` — 100% ✓
  4. `«Задача под позицию»` — `«1–3 строки»` — **65%** (flame tone)
- **Case preview text:** `«Реализовать batch-обработчик возвратов поверх stripe API, с корректным обращением к таблице \`customers\`. Покрыть тестами.»` (line-clamp-3).
- **Button:** `«Отправить кандидатам»` (flame bg, ink text, uppercase rounded-full).
- **Colors:** ink/fog/line/line-strong, trust/flame, paper/mute/dim.
- **State:** circle + status toggle on `progress===100` (trust ✓) vs `<100` (flame %).
- **Responsive:** intrinsic 100%; grid fixed `grid-cols-[auto_1fr_auto]`; padding `p-5 sm:p-6`.
- **Bleed:** ~350 px tall; sits comfortably.

---

