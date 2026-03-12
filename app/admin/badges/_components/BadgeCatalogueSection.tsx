// web/app/admin/badges/_components/BadgeCatalogueSection.tsx
"use client";

import Image from "next/image";
import React from "react";
import {
  BG_INSET,
  FONT_SIZE_UI,
  PANEL_BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from "../../playback/dashboard/playbackTelemetryDashboardStyles";
import type { BadgeDefinitionOption } from "../_lib/badgeDashboardTypes";
import { getBadgeCardBorder } from "../_lib/badgeDashboardUtils";

type Props = {
  badges: BadgeDefinitionOption[];
  selectedEntitlementKey: string;
  onSelectEntitlementKey: (entitlementKey: string) => void;
};

function FlagPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        height: 22,
        padding: "0 8px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: TEXT_PRIMARY,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function BadgeCatalogueSection(props: Props) {
  const { badges, selectedEntitlementKey, onSelectEntitlementKey } = props;

  return (
    <section
      style={{
        border: PANEL_BORDER,
        borderRadius: 18,
        background: BG_INSET,
        padding: 16,
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.15,
              color: TEXT_PRIMARY,
            }}
          >
            Badge catalogue
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: FONT_SIZE_UI,
              lineHeight: 1.5,
              color: TEXT_MUTED,
              maxWidth: 760,
            }}
          >
            Browse active badge definitions and select one to preview or award.
          </p>
        </div>

        <div
          style={{
            fontSize: FONT_SIZE_UI,
            lineHeight: 1.5,
            color: TEXT_MUTED,
          }}
        >
          {badges.length.toLocaleString()} active badge
          {badges.length === 1 ? "" : "s"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {badges.length === 0 ? (
          <div
            style={{
              minHeight: 132,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              placeItems: "center",
              padding: 16,
              fontSize: FONT_SIZE_UI,
              color: TEXT_MUTED,
            }}
          >
            No active badge definitions found.
          </div>
        ) : (
          badges.map((badge) => {
            const isSelected = badge.entitlementKey === selectedEntitlementKey;

            return (
              <button
                key={badge.entitlementKey}
                type="button"
                onClick={() => onSelectEntitlementKey(badge.entitlementKey)}
                style={{
                  appearance: "none",
                  width: "100%",
                  textAlign: "left",
                  color: "inherit",
                  cursor: "pointer",
                  border: getBadgeCardBorder(isSelected, badge.featured),
                  borderRadius: 16,
                  background: isSelected
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.035)",
                  padding: 14,
                  display: "grid",
                  gap: 12,
                  boxShadow: isSelected
                    ? "0 0 0 1px rgba(255,255,255,0.03) inset"
                    : "none",
                  transition:
                    "background 160ms ease, border-color 160ms ease, transform 160ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                    <strong
                      style={{
                        lineHeight: 1.2,
                        fontSize: 14,
                        color: TEXT_PRIMARY,
                      }}
                    >
                      {badge.title}
                    </strong>
                    <span
                      style={{
                        fontSize: 12,
                        lineHeight: 1.4,
                        color: TEXT_MUTED,
                        wordBreak: "break-word",
                      }}
                    >
                      {badge.entitlementKey}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    {badge.featured ? <FlagPill>Featured</FlagPill> : null}
                    {badge.shareable ? <FlagPill>Shareable</FlagPill> : null}
                  </div>
                </div>

                {badge.imageUrl ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Image
                      src={badge.imageUrl}
                      alt={badge.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: 12,
                      border: "1px dashed rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.02)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      color: TEXT_MUTED,
                    }}
                  >
                    No image
                  </div>
                )}

                <div style={{ display: "grid", gap: 6 }}>
                  <div
                    style={{
                      fontSize: FONT_SIZE_UI,
                      lineHeight: 1.5,
                      color: badge.description ? TEXT_PRIMARY : TEXT_MUTED,
                      opacity: badge.description ? 0.88 : 1,
                    }}
                  >
                    {badge.description || "No description"}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.4,
                      color: TEXT_MUTED,
                    }}
                  >
                    Display order {badge.displayOrder}
                    {isSelected ? " • selected" : ""}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
