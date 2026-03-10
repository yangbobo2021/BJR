// web/app/(site)/(session)/layout.tsx
import React from "react";
import ShadowHomeFrame from "@/app/home/ShadowHomeFrame";
import StableSessionShell from "@/app/home/StableSessionShell";
import { client } from "@/sanity/lib/client";

type SessionShellConfig = {
  topLogoUrl?: string | null;
  topLogoHeight?: number | null;
};

const sessionShellQuery = `
  *[_type == "shadowHomePage" && slug.current == $slug][0]{
    "topLogoUrl": topLogo.asset->url,
    topLogoHeight
  }
`;

export default async function SessionLayout(props: {
  // Parallel route slot:
  // we render ALL “player vs portal” runtime inside this slot.
  runtime: React.ReactNode;
}) {
  const shellConfig = await client.fetch<SessionShellConfig>(
    sessionShellQuery,
    { slug: "home" },
    { next: { tags: ["shadowHome"] } },
  );

  return (
    <ShadowHomeFrame
      lyricsOverlayZIndex={50}
      stageHeight={560}
      shadowHomeSlug="home"
    >
      <StableSessionShell
        runtime={props.runtime}
        topLogoUrl={shellConfig?.topLogoUrl ?? null}
        topLogoHeight={shellConfig?.topLogoHeight ?? null}
      />
    </ShadowHomeFrame>
  );
}
