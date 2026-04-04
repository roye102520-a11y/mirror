import { GROWTH_QUESTIONS } from "./questions-growth";
import { RELATION_QUESTIONS } from "./questions-relation";
import { WORK_QUESTIONS } from "./questions-work";
import type { QaQuestion } from "./types";
import type { QuickModuleId } from "./types";

export function getQuestionsForModule(m: QuickModuleId): QaQuestion[] {
  switch (m) {
    case "relation":
      return RELATION_QUESTIONS;
    case "work":
      return WORK_QUESTIONS;
    case "growth":
      return GROWTH_QUESTIONS;
    default:
      // 运行时令牌/缓存损坏时 m 可能非 union 成员；勿返回 undefined，否则 questions[step] 会抛错
      return [];
  }
}

export function countChoiceQuestions(qs: QaQuestion[]): number {
  return qs.filter((q) => q.kind === "choice").length;
}

export function totalQuizSteps(qs: QaQuestion[]): number {
  return qs.length;
}
