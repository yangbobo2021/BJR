// web/app/(site)/(session)/@runtime/[tab]/page.tsx
import React from "react";
import SessionRuntime from "../SessionRuntime";

export default async function PortalRuntimePage(props: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await props.params;
  const resolvedTab = decodeURIComponent(tab ?? "").trim() || null;

  // Important: for portal routes we still want an album context to exist
  // (queue priming, stage, etc). We use featured album fallback via SessionRuntime.
  return (
    <SessionRuntime albumSlugOverride={null} initialPortalTabId={resolvedTab} />
  );
}
