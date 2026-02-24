// web/app/(site)/exegesis/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import React from "react";
import PortalExegesis from "@/app/home/modules/PortalExegesis";

export default function ExegesisIndexPage() {
  return <PortalExegesis title="Exegesis" followPlayer={true} />;
}