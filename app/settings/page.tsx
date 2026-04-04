"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { DEEPSEEK_KEY_STORAGE, getStoredDeepseekKey, setStoredDeepseekKey } from "@/lib/settings-storage";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [key, setKey] = useState("");

  useEffect(() => {
    setKey(getStoredDeepseekKey());
  }, []);

  function save() {
    setStoredDeepseekKey(key);
    alert("已保存到本机浏览器 localStorage（键名：" + DEEPSEEK_KEY_STORAGE + "）。");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-14">
        <h1 className="text-lg font-normal text-[var(--ink)]">设置</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          DeepSeek API Key 仅用于结果页生成一句名言；保存在浏览器本地，不上传至本项目服务器（除你发起请求时代理转发至 DeepSeek）。
        </p>
        <label className="mt-8 block text-xs text-[var(--muted)]" htmlFor="ds-key">
          API Key
        </label>
        <input
          id="ds-key"
          type="password"
          autoComplete="off"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mt-2 w-full border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          className="mt-6 border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] hover:border-[var(--accent)]"
        >
          保存
        </button>
        <p className="mt-10 text-xs text-[var(--muted)]">
          <Link href="/" className="underline underline-offset-4">
            返回首页
          </Link>
        </p>
      </main>
    </>
  );
}
