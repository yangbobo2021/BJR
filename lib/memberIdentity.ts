// web/lib/memberIdentity.ts
/**
 * Transitional adapter used by the Exegesis UI.
 *
 * This represents the legacy "identity facts" shape that the
 * Exegesis client expects. It is composed from canonical
 * member identity plus Exegesis-local progress.
 *
 * New server logic should prefer:
 *   CanonicalMemberIdentity
 *   ExegesisIdentityProgress
 *   MemberIdentityState
 */
export type ExegesisIdentityFacts = {
  memberId: string;
  anonLabel: string;
  publicName: string | null;
  publicNameUnlockedAt: string | null;
  contributionCount: number;
  isAdmin: boolean;
};

export type CanonicalMemberIdentity = {
  memberId: string;
  anonLabel: string;
  publicName: string | null;
  publicNameClaimedAt: string | null;
  isAdmin: boolean;
};

export type MemberIdentityCapability = {
  canClaimName: boolean;
  hasClaimedPublicName: boolean;
  unlockSource: "none" | "exegesis";
  unlockReason: string | null;
};

export type ExegesisIdentityProgress = {
  contributionCount: number;
  publicNameUnlockedAt: string | null;
};

export const ADMIN_DISPLAY_NAME = "Brendan John Roch";

export type ResolvedDisplayIdentity = {
  memberId: string;
  displayName: string;
  isAdmin: boolean;
  hasClaimedPublicName: boolean;
  canClaimName: boolean;
};

export type MemberIdentityState = {
  canonical: CanonicalMemberIdentity;
  capability: MemberIdentityCapability;
  resolved: ResolvedDisplayIdentity;
  exegesisProgress: ExegesisIdentityProgress | null;
};

function fallbackDisplayName(identity?: ExegesisIdentityFacts): string {
  if (!identity) return "Anonymous";
  return identity.publicName || identity.anonLabel || "Anonymous";
}

function fallbackCanonicalDisplayName(
  identity?: CanonicalMemberIdentity,
): string {
  if (!identity) return "Anonymous";
  return identity.publicName || identity.anonLabel || "Anonymous";
}

export function resolveCanonicalDisplayIdentity(params: {
  canonical: CanonicalMemberIdentity;
  capability: MemberIdentityCapability;
}): ResolvedDisplayIdentity {
  const { canonical, capability } = params;

  return {
    memberId: canonical.memberId,
    displayName: canonical.isAdmin
      ? ADMIN_DISPLAY_NAME
      : fallbackCanonicalDisplayName(canonical),
    isAdmin: canonical.isAdmin,
    hasClaimedPublicName: capability.hasClaimedPublicName,
    canClaimName: canonical.isAdmin ? false : capability.canClaimName,
  };
}

export function resolveViewerDisplayIdentity(opts: {
  identity?: ExegesisIdentityFacts;
  canClaimName: boolean;
}): ResolvedDisplayIdentity | null {
  const { identity, canClaimName } = opts;
  if (!identity) return null;

  const isAdmin = identity.isAdmin === true;
  const hasClaimedPublicName = !isAdmin && Boolean(identity.publicName);

  return {
    memberId: identity.memberId,
    displayName: isAdmin ? ADMIN_DISPLAY_NAME : fallbackDisplayName(identity),
    isAdmin,
    hasClaimedPublicName,
    canClaimName: !isAdmin && canClaimName,
  };
}

export function resolveAuthorDisplayIdentity(
  identity?: ExegesisIdentityFacts,
): ResolvedDisplayIdentity {
  const isAdmin = identity?.isAdmin === true;

  return {
    memberId: identity?.memberId ?? "",
    displayName: isAdmin ? ADMIN_DISPLAY_NAME : fallbackDisplayName(identity),
    isAdmin,
    hasClaimedPublicName: !isAdmin && Boolean(identity?.publicName),
    canClaimName: false,
  };
}
