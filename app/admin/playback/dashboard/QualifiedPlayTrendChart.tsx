// web/app/admin/playback/dashboard/QualifiedPlayTrendChart.tsx
"use client";

import React from "react";
import type { ChartPoint, TrendBucket, TrendRangeKey } from "./types";
import {
  BG_INSET,
  FONT_SIZE_UI,
  PANEL_BORDER,
  TEXT_FAINT,
  TEXT_MUTED,
} from "./playbackTelemetryDashboardStyles";
import {
  fmtTrendTick,
  formatNumber,
} from "./playbackTelemetryDashboardFormatters";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildSmoothCommands(points: ChartPoint[]): string {
  if (points.length < 2) return "";

  let d = "";

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const rawCp1x = p1.x + (p2.x - p0.x) / 6;
    const rawCp1y = p1.y + (p2.y - p0.y) / 6;
    const rawCp2x = p2.x - (p3.x - p1.x) / 6;
    const rawCp2y = p2.y - (p3.y - p1.y) / 6;

    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    const cp1x = rawCp1x;
    const cp1y = clamp(rawCp1y, minY, maxY);
    const cp2x = rawCp2x;
    const cp2y = clamp(rawCp2y, minY, maxY);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function buildSmoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  return `M ${points[0].x} ${points[0].y}${buildSmoothCommands(points)}`;
}

function buildSmoothAreaPath(upper: ChartPoint[], lower: ChartPoint[]): string {
  if (upper.length === 0 || lower.length === 0) return "";

  const reversedLower = [...lower].reverse();

  return [
    `M ${upper[0].x} ${upper[0].y}`,
    buildSmoothCommands(upper),
    ` L ${reversedLower[0].x} ${reversedLower[0].y}`,
    buildSmoothCommands(reversedLower),
    " Z",
  ].join("");
}

export function QualifiedPlayTrendChart(props: {
  rows: TrendBucket[];
  range: TrendRangeKey;
}) {
  const rows = props.rows;
  const width = 920;
  const height = 240;
  const paddingTop = 12;
  const paddingRight = 14;
  const paddingBottom = 32;
  const paddingLeft = 46;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const series = [
    {
      key: "anonymous",
      label: "Anonymous plays",
      fill: "rgba(255,255,255,0.18)",
      values: rows.map((row) => row.anonymousPlayCount),
    },
    {
      key: "member",
      label: "Member plays",
      fill: "rgba(255,255,255,0.56)",
      values: rows.map((row) => row.memberPlayCount),
    },
  ] as const;

  const maxTotal = Math.max(1, ...rows.map((row) => row.sitePlayCount));
  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => {
    const ratio = index / yTickCount;
    const value = Math.round(maxTotal * (1 - ratio));
    const y = paddingTop + innerHeight * ratio;
    return { value, y };
  });

  const xForIndex = (index: number): number => {
    if (rows.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (rows.length - 1)) * innerWidth;
  };

  const yForValue = (value: number): number =>
    paddingTop + innerHeight - (value / maxTotal) * innerHeight;

  const stackedLayers = series.map((layer, layerIndex) => {
    const lowerValues = rows.map((_, rowIndex) =>
      series
        .slice(0, layerIndex)
        .reduce((sum, candidate) => sum + candidate.values[rowIndex], 0),
    );

    const upperValues = lowerValues.map(
      (lower, rowIndex) => lower + layer.values[rowIndex],
    );

    const lowerPoints = lowerValues.map((value, rowIndex) => ({
      x: xForIndex(rowIndex),
      y: yForValue(value),
    }));

    const upperPoints = upperValues.map((value, rowIndex) => ({
      x: xForIndex(rowIndex),
      y: yForValue(value),
    }));

    return {
      key: layer.key,
      label: layer.label,
      fill: layer.fill,
      lowerPoints,
      upperPoints,
      areaPath: buildSmoothAreaPath(upperPoints, lowerPoints),
      linePath: buildSmoothLinePath(upperPoints),
    };
  });

  const tickIndexes = Array.from(
    new Set([
      0,
      Math.floor((rows.length - 1) * 0.33),
      Math.floor((rows.length - 1) * 0.66),
      rows.length - 1,
    ]),
  ).filter((index) => index >= 0 && index < rows.length);

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          border: PANEL_BORDER,
          borderRadius: 12,
          background: BG_INSET,
          padding: "10px 12px 6px",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          role="img"
          aria-label={`Qualified plays over the selected ${props.range} range`}
        >
          {yTicks.map((tick) => (
            <g key={`${tick.value}:${tick.y}`}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                fill={TEXT_FAINT}
                fontSize="10"
              >
                {formatNumber(tick.value)}
              </text>
            </g>
          ))}

          {stackedLayers.map((layer) => (
            <path
              key={`${layer.key}:fill`}
              d={layer.areaPath}
              fill={layer.fill}
              fillOpacity={0.72}
              stroke="none"
            />
          ))}

          {stackedLayers.map((layer) => (
            <path
              key={`${layer.key}:line`}
              d={layer.linePath}
              fill="none"
              stroke="rgba(255,255,255,0.78)"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {tickIndexes.map((index) => (
            <text
              key={rows[index]?.bucketStart ?? index}
              x={xForIndex(index)}
              y={height - 8}
              textAnchor="middle"
              fill={TEXT_FAINT}
              fontSize="8"
            >
              {rows[index]
                ? fmtTrendTick(rows[index].bucketStart, props.range)
                : ""}
            </text>
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, max-content))",
          gap: 8,
          alignItems: "center",
        }}
      >
        {stackedLayers.map((layer) => (
          <div
            key={layer.key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: TEXT_MUTED,
              fontSize: FONT_SIZE_UI,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: layer.fill,
                display: "inline-block",
              }}
            />
            {layer.label}
          </div>
        ))}
      </div>
    </div>
  );
}
