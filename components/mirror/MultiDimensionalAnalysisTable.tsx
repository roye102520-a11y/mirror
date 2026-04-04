"use client";

import type { QuickDimensionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import {
  QUICK_DIMENSION_KEYS,
  QUICK_DIMENSION_ROW_LABELS,
} from "@/lib/quick-awareness/dimension-analysis";

/** 单行：左列维度名，右列分析文案 */
export type MultiDimensionalRow = {
  dimension: string;
  analysis: string;
};

export type MultiDimensionalAnalysisTableProps = {
  /** 表上方主标题 */
  title?: string;
  /** 表头两列文案 */
  columnLabels?: { dimension: string; analysis: string };
  rows: MultiDimensionalRow[];
  /** 表下说明；传空字符串可隐藏 */
  footerNote?: string;
  /** 附加在根容器上的 className */
  className?: string;
  /** 为 false 时不渲染表内主标题（便于页面已有 h2 时分节） */
  showTitle?: boolean;
};

const DEFAULT_TITLE = "多维觉察分析表";
const DEFAULT_COLUMNS = { dimension: "维度", analysis: "分析" };
const DEFAULT_FOOTER =
  "这些分析基于你本次的答案，仅供参考，关键在于你自己的感受。";

/**
 * 通用多维觉察表格：极简灰白、细边、衬线、行间浅分割线。
 * 可用于快速觉察六维数据或任意「维度 / 分析」成对内容。
 */
export function MultiDimensionalAnalysisTable({
  title = DEFAULT_TITLE,
  columnLabels = DEFAULT_COLUMNS,
  rows = [],
  footerNote = DEFAULT_FOOTER,
  className = "",
  showTitle = true,
}: MultiDimensionalAnalysisTableProps) {
  return (
    <div
      className={[
        "mt-1 border bg-white px-4 py-4 sm:px-5 sm:py-5",
        "border-[#EAEAEA]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showTitle ? (
        <h3 className="font-serif text-sm font-semibold tracking-wide text-stone-900">{title}</h3>
      ) : null}
      <div className={`overflow-x-auto ${showTitle ? "mt-4" : ""}`}>
        <table className="w-full min-w-[280px] border-collapse bg-white font-serif text-sm text-stone-800">
          <thead>
            <tr className="border-b border-[#EAEAEA]">
              <th
                scope="col"
                className="w-[28%] py-2.5 pr-3 text-left align-top text-xs font-bold text-stone-900"
              >
                {columnLabels.dimension}
              </th>
              <th
                scope="col"
                className="py-2.5 pl-1 text-left align-top text-xs font-bold text-stone-900"
              >
                {columnLabels.analysis}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${row.dimension}-${i}`}
                className="border-b border-[#EAEAEA] last:border-b-0"
              >
                <th
                  scope="row"
                  className="max-w-[40%] break-words py-3 pr-3 align-top text-xs font-normal leading-relaxed text-stone-600"
                >
                  {row.dimension}
                </th>
                <td className="break-words py-3 pl-1 align-top text-xs leading-relaxed text-stone-800">
                  {row.analysis}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footerNote ? (
        <p className="mt-4 font-serif text-[11px] leading-relaxed text-stone-500">{footerNote}</p>
      ) : null}
    </div>
  );
}

/** 将快速觉察 API 的六字段转成表格行 */
export function quickAnalysisToRows(analysis: QuickDimensionAnalysis): MultiDimensionalRow[] {
  return QUICK_DIMENSION_KEYS.map((key) => ({
    dimension: QUICK_DIMENSION_ROW_LABELS[key],
    analysis: analysis[key],
  }));
}

type QuickOnlyProps = {
  analysis: QuickDimensionAnalysis;
  showTitle?: boolean;
  /** 默认使用镜像首页脚注；完整扫描页可传入更贴切的一句 */
  footerNote?: string;
};

/**
 * 快速觉察专用：标题与脚注固定为产品文案，数据来自 `QuickDimensionAnalysis`。
 */
export function QuickDimensionAnalysisTable({
  analysis,
  showTitle = true,
  footerNote,
}: QuickOnlyProps) {
  return (
    <MultiDimensionalAnalysisTable
      title={DEFAULT_TITLE}
      columnLabels={DEFAULT_COLUMNS}
      rows={quickAnalysisToRows(analysis)}
      footerNote={footerNote ?? DEFAULT_FOOTER}
      showTitle={showTitle}
    />
  );
}
