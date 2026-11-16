"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = progressRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      element.style.transform = "scaleY(0)";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.fromTo(
      element,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "max",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="scroll-rail" aria-hidden="true">
      <div ref={progressRef} className="scroll-rail__progress" />
    </div>
  );
}
