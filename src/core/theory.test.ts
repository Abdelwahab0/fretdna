import { describe, it, expect } from 'vitest';
import { noteAt, semitoneFrom, intervalName, NOTES, TUNING, SC } from './theory';

describe('theory', () => {
  it('has 12 note names and 6 strings', () => {
    expect(NOTES).toHaveLength(12);
    expect(SC).toBe(6);
    expect(TUNING).toEqual([4, 11, 7, 2, 9, 4]);
  });

  it('noteAt returns the open-string pitch class at fret 0', () => {
    expect(noteAt(5, 0)).toBe(4);  // low E
    expect(noteAt(0, 0)).toBe(4);  // high e
    expect(noteAt(4, 0)).toBe(9);  // A
  });

  it('noteAt wraps past the octave', () => {
    expect(noteAt(0, 12)).toBe(4); // high e, 12th fret = E again
    expect(noteAt(5, 3)).toBe(7);  // low E + 3 = G
  });

  it('semitoneFrom computes the interval from a root', () => {
    expect(semitoneFrom(0, 4)).toBe(4);   // C -> E = major 3rd
    expect(semitoneFrom(4, 0)).toBe(8);   // E -> C = 8 semitones
    expect(semitoneFrom(0, 0)).toBe(0);
  });

  it('intervalName maps semitones to interval labels', () => {
    expect(intervalName(0)).toBe('R');
    expect(intervalName(4)).toBe('3');
    expect(intervalName(11)).toBe('Δ7');
  });
});
