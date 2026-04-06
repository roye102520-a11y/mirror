"use client";

import { useCallback, useRef, useState } from "react";

const INPUT_JUMP_GAP_MS = 1350;

/** Focus 立即跳；打字节流，避免每键重触发 */
export function useMirrorCompanionJump() {
  const [jumpNonce, setJumpNonce] = useState(0);
  const lastInputBumpAt = useRef(0);

  const bumpOnFocus = useCallback(() => {
    setJumpNonce((n) => n + 1);
  }, []);

  const bumpOnInput = useCallback(() => {
    const now = Date.now();
    if (now - lastInputBumpAt.current < INPUT_JUMP_GAP_MS) return;
    lastInputBumpAt.current = now;
    setJumpNonce((n) => n + 1);
  }, []);

  return { jumpNonce, bumpOnFocus, bumpOnInput };
}
