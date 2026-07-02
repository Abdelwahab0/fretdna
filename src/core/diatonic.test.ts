import { describe, it, expect } from 'vitest';
import { diatonicTriads } from './diatonic';

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
