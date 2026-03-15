// web/app/home/modules/badges/useBadgeCabinetUnlockSequence.ts
"use client";

import React from "react";
import { flushSync } from "react-dom";
import type { BadgeCabinetItemModel } from "./badgeCabinetTypes";

const BADGE_UNLOCK_TIMELINE_MS = {
  /**
   * Visual ceremony timing.
   *
   * Keep these aligned with BadgeUnlockVisualStyles.tsx.
   *
   * Current intent:
   * - spin 1 is heavy and slow
   * - colour reveal should become most legible at the end of spin 1 and into spin 2
   * - spin 2 accelerates
   * - spin 3 is fastest and resolves into the hard stop
   */
  spinStage1: 1480,
  spinStage2: 900,
  spinStage2Delay: 1480,
  spinStage3: 560,
  spinStage3Delay: 2380,
  shellSettleTotal: 3060,

  /**
   * Cabinet movement timing after the visual ceremony is complete.
   */
  cabinetFlip: 1320,
  cabinetSettle: 640,

  /**
   * Default non-unlock FLIP duration.
   */
  defaultFlip: 420,
} as const;

function getUnlockVisualDurationMs(): number {
  return Math.max(
    BADGE_UNLOCK_TIMELINE_MS.shellSettleTotal,
    BADGE_UNLOCK_TIMELINE_MS.spinStage1,
    BADGE_UNLOCK_TIMELINE_MS.spinStage2Delay +
      BADGE_UNLOCK_TIMELINE_MS.spinStage2,
    BADGE_UNLOCK_TIMELINE_MS.spinStage3Delay +
      BADGE_UNLOCK_TIMELINE_MS.spinStage3,
  );
}

const UNLOCK_VISUAL_DURATION_MS = getUnlockVisualDurationMs();

function sortBadgeCabinetItems(
  items: BadgeCabinetItemModel[],
): BadgeCabinetItemModel[] {
  const nextItems = [...items];

  nextItems.sort((a, b) => {
    if (a.partition !== b.partition) {
      return a.partition === "unlocked" ? -1 : 1;
    }

    if (a.editorialOrder !== b.editorialOrder) {
      return a.editorialOrder - b.editorialOrder;
    }

    return a.label.localeCompare(b.label);
  });

  return nextItems;
}

function buildStagedUnlockItems(
  items: BadgeCabinetItemModel[],
  previousStableItems: BadgeCabinetItemModel[],
  unlockKeys: Set<string>,
): BadgeCabinetItemModel[] {
  if (unlockKeys.size === 0) return items;

  const previousByKey = new Map(
    previousStableItems.map((item) => [item.key, item]),
  );

  const stagedItems = items.map((item) => {
    if (!unlockKeys.has(item.key)) return item;

    const previousItem = previousByKey.get(item.key);
    if (!previousItem) return item;

    return {
      ...item,
      partition: previousItem.partition,
    };
  });

  return sortBadgeCabinetItems(stagedItems);
}

type UnlockableBadgeItem = BadgeCabinetItemModel & {
  cabinetRevealPending?: boolean;
};

type Options = {
  items: UnlockableBadgeItem[];
};

type Result = {
  displayItems: UnlockableBadgeItem[];
  newlyUnlockedKeys: Set<string>;
  pendingUnlockKeys: Set<string>;
  unlockPhase: "idle" | "reveal" | "move";
  liveAnnouncement: string;
  isFlipSuspended: boolean;
  flipDurationMs: number;
  flipBaselineToken: number;
  resetUnlockSequence: () => void;
};

