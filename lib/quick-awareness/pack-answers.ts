import type { QaAnswers, QaQuestion } from "./types";

export function packQaAnswers(
  questions: QaQuestion[],
  choiceById: Record<string, number>,
  textById: Record<string, string>
): QaAnswers {
  const choices: (number | null)[] = [];
  let openText: string | undefined;
  for (const q of questions) {
    if (q.kind === "choice") {
      const v = choiceById[q.id];
      choices.push(typeof v === "number" ? v : null);
    } else {
      const t = textById[q.id]?.trim();
      if (t) openText = t;
    }
  }
  return { choices, openText };
}

export function isChoiceComplete(questions: QaQuestion[], choiceById: Record<string, number>): boolean {
  for (const q of questions) {
    if (q.kind === "choice" && choiceById[q.id] == null) return false;
  }
  return true;
}
