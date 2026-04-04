"use client";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <rect
        x="5.5"
        y="11"
        width="13"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

/** 本地存储说明（浅色条 + 线形锁标） */
export function LocalPrivacyBar() {
  return (
    <div className="mt-auto border-t border-[rgba(231,229,228,0.8)] bg-[rgba(245,245,244,0.9)] px-5 py-3 text-center text-[11px] leading-relaxed text-stone-500">
      <p className="mx-auto flex max-w-xl items-start justify-center gap-2 text-left sm:items-center sm:text-center">
        <LockIcon className="mt-0.5 shrink-0 text-stone-400 sm:mt-0" />
        <span>
          所有数据仅保存在你的浏览器本地，不会被上传。你可以随时通过「重置」清除。
        </span>
      </p>
    </div>
  );
}
