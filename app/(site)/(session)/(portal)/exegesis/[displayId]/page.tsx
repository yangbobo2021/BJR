// web/app/(site)/(session)/(portal)/exegesis/[displayId]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ displayId: string }>;
}): Promise<Metadata> {
  const { displayId } = await props.params;
  const resolvedDisplayId = decodeURIComponent(displayId ?? "").trim() || "";

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const canonicalPath = `/exegesis/${encodeURIComponent(resolvedDisplayId)}`;
  const canonical = appUrl ? `${appUrl}${canonicalPath}` : canonicalPath;

  return {
    title: resolvedDisplayId || "Exegesis",
    alternates: { canonical },
  };
}

export default function ExegesisTrackCanonicalPage() {
  // Canonical URL surface only.
  // Actual render happens in /(session)/@runtime/exegesis/[displayId]/page.tsx.
  return null;
}
