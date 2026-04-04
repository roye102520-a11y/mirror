"use client";

import React, { type ReactNode } from "react";

type S = { error: Error | null };

/** 捕获子树渲染错误，避免 Next 首屏 body{display:none} 因未 hydrate 而一直白屏 */
export class RootErrorBoundary extends React.Component<{ children: ReactNode }, S> {
  state: S = { error: null };

  static getDerivedStateFromError(error: Error): S {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#fafafa] px-6 py-16 text-[#2a2a2a]">
          <h1 className="text-lg font-normal">页面加载异常</h1>
          <p className="mt-4 max-w-xl text-sm text-[#6b6b6b]">
            客户端脚本出错，页面无法继续渲染。请试：删除项目目录下 <code className="text-xs">.next</code>{" "}
            后执行 <code className="text-xs">npm run dev</code>，并硬刷新浏览器；若仍失败，请将控制台第一条红字报错发予开发者。
          </p>
          <pre className="mt-8 max-w-2xl overflow-x-auto rounded border border-[#d4d4d4] bg-white p-4 text-xs text-[#6b6b6b]">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="mt-8 border border-[#d4d4d4] bg-white px-4 py-2 text-sm"
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
