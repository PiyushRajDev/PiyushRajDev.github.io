"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MAX_FREQUENCY,
  MIN_FREQUENCY,
  PEAK_THRESHOLD,
  SPECTRUM_BINS,
  TERRAIN_ROWS,
  SynthSignalSource,
  type SignalSource,
} from "./audio/signalSource";
import { RollingFFTBuffer } from "./audio/rollingFFT";

const FRAME_INTERVAL_MS = 1000 / 30;
const HISTORY_INTERVAL_SECONDS = 0.055;
const MAX_PIXEL_RATIO = 1.75;

type ThemePalette = {
  ink: string;
  paper: string;
  accent: string;
  secondary: string;
};

type SignalFieldProps = {
  active: boolean;
  staticMode: boolean;
  source: SignalSource;
};

function readPalette(): ThemePalette {
  const styles = getComputedStyle(document.documentElement);

  return {
    ink: styles.getPropertyValue("--ink").trim(),
    paper: styles.getPropertyValue("--paper").trim(),
    accent: styles.getPropertyValue("--accent").trim(),
    secondary: styles.getPropertyValue("--secondary").trim(),
  };
}

function drawRidgelines(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  buffer: RollingFFTBuffer,
  palette: ThemePalette,
  fontFamily: string,
  coordinates: Float32Array,
) {
  context.clearRect(0, 0, width, height);

  if (!width || !height) return;

  const left = 12;
  const right = Math.max(left + 80, width - 34);
  const plotTop = Math.max(18, height * 0.09);
  const axisY = height - 29;
  const plotBottom = axisY - 26;
  const rowGap = (plotBottom - plotTop) / Math.max(1, TERRAIN_ROWS - 1);
  const amplitudeScale = Math.max(15, Math.min(31, rowGap * 2.75));

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  // Draw the oldest slice first so every nearer slice masks it.
  for (let row = TERRAIN_ROWS - 1; row >= 0; row -= 1) {
    const depth = row / Math.max(1, TERRAIN_ROWS - 1);
    const inset = depth * Math.min(44, width * 0.11);
    const rowLeft = left + inset;
    const rowRight = right - inset;
    const rowWidth = rowRight - rowLeft;
    const baseline = plotBottom - depth * (plotBottom - plotTop);
    const fillBottom = Math.min(axisY - 7, baseline + rowGap * 0.86);
    const rowAmplitude = amplitudeScale * (1 - depth * 0.1);
    const opacity = 0.28 + (1 - depth) * 0.64;

    const coordinateOffset = row * SPECTRUM_BINS * 2;

    for (let bin = 0; bin < SPECTRUM_BINS; bin += 1) {
      const amplitude = Math.pow(
        Math.max(0, buffer.value(row, bin)),
        0.92,
      );
      coordinates[coordinateOffset + bin * 2] =
        rowLeft + (bin / (SPECTRUM_BINS - 1)) * rowWidth;
      coordinates[coordinateOffset + bin * 2 + 1] =
        baseline - amplitude * rowAmplitude;
    }

    // The opaque paper fill is intentional: it occludes the lower part of
    // older rows, giving the plot its layered ridgeline depth.
    context.beginPath();
    context.moveTo(coordinates[coordinateOffset], fillBottom);

    for (let bin = 0; bin < SPECTRUM_BINS; bin += 1) {
      context.lineTo(coordinates[coordinateOffset + bin * 2], coordinates[coordinateOffset + bin * 2 + 1]);
    }

    context.lineTo(rowRight, fillBottom);
    context.closePath();
    context.globalAlpha = 1;
    context.fillStyle = palette.paper;
    context.fill();

    // Base polyline.
    context.beginPath();
    context.moveTo(coordinates[coordinateOffset], coordinates[coordinateOffset + 1]);

    for (let bin = 1; bin < SPECTRUM_BINS; bin += 1) {
      context.lineTo(coordinates[coordinateOffset + bin * 2], coordinates[coordinateOffset + bin * 2 + 1]);
    }

    context.globalAlpha = opacity;
    context.strokeStyle = palette.ink;
    context.lineWidth = 1.05;
    context.stroke();

    // Re-stroke only the above-threshold segments with the accent token.
    context.beginPath();

    for (let bin = 0; bin < SPECTRUM_BINS - 1; bin += 1) {
      const peak = Math.max(
        buffer.value(row, bin),
        buffer.value(row, bin + 1),
      );

      if (peak >= PEAK_THRESHOLD) {
        context.moveTo(coordinates[coordinateOffset + bin * 2], coordinates[coordinateOffset + bin * 2 + 1]);
        context.lineTo(
          coordinates[coordinateOffset + (bin + 1) * 2],
          coordinates[coordinateOffset + (bin + 1) * 2 + 1],
        );
      }
    }

    context.strokeStyle = palette.accent;
    context.lineWidth = 1.2;
    context.stroke();
  }

  // Frequency axis belongs below the newest (front) row.
  context.globalAlpha = 0.82;
  context.strokeStyle = palette.secondary;
  context.fillStyle = palette.secondary;
  context.lineWidth = 0.75;
  context.beginPath();
  context.moveTo(left, axisY);
  context.lineTo(right, axisY);
  context.stroke();

  context.font = `10px ${fontFamily}`;
  context.textBaseline = "top";

  const ticks = [
    { frequency: 80, label: "80 Hz", align: "left" as const },
    { frequency: 500, label: "500", align: "center" as const },
    { frequency: 2000, label: "2k", align: "center" as const },
    { frequency: 8000, label: "8k", align: "right" as const },
  ];

  const logRange = Math.log(MAX_FREQUENCY / MIN_FREQUENCY);

  for (const tick of ticks) {
    const ratio =
      Math.log(tick.frequency / MIN_FREQUENCY) / logRange;
    const x = left + ratio * (right - left);

    context.beginPath();
    context.moveTo(x, axisY - 3);
    context.lineTo(x, axisY + 4);
    context.stroke();

    context.textAlign = tick.align;
    context.fillText(tick.label, x, axisY + 8);
  }

  context.restore();
}

