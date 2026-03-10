//web/app/home/sessionRuntimePayload.ts
import type { AlbumNavItem, AlbumPlayerBundle } from "@/lib/types";

/**
 * Server → persistent session shell payload contract.
 *
 * This is intentionally distinct from PortalAreaProps.
 * The runtime layer delivers route payload; the shell decides how to
 * reconcile that payload into concrete component props.
 */
export type SessionRuntimePayload = {
  portalPanel: React.ReactNode;
  topLogoUrl?: string | null;
  topLogoHeight?: number | null;
  initialPortalTabId?: string | null;
  initialExegesisDisplayId?: string | null;
  bundle: AlbumPlayerBundle;
  albums: AlbumNavItem[];
  attentionMessage?: string | null;
  tier?: string | null;
  isPatron?: boolean;
  canManageBilling?: boolean;
};
