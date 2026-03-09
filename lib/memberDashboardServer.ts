// web/lib/memberDashboardServer.ts
import "server-only";

import {
  emptyPortalMemberSummary,
  type MemberDashboardBadge,
  type PortalMemberFavouriteTrack,
  type PortalMemberSummary,
} from "@/lib/memberDashboard";
import { buildMemberIdentityState } from "@/lib/memberIdentityServer";

async function getDashboardContributionCount(
  memberId: string,
): Promise<number | null> {
  const identityState = await buildMemberIdentityState(memberId);
  return identityState.exegesisProgress?.contributionCount ?? null;
}

async function getDashboardMinutesStreamed(
  _memberId: string,
): Promise<number | null> {
  return null;
}

async function getDashboardFavouriteTrack(
  _memberId: string,
): Promise<PortalMemberFavouriteTrack | null> {
  return null;
}

async function getUnlockedDashboardBadges(
  _memberId: string,
): Promise<MemberDashboardBadge[]> {
  return [];
}

export async function buildPortalMemberSummary(
  memberId: string,
): Promise<PortalMemberSummary> {
  const identityState = await buildMemberIdentityState(memberId);

  const [contributionCount, minutesStreamed, favouriteTrack, badges] =
    await Promise.all([
      getDashboardContributionCount(memberId),
      getDashboardMinutesStreamed(memberId),
      getDashboardFavouriteTrack(memberId),
      getUnlockedDashboardBadges(memberId),
    ]);

  return {
    ...emptyPortalMemberSummary(),
    identity: identityState.resolved,
    contributionCount,
    minutesStreamed,
    favouriteTrack,
    badges,
  };
}
