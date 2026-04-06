"use client";

type Props = {
  prompt: string;
  onPick: (line: string) => void;
};

/**
 * 极简磨砂引导：点击后父级应 focus 输入框并可写入起句。
 */
export function GentlePromptCard({ prompt, onPick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onPick(prompt)}
      className="mirror-gentle-prompt-card group w-full rounded-xl border border-white/55 bg-[rgba(255,255,255,0.38)] px-4 py-3 text-left shadow-mirror backdrop-blur-md transition hover:border-[var(--accent)]/35 hover:bg-[rgba(255,255,255,0.52)] focus-visible:border-[var(--accent)] focus-visible:outline-none [-webkit-backdrop-filter:blur(12px)]"
    >
      <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">试试从这一句写起</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">{prompt}</p>
      <p className="mirror-gentle-prompt-card__hint mt-2 text-[10px] text-[var(--muted)]">点击卡片开始输入</p>
    </button>
  );
}
