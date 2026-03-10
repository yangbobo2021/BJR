// web/app/(site)/(session)/@runtime/exegesis/page.tsx
import React from "react";
import SessionRuntime from "../SessionRuntime";

export default async function PortalExegesisIndexRuntimePage() {
  return (
    <SessionRuntime
      albumSlugOverride={null}
      initialPortalTabId="exegesis"
      initialExegesisDisplayId={null}
    />
  );
}