"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisSession } from "@/hooks/useAnalysisSession";
import { formatHistoryItemAsCompareText, listReflectionHistory } from "@/lib/reflection-history";
import type { ReflectionHistoryItem } from "@/lib/reflection-history";
import { AnalysisCardGrid } from "./AnalysisCardGrid";
import { CardToolbar } from "./CardToolbar";
import { CompareSection } from "./CompareSection";
import { ErrorBanner } from "./ErrorBanner";
import { FollowUpSection } from "./FollowUpSection";
import { HiddenExportFrame } from "./HiddenExportFrame";
import { ReminderBanner } from "./ReminderBanner";

export function AnalysisExperience() {
  const router = useRouter();
  const [history, setHistory] = useState<ReflectionHistoryItem[]>([]);
  const {
    loadState,
    session,
    error,
    followUpBusy,
    compareBusy,
    compareError,
    saveBusy,
    exportRef,
    updateFollowUpDraft,
    submitFollowUp,
    saveImage,
    runCompareOcr,
    runCompareWithPreviousText,
    newReflection,
    exportQuote,
  } = useAnalysisSession();

  useEffect(() => {
    if (loadState === "empty") {
      router.replace("/");
    }
  }, [loadState, router]);

  useEffect(() => {
    if (loadState === "ready" && session) {
      setHistory(listReflectionHistory());
    }
  }, [loadState, session]);

  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8">
        <p className="text-sm text-[var(--muted)]">加载中…</p>
      </div>
    );
  }

  if (loadState !== "ready" || !session) {
    return null;
  }

  const sessionDone = session.phase === "session_closed";

  return (
    <div className="min-h-full">
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 md:px-8 md:pt-12">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">Mirror</p>
            <h1 className="mt-3 text-2xl font-normal tracking-tight text-[var(--quote)] md:text-[1.65rem]">分析</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              三张卡片并列展示。可随时导出、与往期对比或追加一次追问。
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--foreground)]"
          >
            新的输入
          </Link>
        </div>

        <ErrorBanner message={error} />
        <ReminderBanner text={session.reminder} />

        <AnalysisCardGrid cards={session.cards} />

        <CardToolbar onSaveImage={() => void saveImage()} onNewReflection={newReflection} saveBusy={saveBusy} />

        <hr className="my-12 border-[var(--border)]" />

        <CompareSection
          busy={compareBusy}
          error={compareError}
          result={session.compareResult}
          onFile={(f) => void runCompareOcr(f)}
          historyItems={history}
          onPickHistory={(item) => void runCompareWithPreviousText(formatHistoryItemAsCompareText(item))}
        />

        <hr className="my-12 border-[var(--border)]" />

        <FollowUpSection
          sessionDone={sessionDone}
          followUp={session.followUp}
          onFollowUpChange={updateFollowUpDraft}
          onSubmit={() => void submitFollowUp(session.followUp)}
          busy={followUpBusy}
          reply={session.followUpReply}
        />

        <HiddenExportFrame exportRef={exportRef} cards={session.cards} exportQuote={exportQuote} />
      </main>
    </div>
  );
}
