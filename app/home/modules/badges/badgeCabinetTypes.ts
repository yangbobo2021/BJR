// web/app/home/modules/badges/badgeCabinetTypes.ts
import type { MemberDashboardBadge } from "@/lib/memberDashboard";

export type BadgeCabinetInputBadge = MemberDashboardBadge;

export type BadgeCabinetItemModel = {
  key: string;
  label: string;
  description: string | null;
  imageUrl: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
  editorialOrder: number;
  partition: "unlocked" | "locked";
  titleText: string;
  shareable: boolean;
  undisclosed: boolean;
};