export type Option = {
  label: string;
  /** 1–5，累加为该雷达轴粗分；主问卷每轴满分 50 */
  pts: number;
};

export type Question = {
  dim: 0 | 1 | 2 | 3 | 4 | 5;
  text: string;
  options: Option[];
};

export type InternetOption = Option & {
  /** 网络人格类型倾向权重 */
  archetypeWeights?: Partial<Record<InternetArchetypeKey, number>>;
};

export type InternetQuestion = {
  text: string;
  options: InternetOption[];
};

export type InternetArchetypeKey =
  | "observer"
  | "expressive"
  | "maintainer"
  | "anonymous"
  | "emotional"
  | "rational";

export const DIMENSION_TITLES = [
  "原生家庭结构",
  "亲密关系模式",
  "社交角色结构",
  "情绪与防御机制",
  "职业与权力结构",
  "自我叙事系统",
] as const;

/** 计分轴顺序（与 main-questions dim 0–5 一致） */
export const RADAR_LABELS = [
  "独立程度",
  "亲密能力",
  "社交能力",
  "情绪稳定",
  "权力适应",
  "自我认知",
] as const;

/**
 * 报告/图表展示顺序：亲密能力 → 社交能力 → 情绪稳定 → 权力适应 → 独立程度 → 自我认知
 * （数值仍按答题 dim 计算，仅调整呈现顺序）
 */
export const RADAR_AXIS_DISPLAY_ORDER = [1, 2, 3, 4, 0, 5] as const;

export function radarValuesForDisplay(values: readonly number[]): number[] {
  return RADAR_AXIS_DISPLAY_ORDER.map((i) => values[i] ?? 0);
}

export function radarLabelsForDisplay(): string[] {
  return RADAR_AXIS_DISPLAY_ORDER.map((i) => RADAR_LABELS[i]);
}

export const MAIN_TOTAL = 60;
export const INTERNET_TOTAL = 8;

/** 主问卷 + 互联网选做共 68 步（含选做入口一步为第 61 步） */
export const QUIZ_TOTAL_STEP_COUNT = MAIN_TOTAL + INTERNET_TOTAL;
