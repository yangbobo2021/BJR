// web/app/admin/playback/dashboard/TrackTable.tsx
"use client";

import React from "react";
import type { TrackRow } from "./types";
import {
  FONT_SIZE_UI,
  ROW_BORDER,
  TEXT_FAINT,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_STRONG,
} from "./playbackTelemetryDashboardStyles";
import {
  formatAgo,
  formatHoursFromMs,
  formatNumber,
} from "./playbackTelemetryDashboardFormatters";

const POPULARITY_TRACK_BG = "rgba(255,255,255,0.08)";
const POPULARITY_TRACK_FILL = "rgba(255,255,255,0.78)";

export function TrackTable(props: { rows: TrackRow[]; emptyLabel?: string }) {
  const topListenedMs = props.rows.reduce(
    (max, row) => Math.max(max, row.listenedMs),
    0,
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        alignSelf: "start",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 560,
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {["Track", "Popularity", "Plays", "Completes", "Last heard"].map(
              (label) => (
                <th
                  key={label}
                  style={{
                    textAlign: "left",
                    padding: "6px 12px 10px",
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
                  padding: "14px 12px 12px",
                  fontSize: FONT_SIZE_UI,
                  color: TEXT_MUTED,
                }}
              >
                {props.emptyLabel ?? "No rows."}
              </td>
            </tr>
          ) : null}

          {props.rows.map((row) => {
            const relativeWidthPct =
              topListenedMs > 0 ? (row.listenedMs / topListenedMs) * 100 : 0;

            return (
              <tr key={row.recordingId}>
                <td
                  style={{
                    padding: "12px 12px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_PRIMARY,
                    fontSize: FONT_SIZE_UI,
                    fontWeight: 700,
                    verticalAlign: "top",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <div>{row.title}</div>
                  </div>
                </td>

                <td
                  style={{
                    padding: "12px 12px",
                    borderBottom: ROW_BORDER,
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 220,
                        height: 10,
                        borderRadius: 999,
                        background: POPULARITY_TRACK_BG,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${relativeWidthPct}%`,
                          minWidth: row.listenedMs > 0 ? 6 : 0,
                          height: "100%",
                          borderRadius: 999,
                          background: POPULARITY_TRACK_FILL,
                          transition: "width 180ms ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: TEXT_FAINT,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatHoursFromMs(row.listenedMs)}
                    </div>
                  </div>
                </td>

                <td
                  style={{
                    padding: "12px 12px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_UI,
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                  }}
                >
                  {formatNumber(row.playCount)}
                </td>

                <td
                  style={{
                    padding: "12px 12px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_STRONG,
                    fontSize: FONT_SIZE_UI,
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                  }}
                >
                  {formatNumber(row.completedCount)}
                </td>

                <td
                  style={{
                    padding: "12px 12px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_MUTED,
                    fontSize: FONT_SIZE_UI,
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                  }}
                >
                  {formatAgo(row.lastListenedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}