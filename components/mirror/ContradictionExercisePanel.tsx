"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { buildContradictionExercise } from "@/lib/contradiction-exercise";
import { useState } from "react";

export function ContradictionExercisePanel({ obsession }: { obsession: string }) {
  const [open, setOpen] = useState(false);
  const { lead, instruction, promptLabel } = buildContradictionExercise(obsession);
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-white p-4 shadow-mirror">
        <p className="text-xs text-[var(--ink)]">矛盾意图练习（针对执着点）</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          当你在同一条思路上反复打转时，可试一种反直觉的观照：暂把念头走到它声称的尽头，观察身心如何回应。（借鉴认知传统中的对立面悬停，用语偏哲学，不替代专业治疗。）
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-[var(--line)] bg-white px-4 py-2 text-xs text-[var(--ink)] shadow-mirror hover:border-[var(--accent)]"
        >
          展开练习说明
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-mirror sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs font-normal text-[var(--ink)]">矛盾意图练习</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
        >
          收起
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{lead}</p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{instruction}</p>
      <label className="mt-5 block text-xs text-[var(--ink)]">{promptLabel}</label>
      <div className="relative mt-2 overflow-visible">
        <EmotionalCompanion />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          className="relative z-0 mt-0 w-full resize-y rounded-md border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="仅停留在此设备浏览器内存中，刷新即失；可自复制保存。"
        />
      </div>
    </div>
  );
}
