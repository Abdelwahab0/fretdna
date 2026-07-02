import { describe, it, expect } from 'vitest';
import { QTYPES, getChordIntervals, chipKind } from './chords';

describe('chords', () => {
  it('defines the expected qualities', () => {
    expect(QTYPES.maj7.i).toEqual([0, 4, 7, 11]);
    expect(QTYPES.dom7.l).toBe('7');
    expect(Object.keys(QTYPES)).toHaveLength(16);
  });

  it('getChordIntervals returns full intervals by default', () => {
    expect(getChordIntervals('maj7')).toEqual([0, 4, 7, 11]);
  });

  it('shell voicing keeps only 3rds and 7ths', () => {
    expect(getChordIntervals('maj7', 'shell')).toEqual([4, 11]);
    expect(getChordIntervals('m7', 'shell')).toEqual([3, 10]);
  });

  it('rootless voicing drops the root', () => {
    expect(getChordIntervals('maj7', 'rootless')).toEqual([4, 7, 11]);
  });

  it('unknown quality returns empty', () => {
    expect(getChordIntervals('bogus')).toEqual([]);
  });

  it('chipKind categorises intervals', () => {
    expect(chipKind(0)).toBe('root');
    expect(chipKind(4)).toBe('3rd');
    expect(chipKind(7)).toBe('5th');
    expect(chipKind(10)).toBe('7th');
    expect(chipKind(2)).toBe('ext');
  });
});
