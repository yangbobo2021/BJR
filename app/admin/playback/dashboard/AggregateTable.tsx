// web/app/admin/playback/dashboard/AggregateTable.tsx
"use client";

import React from "react";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";
import { TableShell } from "./PlaybackDashboardPrimitives";
import {
  FONT_SIZE_UI,
  ROW_BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_STRONG,
} from "./playbackTelemetryDashboardStyles";
import { formatAggregateValue } from "./playbackTelemetryDashboardFormatters";

export function AggregateTable(props: { snapshot: PlaybackAdminSnapshot }) {
  const rows = [
    {
      label: "Qualified plays",
      memberAllTime: props.snapshot.memberTotals.playCount,
      member30d: props.snapshot.member30d.playCount,
      siteAllTime: props.snapshot.siteTotals.playCount,
      site30d: props.snapshot.site30d.playCount,
    },
    {
      label: "Hours listened",
      memberAllTime: props.snapshot.memberTotals.listenedMs,
      member30d: props.snapshot.member30d.listenedMs,
      siteAllTime: props.snapshot.siteTotals.listenedMs,
      site30d: props.snapshot.site30d.listenedMs,
    },
    {
      label: "Minutes listened",
      memberAllTime: props.snapshot.memberTotals.listenedMs,
      member30d: props.snapshot.member30d.listenedMs,
      siteAllTime: props.snapshot.siteTotals.listenedMs,
      site30d: props.snapshot.site30d.listenedMs,
    },
    {
      label: "90% completes",
      memberAllTime: props.snapshot.memberTotals.completedCount,
      member30d: props.snapshot.member30d.completedCount,
      siteAllTime: props.snapshot.siteTotals.completedCount,
      site30d: props.snapshot.site30d.completedCount,
    },
  ];

  return (
    <TableShell>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 820,
        }}
      >
        <thead>
          <tr>
            {[
              "Category",
              "Members · All time",
              "Members · 30d",
              "Site · All time",
              "Site · 30d",
            ].map((label) => (
              <th
                key={label}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: FONT_SIZE_UI,
                  fontWeight: 700,
                  color: TEXT_MUTED,
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
          {rows.map((row) => {
            const isQualifiedPlays = row.label === "Qualified plays";

            const cellStyle = (highlight: boolean): React.CSSProperties => ({
              padding: "10px 14px",
              borderBottom: ROW_BORDER,
              color: highlight ? "rgba(255,255,255,0.98)" : TEXT_STRONG,
              fontSize: highlight ? 15 : FONT_SIZE_UI,
              fontWeight: highlight ? 800 : 400,
              letterSpacing: highlight ? "-0.01em" : undefined,
              whiteSpace: "nowrap",
            });

            return (
              <tr key={row.label}>
                <td
                  style={{
                    padding: "10px 14px",
                    borderBottom: ROW_BORDER,
                    color: TEXT_PRIMARY,
                    fontSize: FONT_SIZE_UI,
                    fontWeight: isQualifiedPlays ? 800 : 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.label}
                </td>
                <td style={cellStyle(isQualifiedPlays)}>
                  {formatAggregateValue(row.label, row.memberAllTime)}
                </td>
                <td style={cellStyle(isQualifiedPlays)}>
                  {formatAggregateValue(row.label, row.member30d)}
                </td>
                <td style={cellStyle(isQualifiedPlays)}>
                  {formatAggregateValue(row.label, row.siteAllTime)}
                </td>
                <td style={cellStyle(isQualifiedPlays)}>
                  {formatAggregateValue(row.label, row.site30d)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableShell>
  );
}