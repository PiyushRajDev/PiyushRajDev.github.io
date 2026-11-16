"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SignalFieldFallback } from "./SignalFieldFallback";

const SignalField = dynamic(() => import("./SignalField"), {
  ssr: false,
  loading: () => <SignalFieldFallback />,
});

export function SignalFieldLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(true);
  const [active, setActive] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMode = () => {
      setUseFallback(
        motionPreference.matches ||
          window.matchMedia("(max-width: 767px)").matches,
      );
    };

    updateMode();
    motionPreference.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    const element = containerRef.current;
    const observer = element
      ? new IntersectionObserver(
          ([entry]) => {
            setActive(entry.isIntersecting);
            if (entry.isIntersecting) setHasBeenVisible(true);
          },
          { rootMargin: "0px" },
        )
      : null;

    if (observer && element) observer.observe(element);

    return () => {
      motionPreference.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="signal-field" ref={containerRef} aria-hidden="true">
      {useFallback || !hasBeenVisible ? (
        <SignalFieldFallback />
      ) : (
        <SignalField active={active} />
      )}
    </div>
  );
}
