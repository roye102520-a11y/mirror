/**
 * 结果页可视化用：按天聚合的示意统计（可与日后真实 localStorage 流水对接）。
 */

export type DailyReflectionStat = {
  date: string;
  count: number;
  /** 与 MoodHeatmapCalendar 一致的中文标签 */
  mood: string | null;
  avgDepth: number | null;
};

const DEMO_MOODS = ["平静", "焦虑", "委屈", "愤怒", "麻木", "压抑", "自责", "混杂"] as const;

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 生成最近 `days` 天的演示数据（稀疏记录 + 深度曲线） */
export function buildDailyReflectionStats(days: number): DailyReflectionStat[] {
  const out: DailyReflectionStat[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = addDays(today, -i);
    const seed = (i * 13 + 7) % 11;
    const count = seed % 4 === 0 ? 0 : 1 + (seed % 3);
    const mood: string | null =
      count === 0 ? null : DEMO_MOODS[(seed + i) % DEMO_MOODS.length]!;
    const avgDepth =
      count === 0 ? null : Math.round(30 + 45 * Math.sin(i / 5) + (seed % 20));
    out.push({ date: fmt(dt), count, mood, avgDepth });
  }
  return out;
}
