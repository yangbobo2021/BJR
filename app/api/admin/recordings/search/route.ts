import { NextResponse } from "next/server";
import { requireAdminMemberId } from "@/lib/adminAuth";
import { searchRecordingsForAdmin } from "@/lib/albums";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asLimit(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(25, Math.floor(value)));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(25, Math.floor(parsed)));
    }
  }

  return undefined;
}

export async function GET(request: Request) {
  try {
    await requireAdminMemberId();

    const { searchParams } = new URL(request.url);
    const query = asString(searchParams.get("q"));
    const limit = asLimit(searchParams.get("limit"));

    if (!query) {
      return NextResponse.json({
        ok: true,
        query: "",
        results: [],
      });
    }

    const results = await searchRecordingsForAdmin({
      query,
      limit,
    });

    return NextResponse.json({
      ok: true,
      query,
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to search recordings.";

    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}