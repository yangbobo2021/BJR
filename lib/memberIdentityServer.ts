// web/lib/memberIdentityServer.ts
import "server-only";

import { sql } from "@vercel/postgres";
import type { IdentityDTO as ExegesisIdentityDTO } from "@/lib/exegesisIdentityDto";
import {
  resolveCanonicalDisplayIdentity,
  type CanonicalMemberIdentity,
  type ExegesisIdentityProgress,
  type MemberIdentityCapability,
  type MemberIdentityState,
} from "@/lib/memberIdentity";
import { stableAnonLabel } from "@/lib/exegesis/stableAnonLabel";

type DbCanonicalIdentityRow = {
  member_id: string;
  anon_label: string;
  public_name: string | null;
  public_name_claimed_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbExegesisIdentityRow = {
  member_id: string;
  contribution_count: number;
  public_name_unlocked_at: string | null;
};

const ADMIN_MEMBER_ID = (process.env.EXEGESIS_ADMIN_MEMBER_ID ?? "").trim();

function isAdminMemberId(memberId: string): boolean {
  const id = memberId.trim();
  return Boolean(id && ADMIN_MEMBER_ID && id === ADMIN_MEMBER_ID);
}

export async function ensureMemberIdentity(
  memberId: string,
): Promise<CanonicalMemberIdentity> {
  const fallbackAnonLabel = stableAnonLabel(memberId);

  const inserted = await sql<DbCanonicalIdentityRow>`
    with
    member_row as (
      select id
      from members
      where id = ${memberId}::uuid
      limit 1
    ),
    exegesis_source as (
      select
        member_id,
        anon_label,
        public_name,
        case
          when public_name is not null
            then coalesce(public_name_unlocked_at, now())
          else null
        end as public_name_claimed_at
      from exegesis_identity
      where member_id = ${memberId}::uuid
      limit 1
    )
    insert into member_identity (
      member_id,
      anon_label,
      public_name,
      public_name_claimed_at
    )
    select
      ${memberId}::uuid,
      coalesce(
        (select anon_label from exegesis_source),
        ${fallbackAnonLabel}
      ),
      (select public_name from exegesis_source),
      (select public_name_claimed_at from exegesis_source)
    where exists (select 1 from member_row)
    on conflict (member_id) do nothing
    returning
      member_id,
      anon_label,
      public_name,
      public_name_claimed_at,
      created_at,
      updated_at
  `;

  const row =
    inserted.rows[0] ??
    (
      await sql<DbCanonicalIdentityRow>`
      select
        member_id,
        anon_label,
        public_name,
        public_name_claimed_at,
        created_at,
        updated_at
      from member_identity
      where member_id = ${memberId}::uuid
      limit 1
    `
    ).rows[0];

  if (!row) {
    throw new Error(`ensureMemberIdentity: member not found for ${memberId}`);
  }

  return {
    memberId: row.member_id,
    anonLabel: row.anon_label,
    publicName: row.public_name,
    publicNameClaimedAt: row.public_name_claimed_at,
    isAdmin: isAdminMemberId(row.member_id),
  };
}

export async function getCanonicalMemberIdentity(
  memberId: string,
): Promise<CanonicalMemberIdentity | null> {
  const res = await sql<DbCanonicalIdentityRow>`
    select
      member_id,
      anon_label,
      public_name,
      public_name_claimed_at,
      created_at,
      updated_at
    from member_identity
    where member_id = ${memberId}::uuid
    limit 1
  `;

  const row = res.rows[0];
  if (!row) return null;

  return {
    memberId: row.member_id,
    anonLabel: row.anon_label,
    publicName: row.public_name,
    publicNameClaimedAt: row.public_name_claimed_at,
    isAdmin: isAdminMemberId(row.member_id),
  };
}

export async function ensureMemberIdentityBatchFromExegesis(
  memberIds: string[],
): Promise<void> {
  const ids = Array.from(
    new Set(
      memberIds
        .map((id) => id.trim())
        .filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
          ),
        ),
    ),
  );

  if (ids.length === 0) return;

  const uuidArrayLiteral = `{${ids.join(",")}}`;

  await sql`
    with
    ids as (
      select unnest(${uuidArrayLiteral}::uuid[]) as member_id
    ),
    src as (
      select
        e.member_id,
        e.anon_label,
        e.public_name,
        case
          when e.public_name is not null
            then coalesce(e.public_name_unlocked_at, now())
          else null
        end as public_name_claimed_at
      from exegesis_identity e
      join ids i on i.member_id = e.member_id
    )
    insert into member_identity (
      member_id,
      anon_label,
      public_name,
      public_name_claimed_at
    )
    select
      s.member_id,
      s.anon_label,
      s.public_name,
      s.public_name_claimed_at
    from src s
    left join member_identity mi
      on mi.member_id = s.member_id
    where mi.member_id is null
    on conflict (member_id) do nothing
  `;
}

