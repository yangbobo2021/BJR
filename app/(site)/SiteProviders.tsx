// web/app/(site)/SiteProviders.tsx
"use client";

import React from "react";
import PlayerHost from "./PlayerHost";
import AdminDebugBar from "@/app/home/AdminDebugBar";
import { MembershipModalProvider } from "@/app/home/MembershipModalProvider";
import { GateBrokerProvider } from "@/app/home/gating/GateBroker";

export default function SiteProviders(props: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <GateBrokerProvider>
      <MembershipModalProvider>
        <PlayerHost>
          {props.isAdmin ? <AdminDebugBar isAdmin={props.isAdmin} /> : null}
          {props.children}
        </PlayerHost>
      </MembershipModalProvider>
    </GateBrokerProvider>
  );
}