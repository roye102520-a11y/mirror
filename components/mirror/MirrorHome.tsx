"use client";

import { LocalPrivacyBar } from "@/components/LocalPrivacyBar";
import { SiteHeader } from "@/components/SiteHeader";
import dynamic from "next/dynamic";
import { useQuickAwareness } from "@/context/QuickAwarenessContext";
import { ContradictionExercisePanel } from "@/components/mirror/ContradictionExercisePanel";
import { bundleForTripleQuickReport } from "@/lib/quick-modules-triple-bundle";
import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { coerceQuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { getQuestionsForModule } from "@/lib/quick-awareness";
import { DAILY_PHILOSOPHY_COUNT, getRandomPhilosophyLine } from "@/lib/daily-philosophy-lines";
import { MIRROR_PHILOSOPHY_OPTIONS, randomPromptForPhilosophy } from "@/lib/mirror-prompts";
import type { MirrorTone } from "@/lib/mirror-tone";
import {
  MIRROR_TONE_OPTIONS,
  readStoredMirrorTone,
  writeStoredMirrorTone,
} from "@/lib/mirror-tone";
import { getStoredDeepseekKey, setStoredDeepseekKey } from "@/lib/settings-storage";
import {
  answersSummaryForApi,
  crossEmotionPattern,
  crossObsessionDiff,
  crossSummaryForApi,
  MODULE_SHORT,
  normalizeRadar,
  rawRadarFromAnswers,
} from "@/lib/quick-awareness/scoring";
import type { PhilosophyKey, QuickModuleId } from "@/lib/quick-awareness/types";
import { MODULE_LABELS, PHILOSOPHY_LABELS } from "@/lib/quick-awareness/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  readStoredMirrorAutoStartQuiz,
  writeStoredMirrorAutoStartQuiz,
} from "@/lib/mirror-quiz-autostart";
import { triggerMirrorRipple } from "@/lib/mirror-ripple";
import { AnalysisResultPanel } from "./AnalysisResultPanel";
import { MirrorCalmIntroOverlay } from "./MirrorCalmIntroOverlay";
import { MirrorGuidanceBubbles } from "./MirrorGuidanceBubbles";
import { MirrorMascotField } from "./MirrorMascotField";
import { QuickAwarenessInlineFlow, type QuickAwarenessCompletePayload } from "./QuickAwarenessInlineFlow";

type View = "hub" | "free" | "quick" | "random" | "result" | "quick-triple-report";

const FREE_TEMPLATES = [
  "我感到______，因为______。",
  "对方说的哪句话最让我在意？______",
  "如果诚实一点，我害怕的是：______",
];

const FALLBACK_REFLECTION =
  "若愿自问：此刻心里最紧的那一处，在什么条件下会值得被轻轻松开一点点？";

const QuickCompareRadar = dynamic(
  () =>
    import("@/components/quick-awareness/QuickCompareRadar").then((m) => ({
      default: m.QuickCompareRadar,
    })),
  {
    ssr: false,
    loading: () => <p className="text-xs text-[var(--muted)]">加载对照图…</p>,
  }
);

type ResultBundle = {
  source: "free" | "random" | "quick";
  emotion: string;
  obsession: string;
  question: string;
  quickModule?: QuickModuleId;
  userTextForFollowUp: string;
  /** 六维多维觉察表（quick / 自由书写 / 随机一问）；null 表示本路由内第二次调用失败或未配置 Key */
  dimensionAnalysis?: QuickDimensionAnalysis | null;
};

type CrossNormState = {
  normA: ReturnType<typeof normalizeRadar>;
  normB: ReturnType<typeof normalizeRadar>;
  labelA: string;
  labelB: string;
};