export async function getCanonicalMemberIdentities(
  memberIds: string[],
): Promise<Record<string, CanonicalMemberIdentity>> {
  const ids = Array.from(
    new Set(
      memberIds
        .map((id) => id.trim())
        .filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
          ),
        ),
    ),
  );

  if (ids.length === 0) return {};

  const uuidArrayLiteral = `{${ids.join(",")}}`;

  const res = await sql<DbCanonicalIdentityRow>`
    select
      member_id,
      anon_label,
      public_name,
      public_name_claimed_at,
      created_at,
      updated_at
    from member_identity
    where member_id = any(${uuidArrayLiteral}::uuid[])
  `;

  const out: Record<string, CanonicalMemberIdentity> = {};

  for (const row of res.rows) {
    out[row.member_id] = {
      memberId: row.member_id,
      anonLabel: row.anon_label,
      publicName: row.public_name,
      publicNameClaimedAt: row.public_name_claimed_at,
      isAdmin: isAdminMemberId(row.member_id),
    };
  }

  return out;
}

export async function getExegesisIdentityProgress(
  memberId: string,
): Promise<ExegesisIdentityProgress | null> {
  const res = await sql<DbExegesisIdentityRow>`
    select
      member_id,
      contribution_count,
      public_name_unlocked_at
    from exegesis_identity
    where member_id = ${memberId}::uuid
    limit 1
  `;

  const row = res.rows[0];
  if (!row) return null;

  return {
    contributionCount: Number(row.contribution_count ?? 0),
    publicNameUnlockedAt: row.public_name_unlocked_at,
  };
}

function buildCapability(params: {
  canonical: CanonicalMemberIdentity;
  exegesisProgress: ExegesisIdentityProgress | null;
}): MemberIdentityCapability {
  const { canonical, exegesisProgress } = params;

  const hasClaimedPublicName = Boolean(canonical.publicName);

  if (canonical.isAdmin) {
    return {
      canClaimName: false,
      hasClaimedPublicName: false,
      unlockSource: "none",
      unlockReason: null,
    };
  }

  if (hasClaimedPublicName) {
    return {
      canClaimName: false,
      hasClaimedPublicName: true,
      unlockSource: "none",
      unlockReason: null,
    };
  }

  const unlockedByExegesis = exegesisProgress?.publicNameUnlockedAt != null;

  return {
    canClaimName: unlockedByExegesis,
    hasClaimedPublicName: false,
    unlockSource: unlockedByExegesis ? "exegesis" : "none",
    unlockReason: unlockedByExegesis
      ? "Unlocked through Exegesis contributions."
      : null,
  };
}

export async function buildExegesisIdentityDto(
  memberId: string,
): Promise<ExegesisIdentityDTO> {
  const canonical = await ensureMemberIdentity(memberId);
  const exegesisProgress = await getExegesisIdentityProgress(memberId);

  return {
    memberId: canonical.memberId,
    anonLabel: canonical.anonLabel,
    publicName: canonical.publicName,
    publicNameUnlockedAt: exegesisProgress?.publicNameUnlockedAt ?? null,
    contributionCount: exegesisProgress?.contributionCount ?? 0,
    isAdmin: canonical.isAdmin,
  };
}

export async function buildExegesisIdentityDtoMap(
  memberIds: string[],
): Promise<Record<string, ExegesisIdentityDTO>> {
  const ids = Array.from(
    new Set(
      memberIds
        .map((id) => id.trim())
        .filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
          ),
        ),
    ),
  );

  if (ids.length === 0) return {};

  await ensureMemberIdentityBatchFromExegesis(ids);

  const canonicalById = await getCanonicalMemberIdentities(ids);
  const uuidArrayLiteral = `{${ids.join(",")}}`;

  const progressRes = await sql<DbExegesisIdentityRow>`
    select
      member_id,
      contribution_count,
      public_name_unlocked_at
    from exegesis_identity
    where member_id = any(${uuidArrayLiteral}::uuid[])
  `;

  const progressById: Record<string, ExegesisIdentityProgress> = {};

  for (const row of progressRes.rows) {
    progressById[row.member_id] = {
      contributionCount: Number(row.contribution_count ?? 0),
      publicNameUnlockedAt: row.public_name_unlocked_at,
    };
  }

  const out: Record<string, ExegesisIdentityDTO> = {};

  for (const memberId of ids) {
    const canonical = canonicalById[memberId];
    if (!canonical) continue;

    const progress = progressById[memberId];

    out[memberId] = {
      memberId,
      anonLabel: canonical.anonLabel,
      publicName: canonical.publicName,
      publicNameUnlockedAt: progress?.publicNameUnlockedAt ?? null,
      contributionCount: progress?.contributionCount ?? 0,
      isAdmin: canonical.isAdmin,
    };
  }

  return out;
}

export async function buildMemberIdentityState(
  memberId: string,
): Promise<MemberIdentityState> {
  const canonical = await ensureMemberIdentity(memberId);
  const exegesisProgress = await getExegesisIdentityProgress(memberId);
  const capability = buildCapability({ canonical, exegesisProgress });
  const resolved = resolveCanonicalDisplayIdentity({ canonical, capability });

  return {
    canonical,
    capability,
    resolved,
    exegesisProgress,
  };
}
