"use client";

import { EmotionalAmbientProvider } from "@/context/EmotionalAmbientContext";
import { EmotionalCompanion } from "./EmotionalCompanion";
import { EmotionalPulse } from "./EmotionalPulse";
import type { ReactNode } from "react";

/** 全局治愈层：脉动背景 + 小王子（需在 Provider 内使用子组件 hook） */
export function MirrorEmotionalShell({ children }: { children: ReactNode }) {
  return (
    <EmotionalAmbientProvider>
      <EmotionalPulse />
      <EmotionalCompanion />
      {children}
    </EmotionalAmbientProvider>
  );
}
