"use client";

import { EmotionalAmbientProvider } from "@/context/EmotionalAmbientContext";
import { EmotionalCompanion } from "./EmotionalCompanion";
import { EmotionalPulse } from "./EmotionalPulse";
import type { ReactNode } from "react";

/** 全局治愈层：脉动（左）· 主内容（中）· 小王子（右），均不占宽；fixed 层不受 flex 挤压 */
export function MirrorEmotionalShell({ children }: { children: ReactNode }) {
  return (
    <EmotionalAmbientProvider>
      <div className="mirror-emotional-shell flex min-h-screen w-full min-w-0 max-w-full flex-row overflow-visible">
        <aside className="pointer-events-none w-0 shrink-0 overflow-visible" aria-hidden>
          <EmotionalPulse />
        </aside>
        <div className="mirror-emotional-children relative min-h-0 min-w-0 flex-1 overflow-visible">
          {children}
        </div>
        <aside className="pointer-events-none w-0 shrink-0 overflow-visible" aria-hidden>
          <EmotionalCompanion />
        </aside>
      </div>
    </EmotionalAmbientProvider>
  );
}
