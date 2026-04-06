"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type EmotionalAmbientValue = {
  acknowledgeChoice: () => void;
  pulseGen: number;
};

const EmotionalAmbientContext = createContext<EmotionalAmbientValue | null>(null);

export function EmotionalAmbientProvider({ children }: { children: ReactNode }) {
  const [pulseGen, setPulseGen] = useState(0);

  const acknowledgeChoice = useCallback(() => {
    setPulseGen((g) => g + 1);
  }, []);

  const value = useMemo<EmotionalAmbientValue>(
    () => ({
      acknowledgeChoice,
      pulseGen,
    }),
    [acknowledgeChoice, pulseGen]
  );

  return <EmotionalAmbientContext.Provider value={value}>{children}</EmotionalAmbientContext.Provider>;
}

export function useEmotionalAmbient(): EmotionalAmbientValue {
  const ctx = useContext(EmotionalAmbientContext);
  if (!ctx) {
    throw new Error("useEmotionalAmbient must be used within EmotionalAmbientProvider");
  }
  return ctx;
}

export function useEmotionalAcknowledge(): () => void {
  const ctx = useContext(EmotionalAmbientContext);
  return ctx?.acknowledgeChoice ?? (() => {});
}
