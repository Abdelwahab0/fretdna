import { describe, it, expect } from 'vitest';
import {
  midiToFreq, stringFretToFreq, chordFreqs, renderKarplusStrong,
} from './audio';

const seededRng = () => {
  let s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

describe('pitch math', () => {
  it('midiToFreq: A4 (MIDI 69) is 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
  });

  it('stringFretToFreq: open strings match standard tuning', () => {
    expect(stringFretToFreq(5, 0)).toBeCloseTo(82.41, 1);  // low E (E2)
    expect(stringFretToFreq(0, 0)).toBeCloseTo(329.63, 1); // high e (E4)
    expect(stringFretToFreq(4, 12)).toBeCloseTo(220.0, 1); // A string, 12th fret = A3
  });

  it('chordFreqs: C major triad gives three ascending freqs', () => {
    const f = chordFreqs(0, 'maj');
    expect(f).toHaveLength(3);
    expect(f[0]).toBeLessThan(f[1]);
    expect(f[1]).toBeLessThan(f[2]);
  });

  it('chordFreqs: unknown quality returns []', () => {
    expect(chordFreqs(0, 'bogus')).toEqual([]);
  });
});

describe('renderKarplusStrong', () => {
  it('returns round(seconds*sampleRate) samples', () => {
    const buf = renderKarplusStrong(220, 0.5, 44100, seededRng());
    expect(buf.length).toBe(Math.round(0.5 * 44100));
  });

  it('produces a non-silent, decaying signal', () => {
    const buf = renderKarplusStrong(220, 1, 44100, seededRng());
    const meanAbs = (a: Float32Array, start: number, n: number) => {
      let sum = 0;
      for (let i = start; i < start + n; i++) sum += Math.abs(a[i]);
      return sum / n;
    };
    const early = meanAbs(buf, 0, 200);
    const late = meanAbs(buf, buf.length - 200, 200);
    expect(early).toBeGreaterThan(0.01);   // non-silent
    expect(late).toBeLessThan(early);      // decays over time
  });

  it('clamps the ring buffer to at least 2 samples for very high freqs', () => {
    // freq == sampleRate would give N=1; must not crash or divide oddly.
    const buf = renderKarplusStrong(44100, 0.01, 44100, seededRng());
    expect(buf.length).toBe(Math.round(0.01 * 44100));
  });
});
