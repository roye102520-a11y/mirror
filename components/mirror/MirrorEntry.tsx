"use client";

import { MirrorErrorBoundary } from "@/components/mirror/MirrorErrorBoundary";
import { MirrorHome } from "@/components/mirror/MirrorHome";

export function MirrorEntry() {
  return (
    <MirrorErrorBoundary>
      <MirrorHome />
    </MirrorErrorBoundary>
  );
}
