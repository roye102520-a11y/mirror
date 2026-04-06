"use client";

import { useEffect, useState } from "react";

const GUIDANCE_PROMPTS = [
  "今天让你心动的微小细节是？",
  "如果不考虑别人，你想做什么？",
  "你现在的内心天气是什么样的？",
] as const;

function shuffledOrder(): readonly string[] {
  const arr = [...GUIDANCE_PROMPTS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MirrorGuidanceBubbles({
  onPick,
  className = "",
}: {
  onPick: (text: string) => void;
  className?: string;
}) {
  const [order, setOrder] = useState<readonly string[]>(() => shuffledOrder());

  useEffect(() => {
    const id = window.setInterval(() => setOrder(shuffledOrder()), 12_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={className}>
      <p className="text-xs text-[var(--muted)]">点选一句，填入下方输入框</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {order.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            className="shadow-mirror rounded-2xl border border-[var(--line)] bg-white/95 px-3 py-2.5 text-left text-xs leading-snug text-[var(--ink)] transition hover:border-[var(--accent)] active:scale-[0.99] sm:max-w-[min(100%,20rem)]"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
