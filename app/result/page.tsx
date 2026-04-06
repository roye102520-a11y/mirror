"use client";

import { QuickDimensionAnalysisTable } from "@/components/mirror/MultiDimensionalAnalysisTable";
import type { RelationshipAiBlurbs } from "@/components/RelationshipAnalysisReport";
import { RelationshipAnalysisReport } from "@/components/RelationshipAnalysisReport";
import { ReflectionVisualsSection } from "@/components/ReflectionVisualsSection";
import { SiteHeader } from "@/components/SiteHeader";
import { useQuickAwareness } from "@/context/QuickAwarenessContext";
import { useQuiz } from "@/context/QuizContext";
import {
  attachmentNarrative,
  careerNarrative,
  philosophyFromAnswers,
  relationCycleNarrative,
  socialRoleNarrative,
} from "@/lib/result-narratives";
import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { coerceQuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { pickRandomClassicQuote } from "@/lib/classic-quotes";
import { MIRROR_PHILOSOPHY_OPTIONS } from "@/lib/mirror-prompts";
import { MIRROR_TONE_OPTIONS, readStoredMirrorTone } from "@/lib/mirror-tone";
import { patternRadarFromScan } from "@/lib/pattern-from-scan";
import { saveReflectionHistoryRecord } from "@/lib/reflection-history-store";
import {
  attachmentStyle,
  bundleForScanPhilosophyAnalysis,
  careerStructure,
  dominantRelationRisk,
  internetArchetype,
  radarScores,
  relationRisks,
  socialRole,
  summaryForQuote,
} from "@/lib/scoring";
import { getStoredDeepseekKey } from "@/lib/settings-storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SCAN_ANALYSIS_FALLBACK =
  "此处本可有一段由模型根据你的勾选与开放作答写成的短析；在未连接或请求失败时，不妨先留一步：哪几道题的答案略让你意外，它们是否都在守护同一种不易察觉的不安？";

const SCAN_ANALYSIS_NO_KEY = "未配置 API Key。你可以在设置中填入 DeepSeek Key 后刷新本页，或先阅读上方结构化报告与图表。";

export default function ResultPage() {
  const router = useRouter();
  const { philosophy } = useQuickAwareness();
  const {
    storageReady,
    mainAnswers,
    narrative,
    internet,
    resetAll,
    isMainComplete,
    scanOpenComplete,
    scanOpenTexts,
  } = useQuiz();
  const captureRef = useRef<HTMLDivElement>(null);
  const [skipAiQuote, setSkipAiQuote] = useState(false);
  const [quoteText, setQuoteText] = useState<string | null>(null);
  const [quoteBanner, setQuoteBanner] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [relAiBlurbs, setRelAiBlurbs] = useState<RelationshipAiBlurbs | null>(null);
  const [relAiLoading, setRelAiLoading] = useState(false);
  const [relAiBanner, setRelAiBanner] = useState<string | null>(null);

  const patternForRadar = useMemo(
    () => patternRadarFromScan(radarScores(mainAnswers), relationRisks(mainAnswers)),
    [mainAnswers]
  );

  const [scanAnalysis, setScanAnalysis] = useState<string | null>(null);
  const [scanAnalysisBanner, setScanAnalysisBanner] = useState<string | null>(null);
  const [scanAnalysisLoading, setScanAnalysisLoading] = useState(false);

  const [resultDimensionAnalysis, setResultDimensionAnalysis] = useState<QuickDimensionAnalysis | null>(
    null
  );
  const [resultDimensionBanner, setResultDimensionBanner] = useState<string | null>(null);
  const [resultDimensionLoading, setResultDimensionLoading] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  useEffect(() => {
    if (!storageReady) return;
    if (!isMainComplete) {
      router.replace("/quiz");
    }
  }, [storageReady, isMainComplete, router]);

  useEffect(() => {
    if (!storageReady || !isMainComplete || !scanOpenComplete) return;

    if (skipAiQuote) {
      setQuoteLoading(false);
      setQuoteBanner("已跳过 AI 生成，以下为经典名言。");
      setQuoteText(pickRandomClassicQuote());
      return;
    }

    const key = getStoredDeepseekKey();
    if (!key) {
      setQuoteLoading(false);
      setQuoteBanner("未配置 API Key，以下为经典名言。");
      setQuoteText(pickRandomClassicQuote());
      return;
    }

    const ac = new AbortController();
    const timeoutMs = 45_000;
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    setQuoteLoading(true);
    setQuoteBanner(null);
    setQuoteText(null);

    const summary = summaryForQuote(mainAnswers, narrative);
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DeepSeek-Key": key,
          },
          body: JSON.stringify({ summary }),
          signal: ac.signal,
        });
        let raw = "";
        try {
          raw = await res.text();
        } catch (err) {
          console.error("[quote] 读取响应失败", err);
          throw err;
        }
        if (cancelled) return;

        if (!res.ok) {
          let detail = raw.slice(0, 500);
          try {
            const j = JSON.parse(raw) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* keep raw slice */
          }
          console.error("[quote] HTTP 错误", res.status, detail);
          setQuoteText(pickRandomClassicQuote());
          setQuoteBanner("未能获取AI名言，以下为经典名言。");
          return;
        }

        let data: { quote?: string } = {};
        try {
          data = JSON.parse(raw) as { quote?: string };
        } catch (err) {
          console.error("[quote] JSON 解析失败", err, raw.slice(0, 200));
          setQuoteText(pickRandomClassicQuote());
          setQuoteBanner("未能获取AI名言，以下为经典名言。");
          return;
        }

        const q = data.quote?.trim();
        if (q) {
          setQuoteText(q);
          setQuoteBanner(null);
        } else {
          console.error("[quote] 响应中无名言字段", raw.slice(0, 300));
          setQuoteText(pickRandomClassicQuote());
          setQuoteBanner("未能获取AI名言，以下为经典名言。");
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") {
          console.error("[quote] 请求超时或已中止", e.message);
        } else {
          console.error("[quote] 请求异常", e);
        }
        setQuoteText(pickRandomClassicQuote());
        setQuoteBanner("未能获取AI名言，以下为经典名言。");
      } finally {
        clearTimeout(timer);
        if (!cancelled) setQuoteLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ac.abort();
    };
  }, [storageReady, isMainComplete, scanOpenComplete, mainAnswers, narrative, skipAiQuote]);

  useEffect(() => {
    if (!storageReady || !isMainComplete || !scanOpenComplete) return;

    const key = getStoredDeepseekKey();
    if (!key) {
      setScanAnalysis(SCAN_ANALYSIS_NO_KEY);
      setScanAnalysisBanner(null);
      setScanAnalysisLoading(false);
      return;
    }

    const philosophyLabel =
      MIRROR_PHILOSOPHY_OPTIONS.find((o) => o.key === philosophy)?.label ?? philosophy;
    const toneLabel =
      MIRROR_TONE_OPTIONS.find((t) => t.id === readStoredMirrorTone())?.label ?? "";
    const bundle = bundleForScanPhilosophyAnalysis(
      mainAnswers,
      [...scanOpenTexts],
      narrative
    );

    const ac = new AbortController();
    const timeoutMs = 50_000;
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    let cancelled = false;

    setScanAnalysis(null);
    setScanAnalysisLoading(true);
    setScanAnalysisBanner(null);

    (async () => {
      try {
        const res = await fetch("/api/scan-philosophy-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DeepSeek-Key": key,
          },
          body: JSON.stringify({ bundle, philosophyLabel, toneLabel }),
          signal: ac.signal,
        });
        const raw = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          let detail = raw.slice(0, 300);
          try {
            const j = JSON.parse(raw) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* */
          }
          console.error("[scan-philosophy-analysis] HTTP", res.status, detail);
          setScanAnalysis(SCAN_ANALYSIS_FALLBACK);
          setScanAnalysisBanner("生成短析失败，已换用本地占位。");
          return;
        }
        let data: { analysis?: string } = {};
        try {
          data = JSON.parse(raw) as { analysis?: string };
        } catch (err) {
          console.error("[scan-philosophy-analysis] JSON", err);
          setScanAnalysis(SCAN_ANALYSIS_FALLBACK);
          setScanAnalysisBanner("解析响应失败，已换用本地占位。");
          return;
        }
        const text = data.analysis?.trim();
        if (text) {
          setScanAnalysis(text);
          setScanAnalysisBanner(null);
        } else {
          setScanAnalysis(SCAN_ANALYSIS_FALLBACK);
          setScanAnalysisBanner("返回为空，已换用本地占位。");
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") {
          console.error("[scan-philosophy-analysis] 超时或中止", e.message);
        } else {
          console.error("[scan-philosophy-analysis]", e);
        }
        setScanAnalysis(SCAN_ANALYSIS_FALLBACK);
        setScanAnalysisBanner("网络异常或超时，已换用本地占位。");
      } finally {
        clearTimeout(timer);
        if (!cancelled) setScanAnalysisLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ac.abort();
    };
  }, [
    storageReady,
    isMainComplete,
    scanOpenComplete,
    mainAnswers,
    scanOpenTexts,
    narrative,
    philosophy,
  ]);

  useEffect(() => {
    if (!storageReady || !isMainComplete || !scanOpenComplete || historySaved) return;
    saveReflectionHistoryRecord({
      narrative,
      openAnswers: [...scanOpenTexts],
    });
    setHistorySaved(true);
  }, [storageReady, isMainComplete, scanOpenComplete, historySaved, narrative, scanOpenTexts]);

  /** 完整扫描结果页：与哲学短析同摘要，生成六维多维觉察表 */
  useEffect(() => {
    if (!storageReady || !isMainComplete || !scanOpenComplete) return;

    const key = getStoredDeepseekKey();
    if (!key) {
      setResultDimensionAnalysis(null);
      setResultDimensionBanner(
        "未配置 API Key。在设置中保存 DeepSeek Key 后刷新本页，可生成多维觉察分析表。"
      );
      setResultDimensionLoading(false);
      return;
    }

    const bundle = bundleForScanPhilosophyAnalysis(mainAnswers, [...scanOpenTexts], narrative);
    const ac = new AbortController();
    const timeoutMs = 50_000;
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    let cancelled = false;

    setResultDimensionAnalysis(null);
    setResultDimensionLoading(true);
    setResultDimensionBanner(null);

    (async () => {
      try {
        const res = await fetch("/api/quick-awareness/dimension-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DeepSeek-Key": key,
          },
          body: JSON.stringify({
            summary: bundle,
            philosophy,
            fullScan: true,
          }),
          signal: ac.signal,
        });
        const raw = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          let detail = raw.slice(0, 280);
          try {
            const j = JSON.parse(raw) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* */
          }
          setResultDimensionAnalysis(null);
          setResultDimensionBanner(`多维表生成失败：${detail}`);
          return;
        }
        let data: { analysis?: unknown };
        try {
          data = JSON.parse(raw) as { analysis?: unknown };
        } catch {
          setResultDimensionAnalysis(null);
          setResultDimensionBanner("多维表响应解析失败。");
          return;
        }
        const coerced = coerceQuickDimensionAnalysis(data.analysis);
        if (coerced) {
          setResultDimensionAnalysis(coerced);
          setResultDimensionBanner(null);
        } else {
          setResultDimensionAnalysis(null);
          setResultDimensionBanner("多维表返回内容无效或字段不全。");
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") {
          setResultDimensionBanner("多维表请求超时或已中止。");
        } else {
          setResultDimensionBanner("多维表网络异常，请稍后刷新重试。");
        }
        setResultDimensionAnalysis(null);
      } finally {
        clearTimeout(timer);
        if (!cancelled) setResultDimensionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ac.abort();
    };
  }, [
    storageReady,
    isMainComplete,
    scanOpenComplete,
    mainAnswers,
    scanOpenTexts,
    narrative,
    philosophy,
  ]);

  const internetAnswers =
    internet.phase === "done" ? internet.answers : null;
  const netCard = internetArchetype(internetAnswers);

  const radar = radarScores(mainAnswers);
  const risks = relationRisks(mainAnswers);
  const attach = attachmentStyle(mainAnswers);
  const social = socialRole(mainAnswers);
  const career = careerStructure(mainAnswers);
  const phi = philosophyFromAnswers(mainAnswers);
  const attachLines = attachmentNarrative(attach, phi);
  const socialLines = socialRoleNarrative(social, phi);
  const careerLines = careerNarrative(career, phi);
  const domRisk = dominantRelationRisk(risks);
  const cycleLines = relationCycleNarrative(attach, domRisk, social, phi);

  const fetchRelationshipAi = useCallback(async () => {
    const key = getStoredDeepseekKey();
    if (!key) {
      setRelAiBanner("未配置 API Key，请先在设置中保存 DeepSeek Key。");
      setRelAiBlurbs(null);
      return;
    }
    const rk = relationRisks(mainAnswers);
    const at = attachmentStyle(mainAnswers);
    const so = socialRole(mainAnswers);
    const ph = philosophyFromAnswers(mainAnswers);
    const cy = relationCycleNarrative(at, dominantRelationRisk(rk), so, ph);
    const summaryPayload = `${summaryForQuote(mainAnswers, narrative)} 关系循环：${cy.patternTitle}。${cy.brief.slice(0, 200)}`;

    setRelAiLoading(true);
    setRelAiBanner(null);
    try {
      const res = await fetch("/api/relationship-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-Key": key,
        },
        body: JSON.stringify({ summary: summaryPayload }),
      });
      const raw = await res.text();
      let data: { radar?: string; risks?: string; career?: string; cycle?: string; error?: string } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        setRelAiBanner("解析响应失败，请重试。");
        setRelAiBlurbs(null);
        return;
      }
      if (!res.ok) {
        setRelAiBanner(data.error ?? `请求失败（${res.status}）`);
        setRelAiBlurbs(null);
        return;
      }
      const { radar: r, risks: rk, career: c, cycle: cy } = data;
      if (!r || !rk || !c || !cy) {
        setRelAiBanner("返回内容不完整，请重试。");
        setRelAiBlurbs(null);
        return;
      }
      setRelAiBlurbs({ radar: r, risks: rk, career: c, cycle: cy });
    } catch (e) {
      console.error("[relationship-report]", e);
      setRelAiBanner("网络异常，请稍后再试。");
      setRelAiBlurbs(null);
    } finally {
      setRelAiLoading(false);
    }
  }, [mainAnswers, narrative]);

  const savePng = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#fafafa",
      logging: false,
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "personality-60-result.png";
    a.click();
  }, []);

  if (!storageReady) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-24 text-sm text-[var(--muted)]">加载中……</main>
      </>
    );
  }

  if (!isMainComplete) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-24 text-sm text-[var(--muted)]">
          <p>结果页需要在完成主问卷后查看。</p>
          <p className="mt-4">
            <Link href="/quiz" className="text-[var(--ink)] underline underline-offset-4">
              前往答题
            </Link>
            {" · "}
            <Link href="/" className="underline underline-offset-4">
              返回首页
            </Link>
          </p>
        </main>
      </>
    );
  }

  if (!scanOpenComplete) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-24 text-sm text-[var(--muted)]">
          <p>开放作答尚未完成，继续填写后即可查看完整报告。</p>
          <p className="mt-4">
            <Link href="/quiz" className="text-[var(--ink)] underline underline-offset-4">
              继续开放题
            </Link>
            {" · "}
            <Link href="/" className="underline underline-offset-4">
              返回首页
            </Link>
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div ref={captureRef} className="space-y-12 bg-[var(--bg)] p-6 md:p-10">
          <header>
            <h1 className="text-xl font-normal text-[var(--ink)]">扫描完成</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              主问卷与选做步骤已结束。以下为根据答题生成的报告与可视化；若曾填写背景叙述，亦会纳入词云与 API 摘要。
            </p>
            {narrative.trim() ? (
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
                你的文字已作为背景参考纳入摘要（不向第三方展示原文）。
              </p>
            ) : null}
          </header>

          <RelationshipAnalysisReport
            radar={radar}
            risks={risks}
            attachType={attach}
            attachLines={attachLines}
            socialType={social}
            socialLines={socialLines}
            careerType={career}
            careerBrief={careerLines.brief}
            careerReflect={careerLines.reflect}
            cycle={cycleLines}
            aiBlurbs={relAiBlurbs}
          />

          <section className="border border-[var(--line)] p-6">
            <h2 className="text-sm font-normal text-[var(--ink)]">整体哲学短析</h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              根据选择题结构摘要与三道开放题原文生成（约 300 字），语气受首页「哲学取向」与「对话语气」影响。需要本机已配置的 DeepSeek Key。
            </p>
            {scanAnalysisBanner ? (
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{scanAnalysisBanner}</p>
            ) : null}
            {scanAnalysisLoading ? (
              <p className="mt-4 text-sm text-[var(--muted)]">正在生成……</p>
            ) : null}
            {scanAnalysis ? (
              <p className="mt-4 text-sm leading-[1.75] text-[var(--ink)]">{scanAnalysis}</p>
            ) : null}
          </section>

          <section className="border border-[var(--line)] p-6">
            <h2 className="text-sm font-normal text-[var(--ink)]">多维觉察分析表</h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              根据本题卷结构化摘要与三道开放题生成，与 mirror 首页「快速觉察」完成后的六维表格式一致；需本机 DeepSeek Key。
            </p>
            {resultDimensionBanner ? (
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{resultDimensionBanner}</p>
            ) : null}
            {resultDimensionLoading ? (
              <p className="mt-4 text-sm text-[var(--muted)]">正在生成多维表……</p>
            ) : null}
            {resultDimensionAnalysis ? (
              <div className="mt-4">
                <QuickDimensionAnalysisTable
                  analysis={resultDimensionAnalysis}
                  showTitle={false}
                  footerNote="这些分析基于你本次完整扫描与开放题，仅供参考，关键在于你自己的感受。"
                />
              </div>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={fetchRelationshipAi}
              disabled={relAiLoading}
              className="border border-[var(--line)] bg-white px-5 py-2.5 text-sm text-[var(--ink)] hover:border-[var(--accent)] disabled:opacity-50"
            >
              {relAiLoading ? "正在生成 AI 解读…" : relAiBlurbs ? "重新生成 AI 解读" : "生成 AI 综合解读"}
            </button>
            <Link href="/settings" className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              在设置中配置 DeepSeek Key
            </Link>
          </div>
          {relAiBanner ? (
            <p className="text-xs leading-relaxed text-[var(--muted)]">{relAiBanner}</p>
          ) : null}

          <ReflectionVisualsSection narrative={narrative} patternData={patternForRadar} />

          <section className="border border-[var(--line)] p-6">
            <h2 className="text-sm font-normal text-[var(--ink)]">一句名言</h2>
            <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-[var(--line)]"
                checked={skipAiQuote}
                onChange={(e) => setSkipAiQuote(e.target.checked)}
              />
              <span>跳过 AI 生成，使用本地经典名言库</span>
            </label>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              <Link href="/settings" className="underline underline-offset-2 hover:text-[var(--ink)]">
                设置
              </Link>
              中可配置 DeepSeek Key；不配置时将直接使用本地库。
            </p>
            {quoteBanner ? (
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{quoteBanner}</p>
            ) : null}
            {quoteLoading ? (
              <p className="mt-4 text-sm text-[var(--muted)]">正在向 AI 请求一句名言……</p>
            ) : null}
            {quoteText ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{quoteText}</p>
            ) : null}
          </section>

          <section className="border border-[var(--line)] p-6">
            <h2 className="text-sm font-normal text-[var(--ink)]">网络人格补充观察</h2>
            {netCard.key ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{netCard.lines[0]}</p>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">未选择此项观察。</p>
            )}
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={savePng}
            className="border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] hover:border-[var(--accent)]"
          >
            保存为图片
          </button>
          <button
            type="button"
            onClick={() => {
              resetAll();
              router.push("/");
            }}
            className="text-sm text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
          >
            清空并返回首页
          </button>
          <Link href="/settings" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            设置
          </Link>
        </div>
      </main>
    </>
  );
}
