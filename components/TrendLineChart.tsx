"use client";

import type { MouseEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type TrendLinePoint = {
  /** YYYY-MM-DD 或任意展示用日期文案 */
  date: string;
  value: number;
};

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYmdLocal(ymd: string): Date {
  const [y, m, day] = ymd.split("-").map((s) => Number(s));
  const d = new Date();
  d.setFullYear(y ?? 1970, (m ?? 1) - 1, day ?? 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

function isPointArray(data: number[] | TrendLinePoint[]): data is TrendLinePoint[] {
  if (data.length === 0) return false;
  const x = data[0];
  return typeof x === "object" && x !== null && "value" in x;
}

/** 将纯数值数组转为带点日期的序列（便于悬浮展示） */
export function trendPointsFromValues(
  values: number[],
  opts?: { dates?: string[]; firstDate?: string }
): TrendLinePoint[] {
  if (values.length === 0) return [];
  const dates = opts?.dates;
  if (dates && dates.length >= values.length) {
    return values.map((value, i) => ({
      value,
      date: dates[i]!.trim() || `记录 ${i + 1}`,
    }));
  }
  const first = opts?.firstDate?.trim();
  const start = first ? parseYmdLocal(first) : addDays(new Date(), -(values.length - 1));
  return values.map((value, i) => ({
    value,
    date: toYmd(addDays(start, i)),
  }));
}

type LayoutPt = { x: number; y: number; value: number; date: string };

const LINE_WIDTH = 2;
const POINT_R = 4;
const HIT_R = 10;
const PAD = { l: 16, r: 16, t: 16, b: 20 };

export function TrendLineChart({
  data,
  dates,
  firstDate,
  yMin = 1,
  yMax = 10,
  height = 200,
  className = "",
}: {
  data: number[] | TrendLinePoint[];
  dates?: string[];
  firstDate?: string;
  yMin?: number;
  yMax?: number;
  height?: number;
  className?: string;
}) {
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<LayoutPt[]>([]);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<{ value: number; date: string; clientX: number; clientY: number } | null>(
    null
  );

  const points = useMemo(() => {
    if (data.length === 0) return [];
    if (isPointArray(data)) {
      return data.map((p) => ({
        value: Number(p.value),
        date: (p.date ?? "").trim() || "—",
      }));
    }
    return trendPointsFromValues(data as number[], { dates, firstDate });
  }, [data, dates, firstDate]);

  const yDomain = useMemo(() => {
    if (points.length === 0) return { lo: yMin, hi: yMax };
    const vals = points.map((p) => p.value);
    const lo = Math.min(yMin, ...vals);
    const hi = Math.max(yMax, ...vals);
    if (lo === hi) return { lo: lo - 0.5, hi: hi + 0.5 };
    return { lo, hi };
  }, [points, yMin, yMax]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || points.length === 0) {
      layoutRef.current = [];
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, c.width, c.height);
      }
      return;
    }

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const w = Math.max(1, Math.floor(wrap.clientWidth * dpr));
    const h = Math.max(1, Math.floor(height * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${wrap.clientWidth}px`;
    canvas.style.height = `${height}px`;

    const pl = PAD.l * dpr;
    const pr = PAD.r * dpr;
    const pt = PAD.t * dpr;
    const pb = PAD.b * dpr;
    const iw = w - pl - pr;
    const ih = h - pt - pb;
    const n = points.length;
    const xAt = (i: number) => {
      if (n <= 1) return pl + iw / 2;
      return pl + (iw * i) / (n - 1);
    };
    const yAt = (v: number) => {
      const t = (v - yDomain.lo) / (yDomain.hi - yDomain.lo);
      return pt + ih * (1 - t);
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const lay: LayoutPt[] = points.map((p, i) => ({
      x: xAt(i),
      y: yAt(p.value),
      value: p.value,
      date: p.date,
    }));
    layoutRef.current = lay.map((p) => ({
      ...p,
      x: p.x / dpr,
      y: p.y / dpr,
    }));

    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    lay.forEach((p, i) => {
      const x = p.x / dpr;
      const y = p.y / dpr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    for (const p of lay) {
      const x = p.x / dpr;
      const y = p.y / dpr;
      ctx.beginPath();
      ctx.arc(x, y, POINT_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [height, points, yDomain.hi, yDomain.lo]);

  useLayoutEffect(() => {
    draw();
  }, [draw, width, height]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth || 320));
    ro.observe(el);
    setWidth(el.clientWidth || 320);
    return () => ro.disconnect();
  }, []);

  const onPointerMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const lay = layoutRef.current;
      if (lay.length === 0) {
        setHover(null);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best: LayoutPt | null = null;
      let bestD = Infinity;
      for (const p of lay) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 <= HIT_R * HIT_R && d2 < bestD) {
          bestD = d2;
          best = p;
        }
      }
      if (best) {
        setHover({
          value: best.value,
          date: best.date,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      } else {
        setHover(null);
      }
    },
    []
  );

  const onPointerLeave = useCallback(() => setHover(null), []);

  if (points.length === 0) {
    return (
      <div
        className={`inline-block min-w-[200px] font-sans text-[13px] text-[#666] ${className}`}
        role="img"
        aria-labelledby={titleId}
      >
        <p id={titleId} className="sr-only">
          趋势线：暂无数据
        </p>
        <p className="text-[12px]">暂无数据</p>
      </div>
    );
  }

  return (
    <div
      className={`inline-block w-full max-w-full font-sans text-[13px] text-[#333] ${className}`}
      role="region"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        趋势线图，{points.length} 个数据点，数值范围约 {Math.round(yDomain.lo * 10) / 10} 到{" "}
        {Math.round(yDomain.hi * 10) / 10}
      </p>
      <div ref={wrapRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          style={{ height }}
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerLeave}
          aria-hidden
        />
      </div>

      {hover ? (
        <div
          className="pointer-events-none fixed z-[100] rounded border border-[#d0d0d0] bg-white px-2.5 py-2 text-[12px] text-[#333] shadow-none"
          style={{ left: hover.clientX + 12, top: hover.clientY + 12 }}
        >
          <p className="tabular-nums text-[#1a1a1a]">{hover.date}</p>
          <p className="mt-1 font-medium text-[#111]">{hover.value}</p>
        </div>
      ) : null}
    </div>
  );
}

/** 与说明文档一致的数值示例；默认按天从今天往前填满日期 */
export const EXAMPLE_TREND_VALUES = [5, 4, 6, 3, 4, 5, 4];

export function buildDemoTrendPoints(): TrendLinePoint[] {
  return trendPointsFromValues(EXAMPLE_TREND_VALUES);
}
