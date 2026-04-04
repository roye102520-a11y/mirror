import type { PhilosophyKey, QuickModuleId, QaAnswers, QaQuestion, RadarDimensionKey } from "./types";

const DIMS: RadarDimensionKey[] = [
  "anxiety",
  "selfBlame",
  "guessing",
  "catastrophizing",
  "control",
];

export function rawRadarFromAnswers(
  questions: QaQuestion[],
  choices: (number | null)[]
): Record<RadarDimensionKey, number> {
  const acc: Record<RadarDimensionKey, number> = {
    anxiety: 0,
    selfBlame: 0,
    guessing: 0,
    catastrophizing: 0,
    control: 0,
  };

  let ci = 0;
  for (const q of questions) {
    if (q.kind !== "choice") continue;
    const idx = choices[ci];
    ci++;
    if (idx == null || !q.options[idx]) continue;
    const d = q.options[idx].dim;
    if (!d) continue;
    for (const k of DIMS) {
      const v = d[k];
      if (typeof v === "number") acc[k] += v;
    }
  }
  return acc;
}

/** 0–100，用于雷达展示 */
export function normalizeRadar(raw: Record<RadarDimensionKey, number>): Record<RadarDimensionKey, number> {
  const cap = 24;
  const out = { ...raw };
  for (const k of DIMS) {
    out[k] = Math.min(100, Math.round((raw[k] / cap) * 100));
  }
  return out;
}

export function emotionSnapshot(questions: QaQuestion[], choices: (number | null)[]): string {
  const frags: string[] = [];
  let ci = 0;
  for (const q of questions) {
    if (q.kind !== "choice") continue;
    const idx = choices[ci];
    ci++;
    if (idx == null) continue;
    const f = q.options[idx]?.emotionFrag?.trim();
    if (f) frags.push(f);
  }
  const uniq = [...new Set(frags)];
  if (uniq.length === 0) return "此刻的讯号较为内敛，可在安静里辨认最近 recurring 的心绪质地。";
  return `你此刻的自我觉察里，较显著的体验包括：${uniq.slice(0, 4).join("；")}。`;
}

export function obsessionPoint(questions: QaQuestion[], choices: (number | null)[]): string {
  const frags: string[] = [];
  let ci = 0;
  for (const q of questions) {
    if (q.kind !== "choice") continue;
    const idx = choices[ci];
    ci++;
    if (idx == null) continue;
    const f = q.options[idx]?.obsessionFrag?.trim();
    if (f) frags.push(f);
  }
  const uniq = [...new Set(frags)];
  if (uniq.length === 0) return "执着点尚未在选项中清晰聚拢，或你正有意与之拉开一点距离。";
  return `可能的执着轴心落在：${uniq.slice(0, 3).join("；")}。`;
}

export const MODULE_SHORT: Record<QuickModuleId, string> = {
  relation: "关系",
  work: "工作",
  growth: "自我成长",
};

const MODULE_WORD: Record<QuickModuleId, string> = {
  relation: "关系中",
  work: "工作中",
  growth: "自我成长议题里",
};

/** 情绪模式相似性（前端规则） */
export function crossEmotionPattern(
  a: QuickModuleId,
  rawA: Record<RadarDimensionKey, number>,
  b: QuickModuleId,
  rawB: Record<RadarDimensionKey, number>
): string {
  const parts: string[] = [];
  if (rawA.anxiety >= 8 && rawB.anxiety >= 8) {
    parts.push(`你在${MODULE_WORD[a]}与${MODULE_WORD[b]}都容易被焦虑底色搅动。`);
  }
  if (rawA.guessing >= 6 && rawB.guessing >= 6) {
    parts.push("两个场域里，「解读他者」都占了不少心理带宽。");
  }
  if (rawA.catastrophizing >= 6 && rawB.catastrophizing >= 6) {
    parts.push("灾难化想象在两个主题里交替出现，值得并观。");
  }
  if (rawA.selfBlame >= 8 && rawB.selfBlame >= 8) {
    parts.push("自责的倾向在关系与工作/成长叙事里形成呼应。");
  }
  if (rawA.control <= 4 && rawB.control <= 4) {
    parts.push("控制感偏低在两个模块同时出现，可留意这是否共享同一套「无力叙事」。");
  }
  if (parts.length === 0) {
    return `两个模块的情绪轮廓不完全重叠：${MODULE_WORD[a]}焦虑相关强度约 ${rawA.anxiety}，${MODULE_WORD[b]}约 ${rawB.anxiety}（原始累加，非百分百）。可作对照，不必急于合一解释。`;
  }
  return parts.join("");
}

export function crossObsessionDiff(
  obsessionA: string,
  obsessionB: string,
  la: QuickModuleId,
  lb: QuickModuleId
): string {
  const short = (s: string) => s.replace(/^可能的执着轴心落在：|。$/g, "").slice(0, 80);
  return `${MODULE_SHORT[la]}侧：${short(obsessionA)}。${MODULE_SHORT[lb]}侧：${short(obsessionB)}。二者并列时，可看是否一条指向外求解释，一条指向内归因。`;
}

export function answersSummaryForApi(
  module: QuickModuleId,
  questions: QaQuestion[],
  answers: QaAnswers,
  philosophy: PhilosophyKey
): string {
  const lines: string[] = [];
  lines.push(`模块：${MODULE_SHORT[module]}`);
  lines.push(`哲学取向：${philosophy}`);
  let ci = 0;
  for (const q of questions) {
    if (q.kind === "choice") {
      const idx = answers.choices[ci];
      ci++;
      const label = idx != null && q.options[idx] ? q.options[idx].label : "未答";
      lines.push(`Q：${q.text} → ${label}`);
    } else {
      lines.push(`Q：${q.text} → ${answers.openText?.trim() || "（跳过/未填）"}`);
    }
  }
  lines.push(`情绪快照（规则）：${emotionSnapshot(questions, answers.choices)}`);
  lines.push(`执着点（规则）：${obsessionPoint(questions, answers.choices)}`);
  return lines.join("\n");
}

export function crossSummaryForApi(
  a: QuickModuleId,
  b: QuickModuleId,
  sumA: string,
  sumB: string,
  emotionSim: string,
  obsessionDiff: string,
  philosophy: PhilosophyKey
): string {
  return [
    `哲学取向：${philosophy}`,
    "---模块A---",
    sumA,
    "---模块B---",
    sumB,
    "---交叉（规则）---",
    `情绪相似性：${emotionSim}`,
    `执着差异：${obsessionDiff}`,
    "请仅输出一句开放式反思提问（中文），不要解释。",
  ].join("\n");
}
