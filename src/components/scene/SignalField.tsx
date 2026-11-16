"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLUMNS = 112;
const ROWS = 90;
const COUNT = COLUMNS * ROWS;
const FIELD_WIDTH = 8.1;
const FIELD_HEIGHT = 5.7;

type BasePoint = {
  x: number;
  y: number;
  accent: boolean;
};

function readToken(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function SignalParticles({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cursor = useRef(new THREE.Vector2(100, 100));
  const lastPointer = useRef(new THREE.Vector2(100, 100));
  const rippleStartedAt = useRef(-100);
  const points = useMemo<BasePoint[]>(() => {
    return Array.from({ length: COUNT }, (_, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      return {
        x: (column / (COLUMNS - 1) - 0.5) * FIELD_WIDTH,
        y: (row / (ROWS - 1) - 0.5) * FIELD_HEIGHT,
        accent: index % 60 === 0,
      };
    });
  }, []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(0.013, 0.013), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const updateColors = () => {
      const ink = new THREE.Color(readToken("--ink", "#111111"));
      const accent = new THREE.Color(readToken("--accent", "#FF4D00"));
      points.forEach((point, index) => {
        mesh.setColorAt(index, point.accent ? accent : ink);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [points]);

  useFrame((state) => {
    if (!active) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = state.clock.elapsedTime;
    const width = state.viewport.width;
    const height = state.viewport.height;
    const pointer = state.pointer;

    if (pointer.distanceToSquared(lastPointer.current) > 0.0009) {
      lastPointer.current.copy(pointer);
      cursor.current.set(
        pointer.x * width * 0.5,
        pointer.y * height * 0.5,
      );
      rippleStartedAt.current = elapsed;
    }

    const rippleAge = elapsed - rippleStartedAt.current;
    const rippleDecay = Math.exp(-Math.max(0, rippleAge) * 1.65);
    const scrollAmplitude =
      1 + Math.min(window.scrollY / 2600, 0.8);

    for (let index = 0; index < COUNT; index += 1) {
      const point = points[index];
      const envelope =
        0.2 + 0.8 * (1 - Math.pow(Math.abs(point.y) / (FIELD_HEIGHT * 0.5), 1.7));
      const waveA = Math.sin(point.x * 1.45 + elapsed * 1.1) * 0.27;
      const waveB =
        Math.sin(point.x * 3.05 - elapsed * 0.78 + point.y * 0.82) * 0.095;
      const waveC =
        Math.sin(point.x * 5.15 + point.y * 1.35 - elapsed * 1.46) * 0.032;
      const displacement =
        (waveA + waveB + waveC) * envelope * scrollAmplitude;

      const dx = point.x - cursor.current.x;
      const dy = point.y - cursor.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const cursorRipple =
        Math.sin(distance * 5.7 - rippleAge * 8.5) *
        Math.exp(-distance * 0.92) *
        rippleDecay *
        0.16;

      dummy.position.set(
        point.x,
        point.y + displacement + cursorRipple * envelope,
        displacement * 0.32,
      );
      dummy.scale.setScalar(point.accent ? 1.08 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}

export default function SignalField({ active }: { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      dpr={[1, 1.25]}
      frameloop={active ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <SignalParticles active={active} />
    </Canvas>
  );
}
