"use client";

import type { RadarDimensionKey } from "@/lib/quick-awareness/types";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const ROWS: { key: RadarDimensionKey; label: string }[] = [
  { key: "anxiety", label: "焦虑" },
  { key: "selfBlame", label: "自责" },
  { key: "guessing", label: "猜测" },
  { key: "catastrophizing", label: "灾难化" },
  { key: "control", label: "控制感" },
];

type Norm = Record<RadarDimensionKey, number>;

export function QuickCompareRadar({
  normA,
  normB,
  labelA,
  labelB,
}: {
  normA: Norm;
  normB: Norm;
  labelA: string;
  labelB: string;
}) {
  const data = ROWS.map(({ key, label }) => ({
    subject: label,
    a: normA[key],
    b: normB[key],
  }));

  return (
    <div className="h-[280px] w-full text-xs text-[var(--muted)]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--muted)" }} />
          <Radar
            name={labelA}
            dataKey="a"
            stroke="#757575"
            fill="#757575"
            fillOpacity={0.08}
          />
          <Radar
            name={labelB}
            dataKey="b"
            stroke="#3a3a3a"
            fill="#3a3a3a"
            fillOpacity={0.1}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "var(--muted)" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
