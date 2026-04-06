"use client";

import { useQuickAwareness } from "@/context/QuickAwarenessContext";
import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { coerceQuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { getQuestionsForModule } from "@/lib/quick-awareness";
import { packQaAnswers } from "@/lib/quick-awareness/pack-answers";
import { answersSummaryForApi, emotionSnapshot, obsessionPoint } from "@/lib/quick-awareness/scoring";
import type { PhilosophyKey, QuickModuleId } from "@/lib/quick-awareness/types";
import { MODULE_LABELS } from "@/lib/quick-awareness/types";
import type { MirrorTone } from "@/lib/mirror-tone";
import { triggerMirrorRipple } from "@/lib/mirror-ripple";
import { getStoredDeepseekKey } from "@/lib/settings-storage";
import { useEffect, useRef, useState } from "react";
import { MirrorGuidanceBubbles } from "./MirrorGuidanceBubbles";

const FALLBACK_REFLECTION =
  "若愿自问：此刻心里最紧的那一处，在什么条件下会值得被轻轻松开一点点？";

/**
 * 快速觉察「完成并反思」：情绪 / 执着点两卡为规则生成；反思问句 + analysis_table 由
 * `/api/quick-awareness/reflection` 同一路由内两次 DeepSeek 返回。
 */

const optionClass = (on: boolean) =>
  [
    "block w-full min-h-[44px] rounded-lg border p-3 text-left text-sm leading-relaxed transition touch-manipulation sm:min-h-0 md:px-4",
    on
      ? "border-[var(--accent)] bg-stone-50 text-[var(--ink)] shadow-mirror"
      : "border-[var(--line)] bg-white text-[var(--ink)] shadow-mirror active:bg-stone-100 hover:border-[var(--accent)]",
  ].join(" ");

/** 同一路由：反思问句 + analysis_table（六维）；无 Key 或失败时降级 */
async function fetchReflectionWithTable(
  summary: string,
  module: QuickModuleId,
  philosophy: PhilosophyKey,
  tone: MirrorTone,
  seedQuote?: string | null
): Promise<{ question: string; analysis_table: QuickDimensionAnalysis | null }> {
  const key = getStoredDeepseekKey();
  if (!key?.trim()) {
    return { question: FALLBACK_REFLECTION, analysis_table: null };
  }
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 90_000);
    const res = await fetch("/api/quick-awareness/reflection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DeepSeek-Key": key,
      },
      body: JSON.stringify({
        summary,
        tone,
        seedQuote: seedQuote?.trim() || undefined,
        module,
        philosophy,
      }),
      signal: ac.signal,
    });
    clearTimeout(t);
    const raw = await res.text();
    let data: { question?: string; analysis_table?: unknown; error?: string };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch (parseErr) {
      console.error("[quick] reflection response JSON.parse", parseErr);
      return { question: FALLBACK_REFLECTION, analysis_table: null };
    }
    if (!res.ok) {
      console.warn("[quick] reflection HTTP", res.status, data.error);
      return { question: FALLBACK_REFLECTION, analysis_table: null };
    }
    const q = data.question?.trim() || FALLBACK_REFLECTION;
    const at = data.analysis_table;
    const table = coerceQuickDimensionAnalysis(at);
    return { question: q, analysis_table: table };
  } catch (e) {
    console.error("[quick] reflection fetch", e);
    return { question: FALLBACK_REFLECTION, analysis_table: null };
  }
}

export type QuickAwarenessCompletePayload = {
  module: QuickModuleId;
  emotion: string;
  obsession: string;
  reflection: string;
  /** 供「追问」API 理解的填答摘要 */
  summaryForFollowUp: string;
  /** 六维表；成功为对象，未配置 Key 或接口失败为 null */
  dimensionAnalysis: QuickDimensionAnalysis | null;
};

