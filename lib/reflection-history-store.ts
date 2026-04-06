import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";

const REFLECTION_HISTORY_KEY = "mirror-reflection-history-v1";
const MAX_HISTORY = 180;

export type ReflectionHistoryRecord = {
  id: string;
  createdAt: string;
  narrative: string;
  openAnswers: string[];
  emotionTag: string;
  depthScore: number;
};

export type DailyReflectionStats = {
  date: string;
  count: number;
  mood: string;
  avgDepth: number | null;
};

const NEGATIVE_EMOTION_KEYWORDS = ["焦虑", "害怕", "恐惧", "委屈", "难过", "愤怒", "压抑", "痛苦", "烦躁"];
const POSITIVE_EMOTION_KEYWORDS = ["平静", "释然", "温暖", "安心", "希望", "接纳", "理解", "成长", "感激"];
const REFLECTION_DEPTH_KEYWORDS = ["因为", "所以", "如果", "但是", "我发现", "我意识到", "也许", "为什么"];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeParse(raw: string | null): ReflectionHistoryRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReflectionHistoryRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.createdAt === "string" &&
        typeof x.narrative === "string" &&
        Array.isArray(x.openAnswers) &&
        typeof x.emotionTag === "string" &&
        typeof x.depthScore === "number"
    );
  } catch {
    return [];
  }
}

function inferEmotionTag(text: string): string {
  const t = text.trim();
  if (!t) return "平静";
  let pos = 0;
  let neg = 0;
  for (const k of POSITIVE_EMOTION_KEYWORDS) {
    if (t.includes(k)) pos += 1;
  }
  for (const k of NEGATIVE_EMOTION_KEYWORDS) {
    if (t.includes(k)) neg += 1;
  }
  if (neg > pos + 1) return "焦虑";
  if (pos > neg + 1) return "平静";
  if (neg > pos) return "混杂";
  return "平静";
}

function inferDepthScore(text: string): number {
  const normalized = text.replace(/\s+/g, "");
  const lenScore = Math.min(4, Math.floor(normalized.length / 70));
  const kwScore = REFLECTION_DEPTH_KEYWORDS.reduce(
    (sum, kw) => sum + (normalized.includes(kw) ? 1 : 0),
    0
  );
  return Math.max(1, Math.min(10, 1 + lenScore + kwScore));
}

export function saveReflectionHistoryRecord(input: {
  narrative: string;
  openAnswers: string[];
}): void {
  if (typeof window === "undefined") return;
  const narrative = input.narrative?.trim() ?? "";
  const openAnswers = (input.openAnswers ?? []).map((x) => x?.trim() ?? "").filter(Boolean);
  const mergedText = [narrative, ...openAnswers].join("\n");
  if (!mergedText.trim()) return;

  const nextItem: ReflectionHistoryRecord = {
    id: uid(),
    createdAt: new Date().toISOString(),
    narrative,
    openAnswers,
    emotionTag: inferEmotionTag(mergedText),
    depthScore: inferDepthScore(mergedText),
  };

  const prev = safeParse(localStorage.getItem(REFLECTION_HISTORY_KEY));
  const duplicate = prev.find(
    (x) =>
      x.narrative === nextItem.narrative &&
      x.openAnswers.join("|") === nextItem.openAnswers.join("|") &&
      Math.abs(new Date(x.createdAt).getTime() - new Date(nextItem.createdAt).getTime()) < 5 * 60 * 1000
  );
  if (duplicate) return;

  const next = [nextItem, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(REFLECTION_HISTORY_KEY, JSON.stringify(next));
}

export function listReflectionHistoryRecords(): ReflectionHistoryRecord[] {
  if (typeof window === "undefined") return [];
  const records = safeParse(localStorage.getItem(REFLECTION_HISTORY_KEY));
  return records.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export function buildDailyReflectionStats(dayWindow = 30): DailyReflectionStats[] {
  const records = listReflectionHistoryRecords();
  const today = new Date();
  const start = startOfDay(subDays(today, dayWindow - 1));
  const days = eachDayOfInterval({ start, end: today });
  const map = new Map<string, ReflectionHistoryRecord[]>();

  for (const record of records) {
    const day = format(new Date(record.createdAt), "yyyy-MM-dd");
    const bucket = map.get(day);
    if (bucket) bucket.push(record);
    else map.set(day, [record]);
  }

  return days.map((d) => {
    const date = format(d, "yyyy-MM-dd");
    const bucket = map.get(date) ?? [];
    if (bucket.length === 0) {
      return { date, count: 0, mood: "", avgDepth: null };
    }
    const moodCount = new Map<string, number>();
    let depthSum = 0;
    for (const row of bucket) {
      moodCount.set(row.emotionTag, (moodCount.get(row.emotionTag) ?? 0) + 1);
      depthSum += row.depthScore;
    }
    const mood =
      [...moodCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "";
    return {
      date,
      count: bucket.length,
      mood,
      avgDepth: Number((depthSum / bucket.length).toFixed(2)),
    };
  });
}
