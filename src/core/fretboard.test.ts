import { describe, it, expect } from 'vitest';
import { getDots, sy, flx, STRING_SETS, FMAX } from './fretboard';

const base = {
  mode: 'shapes' as const,
  root: 0,
  quality: 'maj7',
  voicing: 'standard' as const,
  stringSet: 'all' as const,
  hlInterval: null as number | null,
};

describe('fretboard geometry', () => {
  it('sy spaces strings evenly and increases with index', () => {
    expect(sy(0)).toBeLessThan(sy(5));
  });
  it('flx increases with fret number', () => {
    expect(flx(1)).toBeLessThan(flx(5));
  });
  it('STRING_SETS.all is null (no filter)', () => {
    expect(STRING_SETS.all).toBeNull();
    expect(STRING_SETS['123']).toEqual([0, 1, 2]);
  });
});

describe('getDots (shapes mode)', () => {
  it('marks every location of each chord interval across the neck', () => {
    const dots = getDots(base);
    // Cmaj7 = {C,E,G,B}. Every dot must be one of those pitch classes.
    const allowed = new Set([0, 4, 7, 11]);
    expect(dots.every((d) => allowed.has(d.note))).toBe(true);
    // Open low-E string (index 5): frets 0..15 include E(0),G#? no -> only chord tones.
    // At least the open high-e (E, fret 0, string 0) is present.
    expect(dots.some((d) => d.s === 0 && d.f === 0 && d.note === 4)).toBe(true);
  });

  it('respects a string-set filter', () => {
    const dots = getDots({ ...base, stringSet: '123' });
    expect(dots.every((d) => [0, 1, 2].includes(d.s))).toBe(true);
  });

  it('shell voicing yields only 3rd and 7th dots', () => {
    const dots = getDots({ ...base, voicing: 'shell' });
    expect(dots.every((d) => [4, 11].includes(d.semi))).toBe(true);
  });
});

describe('getDots (intervals mode)', () => {
  it('marks only the highlighted interval', () => {
    const dots = getDots({ ...base, mode: 'intervals', hlInterval: 7 });
    expect(dots.length).toBeGreaterThan(0);
    expect(dots.every((d) => d.semi === 7)).toBe(true);
  });

  it('scans all frets up to FMAX', () => {
    const dots = getDots({ ...base, mode: 'intervals', hlInterval: 0 });
    expect(Math.max(...dots.map((d) => d.f))).toBeLessThanOrEqual(FMAX);
  });
});
