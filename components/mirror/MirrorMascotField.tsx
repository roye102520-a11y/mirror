"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { useMemo, useState, type FocusEventHandler, type ReactElement } from "react";

export type MascotTextareaHandlers = {
  onFocus: FocusEventHandler<HTMLTextAreaElement>;
  onBlur: FocusEventHandler<HTMLTextAreaElement>;
};

/**
 * 小王子蹲在输入框外上方（窄屏在框内右侧）；子渲染函数须返回带 {...handlers} 的 textarea。
 */
export function MirrorMascotField({
  children,
  className = "",
}: {
  children: (handlers: MascotTextareaHandlers) => ReactElement;
  className?: string;
}) {
  const [listening, setListening] = useState(false);

  const handlers = useMemo<MascotTextareaHandlers>(
    () => ({
      onFocus: () => setListening(true),
      onBlur: () => setListening(false),
    }),
    []
  );

  const rootClass = className.trim() ? `mascot-field ${className.trim()}` : "mascot-field";

  return (
    <div className={rootClass}>
      <EmotionalCompanion listening={listening} />
      {children(handlers)}
    </div>
  );
}