export function MirrorHome() {
  const router = useRouter();
  const { philosophy, setPhilosophy, results, resultsHydrated } = useQuickAwareness();

  const [view, setView] = useState<View>("hub");
  const [quickModule, setQuickModule] = useState<QuickModuleId | null>(null);

  const [keyDraft, setKeyDraft] = useState("");
  const [freeText, setFreeText] = useState("");
  const [randomPrompt, setRandomPrompt] = useState("");
  const [randomReply, setRandomReply] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const [result, setResult] = useState<ResultBundle | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const [comparePhase, setComparePhase] = useState<"idle" | "pick" | "view">("idle");
  const [compareOther, setCompareOther] = useState<QuickModuleId | null>(null);
  const [crossText, setCrossText] = useState("");
  const [crossObs, setCrossObs] = useState("");
  const [crossQ, setCrossQ] = useState("");
  const [crossLoading, setCrossLoading] = useState(false);
  const [crossNorm, setCrossNorm] = useState<CrossNormState | null>(null);

  const [mirrorTone, setMirrorToneState] = useState<MirrorTone>("gentle");
  const [autoStartQuiz, setAutoStartQuiz] = useState(false);
  const [dailyLine, setDailyLine] = useState("");
  const [dailyLineLoading, setDailyLineLoading] = useState(false);
  const [quickSeedQuote, setQuickSeedQuote] = useState<string | null>(null);
  const [freeWritingSeed, setFreeWritingSeed] = useState("");
  const [freeSeedLoading, setFreeSeedLoading] = useState(false);
  const [randomPromptLoading, setRandomPromptLoading] = useState(false);

  const [tripleReportText, setTripleReportText] = useState("");
  const [tripleReportErr, setTripleReportErr] = useState("");
  const [tripleReportLoading, setTripleReportLoading] = useState(false);

  /** 首页静心卡片：同一会话内关闭后不再出现，直至新开标签/会话 */
  const [calmIntroOpen, setCalmIntroOpen] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const tripleReportRef = useRef<HTMLDivElement>(null);
  const freeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const randomTextareaRef = useRef<HTMLTextAreaElement>(null);

  const allThreeQuickDone = useMemo(
    () =>
      resultsHydrated && Boolean(results.relation && results.work && results.growth),
    [resultsHydrated, results.relation, results.work, results.growth]
  );

  useEffect(() => {
    setKeyDraft(getStoredDeepseekKey());
  }, [view]);

  useEffect(() => {
    setMirrorToneState(readStoredMirrorTone());
    setAutoStartQuiz(readStoredMirrorAutoStartQuiz());
  }, []);

  useEffect(() => {
    if (view !== "hub") {
      setCalmIntroOpen(false);
      return;
    }
    try {
      setCalmIntroOpen(sessionStorage.getItem("mirror-calm-intro-v1") !== "1");
    } catch {
      setCalmIntroOpen(true);
    }
  }, [view]);

  const fetchMirrorInspiration = useCallback(
    async (kind: "daily" | "random_question" | "free_seed"): Promise<string | null> => {
      const key = getStoredDeepseekKey().trim();
      if (!key) return null;
      try {
        const res = await fetch("/api/mirror/inspiration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DeepSeek-Key": key,
          },
          body: JSON.stringify({
            kind,
            philosophy,
            refreshToken: `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
          }),
        });
        const raw = await res.text();
        if (!res.ok) return null;
        try {
          const data = JSON.parse(raw) as { text?: string };
          return data.text?.trim() || null;
        } catch {
          return null;
        }
      } catch {
        return null;
      }
    },
    [philosophy]
  );

  /** 首页「今日一句」：每次进入首页或换哲学取向时请求 API；无 Key / 失败则用本地词库随机 */
  useEffect(() => {
    if (view !== "hub") return;
    let cancelled = false;
    setDailyLineLoading(true);
    setDailyLine("");
    void (async () => {
      const apiLine = await fetchMirrorInspiration("daily");
      if (cancelled) return;
      setDailyLine(apiLine ?? getRandomPhilosophyLine());
      setDailyLineLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [view, philosophy, fetchMirrorInspiration]);

  /** 随机一问：每次进入该页或切换哲学时向 API 要新问题 */
  useEffect(() => {
    if (view !== "random") return;
    let cancelled = false;
    setRandomPromptLoading(true);
    setRandomReply("");
    void (async () => {
      const line = await fetchMirrorInspiration("random_question");
      if (cancelled) return;
      setRandomPrompt(line ?? randomPromptForPhilosophy(philosophy));
      setRandomPromptLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [view, philosophy, fetchMirrorInspiration]);

  /** 自由书写：进入页时拉一句书写邀请（可走 API） */
  useEffect(() => {
    if (view !== "free") return;
    let cancelled = false;
    setFreeWritingSeed("");
    setFreeSeedLoading(true);
    void (async () => {
      const line = await fetchMirrorInspiration("free_seed");
      if (cancelled) return;
      setFreeWritingSeed(line ?? getRandomPhilosophyLine());
      setFreeSeedLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [view, philosophy, fetchMirrorInspiration]);

  const refreshDailyLine = useCallback(() => {
    setDailyLineLoading(true);
    void (async () => {
      const line = await fetchMirrorInspiration("daily");
      setDailyLine(line ?? getRandomPhilosophyLine());
      setDailyLineLoading(false);
    })();
  }, [fetchMirrorInspiration]);

  const refreshRandomPrompt = useCallback(() => {
    setRandomPromptLoading(true);
    void (async () => {
      const line = await fetchMirrorInspiration("random_question");
      setRandomPrompt(line ?? randomPromptForPhilosophy(philosophy));
      setRandomPromptLoading(false);
    })();
  }, [fetchMirrorInspiration, philosophy]);

  const refreshFreeSeed = useCallback(() => {
    setFreeSeedLoading(true);
    void (async () => {
      const line = await fetchMirrorInspiration("free_seed");
      setFreeWritingSeed(line ?? getRandomPhilosophyLine());
      setFreeSeedLoading(false);
    })();
  }, [fetchMirrorInspiration]);

  const setMirrorTone = useCallback((t: MirrorTone) => {
    setMirrorToneState(t);
    writeStoredMirrorTone(t);
  }, []);

  const onPhilosophyPick = useCallback(
    (key: PhilosophyKey) => {
      setPhilosophy(key);
      if (readStoredMirrorAutoStartQuiz()) router.push("/quiz");
    },
    [setPhilosophy, router]
  );

  const onTonePick = useCallback(
    (t: MirrorTone) => {
      setMirrorTone(t);
      if (readStoredMirrorAutoStartQuiz()) router.push("/quiz");
    },
    [setMirrorTone, router]
  );

  const goHub = useCallback(() => {
    setView("hub");
    setQuickModule(null);
    setQuickSeedQuote(null);
    setResult(null);
    setFollowUps([]);
    setComparePhase("idle");
    setCompareOther(null);
    setCrossNorm(null);
    setCrossQ("");
    setTripleReportText("");
    setTripleReportErr("");
    setTripleReportLoading(false);
  }, []);

  const runTripleReport = useCallback(async () => {
    const bundle = bundleForTripleQuickReport(results, philosophy);
    if (!bundle) {
      setTripleReportErr(
        "三项快速觉察数据不完整。请返回首页，依次完成关系、工作与自我成长模块后再试。"
      );
      return;
    }
    const key = getStoredDeepseekKey().trim();
    if (!key) {
      setTripleReportErr("请先在页面下方或设置页填写并保存 DeepSeek API Key。");
      return;
    }

    setTripleReportLoading(true);
    setTripleReportErr("");
    try {
      const res = await fetch("/api/quick-awareness/triple-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-Key": key,
        },
        body: JSON.stringify({
          bundle,
          philosophyLabel: PHILOSOPHY_LABELS[philosophy],
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        try {
          const j = JSON.parse(raw) as { error?: string };
          setTripleReportErr(j.error?.trim() || raw.slice(0, 220));
        } catch {
          setTripleReportErr(raw.slice(0, 220));
        }
        return;
      }
      const data = JSON.parse(raw) as { report?: string };
      const text = data.report?.trim() ?? "";
      if (!text) {
        setTripleReportErr("模型未返回正文，请稍后重试。");
        return;
      }
      setTripleReportText(text);
    } catch (e) {
      setTripleReportErr(e instanceof Error ? e.message : "网络错误，请检查连接后重试。");
    } finally {
      setTripleReportLoading(false);
    }
  }, [results, philosophy]);

  const saveBlockPng = async (ref: typeof captureRef, filename: string) => {
    const el = ref.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#fafafa",
      logging: false,
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    a.click();
  };

  const requireKey = () => {
    const k = getStoredDeepseekKey().trim();
    if (!k) {
      window.alert("请先在页面下方填写并保存 DeepSeek API Key。");
      return null;
    }
    return k;
  };

  const runFreeOrRandomAnalyze = async (mode: "free" | "random") => {
    const key = requireKey();
    if (!key) return;

    const text =
      mode === "free"
        ? freeText.trim()
        : [randomPrompt, randomReply.trim()].filter(Boolean).join("\n\n—\n\n");

    if (!text.trim()) {
      window.alert(mode === "free" ? "请先写下你的想法。" : "可以只保留问题本身；若要书写，请至少输入一小段。");
      return;
    }

    setAnalyzeLoading(true);
    try {
      const res = await fetch("/api/mirror/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-Key": key,
        },
        body: JSON.stringify({
          text: text.slice(0, 8000),
          philosophy,
          mode,
          tone: mirrorTone,
          promptContext: mode === "random" ? `随机一问：${randomPrompt}` : undefined,
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        window.alert(`分析失败：${raw.slice(0, 200)}`);
        return;
      }
      let data: {
        emotion?: string;
        obsession?: string;
        attachment?: string;
        question?: string;
        analysis_table?: unknown;
      };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch (parseErr) {
        console.error("[mirror] analyze-text response parse", parseErr);
        window.alert("分析结果解析失败，请重试。");
        return;
      }
      const table = coerceQuickDimensionAnalysis(data.analysis_table);
      setResult({
        source: mode,
        emotion: data.emotion ?? "",
        obsession: data.obsession ?? data.attachment ?? "",
        question: data.question ?? "",
        userTextForFollowUp: text,
        dimensionAnalysis: table,
      });
      setFollowUps([]);
      setComparePhase("idle");
      setView("result");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "网络错误");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const onQuickComplete = useCallback((p: QuickAwarenessCompletePayload) => {
    setResult({
      source: "quick",
      emotion: p.emotion,
      obsession: p.obsession,
      question: p.reflection,
      quickModule: p.module,
      userTextForFollowUp: p.summaryForFollowUp,
      dimensionAnalysis: p.dimensionAnalysis,
    });
    setFollowUps([]);
    setComparePhase("idle");
    setQuickModule(null);
    setQuickSeedQuote(null);
    setView("result");
  }, []);

  const handleFollowUp = async () => {
    if (!result) return;
    const key = requireKey();
    if (!key) return;
    setFollowUpLoading(true);
    try {
      const res = await fetch("/api/mirror/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-Key": key,
        },
        body: JSON.stringify({
          philosophy,
          tone: mirrorTone,
          emotion: result.emotion,
          obsession: result.obsession,
          question: result.question,
          userText: result.userTextForFollowUp,
          priorFollowUps: followUps,
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        window.alert(raw.slice(0, 200));
        return;
      }
      const data = JSON.parse(raw) as { question?: string };
      const q = data.question?.trim();
      if (q) setFollowUps((prev) => [...prev, q]);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "错误");
    } finally {
      setFollowUpLoading(false);
    }
  };

  const activeQuick = result?.quickModule;
  const otherCompleted = useMemo(
    () =>
      activeQuick
        ? (["relation", "work", "growth"] as QuickModuleId[]).filter(
            (m) => m !== activeQuick && results[m] != null
          )
        : [],
    [activeQuick, results]
  );
  const canCompare = result?.source === "quick" && otherCompleted.length > 0;

  const runCompare = async () => {
    if (!activeQuick || !compareOther || !results[activeQuick] || !results[compareOther]) return;
    const modA = activeQuick;
    const modB = compareOther;
    const qsA = getQuestionsForModule(modA);
    const qsB = getQuestionsForModule(modB);
    const rawA = rawRadarFromAnswers(qsA, results[modA]!.answers.choices);
    const rawB = rawRadarFromAnswers(qsB, results[modB]!.answers.choices);
    const normA = normalizeRadar(rawA);
    const normB = normalizeRadar(rawB);
    const sim = crossEmotionPattern(modA, rawA, modB, rawB);
    const diff = crossObsessionDiff(results[modA]!.obsession, results[modB]!.obsession, modA, modB);

    setCrossNorm({
      normA,
      normB,
      labelA: MODULE_SHORT[modA],
      labelB: MODULE_SHORT[modB],
    });
    setCrossText(sim);
    setCrossObs(diff);
    setComparePhase("view");
    setCrossLoading(true);
    setCrossQ("");

    const bundle = crossSummaryForApi(
      modA,
      modB,
      answersSummaryForApi(modA, qsA, results[modA]!.answers, philosophy),
      answersSummaryForApi(modB, qsB, results[modB]!.answers, philosophy),
      sim,
      diff,
      philosophy
    );

    const key = requireKey();
    if (!key) {
      setCrossQ(FALLBACK_REFLECTION);
      setCrossLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/quick-awareness/cross", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-Key": key,
        },
        body: JSON.stringify({ bundle, tone: mirrorTone }),
      });
      const raw = await res.text();
      if (!res.ok) {
        setCrossQ(FALLBACK_REFLECTION);
        return;
      }
      const data = JSON.parse(raw) as { question?: string };
      setCrossQ(data.question?.trim() || FALLBACK_REFLECTION);
    } catch {
      setCrossQ(FALLBACK_REFLECTION);
    } finally {
      setCrossLoading(false);
    }
  };

  useEffect(() => {
    if (comparePhase === "pick" && otherCompleted.length > 0 && !compareOther) {
      setCompareOther(otherCompleted[0] ?? null);
    }
  }, [comparePhase, otherCompleted, compareOther]);

  const hubCards = (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => setView("free")}
        className="rounded-lg border border-[var(--line)] bg-white p-6 text-left shadow-mirror transition hover:border-[var(--accent)]"
      >
        <p className="text-sm font-normal text-[var(--ink)]">自由书写</p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">适合已经想清楚要写什么的人。</p>
      </button>
      <button
        type="button"
        onClick={() => {
          setQuickSeedQuote(null);
          setQuickModule(null);
          setView("quick");
        }}
        className="rounded-lg border border-[var(--line)] bg-white p-6 text-left shadow-mirror transition hover:border-[var(--accent)]"
      >
        <p className="text-sm font-normal text-[var(--ink)]">快速觉察</p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">适合思绪混乱、想快速得到反馈的人。</p>
      </button>
      <button
        type="button"
        onClick={() => setView("random")}
        className="rounded-lg border border-[var(--line)] bg-white p-6 text-left shadow-mirror transition hover:border-[var(--accent)]"
      >
        <p className="text-sm font-normal text-[var(--ink)]">随机一问</p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">适合不想写、只想被启发的人。</p>
      </button>
    </div>
  );

  const settingsBlock = (
    <div className="mt-12 space-y-6 rounded-lg border border-[var(--line)] bg-white p-6 shadow-mirror">
      <div>
        <p className="text-xs font-normal text-[var(--ink)]">哲学取向</p>
        <p className="mt-1 text-xs text-[var(--muted)]">三个入口共用，用于生成反思语气。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MIRROR_PHILOSOPHY_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPhilosophyPick(key)}
              className={[
                "shadow-mirror min-h-[44px] rounded-md border px-4 py-2 text-xs sm:min-h-0",
                philosophy === key
                  ? "border-[var(--accent)] bg-stone-50 text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-normal text-[var(--ink)]">对话语气</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          影响 AI 反馈措辞：温和偏容纳，尖锐偏直面念头（仍禁止人身攻击与关系下定论）。
        </p>
        <div className="mt-4 space-y-3">
          {MIRROR_TONE_OPTIONS.map(({ id, label, hint }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTonePick(id)}
              className={[
                "block w-full rounded-md border p-3 text-left text-sm shadow-mirror transition sm:px-4",
                mirrorTone === id
                  ? "border-[var(--accent)] bg-stone-50 text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]",
              ].join(" ")}
            >
              <span className="text-[var(--ink)]">{label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">{hint}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-left">
          <input
            type="checkbox"
            className="mt-1 rounded border-[var(--line)]"
            checked={autoStartQuiz}
            onChange={(e) => {
              const on = e.target.checked;
              setAutoStartQuiz(on);
              writeStoredMirrorAutoStartQuiz(on);
            }}
          />
          <span>
            <span className="text-xs font-normal text-[var(--ink)]">选好后自动进入完整扫描</span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
              开启后，下次点击「哲学取向」或「对话语气」任一项即跳转到问卷（沿用当前本页选择）。仍可随时用上方「开始完整扫描」手动进入。
            </span>
          </span>
        </label>
      </div>
      <div>
        <p className="text-xs font-normal text-[var(--ink)]">DeepSeek API Key</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          仅存于本机。未填写时部分功能会使用内置占位问句。也可在{" "}
          <Link href="/settings" className="underline underline-offset-4">
            设置
          </Link>{" "}
          修改。
        </p>
        <input
          type="password"
          autoComplete="off"
          value={keyDraft}
          onChange={(e) => setKeyDraft(e.target.value)}
          className="mt-3 w-full rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] shadow-mirror focus:border-[var(--accent)] focus:outline-none"
          placeholder="sk-..."
        />
        <button
          type="button"
          onClick={() => setStoredDeepseekKey(keyDraft)}
          className="mt-3 rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)]"
        >
          保存 Key
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-6 sm:py-20">
        {view === "hub" && (
          <>
            <p className="text-center text-sm font-normal lowercase tracking-[0.2em] text-[var(--ink)]">mirror</p>
            <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              We cannot control others. But we can see ourselves clearly.
            </p>
            <div className="mx-auto mt-10 max-w-xl rounded-lg border border-[var(--line)] bg-white p-6 text-left shadow-mirror sm:p-7">
              <p className="text-xs font-normal tracking-wide text-[var(--ink)]">完整扫描</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                约 60 道选择题与三道开放题；完成后生成图表、模式雷达（由答题推导）与整体哲学短析。请先在下方选好哲学取向与对话语气，再开始——它们会同步到问卷并影响报告语气。若勾选「选好后自动进入完整扫描」，点选哲学或语气后也会直接跳转问卷。
              </p>
              <Link
                href="/quiz"
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] sm:w-auto"
              >
                开始完整扫描
              </Link>
            </div>
            <div className="mx-auto mt-12 max-w-xl rounded-lg border border-[var(--line)] bg-white p-6 text-left shadow-mirror sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-normal tracking-wide text-[var(--ink)]">今日一句</p>
                <button
                  type="button"
                  disabled={dailyLineLoading}
                  onClick={() => void refreshDailyLine()}
                  className="mirror-no-hover text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)] disabled:opacity-40"
                >
                  换一句
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--ink)]">
                {dailyLineLoading ? "正在生成…" : dailyLine || "……"}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                已保存 DeepSeek Key 时由模型生成，每次进首页或点「换一句」都会变；无 Key 时从本地{" "}
                {DAILY_PHILOSOPHY_COUNT} 则词库随机。报告与表格仅归纳你的答题/原文，不编造未写内容。
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuickSeedQuote(dailyLine);
                  setQuickModule(null);
                  setView("quick");
                }}
                disabled={!dailyLine || dailyLineLoading}
                className="mt-5 min-h-[44px] w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] disabled:opacity-40 sm:w-auto"
              >
                今天我想用这句话反思
              </button>
            </div>
            {allThreeQuickDone ? (
              <div className="mx-auto mt-12 max-w-xl rounded-lg border border-[var(--accent)]/40 bg-amber-50/40 p-6 text-left shadow-mirror sm:p-7">
                <p className="text-xs font-normal tracking-wide text-[var(--ink)]">三模块已完成</p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                  关系、工作、自我成长三项快速觉察已保存在本机。可生成一段简易整合说明，把三个面向放在同一段落里对照（使用当前首页所选哲学取向）。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTripleReportText("");
                    setTripleReportErr("");
                    setTripleReportLoading(false);
                    setView("quick-triple-report");
                  }}
                  className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] sm:w-auto"
                >
                  生成简易整合报告
                </button>
              </div>
            ) : null}
            {hubCards}
            {settingsBlock}
          </>
        )}

        {view === "free" && (
          <div className="mx-auto max-w-xl space-y-6">
            <button type="button" onClick={goHub} className="mirror-no-hover text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              ← 返回
            </button>
            <h1 className="text-lg font-normal text-[var(--ink)]">自由书写</h1>
            {(freeSeedLoading || freeWritingSeed) && (
              <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-sm shadow-mirror">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[var(--muted)]">书写提示（API 生成，每次进入本页更新）</p>
                  <button
                    type="button"
                    disabled={freeSeedLoading}
                    onClick={() => void refreshFreeSeed()}
                    className="mirror-no-hover text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)] disabled:opacity-40"
                  >
                    换一句
                  </button>
                </div>
                <p className="mt-2 leading-relaxed text-[var(--ink)]">
                  {freeSeedLoading ? "正在生成…" : freeWritingSeed}
                </p>
              </div>
            )}
            <p className="text-sm text-[var(--muted)]">点击下方可插入句式，再接着写下去。</p>
            <div className="flex flex-wrap gap-2">
              {FREE_TEMPLATES.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFreeText((prev) => (prev ? `${prev}\n${t}` : t))}
                  className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)] shadow-mirror hover:border-[var(--accent)]"
                  title={t}
                >
                  模板 {i + 1}
                </button>
              ))}
            </div>
            <MirrorGuidanceBubbles
              className="mt-4"
              onPick={(text) => {
                setFreeText(text);
                requestAnimationFrame(() => freeTextareaRef.current?.focus());
              }}
            />
            <MirrorMascotField>
              {(m) => (
                <textarea
                  ref={freeTextareaRef}
                  {...m}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={12}
                  className="shadow-mirror w-full resize-y rounded-lg border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="写什么都可以。无需完整，只要对你真实。"
                />
              )}
            </MirrorMascotField>
            <button
              type="button"
              disabled={analyzeLoading}
              onClick={(e) => {
                triggerMirrorRipple(e);
                void runFreeOrRandomAnalyze("free");
              }}
              className="mirror-ripple-btn min-h-[44px] w-full rounded-lg border border-[var(--line)] bg-white py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] disabled:opacity-40 sm:w-auto sm:px-8"
            >
              {analyzeLoading ? "分析中…" : "反思"}
            </button>
          </div>
        )}

        {view === "quick" && !quickModule && (
          <div className="mx-auto max-w-xl space-y-6">
            <button type="button" onClick={goHub} className="mirror-no-hover text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              ← 返回
            </button>
            {quickSeedQuote ? (
              <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-sm shadow-mirror">
                <p className="text-xs text-[var(--muted)]">今日选读（将带入快速觉察最后的反思问句）</p>
                <p className="mt-2 leading-relaxed text-[var(--ink)]">{quickSeedQuote}</p>
              </div>
            ) : null}
            <h1 className="text-lg font-normal text-[var(--ink)]">选择觉察模块</h1>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["relation", "work", "growth"] as QuickModuleId[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setQuickModule(m)}
                  className="rounded-lg border border-[var(--line)] bg-white p-5 text-left text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)]"
                >
                  {m === "relation" ? "关系觉察（12 题）" : m === "work" ? "工作觉察（14 题）" : "自我成长觉察（6 题）"}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "quick" && quickModule && (
          <div className="mx-auto max-w-xl">
            <QuickAwarenessInlineFlow
              module={quickModule}
              tone={mirrorTone}
              seedQuote={quickSeedQuote}
              onBack={() => setQuickModule(null)}
              onComplete={onQuickComplete}
            />
          </div>
        )}

        {view === "quick-triple-report" && (
          <div className="mx-auto max-w-xl space-y-6">
            <button type="button" onClick={goHub} className="mirror-no-hover text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              ← 返回首页
            </button>
            {results.relation && results.work && results.growth ? (
              <>
                <h1 className="text-lg font-normal text-[var(--ink)]">三项快速觉察 · 整合报告</h1>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  以下摘录来自各模块 AI 反馈中的「情绪张力」一句，仅供核对；正式整合段落由模型根据完整答题摘要生成。
                </p>
                <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-mirror">
                  {(["relation", "work", "growth"] as QuickModuleId[]).map((m) => (
                    <p key={m} className="text-sm leading-relaxed text-[var(--ink)]">
                      <span className="text-[var(--muted)]">{MODULE_LABELS[m]}</span>
                      <span className="mx-2 text-[var(--line)]">·</span>
                      {results[m]!.emotion}
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={tripleReportLoading}
                    onClick={(e) => {
                      triggerMirrorRipple(e);
                      void runTripleReport();
                    }}
                    className="mirror-ripple-btn min-h-[44px] rounded-lg border border-[var(--line)] bg-white px-6 py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] disabled:opacity-40"
                  >
                    {tripleReportLoading ? "生成中…" : tripleReportText ? "重新生成" : "生成简易报告"}
                  </button>
                </div>
                {tripleReportErr ? (
                  <p className="text-sm leading-relaxed text-red-700">{tripleReportErr}</p>
                ) : null}
                {tripleReportText ? (
                  <div
                    ref={tripleReportRef}
                    className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6 shadow-mirror sm:p-8"
                  >
                    <p className="text-xs text-[var(--muted)]">整合报告（{PHILOSOPHY_LABELS[philosophy]}）</p>
                    <div key={tripleReportText.slice(0, 120)} className="mirror-ai-reveal">
                      <p className="text-sm leading-relaxed text-[var(--ink)]">{tripleReportText}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveBlockPng(tripleReportRef, "mirror-triple-report.png")}
                      className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm shadow-mirror hover:border-[var(--accent)]"
                    >
                      保存为图片
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                三项快速觉察数据未齐备或尚未从本机恢复，请返回首页重新完成关系、工作与自我成长模块。
              </p>
            )}
          </div>
        )}

        {view === "random" && (
          <div className="mx-auto max-w-xl space-y-6">
            <button type="button" onClick={goHub} className="mirror-no-hover text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              ← 返回
            </button>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-lg font-normal text-[var(--ink)]">随机一问</h1>
              <button
                type="button"
                disabled={randomPromptLoading}
                onClick={() => void refreshRandomPrompt()}
                className="mirror-no-hover text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)] disabled:opacity-40"
              >
                换一问
              </button>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-mirror">
              <p className="text-sm leading-relaxed text-[var(--ink)]">
                {randomPromptLoading ? "正在生成问题…" : randomPrompt}
              </p>
            </div>
            <label className="block text-xs text-[var(--muted)]">写下你的思考（可选）</label>
            <MirrorGuidanceBubbles
              className="mt-3"
              onPick={(text) => {
                setRandomReply(text);
                requestAnimationFrame(() => randomTextareaRef.current?.focus());
              }}
            />
            <MirrorMascotField className="mt-2">
              {(m) => (
                <textarea
                  ref={randomTextareaRef}
                  {...m}
                  value={randomReply}
                  onChange={(e) => setRandomReply(e.target.value)}
                  rows={8}
                  className="shadow-mirror w-full resize-y rounded-lg border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              )}
            </MirrorMascotField>
            <button
              type="button"
              disabled={analyzeLoading}
              onClick={(e) => {
                triggerMirrorRipple(e);
                void runFreeOrRandomAnalyze("random");
              }}
              className="mirror-ripple-btn min-h-[44px] w-full rounded-lg border border-[var(--line)] bg-white py-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)] disabled:opacity-40 sm:w-auto sm:px-8"
            >
              {analyzeLoading ? "分析中…" : "反思"}
            </button>
          </div>
        )}

        {view === "result" && result && (
          <div className="mx-auto max-w-xl space-y-8">
            <button type="button" onClick={goHub} className="mirror-no-hover text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              ← 返回首页
            </button>

            <AnalysisResultPanel
              captureRef={captureRef}
              title={
                result.source === "quick" && result.quickModule
                  ? `${MODULE_LABELS[result.quickModule]} · 觉察`
                  : result.source === "random"
                    ? "随机一问 · 反思"
                    : "自由书写 · 反思"
              }
              emotion={result.emotion}
              obsession={result.obsession}
              question={result.question}
              followUps={followUps}
              followUpLoading={followUpLoading}
              onFollowUp={() => void handleFollowUp()}
              onSavePng={() => void saveBlockPng(captureRef, "mirror-reflection.png")}
              followUpReport={{
                philosophy,
                tone: mirrorTone,
                requestReport: async (supplement) => {
                  const key = getStoredDeepseekKey().trim();
                  if (!key) {
                    return { error: "请先在首页下方或设置页保存 DeepSeek API Key。" };
                  }
                  try {
                    const res = await fetch("/api/mirror/follow-up-report", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-DeepSeek-Key": key,
                      },
                      body: JSON.stringify({
                        philosophy,
                        tone: mirrorTone,
                        emotion: result.emotion,
                        obsession: result.obsession,
                        question: result.question,
                        followUps,
                        supplement,
                      }),
                    });
                    const raw = await res.text();
                    if (!res.ok) {
                      try {
                        const j = JSON.parse(raw) as { error?: string };
                        return { error: j.error ?? raw.slice(0, 200) };
                      } catch {
                        return { error: raw.slice(0, 200) };
                      }
                    }
                    const data = JSON.parse(raw) as { report?: string };
                    return { report: data.report };
                  } catch (e) {
                    return { error: e instanceof Error ? e.message : "网络错误" };
                  }
                },
              }}
              extraActions={
                canCompare ? (
                  <button
                    type="button"
                    onClick={() => {
                      setComparePhase("pick");
                      setCompareOther(otherCompleted[0] ?? null);
                    }}
                    className="min-h-[44px] rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-mirror hover:border-[var(--accent)]"
                  >
                    对比其他模块
                  </button>
                ) : result.source === "quick" ? (
                  <span className="flex min-h-[44px] items-center text-xs text-[var(--muted)]">
                    再完成一个快速觉察模块后即可对比
                  </span>
                ) : null
              }
              quickDimensionAnalysis={
                result.source === "quick" || result.source === "free" || result.source === "random"
                  ? (result.dimensionAnalysis ?? null)
                  : undefined
              }
            />

            <ContradictionExercisePanel obsession={result.obsession} />

            {comparePhase === "pick" && activeQuick && (
              <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-mirror">
                <p className="text-sm text-[var(--muted)]">选择与「{MODULE_SHORT[activeQuick]}」对照的模块：</p>
                <select
                  value={compareOther ?? ""}
                  onChange={(e) => setCompareOther(e.target.value as QuickModuleId)}
                  className="mt-3 w-full rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]"
                >
                  {otherCompleted.map((m) => (
                    <option key={m} value={m}>
                      {MODULE_LABELS[m]}
                    </option>
                  ))}
                </select>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void runCompare()}
                    disabled={!compareOther}
                    className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm hover:border-[var(--accent)] disabled:opacity-40"
                  >
                    生成交叉分析
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparePhase("idle")}
                    className="text-sm text-[var(--muted)]"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {comparePhase === "view" && activeQuick && compareOther && crossNorm && (
              <div
                ref={compareRef}
                className="space-y-5 rounded-lg border border-[var(--line)] bg-white p-6 shadow-mirror sm:p-8"
              >
                <p className="text-xs text-[var(--muted)]">
                  交叉 · {MODULE_SHORT[activeQuick]} × {MODULE_SHORT[compareOther]}
                </p>
                <div>
                  <h3 className="text-xs text-[var(--ink)]">情绪模式相似性</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{crossText}</p>
                </div>
                <div>
                  <h3 className="text-xs text-[var(--ink)]">执着点差异</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{crossObs}</p>
                </div>
                <div>
                  <h3 className="text-xs text-[var(--ink)]">五维对照</h3>
                  <QuickCompareRadar
                    normA={crossNorm.normA}
                    normB={crossNorm.normB}
                    labelA={crossNorm.labelA}
                    labelB={crossNorm.labelB}
                  />
                </div>
                <div>
                  <h3 className="text-xs text-[var(--ink)]">综合反思问题</h3>
                  {crossLoading ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">正在生成……</p>
                  ) : (
                    <div key={crossQ.slice(0, 96)} className="mirror-ai-reveal">
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{crossQ}</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void saveBlockPng(compareRef, "mirror-cross.png")}
                  className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm shadow-mirror hover:border-[var(--accent)]"
                >
                  保存交叉分析为图片
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <LocalPrivacyBar />
      {calmIntroOpen ? <MirrorCalmIntroOverlay onDismiss={() => setCalmIntroOpen(false)} /> : null}
    </div>
  );
}
