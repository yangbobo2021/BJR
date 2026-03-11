// web/app/admin/playback/dashboard/TrackTable.tsx
"use client";

import React from "react";
import type { TrackRow } from "./types";
import { TableShell } from "./PlaybackDashboardPrimitives";
import {
  FONT_SIZE_UI,
  ROW_BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_STRONG,
} from "./playbackTelemetryDashboardStyles";
import {
  formatAgo,
  formatHoursFromMs,
  formatNumber,
} from "./playbackTelemetryDashboardFormatters";

export function TrackTable(props: { rows: TrackRow[]; emptyLabel?: string }) {
  return (
    <TableShell>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 520,
        }}
      >
        <thead>
          <tr>
            {["Track", "Hours", "Plays", "Completes", "Last heard"].map(
              (label) => (
                <th
                  key={label}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    fontSize: FONT_SIZE_UI,
                    fontWeight: 700,
                    color: TEXT_MUTED,
                    borderBottom: ROW_BORDER,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {props.rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  padding: 12,
                  fontSize: FONT_SIZE_UI,
                  color: TEXT_MUTED,
                }}
              >
                {props.emptyLabel ?? "No rows."}
              </td>
            </tr>
          ) : null}

          {props.rows.map((row) => (
            <tr key={row.recordingId}>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: ROW_BORDER,
                  color: TEXT_PRIMARY,
                  fontSize: FONT_SIZE_UI,
                  fontWeight: 700,
                }}
              >
                {row.title}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: ROW_BORDER,
                  color: TEXT_STRONG,
                  fontSize: FONT_SIZE_UI,
                  whiteSpace: "nowrap",
                }}
              >
                {formatHoursFromMs(row.listenedMs)}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: ROW_BORDER,
                  color: TEXT_STRONG,
                  fontSize: FONT_SIZE_UI,
                  whiteSpace: "nowrap",
                }}
              >
                {formatNumber(row.playCount)}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: ROW_BORDER,
                  color: TEXT_STRONG,
                  fontSize: FONT_SIZE_UI,
                  whiteSpace: "nowrap",
                }}
              >
                {formatNumber(row.completedCount)}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: ROW_BORDER,
                  color: TEXT_MUTED,
                  fontSize: FONT_SIZE_UI,
                  whiteSpace: "nowrap",
                }}
              >
                {formatAgo(row.lastListenedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}