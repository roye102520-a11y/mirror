"use client";

import { INTERNET_QUESTIONS } from "@/lib/internet-questions";
import { MAIN_TOTAL } from "@/lib/quiz-types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "personality60-quiz-session";
const SESSION_VERSION = 2;

export type InternetState =
  | { phase: "none" }
  | { phase: "offered" }
  | { phase: "skipped" }
  | { phase: "active"; answers: number[]; index: number }
  | { phase: "done"; answers: number[] };

type QuizContextValue = {
  storageReady: boolean;
  narrative: string;
  setNarrative: (s: string) => void;
  mainAnswers: number[];
  mainIndex: number;
  setMainAnswer: (questionIndex: number, optionIndex: number) => void;
  goMain: (index: number) => void;
  /** 主问卷计分题完成后、网络选做前的三道开放题 */
  scanOpenTexts: [string, string, string];
  scanOpenIndex: number;
  scanOpenComplete: boolean;
  setScanOpenTextAt: (index: 0 | 1 | 2, text: string) => void;
  advanceScanOpen: (textForCurrent: string) => void;
  skipScanOpenRemaining: () => void;
  internet: InternetState;
  offerInternet: () => void;
  skipInternet: () => void;
  startInternet: () => void;
  submitInternetAnswer: (q: number, optionIndex: number) => void;
  goInternet: (index: number) => void;
  resetAll: () => void;
  isMainComplete: boolean;
};

const Ctx = createContext<QuizContextValue | null>(null);

type StoredShape = Partial<{
  v: number;
  narrative: string;
  mainAnswers: number[];
  mainIndex: number;
  internet: InternetState;
  scanOpenTexts: string[];
  scanOpenIndex: number;
  scanOpenComplete: boolean;
}>;

function loadSession(): StoredShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredShape;
    const version = parsed.v ?? 1;
    const mainOk =
      Boolean(parsed.mainAnswers?.length === MAIN_TOTAL) &&
      Boolean(parsed.mainAnswers?.every((a) => typeof a === "number" && a >= 0));
    let scanOpenComplete = parsed.scanOpenComplete === true;
    let tex = [...(parsed.scanOpenTexts ?? ["", "", ""])];
    while (tex.length < 3) tex.push("");
    const scanOpenTexts = tex.slice(0, 3) as [string, string, string];
    let scanOpenIndex =
      typeof parsed.scanOpenIndex === "number" && parsed.scanOpenIndex >= 0 && parsed.scanOpenIndex <= 2
        ? parsed.scanOpenIndex
        : 0;
    if (version < 2 && mainOk) {
      scanOpenComplete = true;
    }
    if (scanOpenComplete) {
      scanOpenIndex = 0;
    }
    return {
      ...parsed,
      v: SESSION_VERSION,
      scanOpenComplete,
      scanOpenTexts,
      scanOpenIndex,
    };
  } catch {
    return {};
  }
}

const emptyAnswers = () => Array.from({ length: MAIN_TOTAL }, () => -1);

