// web/lib/badgeAutoAward.ts
import "server-only";

import { sql } from "@vercel/postgres";
import {
  getAutoAwardBadgeDefinitions,
  type BadgeDefinition,
} from "@/lib/badges";
import { grantEntitlement } from "@/lib/entitlementOps";

export type AutoBadgeTriggerKind =
  | "playback_aggregate_updated"
  | "exegesis_contribution_created"
  | "exegesis_vote_updated"
  | "public_name_unlocked";

export type NewlyAwardedBadge = {
  entitlementKey: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  shareable: boolean;
  unlockedAt: string;
};

export type RunAutoBadgeAwardsForMemberInput = {
  memberId: string;
  trigger: AutoBadgeTriggerKind;
  recordingId?: string | null;
  grantedBy?: string;
  correlationId?: string | null;
};

function asNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function isTriggerRelevant(
  badge: BadgeDefinition,
  trigger: AutoBadgeTriggerKind,
  recordingId?: string | null,
): boolean {
  const mode = badge.autoAward?.qualificationMode;

  if (!mode) return false;

  switch (mode) {
    case "minutes_streamed":
    case "play_count":
    case "complete_count":
      return trigger === "playback_aggregate_updated";

    case "recording_minutes_streamed":
    case "recording_play_count":
    case "recording_complete_count":
      return (
        trigger === "playback_aggregate_updated" &&
        typeof recordingId === "string" &&
        recordingId.trim().length > 0 &&
        badge.autoAward?.recordingId === recordingId.trim()
      );

    case "exegesis_contribution_count":
      return trigger === "exegesis_contribution_created";

    case "exegesis_vote_tally":
      return trigger === "exegesis_vote_updated";

    case "public_name_unlocked":
      return (
        trigger === "public_name_unlocked" ||
        trigger === "exegesis_contribution_created"
      );

    default:
      return false;
  }
}

async function qualifiesForBadge(
  badge: BadgeDefinition,
  memberId: string,
): Promise<boolean> {
  const autoAward = badge.autoAward;
  const mode = autoAward?.qualificationMode;

  if (!autoAward || !mode) return false;

  switch (mode) {
    case "minutes_streamed": {
      const minMinutes = Math.max(0, Math.floor(autoAward.minMinutes ?? 0));
      const minListenedMs = minMinutes * 60_000;

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_listen_totals
        where member_id = ${memberId}::uuid
          and listened_ms >= ${minListenedMs}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "play_count": {
      const minPlayCount = Math.max(0, Math.floor(autoAward.minPlayCount ?? 0));

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_listen_totals
        where member_id = ${memberId}::uuid
          and play_count >= ${minPlayCount}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "complete_count": {
      const minCompletedCount = Math.max(
        0,
        Math.floor(autoAward.minCompletedCount ?? 0),
      );

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_listen_totals
        where member_id = ${memberId}::uuid
          and completed_count >= ${minCompletedCount}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "recording_minutes_streamed": {
      const recordingId = autoAward.recordingId?.trim() ?? "";
      const minMinutes = Math.max(0, Math.floor(autoAward.minMinutes ?? 0));
      const minListenedMs = minMinutes * 60_000;

      if (!recordingId) return false;

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_track_listen_stats
        where member_id = ${memberId}::uuid
          and recording_id = ${recordingId}
          and listened_ms >= ${minListenedMs}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "recording_play_count": {
      const recordingId = autoAward.recordingId?.trim() ?? "";
      const minPlayCount = Math.max(0, Math.floor(autoAward.minPlayCount ?? 0));

      if (!recordingId) return false;

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_track_listen_stats
        where member_id = ${memberId}::uuid
          and recording_id = ${recordingId}
          and play_count >= ${minPlayCount}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "recording_complete_count": {
      const recordingId = autoAward.recordingId?.trim() ?? "";
      const minCompletedCount = Math.max(
        0,
        Math.floor(autoAward.minCompletedCount ?? 0),
      );

      if (!recordingId) return false;

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from member_track_listen_stats
        where member_id = ${memberId}::uuid
          and recording_id = ${recordingId}
          and completed_count >= ${minCompletedCount}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "exegesis_contribution_count": {
      const minContributionCount = Math.max(
        0,
        Math.floor(autoAward.minContributionCount ?? 0),
      );

      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from exegesis_identity
        where member_id = ${memberId}::uuid
          and contribution_count >= ${minContributionCount}
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "exegesis_vote_tally": {
      const minVoteCount = Math.max(0, Math.floor(autoAward.minVoteCount ?? 0));

      const res = await sql<{ vote_count: string | number }>`
        select coalesce(sum(vote_count), 0) as vote_count
        from exegesis_comment
        where created_by_member_id = ${memberId}::uuid
          and status = 'live'
      `;

      return asNumber(res.rows[0]?.vote_count) >= minVoteCount;
    }

    case "public_name_unlocked": {
      const res = await sql<{ count: string | number }>`
        select count(*) as count
        from exegesis_identity
        where member_id = ${memberId}::uuid
          and public_name_unlocked_at is not null
      `;

      return asNumber(res.rows[0]?.count) > 0;
    }

    case "joined_within_window":
    case "active_within_window":
      return false;
  }
}

export async function runAutoBadgeAwardsForMember(
  input: RunAutoBadgeAwardsForMemberInput,
): Promise<NewlyAwardedBadge[]> {
  const allAutoBadges = await getAutoAwardBadgeDefinitions();

  const relevantBadges = allAutoBadges.filter((badge) =>
    isTriggerRelevant(badge, input.trigger, input.recordingId),
  );

  if (relevantBadges.length === 0) {
    return [];
  }

  const newlyAwarded: NewlyAwardedBadge[] = [];

  for (const badge of relevantBadges) {
    const qualifies = await qualifiesForBadge(badge, input.memberId);

    if (!qualifies) {
      continue;
    }

    const grantResult = await grantEntitlement({
      memberId: input.memberId,
      entitlementKey: badge.entitlementKey,
      scopeId: null,
      grantedBy: input.grantedBy ?? "system",
      grantReason: `Automatic badge award via ${input.trigger}.`,
      grantSource: "badge_auto_rule",
      grantSourceRef: `${badge.entitlementKey}:${input.trigger}`,
      correlationId: input.correlationId ?? null,
    });

    if (grantResult.status !== "inserted") {
      continue;
    }

    newlyAwarded.push({
      entitlementKey: badge.entitlementKey,
      title: badge.title,
      description: badge.description,
      imageUrl: badge.imageUrl,
      shareable: badge.shareable,
      unlockedAt: new Date().toISOString(),
    });
  }

  return newlyAwarded;
}