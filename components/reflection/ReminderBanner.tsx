export function ReminderBanner({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-stone-50/90 px-4 py-3 text-sm text-[var(--muted)]">
      {text}
    </div>
  );
}
