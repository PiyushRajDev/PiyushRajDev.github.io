export const SPECTRUM_BINS = 88;
export const TERRAIN_ROWS = 44;
export const MIN_FREQUENCY = 80;
export const MAX_FREQUENCY = 8000;
export const PEAK_THRESHOLD = 0.72;

export type SignalMode = "sim" | "live";

export type SignalMeta = {
  mode: SignalMode;
  fftSize?: number;
  sampleRate?: number;
};

export interface SignalSource {
  readonly meta: SignalMeta;
  read(target: Float32Array, timeSeconds: number): void;
  dispose(): Promise<void> | void;
}

export const FREQUENCIES = Array.from(
  { length: SPECTRUM_BINS },
  (_, index) => {
    const ratio = index / (SPECTRUM_BINS - 1);
    return MIN_FREQUENCY * Math.pow(MAX_FREQUENCY / MIN_FREQUENCY, ratio);
  },
);

const SYLLABLES = [
  { center: 0.45, width: 0.5 },
  { center: 1.18, width: 0.48 },
  { center: 2.02, width: 0.62 },
  { center: 3.12, width: 0.56 },
  { center: 4.28, width: 0.52 },
  { center: 5.08, width: 0.58 },
  { center: 6.36, width: 0.54 },
  { center: 7.48, width: 0.5 },
] as const;

const SYNTH_CYCLE = 8.4;

function wrappedDistance(time: number, center: number) {
  const delta = Math.abs(
    ((time - center + SYNTH_CYCLE / 2) % SYNTH_CYCLE) -
      SYNTH_CYCLE / 2,
  );
  return delta;
}

function syllableEnvelope(time: number) {
  let envelope = 0;

  for (const syllable of SYLLABLES) {
    const distance = wrappedDistance(time, syllable.center);
    const pulse = Math.max(0, 1 - distance / syllable.width);
    envelope = Math.max(envelope, pulse * pulse);
  }

  return envelope;
}

function gaussian(value: number, center: number, width: number) {
  const normalized = (value - center) / width;
  return Math.exp(-0.5 * normalized * normalized);
}

function logGaussian(
  frequency: number,
  center: number,
  widthOctaves: number,
) {
  const normalized = Math.log2(frequency / center) / widthOctaves;
  return Math.exp(-0.5 * normalized * normalized);
}

function synthesizeSpectrum(target: Float32Array, timeSeconds: number) {
  const time = ((timeSeconds % SYNTH_CYCLE) + SYNTH_CYCLE) % SYNTH_CYCLE;
  const envelope = syllableEnvelope(time);
  const vowelShift = Math.sin(time * 0.9) * 70;
  const formant1 = 520 + vowelShift;
  const formant2 = 1480 + Math.sin(time * 0.65) * 150;
  const formant3 = 2520 + Math.sin(time * 0.42 + 1.2) * 230;
  const harmonicMotion = Math.sin(time * 2.7) * 0.08;

  for (let index = 0; index < FREQUENCIES.length; index += 1) {
    const frequency = FREQUENCIES[index];

    const lowBody =
      0.18 * logGaussian(frequency, 180, 0.62) +
      0.1 * logGaussian(frequency, 320, 0.48);

    const formants =
      0.95 * gaussian(frequency, formant1, 105) +
      0.7 * gaussian(frequency, formant2, 190) +
      0.48 * gaussian(frequency, formant3, 270);

    const fricativeBand =
      (0.12 + 0.1 * Math.sin(time * 1.3)) *
      logGaussian(frequency, 4300, 0.34);

    const harmonics =
      (0.12 + harmonicMotion) *
      Math.max(0, Math.sin(frequency * 0.0042 + time * 1.7));

    const band =
      envelope * (lowBody + formants + fricativeBand + harmonics);

    const roomBed =
      0.018 *
      logGaussian(frequency, 900, 1.35) *
      (0.5 + 0.5 * Math.sin(time * 0.37));

    target[index] = Math.min(1, Math.max(0, band + roomBed));
  }
}

export class SynthSignalSource implements SignalSource {
  readonly meta: SignalMeta = { mode: "sim" };

  read(target: Float32Array, timeSeconds: number) {
    synthesizeSpectrum(target, timeSeconds);
  }

  dispose() {}
}

type IndexedFrequency = {
  lower: number;
  upper: number;
  mix: number;
};

export class MicrophoneSignalSource implements SignalSource {
  readonly meta: SignalMeta;

  private readonly analyser: AnalyserNode;
  private readonly context: AudioContext;
  private readonly stream: MediaStream;
  private readonly data: Float32Array<ArrayBuffer>;
  private readonly indexes: IndexedFrequency[];

  private constructor(
    context: AudioContext,
    analyser: AnalyserNode,
    stream: MediaStream,
  ) {
    this.context = context;
    this.analyser = analyser;
    this.stream = stream;
    this.data = new Float32Array(
      new ArrayBuffer(
        analyser.frequencyBinCount * Float32Array.BYTES_PER_ELEMENT,
      ),
    );

    this.indexes = FREQUENCIES.map((frequency) => {
      const exactIndex =
        (frequency / context.sampleRate) * analyser.fftSize;
      const lower = Math.floor(exactIndex);

      return {
        lower,
        upper: Math.min(lower + 1, analyser.frequencyBinCount - 1),
        mix: exactIndex - lower,
      };
    });

    this.meta = {
      mode: "live",
      fftSize: analyser.fftSize,
      sampleRate: context.sampleRate,
    };
  }

  static async create() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone input is unavailable.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    let context: AudioContext | null = null;

    try {
      context = new AudioContext();
      const analyser = context.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.78;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -20;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      if (context.state === "suspended") {
        await context.resume();
      }

      return new MicrophoneSignalSource(context, analyser, stream);
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());

      if (context && context.state !== "closed") {
        await context.close().catch(() => undefined);
      }

      throw error;
    }
  }

  read(target: Float32Array) {
    this.analyser.getFloatFrequencyData(this.data);

    for (let index = 0; index < this.indexes.length; index += 1) {
      const { lower, upper, mix } = this.indexes[index];
      const lowerDb = this.data[lower];
      const upperDb = this.data[upper];

      const lowerValue = Number.isFinite(lowerDb)
        ? (lowerDb + 100) / 80
        : 0;
      const upperValue = Number.isFinite(upperDb)
        ? (upperDb + 100) / 80
        : 0;

      const value = lowerValue + (upperValue - lowerValue) * mix;
      target[index] = Math.pow(Math.min(1, Math.max(0, value)), 1.12);
    }
  }

  async dispose() {
    this.stream.getTracks().forEach((track) => track.stop());

    if (this.context.state !== "closed") {
      await this.context.close();
    }
  }
}

export function createSynthSignalSource() {
  return new SynthSignalSource();
}
