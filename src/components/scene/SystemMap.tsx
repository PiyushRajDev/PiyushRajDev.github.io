"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type NodeKind =
  | "transport"
  | "project"
  | "state"
  | "observability"
  | "environment";

type SystemNode = {
  id: string;
  label: string;
  shortLabel: string;
  kind: NodeKind;
  position: [number, number, number];
  description: string;
};

type SystemEdge = {
  from: string;
  to: string;
};

type Point3 = { x: number; y: number; z: number };
type ProjectedNode = {
  node: SystemNode;
  x: number;
  y: number;
  radius: number;
  depth: number;
};

type Palette = Record<NodeKind | "paper" | "ink" | "secondary" | "hairline" | "accent", string>;

const NODES: readonly SystemNode[] = [
  {
    id: "browser",
    label: "Browser capture",
    shortLabel: "Browser",
    kind: "transport",
    position: [-3.05, 0.05, 0.2],
    description:
      "The browser is the input boundary for microphone capture, user interaction and live room participation.",
  },
  {
    id: "webrtc",
    label: "WebRTC transport",
    shortLabel: "WebRTC",
    kind: "transport",
    position: [-1.72, -0.82, 0.78],
    description:
      "Real-time media transport for low-latency audio and video. Signalling and media transport remain separate concerns.",
  },
  {
    id: "sfu",
    label: "Media server / SFU",
    shortLabel: "Media SFU",
    kind: "transport",
    position: [0.05, -0.05, -0.42],
    description:
      "A selective forwarding layer routes participant media without making application state responsible for media distribution.",
  },
  {
    id: "voice",
    label: "Vāk voice pipeline",
    shortLabel: "Vāk pipeline",
    kind: "project",
    position: [1.72, 0.86, 0.62],
    description:
      "Vāk coordinates speech recognition, translation and voice synthesis so each room participant can hear a translated speaker.",
  },
  {
    id: "oasix",
    label: "OASIX agents",
    shortLabel: "OASIX",
    kind: "project",
    position: [-0.82, 1.65, 0.9],
    description:
      "OASIX explores agent-oriented social listening, trend discovery and sentiment signals across public content.",
  },
  {
    id: "slh",
    label: "SkillLighthouse workers",
    shortLabel: "SkillLighthouse",
    kind: "project",
    position: [2.82, 0.7, -0.46],
    description:
      "Asynchronous workers analyse repository and coding evidence, with Redis-backed queues and PostgreSQL persistence.",
  },
  {
    id: "metaspace",
    label: "MetaSpace room state",
    shortLabel: "MetaSpace",
    kind: "project",
    position: [-2.1, 1.1, -0.86],
    description:
      "MetaSpace combines spatial presence and room synchronization with a separate real-time media layer.",
  },
  {
    id: "redis",
    label: "Redis / transient state",
    shortLabel: "Redis",
    kind: "state",
    position: [0.35, -1.72, 0.7],
    description:
      "Transient state, queue coordination and fast-changing signals. Used in the SkillLighthouse and backend experiments.",
  },
  {
    id: "postgres",
    label: "PostgreSQL / durable state",
    shortLabel: "PostgreSQL",
    kind: "state",
    position: [1.92, -1.62, -0.58],
    description:
      "Durable relational state for application records, user data and evaluation results across the projects.",
  },
  {
    id: "observability",
    label: "Observability",
    shortLabel: "Observability",
    kind: "observability",
    position: [0.28, 2.35, -0.9],
    description:
      "The cross-cutting view: logs, traces and health signals help explain behaviour across service boundaries.",
  },
  {
    id: "localhost",
    label: "localhost",
    shortLabel: "localhost",
    kind: "environment",
    position: [-3.15, -1.72, -0.92],
    description:
      "The local development boundary is deliberately shown outside the service graph. This is a conceptual map, not discovered runtime telemetry.",
  },
] as const;

const EDGES: readonly SystemEdge[] = [
  { from: "browser", to: "webrtc" },
  { from: "webrtc", to: "sfu" },
  { from: "sfu", to: "voice" },
  { from: "voice", to: "redis" },
  { from: "voice", to: "postgres" },
  { from: "voice", to: "observability" },
  { from: "oasix", to: "redis" },
  { from: "oasix", to: "observability" },
  { from: "slh", to: "redis" },
  { from: "slh", to: "postgres" },
  { from: "metaspace", to: "webrtc" },
  { from: "metaspace", to: "redis" },
  { from: "redis", to: "observability" },
] as const;

const KIND_LABELS: Record<NodeKind, string> = {
  transport: "TRANSPORT",
  project: "PROJECT",
  state: "STATE / STORAGE",
  observability: "OBSERVABILITY",
  environment: "ENVIRONMENT",
};

