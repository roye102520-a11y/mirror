type Props = {
  sessionDone: boolean;
  followUp: string;
  onFollowUpChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  reply: string | null;
};

export function FollowUpSection({
  sessionDone,
  followUp,
  onFollowUpChange,
  onSubmit,
  busy,
  reply,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-normal text-[var(--quote)]">追问</h2>
      {sessionDone ? (
        <p className="text-sm text-[var(--muted)]">本会话已结束，仍可查看下方回复。</p>
      ) : null}
      <textarea
        value={followUp}
        onChange={(e) => onFollowUpChange(e.target.value)}
        rows={4}
        placeholder="还想问一句…"
        className="w-full rounded-lg border border-[var(--border)] bg-white p-3 text-sm text-[var(--foreground)]"
      />
      <button
        type="button"
        disabled={busy || !followUp.trim()}
        onClick={onSubmit}
        className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm disabled:opacity-50"
      >
        {busy ? "发送中…" : "发送追问"}
      </button>
      {reply ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm leading-relaxed text-[var(--quote)] whitespace-pre-wrap">
          {reply}
        </div>
      ) : null}
    </section>
  );
}
