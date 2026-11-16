"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PEAK_THRESHOLD,
  SPECTRUM_BINS,
  TERRAIN_ROWS,
  type SignalSource,
  SynthSignalSource,
} from "./audio/signalSource";
import { RollingFFTBuffer } from "./audio/rollingFFT";

const FIELD_WIDTH = 8.2;
const DEPTH_STEP = 0.19;
const FIELD_HEIGHT = 3.2;
const POINT_SIZE = 0.42;

function readThemeColor(name: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value ? new THREE.Color(value) : new THREE.Color();
}

const vertexShader = /* glsl */ `
attribute float aHeight;
attribute float aPeak;

uniform float uHeight;
uniform float uPointSize;
uniform float uPixelRatio;

varying float vPeak;

void main() {
  vec3 transformed = position;
  transformed.y = aHeight * uHeight;

  vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;

  float depthScale = 8.0 / max(1.0, -modelViewPosition.z);
  gl_PointSize = min(3.6, uPointSize * uPixelRatio * depthScale);
  vPeak = aPeak;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uAccent;

varying float vPeak;

void main() {
  vec2 point = gl_PointCoord - vec2(0.5);
  float distanceFromCenter = length(point);

  if (distanceFromCenter > 0.5) discard;

  float edge = smoothstep(0.5, 0.28, distanceFromCenter);
  vec3 color = mix(uInk, uAccent, step(0.5, vPeak));

  gl_FragColor = vec4(color, edge);
}
`;

type TerrainPointsProps = {
  active: boolean;
  source: SignalSource;
};

function TerrainPoints({ active, source }: TerrainPointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const bufferRef = useRef<RollingFFTBuffer | null>(null);
  const frameRef = useRef(new Float32Array(SPECTRUM_BINS));

  const geometry = useMemo(() => {
    const positions = new Float32Array(TERRAIN_ROWS * SPECTRUM_BINS * 3);
    const heights = new Float32Array(TERRAIN_ROWS * SPECTRUM_BINS);
    const peaks = new Float32Array(TERRAIN_ROWS * SPECTRUM_BINS);

    for (let row = 0; row < TERRAIN_ROWS; row += 1) {
      const z = -row * DEPTH_STEP;

      for (let bin = 0; bin < SPECTRUM_BINS; bin += 1) {
        const index = row * SPECTRUM_BINS + bin;
        positions[index * 3] =
          (bin / (SPECTRUM_BINS - 1) - 0.5) * FIELD_WIDTH;
        positions[index * 3 + 1] = 0;
        positions[index * 3 + 2] = z;
      }
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("aHeight", new THREE.BufferAttribute(heights, 1));
    buffer.setAttribute("aPeak", new THREE.BufferAttribute(peaks, 1));
    return buffer;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uHeight: { value: FIELD_HEIGHT },
          uPointSize: { value: POINT_SIZE },
          uPixelRatio: { value: 1 },
          uInk: { value: readThemeColor("--ink") },
          uAccent: { value: readThemeColor("--accent") },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  );

  const primeSource = useMemo(() => new SynthSignalSource(), []);

  useEffect(() => {
    const buffer = new RollingFFTBuffer(TERRAIN_ROWS, SPECTRUM_BINS);
    const seed = new Float32Array(SPECTRUM_BINS);

    for (let row = TERRAIN_ROWS - 1; row >= 0; row -= 1) {
      primeSource.read(seed, -row * 0.055);
      buffer.data.set(seed, row * SPECTRUM_BINS);
    }

    bufferRef.current = buffer;

    return () => {
      bufferRef.current = null;
    };
  }, [primeSource]);

  useEffect(() => {
    const updateTheme = () => {
      material.uniforms.uInk.value.copy(readThemeColor("--ink"));
      material.uniforms.uAccent.value.copy(readThemeColor("--accent"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [material]);

  useEffect(() => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    material.uniforms.uPixelRatio.value = pixelRatio;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (!active || !pointsRef.current) return;

    const buffer = bufferRef.current;
    if (!buffer) return;

    source.read(frameRef.current, state.clock.elapsedTime);
    buffer.push(frameRef.current);

    const heights = geometry.getAttribute("aHeight") as THREE.BufferAttribute;
    const peaks = geometry.getAttribute("aPeak") as THREE.BufferAttribute;
    const heightArray = heights.array as Float32Array;
    const peakArray = peaks.array as Float32Array;

    for (let row = 0; row < TERRAIN_ROWS; row += 1) {
      const rowEnergy = 1 - row / TERRAIN_ROWS;

      for (let bin = 0; bin < SPECTRUM_BINS; bin += 1) {
        const index = row * SPECTRUM_BINS + bin;
        const amplitude = buffer.value(row, bin);

        heightArray[index] =
          Math.pow(amplitude, 0.9) * (0.78 + rowEnergy * 0.22);
        peakArray[index] = amplitude >= PEAK_THRESHOLD ? 1 : 0;
      }
    }

    heights.needsUpdate = true;
    peaks.needsUpdate = true;

    if (groupRef.current) {
      const targetX = -0.13 + state.pointer.y * 0.035;
      const targetY = state.pointer.x * 0.055;

      groupRef.current.rotation.x +=
        (targetX - groupRef.current.rotation.x) * 0.045;
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * 0.045;
      groupRef.current.position.x +=
        (state.pointer.x * 0.08 - groupRef.current.position.x) * 0.045;
    }
  });

  return (
    <group ref={groupRef}>
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    </group>
  );
}

type SignalFieldProps = {
  active: boolean;
  source: SignalSource;
};

export default function SignalField({ active, source }: SignalFieldProps) {
  return (
    <Canvas
      camera={{
        position: [0, 3.4, 8.8],
        fov: 38,
        near: 0.1,
        far: 40,
      }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <TerrainPoints active={active} source={source} />
    </Canvas>
  );
}
