import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureMemberByClerk } from "@/lib/members";
import { checkAccess } from "@/lib/access";
import { ENTITLEMENTS } from "@/lib/vocab";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: true, isAdmin: false });
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;

  if (!email) {
    return NextResponse.json({ ok: true, isAdmin: false });
  }

  const ensured = await ensureMemberByClerk({
    clerkUserId: userId,
    email,
    source: "api_admin_me_clerk",
    sourceDetail: { route: "/api/admin/me" },
  });

  const decision = await checkAccess(
    ensured.id,
    { kind: "global", required: [ENTITLEMENTS.ADMIN] },
    { log: false },
  );

  return NextResponse.json({
    ok: true,
    isAdmin: decision.allowed,
  });
}