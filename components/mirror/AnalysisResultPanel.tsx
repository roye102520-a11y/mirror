"use client";

import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import type { MirrorTone } from "@/lib/mirror-tone";
import type { PhilosophyKey } from "@/lib/result-narratives";
import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { MultiDimensionalReflectionTable } from "./MultiDimensionalReflectionTable";

type Props = {
  captureRef: RefObject<HTMLDivElement | null>;
  title?: string;
  emotion: string;
  obsession: string;
  question: string;
  questionLoading?: boolean;
  followUps: string[];
  followUpLoading: boolean;
  onFollowUp: () => void;
  onSavePng: () => void;
  extraActions?: React.ReactNode;
  /** 有追问后，可请求基于「追问 + 用户回应」的简易整合报告 */
  followUpReport?: {
    philosophy: PhilosophyKey;
    tone: MirrorTone;
    requestReport: (supplement: string) => Promise<{ report?: string; error?: string }>;
  };
  /**
   * 快速觉察专用：多维表。undefined 表示非快速入口不展示；null 表示已请求但未得到有效 JSON。
   */
  quickDimensionAnalysis?: QuickDimensionAnalysis | null;
};

export function AnalysisResultPanel({
  captureRef,
  title,
  emotion,
  obsession,
  question,
  questionLoading,
  followUps,
  followUpLoading,
  onFollowUp,
  onSavePng,
  extraActions,
  followUpReport,
  quickDimensionAnalysis,
}: Props) {
  const [supplement, setSupplement] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportBanner, setReportBanner] = useState<string | null>(null);

  const canShowFollowUpDialog = followUps.length > 0 && followUpReport != null;

  const onGenerateReport = useCallback(async () => {
    if (!followUpReport) return;
    setReportLoading(true);
    setReportBanner(null);
    setReport(null);
    try {
      const out = await followUpReport.requestReport(supplement.trim());
      if (out.error) {
        setReportBanner(out.error);
        return;
      }
      if (out.report?.trim()) {
        setReport(out.report.trim());
        setReportBanner(null);
      } else {
        setReportBanner("未返回有效报告，请重试。");
      }
    } catch {
      setReportBanner("请求失败，请稍后重试。");
    } finally {
      setReportLoading(false);
    }
  }, [followUpReport, supplement]);

  return (
    <div className="space-y-5">
      {/* 仅三张反思卡 + 多维表进入「保存为图片」，不含追问区与底部操作按钮 */}
      <div
        ref={captureRef}
        className="space-y-5 rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8"
      >
        {title ? <p className="text-xs tracking-wide text-[var(--muted)]">{title}</p> : null}
        <div>
          <h3 className="text-xs font-normal uppercase tracking-wide text-[var(--ink)]">情绪</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{emotion}</p>
        </div>
        <div title="Attachment：与关系/成长叙事中反复抓握的主题相关（规则生成文案）">
          <h3 className="text-xs font-normal uppercase tracking-wide text-[var(--ink)]">
            <span className="sr-only">Attachment — </span>
            执着点
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{obsession}</p>
        </div>
        <div>
          <h3 className="text-xs font-normal uppercase tracking-wide text-[var(--ink)]">反思问题</h3>
          {questionLoading ? (
            <p className="mt-2 text-sm text-[var(--muted)]">正在生成……</p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{question}</p>
          )}
        </div>

        {quickDimensionAnalysis !== undefined ? (
          quickDimensionAnalysis ? (
            <MultiDimensionalReflectionTable analysis={quickDimensionAnalysis} />
          ) : (
            <div className="rounded-md border border-dashed border-[#EAEAEA] bg-white px-4 py-3 font-serif">
              <p className="text-xs font-bold text-stone-900">多维觉察分析表</p>
              <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
                本次未能生成表格（常见于未保存 DeepSeek Key、网络异常或模型未返回合法 JSON）。可检查首页或设置中的
                Key 后，重新进入该快速觉察模块并完成答题以重试。
              </p>
            </div>
          )
        ) : null}
      </div>

      {followUps.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-xs font-normal uppercase tracking-wide text-[var(--ink)]">进一步追问</h3>
          {followUps.map((s, i) => (
            <p key={i} className="text-sm leading-relaxed text-[var(--muted)]">
              {i + 1}. {s}
            </p>
          ))}

          {canShowFollowUpDialog ? (
            <div className="mt-5 space-y-3 rounded-md border border-[var(--line)] border-dashed bg-[var(--bg)] p-4">
              <p className="text-xs font-normal text-[var(--ink)]">你的回应</p>
              <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                可针对上面的追问写下任何片段：感受、画面、句子或反驳，不必完整。留空也可生成仅整合追问与前三要素的短文。
              </p>
              <textarea
                value={supplement}
                onChange={(e) => setSupplement(e.target.value)}
                rows={6}
                maxLength={4000}
                className="w-full resize-y rounded-md border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="例如：若放下比较的尺子，我心里那份爱更像……"
              />
              <button
                type="button"
                disabled={reportLoading}
                onClick={() => void onGenerateReport()}
                className="min-h-[44px] rounded-md border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] shadow-sm hover:border-[var(--accent)] disabled:opacity-50"
              >
                {reportLoading ? "正在生成简易报告…" : "根据追问与我的回应 · 生成简易报告"}
              </button>
              {reportBanner ? (
                <p className="text-xs leading-relaxed text-[var(--muted)]">{reportBanner}</p>
              ) : null}
              {report ? (
                <div className="border-t border-[var(--line)] pt-4">
                  <h4 className="text-xs font-normal uppercase tracking-wide text-[var(--ink)]">简易整合报告</h4>
                  <p className="mt-2 text-sm leading-[1.75] text-[var(--muted)]">{report}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-0 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onSavePng}
          className="min-h-[44px] rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] shadow-sm hover:border-[var(--accent)]"
        >
          保存为图片
        </button>
        <button
          type="button"
          disabled={questionLoading || followUpLoading}
          onClick={onFollowUp}
          className="min-h-[44px] rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-sm hover:border-[var(--accent)] disabled:opacity-40"
        >
          {followUpLoading ? "生成中…" : "追问一次"}
        </button>
        {extraActions}
      </div>
    </div>
  );
}
