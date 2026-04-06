"use client";

import { EmotionalAmbientProvider } from "@/context/EmotionalAmbientContext";
import { EmotionalCompanion } from "./EmotionalCompanion";
import { EmotionalPulse } from "./EmotionalPulse";
import type { ReactNode } from "react";

/**
 * 全局治愈层：脉动在内容前（底层 z-5）、小王子在内容后（z-50），中间为 {children} 主体。
 */
export function MirrorEmotionalShell({ children }: { children: ReactNode }) {
  return (
    <EmotionalAmbientProvider>
      <EmotionalPulse />
      {children}
      <EmotionalCompanion />
    </EmotionalAmbientProvider>
  );
}
