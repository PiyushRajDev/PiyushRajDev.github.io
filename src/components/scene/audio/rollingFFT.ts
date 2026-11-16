export class RollingFFTBuffer {
  readonly rows: number;
  readonly bins: number;
  readonly data: Float32Array;

  constructor(rows: number, bins: number) {
    this.rows = rows;
    this.bins = bins;
    this.data = new Float32Array(rows * bins);
  }

  push(frame: Float32Array) {
    if (frame.length !== this.bins) {
      throw new Error("FFT frame length does not match the rolling buffer.");
    }

    this.data.copyWithin(this.bins, 0, this.data.length - this.bins);
    this.data.set(frame, 0);
  }

  value(row: number, bin: number) {
    return this.data[row * this.bins + bin];
  }

  clear() {
    this.data.fill(0);
  }
}
