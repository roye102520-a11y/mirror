"use client";

import { useCallback, useId, useMemo, useState } from "react";

export type PatternRadarDataset = {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};

export type PatternRadarData = {
  labels: string[];
  datasets: PatternRadarDataset[];
};

const DEFAULT_TIPS: Record<string, string> = {
  猜测他人:
    "「猜测他人」消耗了你很多能量，今天试着把注意力放回自己身上。",
  自我责备:
    "「自我责备」常常盖过真实需要；今天可否先问：我苛责自己时，想护住的是什么？",
  灾难化:
    "「灾难化」会把未来提前钉死；留一条缝：最坏尚未发生，此刻仍可呼吸。",
  过度控制:
    "「过度控制」多源于怕失控；试试看今天只稳稳接住一件小事。",
  回避沟通:
    "「回避沟通」有时是自我保护；若愿意，从一句不必完美的真话开始。",
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function tipForLabel(label: string, index: number, extra?: Record<string, string>): string {
  if (extra?.[label]) return extra[label];
  if (DEFAULT_TIPS[label]) return DEFAULT_TIPS[label];
  return `「${label}」这一维正在牵动你；今天可否花一刻，只观察它而不立刻相信？`;
}

type Pt = { x: number; y: number };

export function PatternRadar({
  data,
  dimensionTips,
  size = 300,
  className = "",
}: {
  data: PatternRadarData;
  /** 与各 label 对应的悬浮提示；未提供的维度使用内置或通用句 */
  dimensionTips?: Record<string, string>;
  size?: number;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const labels = data.labels ?? [];
  const ds0 = data.datasets?.[0];
  const raw = ds0?.data ?? [];
  const n = Math.max(0, labels.length);
  const values = useMemo(
    () => labels.map((_, i) => clamp(Number(raw[i] ?? 0), 0, 100)),
    [labels, raw]
  );

  const fill =
    ds0?.backgroundColor?.trim() || "rgba(100, 100, 100, 0.15)";
  const stroke = ds0?.borderColor?.trim() || "#333333";
  const strokeW = typeof ds0?.borderWidth === "number" ? ds0.borderWidth : 1;

  const pad = 52;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - pad;

  const angles = useMemo(
    () => Array.from({ length: n }, (_, i) => (-Math.PI / 2 + (2 * Math.PI * i) / n) as number),
    [n]
  );

  const axisEnd = useCallback(
    (i: number): Pt => ({
      x: cx + R * Math.cos(angles[i]!),
      y: cy + R * Math.sin(angles[i]!),
    }),
    [cx, cy, R, angles]
  );

  const valuePt = useCallback(
    (i: number): Pt => {
      const t = values[i]! / 100;
      const a = angles[i]!;
      return {
        x: cx + R * t * Math.cos(a),
        y: cy + R * t * Math.sin(a),
      };
    },
    [cx, cy, R, angles, values]
  );

  const polygonPoints = useMemo(() => {
    if (n < 3) return "";
    return values.map((_, i) => {
      const { x, y } = valuePt(i);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }, [n, values, valuePt]);

  const gridLevels = [0.33, 0.66, 1];

  const [hover, setHover] = useState<{
    index: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  if (n < 3) {
    return (
      <div
        className={`font-sans text-sm text-[#666] ${className}`}
        style={{ width: size, height: size }}
      >
        至少需要三个维度才能绘制雷达图。
      </div>
    );
  }

  const hi = hover?.index;
  const hiLabel = hi != null ? labels[hi] : "";
  const hiVal = hi != null ? values[hi] : 0;
  const hiTip = hi != null ? tipForLabel(labels[hi]!, hi, dimensionTips) : "";

  return (
    <div className={`relative inline-block font-sans ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`模式雷达：${ds0?.label ?? "数据"}`}
        className="text-[14px]"
      >
        <defs>
          <clipPath id={`clip-${gid}`}>
            <rect width={size} height={size} />
          </clipPath>
        </defs>
        <g clipPath={`url(#clip-${gid})`}>
          {gridLevels.map((lv) => (
            <polygon
              key={lv}
              fill="none"
              stroke="#e8e8e8"
              strokeWidth={0.75}
              points={angles
                .map((a) => {
                  const x = cx + R * lv * Math.cos(a);
                  const y = cy + R * lv * Math.sin(a);
                  return `${x.toFixed(2)},${y.toFixed(2)}`;
                })
                .join(" ")}
            />
          ))}
          {angles.map((a, i) => {
            const end = axisEnd(i);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#ececec"
                strokeWidth={0.75}
              />
            );
          })}
          <polygon
            points={polygonPoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          {values.map((_, i) => {
            const p = valuePt(i);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={10}
                fill="transparent"
                stroke="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) =>
                  setHover({
                    index: i,
                    clientX: e.clientX,
                    clientY: e.clientY,
                  })
                }
                onMouseMove={(e) =>
                  setHover((h) =>
                    h?.index === i
                      ? { ...h, clientX: e.clientX, clientY: e.clientY }
                      : h
                  )
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          {values.map((_, i) => {
            const p = valuePt(i);
            return (
              <circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={hover?.index === i ? 4 : 2.5}
                fill="#1a1a1a"
                stroke="#fff"
                strokeWidth={hover?.index === i ? 1.2 : 0.8}
                pointerEvents="none"
              />
            );
          })}
          {labels.map((lab, i) => {
            const a = angles[i]!;
            const lr = R + 22;
            const x = cx + lr * Math.cos(a);
            const y = cy + lr * Math.sin(a);
            const anchor =
              Math.cos(a) > 0.25 ? "start" : Math.cos(a) < -0.25 ? "end" : "middle";
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={anchor as "start" | "middle" | "end"}
                dominantBaseline="middle"
                fill="#444"
                fontSize={12}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                style={{ userSelect: "none" }}
              >
                {lab}
              </text>
            );
          })}
        </g>
      </svg>

      {hover != null ? (
        <div
          className="pointer-events-none fixed z-[100] max-w-[min(280px,calc(100vw-24px))] rounded border border-[#d4d4d4] bg-white px-3 py-2.5 text-[13px] leading-snug text-[#333] shadow-none"
          style={{
            left: hover.clientX + 14,
            top: hover.clientY + 14,
          }}
        >
          <p className="font-medium text-[#1a1a1a]">
            {hiLabel} · {hiVal}
          </p>
          <p className="mt-1.5 text-[#555]">{hiTip}</p>
        </div>
      ) : null}
    </div>
  );
}

/** 与需求文档一致的示例数据，可在页面中直接引用 */
export const EXAMPLE_PATTERN_DATA: PatternRadarData = {
  labels: ["猜测他人", "自我责备", "灾难化", "过度控制", "回避沟通"],
  datasets: [
    {
      label: "我的模式强度",
      data: [65, 80, 45, 30, 70],
      backgroundColor: "rgba(100, 100, 100, 0.2)",
      borderColor: "#333333",
      borderWidth: 1,
    },
  ],
};
