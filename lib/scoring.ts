import { INTERNET_ARCHETYPE_COPY, INTERNET_QUESTIONS } from "./internet-questions";
import { MAIN_QUESTIONS } from "./main-questions";
import type { InternetArchetypeKey } from "./quiz-types";

export type AttachmentType = "安全型" | "焦虑型" | "回避型" | "混乱型";

export type SocialRoleType = "领导者" | "连接者" | "观察者" | "竞争者";

export type CareerStructureType =
  | "稳定职业型"
  | "资源整合型"
  | "创业探索型"
  | "组织依附型";

/** answers[i] = 第 i 题的选项下标；-1 表示未答 */
export function radarScores(answers: number[]): number[] {
  const sums = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < MAIN_QUESTIONS.length; i++) {
    const q = MAIN_QUESTIONS[i];
    const oi = answers[i];
    if (oi < 0 || !q.options[oi]) continue;
    sums[q.dim] += q.options[oi].pts;
  }
  return sums.map((s) => Math.round((s / 50) * 100));
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** 关系风险四轴 0–100，分数越高表示该风险越显著 */
export function relationRisks(answers: number[]): {
  conflict: number;
  avoidance: number;
  dependency: number;
  control: number;
} {
  let conflictPts = 0;
  conflictPts += answers[11] === 3 ? 3 : answers[11] === 4 ? 2 : 0;
  conflictPts += answers[32] === 3 ? 3 : answers[32] === 2 ? 2 : 0;
  conflictPts += answers[25] === 3 ? 3 : answers[25] === 1 ? 2 : 0;
  conflictPts += answers[11] === 0 ? 0 : 0;
  conflictPts += [33, 34, 35].reduce((acc, qi) => acc + (answers[qi] <= 1 ? 1 : 0), 0);

  let avoidPts = 0;
  avoidPts += [1, 4].includes(answers[11]) ? 2 : 0;
  avoidPts += answers[11] === 4 ? 2 : 0;
  avoidPts += answers[20] === 4 ? 2 : 0;
  avoidPts += answers[23] === 3 ? 2 : 0;
  avoidPts += answers[25] === 1 ? 1 : 0;
  avoidPts += answers[30] === 1 ? 1 : 0;

  let depPts = 0;
  depPts += answers[6] === 3 ? 2 : 0;
  depPts += [0, 1].includes(answers[12]) ? 3 : answers[12] === 2 ? 1 : 0;
  depPts += answers[13] <= 1 ? 2 : 0;
  depPts += answers[16] === 0 ? 2 : 0;
  depPts += answers[17] === 0 ? 2 : answers[17] === 1 ? 1 : 0;

  let controlPts = 0;
  controlPts += [0, 4].includes(answers[40]) ? 2 : 0;
  controlPts += [2, 3].includes(answers[45]) ? 2 : 0;
  controlPts += answers[44] === 0 ? 1 : 0;
  controlPts += answers[41] === 0 ? 1 : 0;

  const scale = (x: number, max: number) => clamp(Math.round((x / max) * 100), 0, 100);

  return {
    conflict: scale(conflictPts, 12),
    avoidance: scale(avoidPts, 10),
    dependency: scale(depPts, 11),
    control: scale(controlPts, 7),
  };
}

/** 关系风险四轴中相对最突出的一维；用于「关系循环」叙事 */
export type DominantRelationRisk =
  | "conflict"
  | "avoidance"
  | "dependency"
  | "control"
  | "balanced";

export function dominantRelationRisk(risks: {
  conflict: number;
  avoidance: number;
  dependency: number;
  control: number;
}): DominantRelationRisk {
  const max = Math.max(risks.conflict, risks.avoidance, risks.dependency, risks.control);
  if (max < 38) return "balanced";
  if (risks.conflict === max) return "conflict";
  if (risks.avoidance === max) return "avoidance";
  if (risks.dependency === max) return "dependency";
  return "control";
}

export function attachmentStyle(answers: number[]): AttachmentType {
  let anxiety = 0;
  const ai = (q: number, w: number[]) => {
    const o = answers[q];
    if (o >= 0 && w[o] != null) anxiety += w[o];
  };
  ai(12, [4, 3, 1, 0]);
  ai(13, [4, 2, 1, 0]);
  ai(17, [3, 1, 0, 1]);
  ai(19, [4, 2, 1, 0]);

  let avoidance = 0;
  const av = (q: number, w: number[]) => {
    const o = answers[q];
    if (o >= 0 && w[o] != null) avoidance += w[o];
  };
  av(11, [0, 3, 1, 4, 3]);
  av(14, [0, 3, 0, 0, 1]);

  const a = anxiety;
  const v = avoidance;
  if (a >= 9 && v >= 6) return "混乱型";
  if (a - v >= 3) return "焦虑型";
  if (v - a >= 3) return "回避型";
  return "安全型";
}

