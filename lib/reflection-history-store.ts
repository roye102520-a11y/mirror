/**
 * 内省可视化用：按日聚合的示意/占位数据（可后续接 localStorage 真实书写记录）。
 */

export type DailyReflectionStat = {
  date: string;
  count: number;
  /** 与 MoodHeatmapCalendar 一致用中文标签；无记录为空串 */
  mood: string;
  avgDepth: number | null;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 生成最近 `dayCount` 天的占位日统计（多数为零，便于展示空态） */
export function buildDailyReflectionStats(dayCount: number): DailyReflectionStat[] {
  const out: DailyReflectionStat[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const moods = ["平静", "焦虑", "委屈", "温暖", "疲惫", "压抑"] as const;

  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const seed = (d.getFullYear() * 100 + d.getMonth() * 31 + d.getDate()) % 11;
    const count = seed === 3 || seed === 7 ? 1 : seed === 9 ? 2 : 0;
    const mood = count > 0 ? moods[seed % moods.length]! : "";
    const avgDepth = count > 0 ? 3 + (seed % 7) + 0.5 * (seed % 3) : null;
    out.push({
      date: isoDate(d),
      count,
      mood,
      avgDepth,
    });
  }
  return out;
}
