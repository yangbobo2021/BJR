import type { TrendRangeKey } from "./types";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NZ").format(value);
}

export function formatHoursFromMs(value: number): string {
  const hours = value / 3_600_000;
  return hours >= 10 ? hours.toFixed(0) : hours.toFixed(1);
}

export function formatMinutesFromMs(value: number): string {
  return formatNumber(Math.floor(value / 60_000));
}

export function formatAgo(iso: string | null): string {
  if (!iso) return "—";

  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "—";

  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function ellipsisMiddle(value: string, keep = 8): string {
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

export function fmtSnapshotStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function fmtTrendTick(iso: string, range: TrendRangeKey): string {
  try {
    const date = new Date(iso);

    if (range === "hour") {
      return date.toLocaleTimeString("en-NZ", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (range === "day") {
      return date.toLocaleTimeString("en-NZ", {
        hour: "numeric",
      });
    }

    if (range === "week") {
      return date.toLocaleDateString("en-NZ", {
        weekday: "short",
      });
    }

    if (range === "month") {
      return date.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short",
      });
    }

    if (range === "year") {
      return date.toLocaleDateString("en-NZ", {
        month: "short",
      });
    }

    return date.toLocaleDateString("en-NZ", {
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatAggregateValue(
  label: string,
  value: number | null | undefined,
): string {
  if (value == null) return "—";
  if (label === "Hours listened") return formatHoursFromMs(value);
  if (label === "Minutes listened") return formatMinutesFromMs(value);
  return formatNumber(value);
}

export function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (part / total) * 100));
}