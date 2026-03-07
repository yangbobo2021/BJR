// web/app/home/player/PlayerController.tsx
"use client";

import React from "react";
import FullPlayer from "./FullPlayer";
import type { AlbumPlayerBundle, AlbumNavItem, Tier } from "@/lib/types";

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

  return (
    <FullPlayer
      bundle={bundle}
      albums={albums}
      onSelectAlbum={onSelectAlbum}
      isBrowsingAlbum={isBrowsingAlbum}
      viewerTier={viewerTier}
    />
  );
}
