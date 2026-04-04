/**
 * 从用户反思文本数组中统计词频，供个人词云使用。
 * 分词：优先 Intl.Segmenter（中文词语边界）；否则中英启发式切分。
 * 过滤：常见停用词（结构词为主，保留如「应该」「害怕」等内容词）。
 */

export type WordCloudFrequencyItem = {
  word: string;
  count: number;
};

/** 常见中文停用词 + 少量英文功能词（可按产品需要再调） */
const STOP_WORDS = new Set(
  [
    "的",
    "了",
    "是",
    "我",
    "你",
    "地",
    "得",
    "着",
    "过",
    "啊",
    "吗",
    "吧",
    "呢",
    "呀",
    "嗯",
    "哦",
    "哈",
    "呃",
    "唉",
    "哎",
    "他",
    "她",
    "它",
    "我们",
    "你们",
    "他们",
    "她们",
    "它们",
    "自己",
    "人家",
    "大家",
    "这里",
    "那里",
    "什么",
    "这样",
    "那样",
    "这么",
    "那么",
    "在",
    "有",
    "和",
    "与",
    "及",
    "或",
    "但",
    "而",
    "且",
    "就",
    "也",
    "都",
    "还",
    "又",
    "很",
    "太",
    "最",
    "更",
    "挺",
    "不",
    "没",
    "无",
    "未",
    "别",
    "会",
    "能",
    "要",
    "想",
    "去",
    "来",
    "上",
    "下",
    "里",
    "中",
    "内",
    "外",
    "这",
    "那",
    "哪",
    "其",
    "之",
    "为",
    "以",
    "于",
    "从",
    "对",
    "把",
    "被",
    "让",
    "向",
    "到",
    "给",
    "将",
    "所",
    "若",
    "即",
    "则",
    "虽",
    "因为",
    "所以",
    "如果",
    "但是",
    "然而",
    "而且",
    "以及",
    "不过",
    "一个",
    "一些",
    "一种",
    "一样",
    "一直",
    "一切",
    "现在",
    "当时",
    "今天",
    "明天",
    "昨天",
    "每天",
    "说",
    "看",
    "做",
    "用",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "to",
    "of",
    "and",
    "or",
    "in",
    "on",
    "at",
    "for",
    "with",
    "as",
    "by",
    "from",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "we",
    "you",
    "he",
    "she",
    "they",
    "them",
    "our",
    "your",
    "their",
    "not",
    "no",
    "do",
    "does",
    "did",
    "so",
    "if",
    "but",
    "than",
    "then",
  ].map((s) => s.toLowerCase())
);

function normalizeWord(raw: string): string {
  const t = raw.trim().replace(/\s+/g, "");
  if (!t) return "";
  if (/^[a-zA-Z]+$/.test(t)) return t.toLowerCase();
  return t;
}

function isStopWord(w: string): boolean {
  if (!w) return true;
  const lower = w.toLowerCase();
  if (STOP_WORDS.has(w) || STOP_WORDS.has(lower)) return true;
  if (/^[\p{P}\p{S}]+$/u.test(w)) return true;
  return false;
}

function tokenizeParagraph(text: string): string[] {
  const out: string[] = [];
  const normalized = text.replace(/\r\n/g, "\n");

  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    try {
      const segmenter = new Intl.Segmenter("zh-Hans-CN", { granularity: "word" });
      for (const { segment, isWordLike } of segmenter.segment(normalized)) {
        if (!isWordLike) continue;
        const w = normalizeWord(segment);
        if (w) out.push(w);
      }
      return out;
    } catch {
      /* fallback */
    }
  }

  const re = /[\u4e00-\u9fff]{1,}|[a-zA-Z]{2,}|\d+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized))) {
    const w = normalizeWord(m[0]!);
    if (w) out.push(w);
  }
  return out;
}

/** 合并大小写拉丁词；中日韩以原词为键 */
function mergeKey(surface: string): string {
  if (/^[\u4e00-\u9fff]/.test(surface)) return surface;
  return surface.toLowerCase();
}

function shouldSkipToken(tok: string): boolean {
  if (isStopWord(tok)) return true;
  if (tok.length === 1 && /[a-zA-Z]/.test(tok)) return true;
  return false;
}

/**
 * 接收多段反思文本，返回按词频降序排列的词条列表（默认最多 120 条）。
 */
export function generateWordCloud(
  textArray: string[],
  options?: { maxWords?: number }
): WordCloudFrequencyItem[] {
  const maxWords = options?.maxWords ?? 120;
  const counts = new Map<string, number>();
  const label = new Map<string, string>();

  for (const raw of textArray) {
    const block = String(raw ?? "");
    if (!block.trim()) continue;
    for (const tok of tokenizeParagraph(block)) {
      if (shouldSkipToken(tok)) continue;
      const key = mergeKey(tok);
      if (!label.has(key)) label.set(key, tok);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({ word: label.get(key) ?? key, count }))
    .filter((x) => x.count >= 1)
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "zh-Hans-CN"))
    .slice(0, maxWords);
}
