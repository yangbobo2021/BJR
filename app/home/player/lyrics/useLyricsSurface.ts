//web/app/home/player/lyrics/useLyricsSurface.ts
"use client";

import React from "react";
import { lyricsSurface } from "./lyricsSurface";

export function useLyricsSnapshot() {
  return React.useSyncExternalStore(
    lyricsSurface.subscribe,
    lyricsSurface.getSnapshot,
    lyricsSurface.getSnapshot,
  );
}