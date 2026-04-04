"use client";

import type { ReflectionAnalysis } from "@/lib/quick-awareness/dimension-analysis";
import { QuickDimensionAnalysisTable } from "./MultiDimensionalAnalysisTable";

/** 反思流结果页：多维觉察分析表（标题「多维觉察分析表」与脚注由子组件固定） */
export function MultiDimensionalReflectionTable({
  analysis,
}: {
  analysis: ReflectionAnalysis;
}) {
  return <QuickDimensionAnalysisTable analysis={analysis} />;
}
