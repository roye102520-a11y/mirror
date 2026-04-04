declare module "wordcloud" {
  export interface WordCloudOptions {
    list: [string, number][] | Array<[string, number, ...unknown[]]>;
    fontFamily?: string;
    fontWeight?: string | ((...args: unknown[]) => string);
    minSize?: number;
    weightFactor?: number | ((size: number) => number);
    clearCanvas?: boolean;
    backgroundColor?: string;
    gridSize?: number;
    origin?: [number, number];
    drawOutOfBound?: boolean;
    shrinkToFit?: boolean;
    minRotation?: number;
    maxRotation?: number;
    rotationSteps?: number;
    shuffle?: boolean;
    rotateRatio?: number;
    shape?:
      | "circle"
      | "cardioid"
      | "diamond"
      | "square"
      | "triangle-forward"
      | "triangle"
      | "pentagon"
      | "star";
    ellipticity?: number;
    color?: string | ((...args: unknown[]) => string);
    hover?: (...args: unknown[]) => void;
    click?: (...args: unknown[]) => void;
  }

  interface WordCloudFn {
    (elements: HTMLCanvasElement | HTMLCanvasElement[], options: WordCloudOptions): void;
    stop: () => void;
    isSupported: boolean;
    minFontSize: number;
  }

  const WordCloud: WordCloudFn;
  export default WordCloud;
}
