"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene02Pain() {
  return (
    <Scene id="pain" ariaLabel="Боль: что не так с джунами в 2026" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          02 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          Что не так с джунами в&nbsp;2026?
        </h2>
      </div>
    </Scene>
  );
}
