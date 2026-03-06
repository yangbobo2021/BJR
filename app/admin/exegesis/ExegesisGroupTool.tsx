"use client";

import React from "react";

type LyricsApiCue = {
  lineKey: string;
  tMs: number;
  text: string;
  endMs?: number;
};

type LyricsApiOk = {
  ok: true;
  recordingId: string;
  offsetMs: number;
  version: string;
  geniusUrl: string | null;
  cues: LyricsApiCue[];
};

type GroupMapOk = {
  ok: true;
  recordingId: string;
  map: Record<string, { canonicalGroupKey: string; updatedAt: string }>;
  groups: Array<{
    canonicalGroupKey: string;
    count: number;
    updatedAt: string;
  }>;
};

type ApiErrShape = { ok: false; error: string };

function isApiErrShape(v: unknown): v is ApiErrShape {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return r.ok === false && typeof r.error === "string";
}

function assertOk<T extends { ok: true }>(
  j: unknown,
  fallbackMsg: string,
): asserts j is T {
  if (typeof j !== "object" || j === null) throw new Error(fallbackMsg);
  const r = j as Record<string, unknown>;
  if (r.ok !== true) {
    if (isApiErrShape(j)) throw new Error(j.error || fallbackMsg);
    throw new Error(fallbackMsg);
  }
}

