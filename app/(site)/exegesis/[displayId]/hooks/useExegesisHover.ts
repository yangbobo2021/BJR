"use client";

import React from "react";

export default function useExegesisHover() {
  const [hoverGroupKey, setHoverGroupKey] = React.useState<string>("");
  const [hoverLineKey, setHoverLineKey] = React.useState<string>("");

  const hoverRafRef = React.useRef<number | null>(null);
  const hoverNextRef = React.useRef<{ gk: string; lk: string } | null>(null);

  const commitHover = React.useCallback(
    (next: { gk: string; lk: string }) => {
      if (next.gk === hoverGroupKey && next.lk === hoverLineKey) return;
      setHoverGroupKey(next.gk);
      setHoverLineKey(next.lk);
    },
    [hoverGroupKey, hoverLineKey],
  );

  const scheduleHover = React.useCallback(
    (next: { gk: string; lk: string }) => {
      hoverNextRef.current = next;
      if (hoverRafRef.current != null) return;

      hoverRafRef.current = window.requestAnimationFrame(() => {
        hoverRafRef.current = null;
        const value = hoverNextRef.current;
        hoverNextRef.current = null;
        if (!value) return;
        commitHover(value);
      });
    },
    [commitHover],
  );

  React.useEffect(() => {
    return () => {
      if (hoverRafRef.current != null) {
        window.cancelAnimationFrame(hoverRafRef.current);
      }
      hoverRafRef.current = null;
      hoverNextRef.current = null;
    };
  }, []);

  const clearHover = React.useCallback(() => {
    scheduleHover({ gk: "", lk: "" });
  }, [scheduleHover]);

  const onLyricsPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const btn = target.closest("button[data-linekey]");
      if (!(btn instanceof HTMLButtonElement)) {
        clearHover();
        return;
      }

      const lk = (btn.dataset.linekey ?? "").trim();
      const gk = (btn.dataset.groupkey ?? "").trim();
      scheduleHover({ gk, lk });
    },
    [clearHover, scheduleHover],
  );

  return {
    hoverGroupKey,
    hoverLineKey,
    scheduleHover,
    clearHover,
    onLyricsPointerMove,
  };
}