import type { PhilosophyKey } from "@/lib/result-narratives";

export type { PhilosophyKey };

export type QuickModuleId = "relation" | "work" | "growth";

export type RadarDimensionKey = "anxiety" | "selfBlame" | "guessing" | "catastrophizing" | "control";

/** 选项可携带规则标签（情绪/执着片段 + 雷达增量） */
export type QaOption = {
  label: string;
  /** 雷达五维 0–3 粗略增量，后端规则再归一化 */
  dim?: Partial<Record<RadarDimensionKey, number>>;
  /** 拼入情绪快照的短语（可空） */
  emotionFrag?: string;
  /** 拼入执着点的短语 */
  obsessionFrag?: string;
};

export type QaQuestion =
  | { kind: "choice"; id: string; text: string; options: QaOption[] }
  | { kind: "text"; id: string; text: string; required: boolean; placeholder?: string };

export type QaAnswers = {
  choices: (number | null)[];
  openText?: string;
};

export const PHILOSOPHY_LABELS: Record<PhilosophyKey, string> = {
  existential: "存在主义（选择创造意义）",
  stoic: "斯多葛（控制可控的）",
  eastern: "东方哲学（放下执着）",
  utilitarian: "功利主义（追求快乐）",
  religious: "宗教或精神信仰",
  unknown: "暂不归类",
};

export const MODULE_LABELS: Record<QuickModuleId, string> = {
  relation: "关系觉察",
  work: "工作觉察",
  growth: "自我成长觉察",
};
