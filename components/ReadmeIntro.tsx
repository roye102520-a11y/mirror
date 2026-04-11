"use client";
import { useEffect, useId, useRef, useState } from "react";
export function ReadmeIntro() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[var(--muted)] decoration-[var(--line)] underline underline-offset-4 hover:text-[var(--ink)]"
      >
        Read me
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-[rgba(0,0,0,0.2)] pt-20 sm:items-center sm:pt-0 sm:p-6"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[calc(100dvh-5rem)] w-full max-w-2xl mx-auto flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-sm sm:max-h-[80vh]"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <h2 id={titleId} className="text-sm font-normal tracking-wide text-[var(--ink)]">
                About Mirror
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] px-2 text-xs text-[var(--muted)] hover:text-[var(--ink)] sm:min-h-0 sm:min-w-0"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-5 text-sm leading-relaxed text-[var(--muted)]">
              <p className="text-[var(--ink)]">
                This is a small reflection tool for moments when social relationships feel confusing.
              </p>
              <p className="mt-4">
                You can paste a short conversation or describe a situation that made you think.
              </p>
              <p className="mt-4">
                The tool will not judge the other person, and it will not try to predict the future of
                the relationship.
              </p>
              <p className="mt-4 text-[var(--ink)]">Instead, it offers three small reflections:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-1">
                <li>an emotion it notices,</li>
                <li>a possible point of fixation in your thinking,</li>
                <li>
                  and a hypothetical question to help you see your own needs more clearly.
                </li>
              </ul>
              <p className="mt-4">
                The goal is not to give answers about others, but to help you understand what you want.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
