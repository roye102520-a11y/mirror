"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { GentlePromptCard } from "@/components/GentlePromptCard";
import { MIRROR_GENTLE_PROMPTS } from "@/lib/mirror-gentle-prompts";
import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
} from "react";

export type ChatInputProps = ComponentPropsWithoutRef<"textarea"> & {
  wrapperClassName?: string;
  /** `true` 使用内置 prompts；或传入自定义列表。不展示引导卡时传 false / 省略 */
  gentlePrompts?: boolean | string[];
  /** 点击引导卡：写入起句（请在外层 setState 并 focus） */
  onGentleLinePick?: (line: string) => void;
};

function resolvePromptLines(gentle: ChatInputProps["gentlePrompts"]): string[] | null {
  if (gentle === true) return MIRROR_GENTLE_PROMPTS;
  if (Array.isArray(gentle) && gentle.length > 0) return gentle;
  return null;
}

function initialPromptIndex(gentle: ChatInputProps["gentlePrompts"]): number {
  const lines = resolvePromptLines(gentle);
  if (!lines?.length) return 0;
  return Math.floor(Math.random() * lines.length);
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
  {
    className = "",
    wrapperClassName = "",
    gentlePrompts: gentlePromptsProp,
    onGentleLinePick,
    onFocus,
    onChange,
    ...rest
  },
  ref
) {
  const lines = useMemo(() => resolvePromptLines(gentlePromptsProp), [gentlePromptsProp]);
  const [lineIndex, setLineIndex] = useState(() => initialPromptIndex(gentlePromptsProp));
  const [jump, setJump] = useState(0);
  const lastInputJumpAt = useRef(0);

  const bump = useCallback(() => setJump((j) => j + 1), []);

  const throttledInputBump = useCallback(() => {
    const now = Date.now();
    if (now - lastInputJumpAt.current >= 1500) {
      lastInputJumpAt.current = now;
      bump();
    }
  }, [bump]);

  const mergedOnFocus = useCallback(
    (e: FocusEvent<HTMLTextAreaElement>) => {
      bump();
      onFocus?.(e);
    },
    [bump, onFocus]
  );

  const mergedOnChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      throttledInputBump();
      onChange?.(e);
    },
    [throttledInputBump, onChange]
  );

  const handleGentlePick = (line: string) => {
    onGentleLinePick?.(line);
  };

  const rotatePrompt = () => {
    if (!lines?.length) return;
    setLineIndex((i) => (i + 1) % lines.length);
  };

  const promptLine = lines?.length ? lines[lineIndex % lines.length] : "";

  const field = (
    <textarea
      ref={ref}
      className={className}
      {...rest}
      onFocus={mergedOnFocus}
      onChange={mergedOnChange}
    />
  );

  return (
    <div
      className={["mirror-chat-input-root relative overflow-visible", wrapperClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {lines ? (
        <>
          <div className="mb-1 flex justify-end pr-0.5">
            <button
              type="button"
              onClick={rotatePrompt}
              className="mirror-no-hover text-[10px] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              换一句
            </button>
          </div>
          <div className="relative z-[1] mb-3 min-h-[4.5rem] overflow-visible pl-16 sm:pl-[4.25rem]">
            <EmotionalCompanion jumpSignal={jump} className="emotional-companion--on-card" />
            <GentlePromptCard prompt={promptLine} onPick={handleGentlePick} />
          </div>
          <div className="relative z-[1] overflow-visible">{field}</div>
        </>
      ) : (
        <div className="relative z-[1] overflow-visible pt-11">
          <EmotionalCompanion
            jumpSignal={jump}
            className="emotional-companion--above-field absolute bottom-full left-4 z-[2] mb-0.5"
          />
          {field}
        </div>
      )}
    </div>
  );
});
