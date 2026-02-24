// (portal)/exegesis/[trackId]/page.tsx
import PortalExegesis from "@/app/home/modules/PortalExegesis";
export default function ExegesisTrackPage({
  params,
}: {
  params: { trackId?: string };
}) {
  const trackId = decodeURIComponent(params.trackId ?? "").trim();
  return (
    <PortalExegesis followPlayer={false} initialTrackId={trackId || null} />
  );
}
