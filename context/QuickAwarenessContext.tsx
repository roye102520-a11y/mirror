"use client";

import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { coerceQuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import type { PhilosophyKey, QaAnswers, QuickModuleId } from "@/lib/quick-awareness/types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type QuickModuleResult = {
  answers: QaAnswers;
  emotion: string;
  obsession: string;
  reflectionQuestion: string;
  /** 六维多维觉察表（需 API）；旧版本地数据可能无此字段 */
  dimensionAnalysis?: QuickDimensionAnalysis | null;
};

const PHILOSOPHY_STORAGE = "mirror-philosophy";
const QUICK_RESULTS_STORAGE = "mirror-quick-modules-results-v2";

function readStoredResults(): Partial<Record<QuickModuleId, QuickModuleResult>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(QUICK_RESULTS_STORAGE);
    if (!raw) return {};
    const p = JSON.parse(raw) as Partial<Record<QuickModuleId, QuickModuleResult>>;
    const out: Partial<Record<QuickModuleId, QuickModuleResult>> = {};
    for (const id of ["relation", "work", "growth"] as QuickModuleId[]) {
      const r = p[id];
      if (
        r &&
        r.answers &&
        Array.isArray(r.answers.choices) &&
        typeof r.emotion === "string" &&
        typeof r.obsession === "string" &&
        typeof r.reflectionQuestion === "string"
      ) {
        const dimRaw = (r as QuickModuleResult).dimensionAnalysis;
        const dim = coerceQuickDimensionAnalysis(dimRaw ?? null) ?? undefined;
        out[id] = {
          answers: r.answers,
          emotion: r.emotion,
          obsession: r.obsession,
          reflectionQuestion: r.reflectionQuestion,
          ...(dim ? { dimensionAnalysis: dim } : {}),
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

function readStoredPhilosophy(): PhilosophyKey {
  if (typeof window === "undefined") return "existential";
  const s = localStorage.getItem(PHILOSOPHY_STORAGE);
  if (s === "existential" || s === "stoic" || s === "eastern") return s;
  return "existential";
}

type Ctx = {
  philosophy: PhilosophyKey;
  setPhilosophy: (p: PhilosophyKey) => void;
  results: Partial<Record<QuickModuleId, QuickModuleResult>>;
  /** 已从 localStorage 恢复（避免首帧把空对象写回存储） */
  resultsHydrated: boolean;
  saveModuleResult: (m: QuickModuleId, r: QuickModuleResult) => void;
  completedCount: number;
  clearAll: () => void;
};

const QuickCtx = createContext<Ctx | null>(null);

export function QuickAwarenessProvider({ children }: { children: React.ReactNode }) {
  const [philosophy, setPhilosophyState] = useState<PhilosophyKey>("existential");
  const [results, setResults] = useState<Partial<Record<QuickModuleId, QuickModuleResult>>>({});
  const [resultsHydrated, setResultsHydrated] = useState(false);

  useEffect(() => {
    setPhilosophyState(readStoredPhilosophy());
    setResults(readStoredResults());
    setResultsHydrated(true);
  }, []);

  const setPhilosophy = useCallback((p: PhilosophyKey) => {
    setPhilosophyState(p);
    if (typeof window !== "undefined") localStorage.setItem(PHILOSOPHY_STORAGE, p);
  }, []);

  const saveModuleResult = useCallback((m: QuickModuleId, r: QuickModuleResult) => {
    setResults((prev) => ({ ...prev, [m]: r }));
  }, []);

  const completedCount = useMemo(() => Object.keys(results).length, [results]);

  const clearAll = useCallback(() => {
    setPhilosophyState("existential");
    if (typeof window !== "undefined") {
      localStorage.setItem(PHILOSOPHY_STORAGE, "existential");
      try {
        localStorage.removeItem(QUICK_RESULTS_STORAGE);
      } catch {
        /* */
      }
    }
    setResults({});
  }, []);

  useEffect(() => {
    if (!resultsHydrated || typeof window === "undefined") return;
    try {
      localStorage.setItem(QUICK_RESULTS_STORAGE, JSON.stringify(results));
    } catch {
      /* */
    }
  }, [results, resultsHydrated]);

  const value = useMemo(
    () => ({
      philosophy,
      setPhilosophy,
      results,
      resultsHydrated,
      saveModuleResult,
      completedCount,
      clearAll,
    }),
    [philosophy, setPhilosophy, results, resultsHydrated, saveModuleResult, completedCount, clearAll]
  );

  return <QuickCtx.Provider value={value}>{children}</QuickCtx.Provider>;
}

export function useQuickAwareness() {
  const x = useContext(QuickCtx);
  if (!x) throw new Error("useQuickAwareness requires provider");
  return x;
}
