import type { ReflectionHistoryItem } from "@/lib/reflection-history";
import { useRef } from "react";

type Props = {
  busy: boolean;
  error: string | null;
  result: string | null;
  onFile: (f: File) => void;
  historyItems: ReflectionHistoryItem[];
  onPickHistory: (item: ReflectionHistoryItem) => void;
};

export function CompareSection({
  busy,
  error,
  result,
  onFile,
  historyItems,
  onPickHistory,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-normal text-[var(--quote)]">与往期对比</h2>
      <p className="text-sm text-[var(--muted)]">上传截图或从本机往期摘要中选一条（占位流程）。</p>
      <div className="flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "处理中…" : "上传图片"}
        </button>
      </div>
      {historyItems.length > 0 ? (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
          <ul className="space-y-1 text-xs text-[var(--muted)]">
            {historyItems.slice(0, 8).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full text-left underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                  onClick={() => onPickHistory(item)}
                >
                  {item.createdAt.slice(0, 10)} — {item.summary.slice(0, 48)}
                  {item.summary.length > 48 ? "…" : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {result ? (
        <div className="rounded-lg border border-[var(--border)] bg-stone-50/80 p-4 text-sm leading-relaxed text-[var(--quote)] whitespace-pre-wrap">
          {result}
        </div>
      ) : null}
    </section>
  );
}
