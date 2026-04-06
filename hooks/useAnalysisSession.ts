"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SESSION_KEY = "philoaophic-analysis-experience-v1";

export type AnalysisExperienceCard = {
  id: string;
  title: string;
  body: string;
};

export type AnalysisExperienceSession = {
  phase: "active" | "session_closed";
  reminder: string;
  cards: AnalysisExperienceCard[];
  followUp: string;
  followUpReply: string | null;
  compareResult: string | null;
};

type LoadState = "loading" | "empty" | "ready";

function parseSession(raw: string): AnalysisExperienceSession | null {
  try {
    const data = JSON.parse(raw) as AnalysisExperienceSession;
    if (!data || !Array.isArray(data.cards)) return null;
    return data;
  } catch {
    return null;
  }
}

export function useAnalysisSession() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [session, setSession] = useState<AnalysisExperienceSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpBusy, setFollowUpBusy] = useState(false);
  const [compareBusy, setCompareBusy] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
    if (!raw) {
      setSession(null);
      setLoadState("empty");
      return;
    }
    const parsed = parseSession(raw);
    if (!parsed) {
      sessionStorage.removeItem(SESSION_KEY);
      setSession(null);
      setLoadState("empty");
      return;
    }
    setSession(parsed);
    setLoadState("ready");
  }, []);

  const updateFollowUpDraft = useCallback(
    (text: string) => {
      setSession((s) => {
        if (!s) return s;
        const next = { ...s, followUp: text };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const submitFollowUp = useCallback(
    async (draft: string) => {
      if (!draft.trim()) return;
      setFollowUpBusy(true);
      setError(null);
      try {
        setSession((s) => {
          if (!s) return s;
          const next: AnalysisExperienceSession = {
            ...s,
            followUpReply: "追问接口尚未与本页接通；占位回复。",
            phase: "session_closed",
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
          return next;
        });
      } finally {
        setFollowUpBusy(false);
      }
    },
    []
  );

  const saveImage = useCallback(async () => {
    setSaveBusy(true);
    setError(null);
    try {
      setError("导出图片尚未接入（占位）。");
    } finally {
      setSaveBusy(false);
    }
  }, []);

  const runCompareOcr = useCallback(async (_file: File) => {
    setCompareBusy(true);
    setCompareError(null);
    try {
      setCompareError("图片 OCR 对比尚未接入。");
    } finally {
      setCompareBusy(false);
    }
  }, []);

  const runCompareWithPreviousText = useCallback(
    async (text: string) => {
      setCompareBusy(true);
      setCompareError(null);
      try {
        setSession((s) => {
          if (!s) return s;
          const snippet = text.length > 400 ? `${text.slice(0, 400)}…` : text;
          const next: AnalysisExperienceSession = {
            ...s,
            compareResult: `与往期节选对照（占位）：\n${snippet}`,
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
          return next;
        });
      } finally {
        setCompareBusy(false);
      }
    },
    []
  );

  const newReflection = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/");
  }, [router]);

  const exportQuote = useMemo(() => {
    if (!session?.cards?.length) return "";
    return session.cards.map((c) => `${c.title}\n${c.body}`).join("\n\n");
  }, [session]);

  return {
    loadState,
    session,
    error,
    followUpBusy,
    compareBusy,
    compareError,
    saveBusy,
    exportRef,
    updateFollowUpDraft,
    submitFollowUp,
    saveImage,
    runCompareOcr,
    runCompareWithPreviousText,
    newReflection,
    exportQuote,
  };
}
