"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { WordCloudOptions } from "wordcloud";

import { generateWordCloud, type WordCloudFrequencyItem } from "@/lib/generate-word-cloud";

type WordCloudFn = {
  (el: HTMLCanvasElement, options: WordCloudOptions): void;
  stop: () => void;
  isSupported: boolean;
};

const GRAY_TEXT = ["#0a0a0a", "#222222", "#3a3a3a", "#555555", "#737373", "#8a8a8a"];

function grayForWord(word: string, weight: number) {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (Math.imul(31, h) + word.charCodeAt(i)) | 0;
  const idx = (Math.abs(h) + Math.floor(weight)) % GRAY_TEXT.length;
  return GRAY_TEXT[idx]!;
}

export type PersonalWordCloudProps = {
  /** 多段反思原文 */
  textArray: string[];
  /** 矩形：词在矩形区域内分布；圆形： polar circle */
  shape?: "rectangle" | "circle";
  className?: string;
  /** 画布最小高度（CSS px） */
  minHeight?: number;
  maxWords?: number;
};

export function PersonalWordCloud({
  textArray,
  shape = "rectangle",
  className = "",
  minHeight = 280,
  maxWords = 120,
}: PersonalWordCloudProps) {
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordcloudRef = useRef<WordCloudFn | null>(null);
  const [boxW, setBoxW] = useState(400);
  const [supported, setSupported] = useState(true);

  const items: WordCloudFrequencyItem[] = useMemo(() => {
    try {
      return generateWordCloud(textArray, { maxWords });
    } catch (e) {
      console.error("[generateWordCloud]", e);
      return [];
    }
  }, [textArray, maxWords]);

  const list: [string, number][] = useMemo(() => items.map((x) => [x.word, x.count]), [items]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBoxW(Math.max(200, el.clientWidth)));
    ro.observe(el);
    setBoxW(Math.max(200, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let cancelled = false;

    const run = (WordCloudMod: WordCloudFn) => {
      if (cancelled || list.length === 0) return;

      if (!WordCloudMod.isSupported) {
        setSupported(false);
        return;
      }
      setSupported(true);

      const w = Math.max(200, wrap.clientWidth);
      const h = minHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      WordCloudMod.stop();

      const maxCount = Math.max(...list.map((x) => x[1]), 1);
      const weightFactor = (size: number) =>
        6 + (size / maxCount) * Math.max(22, Math.min(w, h) * 0.14);

      const opts: WordCloudOptions = {
        list,
        backgroundColor: "#ffffff",
        clearCanvas: true,
        shape: shape === "circle" ? "circle" : "square",
        ellipticity: shape === "circle" ? 1 : 0.18,
        gridSize: Math.round(Math.max(6, w / 64)),
        minSize: 4,
        weightFactor,
        rotateRatio: 0,
        minRotation: 0,
        maxRotation: 0,
        shuffle: true,
        fontFamily:
          'ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif',
        color: (word: unknown, weight: unknown) => grayForWord(String(word), Number(weight)),
        drawOutOfBound: false,
        shrinkToFit: true,
      };
      try {
        WordCloudMod(canvas, opts);
      } catch (e) {
        console.error("[wordcloud]", e);
        setSupported(false);
      }
    };

    import("wordcloud")
      .then((mod) => {
        const W = mod.default as WordCloudFn;
        wordcloudRef.current = W;
        if (!cancelled) run(W);
      })
      .catch((e) => {
        console.error("[wordcloud] load", e);
        setSupported(false);
      });

    return () => {
      cancelled = true;
      wordcloudRef.current?.stop();
    };
  }, [list, shape, minHeight, boxW]);

  if (list.length === 0) {
    return (
      <div
        className={`w-full font-sans text-[13px] text-[#666] ${className}`}
        role="img"
        aria-labelledby={titleId}
      >
        <p id={titleId} className="sr-only">
          词云：暂无文本
        </p>
        <p>暂无足够文本生成词云</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full font-sans text-[13px] text-[#333] ${className}`}
      role="region"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        个人词云，依据最近反思文本词频生成；共 {list.length} 个词。
      </p>
      {!supported ? (
        <p className="text-[12px] text-[#666]">当前环境无法绘制词云（不支持 canvas）。</p>
      ) : null}
      <div ref={wrapRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="block w-full max-w-full rounded-sm"
          style={{ border: "1px solid #e5e5e5", minHeight }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export { EXAMPLE_REFLECTION_TEXTS } from "@/lib/example-reflection-texts";
