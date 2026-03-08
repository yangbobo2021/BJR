"use client";

import React from "react";
import { visualizerPerfSurface } from "../visualizer/visualizerPerfSurface";

function fmt(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "–";
  return n.toFixed(digits);
}

export default function StagePerfHud() {
  const [metrics, setMetrics] = React.useState(
    () => visualizerPerfSurface.getMetrics("fullscreen"),
  );

  React.useEffect(() => {
    return visualizerPerfSurface.subscribe("fullscreen", setMetrics);
  }, []);

  if (!metrics) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: `calc(10px + env(safe-area-inset-top, 0px))`,
        left: `calc(10px + env(safe-area-inset-left, 0px))`,
        zIndex: 55,
        pointerEvents: "none",
        minWidth: 220,
        maxWidth: 260,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(0,0,0,0.42)",
        color: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.24)",
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, "Liberation Mono", monospace',
        fontSize: 11,
        lineHeight: 1.45,
        letterSpacing: 0.15,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.8,
          opacity: 0.78,
          marginBottom: 6,
        }}
      >
        STAGE PERF
      </div>

      <div style={{ display: "grid", gap: 2 }}>
        <div>
          <strong>theme</strong> {metrics.themeName}
        </div>
        <div>
          <strong>mode</strong> {metrics.mode} / {metrics.tier}
        </div>
        <div>
          <strong>fps</strong> {fmt(metrics.fpsObserved, 1)} /{" "}
          {fmt(metrics.fpsCap)}
        </div>
        <div>
          <strong>frame</strong> {fmt(metrics.avgFrameCostMs, 1)}ms
        </div>
        <div>
          <strong>dpr</strong> {fmt(metrics.appliedDpr, 2)}{" "}
          <span style={{ opacity: 0.7 }}>
            ({fmt(metrics.baseDpr, 2)} × {fmt(metrics.dprScale, 2)})
          </span>
        </div>
        <div>
          <strong>canvas</strong> {metrics.canvasPxW}×{metrics.canvasPxH}
        </div>
        <div>
          <strong>snapshot</strong> {metrics.snapshotPxW}×
          {metrics.snapshotPxH} @ {fmt(metrics.snapshotFps)}
        </div>
      </div>
    </div>
  );
}