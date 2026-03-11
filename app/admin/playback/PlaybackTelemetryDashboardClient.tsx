"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";
import AdminPageFrame from "../AdminPageFrame";
import { AggregateTable } from "./dashboard/AggregateTable";
import { AudienceSplitCard } from "./dashboard/AudienceSplitCard";
import { DedupeTable } from "./dashboard/DedupeTable";
import { MetricPill, SectionCard, TrendRangeToggle } from "./dashboard/PlaybackDashboardPrimitives";
import { QualifiedPlayTrendChart } from "./dashboard/QualifiedPlayTrendChart";
import { TrackTable } from "./dashboard/TrackTable";
import {
  FONT_SIZE_UI,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from "./dashboard/playbackTelemetryDashboardStyles";
import {
  formatAgo,
  formatNumber,
  fmtSnapshotStamp,
} from "./dashboard/playbackTelemetryDashboardFormatters";
import type { TrendRangeKey } from "./dashboard/types";

export default function PlaybackTelemetryDashboardClient(props: {
  embed: boolean;
  initialSnapshot: PlaybackAdminSnapshot;
}) {
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [trendRange, setTrendRange] = React.useState<TrendRangeKey>("day");

  const snapshot = props.initialSnapshot;
  const selectedTrend = snapshot.qualifiedPlayTrends[trendRange];
  const recentPlayTotal = selectedTrend.buckets.reduce(
    (sum, row) => sum + row.sitePlayCount,
    0,
  );

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
          height: 30,
          padding: "0 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          color: TEXT_PRIMARY,
          cursor: "pointer",
          fontSize: FONT_SIZE_UI,
          fontWeight: 700,
          opacity: refreshing ? 0.72 : 1,
        }}
      >
        {refreshing ? "Refreshing…" : "Refresh now"}
      </button>

      <button
        type="button"
        onClick={() => setAutoRefresh((value) => !value)}
        style={{
          height: 30,
          padding: "0 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: autoRefresh
            ? "rgba(255,255,255,0.10)"
            : "rgba(255,255,255,0.04)",
          color: TEXT_PRIMARY,
          cursor: "pointer",
          fontSize: FONT_SIZE_UI,
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
      maxWidth={1360}
      title="Playback telemetry"
      subtitle="Monitor site-wide listening aggregates, recent recording activity, audience provenance, and telemetry dedupe behaviour."
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
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: FONT_SIZE_UI,
              lineHeight: 1.5,
              color: TEXT_MUTED,
            }}
          >
            Generated {formatAgo(snapshot.generatedAt)} · snapshot{" "}
            {fmtSnapshotStamp(snapshot.generatedAt)}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <MetricPill
              label="Site plays · all time"
              value={formatNumber(snapshot.siteTotals.playCount)}
            />
            <MetricPill
              label="Site plays · 30d"
              value={formatNumber(snapshot.site30d.playCount)}
            />
            <MetricPill
              label={`Trend total · ${selectedTrend.label}`}
              value={formatNumber(recentPlayTotal)}
            />
          </div>
        </div>

        <SectionCard
          title="Qualified plays over time"
          subtitle="Stacked area layers show total qualified plays across the selected horizon, split between signed-in members and anonymous listeners. Each view now uses bucket sizes that match the named duration."
          headerRight={
            <TrendRangeToggle value={trendRange} onChange={setTrendRange} />
          }
        >
          <QualifiedPlayTrendChart
            rows={selectedTrend.buckets}
            range={trendRange}
          />
        </SectionCard>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 0.9fr)",
            alignItems: "start",
          }}
        >
          <SectionCard
            title="Listening aggregates"
            subtitle="All-time totals and past-30-days telemetry shown side by side. Recent listened time is derived from credited 15-second progress milestones."
          >
            <AggregateTable snapshot={snapshot} />
          </SectionCard>

          <AudienceSplitCard snapshot={snapshot} />
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            alignItems: "start",
          }}
        >
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
        </div>

        <SectionCard
          title="Recent telemetry sessions"
          subtitle="Recent member and anonymous telemetry is rolled up by listener, track, and playback session so progress milestones read as a single session bar rather than many separate rows."
        >
          <DedupeTable rows={snapshot.recentDedupe} />
        </SectionCard>
      </div>
    </AdminPageFrame>
  );
}