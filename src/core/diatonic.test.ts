import { describe, it, expect } from 'vitest';
import { diatonicTriads, triadTonesInWindow } from './diatonic';

describe('diatonicTriads', () => {
  it('harmonizes C major into I ii iii IV V vi vii°', () => {
    const t = diatonicTriads(0, 'maj'); // C major
    expect(t.map((x) => x.label)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    expect(t.map((x) => x.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    expect(t.map((x) => x.quality)).toEqual(['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']);
  });

  it('harmonizes A natural minor into i ii° III iv v VI VII', () => {
    const t = diatonicTriads(9, 'min'); // A minor
    expect(t.map((x) => x.label)).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
    expect(t.map((x) => x.roman)).toEqual(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
  });

  it('uses the parent scale for extended qualities (maj7 -> major key)', () => {
    expect(diatonicTriads(0, 'maj7').map((x) => x.label)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
  });

  it('returns empty for a quality with no scale', () => {
    expect(diatonicTriads(0, 'bogus')).toEqual([]);
  });
});

describe('triadTonesInWindow', () => {
  // Key C major (root 0, quality 'maj'). Degree 0 = C major triad {C,E,G} = pcs {0,4,7}.
  it('flags the selected triad tones inside the window', () => {
    const dots = triadTonesInWindow(0, 'maj', 0, 0, 3);
    expect(dots.length).toBeGreaterThan(0);
    const triadPcs = new Set(dots.filter((d) => d.inTriad).map((d) => d.note));
    expect([...triadPcs].sort((a, b) => a - b)).toEqual([0, 4, 7]);
  });

  it('restricts dots to the fret window', () => {
    const dots = triadTonesInWindow(0, 'maj', 0, 5, 8);
    expect(dots.every((d) => d.f >= 5 && d.f <= 8)).toBe(true);
  });

  it('colors triad tones by interval from the triad root', () => {
    // Degree 1 in C major = D minor {D,F,A} = pcs {2,5,9}; triad root D=2.
    const dots = triadTonesInWindow(0, 'maj', 1, 0, 12).filter((d) => d.inTriad);
    const byNote = new Map(dots.map((d) => [d.note, d.triadSemi]));
    expect(byNote.get(2)).toBe(0); // root
    expect(byNote.get(5)).toBe(3); // minor 3rd
    expect(byNote.get(9)).toBe(7); // 5th
  });

  it('returns [] when the quality has no parent scale', () => {
    expect(triadTonesInWindow(0, 'bogus', 0, 0, 5)).toEqual([]);
  });

  it('returns [] for an out-of-range degree', () => {
    expect(triadTonesInWindow(0, 'maj', 9, 0, 5)).toEqual([]);
  });
});
