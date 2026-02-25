// web/app/(site)/(session)/@runtime/exegesis/page.tsx
import React from "react";
import SessionRuntime from "../SessionRuntime";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PortalExegesisIndexRuntimePage() {
  return <SessionRuntime albumSlugOverride={null} />;
}