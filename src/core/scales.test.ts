import { describe, it, expect } from 'vitest';
import { scaleFor, getScaleDots, MAJOR_SCALE, MINOR_SCALE } from './scales';

describe('scaleFor', () => {
  it('maps major-family qualities to the major scale', () => {
    expect(scaleFor('maj')).toEqual(MAJOR_SCALE);
    expect(scaleFor('maj7')).toEqual(MAJOR_SCALE);
    expect(scaleFor('dom7')).toEqual(MAJOR_SCALE);
  });
  it('maps minor-family qualities to natural minor', () => {
    expect(scaleFor('min')).toEqual(MINOR_SCALE);
    expect(scaleFor('m7')).toEqual(MINOR_SCALE);
  });
  it('returns null for unknown qualities', () => {
    expect(scaleFor('bogus')).toBeNull();
  });
});

describe('getScaleDots', () => {
  it('only marks scale tones and flags chord tones', () => {
    // C major scale, chord tones = C E G (0,4,7)
    const dots = getScaleDots(0, 'maj', [0, 4, 7]);
    const scaleSet = new Set(MAJOR_SCALE);
    expect(dots.every((d) => scaleSet.has(d.semi))).toBe(true);
    // every dot flagged inChord iff its semitone is a chord tone
    expect(dots.every((d) => d.inChord === [0, 4, 7].includes(d.semi))).toBe(true);
    // there is at least one non-chord scale tone (e.g. the 2nd, semi 2)
    expect(dots.some((d) => d.semi === 2 && !d.inChord)).toBe(true);
  });

  it('returns nothing for a quality with no mapped scale', () => {
    expect(getScaleDots(0, 'bogus', [0, 4, 7])).toEqual([]);
  });
});
