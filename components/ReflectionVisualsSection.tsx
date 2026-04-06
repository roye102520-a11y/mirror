"use client";

import dynamic from "next/dynamic";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { EXAMPLE_PATTERN_DATA, PatternRadar, type PatternRadarData } from "@/components/PatternRadar";
import { MoodHeatmapCalendar, buildDemoMoodDataForMonth } from "@/components/MoodHeatmapCalendar";
import { TrendLineChart, buildDemoTrendPoints } from "@/components/TrendLineChart";
import {
  HabitTrackerGrid,
  buildDemoHabitForMonth,
  buildDemoHabitSummaries,
} from "@/components/HabitTrackerGrid";
import { EXAMPLE_REFLECTION_TEXTS } from "@/lib/example-reflection-texts";
import { useMemo } from "react";

const PersonalWordCloud = dynamic(
  () => import("@/components/PersonalWordCloud").then((m) => ({ default: m.PersonalWordCloud })),
  {
    ssr: false,
    loading: () => <p className="text-xs text-[var(--muted)]">加载词云…</p>,
  }
);

/**
 * 问卷完成页内省图表区：模式雷达（可有问卷推导数据）、情绪月历、趋势线、词云、习惯网格（示意数据）。
 */
export function ReflectionVisualsSection({
  narrative,
  patternData,
}: {
  narrative: string;
  /** 传则替代示意模式雷达（如由主问卷推导） */
  patternData?: PatternRadarData | null;
}) {
  const { year, month, moodData, habitData, habitSummaries, trendData, texts } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return {
      year: y,
      month: m,
      moodData: buildDemoMoodDataForMonth(y, m),
      habitData: buildDemoHabitForMonth(y, m),
      habitSummaries: buildDemoHabitSummaries(y, m),
      trendData: buildDemoTrendPoints(),
      texts: (() => {
        const t = narrative.trim();
        if (!t) return [...EXAMPLE_REFLECTION_TEXTS];
        const parts = t.split(/[。！？\n]+/).map((s) => s.trim()).filter(Boolean);
        return parts.length > 0 ? parts : [t];
      })(),
    };
  }, [narrative]);

  return (
    <section className="space-y-14 border border-[var(--line)] bg-[var(--bg)] p-6 md:p-8">
      <header>
        <h2 className="text-base font-normal text-[var(--ink)]">内省可视化</h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          模式雷达优先展示由本次扫描推导的执着维度强度；情绪月历、趋势线与习惯网格当前为与本月对齐的演示数据，词云优先使用你在问卷中的叙述与开放作答（若无则使用内置示例句）。
        </p>
      </header>

      <SectionErrorBoundary label="模式雷达">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">模式雷达</h3>
          <p className="text-xs text-[var(--muted)]">
            猜测他人、自我责备、灾难化、过度控制、回避沟通——由六轴雷达与关系风险推导的相对强度（0–100）。
          </p>
          <PatternRadar data={patternData ?? EXAMPLE_PATTERN_DATA} className="max-w-md" />
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="情绪热力图">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">情绪热力图</h3>
          <MoodHeatmapCalendar year={year} month={month} data={moodData} />
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="趋势线">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">反思深度 / 消耗趋势线</h3>
          <TrendLineChart data={trendData} yMin={1} yMax={10} height={200} />
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="个人词云">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">个人词云</h3>
          <PersonalWordCloud textArray={texts} shape="rectangle" minHeight={260} />
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary label="习惯网格">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">反思习惯网格</h3>
          <HabitTrackerGrid
            year={year}
            month={month}
            habitData={habitData}
            summaries={habitSummaries}
          />
        </div>
      </SectionErrorBoundary>
    </section>
  );
}
