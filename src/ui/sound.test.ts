import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pluck, strum, playNote } from './sound';

const starts: number[] = [];

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  resume = vi.fn();
  createBuffer(_ch: number, len: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  createBufferSource() {
    return { buffer: null, connect() {}, start: (t: number) => starts.push(t) };
  }
  createGain() {
    return { gain: { value: 0 }, connect() {} };
  }
}

describe('ui/sound with no AudioContext', () => {
  beforeEach(() => {
    starts.length = 0;
    delete (globalThis as any).AudioContext;
    delete (globalThis as any).webkitAudioContext;
  });

  it('no-ops safely when Web Audio is unavailable', () => {
    expect(() => pluck(220)).not.toThrow();
    expect(() => strum([220, 330])).not.toThrow();
    expect(() => playNote(0, 0)).not.toThrow();
    expect(starts).toHaveLength(0);
  });
});

describe('ui/sound with a mock AudioContext', () => {
  beforeEach(() => {
    starts.length = 0;
    (globalThis as any).AudioContext = MockAudioContext;
  });
  afterEach(() => {
    delete (globalThis as any).AudioContext;
  });

  it('pluck starts one buffer source', () => {
    pluck(220);
    expect(starts).toHaveLength(1);
  });

  it('strum starts one source per frequency', () => {
    strum([110, 220, 330]);
    expect(starts).toHaveLength(3);
  });
});
