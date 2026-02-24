// web/app/(site)/exegesis/[trackId]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import React from "react";
import PortalExegesis from "@/app/home/modules/PortalExegesis";

export default function ExegesisTrackPage(props: {
  params: { trackId?: string };
}) {
  const raw = props.params?.trackId ?? "";
  const trackId = decodeURIComponent(raw).trim();

  if (!trackId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-sm opacity-70">Missing trackId.</div>
      </div>
    );
  }

  // Single source of truth: PortalExegesis -> ExegesisTrackClient
  return <PortalExegesis title="Exegesis" followPlayer={false} initialTrackId={trackId} />;
}