export function QuickAwarenessInlineFlow({
  module,
  onBack,
  onComplete,
  tone,
  seedQuote,
}: {
  module: QuickModuleId;
  onBack: () => void;
  onComplete: (p: QuickAwarenessCompletePayload) => void;
  tone: MirrorTone;
  seedQuote?: string | null;
}) {
  const { philosophy, saveModuleResult } = useQuickAwareness();
  const phi: PhilosophyKey = philosophy;
  const [step, setStep] = useState(0);
  const [choiceById, setChoiceById] = useState<Record<string, number>>({});
  const [textById, setTextById] = useState<Record<string, string>>({});
  const [openTextDraft, setOpenTextDraft] = useState("");
  const [finishing, setFinishing] = useState(false);
  const textByIdRef = useRef<Record<string, string>>({});
  const finishLockRef = useRef(false);
  const openTextareaRef = useRef<HTMLTextAreaElement>(null);
  textByIdRef.current = textById;

  const questions = getQuestionsForModule(module);
  const q = questions[step];
  const total = questions.length;

  useEffect(() => {
    setStep(0);
    setChoiceById({});
    setTextById({});
    setOpenTextDraft("");
    setFinishing(false);
    finishLockRef.current = false;
  }, [module]);

  const finishWithAnswers = async (
    finalChoices: Record<string, number>,
    finalTextMap: Record<string, string>
  ) => {
    if (finishing || finishLockRef.current) return;
    finishLockRef.current = true;
    setFinishing(true);
    try {
      const qs = getQuestionsForModule(module);
      if (qs.length === 0) {
        return;
      }
      const ans = packQaAnswers(qs, finalChoices, finalTextMap);
      const em = emotionSnapshot(qs, ans.choices);
      const ob = obsessionPoint(qs, ans.choices);
      const summary = answersSummaryForApi(module, qs, ans, phi);
      const { question: refStr, analysis_table: dim } = await fetchReflectionWithTable(
        summary,
        module,
        phi,
        tone,
        seedQuote
      );
      saveModuleResult(module, {
        answers: ans,
        emotion: em,
        obsession: ob,
        reflectionQuestion: refStr,
        ...(dim ? { dimensionAnalysis: dim } : {}),
      });
      onComplete({
        module,
        emotion: em,
        obsession: ob,
        reflection: refStr,
        summaryForFollowUp: summary,
        dimensionAnalysis: dim,
      });
    } catch (e) {
      console.error("[quick] finishWithAnswers", e);
      try {
        const qs = getQuestionsForModule(module);
        const ans = packQaAnswers(qs, finalChoices, finalTextMap);
        const em = emotionSnapshot(qs, ans.choices);
        const ob = obsessionPoint(qs, ans.choices);
        const summary = answersSummaryForApi(module, qs, ans, phi);
        saveModuleResult(module, {
          answers: ans,
          emotion: em,
          obsession: ob,
          reflectionQuestion: FALLBACK_REFLECTION,
        });
        onComplete({
          module,
          emotion: em,
          obsession: ob,
          reflection: FALLBACK_REFLECTION,
          summaryForFollowUp: summary,
          dimensionAnalysis: null,
        });
      } catch (e2) {
        console.error("[quick] finishWithAnswers fallback failed", e2);
      }
    } finally {
      setFinishing(false);
      finishLockRef.current = false;
    }
  };

  const pickChoice = (qid: string, optIdx: number) => {
    const qs = getQuestionsForModule(module);
    const cur = qs[step];
    if (cur?.kind !== "choice" || cur.id !== qid || finishing) return;

    const lastIdx = qs.length - 1;
    /** 整组题以选择题结尾（关系 / 工作）；最后一题选完即生成报告，无需再找「完成并反思」 */
    const endsWithChoice = qs[lastIdx]?.kind === "choice";
    const onLastChoiceScreen = step === lastIdx;

    const nextChoices = { ...choiceById, [qid]: optIdx };
    setChoiceById(nextChoices);

    if (onLastChoiceScreen && endsWithChoice) {
      queueMicrotask(() => {
        void finishWithAnswers(nextChoices, textByIdRef.current);
      });
      return;
    }

    if (step < lastIdx) {
      setTimeout(() => setStep((s) => s + 1), 0);
    }
  };

  const submitTextAndFinish = (skip: boolean) => {
    if (q?.kind !== "text") return;
    const tid = q.id;
    const nextText = skip ? "" : openTextDraft;
    const nextMap = { ...textById, [tid]: nextText };
    setTextById(nextMap);
    void finishWithAnswers(choiceById, nextMap);
  };

  const goQuizBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-mirror sm:p-7">
      {seedQuote ? (
        <div className="mb-5 rounded-md border border-[var(--line)] bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--muted)]">
          <p className="text-xs text-[var(--ink)]">今日选读</p>
          <p className="mt-2 text-[var(--ink)]">{seedQuote}</p>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <h2 className="text-base font-normal text-[var(--ink)]">{MODULE_LABELS[module]}</h2>
        <button
          type="button"
          onClick={onBack}
          disabled={finishing}
          className="mirror-no-hover min-h-[44px] text-xs text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-40 sm:min-h-0"
        >
          返回
        </button>
      </div>

      <div className="pt-6">
        {finishing ? (
          <p className="text-sm text-[var(--muted)]">
            正在生成反思问句与多维觉察分析表（同一接口内连续两次模型请求）……
          </p>
        ) : total === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            未能加载本题组（模块状态异常）。请返回后从首页重新进入该觉察模块。
          </p>
        ) : q ? (
          <>
            <div className="mb-4">
              <p className="text-xs tabular-nums text-[var(--muted)]">
                第 {step + 1} / {total} 题
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 sm:h-1">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                  style={{ width: `${((step + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {q.kind === "choice" && (
              <>
                <p className="text-base font-normal leading-relaxed text-[var(--ink)]">{q.text}</p>
                <ul className="mt-6 space-y-3">
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        disabled={finishing}
                        onClick={() => pickChoice(q.id, i)}
                        className={optionClass(choiceById[q.id] === i)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    disabled={step === 0}
                    onClick={goQuizBack}
                    className="mirror-no-hover min-h-[44px] px-3 py-3 text-xs text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-40"
                  >
                    上一题
                  </button>
                  {/*
                   * 关系 / 工作：最后一题为选择题，选完后 pickChoice 内自动提交。
                   * 自我成长：最后一题为开放题，在下方单独提供「完成并反思 / 跳过」。
                   */}
                </div>
              </>
            )}

            {q.kind === "text" && (
              <>
                <p className="text-base font-normal leading-relaxed text-[var(--ink)]">{q.text}</p>
                {step === total - 1 ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    可选填写；点「完成并反思」生成报告，或「跳过」仅用前面选择题结果生成。
                  </p>
                ) : null}
                <MirrorGuidanceBubbles
                  className="mt-3"
                  onPick={(text) => {
                    setOpenTextDraft(text);
                    requestAnimationFrame(() => openTextareaRef.current?.focus());
                  }}
                />
                <textarea
                  ref={openTextareaRef}
                  value={openTextDraft}
                  onChange={(e) => setOpenTextDraft(e.target.value)}
                  rows={4}
                  placeholder={q.placeholder}
                  className="mt-2 w-full resize-y rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] shadow-mirror focus:border-[var(--accent)] focus:outline-none"
                />
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={finishing}
                    onClick={(e) => {
                      triggerMirrorRipple(e);
                      submitTextAndFinish(false);
                    }}
                    className="mirror-ripple-btn min-h-[44px] rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] shadow-mirror hover:border-[var(--accent)]"
                  >
                    完成并反思
                  </button>
                  <button
                    type="button"
                    disabled={finishing}
                    onClick={() => submitTextAndFinish(true)}
                    className="min-h-[44px] rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--muted)] shadow-mirror hover:border-[var(--accent)]"
                  >
                    跳过
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goQuizBack}
                    className="mirror-no-hover min-h-[44px] px-3 py-3 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    上一题
                  </button>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
