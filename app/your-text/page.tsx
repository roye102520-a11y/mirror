"use client";

import { EmotionalCompanion } from "@/components/EmotionalCompanion";
import { MirrorGuidanceBubbles } from "@/components/mirror/MirrorGuidanceBubbles";
import { SiteHeader } from "@/components/SiteHeader";
import { narrativeGuidance } from "@/lib/analyze-narrative";
import { useQuiz } from "@/context/QuizContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function YourTextPage() {
  const { setNarrative } = useQuiz();
  const [text, setText] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const guidance = useMemo(() => narrativeGuidance(text), [text]);

  function proceed() {
    setNarrative(text.trim());
    router.push("/quiz");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-14">
        <h1 className="text-lg font-normal text-[var(--ink)]">你的文字</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          可写下对方的叙述或你们之间的事件。系统仅从文字中做客观、偏结构的阅读提示，随后进入同一套选择题，引导作答者从个人维度回应。
        </p>
        <MirrorGuidanceBubbles
          className="mt-6"
          onPick={(t) => {
            setText(t);
            requestAnimationFrame(() => textareaRef.current?.focus());
          }}
        />
        <div className="relative mt-4 overflow-visible">
          <EmotionalCompanion />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="shadow-mirror relative z-0 mt-0 w-full resize-y rounded-lg border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="在此粘贴或输入叙述……"
          />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">{guidance}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={proceed}
            className="shadow-mirror rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] hover:border-[var(--accent)]"
          >
            从这段文字进入问卷
          </button>
          <Link
            href="/"
            className="border border-transparent px-5 py-3 text-center text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          >
            返回首页
          </Link>
        </div>
      </main>
    </>
  );
}
