"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/scroll/lenis-provider";

const NEXT_KEYS = ["ArrowRight", "ArrowDown", "PageDown"] as const;
const PREV_KEYS = ["ArrowLeft", "ArrowUp", "PageUp"] as const;

const isNext = (k: string): k is (typeof NEXT_KEYS)[number] =>
  (NEXT_KEYS as readonly string[]).includes(k);
const isPrev = (k: string): k is (typeof PREV_KEYS)[number] =>
  (PREV_KEYS as readonly string[]).includes(k);

/**
 * Step between scenes with the keyboard.
 *
 *   →  ↓  PgDn       → next scene
 *   ←  ↑  PgUp       → previous scene
 *   Home / End       → first / last scene
 *
 * Modifier keys (Ctrl / ⌘ / Alt) are left alone so native shortcuts win.
 * Text fields are skipped so typing isn't hijacked. Reduced-motion users
 * get an instant jump instead of a Lenis glide.
 *
 * Snap (D4) targets the same anchors — if a snap is mid-flight, calling
 * lenis.scrollTo here cancels it cleanly.
 */
export function KeyboardNav() {
  const lenis = useLenis();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.matches?.('input, textarea, [contenteditable="true"]')) return;

      const isNav =
        isNext(e.key) || isPrev(e.key) || e.key === "Home" || e.key === "End";
      if (!isNav) return;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section.scene-shell")
      );
      if (sections.length === 0) return;

      const probe = window.scrollY + window.innerHeight * 0.3;
      let cur = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= probe) cur = i;
      }

      let next: number;
      if (isNext(e.key)) next = Math.min(sections.length - 1, cur + 1);
      else if (isPrev(e.key)) next = Math.max(0, cur - 1);
      else if (e.key === "Home") next = 0;
      else next = sections.length - 1; // End

      if (next === cur && e.key !== "Home" && e.key !== "End") return;

      e.preventDefault();

      const target = sections[next];
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (lenis && !reduce) {
        lenis.scrollTo(target, {
          duration: 0.9,
          easing: (x: number) => 1 - Math.pow(1 - x, 3),
        });
      } else {
        target.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lenis]);

  return null;
}