export function socialRole(answers: number[]): SocialRoleType {
  let L = 0,
    C = 0,
    O = 0,
    R = 0;
  const add = (q: number, mat: [number, number, number, number][]) => {
    const i = answers[q];
    if (i < 0 || !mat[i]) return;
    L += mat[i][0];
    C += mat[i][1];
    O += mat[i][2];
    R += mat[i][3];
  };

  add(20, [
    [3, 0, 0, 2],
    [0, 3, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 3],
    [0, 1, 2, 0],
  ]);
  add(21, [
    [2, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 2, 0],
    [0, 0, 3, 0],
  ]);
  add(23, [
    [3, 1, 0, 1],
    [1, 2, 1, 0],
    [0, 1, 3, 0],
    [0, 0, 2, 0],
  ]);
  add(28, [
    [2, 0, 0, 1],
    [1, 2, 1, 0],
    [0, 1, 2, 0],
    [0, 0, 3, 0],
  ]);

  const scores: [SocialRoleType, number][] = [
    ["领导者", L],
    ["连接者", C],
    ["观察者", O],
    ["竞争者", R],
  ];
  scores.sort((x, y) => y[1] - x[1]);
  return scores[0][1] === 0 ? "观察者" : scores[0][0];
}

export function careerStructure(answers: number[]): CareerStructureType {
  let stable = 0,
    integrate = 0,
    explore = 0,
    attach = 0;
  const row = (q: number, w: [number, number, number, number][]) => {
    const i = answers[q];
    if (i < 0) return;
    const v = w[i];
    if (!v) return;
    stable += v[0];
    integrate += v[1];
    explore += v[2];
    attach += v[3];
  };

  row(40, [
    [1, 1, 1, 2],
    [0, 2, 1, 0],
    [0, 1, 2, 1],
    [0, 1, 0, 2],
    [1, 0, 0, 2],
  ]);
  row(41, [
    [3, 1, 1, 1],
    [0, 3, 1, 0],
    [0, 1, 3, 0],
    [0, 1, 3, 1],
    [2, 1, 0, 0],
  ]);
  row(42, [
    [0, 1, 2, 0],
    [2, 1, 0, 0],
    [0, 0, 1, 2],
    [1, 2, 0, 0],
    [0, 2, 0, 1],
  ]);
  row(48, [
    [1, 0, 1, 1],
    [0, 2, 0, 0],
    [1, 1, 2, 0],
    [3, 0, 0, 2],
  ]);
  row(49, [
    [1, 0, 0, 2],
    [0, 2, 0, 0],
    [0, 1, 3, 0],
    [3, 0, 0, 1],
    [0, 1, 1, 0],
  ]);

  const res: [CareerStructureType, number][] = [
    ["稳定职业型", stable],
    ["资源整合型", integrate],
    ["创业探索型", explore],
    ["组织依附型", attach],
  ];
  res.sort((a, b) => b[1] - a[1]);
  return res[0][0];
}

const ARCH_KEYS: InternetArchetypeKey[] = [
  "observer",
  "expressive",
  "maintainer",
  "anonymous",
  "emotional",
  "rational",
];

export function internetArchetype(internetAnswers: number[] | null): {
  key: InternetArchetypeKey | null;
  title: string;
  lines: string[];
} {
  if (!internetAnswers || internetAnswers.length !== INTERNET_QUESTIONS.length) {
    return { key: null, title: "", lines: ["未选择此项观察。"] };
  }

  const acc: Record<InternetArchetypeKey, number> = {
    observer: 0,
    expressive: 0,
    maintainer: 0,
    anonymous: 0,
    emotional: 0,
    rational: 0,
  };

  for (let i = 0; i < INTERNET_QUESTIONS.length; i++) {
    const oi = internetAnswers[i];
    const q = INTERNET_QUESTIONS[i];
    const opt = q.options[oi];
    if (!opt?.archetypeWeights) continue;
    for (const k of ARCH_KEYS) {
      acc[k] += opt.archetypeWeights[k] ?? 0;
    }
  }

  let best: InternetArchetypeKey = "observer";
  let bestV = -1;
  for (const k of ARCH_KEYS) {
    if (acc[k] > bestV) {
      bestV = acc[k];
      best = k;
    }
  }

  const copy = INTERNET_ARCHETYPE_COPY[best];
  const oneLine = `${copy.title}：${copy.body}`.replace(/\s+/g, " ").trim();
  return {
    key: best,
    title: copy.title,
    lines: [oneLine],
  };
}

/** 供名言 API 的简短摘要（不含具体选项文本，仅结构） */
export function summaryForQuote(answers: number[], narrative?: string): string {
  const r = radarScores(answers);
  const risks = relationRisks(answers);
  const parts = [
    `雷达六轴(0-100)：${r.join("，")}`,
    `风险：冲突${risks.conflict} 回避${risks.avoidance} 依赖${risks.dependency} 控制${risks.control}`,
    `依恋${attachmentStyle(answers)} 社交角色${socialRole(answers)} 职业${careerStructure(answers)}`,
  ];
  if (narrative?.trim()) parts.push(`叙述摘要：${narrative.trim().slice(0, 200)}`);
  return parts.join("。");
}

/** 供扫描页哲学短析 API：量表摘要 + 三道开放题原文 */
export function bundleForScanPhilosophyAnalysis(
  answers: number[],
  openTexts: string[],
  narrative?: string
): string {
  const base = summaryForQuote(answers, narrative);
  const lines = (openTexts.length ? openTexts : ["", "", ""]).slice(0, 3);
  while (lines.length < 3) lines.push("");
  const open = lines
    .map((t, i) => `开放作答${i + 1}：${(t || "").trim() || "（未填写）"}`.slice(0, 600))
    .join("\n");
  return `${base}\n${open}`;
}
