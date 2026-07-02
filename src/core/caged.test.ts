import { describe, it, expect } from 'vitest';
import { shapeAt, MAJOR_SHAPE_ORDER, MINOR_SHAPE_ORDER } from './caged';

// Helper: get [fret per string 0..5], using -1 where the shape omits a string.
function fretRow(notes: { string: number; fret: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.fret;
  return row;
}
function semiRow(notes: { string: number; semi: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.semi;
  return row;
}

describe('caged shape orders', () => {
  it('major has 5 shapes, minor has 3', () => {
    expect(MAJOR_SHAPE_ORDER).toEqual(['C', 'A', 'G', 'E', 'D']);
    expect(MINOR_SHAPE_ORDER).toEqual(['E', 'A', 'D']);
  });
});

describe('shapeAt reproduces canonical open chords at their natural root', () => {
  it('E-shape major at root E = open E [0,0,1,2,2,0]', () => {
    const r = shapeAt(4, 'E', 'maj')!;
    expect(r.baseFret).toBe(0);
    expect(fretRow(r.notes)).toEqual([0, 0, 1, 2, 2, 0]);
    // semis: R on low E, 3rd on G string, 5th on B/A strings
    expect(semiRow(r.notes)).toEqual([0, 7, 4, 0, 7, 0]);
  });

  it('A-shape major at root A = open A [0,2,2,2,0,-1]', () => {
    const r = shapeAt(9, 'A', 'maj')!;
    expect(fretRow(r.notes)).toEqual([0, 2, 2, 2, 0, -1]);
  });

  it('D-shape major at root D = open D [2,3,2,0,-1,-1]', () => {
    const r = shapeAt(2, 'D', 'maj')!;
    expect(fretRow(r.notes)).toEqual([2, 3, 2, 0, -1, -1]);
  });

  it('C-shape major at root C = open C [0,1,0,2,3,-1]', () => {
    const r = shapeAt(0, 'C', 'maj')!;
    expect(fretRow(r.notes)).toEqual([0, 1, 0, 2, 3, -1]);
  });

  it('G-shape major at root G = open G [3,0,0,0,2,3]', () => {
    const r = shapeAt(7, 'G', 'maj')!;
    expect(fretRow(r.notes)).toEqual([3, 0, 0, 0, 2, 3]);
  });

  it('E-shape minor at root E = open Em [0,0,0,2,2,0]', () => {
    const r = shapeAt(4, 'E', 'min')!;
    expect(fretRow(r.notes)).toEqual([0, 0, 0, 2, 2, 0]);
    // minor: b3 (semi 3) on the G string
    expect(semiRow(r.notes)).toEqual([0, 7, 3, 0, 7, 0]);
  });

  it('A-shape minor at root A = open Am [0,1,2,2,0,-1]', () => {
    const r = shapeAt(9, 'A', 'min')!;
    expect(fretRow(r.notes)).toEqual([0, 1, 2, 2, 0, -1]);
  });

  it('D-shape minor at root D = open Dm [1,3,2,0,-1,-1]', () => {
    const r = shapeAt(2, 'D', 'min')!;
    expect(fretRow(r.notes)).toEqual([1, 3, 2, 0, -1, -1]);
  });
});

describe('shapeAt movability (barre)', () => {
  it('E-shape major at root F = F barre [1,1,2,3,3,1], baseFret 1', () => {
    const r = shapeAt(5, 'E', 'maj')!;
    expect(r.baseFret).toBe(1);
    expect(fretRow(r.notes)).toEqual([1, 1, 2, 3, 3, 1]);
    // interval pattern is preserved when moved
    expect(semiRow(r.notes)).toEqual([0, 7, 4, 0, 7, 0]);
  });

  it('A-shape major at root C = C barre at 3rd fret [3,5,5,5,3,-1]', () => {
    const r = shapeAt(0, 'A', 'maj')!;
    expect(r.baseFret).toBe(3);
    expect(fretRow(r.notes)).toEqual([3, 5, 5, 5, 3, -1]);
  });
});

describe('shapeAt returns null for nonexistent minor shapes', () => {
  it('C-shape minor and G-shape minor are null', () => {
    expect(shapeAt(0, 'C', 'min')).toBeNull();
    expect(shapeAt(0, 'G', 'min')).toBeNull();
  });
});
