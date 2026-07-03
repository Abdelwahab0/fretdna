import { getChordIntervals } from './chords';

/** MIDI note of each open string, index 0..5 = high-e .. low-E (E4 B3 G3 D3 A2 E2). */
export const STRING_MIDI = [64, 59, 55, 50, 45, 40];

/** Equal-tempered frequency of a MIDI note (A4 = MIDI 69 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Frequency of a fretted note. string 0..5 (high-e..low-E), fret >= 0. */
export function stringFretToFreq(string: number, fret: number): number {
  return midiToFreq(STRING_MIDI[string] + fret);
}

/**
 * Ascending frequencies for a chord's tones in a comfortable low register.
 * Root sits near C3 (MIDI 48 + rootPc); the chord's intervals stack above it.
 * Empty for an unknown quality.
 */
export function chordFreqs(rootPc: number, quality: string): number[] {
  return getChordIntervals(quality).map((semi) => midiToFreq(48 + rootPc + semi));
}

/**
 * Karplus-Strong plucked string as a pure function. Seeds a ring buffer of
 * length round(sampleRate/freq) with noise from rng(), then repeatedly averages
 * adjacent samples (a one-zero lowpass) with a decay factor, emitting one sample
 * per step. Returns round(seconds*sampleRate) samples in roughly [-1, 1].
 */
export function renderKarplusStrong(
  freq: number,
  seconds: number,
  sampleRate: number,
  rng: () => number,
): Float32Array {
  const N = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = rng() * 2 - 1;

  const out = new Float32Array(Math.round(seconds * sampleRate));
  const decay = 0.996;
  let idx = 0;
  for (let i = 0; i < out.length; i++) {
    const cur = ring[idx];
    const nxt = (idx + 1) % N;
    ring[idx] = decay * 0.5 * (cur + ring[nxt]);
    out[i] = cur;
    idx = nxt;
  }
  return out;
}
