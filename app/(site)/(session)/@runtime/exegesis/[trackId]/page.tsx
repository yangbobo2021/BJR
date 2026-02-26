// web/app/(site)/(session)/@runtime/exegesis/[trackId]/page.tsx
import React from "react";
import SessionRuntime from "../../SessionRuntime";

export const dynamic = "auto";
export const revalidate = 0;

export default async function PortalExegesisTrackRuntimePage(props: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await props.params;

  // Decode once, here, on the server — so the client doesn’t “discover” it later.
  const raw = decodeURIComponent(trackId ?? "").trim();
  const resolvedTrackId = raw || trackId;

  return (
    <SessionRuntime
      albumSlugOverride={null}
      initialPortalTabId="exegesis"
      initialExegesisTrackId={resolvedTrackId}
    />
  );
}