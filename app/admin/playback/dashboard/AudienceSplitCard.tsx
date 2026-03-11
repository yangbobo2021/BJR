"use client";

import React from "react";
import type { PlaybackAdminSnapshot } from "@/lib/playbackAdmin";
import { SectionCard } from "./PlaybackDashboardPrimitives";
import {
  BG_ACCENT,
  BG_ANON,
  BG_INSET,
  BG_MEMBER,
  FONT_SIZE_UI,
  PANEL_BORDER,
  TEXT_FAINT,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from "./playbackTelemetryDashboardStyles";
import {
  formatNumber,
  percentage,
} from "./playbackTelemetryDashboardFormatters";

export function AudienceSplitCard(props: { snapshot: PlaybackAdminSnapshot }) {
  const allTimeMember = props.snapshot.audienceSplit.allTimeMemberPlayCount;
  const allTimeAnonymous =
    props.snapshot.audienceSplit.allTimeAnonymousPlayCount;
  const recentMember = props.snapshot.audienceSplit.recent30dMemberPlayCount;
  const recentAnonymous =
    props.snapshot.audienceSplit.recent30dAnonymousPlayCount;

  const allTimeTotal = allTimeMember + allTimeAnonymous;
  const recentTotal = recentMember + recentAnonymous;

  const allTimeMemberPct = percentage(allTimeMember, allTimeTotal);
  const allTimeAnonPct = percentage(allTimeAnonymous, allTimeTotal);
  const recentMemberPct = percentage(recentMember, recentTotal);
  const recentAnonPct = percentage(recentAnonymous, recentTotal);

  const Row = (row: {
    label: string;
    member: number;
    anonymous: number;
    memberPct: number;
    anonymousPct: number;
  }) => (
    <div
      style={{
        display: "grid",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: FONT_SIZE_UI,
            color: TEXT_PRIMARY,
            fontWeight: 700,
          }}
        >
          {row.label}
        </div>
        <div
          style={{
            fontSize: FONT_SIZE_UI,
            color: TEXT_MUTED,
          }}
        >
          {formatNumber(row.member + row.anonymous)} total plays
        </div>
      </div>

      <div
        style={{
          height: 14,
          width: "100%",
          borderRadius: 999,
          overflow: "hidden",
          background: BG_ACCENT,
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${row.memberPct}%`,
            background: BG_MEMBER,
          }}
        />
        <div
          style={{
            width: `${row.anonymousPct}%`,
            background: BG_ANON,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <div
          style={{
            border: PANEL_BORDER,
            borderRadius: 12,
            padding: "10px 12px",
            background: BG_INSET,
            display: "grid",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: TEXT_FAINT,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Members
          </div>
          <div
            style={{
              fontSize: 16,
              color: TEXT_PRIMARY,
              fontWeight: 800,
            }}
          >
            {formatNumber(row.member)}
          </div>
          <div
            style={{
              fontSize: FONT_SIZE_UI,
              color: TEXT_MUTED,
            }}
          >
            {row.memberPct.toFixed(1)}%
          </div>
        </div>

        <div
          style={{
            border: PANEL_BORDER,
            borderRadius: 12,
            padding: "10px 12px",
            background: BG_INSET,
            display: "grid",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: TEXT_FAINT,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Anonymous
          </div>
          <div
            style={{
              fontSize: 16,
              color: TEXT_PRIMARY,
              fontWeight: 800,
            }}
          >
            {formatNumber(row.anonymous)}
          </div>
          <div
            style={{
              fontSize: FONT_SIZE_UI,
              color: TEXT_MUTED,
            }}
          >
            {row.anonymousPct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SectionCard
      title="Qualified play audience split"
      subtitle="Signed-in and anonymous qualified plays shown as a provenance split for all-time activity and the last 30 days."
    >
      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        {Row({
          label: "All time",
          member: allTimeMember,
          anonymous: allTimeAnonymous,
          memberPct: allTimeMemberPct,
          anonymousPct: allTimeAnonPct,
        })}

        {Row({
          label: "Past 30 days",
          member: recentMember,
          anonymous: recentAnonymous,
          memberPct: recentMemberPct,
          anonymousPct: recentAnonPct,
        })}
      </div>
    </SectionCard>
  );
}