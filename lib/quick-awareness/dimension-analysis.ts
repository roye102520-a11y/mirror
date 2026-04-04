import type { PhilosophyKey, QuickModuleId } from "@/lib/quick-awareness/types";
import { MODULE_LABELS, PHILOSOPHY_LABELS } from "@/lib/quick-awareness/types";

/**
 * 多维觉察分析表：反思 API 的 `analysis_table`、完整扫描六维表等共用结构。
 * （历史别名：`QuickDimensionAnalysis`）
 */
export interface ReflectionAnalysis {
  emotional_state: string;
  thinking_pattern: string;
  core_pain_point: string;
  strengths_resources: string;
  philosophical_suggestion: string;
  next_small_action: string;
}

/** 与 `ReflectionAnalysis` 相同，保留以兼容既有 import */
export type QuickDimensionAnalysis = ReflectionAnalysis;

export const QUICK_DIMENSION_KEYS = [
  "emotional_state",
  "thinking_pattern",
  "core_pain_point",
  "strengths_resources",
  "philosophical_suggestion",
  "next_small_action",
] as const satisfies readonly (keyof QuickDimensionAnalysis)[];

/** 表格左列维度名（与产品规格「维度 / 分析」一致） */
export const QUICK_DIMENSION_ROW_LABELS: Record<keyof QuickDimensionAnalysis, string> = {
  emotional_state: "情绪状态",
  thinking_pattern: "思维模式",
  core_pain_point: "核心痛点",
  strengths_resources: "资源与优势",
  philosophical_suggestion: "哲学视角建议",
  next_small_action: "下一步最小行动",
};

const MAX_CHARS = 30;

function clampCn(s: string, max = MAX_CHARS): string {
  const t = s.trim().replace(/\s+/g, " ");
  const arr = Array.from(t);
  if (arr.length <= max) return t;
  return arr.slice(0, max).join("") + "…";
}

function isNonEmptyRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** 从模型输出中截取第一个成对大括号 JSON 对象（应对首尾多余说明） */
function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * 整段文本 → JSON：先试整段 parse，再成对 `{}`，再 `indexOf('{')..lastIndexOf('}')` 切片（末档，可能误截嵌套，但能救部分模型输出）。
 */
function parseJsonObjectFromModelTextLoose(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    /* continue */
  }
  const balanced = extractBalancedJsonObject(text);
  if (balanced) {
    try {
      return JSON.parse(balanced);
    } catch {
      /* continue */
    }
  }
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
  try {
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch (e) {
    console.error("Report generation failed:", e);
    return null;
  }
}

const DIMENSION_PLACEHOLDER = "材料不足，本维暂略。";

function pickDimensionString(
  raw: Record<string, unknown>,
  key: (typeof QUICK_DIMENSION_KEYS)[number]
): string {
  const cn = QUICK_DIMENSION_ROW_LABELS[key];
  const candidates: unknown[] = [raw[key], raw[cn]];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return clampCn(c.trim());
    if (typeof c === "number" && String(c).trim()) return clampCn(String(c).trim());
  }
  return "";
}

/**
 * 将模型或本地存储中的「半套」六维对象压成规范结构：认英文键与中文维度列名；
 * 缺失或非字符串字段用统一占位句，避免整表因一字段失败而空白。
 * 若六个维度都无任何有效材料则返回 null。
 */
export function coerceQuickDimensionAnalysis(raw: unknown): QuickDimensionAnalysis | null {
  if (!isNonEmptyRecord(raw)) return null;
  let inner: Record<string, unknown> = raw;
  if (
    !QUICK_DIMENSION_KEYS.some((k) => pickDimensionString(raw, k)) &&
    isNonEmptyRecord(raw.analysis_table)
  ) {
    inner = raw.analysis_table as Record<string, unknown>;
  }
  let anyReal = false;
  const out: Partial<QuickDimensionAnalysis> = {};
  for (const key of QUICK_DIMENSION_KEYS) {
    const s = pickDimensionString(inner, key);
    if (s) anyReal = true;
    out[key] = s || DIMENSION_PLACEHOLDER;
  }
  if (!anyReal) return null;
  return out as QuickDimensionAnalysis;
}

/** 校验六维对象字段齐全且均为非空字符串（已规范化的 API / 存储形态） */
export function isQuickDimensionAnalysis(x: unknown): x is QuickDimensionAnalysis {
  if (!isNonEmptyRecord(x)) return false;
  return QUICK_DIMENSION_KEYS.every((key) => {
    const v = x[key];
    return typeof v === "string" && v.trim().length > 0;
  });
}

/** 与 `isQuickDimensionAnalysis` 相同，供反思流语义使用 */
export function isReflectionAnalysis(x: unknown): x is ReflectionAnalysis {
  return isQuickDimensionAnalysis(x);
}

/** 解析模型返回的 JSON 文本，失败返回 null（内部不抛错；末档含 firstBrace..lastBrace 切片） */
export function parseQuickDimensionJson(raw: string): ReflectionAnalysis | null {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  const obj = parseJsonObjectFromModelTextLoose(t);
  return coerceQuickDimensionAnalysis(obj);
}

