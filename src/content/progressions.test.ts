import { describe, it, expect } from 'vitest';
import { chord, FEATURED, LIBRARY, STYLES } from './progressions';
import { QTYPES } from '../core/chords';

describe('progressions content', () => {
  it('chord() builds a labelled Chord from name + quality', () => {
    expect(chord('C', 'maj7')).toEqual({ root: 0, quality: 'maj7', label: 'Cmaj7' });
    expect(chord('F', 'dom9').label).toBe('F9');
  });

  it('has featured and library entries', () => {
    expect(FEATURED.length).toBeGreaterThan(0);
    expect(LIBRARY.length).toBeGreaterThan(0);
  });

  it('every chord references a real quality', () => {
    const all = [...FEATURED, ...LIBRARY];
    for (const p of all) {
      for (const c of p.chords) {
        expect(QTYPES[c.quality], `${p.id} uses unknown quality ${c.quality}`).toBeDefined();
      }
    }
  });

  it('STYLES lists every style used', () => {
    const used = new Set([...FEATURED, ...LIBRARY].map((p) => p.style));
    for (const s of used) expect(STYLES).toContain(s);
  });
});
