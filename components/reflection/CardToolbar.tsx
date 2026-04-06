type Props = {
  onSaveImage: () => void;
  onNewReflection: () => void;
  saveBusy: boolean;
};

export function CardToolbar({ onSaveImage, onNewReflection, saveBusy }: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => void onSaveImage()}
        disabled={saveBusy}
        className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] disabled:opacity-50"
      >
        {saveBusy ? "导出中…" : "保存为图片"}
      </button>
      <button
        type="button"
        onClick={onNewReflection}
        className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        新的输入
      </button>
    </div>
  );
}
