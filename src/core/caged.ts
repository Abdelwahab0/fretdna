import { SC, noteAt, semitoneFrom } from './theory';

export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';
export type TriadQuality = 'maj' | 'min';
export type ShapeQuality = TriadQuality | 'maj7' | 'm7' | 'dom7';

export interface ShapeNote {
  string: number; // 0 = high e … 5 = low E
  fret: number;   // absolute fret (0 = open)
  semi: number;   // interval from the chord root (0..11)
}

// A CAGED shape, encoded as its canonical open-position instance.
// `frets` is indexed by string 0..5; -1 means the string is not played.
// `naturalRoot` is the pitch class of the chord this open instance spells.
interface ShapeDef {
  frets: number[];
  naturalRoot: number;
}

// String order for every table below: [0=high e, 1=B, 2=G, 3=D, 4=A, 5=low E].
const SHAPES: Record<ShapeQuality, Partial<Record<CagedShape, ShapeDef>>> = {
  maj: {
    E: { frets: [0, 0, 1, 2, 2, 0], naturalRoot: 4 }, // open E
    A: { frets: [0, 2, 2, 2, 0, -1], naturalRoot: 9 }, // open A
    D: { frets: [2, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open D
    C: { frets: [0, 1, 0, 2, 3, -1], naturalRoot: 0 }, // open C
    G: { frets: [3, 0, 0, 0, 2, 3], naturalRoot: 7 }, // open G
  },
  min: {
    E: { frets: [0, 0, 0, 2, 2, 0], naturalRoot: 4 }, // open Em
    A: { frets: [0, 1, 2, 2, 0, -1], naturalRoot: 9 }, // open Am
    D: { frets: [1, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open Dm
  },
  maj7: {
    E: { frets: [0, 0, 1, 1, 2, 0], naturalRoot: 4 }, // Emaj7
    A: { frets: [0, 2, 1, 2, 0, -1], naturalRoot: 9 }, // Amaj7
    D: { frets: [2, 2, 2, 0, -1, -1], naturalRoot: 2 }, // Dmaj7
    C: { frets: [0, 0, 0, 2, 3, -1], naturalRoot: 0 }, // Cmaj7
    G: { frets: [2, 0, 0, 0, 2, 3], naturalRoot: 7 }, // Gmaj7
  },
  dom7: {
    E: { frets: [0, 0, 1, 0, 2, 0], naturalRoot: 4 }, // E7
    A: { frets: [0, 2, 0, 2, 0, -1], naturalRoot: 9 }, // A7
    D: { frets: [2, 1, 2, 0, -1, -1], naturalRoot: 2 }, // D7
    C: { frets: [0, 1, 3, 2, 3, -1], naturalRoot: 0 }, // C7 (5th omitted)
    G: { frets: [1, 0, 0, 0, 2, 3], naturalRoot: 7 }, // G7
  },
  m7: {
    E: { frets: [0, 0, 0, 0, 2, 0], naturalRoot: 4 }, // Em7
    A: { frets: [0, 1, 0, 2, 0, -1], naturalRoot: 9 }, // Am7
    D: { frets: [1, 1, 2, 0, -1, -1], naturalRoot: 2 }, // Dm7
  },
};

const FULL: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];
const EAD: CagedShape[] = ['E', 'A', 'D'];

// Back-compat exports (triads).
export const MAJOR_SHAPE_ORDER: CagedShape[] = FULL;
export const MINOR_SHAPE_ORDER: CagedShape[] = EAD;

/** CAGED shapes available for a given chord quality, in canonical order. */
export function shapeOrderFor(quality: ShapeQuality): CagedShape[] {
  return quality === 'min' || quality === 'm7' ? EAD : FULL;
}

/**
 * Move a CAGED shape to `root`. The whole shape shifts up by `delta` frets
 * (the barre fret); strings that were open (fret 0) become fretted at `delta`.
 * Returns null when the shape does not exist for the given quality.
 */
export function shapeAt(
  root: number,
  shape: CagedShape,
  quality: ShapeQuality,
): { baseFret: number; notes: ShapeNote[] } | null {
  const def = SHAPES[quality][shape];
  if (!def) return null;
  const delta = (((root - def.naturalRoot) % 12) + 12) % 12;
  const notes: ShapeNote[] = [];
  for (let s = 0; s < SC; s++) {
    const f = def.frets[s];
    if (f < 0) continue;
    const fret = f + delta;
    const note = noteAt(s, fret);
    notes.push({ string: s, fret, semi: semitoneFrom(root, note) });
  }
  return { baseFret: delta, notes };
}
