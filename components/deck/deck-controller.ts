/**
 * DeckController — the deck's ONLY scroll consumer (landing_v2.md §1.2–§1.4).
 *
 * Owns: the snap-point registry (slide tops + build midpoints), fixation
 * detection, frozen-state lifecycle, keyboard gestures, wheel magnetism,
 * idle-loop lifecycle, dormancy, and the travel lock. Scenes never read
 * scroll; they hand the controller paused timelines via `useDeckSlide`.
 *
 * Plain TS class — no React state on the hot path. Chrome subscribes via
 * `useSyncExternalStore` (snapshot changes only on index/fixed changes).
 *
 * Build slides are 200svh sticky wrappers (plan decision #2): the registry
 * holds two points (top, mid = top + viewportH). The sticky stage renders
 * the identical frame at both, so travelling top→mid moves nothing visually —
 * it is the "build gesture" being absorbed by real scroll distance.
 */
import { gsap } from "@/lib/gsap-setup";
import type Lenis from "lenis";

export type SlideStage = "settled" | "built";
export type SlideStatus = "dormant" | "entering" | "settled" | "building" | "built";

export type SlideHooks = {
  /** Entrance timeline, built `paused: true`. Controller plays it on fixation. */
  entrance: gsap.core.Timeline;
  /** Optional build one-shot, `paused: true`. Played on midpoint fixation. */
  build?: gsap.core.Timeline;
  /** Idle-loop factory; re-invoked per visit, killed on leave. */
  makeIdles?: () => gsap.core.Animation[];
  /** Batched instant gsap.set to the slide's end state for `stage`. */
  setFrozen: (stage: SlideStage) => void;
  /** Batched instant gsap.set back to pre-entrance values. */
  setDormant: () => void;
};

export type SlideRegistration = {
  id: string;
  el: HTMLElement; // the .slide-wrap section
  hasBuild?: boolean;
  /** <lg / no-pin contexts: build auto-chains this many ms after fixation. */
  autoChainMs?: number;
};

type SlideRecord = {
  id: string;
  el: HTMLElement;
  hasBuild: boolean;
  autoChainMs: number;
  index: number;
  top: number;
  mid: number | null; // build slides at lg+, else null
  status: SlideStatus;
  entranceConsumed: boolean;
  buildConsumed: boolean;
  hooks: SlideHooks | null;
  idles: gsap.core.Animation[];
  autoChainCall: gsap.core.Tween | null;
  leftAt: number | null;
};

type SnapPoint = { slideIndex: number; kind: "top" | "mid"; y: number };

export type DeckSnapshot = {
  currentIndex: number;
  total: number;
  fixed: boolean;
};

// Fixation contract (§1.2) — named consts, tuned on stubs in P1.
const FIX_TOLERANCE_PX = 2;
const FIX_VELOCITY = 0.05;
const FIX_HOLD_MS = 100;
const LEAVE_FRACTION = 0.15;
const SNAP_DELAY_MS = 160;
const SNAP_TOLERANCE_VH = 0.4;
const SNAP_DEAD_ZONE_PX = 2;
const TRAVEL_SAFETY_MS = 1500;
const SCROLL_DURATION_S = 0.9;

