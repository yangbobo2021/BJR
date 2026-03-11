"use client";

import React from "react";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";
import type { DedupeRow } from "./types";
import { AudienceBadge, TableShell } from "./PlaybackDashboardPrimitives";
import {
  BG_ACCENT,
  BG_ANON,
  BG_MEMBER,
  FONT_SIZE_DEDUPE,
  ROW_BORDER,
  TEXT_FAINT,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_STRONG,
} from "./playbackTelemetryDashboardStyles";
import {
  ellipsisMiddle,
  formatAgo,
  formatNumber,
} from "./playbackTelemetryDashboardFormatters";
import {
  buildDedupeSessionRows,
  formatProgressLabel,
  resolveDedupeIdentityLabel,
} from "./playbackTelemetryDashboardModel";

export function DedupeTable(props: {
  rows: PlaybackAdminSnapshot["recentDedupe"];
}) {
  const rawRows = props.rows as DedupeRow[];
  const rows = React.useMemo(() => buildDedupeSessionRows(rawRows), [rawRows]);

  return (
    <TableShell>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 1120,
        }}
      >
        <thead>
          <tr>
            {[
              "When",
              "Track / Session",
              "Progress",
              "Status",
              "Audience",
              "Listener",
            ].map((label) => (
              <th
                key={label}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  fontSize: FONT_SIZE_DEDUPE,
                  fontWeight: 700,
                  color: TEXT_FAINT,
                  borderBottom: ROW_BORDER,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: 10,
                  fontSize: FONT_SIZE_DEDUPE,
                  color: TEXT_MUTED,
                }}
              >
                No rows.
              </td>
            </tr>
          ) : null}

          {rows.map((row) => {
            const identityLabel = resolveDedupeIdentityLabel({
              audience: row.audience,
              memberEmail: row.memberEmail,
              memberId: row.memberId,
            });

            const monospaceIdentity =
              row.memberEmail == null && row.memberId != null;

            return (
              <tr key={row.groupKey}>
                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_MUTED,
                    fontSize: FONT_SIZE_DEDUPE,
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  <div>{formatAgo(row.latestAt)}</div>
                  <div
                    style={{
                      marginTop: 4,
                      color: TEXT_FAINT,
                    }}
                  >
                    {row.sourceRows.length} events
                  </div>
                </td>

                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_DEDUPE,
                    verticalAlign: "top",
                    minWidth: 220,
                  }}
                >
                  <div
                    style={{
                      color: TEXT_PRIMARY,
                      fontWeight: 700,
                    }}
                  >
                    {row.recordingTitle ??
                      `session ${ellipsisMiddle(row.playbackId, 10)}`}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: TEXT_FAINT,
                    }}
                  >
                    {ellipsisMiddle(row.playbackId, 10)}
                  </div>
                </td>

                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    fontSize: FONT_SIZE_DEDUPE,
                    verticalAlign: "top",
                    minWidth: 300,
                  }}
                >
                  <div
                    style={{
                      height: 12,
                      width: "100%",
                      borderRadius: 999,
                      overflow: "hidden",
                      background: BG_ACCENT,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${row.progressPct}%`,
                        borderRadius: 999,
                        background:
                          row.audience === "member" ? BG_MEMBER : BG_ANON,
                        transition: "width 180ms ease-out",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                      color: TEXT_MUTED,
                    }}
                  >
                    <span>
                      {formatProgressLabel(row.progressMs, row.hasComplete)}
                    </span>
                    <span>
                      {row.creditedMilestoneCount > 0
                        ? `${formatNumber(row.creditedMilestoneCount)} milestones`
                        : row.hasPlay
                          ? "Play recorded"
                          : "No progress milestones"}
                    </span>
                  </div>
                </td>

                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_DEDUPE,
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 20,
                      padding: "0 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: row.hasComplete
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.06)",
                      color: TEXT_PRIMARY,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                    }}
                  >
                    {row.statusLabel}
                  </span>
                </td>

                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_DEDUPE,
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  <AudienceBadge audience={row.audience} />
                </td>

                <td
                  style={{
                    padding: "10px 10px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_DEDUPE,
                    maxWidth: 280,
                    verticalAlign: "top",
                    fontFamily: monospaceIdentity
                      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
                      : undefined,
                  }}
                >
                  {identityLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableShell>
  );
}