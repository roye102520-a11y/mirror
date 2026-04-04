/** 首页 hub：选好哲学/语气后是否自动进入 /quiz */
export const MIRROR_AUTO_START_QUIZ_STORAGE = "mirror-auto-start-quiz";

export function readStoredMirrorAutoStartQuiz(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MIRROR_AUTO_START_QUIZ_STORAGE) === "1";
}

export function writeStoredMirrorAutoStartQuiz(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MIRROR_AUTO_START_QUIZ_STORAGE, on ? "1" : "0");
}
