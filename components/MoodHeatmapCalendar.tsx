"use client";

import { useId, useMemo, useState } from "react";

export type MoodHeatmapEntry = {
  /** YYYY-MM-DD（与本地日一致） */
  date: string;
  /** 与快速觉察里常见的情绪标签或简写一致即可，如：焦虑、平静、委屈 */
  mood: string;
};

/** 情绪 → 背景灰（仅灰阶；未列出则按轻度哈希落灰） */
const MOOD_BG_EXACT: Record<string, string> = {
  平静: "#ffffff",
  焦虑: "#e0e0e0",
  委屈: "#bdbdbd",
  愤怒: "#d0d0d0",
  麻木: "#c8c8c8",
  温暖: "#f5f5f5",
  压抑: "#d8d8d8",
  自责: "#cccccc",
  混杂: "#ebebeb",
  疏离: "#cfcfcf",
  易怒: "#d4d4d4",
};

function moodBackground(mood: string): string {
  const t = mood.trim();
  if (!t) return "#f2f2f2";
  if (MOOD_BG_EXACT[t]) return MOOD_BG_EXACT[t];
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (Math.imul(31, h) + t.charCodeAt(i)) | 0;
  const shades = ["#e8e8e8", "#dedede", "#d6d6d6", "#ececec", "#e2e2e2"];
  return shades[Math.abs(h) % shades.length];
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 周一开始：周一=0 … 周日=6 */
function mondayIndex(d: Date): number {
  const wd = d.getDay();
  return wd === 0 ? 6 : wd - 1;
}

type HoverState = {
  date: string;
  mood: string;
  clientX: number;
  clientY: number;
};

export function MoodHeatmapCalendar({
  year,
  month,
  data,
  className = "",
  weekStartsOn = "monday",
}: {
  year: number;
  month: number;
  /** 1–12 */
  data: MoodHeatmapEntry[];
  className?: string;
  weekStartsOn?: "monday" | "sunday";
}) {
  const titleId = useId();
  const [hover, setHover] = useState<HoverState | null>(null);

  const moodByDate = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of data) {
      if (row.date) m.set(row.date.trim(), row.mood?.trim() ?? "");
    }
    return m;
  }, [data]);

  const { weeks, monthLabel } = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const dim = new Date(year, month, 0).getDate();
    const label = `${year}年${month}月`;

    let leading = mondayIndex(first);
    if (weekStartsOn === "sunday") {
      leading = first.getDay();
    }

    const cells: ({ kind: "blank" } | { kind: "day"; d: number; ymd: string })[] = [];
    for (let i = 0; i < leading; i++) cells.push({ kind: "blank" });
    for (let d = 1; d <= dim; d++) {
      const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
      cells.push({ kind: "day", d, ymd });
    }
    while (cells.length % 7 !== 0) cells.push({ kind: "blank" });

    const wk: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      wk.push(cells.slice(i, i + 7));
    }
    return { weeks: wk, monthLabel: label };
  }, [year, month, weekStartsOn]);

  const weekdayLabels =
    weekStartsOn === "monday"
      ? ["一", "二", "三", "四", "五", "六", "日"]
      : ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div
      className={`inline-block font-sans text-[13px] text-[#333] ${className}`}
      role="region"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="mb-3 font-normal text-[#1a1a1a]">
        {monthLabel}
      </p>
      <div
        className="rounded-sm bg-[#fafafa] p-3"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <div
          className="grid grid-cols-7 gap-y-1"
          style={{ columnGap: "6px" }}
        >
          {weekdayLabels.map((w) => (
            <div
              key={w}
              className="flex h-6 items-center justify-center text-[11px] text-[#888]"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {weeks.map((row, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7"
              style={{ columnGap: "6px", gap: "6px" }}
            >
              {row.map((cell, ci) => {
                if (cell.kind === "blank") {
                  return (
                    <div
                      key={`b-${wi}-${ci}`}
                      className="aspect-square min-h-[28px] rounded-[2px] bg-transparent"
                    />
                  );
                }
                const mood = moodByDate.get(cell.ymd) ?? "";
                const bg = mood ? moodBackground(mood) : "#f2f2f2";
                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    title={`${cell.ymd}${mood ? ` · ${mood}` : " · 无记录"}`}
                    className="aspect-square min-h-[28px] min-w-0 rounded-[2px] outline-none focus-visible:ring-1 focus-visible:ring-[#bbb]"
                    style={{
                      backgroundColor: bg,
                      border: "1px solid #dcdcdc",
                    }}
                    onMouseEnter={(e) =>
                      setHover({
                        date: cell.ymd,
                        mood: mood || "（无）",
                        clientX: e.clientX,
                        clientY: e.clientY,
                      })
                    }
                    onMouseMove={(e) =>
                      setHover((h) =>
                        h?.date === cell.ymd
                          ? { ...h, clientX: e.clientX, clientY: e.clientY }
                          : h
                      )
                    }
                    onMouseLeave={() => setHover((h) => (h?.date === cell.ymd ? null : h))}
                    onClick={(e) =>
                      setHover({
                        date: cell.ymd,
                        mood: mood || "（无）",
                        clientX: e.clientX,
                        clientY: e.clientY,
                      })
                    }
                  >
                    <span className="sr-only">
                      {cell.ymd}
                      {mood ? `，${mood}` : "，无情绪记录"}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hover ? (
        <div
          className="pointer-events-none fixed z-[100] rounded border border-[#d0d0d0] bg-white px-2.5 py-2 text-[12px] text-[#333] shadow-none"
          style={{ left: hover.clientX + 12, top: hover.clientY + 12 }}
        >
          <p className="tabular-nums text-[#1a1a1a]">{hover.date}</p>
          <p className="mt-1 text-[#555]">{hover.mood}</p>
        </div>
      ) : null}
    </div>
  );
}

/** 构造示例：指定年月内随机稀疏记录（模拟「最近一月」观感） */
export function buildDemoMoodDataForMonth(year: number, month: number): MoodHeatmapEntry[] {
  const moods = ["平静", "焦虑", "委屈", "愤怒", "麻木", "压抑", "自责", "混杂"];
  const dim = new Date(year, month, 0).getDate();
  const out: MoodHeatmapEntry[] = [];
  for (let d = 1; d <= dim; d++) {
    if ((d + year + month) % 4 === 0) continue;
    const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
    const mood = moods[(d * 3 + month) % moods.length]!;
    out.push({ date: ymd, mood });
  }
  return out;
}

/** 截止今天向前约 30 天的模拟数据（写入各自然日） */
export function buildDemoMoodDataLastDays(days = 30): MoodHeatmapEntry[] {
  const moods = ["平静", "焦虑", "委屈", "愤怒", "麻木", "压抑", "自责", "混杂"];
  const out: MoodHeatmapEntry[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (i % 5 === 0) continue;
    out.push({
      date: toYmd(d),
      mood: moods[(i + d.getDate()) % moods.length]!,
    });
  }
  return out;
}

/** 与说明文档一致的静态示例片段（2024年5月；可配合 year={2024} month={5}） */
export const EXAMPLE_MOOD_DATA: MoodHeatmapEntry[] = [
  { date: "2024-05-01", mood: "焦虑" },
  { date: "2024-05-02", mood: "平静" },
  { date: "2024-05-03", mood: "委屈" },
  { date: "2024-05-05", mood: "平静" },
  { date: "2024-05-06", mood: "焦虑" },
  { date: "2024-05-08", mood: "自责" },
  { date: "2024-05-10", mood: "平静" },
  { date: "2024-05-12", mood: "麻木" },
  { date: "2024-05-15", mood: "焦虑" },
  { date: "2024-05-18", mood: "平静" },
  { date: "2024-05-20", mood: "委屈" },
  { date: "2024-05-22", mood: "压抑" },
  { date: "2024-05-25", mood: "平静" },
  { date: "2024-05-28", mood: "混杂" },
];
