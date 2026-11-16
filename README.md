# Piyush Raj — Portfolio

https://piyushrajdev.github.io/

## Live audio spectrogram terrain

The hero visual is a 3D ridgeline built with the repository's existing React Three Fiber + Three.js stack. Each row is a time slice of an FFT spectrum: frequency is mapped logarithmically across X (80 Hz–8 kHz), time scrolls into Z, and amplitude becomes height on Y. The field uses fixed `BufferGeometry` attributes and one shader-driven points draw call; a rolling FFT buffer is updated in place rather than allocating geometry per frame.

The default signal is procedural and speech-like: moving formant bands, syllable-like amplitude envelopes, harmonic energy, fricative energy and pauses. The microphone path uses the same `SignalSource → rolling FFT → terrain renderer` pipeline. Microphone access is opt-in through the `TALK` button, uses a 2048-point `AnalyserNode` with 0.78 smoothing, and never connects the microphone source to the audio destination.

### Tunable constants

| Constant | Current value | Purpose |
| --- | ---: | --- |
| `SPECTRUM_BINS` | 80 | Log-spaced frequency columns |
| `TERRAIN_ROWS` | 56 | Time slices kept in the rolling depth buffer |
| `MIN_FREQUENCY` | 80 Hz | Lower voice-analysis bound |
| `MAX_FREQUENCY` | 8 kHz | Upper voice-analysis bound |
| `PEAK_THRESHOLD` | 0.72 | Switches points from ink to accent |
| `fftSize` | 2048 | Web Audio FFT window |
| `smoothingTimeConstant` | 0.78 | Temporal smoothing for live mic data |

### Performance and fallback behavior

- Rendering pauses when the hero leaves the viewport through `IntersectionObserver`.
- Device pixel ratio is capped at 1.75 and the WebGL renderer requests low-power mode.
- Reduced-motion users, small/low-power devices, and browsers without WebGL get a static SVG version of the same ridgeline pattern.
- Theme changes are read from the existing `--ink` and `--accent` CSS tokens, so the terrain follows the existing light/dark toggle.
- Microphone tracks are stopped and the `AudioContext` is closed when TALK is switched off or the component unmounts.
