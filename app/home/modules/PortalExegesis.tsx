// web/app/home/modules/PortalExegesis.tsx
"use client";

import React from "react";
import { usePlayer } from "@/app/home/player/PlayerState";
import ExegesisTrackClient from "@/app/(site)/exegesis/[trackId]/ExegesisTrackClient";
import {
  fetchLyricsByTrackId,
  type LyricsByTrackOk,
} from "@/lib/lyrics/fetchLyricsByTrackId";

type ExegesisLyricsOk = {
  ok: true;
  trackId: string;
  offsetMs: number;
  version: string;
  geniusUrl: string | null;
  cues: LyricsByTrackOk["cues"];
};

function adaptLyricsForExegesis(x: LyricsByTrackOk): ExegesisLyricsOk {
  return {
    ok: true,
    trackId: x.trackId,
    offsetMs: x.offsetMs,
    version: (x.version ?? "unknown").toString(),
    geniusUrl: x.geniusUrl ?? null,
    cues: x.cues,
  };
}

function pickDefaultTrackId(p: ReturnType<typeof usePlayer>): string | null {
  // Prefer explicit current, then pending, then first queue item.
  const cur = (p.current?.id ?? "").trim();
  if (cur) return cur;

  const first = (p.queue?.[0]?.id ?? "").trim();
  if (first) return first;

  return null;
}

export default function PortalExegesis(props: {
  title?: string;
  // If true, always follow current track. If false, allow user to pin a track.
  followPlayer?: boolean;
  initialTrackId?: string | null;
}) {
  const {
    title = "Exegesis",
    followPlayer = true,
    initialTrackId = null,
  } = props;
  const p = usePlayer();

  const [pinnedTrackId, setPinnedTrackId] = React.useState<string | null>(
    initialTrackId?.trim() || null,
  );

  const effectiveTrackId = React.useMemo(() => {
    if (followPlayer) return pickDefaultTrackId(p);
    return pinnedTrackId?.trim() || pickDefaultTrackId(p);
  }, [followPlayer, pinnedTrackId, p]);

  const [lyrics, setLyrics] = React.useState<ExegesisLyricsOk | null>(null);
  const [err, setErr] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const tid = (effectiveTrackId ?? "").trim();
    const ac = new AbortController();

    async function run() {
      if (!tid) {
        setLyrics(null);
        setErr("No track selected yet.");
        return;
      }

      setLoading(true);
      setErr("");

      try {
        const raw = await fetchLyricsByTrackId(tid, ac.signal);
        if (!raw) {
          setLyrics(null);
          setErr(`Failed to load lyrics for trackId=${tid}.`);
          return;
        }

        setLyrics(adaptLyricsForExegesis(raw));
        setErr("");
      } catch {
        if (ac.signal.aborted) return;
        setLyrics(null);
        setErr("Failed to load lyrics.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }

    void run();
    return () => ac.abort();
  }, [effectiveTrackId]);

  const queue = p.queue ?? [];
  const allowPin = !followPlayer;

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 2,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.92 }}>
          {title}
        </div>

        {allowPin && queue.length > 0 ? (
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Track</div>
            <select
              value={effectiveTrackId ?? ""}
              onChange={(e) => setPinnedTrackId(e.target.value)}
              style={{
                height: 28,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.035)",
                color: "rgba(255,255,255,0.86)",
                padding: "0 10px",
                fontSize: 12,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {queue.map((t) => (
                <option key={t.id} value={t.id}>
                  {(t.title ?? t.id).toString()}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            {followPlayer ? "Following player" : "Pinned"}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
          Loading…
        </div>
      ) : err ? (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.78 }}>{err}</div>
      ) : lyrics ? (
        // IMPORTANT: ExegesisTrackClient is already a self-contained “thread + editor + voting + reporting” UI.
        // We embed it here so it behaves exactly the same as the canonical /exegesis/:trackId page.
        <ExegesisTrackClient trackId={lyrics.trackId} lyrics={lyrics} />
      ) : null}
    </div>
  );
}
