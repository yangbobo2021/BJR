// web/app/(site)/(session)/@runtime/album/[slug]/page.tsx
import React from "react";
import SessionRuntime from "../../SessionRuntime";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AlbumRuntimePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const s = decodeURIComponent(slug ?? "").trim();
  return <SessionRuntime albumSlugOverride={s || null} />;
}