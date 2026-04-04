import type { PhilosophyKey } from "@/lib/result-narratives";

/** 首页三选一（与 QuickAwareness / 随机一问一致） */
export const MIRROR_PHILOSOPHY_OPTIONS: { key: PhilosophyKey; label: string; short: string }[] = [
  { key: "existential", label: "存在主义", short: "选择、自由与承担" },
  { key: "stoic", label: "斯多葛", short: "可控与回应" },
  { key: "eastern", label: "东方哲学", short: "观照与松执" },
];

export const RANDOM_QUESTION_BY_PHILOSOPHY: Record<"existential" | "stoic" | "eastern", string> = {
  existential: "此刻，你选择把注意力放在哪里？",
  stoic: "今天，哪些是你无法控制的？哪些是你的回应？",
  eastern: "这个想法出现了，你可以只是看着它。你愿意试试吗？",
};

export function randomPromptForPhilosophy(p: PhilosophyKey): string {
  if (p === "existential" || p === "stoic" || p === "eastern") {
    return RANDOM_QUESTION_BY_PHILOSOPHY[p];
  }
  return RANDOM_QUESTION_BY_PHILOSOPHY.eastern;
}

export function mirrorPhilosophyCoach(p: PhilosophyKey): string {
  switch (p) {
    case "existential":
      return "哲学取向：存在主义。强调自由选择、自我承担；不替用户判定他人或关系走向。";
    case "stoic":
      return "哲学取向：斯多葛。区分可控与不可控，强调内在回应而非掌控外界。";
    case "eastern":
      return "哲学取向：东方哲学。邀请观照念头、松一点对结果的抓取，不重说教。";
    default:
      return "哲学取向：温和综合。不评判他者，不预言关系，只协助自我理解。";
  }
}
