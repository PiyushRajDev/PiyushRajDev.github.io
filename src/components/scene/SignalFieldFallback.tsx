"use client";

import { useMemo } from "react";
import {
  SPECTRUM_BINS,
  TERRAIN_ROWS,
  createSynthSignalSource,
} from "./audio/signalSource";

export function SignalFieldFallback() {
  const points = useMemo(() => {
    const source = createSynthSignalSource();
    const frame = new Float32Array(SPECTRUM_BINS);
    const rows: {
      key: number;
      x: number;
      y: number;
      accent: boolean;
    }[] = [];

    for (let row = TERRAIN_ROWS - 1; row >= 0; row -= 1) {
      source.read(frame, -row * 0.055);

      for (let bin = 0; bin < SPECTRUM_BINS; bin += 1) {
        const x = (bin / (SPECTRUM_BINS - 1)) * 760;
        const depth = row / (TERRAIN_ROWS - 1);
        const baseline = 24 + depth * 252;
        const amplitude = Math.pow(frame[bin], 0.9);
        const y = baseline - amplitude * (52 - depth * 18);

        rows.push({
          key: row * SPECTRUM_BINS + bin,
          x,
          y,
          accent: frame[bin] >= 0.72,
        });
      }
    }

    return rows;
  }, []);

  return (
    <svg
      className="signal-field-fallback"
      viewBox="0 0 760 300"
      role="img"
      aria-label="Static voice-spectrum terrain"
    >
      {points.map((point) => (
        <circle
          key={point.key}
          cx={point.x}
          cy={point.y}
          r={point.accent ? 1.8 : 1.15}
          className={
            point.accent
              ? "signal-field__accent"
              : "signal-field__point"
          }
        />
      ))}
    </svg>
  );
}
