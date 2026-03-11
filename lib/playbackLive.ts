import "server-only";

import { sql } from "@vercel/postgres";

const DEFAULT_ACTIVE_LISTENER_WINDOW_SECONDS = 30;
const MIN_ACTIVE_LISTENER_WINDOW_SECONDS = 5;
const MAX_ACTIVE_LISTENER_WINDOW_SECONDS = 120;

type ActiveListenerCountRow = {
  active_count: number | string;
};

function asSafeInt(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.floor(value) : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
  }

  return 0;
}

export function clampActiveListenerWindowSeconds(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_ACTIVE_LISTENER_WINDOW_SECONDS;
  }

  const whole = Math.floor(value);
  return Math.max(
    MIN_ACTIVE_LISTENER_WINDOW_SECONDS,
    Math.min(MAX_ACTIVE_LISTENER_WINDOW_SECONDS, whole),
  );
}

export async function getSiteActiveListenerCount(
  windowSeconds = DEFAULT_ACTIVE_LISTENER_WINDOW_SECONDS,
): Promise<number> {
  const safeWindowSeconds = clampActiveListenerWindowSeconds(windowSeconds);

  const res = await sql<ActiveListenerCountRow>`
    with recent_events as (
      select playback_id
      from member_playback_telemetry_dedupe
      where created_at >= now() - (${safeWindowSeconds} * interval '1 second')

      union all

      select playback_id
      from anonymous_playback_telemetry_dedupe
      where created_at >= now() - (${safeWindowSeconds} * interval '1 second')
    )
    select count(distinct playback_id)::int as active_count
    from recent_events
  `;

  return asSafeInt(res.rows[0]?.active_count);
}