"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

export type ChatInputProps = ComponentPropsWithoutRef<"textarea"> & {
  /** 附在包裹 textarea 的最外层 div（已含 relative overflow-visible） */
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
