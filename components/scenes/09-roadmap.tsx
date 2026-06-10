"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene09Roadmap() {
  return (
    <Scene id="roadmap" ariaLabel="Дорожная карта и финал" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          09 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          Куда мы идём
        </h2>
      </div>
    </Scene>
  );
}
