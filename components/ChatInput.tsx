"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

export type ChatInputProps = ComponentPropsWithoutRef<"textarea"> & {
  /** 包裹 textarea；须与 EmotionalCompanion 同级的父级一并设 relative overflow-visible（见 MirrorHome） */
  wrapperClassName?: string;
};

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
  { className = "", wrapperClassName = "", ...rest },
  ref
) {
  return (
    <div className={["relative overflow-visible", wrapperClassName].filter(Boolean).join(" ")}>
      <textarea ref={ref} className={className} {...rest} />
    </div>
  );
});
