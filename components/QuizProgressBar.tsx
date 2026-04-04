import { QUIZ_TOTAL_STEP_COUNT } from "@/lib/quiz-types";

type Props = {
  /** 当前步数，1～68 */
  currentStep: number;
  /** 如维度名称、选做说明等 */
  contextLine?: string;
};

export function QuizProgressBar({ currentStep, contextLine }: Props) {
  const total = QUIZ_TOTAL_STEP_COUNT;
  const clamped = Math.min(total, Math.max(1, currentStep));
  const widthPct = (clamped / total) * 100;

  return (
    <div className="mb-6 w-full">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="text-sm font-normal tabular-nums text-[var(--ink)]">
          第 {clamped} / {total} 题
        </p>
        {contextLine ? (
          <p className="text-xs leading-snug text-[var(--muted)] sm:text-right">{contextLine}</p>
        ) : null}
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200 sm:mt-2.5 sm:h-1.5"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`问卷进度 ${clamped} / ${total}`}
      >
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
