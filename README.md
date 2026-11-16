# Piyush Raj — Portfolio

https://piyushrajdev.github.io/

## Live audio spectrogram ridgelines

The hero visual is a 2D canvas ridgeline plot. Every row is one FFT time-slice across a logarithmic frequency axis (80 Hz–8 kHz). The newest frame is inserted at the front; older frames shift deeper into the plot. Rows are drawn back-to-front, filled with the page background token to mask farther traces, then stroked in the foreground token. Only line segments above the peak threshold use the accent token.

The default signal is procedural and speech-like: moving formant bands, syllable envelopes, harmonic/fricative energy and deliberate pauses. The microphone path uses the same `SignalSource → RollingFFTBuffer → Canvas renderer` pipeline. Microphone access is opt-in through the `TALK` button, uses a 2048-point `AnalyserNode` with 0.78 smoothing, and never connects microphone audio to the output destination.

### Tunable constants

| Constant | Current value | Purpose |
| --- | ---: | --- |
| `SPECTRUM_BINS` | 88 | Log-spaced frequency columns |
| `TERRAIN_ROWS` | 44 | Time slices retained in the scrolling depth buffer |
| `MIN_FREQUENCY` | 80 Hz | Lower voice-analysis bound |
| `MAX_FREQUENCY` | 8 kHz | Upper voice-analysis bound |
| `PEAK_THRESHOLD` | 0.72 | Switches above-threshold line segments to the accent token |
| `FRAME_INTERVAL_MS` | 33.3 ms | Canvas sampling cadence (about 30 frames/second) |
| `fftSize` | 2048 | Web Audio FFT window |
| `smoothingTimeConstant` | 0.78 | Temporal smoothing for live mic data |
| `MAX_PIXEL_RATIO` | 1.75 | Canvas backing-store pixel-ratio cap |

### Rendering and lifecycle

- Canvas uses a 2D context; no Three.js, WebGL, external models or new runtime dependencies are required.
- The rolling FFT array is updated in place. The canvas is redrawn at about 30 fps while visible.
- Rendering pauses when the hero leaves the viewport or the document tab is hidden.
- A `prefers-reduced-motion` setting, small viewport, or low-power device renders one static frame.
- Canvas redraws use the existing `--paper`, `--ink`, `--accent` and `--secondary` CSS tokens, so the light/dark theme toggle updates the field and its axis.
- Microphone tracks are stopped and the `AudioContext` is closed when TALK is switched off or the component unmounts.
- No microphone permission is requested on page load. The mic is never played through the speakers.
