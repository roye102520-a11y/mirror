"use client";

import { radarLabelsForDisplay, radarValuesForDisplay } from "@/lib/quiz-types";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export function ResultRadar({ values }: { values: number[] }) {
  const labels = radarLabelsForDisplay();
  const scores = radarValuesForDisplay(values);
  const data = labels.map((subject, i) => ({
    subject,
    score: scores[i] ?? 0,
  }));

  return (
    <div className="h-64 w-full max-w-md mx-auto text-xs text-[var(--muted)]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Radar
            name="score"
            dataKey="score"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.12}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
