"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

const NODES = [
  { label: "Client", position: [-2.65, 1.15, 0.0] as [number, number, number] },
  { label: "Edge", position: [-1.65, -0.05, 0.16] as [number, number, number] },
  { label: "Redis", position: [-0.65, 1.05, -0.12] as [number, number, number] },
  { label: "BullMQ queue", position: [0.42, -0.08, 0.04] as [number, number, number] },
  { label: "Worker", position: [1.65, 1.05, 0.12] as [number, number, number] },
  { label: "Postgres", position: [1.45, -1.12, -0.16] as [number, number, number] },
  { label: "Elasticsearch", position: [-0.35, -1.28, 0.12] as [number, number, number] },
] as const;

const REQUEST_ROUTE = [0, 1, 2, 3, 4, 5, 6] as const;
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [2, 6],
  [4, 6],
];

const REQUEST_CYCLE_SECONDS = 14;

function NetworkGraph() {
  const graphRef = useRef<THREE.Group>(null);
  const requestRef = useRef<THREE.Mesh>(null);
  const routeVectors = useMemo(
    () =>
      REQUEST_ROUTE.map(
        (index) => new THREE.Vector3(...NODES[index].position),
      ),
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

    const cycle = (state.clock.elapsedTime % REQUEST_CYCLE_SECONDS) /
      REQUEST_CYCLE_SECONDS;
    const routePosition = cycle * (routeVectors.length - 1);
    const segment = Math.min(
      Math.floor(routePosition),
      routeVectors.length - 2,
    );
    const segmentProgress = routePosition - segment;
    const easedProgress =
      segmentProgress * segmentProgress * (3 - 2 * segmentProgress);

    scratch.from.copy(routeVectors[segment]);
    scratch.to.copy(routeVectors[segment + 1]);
    request.position.lerpVectors(scratch.from, scratch.to, easedProgress);

    const targetX = state.pointer.y * 0.075;
    const targetY = state.pointer.x * 0.12;
    const easing = Math.min(1, delta * 2.5);
    graph.rotation.x += (targetX - graph.rotation.x) * easing;
    graph.rotation.y += (targetY - graph.rotation.y) * easing;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.1;
    request.scale.setScalar(pulse);
  });

  return (
    <group ref={graphRef}>
      {CONNECTIONS.map(([from, to], index) => (
        <Line
          key={`${from}-${to}-${index}`}
          points={[NODES[from].position, NODES[to].position]}
          color="#111111"
          lineWidth={0.85}
          transparent
          opacity={0.72}
        />
      ))}

      {NODES.map((node) => (
        <group key={node.label} position={node.position}>
          <mesh>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <Html
            position={[0, -0.22, 0]}
            center
            transform={false}
            occlude={false}
            zIndexRange={[2, 0]}
          >
            <span className="network-node-label">{node.label}</span>
          </Html>
        </group>
      ))}

      <mesh ref={requestRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#FF4D00" />
      </mesh>
    </group>
  );
}

export default function NetworkScene({ active }: { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.0], fov: 42 }}
      dpr={[1, 1.35]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#F3F1EA", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <NetworkGraph />
    </Canvas>
  );
}
