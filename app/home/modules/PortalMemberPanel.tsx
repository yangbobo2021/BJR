// web/app/home/modules/PortalMemberPanel.tsx
"use client";

import Image from "next/image";
import React from "react";
import type { PortalMemberSummary } from "@/lib/memberDashboard";

type Props = {
  summary: PortalMemberSummary;
  title?: string;
};

const GREETING_PREFIXES = [
  "Welcome back, ",
  "Good to see you again, ",
  "This is your day, ",
  "Contemplate the world, ",
  "We've been expecting you, ",
  "Another moment in time, ",
] as const;

function formatUnlockedAt(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function useRotatingGreetingPrefix(intervalMs = 4800): string {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (GREETING_PREFIXES.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % GREETING_PREFIXES.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return GREETING_PREFIXES[index] ?? GREETING_PREFIXES[0];
}

function MetricRow(props: {
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
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 15,
          lineHeight: 1.35,
          opacity: muted ? 0.56 : 0.9,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BadgeTooltip(props: {
  label: string;
  description?: string | null;
  unlocked: boolean;
  unlockedAt?: string | null;
}) {
  const { label, description, unlocked, unlockedAt } = props;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "calc(100% + 10px)",
        transform: "translateX(-50%) translateY(4px)",
        minWidth: 140,
        maxWidth: 220,
        padding: "9px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(10,10,12,0.96)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.34)",
        display: "grid",
        gap: 4,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 160ms ease, transform 160ms ease",
        zIndex: 20,
      }}
      className="portal-member-badge-tooltip"
    >
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.25,
          fontWeight: 600,
          color: "rgba(255,255,255,0.95)",
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </div>

      {description ? (
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.72)",
            overflowWrap: "anywhere",
          }}
        >
          {description}
        </div>
      ) : null}

      <div
        style={{
          fontSize: 10,
          lineHeight: 1.25,
          color: unlocked
            ? "rgba(255,255,255,0.58)"
            : "rgba(255,255,255,0.48)",
        }}
      >
        {unlocked
          ? unlockedAt
            ? `Unlocked ${unlockedAt}`
            : "Unlocked"
          : "Not yet unlocked"}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "100%",
          width: 8,
          height: 8,
          background: "rgba(10,10,12,0.96)",
          borderRight: "1px solid rgba(255,255,255,0.10)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          transform: "translateX(-50%) rotate(45deg)",
          marginTop: -4,
        }}
      />
    </div>
  );
}

function BadgeRow(props: { badges: PortalMemberSummary["badges"] }) {
  const { badges } = props;

  if (badges.length === 0) return null;

  return (
    <>
      <style jsx>{`
        .portal-member-badge-wrap:hover .portal-member-badge-tooltip,
        .portal-member-badge-wrap:focus-within .portal-member-badge-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(44px, 1fr))",
          gap: 8,
          alignItems: "start",
        }}
      >
        {badges.map((badge) => {
          const unlockedAt = badge.unlocked
            ? formatUnlockedAt(badge.unlockedAt)
            : null;

          return (
            <div
              key={badge.key}
              className="portal-member-badge-wrap"
              style={{
                position: "relative",
                display: "grid",
                justifyItems: "center",
                minWidth: 0,
              }}
            >
              <div
                tabIndex={0}
                aria-label={
                  badge.unlocked
                    ? unlockedAt
                      ? `${badge.label}. Unlocked ${unlockedAt}.`
                      : `${badge.label}. Unlocked.`
                    : `${badge.label}. Locked.`
                }
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 52,
                  aspectRatio: "1 / 1",
                  borderRadius: 999,
                  overflow: "hidden",
                  border: badge.unlocked
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: badge.imageUrl
                    ? "rgba(255,255,255,0.05)"
                    : badge.unlocked
                      ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.055) 58%, rgba(255,255,255,0.02) 100%)"
                      : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 58%, rgba(255,255,255,0.01) 100%)",
                  boxShadow: badge.unlocked
                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 5px 14px rgba(0,0,0,0.18)"
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  opacity: badge.unlocked ? 1 : 0.42,
                  outline: "none",
                }}
              >
                {badge.imageUrl ? (
                  <Image
                    src={badge.imageUrl}
                    alt={badge.label}
                    fill
                    sizes="52px"
                    style={{
                      objectFit: "cover",
                      display: "block",
                      filter: badge.unlocked
                        ? "none"
                        : "grayscale(1) saturate(0.35)",
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                      opacity: badge.unlocked ? 0.72 : 0.45,
                    }}
                  >
                    ✦
                  </div>
                )}

                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: badge.unlocked
                      ? "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.18) 100%)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 42%, rgba(0,0,0,0.32) 100%)",
                  }}
                />

                {!badge.unlocked ? (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(0,0,0,0.18)",
                      fontSize: 8,
                      letterSpacing: 0.35,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.88)",
                    }}
                  >
                    Locked
                  </div>
                ) : null}
              </div>

              <BadgeTooltip
                label={badge.label}
                description={badge.description}
                unlocked={badge.unlocked}
                unlockedAt={unlockedAt}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function PortalMemberPanel(props: Props) {
  const { summary, title = "Member" } = props;

  const greetingPrefix = useRotatingGreetingPrefix();
  const displayName = summary.identity?.displayName?.trim() || "Anonymous";
  const contributionCount = summary.contributionCount;
  const minutesStreamed = summary.minutesStreamed;
  const favouriteTrack = summary.favouriteTrack;
  const badges = summary.badges.filter(
    (badge) =>
      typeof badge.label === "string" &&
      badge.label.trim().length > 0 &&
      typeof badge.key === "string" &&
      badge.key.trim().length > 0,
  );

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
              fontSize: 24,
              lineHeight: 1,
              letterSpacing: -0.02,
              opacity: 0.95,
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {greetingPrefix}
            {displayName}
          </div>

          <div style={{ marginTop: 10, minWidth: 0 }}>
            <BadgeRow badges={badges} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            minWidth: 0,
          }}
        >
          <MetricRow
            label="Exegesis contributions"
            value={contributionCount ?? "—"}
            muted={contributionCount == null}
          />

          <MetricRow
            label="Minutes streamed"
            value={minutesStreamed ?? "—"}
            muted={minutesStreamed == null}
          />

          <MetricRow
            label="Favourite track"
            value={favouriteTrack ? favouriteTrack.title : "—"}
            muted={!favouriteTrack}
          />
        </div>
      </div>
    </div>
  );
}