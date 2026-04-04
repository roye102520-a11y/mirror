"use client";

import { ResultRadar } from "@/components/ResultRadar";
import type { AttachmentType, CareerStructureType, SocialRoleType } from "@/lib/scoring";
import type { OutcomeLines, RelationCycleOutcome } from "@/lib/result-narratives";
import { radarLabelsForDisplay, radarValuesForDisplay } from "@/lib/quiz-types";

type Risks = {
  conflict: number;
  avoidance: number;
  dependency: number;
  control: number;
};

export type RelationshipAiBlurbs = {
  radar: string;
  risks: string;
  career: string;
  cycle: string;
};

export function RelationshipAnalysisReport({
  radar,
  risks,
  attachType,
  attachLines,
  socialType,
  socialLines,
  careerType,
  careerBrief,
  careerReflect,
  cycle,
  aiBlurbs,
}: {
  radar: number[];
  risks: Risks;
  attachType: AttachmentType;
  attachLines: OutcomeLines;
  socialType: SocialRoleType;
  socialLines: OutcomeLines;
  careerType: CareerStructureType;
  careerBrief: string;
  careerReflect: string;
  cycle: RelationCycleOutcome;
  aiBlurbs?: RelationshipAiBlurbs | null;
}) {
  const displayLabels = radarLabelsForDisplay();
  const displayScores = radarValuesForDisplay(radar);
  const scoreLine = displayLabels.map((l, i) => `${l} ${displayScores[i] ?? 0}`).join(" · ");

  const riskRows = (
    [
      ["冲突风险", risks.conflict],
      ["回避风险", risks.avoidance],
      ["依赖风险", risks.dependency],
      ["控制风险", risks.control],
    ] as const
  ).map(([label, v]) => ({ label, v }));

  return (
    <section className="space-y-10 border border-[var(--line)] bg-[var(--bg)] p-6 md:p-8">
      <header>
        <h2 className="text-base font-normal text-[var(--ink)]">扫描完成报告</h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          主问卷完成后自动生成。含人格雷达、关系风险指数、依恋类型、社交角色与职业结构；末段为互动循环补充。非临床诊断。可选「AI
          综合解读」见下方按钮。
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">人格雷达图</h3>
          <p className="text-xs text-[var(--muted)]">
            维度：亲密能力、社交能力、情绪稳定、权力适应、独立程度、自我认知（0–100）。
          </p>
          <p className="text-xs text-[var(--muted)]">{scoreLine}</p>
          <ResultRadar values={radar} />
          {aiBlurbs?.radar ? (
            <p className="text-xs leading-relaxed text-[var(--muted)]">AI：{aiBlurbs.radar}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">关系风险指数</h3>
          <p className="text-xs text-[var(--muted)]">分值越高，该倾向越显著（0–100）。</p>
          <ul className="space-y-4">
            {riskRows.map(({ label, v }) => (
              <li key={label}>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>{label}</span>
                  <span>{v}</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-stone-200">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${v}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {aiBlurbs?.risks ? (
            <p className="text-xs leading-relaxed text-[var(--muted)]">AI：{aiBlurbs.risks}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">依恋类型</h3>
          <p className="text-sm text-[var(--ink)]">{attachType}</p>
          <p className="text-xs leading-relaxed text-[var(--muted)]">{attachLines.brief}</p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{attachLines.reflect}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-normal text-[var(--ink)]">社交角色</h3>
          <p className="text-sm text-[var(--ink)]">{socialType}</p>
          <p className="text-xs leading-relaxed text-[var(--muted)]">{socialLines.brief}</p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{socialLines.reflect}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-normal text-[var(--ink)]">职业结构</h3>
        <p className="text-sm text-[var(--ink)]">{careerType}</p>
        <p className="text-xs leading-relaxed text-[var(--muted)]">{careerBrief}</p>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{careerReflect}</p>
        {aiBlurbs?.career ? (
          <p className="text-xs leading-relaxed text-[var(--muted)]">AI：{aiBlurbs.career}</p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-[var(--line)] pt-8">
        <h3 className="text-sm font-normal text-[var(--ink)]">关系互动循环</h3>
        <p className="text-xs text-[var(--muted)]">结合风险倾向与依恋的启发式描述，便于对照日常互动。</p>
        <p className="text-sm text-[var(--ink)]">「{cycle.patternTitle}」</p>
        <p className="text-xs leading-relaxed text-[var(--muted)]">{cycle.brief}</p>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{cycle.reflect}</p>
        {aiBlurbs?.cycle ? (
          <p className="text-xs leading-relaxed text-[var(--muted)]">AI：{aiBlurbs.cycle}</p>
        ) : null}
      </div>
    </section>
  );
}