/** 组装发给维度分析 API 的用户消息 */
export function buildDimensionAnalysisUserMessage(
  module: QuickModuleId,
  philosophy: PhilosophyKey,
  summary: string
): string {
  const head = [
    `所选模块：${MODULE_LABELS[module]}`,
    `哲学流派：${PHILOSOPHY_LABELS[philosophy]}`,
    "",
    "【用户本次填答摘要（选择题轨迹 + 若有则含开放问答）】",
    summary.trim().slice(0, 6000),
  ];
  return head.join("\n") + DIMENSION_USER_MATERIAL_FOOTER;
}

/** 附在用户消息末尾：强制表格紧扣材料、禁止编造 */
export const DIMENSION_USER_MATERIAL_FOOTER = `

【材料铁律】六维每一条必须能从上方摘要中的「Q：…→ 选项」或开放原文归纳；禁止虚构人名、对话、未出现事件。某一维若摘要全无依据，写「材料未涉，略近：」并只能缀摘要里已有词语，勿杜撰。`;

/** 完整扫描 /result 页：摘要来自主问卷 + 开放题 bundle */
export function buildFullScanDimensionUserMessage(
  philosophy: PhilosophyKey,
  summary: string
): string {
  return (
    [
      "语境：完整扫描（主问卷约 60 题 + 三道开放题 + 可选背景叙述的结构化摘要）",
      `哲学流派：${PHILOSOPHY_LABELS[philosophy]}`,
      "",
      "【用户本次填答与开放作答摘要】",
      summary.trim().slice(0, 6000),
    ].join("\n") + DIMENSION_USER_MATERIAL_FOOTER
  );
}

/** mirror 首页自由书写 / 随机一问：无 R-W-G 模块时的六维表用户消息 */
export function buildFreeMirrorDimensionUserMessage(
  philosophy: PhilosophyKey,
  mode: string,
  promptContext: string,
  text: string
): string {
  return [
    "语境：mirror 首页「自由书写」或「随机一问」后的用户正文（非关系/工作/成长模块化问卷）。",
    `哲学流派：${PHILOSOPHY_LABELS[philosophy]}`,
    `模式：${mode === "random" ? "随机一问后的书写" : "自由书写"}`,
    promptContext ? `背景/提示：\n${promptContext.slice(0, 2000)}` : "",
    "【用户正文】",
    text.trim().slice(0, 6000),
    "",
    "说明：core_pain_point 只能概括「用户正文」里可见的困扰，勿写正文未现之情节。",
  ]
    .filter(Boolean)
    .join("\n") + DIMENSION_USER_MATERIAL_FOOTER;
}

/** 附在 System Prompt 后，提示模型按「整卷」而非单模块理解 core_pain_point */
export const FULL_SCAN_DIMENSION_PROMPT_APPEND = `

【本次语境补充】输入来自完整量表扫描（非单一「快速觉察」子模块）。core_pain_point 应整合关系、工作/生涯与自我认同等多面向中可见的张力，用一句概括；勿只写关系或只写职场。`;

/** System Prompt：与产品「MirrorTalk / 镜谈」规格一致，仅返回合法 JSON */
export const QUICK_DIMENSION_SYSTEM_PROMPT = `你是「镜谈 MirrorTalk」分析引擎（MirrorTalk Analysis Engine）。根据用户消息中的填答摘要（必选选择题轨迹 + 若有则含开放问答），**只输出一个合法 JSON 对象**，不要 markdown 代码块、不要任何前缀或后缀、不要注释。

JSON 必须只包含下列键（英文键名不可增删改）：
emotional_state, thinking_pattern, core_pain_point, strengths_resources, philosophical_suggestion, next_small_action

规则：
- 每个键的值必须是**一句**简短中文。
- 每个值**不超过 30 个汉字**（含标点）。
- 不使用心理治疗或临床诊断用语；语气冷静、哲学化、中性。
- philosophical_suggestion 必须**贴合用户消息中标明的哲学流派**（存在主义 / 斯多葛 / 东方等）。
- 内容必须**来自用户本次答案的具体信息**，禁止使用泛泛模板句。
- **严禁编造**：不得加入摘要/正文中未出现的具体事实、他人台词、未见情节；只可转述或归纳已给出的字词与选项。

若用户未填写开放问答，仅依据选择题摘要推断，仍须写得具体、可辨识，且须与选项文字对应。

字段含义：
- emotional_state：主要情绪及强度感。
- thinking_pattern：思维倾向（如猜测他人、自责、灾难化、过度控制、回避等），择最贴合一两点。
- core_pain_point：在当前所选觉察模块（关系 / 工作 / 自我成长）下，最核心的困扰一句。
- strengths_resources：答案中可见的资源或长处。
- philosophical_suggestion：一句可操作的观照或思考方向。
- next_small_action：**24 小时内**能完成的一件很小的具体行动。`;
