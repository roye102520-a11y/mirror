"use client";

import { LocalPrivacyBar } from "@/components/LocalPrivacyBar";
import { QuizProgressBar } from "@/components/QuizProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { useQuickAwareness } from "@/context/QuickAwarenessContext";
import { useQuiz } from "@/context/QuizContext";
import { INTERNET_QUESTIONS } from "@/lib/internet-questions";
import { MAIN_QUESTIONS } from "@/lib/main-questions";
import { PHILOSOPHY_QUESTION_INDEX } from "@/lib/result-narratives";
import { SCAN_OPEN_PROMPTS } from "@/lib/scan-open-prompts";
import { DIMENSION_TITLES, MAIN_TOTAL } from "@/lib/quiz-types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function optionButtonClass(selected: boolean) {
  const base =
    "block w-full min-h-[44px] border p-3 text-left text-sm leading-relaxed transition touch-manipulation sm:min-h-0 sm:p-3 md:px-4 md:py-3";
  return selected
    ? `${base} border-[var(--accent)] bg-stone-50 text-[var(--ink)]`
    : `${base} border-[var(--line)] bg-white text-[var(--ink)] active:bg-stone-100 hover:border-[var(--accent)]`;
}

const navButtonClass =
  "min-h-[44px] min-w-[4.5rem] px-3 py-3 text-xs text-[var(--muted)] transition hover:text-[var(--ink)] disabled:opacity-40 sm:min-h-0 sm:min-w-0 sm:py-2 touch-manipulation";

