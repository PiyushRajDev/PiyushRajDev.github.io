"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSynthSignalSource,
  MicrophoneSignalSource,
  type SignalMeta,
  type SignalMode,
} from "./audio/signalSource";
import SignalField from "./SignalField";
import { SignalMicToggle } from "./SignalMicToggle";

type MicStatus = "sim" | "live" | "denied";

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

  return reducedMotion || smallScreen || lowPower;
}

function disposeMic(mic: MicrophoneSignalSource | null) {
  if (mic) {
    void mic.dispose().catch(() => undefined);
  }
}

export function SignalFieldLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const intersectingRef = useRef(false);
  const pendingRef = useRef(false);
  const synthRef = useRef(createSynthSignalSource());
  const micRef = useRef<MicrophoneSignalSource | null>(null);

  const [active, setActive] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [mode, setMode] = useState<SignalMode>("sim");
  const [status, setStatus] = useState<MicStatus>("sim");
  const [pending, setPending] = useState(false);
  const [meta, setMeta] = useState<SignalMeta>({ mode: "sim" });

  useEffect(() => {
    mountedRef.current = true;

    const updateEnvironment = () => {
      setStaticMode(shouldUseStaticMode());
    };

    const updateActivity = () => {
      setActive(intersectingRef.current && !document.hidden);
    };

    const element = containerRef.current;
    const observer = element
      ? new IntersectionObserver(
          ([entry]) => {
            intersectingRef.current = entry.isIntersecting;
            updateActivity();
          },
          { rootMargin: "80px" },
        )
      : null;

    if (observer && element) observer.observe(element);

    updateEnvironment();
    updateActivity();

    window.addEventListener("resize", updateEnvironment);
    window.addEventListener("orientationchange", updateEnvironment);
    document.addEventListener("visibilitychange", updateActivity);

    return () => {
      mountedRef.current = false;
      observer?.disconnect();
      window.removeEventListener("resize", updateEnvironment);
      window.removeEventListener("orientationchange", updateEnvironment);
      document.removeEventListener("visibilitychange", updateActivity);

      const mic = micRef.current;
      micRef.current = null;
      disposeMic(mic);
    };
  }, []);

  const handleMicToggle = async () => {
    if (pendingRef.current || !mountedRef.current) return;

    pendingRef.current = true;
    setPending(true);

    try {
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

      // Permission is requested only in response to this explicit click.
      const mic = await MicrophoneSignalSource.create();

      if (!mountedRef.current) {
        disposeMic(mic);
        return;
      }

      micRef.current = mic;
      setMode("live");
      setStatus("live");
      setMeta(mic.meta);
    } catch {
      if (!mountedRef.current) return;

      setMode("sim");
      setStatus("denied");
      setMeta(synthRef.current.meta);
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  };

  const source = micRef.current ?? synthRef.current;
  const metaLabel =
    meta.mode === "live" && meta.fftSize && meta.sampleRate
      ? `FFT ${meta.fftSize} / ${Math.round(meta.sampleRate / 1000)}kHz`
      : "LOG 80–8000Hz";

  return (
    <div className="signal-field" ref={containerRef}>
      <div className="signal-field__canvas">
        <SignalField
          active={active}
          staticMode={staticMode}
          source={source}
        />
      </div>

      <span className="signal-field__time-label" aria-hidden="true">
        TIME →
      </span>

      <SignalMicToggle
        mode={mode}
        status={status}
        pending={pending}
        metaLabel={metaLabel}
        onToggle={() => void handleMicToggle()}
      />
    </div>
  );
}
