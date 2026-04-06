/**
 * 往期书写摘要（本页对比入口占位；可与问卷/书写流对接后写入 localStorage）。
 */

export type ReflectionHistoryItem = {
  id: string;
  createdAt: string;
  summary: string;
};

const HISTORY_KEY = "philoaophic-reflection-history-v1";

function readAll(): ReflectionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is ReflectionHistoryItem =>
        Boolean(x) &&
        typeof x === "object" &&
        typeof (x as ReflectionHistoryItem).id === "string" &&
        typeof (x as ReflectionHistoryItem).createdAt === "string" &&
        typeof (x as ReflectionHistoryItem).summary === "string"
    );
  } catch {
    return [];
  }
}

export function listReflectionHistory(): ReflectionHistoryItem[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function formatHistoryItemAsCompareText(item: ReflectionHistoryItem): string {
  return `[${item.createdAt}] ${item.summary}`.trim();
}
