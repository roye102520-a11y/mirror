"use client";

import { ReadmeIntro } from "@/components/ReadmeIntro";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mirror-site-header overflow-visible border-b border-[var(--line)] bg-[rgba(250,248,252,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 overflow-visible px-5 py-4">
        <div className="mirror-brand-anchor">
          <Link
            href="/"
            className="mirror-brand-link relative z-[60] text-sm tracking-wide text-[var(--ink)] lowercase"
          >
            mirror
          </Link>
        </div>
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
