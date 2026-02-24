// web/app/(site)/(session)/album/[slug]/page.tsx
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const canonical = appUrl
    ? `${appUrl}/album/${encodeURIComponent(slug)}`
    : `/album/${encodeURIComponent(slug)}`;

  return {
    title: slug,
    alternates: { canonical },
  };
}

export default async function AlbumCanonicalPage() {
  // Render happens in /(session)/@runtime/album/[slug]/page.tsx
  // This file exists for canonical URL + metadata.
  return null;
}