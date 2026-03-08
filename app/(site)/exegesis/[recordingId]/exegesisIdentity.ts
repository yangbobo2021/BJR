// web/app/(site)/exegesis/[recordingId]/exegesisIdentity.ts
import type { IdentityDTO } from "./exegesisTypes";

export const ADMIN_DISPLAY_NAME = "Brendan John Roch";

export type ResolvedAuthorIdentity = {
  memberId: string;
  isAdmin: boolean;
  displayName: string;
  hasClaimedPublicName: boolean;
  canClaimName: boolean;
};

function fallbackDisplayName(identity?: IdentityDTO): string {
  if (!identity) return "Anonymous";
  return identity.publicName || identity.anonLabel || "Anonymous";
}

export function resolveViewerAuthorIdentity(opts: {
  identity?: IdentityDTO;
  canClaimName: boolean;
}): ResolvedAuthorIdentity | null {
  const { identity, canClaimName } = opts;
  if (!identity) return null;

  const isAdmin = identity.isAdmin === true;
  const hasClaimedPublicName = !isAdmin && Boolean(identity.publicName);

  return {
    memberId: identity.memberId,
    isAdmin,
    displayName: isAdmin ? ADMIN_DISPLAY_NAME : fallbackDisplayName(identity),
    hasClaimedPublicName,
    canClaimName: !isAdmin && canClaimName,
  };
}

export function resolveCommentAuthorIdentity(
  identity?: IdentityDTO,
): ResolvedAuthorIdentity {
  const isAdmin = identity?.isAdmin === true;

  return {
    memberId: identity?.memberId ?? "",
    isAdmin,
    displayName: isAdmin ? ADMIN_DISPLAY_NAME : fallbackDisplayName(identity),
    hasClaimedPublicName: !isAdmin && Boolean(identity?.publicName),
    canClaimName: false,
  };
}