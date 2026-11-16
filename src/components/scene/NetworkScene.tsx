"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_POSITIONS: [number, number, number][] = [
  [-2.4, 0.8, 0.1],
  [-1.45, 1.55, -0.15],
  [-0.25, 1.0, 0.45],
  [1.0, 1.55, -0.1],
  [2.25, 0.65, 0.25],
  [-1.85, -0.55, 0.45],
  [-0.45, -0.2, -0.7],
  [0.85, -0.55, 0.3],
  [2.0, -1.0, -0.35],
  [-1.0, -1.45, -0.15],
  [0.45, -1.55, 0.15],
  [1.45, 0.4, 1.05],
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 2], [2, 7],
  [7, 8], [8, 10], [10, 9], [9, 5],
  [3, 11], [11, 7], [6, 10], [4, 8],
  [1, 6], [5, 2], [7, 4],
];

const REQUEST_PATH = [0, 5, 6, 2, 3, 11, 7, 8, 4];

function NetworkGraph({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const graphRef = useRef<THREE.Group>(null);
  const requestRef = useRef<THREE.Mesh>(null);
  const routeVectors = useMemo(
    () => REQUEST_PATH.map((index) => new THREE.Vector3(...NODE_POSITIONS[index])),
    [],
  );
  const scratch = useMemo(
    () => ({ from: new THREE.Vector3(), to: new THREE.Vector3() }),
    [],
  );

  useFrame((state, delta) => {
    const graph = graphRef.current;
    const request = requestRef.current;
    if (!graph || !request) return;

    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 0.999);
    const routePosition = progress * (routeVectors.length - 1);
    const segment = Math.floor(routePosition);
    const localProgress = routePosition - segment;

    scratch.from.copy(routeVectors[segment]);
    scratch.to.copy(routeVectors[Math.min(segment + 1, routeVectors.length - 1)]);
    request.position.lerpVectors(scratch.from, scratch.to, localProgress);

    const targetX = state.pointer.y * 0.12 + (progress - 0.5) * 0.13;
    const targetY = state.pointer.x * 0.18 + (progress - 0.5) * 0.42;
    graph.rotation.x += (targetX - graph.rotation.x) * Math.min(1, delta * 3);
    graph.rotation.y += (targetY - graph.rotation.y) * Math.min(1, delta * 3);

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.12;
    request.scale.setScalar(pulse);
  });

  return (
    <group ref={graphRef}>
      {CONNECTIONS.map(([from, to], index) => (
        <Line
          key={`${from}-${to}-${index}`}
          points={[NODE_POSITIONS[from], NODE_POSITIONS[to]]}
          color="#111111"
          lineWidth={0.8}
          transparent
          opacity={0.52}
        />
      ))}

      {NODE_POSITIONS.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      ))}

      <mesh ref={requestRef}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color="#FF4D00" />
      </mesh>
    </group>
  );
}

export default function NetworkScene({
  progressRef,
  active,
}: {
  progressRef: MutableRefObject<number>;
  active: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.3], fov: 38 }}
      dpr={[1, 1.4]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#F3F1EA", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <NetworkGraph progressRef={progressRef} />
    </Canvas>
  );
}
