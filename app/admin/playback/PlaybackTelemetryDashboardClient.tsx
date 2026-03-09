"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";

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

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="portalPanelFrame--gold"
      style={{
        borderRadius: 22,
        padding: 1,
      }}
    >
      <div
        className="portalPanelInner--gold"
        style={{
          borderRadius: 21,
          padding: 18,
          display: "grid",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,226,170,0.96)",
          }}
        >
          {props.title}
        </div>
        {props.children}
      </div>
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
        borderRadius: 16,
        padding: "14px 15px",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,232,196,0.72)",
          marginBottom: 6,
        }}
      >
        {props.label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1.05,
          color: "rgba(255,248,235,0.96)",
        }}
      >
        {props.value}
      </div>
      {props.sublabel ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "rgba(255,240,214,0.68)",
          }}
        >
          {props.sublabel}
        </div>
      ) : null}
    </div>
  );
}

function TrackTable(props: {
  rows: PlaybackAdminSnapshot["topTracksByListenedMs"];
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            {["Track", "Artist", "Hours", "Plays", "Milestones", "Completions", "Last heard"].map(
              (label) => (
                <th
                  key={label}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,232,196,0.7)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
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
          {props.rows.map((row) => (
            <tr key={row.recordingId}>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.95)",
                  fontWeight: 700,
                }}
              >
                {row.title}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
                }}
              >
                {row.artist ?? "—"}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.9)",
                }}
              >
                {formatHoursFromMs(row.listenedMs)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.9)",
                }}
              >
                {formatNumber(row.playCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.9)",
                }}
              >
                {formatNumber(row.creditedProgressCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.9)",
                }}
              >
                {formatNumber(row.completedCount)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatAgo(row.lastListenedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DedupeTable(props: {
  rows: PlaybackAdminSnapshot["recentDedupe"];
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            {["When", "Event", "Milestone", "Playback", "Member"].map((label) => (
              <th
                key={label}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,232,196,0.7)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr
              key={`${row.memberId}:${row.playbackId}:${row.eventType}:${row.milestoneKey}:${row.createdAt}`}
            >
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatAgo(row.createdAt)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.95)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {row.eventType}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
                  whiteSpace: "nowrap",
                }}
              >
                {row.milestoneKey}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                }}
              >
                {ellipsisMiddle(row.playbackId, 10)}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,240,214,0.74)",
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
    </div>
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

  return (
    <div
      style={{
        minHeight: "100%",
        padding: props.embed ? 16 : 24,
        background:
          "radial-gradient(circle at top, rgba(255,224,163,0.08), transparent 28%), rgba(9,9,12,0.96)",
        color: "rgba(255,248,235,0.96)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <SectionCard title="Playback telemetry">
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,240,214,0.72)",
              }}
            >
              Generated {formatAgo(snapshot.generatedAt)} · snapshot{" "}
              {new Date(snapshot.generatedAt).toLocaleString("en-NZ")}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  router.refresh();
                }}
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.96)",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {refreshing ? "Refreshing…" : "Refresh now"}
              </button>

              <button
                type="button"
                onClick={() => setAutoRefresh((v) => !v)}
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: autoRefresh
                    ? "rgba(255,220,145,0.14)"
                    : "rgba(255,255,255,0.06)",
                  color: "rgba(255,248,235,0.96)",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Auto-refresh: {autoRefresh ? "On" : "Off"}
              </button>
            </div>
          </div>
        </SectionCard>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <SectionCard title="Member aggregates">
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
                value={formatNumber(snapshot.memberTotals.creditedProgressCount)}
              />
              <MetricCard
                label="90% completes"
                value={formatNumber(snapshot.memberTotals.completedCount)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Site-wide track aggregates">
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

        <SectionCard title="Top tracks by listened time">
          <TrackTable rows={snapshot.topTracksByListenedMs} />
        </SectionCard>

        <SectionCard title="Most recent track activity">
          <TrackTable rows={snapshot.recentTracks} />
        </SectionCard>

        <SectionCard title="Recent telemetry dedupe rows">
          <DedupeTable rows={snapshot.recentDedupe} />
        </SectionCard>
      </div>
    </div>
  );
}