export default function SignalField({
  active,
  staticMode,
  source,
}: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seededRef = useRef(false);
  const previousSourceRef = useRef<SignalSource | null>(null);
  const buffer = useMemo(
    () => new RollingFFTBuffer(TERRAIN_ROWS, SPECTRUM_BINS),
    [],
  );
  const frame = useMemo(() => new Float32Array(SPECTRUM_BINS), []);
  const coordinateBuffer = useMemo(
    () => new Float32Array(TERRAIN_ROWS * SPECTRUM_BINS * 2),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrameId = 0;
    let lastFrameAt = 0;
    let disposed = false;
    let palette = readPalette();
    let fontFamily = getComputedStyle(canvas).fontFamily;

    const draw = () => {
      drawRidgelines(
        context,
        width,
        height,
        buffer,
        palette,
        fontFamily,
        coordinateBuffer,
      );
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      fontFamily = getComputedStyle(canvas).fontFamily;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    };

    const pushFrame = (timeSeconds: number) => {
      source.read(frame, timeSeconds);
      buffer.push(frame);
      draw();
    };

    const stopLoop = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    const animate = (timestamp: number) => {
      if (disposed || !active || staticMode || document.hidden) {
        animationFrameId = 0;
        return;
      }

      if (timestamp - lastFrameAt >= FRAME_INTERVAL_MS) {
        pushFrame(timestamp / 1000);
        lastFrameAt = timestamp;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (
        disposed ||
        !active ||
        staticMode ||
        document.hidden ||
        animationFrameId
      ) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    if (!seededRef.current) {
      const seedSource = new SynthSignalSource();
      const seedFrame = new Float32Array(SPECTRUM_BINS);
      const now = performance.now() / 1000;

      // Row zero is the newest/front slice; higher rows are older/farther.
      for (let row = 0; row < TERRAIN_ROWS; row += 1) {
        seedSource.read(
          seedFrame,
          now - row * HISTORY_INTERVAL_SECONDS,
        );
        buffer.data.set(seedFrame, row * SPECTRUM_BINS);
      }

      seededRef.current = true;
    }

    resize();

    if (previousSourceRef.current && previousSourceRef.current !== source) {
      pushFrame(performance.now() / 1000);
    }
    previousSourceRef.current = source;

    if (active && !staticMode && !document.hidden) {
      startLoop();
    } else {
      draw();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const handleWindowResize = () => resize();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    window.addEventListener("resize", handleWindowResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const updateTheme = () => {
      palette = readPalette();
      draw();
    };

    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      disposed = true;
      stopLoop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [active, buffer, coordinateBuffer, frame, source, staticMode]);

  return (
    <canvas
      ref={canvasRef}
      className="signal-field__surface"
      aria-hidden="true"
    />
  );
}
