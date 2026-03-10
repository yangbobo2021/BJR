// web/app/(site)/(session)/album/[slug]/track/[displayId]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; displayId: string }>;
}): Promise<Metadata> {
  const { slug, displayId } = await props.params;

  const decodedSlug = decodeURIComponent((slug ?? "").trim());
  const decodedDisplayId = decodeURIComponent((displayId ?? "").trim());

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const canonicalPath = `/${encodeURIComponent(decodedSlug)}/${encodeURIComponent(decodedDisplayId)}`;
  const canonical = appUrl ? `${appUrl}${canonicalPath}` : canonicalPath;

  return {
    title: decodedDisplayId || decodedSlug || "Track",
    alternates: { canonical },
    openGraph: {
      title: decodedDisplayId || decodedSlug || "Track",
      url: canonical,
    },
    twitter: {
      title: decodedDisplayId || decodedSlug || "Track",
    },
  };
}

export default function AlbumTrackCanonicalPage() {
  // Canonical URL surface only.
  // Actual render happens in /(session)/@runtime/album/[slug]/track/[displayId]/page.tsx.
  return null;
}