const DEFAULT_ROTATION = { x: -0.2, y: 0.24 };
const CAMERA_DISTANCE = 8.6;
const MAX_PIXEL_RATIO = 1.6;

function getPalette(canvas: HTMLCanvasElement): Palette {
  const styles = getComputedStyle(canvas);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    paper: read("--paper", "#121110"),
    ink: read("--ink", "#EDEAE2"),
    secondary: read("--secondary", "#A29E94"),
    hairline: read("--hairline", "rgba(255,255,255,.15)"),
    accent: read("--accent", "#FF5A1F"),
    transport: read("--map-transport", "#756A5C"),
    project: read("--map-project", "#24211D"),
    state: read("--map-state", "#968B7E"),
    observability: read("--map-observability", "#E94F24"),
    environment: read("--map-environment", "#81776C"),
  };
}

function rotatePoint(point: Point3, rotation: { x: number; y: number }): Point3 {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const x = point.x * cosY + point.z * sinY;
  const z = -point.x * sinY + point.z * cosY;

  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);

  return {
    x,
    y: point.y * cosX - z * sinX,
    z: point.y * sinX + z * cosX,
  };
}

function projectPoint(
  point: Point3,
  width: number,
  height: number,
  rotation: { x: number; y: number },
): { x: number; y: number; depth: number; scale: number } {
  const rotated = rotatePoint(point, rotation);
  // Independent horizontal/vertical scales keep the whole graph legible
  // instead of shrinking its width to fit a short canvas.
  const unitX = width / 7.8;
  const unitY = height / 5.4;
  const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE - rotated.z);

  return {
    x: width / 2 + rotated.x * unitX * perspective,
    y: height * 0.5 - rotated.y * unitY * perspective,
    depth: rotated.z,
    scale: perspective,
  };
}

