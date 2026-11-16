const COLUMNS = 36;
const ROWS = 20;

function wave(x: number, y: number) {
  const envelope = 0.24 + 0.76 * (1 - Math.pow(Math.abs(y) / 1.7, 1.7));
  return (
    (Math.sin(x * 1.45) * 0.28 +
      Math.sin(x * 3.1 + y * 0.8) * 0.1 +
      Math.sin(x * 5.2 - y * 1.4) * 0.035) *
    envelope
  );
}

export function SignalFieldFallback() {
  const points = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = (column / (COLUMNS - 1)) * 760;
    const yBase = (row / (ROWS - 1)) * 320;
    const normalizedX = column / (COLUMNS - 1) * 7 - 3.5;
    const normalizedY = row / (ROWS - 1) * 3.4 - 1.7;
    const y = yBase - wave(normalizedX, normalizedY) * 72;
    return {
      key: index,
      x,
      y,
      accent: index % 60 === 0,
      opacity: 0.45 + (1 - Math.abs(normalizedY) / 2) * 0.5,
    };
  });

  return (
    <svg
      className="signal-field-fallback"
      viewBox="0 0 760 320"
      role="img"
      aria-label="A static field of points arranged in a layered voice-wave pattern"
    >
      {points.map((point) => (
        <circle
          key={point.key}
          cx={point.x}
          cy={point.y}
          r={point.accent ? 1.45 : 1.1}
          opacity={point.opacity}
          className={point.accent ? "signal-field__accent" : "signal-field__point"}
        />
      ))}
    </svg>
  );
}