const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
const PREV_KEYS = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export class DeckController {
  private lenis: Lenis | null = null;
  private slides: SlideRecord[] = [];
  private points: SnapPoint[] = [];
  private reduced = false;
  private started = false;

  // hot-path fields (never React state)
  private y = 0;
  private lastY = 0;
  private velocity = 0;
  private fixCandidate: SnapPoint | null = null;
  private fixHeldMs = 0;
  private lastFixed: SnapPoint | null = null;
  private currentIndex = 0;
  private travelLock = false;
  private travelSafety: ReturnType<typeof setTimeout> | null = null;
  private snapTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastDirection: 1 | -1 = 1;

  // subscriptions (chrome)
  private listeners = new Set<() => void>();
  private snapshot: DeckSnapshot = { currentIndex: 0, total: 0, fixed: false };

  private tick = (time: number, deltaMs: number) => this.onFrame(deltaMs);
  private onKeyDown = (e: KeyboardEvent) => this.handleKey(e);
  private onVisibility = () => this.handleVisibility();
  private onLenisScroll = () => this.handleScrollEvent();

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                           */
  /* ------------------------------------------------------------------ */

  setLenis(lenis: Lenis | null) {
    if (this.lenis === lenis) return;
    this.lenis?.off("scroll", this.onLenisScroll);
    this.lenis = lenis;
    this.lenis?.on("scroll", this.onLenisScroll);
  }

  register(reg: SlideRegistration) {
    if (this.slides.some((s) => s.id === reg.id)) return;
    this.slides.push({
      id: reg.id,
      el: reg.el,
      hasBuild: reg.hasBuild ?? false,
      autoChainMs: reg.autoChainMs ?? 1500,
      index: 0,
      top: 0,
      mid: null,
      status: "dormant",
      entranceConsumed: false,
      buildConsumed: false,
      hooks: null,
      idles: [],
      autoChainCall: null,
      leftAt: null,
    });
    this.sortAndIndex();
    if (this.started) this.measure();
  }

  unregister(id: string) {
    const rec = this.byId(id);
    if (!rec) return;
    this.killIdles(rec);
    rec.autoChainCall?.kill();
    this.slides = this.slides.filter((s) => s.id !== id);
    this.sortAndIndex();
  }

  setHooks(id: string, hooks: SlideHooks) {
    const rec = this.byId(id);
    if (!rec) return;
    rec.hooks = hooks;
    hooks.entrance.eventCallback("onComplete", () => this.onEntranceComplete(rec));
    hooks.build?.eventCallback("onComplete", () => this.onBuildComplete(rec));
    hooks.setDormant();
    // The first slide is the load case: fixed by definition (§1.2).
    if (this.started && rec.index === 0 && rec.status === "dormant" && this.y < 4) {
      this.playEntrance(rec);
    }
  }

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.addEventListener("keydown", this.onKeyDown);
    if (this.reduced) {
      // Scenes render final states themselves; only keyboard jumps remain.
      this.measure();
      this.publish();
      return;
    }
    document.addEventListener("visibilitychange", this.onVisibility);
    this.measure();
    gsap.ticker.add(this.tick);
    // Slide 1 load case (hooks may already be set, or arrive via setHooks).
    const first = this.slides[0];
    if (first?.hooks && first.status === "dormant" && this.y < 4) {
      this.playEntrance(first);
    }
    this.publish();
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("visibilitychange", this.onVisibility);
    gsap.ticker.remove(this.tick);
    this.lenis?.off("scroll", this.onLenisScroll);
    if (this.snapTimeout) clearTimeout(this.snapTimeout);
    if (this.travelSafety) clearTimeout(this.travelSafety);
    for (const rec of this.slides) {
      this.killIdles(rec);
      rec.autoChainCall?.kill();
    }
    this.started = false;
  }

  /* ------------------------------------------------------------------ */
  /* Geometry                                                            */
  /* ------------------------------------------------------------------ */

  measure() {
    const vh = window.innerHeight;
    const lgPin =
      window.matchMedia("(min-width: 1024px)").matches && !this.reduced;
    this.points = [];
    for (const rec of this.slides) {
      rec.top = rec.el.offsetTop;
      rec.mid = rec.hasBuild && lgPin ? rec.top + vh : null;
      this.points.push({ slideIndex: rec.index, kind: "top", y: rec.top });
      if (rec.mid !== null) {
        this.points.push({ slideIndex: rec.index, kind: "mid", y: rec.mid });
      }
    }
    this.points.sort((a, b) => a.y - b.y);
  }

  private remeasureQueued = false;

  /** Public for the useDeckSlide resize rebuild. Microtask-coalesced:
   * 13 slides rebuilding in one resize burst trigger ONE registry measure
   * (offsetTop reads force layout — don't thrash 13×). */
  remeasure() {
    if (!this.started || this.remeasureQueued) return;
    this.remeasureQueued = true;
    queueMicrotask(() => {
      this.remeasureQueued = false;
      if (this.started) this.measure();
    });
  }

  /** Current stage for re-applying after a resize rebuild. */
  getStage(id: string): SlideStatus {
    return this.byId(id)?.status ?? "dormant";
  }

  /** Re-attach freshly rebuilt hooks and restore the visual stage. */
  reapply(id: string, hooks: SlideHooks) {
    const rec = this.byId(id);
    if (!rec) return;
    this.killIdles(rec);
    rec.hooks = hooks;
    hooks.entrance.eventCallback("onComplete", () => this.onEntranceComplete(rec));
    hooks.build?.eventCallback("onComplete", () => this.onBuildComplete(rec));
    // A resize mid-flight consumes the in-flight phase (pragmatic: never
    // resume a half-played timeline against new geometry).
    if (rec.status === "entering") rec.status = "settled";
    if (rec.status === "building") rec.status = "built";
    if (rec.status === "dormant") hooks.setDormant();
    else {
      const stage: SlideStage = rec.status === "built" ? "built" : "settled";
      hooks.setFrozen(stage);
      if (this.isFixedOn(rec)) this.startIdles(rec);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Frame loop: fixation / leave / dormancy / current index             */
  /* ------------------------------------------------------------------ */

  private onFrame(deltaMs: number) {
    if (!this.lenis) return;
    this.y = this.lenis.scroll;
    this.velocity = this.lenis.velocity;
    if (this.y !== this.lastY) {
      this.lastDirection = this.y > this.lastY ? 1 : -1;
      this.lastY = this.y;
    }

    // --- fixation detector (hysteresis: same candidate across the window)
    const candidate = this.nearestPoint(FIX_TOLERANCE_PX);
    if (
      candidate &&
      Math.abs(this.velocity) < FIX_VELOCITY &&
      this.fixCandidate &&
      candidate.y === this.fixCandidate.y
    ) {
      this.fixHeldMs += deltaMs;
      if (
        this.fixHeldMs >= FIX_HOLD_MS &&
        (this.lastFixed?.y !== candidate.y || this.lastFixed?.kind !== candidate.kind)
      ) {
        this.lastFixed = candidate;
        this.onFixed(candidate);
      }
    } else {
      this.fixCandidate = candidate;
      this.fixHeldMs = 0;
      if (!candidate) this.lastFixed = null;
    }

    // --- leave detector. NOTE: no time-based dormancy reset — a consumed
    // slide stays frozen forever (Q&A back-jumps must NEVER replay 4s of
    // choreography in the judges' faces; rehearsal replays via reload).
    // Never-visited slides remain dormant and play on their first fixation.
    const vh = window.innerHeight;
    for (const rec of this.slides) {
      const lastAnchor = rec.mid ?? rec.top;
      const onSlide =
        this.y >= rec.top - vh * LEAVE_FRACTION &&
        this.y <= lastAnchor + vh * LEAVE_FRACTION;
      if (!onSlide && rec.leftAt === null && rec.status !== "dormant") {
        this.onLeave(rec);
      } else if (onSlide && rec.leftAt !== null) {
        rec.leftAt = null; // back on the slide
      }
    }

    // --- current index for chrome
    let cur = 0;
    for (const rec of this.slides) {
      if (rec.top <= this.y + vh * 0.3) cur = rec.index;
    }
    if (cur !== this.currentIndex) {
      this.currentIndex = cur;
      this.publish();
    }
  }

  private onFixed(point: SnapPoint) {
    const rec = this.slides[point.slideIndex];
    if (!rec?.hooks) return;
    rec.leftAt = null;
    if (point.kind === "top") {
      if (rec.status === "dormant") {
        this.playEntrance(rec);
      } else if (rec.idles.length === 0 && rec.status !== "entering" && rec.status !== "building") {
        // Re-entry on a consumed slide: frozen state is already set; idles only.
        this.startIdles(rec);
      }
      // <lg auto-chain: build slides play their build on a timer after fixation.
      if (
        rec.hasBuild &&
        rec.mid === null &&
        !rec.buildConsumed &&
        rec.hooks.build &&
        !rec.autoChainCall
      ) {
        rec.autoChainCall = gsap.delayedCall(rec.autoChainMs / 1000, () => {
          rec.autoChainCall = null;
          this.playBuild(rec);
        });
      }
    } else {
      // Midpoint fixation: finish entrance if needed, then the build one-shot.
      if (rec.status === "entering" && rec.hooks.entrance.progress() < 1) {
        rec.hooks.entrance.progress(1); // fires onComplete → settled
      }
      this.playBuild(rec);
    }
    this.publish();
  }

  private onLeave(rec: SlideRecord) {
    rec.leftAt = performance.now();
    this.killIdles(rec);
    rec.autoChainCall?.kill();
    rec.autoChainCall = null;
    if (!rec.hooks) return;
    if (rec.status === "dormant") return; // flung past unvisited: stays dormant
    if (rec.status === "entering") rec.hooks.entrance.progress(1);
    if (rec.status === "building") rec.hooks.build?.progress(1);
    // Bypassed build: visited slide whose midpoint was crossed without fixing.
    if (
      rec.hasBuild &&
      rec.mid !== null &&
      !rec.buildConsumed &&
      rec.entranceConsumed &&
      this.y > rec.mid
    ) {
      rec.buildConsumed = true;
      rec.status = "built";
    }
    const stage: SlideStage = rec.buildConsumed ? "built" : "settled";
    rec.hooks.setFrozen(stage);
  }

  /* ------------------------------------------------------------------ */
  /* Playback                                                            */
  /* ------------------------------------------------------------------ */

  private playEntrance(rec: SlideRecord) {
    if (!rec.hooks || rec.status !== "dormant") return;
    rec.status = "entering";
    rec.hooks.entrance.play(0);
  }

  private onEntranceComplete(rec: SlideRecord) {
    rec.status = rec.buildConsumed ? "built" : "settled";
    rec.entranceConsumed = true;
    if (this.isFixedOn(rec)) this.startIdles(rec);
  }

  private playBuild(rec: SlideRecord) {
    if (!rec.hooks?.build || rec.buildConsumed || rec.status === "building") return;
    if (rec.status === "entering") rec.hooks.entrance.progress(1);
    this.killIdles(rec);
    rec.status = "building";
    rec.hooks.build.play(0);
  }

  private onBuildComplete(rec: SlideRecord) {
    rec.status = "built";
    rec.buildConsumed = true;
    if (this.isFixedOn(rec)) this.startIdles(rec);
  }

  private startIdles(rec: SlideRecord) {
    if (!rec.hooks?.makeIdles || rec.idles.length > 0) return;
    if (document.hidden) return;
    rec.idles = rec.hooks.makeIdles();
  }

  private killIdles(rec: SlideRecord) {
    for (const idle of rec.idles) idle.kill();
    rec.idles = [];
  }

  private handleVisibility() {
    for (const rec of this.slides) {
      if (document.hidden) {
        for (const idle of rec.idles) idle.pause();
      } else {
        for (const idle of rec.idles) idle.resume();
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Gestures                                                            */
  /* ------------------------------------------------------------------ */

  private handleKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.matches?.('input, textarea, [contenteditable="true"]')) return;

    const isNext = NEXT_KEYS.has(e.key);
    const isPrev = PREV_KEYS.has(e.key);
    const isHome = e.key === "Home";
    const isEnd = e.key === "End";
    if (!isNext && !isPrev && !isHome && !isEnd) return;
    e.preventDefault();

    if (this.reduced) {
      // Static deck: plain jumps between slide tops.
      const idx = isHome
        ? 0
        : isEnd
          ? this.slides.length - 1
          : Math.max(0, Math.min(this.slides.length - 1, this.currentNearestIndex() + (isNext ? 1 : -1)));
      this.slides[idx]?.el.scrollIntoView({ behavior: "auto", block: "start" });
      this.currentIndex = idx;
      this.publish();
      return;
    }

    if (isNext) this.gestureNext();
    else if (isPrev) this.gesturePrev();
    else this.jumpTo(isHome ? 0 : this.slides.length - 1);
  }

  /** → : finish entrance → play build → advance. Always the safe thing. */
  gestureNext() {
    const rec = this.slides[this.currentIndex];
    if (!rec || this.travelLock || rec.status === "building") return;
    if (rec.status === "entering" && rec.hooks) {
      rec.hooks.entrance.progress(1); // gesture consumed by finishing the entrance
      return;
    }
    // "Build pending" requires an actual build timeline — a hasBuild slide
    // whose hooks carry no build (e.g. static-skeleton phase) advances
    // straight to the next slide instead of stranding the user at the mid.
    if (rec.hasBuild && rec.mid !== null && !rec.buildConsumed && rec.hooks?.build) {
      if (this.y < rec.mid - FIX_TOLERANCE_PX) {
        this.scrollToY(rec.mid); // build plays on midpoint fixation
      } else {
        // Already AT the midpoint but fixation hasn't fired yet (the ≤100ms
        // hysteresis window): play directly — otherwise the gesture falls
        // through to "advance" and the build is silently bypass-consumed.
        this.playBuild(rec);
      }
      return;
    }
    const next = this.slides[rec.index + 1];
    if (!next) return; // last slide, built: deck ends in stillness
    this.scrollToY(next.top);
  }

  /** ← : previous slide top, always. Never midpoints, never rewinds builds. */
  gesturePrev() {
    const rec = this.slides[this.currentIndex];
    if (!rec || this.travelLock) return;
    // From a midpoint resting position, ← still leaves to the previous slide:
    // mid and top are the same visual frame, so "back" means the previous slide.
    const prev = this.slides[rec.index - 1];
    if (!prev) return;
    this.scrollToY(prev.top);
  }

  /** Home/End/rail-click: land on the frozen state — entrances never replay on jumps (§3). */
  jumpTo(index: number) {
    const rec = this.slides[index];
    if (!rec || this.travelLock) return;
    if (rec.hooks && rec.status === "dormant") {
      const stage: SlideStage = rec.hasBuild ? "built" : "settled";
      rec.entranceConsumed = true;
      rec.buildConsumed = rec.hasBuild;
      rec.status = stage;
      rec.hooks.setFrozen(stage);
    }
    this.scrollToY(rec.top);
  }

  private scrollToY(y: number) {
    if (!this.lenis) return;
    this.travelLock = true;
    if (this.travelSafety) clearTimeout(this.travelSafety);
    this.travelSafety = setTimeout(() => {
      this.travelLock = false;
    }, TRAVEL_SAFETY_MS);
    this.lenis.scrollTo(y, {
      duration: SCROLL_DURATION_S,
      easing: easeOutCubic,
      lock: true,
      onComplete: () => {
        this.travelLock = false;
        if (this.travelSafety) clearTimeout(this.travelSafety);
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Magnetism (wheel/touch) — v1 debounce shape, registry-driven        */
  /* ------------------------------------------------------------------ */

  private handleScrollEvent() {
    if (this.travelLock || this.reduced) return;
    if (this.snapTimeout) clearTimeout(this.snapTimeout);
    this.snapTimeout = setTimeout(() => this.trySnap(), SNAP_DELAY_MS);
  }

  private trySnap() {
    if (this.travelLock || !this.lenis || this.points.length === 0) return;
    const vh = window.innerHeight;
    const tol = vh * SNAP_TOLERANCE_VH;

    let best: SnapPoint | null = null;
    let bestScore = Infinity;
    for (const p of this.points) {
      const d = Math.abs(p.y - this.y);
      if (d > tol) continue;
      // Direction bias: a point in the travel direction wins ties, so a
      // forward wheel from a pending-build top reaches the midpoint.
      const directional = Math.sign(p.y - this.y) === this.lastDirection;
      const score = d * (directional ? 0.65 : 1);
      if (score < bestScore) {
        bestScore = score;
        best = p;
      }
    }
    if (!best) return;
    if (Math.abs(best.y - this.y) <= SNAP_DEAD_ZONE_PX) return; // already there
    this.scrollToY(best.y);
  }

  /* ------------------------------------------------------------------ */
  /* Chrome subscription (useSyncExternalStore)                          */
  /* ------------------------------------------------------------------ */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = (): DeckSnapshot => this.snapshot;

  private publish() {
    const fixed = this.lastFixed !== null;
    if (
      this.snapshot.currentIndex !== this.currentIndex ||
      this.snapshot.fixed !== fixed ||
      this.snapshot.total !== this.slides.length
    ) {
      this.snapshot = {
        currentIndex: this.currentIndex,
        total: this.slides.length,
        fixed,
      };
      for (const fn of this.listeners) fn();
    }
  }

  /** Dev HUD: imperative read, polled via rAF — not part of the snapshot. */
  debug() {
    const rec = this.slides[this.currentIndex];
    return {
      y: Math.round(this.y),
      velocity: this.velocity,
      currentIndex: this.currentIndex,
      slideId: rec?.id ?? "—",
      status: rec?.status ?? "—",
      entranceConsumed: rec?.entranceConsumed ?? false,
      buildConsumed: rec?.buildConsumed ?? false,
      fixed: this.lastFixed
        ? `${this.lastFixed.kind}@${this.slides[this.lastFixed.slideIndex]?.id}`
        : null,
      fixHeldMs: Math.round(this.fixHeldMs),
      travelLock: this.travelLock,
      points: this.points.length,
    };
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  private byId(id: string) {
    return this.slides.find((s) => s.id === id);
  }

  private sortAndIndex() {
    // DOM order == document order; offsetTop may be 0 pre-layout, so sort
    // by document position, not by measured y.
    this.slides.sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    this.slides.forEach((s, i) => {
      s.index = i;
    });
  }

  private nearestPoint(tolerance: number): SnapPoint | null {
    for (const p of this.points) {
      if (Math.abs(p.y - this.y) <= tolerance) return p;
    }
    return null;
  }

  private isFixedOn(rec: SlideRecord) {
    return this.lastFixed !== null && this.slides[this.lastFixed.slideIndex] === rec;
  }

  private currentNearestIndex() {
    let cur = 0;
    const probe = window.scrollY + window.innerHeight * 0.3;
    this.slides.forEach((rec, i) => {
      if (rec.el.offsetTop <= probe) cur = i;
    });
    return cur;
  }
}
