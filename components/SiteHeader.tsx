"use client";

import { ReadmeIntro } from "@/components/ReadmeIntro";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-sm tracking-wide text-[var(--ink)] lowercase">
          mirror
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
          <ReadmeIntro />
          <Link href="/quiz" className="hover:text-[var(--ink)]">
            问卷
          </Link>
          <Link href="/settings" className="hover:text-[var(--ink)]">
            设置
          </Link>
        </nav>
      </div>
    </header>
  );
}
