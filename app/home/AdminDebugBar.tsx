// web/app/home/AdminDebugBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import AdminOverlayShell from "./admin/AdminOverlayShell";
import { type AdminPanelId } from "./admin/adminPanels";

const ENABLED = process.env.NEXT_PUBLIC_ADMIN_DEBUG === "1";

export default function AdminDebugBar(props: { isAdmin: boolean }) {
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminPanel, setAdminPanel] = React.useState<AdminPanelId>("access");

  function openAdmin(panel: AdminPanelId) {
    setAdminPanel(panel);
    setAdminOpen(true);
  }

  if (!ENABLED) return null;
  if (!props.isAdmin) return null;

  const btn: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(255,255,255,0.90)",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const modal = (
    <AdminOverlayShell
      open={adminOpen}
      activePanel={adminPanel}
      onClose={() => setAdminOpen(false)}
      onSelectPanel={setAdminPanel}
    />
  );

  return (
    <>
      <div
        id="af-admin-configbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "6px 12px",
          background: "rgba(10,10,14,0.88)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            opacity: 0.6,
            userSelect: "none",
          }}
        >
          Admin
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <button type="button" style={btn} onClick={() => openAdmin("access")}>
            Member Access
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => openAdmin("share_tokens")}
          >
            Share Tokens
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => openAdmin("mailbag")}
          >
            Mailbag
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => openAdmin("exegesis")}
          >
            Exegesis Mod
          </button>
          <Link
            href="/admin/campaigns"
            target="_blank"
            style={{
              ...btn,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            Campaigns
          </Link>
          <Link
            href="/studio"
            target="_blank"
            style={{
              ...btn,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            Sanity Studio
          </Link>
        </div>
      </div>

      {modal}
    </>
  );
}
