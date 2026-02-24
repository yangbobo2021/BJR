// web/app/(site)/PlayerHost.tsx
"use client";

import React from "react";
import { PlayerStateProvider } from "@/app/home/player/PlayerState";
import AudioEngine from "@/app/home/player/AudioEngine";
import TrackTitleSync from "@/app/home/player/TrackTitleSync";
import StageInlineHost from "@/app/home/player/StageInlineHost";
//import LyricsOverlayHost from "@/app/home/player/stage/LyricsOverlayHost";

export default function PlayerHost({ children }: { children: React.ReactNode }) {
  return (
    <PlayerStateProvider>
      <AudioEngine />
      <StageInlineHost />
      <TrackTitleSync fallbackLeaf="Consolers" mode="track" />
      {children}
    </PlayerStateProvider>
  );
}