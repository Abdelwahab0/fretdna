import { describe, it, expect } from 'vitest';
import { voicingsFor, assignFingers } from './voicings';

function fingerRow(notes: { string: number; finger: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.finger;
  return row;
}

describe('assignFingers', () => {
  it('open chord: fret 0 = finger 0 (open), higher frets numbered by ascending fret', () => {
    // open E major shape frets [0,0,1,2,2,0]
    const notes = [
      { string: 0, fret: 0, semi: 0 },
      { string: 1, fret: 0, semi: 7 },
      { string: 2, fret: 1, semi: 4 },
      { string: 3, fret: 2, semi: 0 },
      { string: 4, fret: 2, semi: 7 },
      { string: 5, fret: 0, semi: 0 },
    ];
    expect(fingerRow(assignFingers(0, notes))).toEqual([0, 0, 1, 2, 2, 0]);
  });

  it('barre chord: notes at baseFret = finger 1, higher frets numbered 2,3,4', () => {
    // F major (E-shape at fret 1): frets [1,1,2,3,3,1]
    const notes = [
      { string: 0, fret: 1, semi: 0 },
      { string: 1, fret: 1, semi: 7 },
      { string: 2, fret: 2, semi: 4 },
      { string: 3, fret: 3, semi: 0 },
      { string: 4, fret: 3, semi: 7 },
      { string: 5, fret: 1, semi: 0 },
    ];
    expect(fingerRow(assignFingers(1, notes))).toEqual([1, 1, 2, 3, 3, 1]);
  });
});

describe('voicingsFor', () => {
  it('major returns 5 shapes in CAGED order', () => {
    const vs = voicingsFor(0, 'maj'); // C major
    expect(vs.map((v) => v.shape)).toEqual(['C', 'A', 'G', 'E', 'D']);
  });

  it('minor returns 3 shapes (E, A, D)', () => {
    const vs = voicingsFor(9, 'min'); // A minor
    expect(vs.map((v) => v.shape)).toEqual(['E', 'A', 'D']);
  });

  it('every note in every voicing is a real chord tone', () => {
    const majTones = new Set([0, 4, 7]); // root, 3, 5
    for (const v of voicingsFor(0, 'maj')) {
      for (const n of v.notes) expect(majTones.has(n.semi)).toBe(true);
    }
    const minTones = new Set([0, 3, 7]); // root, b3, 5
    for (const v of voicingsFor(9, 'min')) {
      for (const n of v.notes) expect(minTones.has(n.semi)).toBe(true);
    }
  });

  it('every voicing spans at most 4 frets among its fretted notes', () => {
    for (const v of voicingsFor(0, 'maj')) {
      const fretted = v.notes.filter((n) => n.fret > 0).map((n) => n.fret);
      if (fretted.length > 1) {
        expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(4);
      }
    }
  });

  it('the C-major C-shape voicing is the open C chord with fingers', () => {
    const cShape = voicingsFor(0, 'maj').find((v) => v.shape === 'C')!;
    expect(cShape.baseFret).toBe(0);
    expect(fingerRow(cShape.notes)).toEqual([0, 1, 0, 2, 3, -1]);
  });
});
