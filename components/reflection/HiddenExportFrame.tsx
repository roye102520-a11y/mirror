import type { AnalysisExperienceCard } from "@/hooks/useAnalysisSession";
import type { RefObject } from "react";

type Props = {
  exportRef: RefObject<HTMLDivElement | null>;
  cards: AnalysisExperienceCard[];
  exportQuote: string;
};

/** 预留：html-to-image / 打印 可挂在此节点 */
export function HiddenExportFrame({ exportRef, cards, exportQuote }: Props) {
  return (
    <div ref={exportRef} className="sr-only" aria-hidden>
      {exportQuote}
      {cards.map((c) => (
        <p key={c.id}>
          {c.title}: {c.body}
        </p>
      ))}
    </div>
  );
}
