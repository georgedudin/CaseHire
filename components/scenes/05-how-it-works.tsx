"use client";

import { Scene } from "@/components/scroll/scene";

export function Scene05HowItWorks() {
  return (
    <Scene id="how-it-works" ariaLabel="Как работает" pin={false}>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-meta uppercase tracking-[0.32em] text-dim">
          05 · Сцена в разработке
        </p>
        <h2 className="font-display mt-6 text-h1 text-paper">
          Как это работает
        </h2>
      </div>
    </Scene>
  );
}
