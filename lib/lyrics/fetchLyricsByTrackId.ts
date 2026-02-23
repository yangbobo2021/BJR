// web/lib/lyrics/fetchLyricsByTrackId.ts
export type LyricCue = {
  lineKey: string;
  tMs: number;
  text: string;
  endMs?: number;
};

export type LyricsByTrackOk = {
  trackId: string;
  cues: LyricCue[];
  offsetMs: number;
  version?: string;
  geniusUrl?: string | null;
};

export async function fetchLyricsByTrackId(
  trackId: string,
  signal?: AbortSignal,
): Promise<LyricsByTrackOk | null> {
  const tid = (trackId ?? "").trim();
  if (!tid) return null;

  const res = await fetch(
    `/api/lyrics/by-track?trackId=${encodeURIComponent(tid)}`,
    { signal, cache: "no-store" },
  );
  if (!res.ok) return null;

  const j = (await res.json()) as unknown;
  if (!j || typeof j !== "object") return null;

  const r = j as Record<string, unknown>;
  if (typeof r.trackId !== "string") return null;
  if (!Array.isArray(r.cues)) return null;
  if (typeof r.offsetMs !== "number") return null;

  // Soft validation of cues
  const cues = r.cues as unknown[];
  for (const c of cues) {
    if (!c || typeof c !== "object") return null;
    const cc = c as Record<string, unknown>;
    if (typeof cc.lineKey !== "string") return null;
    if (typeof cc.tMs !== "number") return null;
    if (typeof cc.text !== "string") return null;
  }

  return {
    trackId: r.trackId as string,
    cues: r.cues as LyricCue[],
    offsetMs: r.offsetMs as number,
    version: typeof r.version === "string" ? r.version : undefined,
    geniusUrl:
      r.geniusUrl === null || typeof r.geniusUrl === "string"
        ? (r.geniusUrl as string | null)
        : undefined,
  };
}