"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  createSynthSignalSource,
  MicrophoneSignalSource,
  type SignalMeta,
  type SignalMode,
} from "./audio/signalSource";
import { SignalMicToggle } from "./SignalMicToggle";
import { SignalFieldFallback } from "./SignalFieldFallback";

const SignalField = dynamic(() => import("./SignalField"), {
  ssr: false,
  loading: () => <SignalFieldFallback />,
});

type MicStatus = "sim" | "live" | "denied";

function hasWebGLSupport() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

function shouldUseStaticMode() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const smallScreen = window.matchMedia("(max-width: 767px)").matches;
  const deviceMemory =
    "deviceMemory" in navigator
      ? Number(
          (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
        )
      : undefined;
  const lowPower =
    (deviceMemory !== undefined && deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency <= 4);

  return reducedMotion || smallScreen || lowPower || !hasWebGLSupport();
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SignalFieldLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const synthRef = useRef(createSynthSignalSource());
  const micRef = useRef<MicrophoneSignalSource | null>(null);

  const [useFallback, setUseFallback] = useState(() =>
    typeof window === "undefined" ? true : shouldUseStaticMode(),
  );
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined" ? false : getReducedMotionPreference(),
  );
  const [active, setActive] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [mode, setMode] = useState<SignalMode>("sim");
  const [status, setStatus] = useState<MicStatus>("sim");
  const [pending, setPending] = useState(false);
  const [meta, setMeta] = useState<SignalMeta>({ mode: "sim" });

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateEnvironment = () => {
      const nextReducedMotion = motionPreference.matches;
      const nextStaticMode = shouldUseStaticMode();

      setReducedMotion(nextReducedMotion);
      setUseFallback(nextStaticMode);

      if (nextStaticMode && micRef.current) {
        const mic = micRef.current;
        micRef.current = null;
        void mic.dispose();

        if (mountedRef.current) {
          setMode("sim");
          setStatus("sim");
          setMeta(synthRef.current.meta);
        }
      }
    };

    motionPreference.addEventListener("change", updateEnvironment);
    window.addEventListener("resize", updateEnvironment);

    const element = containerRef.current;
    const observer = element
      ? new IntersectionObserver(
          ([entry]) => {
            setActive(entry.isIntersecting);
            if (entry.isIntersecting) setHasBeenVisible(true);
          },
          { rootMargin: "80px" },
        )
      : null;

    if (observer && element) observer.observe(element);

    return () => {
      mountedRef.current = false;
      motionPreference.removeEventListener("change", updateEnvironment);
      window.removeEventListener("resize", updateEnvironment);
      observer?.disconnect();

      const mic = micRef.current;
      micRef.current = null;
      void mic?.dispose();
    };
  }, []);

  const handleMicToggle = async () => {
    if (pending || !mountedRef.current) return;

    if (micRef.current) {
      const mic = micRef.current;
      micRef.current = null;
      await mic.dispose();

      if (!mountedRef.current) return;

      setMode("sim");
      setStatus("sim");
      setMeta(synthRef.current.meta);
      return;
    }

    setPending(true);

    try {
      const mic = await MicrophoneSignalSource.create();

      if (!mountedRef.current) {
        await mic.dispose();
        return;
      }

      micRef.current = mic;
      setMode("live");
      setStatus("live");
      setMeta(mic.meta);
    } catch {
      if (!mountedRef.current) return;

      setStatus("denied");
      setMode("sim");
      setMeta(synthRef.current.meta);
    } finally {
      if (mountedRef.current) setPending(false);
    }
  };

  const source = micRef.current ?? synthRef.current;

  const metaLabel =
    meta.mode === "live" && meta.fftSize && meta.sampleRate
      ? `FFT ${meta.fftSize} / ${Math.round(meta.sampleRate / 1000)}kHz`
      : "LOG 80–8000Hz";

  const showInteractive = !useFallback && !reducedMotion && hasBeenVisible;

  return (
    <div className="signal-field" ref={containerRef}>
      <div className="signal-field__canvas" aria-hidden="true">
        {useFallback || !hasBeenVisible ? (
          <SignalFieldFallback />
        ) : (
          <SignalField active={active} source={source} />
        )}
      </div>

      {showInteractive ? (
        <SignalMicToggle
          mode={mode}
          status={status}
          pending={pending}
          metaLabel={metaLabel}
          onToggle={() => void handleMicToggle()}
        />
      ) : null}
    </div>
  );
}
