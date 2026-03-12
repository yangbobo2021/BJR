"use client";

import Image from "next/image";
import React from "react";
import type { BadgeDefinitionOption } from "../_lib/badgeDashboardTypes";
import { getBadgeCardBorder } from "../_lib/badgeDashboardUtils";

type Props = {
  badges: BadgeDefinitionOption[];
  selectedEntitlementKey: string;
  onSelectEntitlementKey: (entitlementKey: string) => void;
};

export function BadgeCatalogueSection(props: Props) {
  const { badges, selectedEntitlementKey, onSelectEntitlementKey } = props;

  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
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
          <h2 style={{ margin: 0, fontSize: 20 }}>Badge catalogue</h2>
          <p style={{ margin: 0, opacity: 0.72 }}>
            Browse active badge definitions and select one to preview or award.
          </p>
        </div>

        <span style={{ opacity: 0.72 }}>
          {badges.length.toLocaleString()} active badge
          {badges.length === 1 ? "" : "s"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        {badges.length === 0 ? (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              opacity: 0.8,
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
                  background: isSelected
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.03)",
                  color: "inherit",
                  textAlign: "left",
                  border: getBadgeCardBorder(isSelected, badge.featured),
                  borderRadius: 16,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                  cursor: "pointer",
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
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong style={{ lineHeight: 1.2 }}>{badge.title}</strong>
                    <span style={{ opacity: 0.68, fontSize: 12 }}>
                      {badge.entitlementKey}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {badge.featured ? (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 7px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          opacity: 0.85,
                        }}
                      >
                        Featured
                      </span>
                    ) : null}

                    {badge.shareable ? (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 7px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          opacity: 0.85,
                        }}
                      >
                        Shareable
                      </span>
                    ) : null}
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
                      opacity: 0.55,
                      fontSize: 12,
                    }}
                  >
                    No image
                  </div>
                )}

                <div style={{ display: "grid", gap: 6 }}>
                  {badge.description ? (
                    <span style={{ opacity: 0.8, lineHeight: 1.4 }}>
                      {badge.description}
                    </span>
                  ) : (
                    <span style={{ opacity: 0.5 }}>No description</span>
                  )}

                  <span style={{ opacity: 0.6, fontSize: 12 }}>
                    Display order: {badge.displayOrder}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}