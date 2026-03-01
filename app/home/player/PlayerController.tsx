// web/app/home/player/PlayerController.tsx
"use client";

import React from "react";
import FullPlayer from "./FullPlayer";
import type { AlbumPlayerBundle, AlbumNavItem, Tier } from "@/lib/types";
import StageOverlay from "./stage/StageOverlay";

export default function PlayerController(props: {
  openPlayerPanel: () => void;
  bundle: AlbumPlayerBundle;
  albums: AlbumNavItem[];
  onSelectAlbum: (slug: string) => void;
  isBrowsingAlbum: boolean;
  viewerTier?: Tier;
}) {
  const {
    bundle,
    albums,
    onSelectAlbum,
    isBrowsingAlbum,
    viewerTier = "none",
  } = props;

  const [stageOpen, setStageOpen] = React.useState(false);
  const closeStage = React.useCallback(() => setStageOpen(false), []);

  return (
    <>
      <FullPlayer
        bundle={bundle}
        albums={albums}
        onSelectAlbum={onSelectAlbum}
        isBrowsingAlbum={isBrowsingAlbum}
        viewerTier={viewerTier}
      />

      <StageOverlay open={stageOpen} onClose={closeStage} />
    </>
  );
}
