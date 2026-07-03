import { renderKarplusStrong, stringFretToFreq } from '../core/audio';

const PLUCK_SECONDS = 1.6;

let ctx: AudioContext | null = null;

/** Lazily create/resume a shared AudioContext. Returns null if Web Audio is unavailable. */
function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    (globalThis as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null; // not cached — safe to retry once Web Audio exists
  ctx = new AC();
  return ctx;
}

/** Pluck a single frequency, optionally offset in seconds, at the given gain. */
export function pluck(freq: number, whenOffset = 0, gain = 0.7): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();

  const samples = renderKarplusStrong(freq, PLUCK_SECONDS, c.sampleRate, Math.random);
  const buffer = c.createBuffer(1, samples.length, c.sampleRate);
  buffer.getChannelData(0).set(samples);

  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(c.destination);
  src.start(c.currentTime + whenOffset);
}

/** Strum a set of frequencies with a small stagger (callers pass low->high order). */
export function strum(freqs: number[], stagger = 0.022): void {
  freqs.forEach((f, i) => pluck(f, i * stagger));
}

/** Play a single fretted note. */
export function playNote(string: number, fret: number): void {
  pluck(stringFretToFreq(string, fret));
}
