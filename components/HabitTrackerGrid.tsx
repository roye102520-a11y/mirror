"use client";

import { useId, useMemo, useState } from "react";

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** 周一开始：周一=0 … 周日=6 */
function mondayIndex(d: Date): number {
  const wd = d.getDay();
  return wd === 0 ? 6 : wd - 1;
}

type HoverState = {
  date: string;
  statusLine: string;
  summary?: string;
  clientX: number;
  clientY: number;
};

export type HabitTrackerGridProps = {
  year: number;
  month: number;
  /** YYYY-MM-DD → 当天是否完成至少一次反思 */
  habitData: Record<string, boolean>;
  /** 可选：YYYY-MM-DD → 当天一句简要总结（用于悬浮） */
  summaries?: Record<string, string>;
  className?: string;
  weekStartsOn?: "monday" | "sunday";
};

export function HabitTrackerGrid({
  year,
  month,
  habitData,
  summaries = {},
  className = "",
  weekStartsOn = "monday",
}: HabitTrackerGridProps) {
  const titleId = useId();
  const [hover, setHover] = useState<HoverState | null>(null);

  const { weeks, monthLabel } = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const dim = new Date(year, month, 0).getDate();
    const label = `${year}年${month}月`;

    let leading = mondayIndex(first);
    if (weekStartsOn === "sunday") {
      leading = first.getDay();
    }

    const cells: ({ kind: "blank" } | { kind: "day"; ymd: string })[] = [];
    for (let i = 0; i < leading; i++) cells.push({ kind: "blank" });
    for (let d = 1; d <= dim; d++) {
      const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
      cells.push({ kind: "day", ymd });
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
      <div className="rounded-sm bg-[#fafafa] p-3" style={{ border: "1px solid #e0e0e0" }}>
        <div className="grid grid-cols-7 gap-y-1" style={{ columnGap: "6px" }}>
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
            <div key={wi} className="grid grid-cols-7" style={{ columnGap: "6px", gap: "6px" }}>
              {row.map((cell, ci) => {
                if (cell.kind === "blank") {
                  return (
                    <div
                      key={`b-${wi}-${ci}`}
                      className="flex aspect-square min-h-[28px] items-center justify-center"
                    />
                  );
                }
                const done = habitData[cell.ymd] === true;
                const summaryText = summaries[cell.ymd]?.trim();
                const statusLine = done ? "已完成反思" : "未完成";
                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    title={
                      summaryText
                        ? `${cell.ymd} · ${statusLine} · ${summaryText}`
                        : `${cell.ymd} · ${statusLine}`
                    }
                    className="flex aspect-square min-h-[28px] min-w-0 items-center justify-center rounded-[2px] outline-none focus-visible:ring-1 focus-visible:ring-[#bbb]"
                    style={{ border: "1px solid #d4d4d4", background: "#fff" }}
                    onMouseEnter={(e) =>
                      setHover({
                        date: cell.ymd,
                        statusLine,
                        summary: summaryText,
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
                        statusLine,
                        summary: summaryText,
                        clientX: e.clientX,
                        clientY: e.clientY,
                      })
                    }
                  >
                    <span
                      className="text-[15px] leading-none text-[#222]"
                      style={{ fontFamily: 'ui-serif, Georgia, "Songti SC", "SimSun", serif' }}
                      aria-hidden
                    >
                      {done ? "●" : "○"}
                    </span>
                    <span className="sr-only">
                      {cell.ymd}，{statusLine}
                      {summaryText ? `，${summaryText}` : ""}
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
          className="pointer-events-none fixed z-[100] max-w-[min(280px,85vw)] rounded border border-[#d0d0d0] bg-white px-2.5 py-2 text-[12px] text-[#333] shadow-none"
          style={{ left: hover.clientX + 12, top: hover.clientY + 12 }}
        >
          <p className="tabular-nums text-[#1a1a1a]">{hover.date}</p>
          <p className="mt-1 text-[#444]">{hover.statusLine}</p>
          {hover.summary ? (
            <p className="mt-1 break-words text-[#555]">{hover.summary}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** 当前年月的示意打卡数据（●/○），与习惯网格同月对齐 */
export function buildDemoHabitForMonth(year: number, month: number): Record<string, boolean> {
  const dim = new Date(year, month, 0).getDate();
  const o: Record<string, boolean> = {};
  for (let d = 1; d <= dim; d++) {
    const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
    o[ymd] = (d + year + month) % 3 !== 0;
  }
  return o;
}

const DEMO_SUMMARY_LINES = ["记下此刻身体感受。", "没有急着争对错。", "允许自己慢一点。"];

export function buildDemoHabitSummaries(year: number, month: number): Record<string, string> {
  const dim = new Date(year, month, 0).getDate();
  const o: Record<string, string> = {};
  let si = 0;
  for (let d = 1; d <= dim; d++) {
    if (d % 5 !== 1) continue;
    const ymd = `${year}-${pad2(month)}-${pad2(d)}`;
    o[ymd] = DEMO_SUMMARY_LINES[si % DEMO_SUMMARY_LINES.length]!;
    si++;
  }
  return o;
}

export const EXAMPLE_HABIT_DATA: Record<string, boolean> = {
  "2024-05-01": true,
  "2024-05-02": false,
  "2024-05-03": true,
  "2024-05-04": true,
  "2024-05-05": false,
  "2024-05-06": true,
  "2024-05-07": true,
  "2024-05-08": true,
  "2024-05-09": false,
  "2024-05-10": true,
  "2024-05-12": true,
  "2024-05-15": false,
  "2024-05-18": true,
};

export const EXAMPLE_HABIT_SUMMARIES: Record<string, string> = {
  "2024-05-01": "写下三件小事，情绪略缓。",
  "2024-05-03": "注意到「应该」又出现了。",
  "2024-05-04": "只做五分钟的呼吸记录。",
  "2024-05-06": "和身体感受待在一起。",
  "2024-05-07": "很短，也算数。",
  "2024-05-08": "把委屈说出来了。",
  "2024-05-10": "停在对错之前。",
  "2024-05-12": "没有结论也可以。",
  "2024-05-18": "允许自己慢一点。",
};
