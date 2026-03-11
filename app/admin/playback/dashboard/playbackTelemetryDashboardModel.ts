import type { DedupeRow, DedupeSessionRow } from "./types";
import { ellipsisMiddle, formatNumber } from "./playbackTelemetryDashboardFormatters";

export function resolveDedupeIdentityLabel(row: {
  audience: "member" | "anonymous";
  memberEmail?: string | null;
  memberId?: string | null;
}): string {
  if (row.audience === "anonymous") return "Anonymous";
  if (row.memberEmail) return row.memberEmail;
  if (row.memberId) return ellipsisMiddle(row.memberId, 8);
  return "Member";
}

export function parseMilestoneMs(milestoneKey: string): number | null {
  const normalized = milestoneKey.trim();

  if (!/^\d+$/.test(normalized)) return null;

  const milestoneMs = Number(normalized);
  if (!Number.isFinite(milestoneMs) || milestoneMs < 0) return null;

  return Math.floor(milestoneMs);
}

export function isProgressEvent(eventType: string): boolean {
  return eventType.toLowerCase().includes("progress");
}

export function isPlayEvent(eventType: string): boolean {
  const normalized = eventType.toLowerCase();
  return normalized.includes("play") && !normalized.includes("progress");
}

export function isCompleteEvent(eventType: string): boolean {
  return eventType.toLowerCase().includes("complete");
}

export function formatProgressLabel(
  progressMs: number,
  hasComplete: boolean,
): string {
  if (hasComplete) return "Complete";
  if (progressMs <= 0) return "Started";
  const wholeSeconds = Math.floor(progressMs / 1000);
  return `${formatNumber(wholeSeconds)}s credited`;
}

export function buildDedupeSessionRows(rows: DedupeRow[]): DedupeSessionRow[] {
  const groups = new Map<string, DedupeRow[]>();

  for (const row of rows) {
    const identityKey =
      row.audience === "anonymous"
        ? "anonymous"
        : (row.memberEmail ?? row.memberId ?? "member");
    const trackKey = row.recordingId ?? row.recordingTitle ?? "unknown-track";
    const groupKey = [row.audience, identityKey, trackKey, row.playbackId].join(
      "::",
    );

    const existing = groups.get(groupKey);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(groupKey, [row]);
    }
  }

  return Array.from(groups.entries())
    .map(([groupKey, sourceRows]) => {
      const ordered = [...sourceRows].sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      );

      const first = ordered[0];
      const last = ordered[ordered.length - 1];

      let maxProgressMs = 0;
      let creditedMilestoneCount = 0;
      let hasPlay = false;
      let hasComplete = false;

      for (const row of ordered) {
        if (isPlayEvent(row.eventType)) hasPlay = true;
        if (isCompleteEvent(row.eventType)) hasComplete = true;

        if (isProgressEvent(row.eventType)) {
          creditedMilestoneCount += 1;
          const milestoneMs = parseMilestoneMs(row.milestoneKey);
          if (milestoneMs != null) {
            maxProgressMs = Math.max(maxProgressMs, milestoneMs);
          }
        }
      }

      const progressPct = hasComplete
        ? 100
        : Math.max(0, Math.min(92, maxProgressMs / 1000));

      const statusLabel = hasComplete
        ? "Completed"
        : maxProgressMs > 0
          ? "In progress"
          : hasPlay
            ? "Started"
            : "Telemetry";

      return {
        groupKey,
        playbackId: first.playbackId,
        audience: first.audience,
        memberId: first.memberId ?? null,
        memberEmail: first.memberEmail ?? null,
        recordingId: first.recordingId ?? null,
        recordingTitle: first.recordingTitle ?? null,
        createdAt: first.createdAt,
        latestAt: last.createdAt,
        progressMs: hasComplete ? 100_000 : maxProgressMs,
        progressPct,
        creditedMilestoneCount,
        hasPlay,
        hasComplete,
        statusLabel,
        sourceRows: ordered,
      };
    })
    .sort((a, b) => Date.parse(b.latestAt) - Date.parse(a.latestAt));
}