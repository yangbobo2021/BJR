"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  ADMIN_PANELS,
  getAdminPanel,
  type AdminPanelId,
} from "./adminPanels";

type Props = {
  open: boolean;
  activePanel: AdminPanelId;
  onClose: () => void;
  onSelectPanel: (panel: AdminPanelId) => void;
};

export default function AdminOverlayShell(props: Props) {
  const { open, activePanel, onClose, onSelectPanel } = props;

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const panel = getAdminPanel(activePanel);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 100000,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(1040px, 100%)",
          height: "min(78vh, 760px)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(10,10,12,0.85)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto auto",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 650, opacity: 0.92 }}>
              {panel.modalTitle}
            </div>
            <div style={{ fontSize: 11, opacity: 0.62 }}>
              Admin panel (server page inside iframe)
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {ADMIN_PANELS.map((item) => {
              const active = item.id === activePanel;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPanel(item.id)}
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: active
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.90)",
                    cursor: "pointer",
                    fontSize: 12,
                    opacity: active ? 1 : 0.78,
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.pillLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.90)",
              cursor: "pointer",
              lineHeight: 0,
              flex: "0 0 auto",
            }}
          >
            ×
          </button>
        </div>

        <iframe
          title={panel.modalTitle}
          src={panel.src}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            background: "transparent",
          }}
        />
      </div>
    </div>,
    document.body,
  );
}