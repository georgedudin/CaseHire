"use client";

/**
 * Deck context — distributes the DeckController and implements the scene
 * registration lifecycle (landing_v2.md §1.2 + plan "Scene-facing API").
 *
 * `useDeckSlide` owns everything a scene must not get wrong individually:
 * the `document.fonts.ready` gate (SplitText metrics), the scoped
 * gsap.context, registration/unregistration, and the debounced resize
 * rebuild (revert → re-create → re-apply current stage → re-measure).
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap-setup";
import {
  DeckController,
  type DeckSnapshot,
  type SlideHooks,
} from "@/components/deck/deck-controller";

const DeckCtx = createContext<DeckController | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  // Constructor is window-free, so this is SSR-safe.
  const [controller] = useState(() => new DeckController());
  const lenis = useLenis();

  useEffect(() => {
    controller.setLenis(lenis ?? null);
  }, [controller, lenis]);

  // Parent effects run AFTER children's: every slide has registered by now.
  useEffect(() => {
    controller.start();
    return () => controller.destroy();
  }, [controller]);

  return <DeckCtx.Provider value={controller}>{children}</DeckCtx.Provider>;
}

export function useDeckController(): DeckController {
  const controller = useContext(DeckCtx);
  if (!controller) throw new Error("useDeckController outside <DeckProvider>");
  return controller;
}

/** Chrome subscription — re-renders only on index/fixed changes. */
export function useDeckState(): DeckSnapshot {
  const controller = useDeckController();
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
}

export type CreateSlideHooks = (ctx: {
  root: HTMLElement;
  reduced: boolean;
}) => SlideHooks;

export function useDeckSlide(opts: {
  id: string;
  hasBuild?: boolean;
  autoChainMs?: number;
  create: CreateSlideHooks;
}): { ref: RefObject<HTMLElement | null> } {
  const controller = useDeckController();
  const ref = useRef<HTMLElement>(null);
  // `create` is used inside the one-shot effect; keep the latest without
  // re-running the lifecycle when the component re-renders.
  const createRef = useRef(opts.create);
  createRef.current = opts.create;
  const { id, hasBuild, autoChainMs } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controller.register({ id, el, hasBuild, autoChainMs });

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const build = (mode: "initial" | "rebuild") => {
      ctx = gsap.context(() => {
        const hooks = createRef.current({ root: el, reduced });
        if (reduced) {
          // Static deck: final post-build state, no registration (§2.2 of plan).
          hooks.setFrozen("built");
          return;
        }
        if (mode === "initial") controller.setHooks(id, hooks);
        else controller.reapply(id, hooks);
      }, el);
      controller.remeasure();
    };

    // SplitText/layout metrics need real fonts (Cyrillic Manrope/Inter).
    document.fonts.ready.then(() => {
      if (cancelled) return;
      build("initial");
    });

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled || !ctx) return;
        ctx.revert();
        build("rebuild");
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      ctx?.revert();
      controller.unregister(id);
    };
  }, [controller, id, hasBuild, autoChainMs]);

  return { ref };
}
