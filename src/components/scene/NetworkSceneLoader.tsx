"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NetworkFallback } from "./NetworkFallback";

const NetworkScene = dynamic(() => import("./NetworkScene"), {
  ssr: false,
  loading: () => <NetworkFallback />,
});

export function NetworkSceneLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [fallback, setFallback] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setFallback(media.matches || window.innerWidth < 768);
    };

    updateMode();
    media.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    const element = containerRef.current;
    if (!element) {
      return () => {
        media.removeEventListener("change", updateMode);
        window.removeEventListener("resize", updateMode);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(element);

    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      media.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
      observer.disconnect();
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="network-scene"
      aria-label="Distributed system network visualization"
    >
      {fallback ? (
        <NetworkFallback />
      ) : (
        <NetworkScene progressRef={progressRef} active={active} />
      )}
      <div className="network-scene__caption">
        <span>NODE GRAPH / 3D-01</span>
        <span>REQUEST ROUTE ACTIVE</span>
      </div>
    </div>
  );
}
