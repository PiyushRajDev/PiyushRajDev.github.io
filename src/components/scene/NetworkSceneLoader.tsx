"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NetworkFallback } from "./NetworkFallback";

const NetworkScene = dynamic(() => import("./NetworkScene"), {
  ssr: false,
  loading: () => <NetworkFallback animated={false} />,
});

export function NetworkSceneLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(true);
  const [animateFallback, setAnimateFallback] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMode = () => {
      const reducedMotion = motionPreference.matches;
      const useFallback = reducedMotion || window.innerWidth < 768;
      setFallback(useFallback);
      setAnimateFallback(!reducedMotion);
    };

    updateMode();
    motionPreference.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    const element = containerRef.current;
    if (!element) {
      return () => {
        motionPreference.removeEventListener("change", updateMode);
        window.removeEventListener("resize", updateMode);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(element);

    return () => {
      motionPreference.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="network-scene"
      role="img"
      aria-label="Client to Edge to Redis to BullMQ queue to Worker to Postgres to Elasticsearch"
    >
      {fallback ? (
        <NetworkFallback animated={animateFallback} />
      ) : (
        <NetworkScene active={active} />
      )}
    </div>
  );
}