export function useBadgeCabinetUnlockSequence(options: Options): Result {
  const { items } = options;

  const previousUnlockedKeysRef = React.useRef<Set<string> | null>(null);
  const previousStableItemsRef = React.useRef<UnlockableBadgeItem[]>(items);

  const unlockReleaseTimeoutRef = React.useRef<number | null>(null);
  const unlockCleanupTimeoutRef = React.useRef<number | null>(null);
  const unlockReleaseRafRef = React.useRef<number | null>(null);
  const unlockReleasePaintRafRef = React.useRef<number | null>(null);

  const [newlyUnlockedKeys, setNewlyUnlockedKeys] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [pendingUnlockKeys, setPendingUnlockKeys] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [unlockPhase, setUnlockPhase] = React.useState<
    "idle" | "reveal" | "move"
  >("idle");
  const [displayItemsOverride, setDisplayItemsOverride] = React.useState<
    UnlockableBadgeItem[] | null
  >(null);
  const [isFlipSuspended, setIsFlipSuspended] = React.useState(false);
  const [flipDurationMs, setFlipDurationMs] = React.useState<number>(
    BADGE_UNLOCK_TIMELINE_MS.defaultFlip,
  );
  const [flipBaselineToken, setFlipBaselineToken] = React.useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = React.useState("");

  const clearSequenceTimers = React.useCallback(() => {
    if (unlockReleaseTimeoutRef.current !== null) {
      window.clearTimeout(unlockReleaseTimeoutRef.current);
      unlockReleaseTimeoutRef.current = null;
    }

    if (unlockCleanupTimeoutRef.current !== null) {
      window.clearTimeout(unlockCleanupTimeoutRef.current);
      unlockCleanupTimeoutRef.current = null;
    }

    if (unlockReleaseRafRef.current !== null) {
      window.cancelAnimationFrame(unlockReleaseRafRef.current);
      unlockReleaseRafRef.current = null;
    }

    if (unlockReleasePaintRafRef.current !== null) {
      window.cancelAnimationFrame(unlockReleasePaintRafRef.current);
      unlockReleasePaintRafRef.current = null;
    }
  }, []);

  const resetUnlockSequence = React.useCallback(() => {
    clearSequenceTimers();
    setNewlyUnlockedKeys(new Set());
    setPendingUnlockKeys(new Set());
    setUnlockPhase("idle");
    setDisplayItemsOverride(null);
    setIsFlipSuspended(false);
    setFlipDurationMs(BADGE_UNLOCK_TIMELINE_MS.defaultFlip);
    setLiveAnnouncement("");
  }, [clearSequenceTimers]);

  React.useEffect(() => {
    return () => {
      clearSequenceTimers();
    };
  }, [clearSequenceTimers]);

  React.useEffect(() => {
    if (displayItemsOverride !== null) return;
    if (unlockPhase !== "idle") return;
    previousStableItemsRef.current = items;
  }, [displayItemsOverride, items, unlockPhase]);

  React.useLayoutEffect(() => {
    const nextUnlockedKeys = new Set(
      items.filter((item) => item.unlocked).map((item) => item.key),
    );

    const previousUnlockedKeys = previousUnlockedKeysRef.current;

    const freshUnlocks =
      previousUnlockedKeys === null
        ? items.filter((item) => item.unlocked && item.cabinetRevealPending)
        : items.filter(
            (item) => item.unlocked && !previousUnlockedKeys.has(item.key),
          );

    previousUnlockedKeysRef.current = nextUnlockedKeys;

    if (freshUnlocks.length === 0) {
      return;
    }

    clearSequenceTimers();

    const freshUnlockKeySet = new Set(freshUnlocks.map((item) => item.key));
    const stagedItems = buildStagedUnlockItems(
      items,
      previousStableItemsRef.current,
      freshUnlockKeySet,
    );

    setIsFlipSuspended(true);
    setDisplayItemsOverride(stagedItems);
    setNewlyUnlockedKeys(freshUnlockKeySet);
    setPendingUnlockKeys(freshUnlockKeySet);
    setUnlockPhase("reveal");
    setFlipDurationMs(BADGE_UNLOCK_TIMELINE_MS.cabinetFlip);
    setLiveAnnouncement(
      freshUnlocks
        .map((item) => `New badge unlocked: ${item.label}`)
        .join(". "),
    );

    if (process.env.NODE_ENV !== "production") {
      console.debug("[useBadgeCabinetUnlockSequence] unlock started", {
        freshUnlockKeys: Array.from(freshUnlockKeySet),
        unlockVisualDurationMs: UNLOCK_VISUAL_DURATION_MS,
        cabinetFlipMs: BADGE_UNLOCK_TIMELINE_MS.cabinetFlip,
        cabinetSettleMs: BADGE_UNLOCK_TIMELINE_MS.cabinetSettle,
        timeline: BADGE_UNLOCK_TIMELINE_MS,
      });
    }

    unlockReleaseTimeoutRef.current = window.setTimeout(() => {
      unlockReleaseTimeoutRef.current = null;

      if (process.env.NODE_ENV !== "production") {
        console.debug(
          "[useBadgeCabinetUnlockSequence] unlock released to cabinet move",
        );
      }

      flushSync(() => {
        setUnlockPhase("move");
        setPendingUnlockKeys(new Set());
        setIsFlipSuspended(false);
        setFlipBaselineToken((current) => current + 1);
      });

      unlockReleaseRafRef.current = window.requestAnimationFrame(() => {
        unlockReleaseRafRef.current = null;

        unlockReleasePaintRafRef.current = window.requestAnimationFrame(() => {
          unlockReleasePaintRafRef.current = null;
          setDisplayItemsOverride(null);
        });
      });
    }, UNLOCK_VISUAL_DURATION_MS);

    unlockCleanupTimeoutRef.current = window.setTimeout(
      () => {
        setNewlyUnlockedKeys(new Set());
        setUnlockPhase("idle");
        setDisplayItemsOverride(null);
        setIsFlipSuspended(false);
        setFlipDurationMs(BADGE_UNLOCK_TIMELINE_MS.defaultFlip);
        setLiveAnnouncement("");
        unlockCleanupTimeoutRef.current = null;
      },
      UNLOCK_VISUAL_DURATION_MS +
        BADGE_UNLOCK_TIMELINE_MS.cabinetFlip +
        BADGE_UNLOCK_TIMELINE_MS.cabinetSettle,
    );
  }, [clearSequenceTimers, items]);

  const displayItems = React.useMemo(() => {
    return displayItemsOverride ?? items;
  }, [displayItemsOverride, items]);

  return {
    displayItems,
    newlyUnlockedKeys,
    pendingUnlockKeys,
    unlockPhase,
    liveAnnouncement,
    isFlipSuspended,
    flipDurationMs,
    flipBaselineToken,
    resetUnlockSequence,
  };
}
