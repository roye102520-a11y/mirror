"use client";

import React, { type ReactNode } from "react";

type S = { error: Error | null };

/** 单块图表/模块出错时不拖垮整页 */
export class SectionErrorBoundary extends React.Component<
  { children: ReactNode; label: string },
  S
> {
  state: S = { error: null };

  static getDerivedStateFromError(error: Error): S {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded border border-[var(--line)] bg-[#fafafa] p-4 text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">{this.props.label}</p>
          <p className="mt-2">该模块加载失败，其余报告仍可使用。</p>
          <p className="mt-1 font-mono text-[11px] opacity-80">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
