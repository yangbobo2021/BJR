// web/app/(site)/(session)/@runtime/exegesis/[trackId]/page.tsx
import React from "react";
import SessionRuntime from "../../SessionRuntime";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PortalExegesisTrackRuntimePage() {
  // Server doesn’t need trackId; PortalExegesis module reads it from pathname
  // and pins via your followPlayer={false} portal route handler logic.
  return <SessionRuntime albumSlugOverride={null} />;
}