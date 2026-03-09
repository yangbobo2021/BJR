// web/app/admin/playback/PlaybackTelemetryDashboardClient.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";
import AdminPageFrame from "../AdminPageFrame";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NZ").format(value);
}

function formatHoursFromMs(value: number): string {
  const hours = value / 3_600_000;
  return hours >= 10 ? hours.toFixed(0) : hours.toFixed(1);
}

function formatMinutesFromMs(value: number): string {
  return formatNumber(Math.floor(value / 60_000));
}

function formatAgo(iso: string | null): string {
  if (!iso) return "—";

  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "—";

  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function ellipsisMiddle(value: string, keep = 8): string {
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

function fmtSnapshotStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SectionCard(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: 14,
        background: "rgba(255,255,255,0.04)",
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "rgba(255,255,255,0.94)",
          }}
        >
          {props.title}
        </div>
        {props.subtitle ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            {props.subtitle}
          </div>
        ) : null}
      </div>

      {props.children}
    </section>
  );
}

function MetricCard(props: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "12px 12px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.62)",
        }}
      >
        {props.label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1.05,
          color: "rgba(255,255,255,0.94)",
        }}
      >
        {props.value}
      </div>

      {props.sublabel ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "rgba(255,255,255,0.64)",
          }}
        >
          {props.sublabel}
        </div>
      ) : null}
    </div>
  );
}

function TableShell(props: { children: React.ReactNode }) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {props.children}
    </div>
  );
}

function TrackTable(props: {
  rows: PlaybackAdminSnapshot["topTracksByListenedMs"];
}) {
  return (
    <TableShell>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            {[
              "Track",
              "Artist",
              "Hours",
              "Plays",
              "Milestones",
              "Completions",
              "Last heard",
            ].map((label) => (
              <th
                key={label}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.62)",
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {props.rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: 14,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                No rows.
              </td>
            </tr>
          ) : null}

          {props.rows.map((row) => (
            <tr key={row.recordingId}>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.94)",
                  fontWeight: 800,
                }}
              >
                {row.title}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {row.artist ?? "—"}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {formatHoursFromMs(row.listenedMs)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {formatNumber(row.playCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {formatNumber(row.creditedProgressCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {formatNumber(row.completedCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.68)",
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

function DedupeTable(props: {
  rows: PlaybackAdminSnapshot["recentDedupe"];
}) {
  return (
    <TableShell>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            {["When", "Event", "Milestone", "Playback", "Member"].map(
              (label) => (
                <th
                  key={label}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.62)",
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
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
                  padding: 14,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                No rows.
              </td>
            </tr>
          ) : null}

          {props.rows.map((row) => (
            <tr
              key={`${row.memberId}:${row.playbackId}:${row.eventType}:${row.milestoneKey}:${row.createdAt}`}
            >
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.68)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatAgo(row.createdAt)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.94)",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {row.eventType}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.72)",
                  whiteSpace: "nowrap",
                }}
              >
                {row.milestoneKey}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.72)",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                }}
              >
                {ellipsisMiddle(row.playbackId, 10)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.72)",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                }}
              >
                {ellipsisMiddle(row.memberId, 8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

export default function PlaybackTelemetryDashboardClient(props: {
  embed: boolean;
  initialSnapshot: PlaybackAdminSnapshot;
}) {
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const snapshot = props.initialSnapshot;

  React.useEffect(() => {
    if (!autoRefresh) return;

    const id = window.setInterval(() => {
      setRefreshing(true);
      router.refresh();
    }, 20_000);

    return () => window.clearInterval(id);
  }, [autoRefresh, router]);

  React.useEffect(() => {
    setRefreshing(false);
  }, [snapshot.generatedAt]);

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => {
          setRefreshing(true);
          router.refresh();
        }}
        style={{
          height: 32,
          padding: "0 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.92)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          opacity: refreshing ? 0.72 : 1,
        }}
      >
        {refreshing ? "Refreshing…" : "Refresh now"}
      </button>

      <button
        type="button"
        onClick={() => setAutoRefresh((v) => !v)}
        style={{
          height: 32,
          padding: "0 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: autoRefresh
            ? "rgba(255,255,255,0.10)"
            : "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.92)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          opacity: autoRefresh ? 1 : 0.82,
        }}
      >
        Auto-refresh: {autoRefresh ? "On" : "Off"}
      </button>
    </>
  );

  return (
    <AdminPageFrame
      embed={props.embed}
      maxWidth={1240}
      title="Playback telemetry"
      subtitle="Monitor site-wide listening aggregates, recent recording activity, and telemetry dedupe behaviour."
      headerActions={headerActions}
    >
      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.68)",
          }}
        >
          Generated {formatAgo(snapshot.generatedAt)} · snapshot{" "}
          {fmtSnapshotStamp(snapshot.generatedAt)}
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <SectionCard
            title="Member aggregates"
            subtitle="Roll-up totals from the member-facing aggregate layer."
          >
            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              }}
            >
              <MetricCard
                label="Active members"
                value={formatNumber(snapshot.memberTotals.activeCount)}
              />
              <MetricCard
                label="Hours listened"
                value={formatHoursFromMs(snapshot.memberTotals.listenedMs)}
                sublabel={`${formatMinutesFromMs(snapshot.memberTotals.listenedMs)} minutes`}
              />
              <MetricCard
                label="Qualified plays"
                value={formatNumber(snapshot.memberTotals.playCount)}
              />
              <MetricCard
                label="15s milestones"
                value={formatNumber(
                  snapshot.memberTotals.creditedProgressCount,
                )}
              />
              <MetricCard
                label="90% completes"
                value={formatNumber(snapshot.memberTotals.completedCount)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Site-wide track aggregates"
            subtitle="Roll-up totals from the recording aggregate layer."
          >
            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              }}
            >
              <MetricCard
                label="Active recordings"
                value={formatNumber(snapshot.siteTotals.activeCount)}
              />
              <MetricCard
                label="Hours listened"
                value={formatHoursFromMs(snapshot.siteTotals.listenedMs)}
                sublabel={`${formatMinutesFromMs(snapshot.siteTotals.listenedMs)} minutes`}
              />
              <MetricCard
                label="Qualified plays"
                value={formatNumber(snapshot.siteTotals.playCount)}
              />
              <MetricCard
                label="15s milestones"
                value={formatNumber(snapshot.siteTotals.creditedProgressCount)}
              />
              <MetricCard
                label="90% completes"
                value={formatNumber(snapshot.siteTotals.completedCount)}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Top tracks by listened time"
          subtitle="Ranked by cumulative listened milliseconds."
        >
          <TrackTable rows={snapshot.topTracksByListenedMs} />
        </SectionCard>

        <SectionCard
          title="Most recent track activity"
          subtitle="Latest recording-level activity ordered by most recent listening."
        >
          <TrackTable rows={snapshot.recentTracks} />
        </SectionCard>

        <SectionCard
          title="Recent telemetry dedupe rows"
          subtitle="Recent dedupe decisions recorded for playback milestone events."
        >
          <DedupeTable rows={snapshot.recentDedupe} />
        </SectionCard>
      </div>
    </AdminPageFrame>
  );
}