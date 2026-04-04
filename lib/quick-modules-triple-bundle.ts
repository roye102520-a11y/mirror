import { getQuestionsForModule } from "@/lib/quick-awareness";
import {
  answersSummaryForApi,
  crossEmotionPattern,
  crossObsessionDiff,
  rawRadarFromAnswers,
} from "@/lib/quick-awareness/scoring";
import type { PhilosophyKey, QuickModuleId, QaAnswers } from "@/lib/quick-awareness/types";

type QuickModuleResultShape = {
  answers: QaAnswers;
  emotion: string;
  obsession: string;
  reflectionQuestion: string;
};

const ORDER: QuickModuleId[] = ["relation", "work", "growth"];

/** 三项快速觉察均完成时，拼成给模型的摘要（无 PII 规则文本外的内容） */
export function bundleForTripleQuickReport(
  results: Partial<Record<QuickModuleId, QuickModuleResultShape>>,
  philosophy: PhilosophyKey
): string | null {
  if (!results.relation || !results.work || !results.growth) return null;

  const blocks: string[] = [];
  blocks.push(`哲学取向（首页所选）：${philosophy}`);
  blocks.push("");

  for (const id of ORDER) {
    const r = results[id]!;
    const qs = getQuestionsForModule(id);
    blocks.push(`【${id === "relation" ? "关系" : id === "work" ? "工作" : "自我成长"}觉察】`);
    blocks.push(answersSummaryForApi(id, qs, r.answers, philosophy));
    blocks.push(`本模块 AI 生成反思问句：${r.reflectionQuestion}`);
    blocks.push("");
  }

  const qsR = getQuestionsForModule("relation");
  const qsW = getQuestionsForModule("work");
  const qsG = getQuestionsForModule("growth");
  const rawR = rawRadarFromAnswers(qsR, results.relation!.answers.choices);
  const rawW = rawRadarFromAnswers(qsW, results.work!.answers.choices);
  const rawG = rawRadarFromAnswers(qsG, results.growth!.answers.choices);

  blocks.push("【规则交叉观察（非诊断）】");
  blocks.push(`关系×工作：${crossEmotionPattern("relation", rawR, "work", rawW)}`);
  blocks.push(`关系×成长：${crossEmotionPattern("relation", rawR, "growth", rawG)}`);
  blocks.push(`工作×成长：${crossEmotionPattern("work", rawW, "growth", rawG)}`);
  blocks.push(
    `执着对照：${crossObsessionDiff(results.relation!.obsession, results.work!.obsession, "relation", "work").slice(0, 120)}…`
  );

  return blocks.join("\n").slice(0, 12000);
}