export function SystemMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ ...DEFAULT_ROTATION });
  const projectedRef = useRef<ProjectedNode[]>([]);
  const selectedRef = useRef("voice");
  const hoveredRef = useRef<string | null>(null);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const visibleRef = useRef(false);
  const draggingRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const drawNowRef = useRef<() => void>(() => undefined);
  const animationRef = useRef(0);
  const startLoopRef = useRef<() => void>(() => undefined);

  const [selectedId, setSelectedId] = useState("voice");
  const [paused, setPaused] = useState(false);

  const selectedNode =
    NODES.find((node) => node.id === selectedId) ?? NODES[0];

  const selectNode = useCallback((id: string) => {
    selectedRef.current = id;
    setSelectedId(id);
    drawNowRef.current();
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !wrapper || !context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let palette = getPalette(canvas);
    let fontFamily = getComputedStyle(canvas).fontFamily;
    let lastFrame = 0;
    let disposed = false;

    const draw = (timestamp = performance.now()) => {
      if (disposed || width <= 0 || height <= 0) return;

      context.clearRect(0, 0, width, height);
      context.save();

      const project = (point: Point3) =>
        projectPoint(point, width, height, rotationRef.current);

      // Perspective floor grid.
      context.lineWidth = 0.65;
      context.strokeStyle = palette.hairline;
      context.globalAlpha = 0.44;

      for (let x = -4; x <= 4; x += 1) {
        const a = project({ x, y: -2.25, z: -3.5 });
        const b = project({ x, y: -2.25, z: 3.5 });
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      for (let z = -3.5; z <= 3.5; z += 0.8) {
        const a = project({ x: -4, y: -2.25, z });
        const b = project({ x: 4, y: -2.25, z });
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      // Faint orbital boundary.
      const orbitCenter = project({ x: 0, y: 0.05, z: 0 });
      context.globalAlpha = 0.34;
      context.strokeStyle = palette.secondary;
      context.beginPath();
      context.ellipse(
        orbitCenter.x,
        orbitCenter.y,
        Math.min(width * 0.285, 205),
        Math.min(height * 0.43, 142),
        -rotationRef.current.y * 0.3,
        0,
        Math.PI * 2,
      );
      context.stroke();

      const projected = NODES.map((node) => {
        const point = project({
          x: node.position[0],
          y: node.position[1],
          z: node.position[2],
        });
        return {
          node,
          x: point.x,
          y: point.y,
          depth: point.depth,
          radius: Math.max(
            8,
            Math.min(17, Math.min(width / 46, height / 22)),
          ),
        };
      });

      const byId = new Map(projected.map((point) => [point.node.id, point]));
      projectedRef.current = projected;

      // Connections: back-to-front so the near nodes remain visually dominant.
      const sortedEdges = [...EDGES].sort((left, right) => {
        const leftDepth =
          ((byId.get(left.from)?.depth ?? 0) + (byId.get(left.to)?.depth ?? 0)) / 2;
        const rightDepth =
          ((byId.get(right.from)?.depth ?? 0) + (byId.get(right.to)?.depth ?? 0)) / 2;
        return leftDepth - rightDepth;
      });

      for (const edge of sortedEdges) {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) continue;

        const isSelected =
          selectedRef.current === edge.from || selectedRef.current === edge.to;
        context.globalAlpha = isSelected ? 0.92 : 0.42 + (from.depth + to.depth + 2) * 0.055;
        context.strokeStyle = isSelected ? palette.accent : palette.secondary;
        context.lineWidth = isSelected ? 1.25 : 0.8;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();

        // Explicitly simulated packets, not live traffic/telemetry.
        if (!pausedRef.current && !reducedMotionRef.current) {
          const edgeIndex = EDGES.indexOf(edge);
          const progress = ((timestamp / 5200 + edgeIndex * 0.173) % 1 + 1) % 1;
          const packetX = from.x + (to.x - from.x) * progress;
          const packetY = from.y + (to.y - from.y) * progress;
          context.globalAlpha = 0.92;
          context.fillStyle = palette.accent;
          context.beginPath();
          context.arc(packetX, packetY, 2.1, 0, Math.PI * 2);
          context.fill();
        }
      }

      // Nodes are painted far-to-near.
      const sortedNodes = [...projected].sort((a, b) => a.depth - b.depth);

      for (const item of sortedNodes) {
        const { node, x, y, radius } = item;
        const color = palette[node.kind];
        const selected = node.id === selectedRef.current;
        const hovered = node.id === hoveredRef.current;
        const haloRadius = radius * (selected || hovered ? 3.2 : 2.65);

        const glow = context.createRadialGradient(
          x,
          y,
          radius * 0.4,
          x,
          y,
          haloRadius,
        );
        glow.addColorStop(0, color);
        glow.addColorStop(1, "rgba(0,0,0,0)");

        context.globalAlpha = 0.11;
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, haloRadius, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = selected ? 1 : 0.72;
        context.strokeStyle = color;
        context.lineWidth = selected ? 1.4 : 0.95;
        context.beginPath();
        context.arc(x, y, radius * (selected ? 2.05 : 1.75), 0, Math.PI * 2);
        context.stroke();

        const sphere = context.createRadialGradient(
          x - radius * 0.32,
          y - radius * 0.38,
          radius * 0.05,
          x + radius * 0.16,
          y + radius * 0.2,
          radius * 1.45,
        );
        sphere.addColorStop(0, color);
        sphere.addColorStop(0.72, color);
        sphere.addColorStop(1, palette.ink);

        context.globalAlpha = selected ? 1 : 0.83;
        context.fillStyle = sphere;
        context.beginPath();
        context.arc(x, y, radius * (selected ? 1.08 : 0.9), 0, Math.PI * 2);
        context.fill();

        // Compact name plates follow each projected node.
        const labelFont = Math.max(9, Math.min(12, width / 48));
        context.font = `600 ${labelFont}px ${fontFamily}`;
        const labelWidth = context.measureText(node.shortLabel).width + 14;
        const labelHeight = labelFont + 12;
        const labelX = Math.max(
          8,
          Math.min(width - labelWidth - 8, x - labelWidth / 2),
        );
        const placeAbove = new Set([
          "webrtc",
          "slh",
          "metaspace",
          "observability",
          "redis",
        ]).has(node.id);
        const preferredLabelY = placeAbove
          ? y - radius - labelHeight - 9
          : y + radius + 9;
        const labelY = Math.max(
          12,
          Math.min(height - labelHeight - 12, preferredLabelY),
        );

        context.globalAlpha = 0.98;
        context.fillStyle = palette.paper;
        context.fillRect(labelX, labelY, labelWidth, labelHeight);
        context.globalAlpha = 0.72;
        context.strokeStyle = palette.hairline;
        context.lineWidth = 0.8;
        context.strokeRect(labelX, labelY, labelWidth, labelHeight);
        context.globalAlpha = 1;
        context.fillStyle = selected ? palette.accent : palette.ink;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(node.shortLabel, x, labelY + labelHeight / 2 + 0.2);
      }

      // Header text inside the plot.
      context.globalAlpha = 0.72;
      context.fillStyle = palette.secondary;
      context.textAlign = "left";
      context.textBaseline = "top";
      context.font = `9px ${fontFamily}`;
      context.fillText("DRAG TO ROTATE  /  SELECT A NODE", 10, 9);
      context.textAlign = "right";
      context.fillText("EVENT FLOW · SIMULATED", width - 10, 9);

      context.restore();
    };

    drawNowRef.current = () => draw();

    const resize = () => {
      const bounds = wrapper.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontFamily = getComputedStyle(canvas).fontFamily;
      draw();
    };

    const canAnimate = () =>
      !disposed &&
      visibleRef.current &&
      !document.hidden &&
      !pausedRef.current &&
      !reducedMotionRef.current;

    const tick = (timestamp: number) => {
      animationRef.current = 0;
      if (!canAnimate()) return;

      if (timestamp - lastFrame >= 1000 / 30) {
        draw(timestamp);
        lastFrame = timestamp;
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (canAnimate() && !animationRef.current) {
        animationRef.current = window.requestAnimationFrame(tick);
      } else {
        draw();
      }
    };

    startLoopRef.current = start;

    const stop = () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      draw();
    };

    const updateVisibility = (visible: boolean) => {
      visibleRef.current = visible;
      if (visible) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => updateVisibility(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    observer.observe(wrapper);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const updateTheme = () => {
      palette = getPalette(canvas);
      draw();
    };

    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) stop();
      else start();
    };

    reducedMotionRef.current = motionQuery.matches;
    motionQuery.addEventListener("change", handleMotion);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", resize);

    resize();

    return () => {
      disposed = true;
      stopAnimation();
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotion);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", resize);
      drawNowRef.current = () => undefined;
    };
  }, [stopAnimation]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = draggingRef.current;

    if (drag && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;

      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;

      rotationRef.current.y += dx * 0.006;
      rotationRef.current.x = Math.max(
        -0.85,
        Math.min(0.62, rotationRef.current.x + dy * 0.004),
      );

      drag.x = event.clientX;
      drag.y = event.clientY;
      drawNowRef.current();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const hit = [...projectedRef.current]
      .reverse()
      .find((node) => Math.hypot(node.x - x, node.y - y) < node.radius + 10);

    const nextHovered = hit?.node.id ?? null;
    if (hoveredRef.current !== nextHovered) {
      hoveredRef.current = nextHovered;
      drawNowRef.current();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = draggingRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.moved) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const hit = [...projectedRef.current]
        .reverse()
        .find((node) => Math.hypot(node.x - x, node.y - y) < node.radius + 12);

      if (hit) selectNode(hit.node.id);
    }

    draggingRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = () => {
    if (!draggingRef.current && hoveredRef.current) {
      hoveredRef.current = null;
      drawNowRef.current();
    }
  };

  const toggleTraffic = () => {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);

    if (next) {
      stopAnimation();
      drawNowRef.current();
    } else {
      startLoopRef.current();
    }
  };

  const resetCamera = () => {
    rotationRef.current = { ...DEFAULT_ROTATION };
    drawNowRef.current();
  };

  return (
    <section className="system-map" aria-label="Interactive conceptual system map">
      <div className="system-map__header">
        <div className="system-map__heading">
          <span className="system-map__eyebrow">3D SYSTEM MAP</span>
          <span className="system-map__counts">11 NODES · 13 EDGES</span>
        </div>
        <div className="system-map__actions">
          <button type="button" onClick={toggleTraffic}>
            {paused ? "Resume flow" : "Pause flow"}
          </button>
          <button type="button" onClick={resetCamera}>
            Reset
          </button>
        </div>
      </div>

      <div className="system-map__caption">
        <span>SYSTEM MAP / ONE NODE ISN’T TALKING</span>
        <span>CONCEPTUAL DEPENDENCIES</span>
      </div>

      <div className="system-map__viewport" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          className="system-map__canvas"
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
        <div className="system-map__canvas-status" aria-hidden="true">
          <span className="system-map__status-dot" />
          piyush://systems-map
        </div>
      </div>

      <div className="system-map__inspector">
        <div className="system-map__inspector-copy" aria-live="polite">
          <span className={`system-map__kind system-map__kind--${selectedNode.kind}`}>
            {KIND_LABELS[selectedNode.kind]}
          </span>
          <strong>{selectedNode.label}</strong>
          <p>{selectedNode.description}</p>
        </div>
        <label className="system-map__select-label">
          <span>INSPECT NODE</span>
          <select
            value={selectedId}
            onChange={(event) => selectNode(event.target.value)}
            aria-label="Inspect a system map node"
          >
            {NODES.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="system-map__legend" aria-label="Dependency classes">
        {(Object.keys(KIND_LABELS) as NodeKind[]).map((kind) => (
          <span key={kind}>
            <i className={`system-map__legend-dot system-map__legend-dot--${kind}`} />
            {KIND_LABELS[kind]}
          </span>
        ))}
      </div>

      <p className="system-map__footnote">
        Conceptual dependencies, not live telemetry. Drag to rotate · select a node to inspect.
      </p>
    </section>
  );
}
