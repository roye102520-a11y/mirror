"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ReadmeIntro() {
  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [entered, setEntered] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      const t = window.setTimeout(() => setShouldRender(false), 320);
      return () => window.clearTimeout(t);
    }
    setShouldRender(true);
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    queueMicrotask(() => closeRef.current?.focus());
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
  }, [shouldRender]);

  const overlay =
    shouldRender &&
    portalReady &&
    typeof document !== "undefined"
      ? createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out pointer-events-none ${
              entered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              role="presentation"
              aria-hidden
              tabIndex={-1}
              className="pointer-events-auto absolute inset-0 bg-white/30 backdrop-blur-md transition-opacity duration-300 ease-out"
              onMouseDown={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`pointer-events-auto relative z-[1] flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.96] opacity-80"
              }`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-4 py-3 sm:px-5">
                <h2 id={titleId} className="text-sm font-normal tracking-wide text-[var(--ink)]">
                  About Mirror
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] min-w-[44px] rounded-xl px-2 text-xs text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--ink)] sm:min-h-10 sm:min-w-10"
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 max-h-[70vh] overflow-y-auto px-4 py-5 text-sm leading-relaxed text-[var(--muted)] sm:px-5">
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
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[var(--muted)] decoration-[var(--line)] underline underline-offset-4 hover:text-[var(--ink)]"
      >
        Read me
      </button>
      {overlay}
    </>
  );
}
