// web/app/home/player/stage/LyricsOverlayHost.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/app/home/player/PlayerState";
import { mediaSurface } from "@/app/home/player/mediaSurface";
import LyricsOverlay, {
  type LyricCue,
} from "@/app/home/player/stage/LyricsOverlay";
import {
  lyricsSurface,
  type CuesByTrackId,
  type OffsetByTrackId,
} from "@/app/home/player/lyrics/lyricsSurface";

const SLOT_ID = "af-lyrics-overlay-slot";

function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

function pickKeyWithCues(
  cuesByTrackId: CuesByTrackId | undefined,
  keys: Array<string | null | undefined>,
) {
  if (!cuesByTrackId) return (keys.find(Boolean) as string | null) ?? null;
  for (const k of keys) {
    if (!k) continue;
    const xs = cuesByTrackId[k];
    if (Array.isArray(xs) && xs.length) return k;
  }
  return (keys.find(Boolean) as string | null) ?? null;
}

function useLyricsSnapshot() {
  return React.useSyncExternalStore(
    lyricsSurface.subscribe,
    lyricsSurface.getSnapshot,
    lyricsSurface.getSnapshot,
  );
}

function useSurfaceTrackId(): string | null {
  const [surfaceTrackId, setSurfaceTrackId] = React.useState<string | null>(
    () => mediaSurface.getTrackId(),
  );

  React.useEffect(() => {
    const unsub = mediaSurface.subscribe((e) => {
      if (e.type === "track") setSurfaceTrackId(e.id);
    });
    return unsub;
  }, []);

  return surfaceTrackId;
}

function usePortalTarget(id: string, mounted: boolean): HTMLElement | null {
  const [el, setEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const next =
        typeof document !== "undefined"
          ? (document.getElementById(id) as HTMLElement | null)
          : null;
      setEl((prev) => (prev === next ? prev : next));
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [id, mounted]);

  return el;
}

export default function LyricsOverlayHost() {
  const mounted = useMounted();
  const slotEl = usePortalTarget(SLOT_ID, mounted);
  const isActive = Boolean(slotEl);

  const p = usePlayer();
  const surfaceTrackId = useSurfaceTrackId();
  const snap = useLyricsSnapshot();

  const playerTrackId = p.current?.id ?? null;
  const playerMuxId = p.current?.muxPlaybackId ?? null;

  const trackId = React.useMemo(() => {
    return pickKeyWithCues(snap.cuesByTrackId, [
      playerTrackId,
      surfaceTrackId,
      playerMuxId,
    ]);
  }, [snap.cuesByTrackId, playerTrackId, surfaceTrackId, playerMuxId]);

  const cues: LyricCue[] | null = React.useMemo(() => {
    if (!trackId) return null;
    const xs = snap.cuesByTrackId?.[trackId];
    return Array.isArray(xs) && xs.length ? xs : null;
  }, [snap.cuesByTrackId, trackId]);

  const trackOffsetMs = React.useMemo(() => {
    if (!trackId) return 0;
    const v = (snap.offsetByTrackId as OffsetByTrackId | undefined)?.[trackId];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  }, [snap.offsetByTrackId, trackId]);

  const effectiveOffsetMs = trackOffsetMs + (snap.globalOffsetMs ?? 0);

  const onSeek = React.useCallback(
    (tMs: number) => {
      window.dispatchEvent(new Event("af:play-intent"));
      p.seek(Math.max(0, Math.floor(tMs)));
    },
    [p],
  );

  if (!mounted) return null;
  if (typeof document === "undefined") return null;

  if (!slotEl) return null;
  const target = slotEl;

  // Keep mounted even when inactive; just make it invisible + inert in practice.
  const wrapperStyle: React.CSSProperties = isActive
    ? { display: "contents" }
    : { display: "none", pointerEvents: "none", userSelect: "none" };

  const node = (
    <div aria-hidden={!isActive} style={wrapperStyle}>
      <LyricsOverlay
        cues={cues}
        offsetMs={effectiveOffsetMs}
        onSeek={onSeek}
        variant="inline"
        reservedBottomPx={0}
      />
    </div>
  );

  return createPortal(node, target);
}
