//web/app/home/PortalViewerProvider.tsx
"use client";

import React from "react";
import type { Tier } from "@/lib/types";

type ViewerCtx = {
  viewerTier: Tier; // "none" | "friend" | "patron" | "partner"
  rawTier: string | null; // whatever was passed from server (for display/debug if needed)
  isSignedIn: boolean;
  isPatron: boolean;
  isPartner: boolean;

  // ✅ portal navigation state (client-owned, seeded from server/runtime)
  portalTabId: string | null;
  setPortalTabId: (next: string | null) => void;

  // ✅ exegesis pin state (client-owned, seeded from server/runtime)
  exegesisTrackId: string | null;
  setExegesisTrackId: (next: string | null) => void;
};

const PortalViewerContext = React.createContext<ViewerCtx | null>(null);

export function usePortalViewer(): ViewerCtx {
  const ctx = React.useContext(PortalViewerContext);
  if (!ctx) {
    throw new Error("usePortalViewer must be used within PortalViewerProvider");
  }
  return ctx;
}

export function PortalViewerProvider(props: {
  value: Omit<
    ViewerCtx,
    "portalTabId" | "setPortalTabId" | "exegesisTrackId" | "setExegesisTrackId"
  >;
  children: React.ReactNode;
  initialPortalTabId?: string | null;
  initialExegesisTrackId?: string | null;
}) {
  const [portalTabId, setPortalTabId] = React.useState<string | null>(
    (props.initialPortalTabId ?? null)
      ? String(props.initialPortalTabId)
      : null,
  );

  const [exegesisTrackId, setExegesisTrackId] = React.useState<string | null>(
    (props.initialExegesisTrackId ?? null)
      ? String(props.initialExegesisTrackId)
      : null,
  );

  const ctxValue: ViewerCtx = React.useMemo(
    () => ({
      ...props.value,
      portalTabId,
      setPortalTabId,
      exegesisTrackId,
      setExegesisTrackId,
    }),
    [props.value, portalTabId, exegesisTrackId],
  );

  return (
    <PortalViewerContext.Provider value={ctxValue}>
      {props.children}
    </PortalViewerContext.Provider>
  );
}