export function QuizPageClient() {
  const router = useRouter();
  const { philosophy } = useQuickAwareness();
  const philSyncedRef = useRef(false);
  const {
    storageReady,
    mainAnswers,
    mainIndex,
    setMainAnswer,
    goMain,
    internet,
    offerInternet,
    skipInternet,
    startInternet,
    submitInternetAnswer,
    goInternet,
    isMainComplete,
    scanOpenComplete,
    scanOpenIndex,
    scanOpenTexts,
    advanceScanOpen,
    skipScanOpenRemaining,
  } = useQuiz();

  const [openDraft, setOpenDraft] = useState("");

  useEffect(() => {
    setOpenDraft(scanOpenTexts[scanOpenIndex] ?? "");
  }, [scanOpenIndex, scanOpenTexts]);

  useEffect(() => {
    if (internet.phase === "skipped" || internet.phase === "done") {
      router.replace("/result");
    }
  }, [internet.phase, router]);

  useEffect(() => {
    if (!storageReady) return;
    if (isMainComplete && scanOpenComplete && internet.phase === "none") {
      offerInternet();
    }
  }, [storageReady, isMainComplete, scanOpenComplete, internet.phase, offerInternet]);

  useEffect(() => {
    if (!storageReady || philSyncedRef.current) return;
    const ph = PHILOSOPHY_QUESTION_INDEX;
    if (mainAnswers[ph] != null && mainAnswers[ph] >= 0) {
      philSyncedRef.current = true;
      return;
    }
    const map: Record<string, number> = { existential: 0, stoic: 1, eastern: 2 };
    const idx = map[philosophy];
    if (idx === undefined) {
      philSyncedRef.current = true;
      return;
    }
    setMainAnswer(ph, idx);
    philSyncedRef.current = true;
  }, [storageReady, philosophy, mainAnswers, setMainAnswer]);

  if (!storageReady) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-24 text-sm text-[var(--muted)] sm:px-6">
          加载中……
        </main>
        <LocalPrivacyBar />
      </div>
    );
  }

  if (isMainComplete && !scanOpenComplete) {
    const prompt = SCAN_OPEN_PROMPTS[scanOpenIndex] ?? SCAN_OPEN_PROMPTS[0]!;
    const stepLabel = `开放作答 ${scanOpenIndex + 1} / 3`;

    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <QuizProgressBar currentStep={MAIN_TOTAL + scanOpenIndex + 1} contextLine={stepLabel} />
          <p className="text-xs text-[var(--muted)]">
            不计分，仅用于生成报告中的文字与示意图表。可跳过未填。
          </p>
          <h1 className="mt-6 text-base font-normal leading-relaxed text-[var(--ink)]">{prompt}</h1>
          <textarea
            value={openDraft}
            onChange={(e) => setOpenDraft(e.target.value)}
            rows={8}
            maxLength={1200}
            className="mt-6 w-full resize-y rounded-lg border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink)] shadow-mirror focus:border-[var(--accent)] focus:outline-none"
            placeholder="写几句即可，不必完整。"
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => advanceScanOpen(openDraft)}
              className="min-h-[44px] border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] hover:border-[var(--accent)]"
            >
              {scanOpenIndex < 2 ? "下一题" : "完成，进入下一环节"}
            </button>
            <button
              type="button"
              onClick={() => advanceScanOpen("")}
              className="min-h-[44px] border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--muted)] hover:border-[var(--accent)]"
            >
              跳过本题
            </button>
            <button
              type="button"
              onClick={() => skipScanOpenRemaining()}
              className="min-h-[44px] text-sm text-[var(--muted)] underline underline-offset-4"
            >
              跳过全部开放题
            </button>
          </div>
        </main>
        <LocalPrivacyBar />
      </div>
    );
  }

  if (internet.phase === "offered") {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-16">
          <QuizProgressBar
            currentStep={MAIN_TOTAL + 4}
            contextLine="选做 · 网络人格补充（第 61–68 步）"
          />
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            是否补充互联网维度（8 个选做题）？这将帮助观察你的网络人格。
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startInternet}
              className="min-h-[44px] border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] hover:border-[var(--accent)] sm:min-h-0 sm:px-5 sm:py-3 touch-manipulation"
            >
              是
            </button>
            <button
              type="button"
              onClick={() => {
                skipInternet();
                router.push("/result");
              }}
              className="min-h-[44px] border border-[var(--line)] bg-white p-3 text-sm text-[var(--muted)] hover:border-[var(--accent)] sm:min-h-0 sm:px-5 sm:py-3 touch-manipulation"
            >
              跳过
            </button>
          </div>
        </main>
        <LocalPrivacyBar />
      </div>
    );
  }

  if (internet.phase === "active") {
    const iq = INTERNET_QUESTIONS[internet.index];
    const answered = internet.answers[internet.index];
    const step = MAIN_TOTAL + internet.index + 1;

    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <QuizProgressBar
            currentStep={step}
            contextLine={`网络人格补充 · 第 ${internet.index + 1} / ${INTERNET_QUESTIONS.length} 问`}
          />
          <h1 className="text-base font-normal leading-relaxed text-[var(--ink)]">{iq.text}</h1>
          <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-2">
            {iq.options.map((opt, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => submitInternetAnswer(internet.index, i)}
                  className={optionButtonClass(answered === i)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-between gap-2">
            <button
              type="button"
              disabled={internet.index === 0}
              onClick={() => goInternet(internet.index - 1)}
              className={navButtonClass}
              title="仅返回题号，已选选项仍保留"
            >
              上一题
            </button>
            <span className="min-w-[4.5rem]" aria-hidden />
          </div>
        </main>
        <LocalPrivacyBar />
      </div>
    );
  }

  const q = MAIN_QUESTIONS[mainIndex];
  const sel = mainAnswers[mainIndex];

  function onSelect(optionIndex: number) {
    setMainAnswer(mainIndex, optionIndex);
    if (mainIndex < MAIN_TOTAL - 1) {
      goMain(mainIndex + 1);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <QuizProgressBar currentStep={mainIndex + 1} contextLine={DIMENSION_TITLES[q.dim]} />
        <h1 className="text-base font-normal leading-relaxed text-[var(--ink)]">{q.text}</h1>
        <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-2">
          {q.options.map((opt, i) => (
            <li key={i}>
              <button type="button" onClick={() => onSelect(i)} className={optionButtonClass(sel === i)}>
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={mainIndex === 0}
            onClick={() => goMain(mainIndex - 1)}
            className={navButtonClass}
            title="仅返回题号，已选选项仍保留"
          >
            上一题
          </button>
          {isMainComplete && scanOpenComplete && internet.phase === "none" ? (
            <button
              type="button"
              onClick={() => offerInternet()}
              className={`${navButtonClass} max-sm:w-full max-sm:text-center sm:max-w-none`}
            >
              进入网络选做
            </button>
          ) : (
            <span className="min-w-[4.5rem]" aria-hidden />
          )}
        </div>
      </main>
      <LocalPrivacyBar />
    </div>
  );
}
