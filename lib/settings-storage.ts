export const DEEPSEEK_KEY_STORAGE = "personality60-deepseek-key";

export function getStoredDeepseekKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(DEEPSEEK_KEY_STORAGE)?.trim() ?? "";
}

export function setStoredDeepseekKey(key: string) {
  if (typeof window === "undefined") return;
  if (!key.trim()) localStorage.removeItem(DEEPSEEK_KEY_STORAGE);
  else localStorage.setItem(DEEPSEEK_KEY_STORAGE, key.trim());
}