const emptyOpen: [string, string, string] = ["", "", ""];

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [storageReady, setStorageReady] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [mainAnswers, setMainAnswers] = useState<number[]>(emptyAnswers);
  const [mainIndex, setMainIndex] = useState(0);
  const [internet, setInternet] = useState<InternetState>({ phase: "none" });
  const [scanOpenTexts, setScanOpenTexts] = useState<[string, string, string]>(emptyOpen);
  const [scanOpenIndex, setScanOpenIndex] = useState(0);
  const [scanOpenComplete, setScanOpenComplete] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (s.narrative != null) setNarrative(s.narrative);
    if (s.mainAnswers?.length === MAIN_TOTAL) setMainAnswers(s.mainAnswers);
    if (typeof s.mainIndex === "number") setMainIndex(s.mainIndex);
    if (s.internet) setInternet(s.internet);
    if (s.scanOpenTexts && s.scanOpenTexts.length === 3) {
      setScanOpenTexts([s.scanOpenTexts[0]!, s.scanOpenTexts[1]!, s.scanOpenTexts[2]!]);
    }
    if (typeof s.scanOpenIndex === "number") setScanOpenIndex(s.scanOpenIndex);
    if (s.scanOpenComplete === true) setScanOpenComplete(true);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: SESSION_VERSION,
          narrative,
          mainAnswers,
          mainIndex,
          internet,
          scanOpenTexts,
          scanOpenIndex,
          scanOpenComplete,
        })
      );
    } catch {
      /* ignore */
    }
  }, [
    storageReady,
    narrative,
    mainAnswers,
    mainIndex,
    internet,
    scanOpenTexts,
    scanOpenIndex,
    scanOpenComplete,
  ]);

  const setMainAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    setMainAnswers((prev) => {
      const n = [...prev];
      n[questionIndex] = optionIndex;
      return n;
    });
  }, []);

  const goMain = useCallback((index: number) => {
    setMainIndex(Math.max(0, Math.min(MAIN_TOTAL - 1, index)));
  }, []);

  const setScanOpenTextAt = useCallback((index: 0 | 1 | 2, text: string) => {
    setScanOpenTexts((prev) => {
      const n: [string, string, string] = [...prev] as [string, string, string];
      n[index] = text;
      return n;
    });
  }, []);

  const advanceScanOpen = useCallback(
    (textForCurrent: string) => {
      const i = scanOpenIndex as 0 | 1 | 2;
      setScanOpenTexts((prev) => {
        const n: [string, string, string] = [...prev] as [string, string, string];
        n[i] = textForCurrent.trim();
        return n;
      });
      if (scanOpenIndex < 2) {
        setScanOpenIndex((x) => x + 1);
      } else {
        setScanOpenComplete(true);
        setScanOpenIndex(0);
        setInternet({ phase: "offered" });
      }
    },
    [scanOpenIndex]
  );

  const skipScanOpenRemaining = useCallback(() => {
    setScanOpenComplete(true);
    setScanOpenIndex(0);
    setInternet({ phase: "offered" });
  }, []);

  const offerInternet = useCallback(() => {
    setInternet({ phase: "offered" });
  }, []);

  const skipInternet = useCallback(() => {
    setInternet({ phase: "skipped" });
  }, []);

  const startInternet = useCallback(() => {
    setInternet({
      phase: "active",
      answers: Array(INTERNET_QUESTIONS.length).fill(-1),
      index: 0,
    });
  }, []);

  const submitInternetAnswer = useCallback((q: number, optionIndex: number) => {
    const last = INTERNET_QUESTIONS.length - 1;
    setInternet((prev) => {
      if (prev.phase !== "active") return prev;
      const ans = [...prev.answers];
      ans[q] = optionIndex;
      if (q >= last) {
        return { phase: "done", answers: ans };
      }
      return { phase: "active", answers: ans, index: q + 1 };
    });
  }, []);

  const goInternet = useCallback((index: number) => {
    setInternet((prev) => {
      if (prev.phase !== "active") return prev;
      return { ...prev, index: Math.max(0, Math.min(INTERNET_QUESTIONS.length - 1, index)) };
    });
  }, []);

  const resetAll = useCallback(() => {
    setNarrative("");
    setMainAnswers(emptyAnswers());
    setMainIndex(0);
    setInternet({ phase: "none" });
    setScanOpenTexts(emptyOpen);
    setScanOpenIndex(0);
    setScanOpenComplete(false);
  }, []);

  const isMainComplete = mainAnswers.every((a) => a >= 0);

  const value = useMemo(
    () => ({
      storageReady,
      narrative,
      setNarrative,
      mainAnswers,
      mainIndex,
      setMainAnswer,
      goMain,
      scanOpenTexts,
      scanOpenIndex,
      scanOpenComplete,
      setScanOpenTextAt,
      advanceScanOpen,
      skipScanOpenRemaining,
      internet,
      offerInternet,
      skipInternet,
      startInternet,
      submitInternetAnswer,
      goInternet,
      resetAll,
      isMainComplete,
    }),
    [
      storageReady,
      narrative,
      mainAnswers,
      mainIndex,
      setMainAnswer,
      goMain,
      scanOpenTexts,
      scanOpenIndex,
      scanOpenComplete,
      setScanOpenTextAt,
      advanceScanOpen,
      skipScanOpenRemaining,
      internet,
      offerInternet,
      skipInternet,
      startInternet,
      submitInternetAnswer,
      goInternet,
      resetAll,
      isMainComplete,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuiz() {
  const x = useContext(Ctx);
  if (!x) throw new Error("useQuiz requires QuizProvider");
  return x;
}
