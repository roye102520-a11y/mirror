import type { AnalysisExperienceCard } from "@/hooks/useAnalysisSession";

export function AnalysisCardGrid({ cards }: { cards: AnalysisExperienceCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <article
          key={c.id}
          className="rounded-xl border border-[var(--border)] bg-white/80 p-4 shadow-sm backdrop-blur-sm"
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-wide text-[var(--muted)]">{c.title}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--quote)]">{c.body}</p>
        </article>
      ))}
    </div>
  );
}
