import { SC, noteAt, semitoneFrom } from './theory';

export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';
export type TriadQuality = 'maj' | 'min';

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

// Major open chords (canonical). String order: 0=high e,1=B,2=G,3=D,4=A,5=low E.
const MAJOR_SHAPES: Record<CagedShape, ShapeDef> = {
  E: { frets: [0, 0, 1, 2, 2, 0], naturalRoot: 4 }, // open E
  A: { frets: [0, 2, 2, 2, 0, -1], naturalRoot: 9 }, // open A
  D: { frets: [2, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open D
  C: { frets: [0, 1, 0, 2, 3, -1], naturalRoot: 0 }, // open C
  G: { frets: [3, 0, 0, 0, 2, 3], naturalRoot: 7 }, // open G
};

// Minor open chords. Only E/A/D forms are standard CAGED shapes;
// C-minor and G-minor have no common open form.
const MINOR_SHAPES: Partial<Record<CagedShape, ShapeDef>> = {
  E: { frets: [0, 0, 0, 2, 2, 0], naturalRoot: 4 }, // open Em
  A: { frets: [0, 1, 2, 2, 0, -1], naturalRoot: 9 }, // open Am
  D: { frets: [1, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open Dm
};

export const MAJOR_SHAPE_ORDER: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];
export const MINOR_SHAPE_ORDER: CagedShape[] = ['E', 'A', 'D'];

/**
 * Move a CAGED shape to `root`. The whole shape shifts up by `delta` frets
 * (the barre fret); strings that were open (fret 0) become fretted at `delta`.
 * Returns null when the shape does not exist for the given quality (Cm, Gm).
 */
export function shapeAt(
  root: number,
  shape: CagedShape,
  quality: TriadQuality,
): { baseFret: number; notes: ShapeNote[] } | null {
  const def = quality === 'maj' ? MAJOR_SHAPES[shape] : MINOR_SHAPES[shape];
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