export default function ExegesisGroupTool() {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const [grouprecordingId, setGrouprecordingId] = React.useState<string>("");
  const [lyrics, setLyrics] = React.useState<LyricsApiOk | null>(null);
  const [groupMap, setGroupMap] = React.useState<GroupMapOk | null>(null);
  const [selectedLineKeys, setSelectedLineKeys] = React.useState<
    Record<string, boolean>
  >({});
  const [targetGroupKey, setTargetGroupKey] = React.useState<string>("");

  const selectedKeys: string[] = Object.keys(selectedLineKeys).filter((k) =>
    Boolean(selectedLineKeys[k]),
  );

  function toggleSelect(lineKey: string) {
    setSelectedLineKeys((prev) => ({
      ...prev,
      [lineKey]: !Boolean(prev[lineKey]),
    }));
  }

  function clearSelection() {
    setSelectedLineKeys({});
  }

  async function loadGrouping() {
    const recordingId = grouprecordingId.trim();
    if (!recordingId) {
      setErr("Enter a recordingId for grouping.");
      return;
    }

    setErr("");
    setBusy(true);
    try {
      const lr = await fetch(
        `/api/lyrics/by-track?recordingId=${encodeURIComponent(recordingId)}`,
        { cache: "no-store" },
      );
      const lj: unknown = await lr.json();
      assertOk<LyricsApiOk>(lj, "Failed to load lyrics.");
      setLyrics(lj);

      const mr = await fetch(
        `/api/admin/exegesis/group-map?recordingId=${encodeURIComponent(recordingId)}`,
        { cache: "no-store" },
      );
      const mj: unknown = await mr.json();
      assertOk<GroupMapOk>(mj, "Failed to load group map.");
      setGroupMap(mj);

      setTargetGroupKey("");
      clearSelection();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load grouping.");
    } finally {
      setBusy(false);
    }
  }

  async function newGroup() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/exegesis/group-map/new-group", {
        method: "POST",
      });
      const j: unknown = await r.json();

      type NewGroupOk = { ok: true; canonicalGroupKey: string };
      function isNewGroupOk(v: unknown): v is NewGroupOk {
        if (typeof v !== "object" || v === null) return false;
        const rr = v as Record<string, unknown>;
        return rr.ok === true && typeof rr.canonicalGroupKey === "string";
      }

      if (!isNewGroupOk(j)) {
        if (isApiErrShape(j))
          throw new Error(j.error || "Failed to create group.");
        throw new Error("Failed to create group.");
      }

      setTargetGroupKey(j.canonicalGroupKey);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create group.");
    } finally {
      setBusy(false);
    }
  }

  async function assignSelectedToGroup() {
    const recordingId = grouprecordingId.trim();
    const gk = targetGroupKey.trim();
    if (!recordingId) return;

    if (!gk) {
      setErr("Choose a canonical group key first.");
      return;
    }
    if (selectedKeys.length === 0) {
      setErr("Select at least one line.");
      return;
    }

    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/exegesis/group-map/set", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordingId,
          canonicalGroupKey: gk,
          lineKeys: selectedKeys,
        }),
      });

      const j: unknown = await r.json();

      type SetOk = { ok: true; updated: number };
      function isSetOk(v: unknown): v is SetOk {
        if (typeof v !== "object" || v === null) return false;
        const rr = v as Record<string, unknown>;
        return rr.ok === true && typeof rr.updated === "number";
      }

      if (!isSetOk(j)) {
        if (isApiErrShape(j)) throw new Error(j.error || "Assign failed.");
        throw new Error("Assign failed.");
      }

      await loadGrouping();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Assign failed.");
    } finally {
      setBusy(false);
    }
  }

  async function clearSelectedMapping() {
    const recordingId = grouprecordingId.trim();
    if (!recordingId) return;

    if (selectedKeys.length === 0) {
      setErr("Select at least one line.");
      return;
    }

    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/exegesis/group-map/clear", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId, lineKeys: selectedKeys }),
      });

      const j: unknown = await r.json();

      type ClearOk = { ok: true; deleted: number };
      function isClearOk(v: unknown): v is ClearOk {
        if (typeof v !== "object" || v === null) return false;
        const rr = v as Record<string, unknown>;
        return rr.ok === true && typeof rr.deleted === "number";
      }

      if (!isClearOk(j)) {
        if (isApiErrShape(j)) throw new Error(j.error || "Clear failed.");
        throw new Error("Clear failed.");
      }

      await loadGrouping();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Clear failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm opacity-70">Line grouping (Phase B1)</div>
          <div className="mt-1 text-xs opacity-60">
            Map multiple lineKeys → one canonical groupKey (e.g. g:...).
          </div>
        </div>
      </div>

      {err ? (
        <div className="mt-3 rounded-md bg-white/5 p-3 text-sm">{err}</div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <input
          className="w-full rounded-md bg-black/20 px-3 py-2 text-sm outline-none"
          placeholder="recordingId"
          value={grouprecordingId}
          onChange={(e) => setGrouprecordingId(e.target.value)}
        />
        <button
          className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-40"
          disabled={busy || !grouprecordingId.trim()}
          onClick={() => void loadGrouping()}
        >
          Load
        </button>
      </div>

      {lyrics ? (
        <div className="mt-3 text-xs opacity-60">
          {lyrics.cues.length} cues · lyrics v{lyrics.version}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <button
          className="rounded-md bg-white/5 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-40"
          disabled={busy || !lyrics}
          onClick={() => void newGroup()}
          title="Create a new canonical groupKey"
        >
          New group
        </button>

        <select
          className="w-full rounded-md bg-black/20 px-3 py-2 text-sm outline-none"
          value={targetGroupKey}
          onChange={(e) => setTargetGroupKey(e.target.value)}
          disabled={!groupMap}
        >
          <option value="">Choose existing group…</option>
          {(groupMap?.groups ?? []).map((g) => (
            <option key={g.canonicalGroupKey} value={g.canonicalGroupKey}>
              {g.canonicalGroupKey} ({g.count})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xs opacity-60">{selectedKeys.length} selected</div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 disabled:opacity-40"
            disabled={
              busy ||
              !lyrics ||
              selectedKeys.length === 0 ||
              !targetGroupKey.trim()
            }
            onClick={() => void assignSelectedToGroup()}
          >
            Assign
          </button>
          <button
            className="rounded-md bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-40"
            disabled={busy || !lyrics || selectedKeys.length === 0}
            onClick={() => void clearSelectedMapping()}
            title="Remove mapping and fall back to v1 lk:<lineKey>"
          >
            Clear
          </button>
          <button
            className="rounded-md bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-40"
            disabled={busy || selectedKeys.length === 0}
            onClick={() => clearSelection()}
          >
            Deselect
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2" style={{ maxHeight: 520, overflowY: "auto" }}>
        {!lyrics ? (
          <div className="text-sm opacity-60">Load a track to begin grouping.</div>
        ) : (
          (lyrics.cues ?? []).map((c) => {
            const mapped = groupMap?.map?.[c.lineKey];
            const isSel = Boolean(selectedLineKeys[c.lineKey]);

            return (
              <button
                key={c.lineKey}
                className={`w-full rounded-md bg-black/20 p-3 text-left hover:bg-black/25 ${
                  isSel ? "ring-1 ring-white/20" : ""
                }`}
                onClick={() => toggleSelect(c.lineKey)}
                title="Click to select/deselect"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs opacity-60">
                      {c.lineKey} · {c.tMs}ms
                    </div>
                    <div className="mt-1 text-sm opacity-90 line-clamp-2">
                      {c.text}
                    </div>
                    <div className="mt-2 text-xs opacity-60">
                      group:{" "}
                      <span className="opacity-90">
                        {mapped?.canonicalGroupKey ?? `lk:${c.lineKey}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs opacity-60">{isSel ? "Selected" : ""}</div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-3 text-xs opacity-60">
        Note: mapping doesn’t move comments yet; it only changes how lineKey resolves
        to the canonical thread.
      </div>
    </div>
  );
}