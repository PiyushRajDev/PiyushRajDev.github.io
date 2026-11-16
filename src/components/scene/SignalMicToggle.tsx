"use client";

import type { SignalMode } from "./audio/signalSource";

type SignalMicToggleProps = {
  mode: SignalMode;
  status: "sim" | "live" | "denied";
  pending: boolean;
  metaLabel: string;
  onToggle: () => void;
};

export function SignalMicToggle({
  mode,
  status,
  pending,
  metaLabel,
  onToggle,
}: SignalMicToggleProps) {
  return (
    <div className="signal-field__controls">
      <button
        type="button"
        className="signal-field__toggle"
        aria-pressed={mode === "live"}
        onClick={onToggle}
        disabled={pending}
      >
        TALK
      </button>
      <span className="signal-field__status" role="status">
        {status === "live" ? "MIC: LIVE" : status === "denied" ? "MIC: DENIED" : "SIM"}
      </span>
      <span className="signal-field__meta">{metaLabel}</span>
    </div>
  );
}
