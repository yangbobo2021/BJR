// web/app/home/modules/PortalMemberPanel.tsx
"use client";

import React from "react";
import type { PortalMemberSummary } from "@/lib/memberDashboard";

type Props = {
  summary: PortalMemberSummary;
  title?: string;
};

function StatTile(props: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  const { label, value, muted = false } = props;

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.035)",
        padding: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          opacity: 0.5,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 18,
          lineHeight: 1.15,
          opacity: muted ? 0.56 : 0.92,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BadgeRow(props: { labels: string[] }) {
  const { labels } = props;

  const lockedSilhouettes = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      {labels.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {labels.map((label) => (
            <div
              key={label}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.045)",
                padding: "7px 10px",
                fontSize: 12,
                lineHeight: 1,
                opacity: 0.86,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      ) : null}

      <div
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {lockedSilhouettes.map((index) => (
          <div
            key={index}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.06)",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0.025) 58%, rgba(255,255,255,0.01) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              opacity: 0.28,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PortalMemberPanel(props: Props) {
  const { summary, title = "Member" } = props;

  const displayName = summary.identity?.displayName?.trim() || "Anonymous";
  const contributionCount = summary.contributionCount;
  const minutesStreamed = summary.minutesStreamed;
  const favouriteTrack = summary.favouriteTrack;
  const badgeLabels = summary.badges
    .map((badge) => badge.label?.trim())
    .filter((label): label is string => Boolean(label));

  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        padding: 16,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 14,
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.2,
              opacity: 0.64,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              lineHeight: 1,
              letterSpacing: -0.02,
              opacity: 0.95,
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {displayName}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.5,
              opacity: 0.68,
            }}
          >
            {summary.identity?.isAdmin
              ? "Artist account"
              : summary.identity?.hasClaimedPublicName
                ? "Public member identity active"
                : "Community member"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            minWidth: 0,
          }}
        >
          <StatTile
            label="Exegesis contributions"
            value={contributionCount ?? "—"}
            muted={contributionCount == null}
          />

          <StatTile
            label="Minutes streamed"
            value={minutesStreamed ?? "—"}
            muted={minutesStreamed == null}
          />
        </div>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            padding: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              opacity: 0.5,
              lineHeight: 1.2,
            }}
          >
            Favourite track
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 15,
              lineHeight: 1.35,
              opacity: favouriteTrack ? 0.9 : 0.56,
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {favouriteTrack ? (
              <>
                {favouriteTrack.title}
                {favouriteTrack.artist ? ` — ${favouriteTrack.artist}` : ""}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            padding: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              opacity: 0.5,
              lineHeight: 1.2,
            }}
          >
            Badges
          </div>

          <div style={{ marginTop: 10, minWidth: 0 }}>
            <BadgeRow labels={badgeLabels} />
          </div>
        </div>
      </div>
    </div>
  );
}
