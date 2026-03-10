//web/app/home/StableSessionShell.tsx
"use client";

import React from "react";
import PortalArea, { type PortalAreaProps } from "@/app/home/PortalArea";
import {
  SessionRuntimePayloadProvider,
  useSessionRuntimePayloadRecord,
} from "@/app/home/SessionRuntimePayloadContext";
import type { SessionRuntimePayload } from "@/app/home/sessionRuntimePayload";

function toPortalAreaProps(payload: SessionRuntimePayload): PortalAreaProps {
  return {
    portalPanel: payload.portalPanel,
    topLogoUrl: payload.topLogoUrl ?? null,
    topLogoHeight: payload.topLogoHeight ?? null,
    initialPortalTabId: payload.initialPortalTabId ?? null,
    initialExegesisDisplayId: payload.initialExegesisDisplayId ?? null,
    bundle: payload.bundle,
    albums: payload.albums,
    attentionMessage: payload.attentionMessage ?? null,
    tier: payload.tier ?? null,
    isPatron: payload.isPatron ?? false,
    canManageBilling: payload.canManageBilling ?? false,
  };
}

function StableSessionViewport(props: { runtime: React.ReactNode }) {
  const record = useSessionRuntimePayloadRecord();
  const payload = record?.payload ?? null;

  const portalAreaProps = React.useMemo(
    () => (payload ? toPortalAreaProps(payload) : null),
    [payload],
  );

  return (
    <>
      <div aria-hidden="true" hidden>
        {props.runtime}
      </div>

      {portalAreaProps ? <PortalArea {...portalAreaProps} /> : null}
    </>
  );
}

export default function StableSessionShell(props: {
  runtime: React.ReactNode;
}) {
  return (
    <SessionRuntimePayloadProvider>
      <StableSessionViewport runtime={props.runtime} />
    </SessionRuntimePayloadProvider>
  );
}
