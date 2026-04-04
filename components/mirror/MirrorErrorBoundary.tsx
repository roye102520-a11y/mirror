"use client";

import React, { type ReactNode } from "react";

type S = { error: Error | null };

export class MirrorErrorBoundary extends React.Component<{ children: ReactNode }, S> {
  state: S = { error: null };

  static getDerivedStateFromError(error: Error): S {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--ink)]">
          <h1 className="text-lg font-normal">页面加载出错</h1>
          <p className="mt-4 text-sm text-[var(--muted)]">
            请打开浏览器开发者工具（Console）查看详细错误，或尝试硬刷新（清除缓存后刷新）。
          </p>
          <pre className="mt-6 overflow-x-auto rounded border border-[var(--line)] bg-white p-4 text-xs text-[var(--muted)]">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 border border-[var(--line)] bg-white px-4 py-2 text-sm"
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
