import { SC, noteAt, semitoneFrom } from './theory';
import { FMAX } from './fretboard';

export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Scale-degree label by interval-from-root (covers both major and minor degrees).
export const SCALE_DEGREE: Record<number, string> = {
  0: '1', 2: '2', 3: 'b3', 4: '3', 5: '4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7',
};

const MAJ_FAMILY = new Set(['maj', 'maj7', 'dom7', 'maj9', 'dom9', 's9', 'add9', 'sus2', 'sus4', 'aug']);
const MIN_FAMILY = new Set(['min', 'm7', 'm9', 'm7b5', 'dim', 'dim7']);

/** Parent scale (intervals from root) for a chord quality: major or natural minor. */
export function scaleFor(quality: string): number[] | null {
  if (MAJ_FAMILY.has(quality)) return MAJOR_SCALE;
  if (MIN_FAMILY.has(quality)) return MINOR_SCALE;
  return null;
}

export interface ScaleDot {
  s: number;
  f: number;
  semi: number;
  note: number;
  inChord: boolean;
}

/** Every scale-tone location across the neck, flagged for whether it is a chord tone. */
export function getScaleDots(root: number, quality: string, chordTones: number[]): ScaleDot[] {
  const scale = scaleFor(quality);
  if (!scale) return [];
  const sSet = new Set(scale);
  const cSet = new Set(chordTones);
  const dots: ScaleDot[] = [];
  for (let s = 0; s < SC; s++) {
    for (let f = 0; f <= FMAX; f++) {
      const note = noteAt(s, f);
      const semi = semitoneFrom(root, note);
      if (sSet.has(semi)) dots.push({ s, f, semi, note, inChord: cSet.has(semi) });
    }
  }
  return dots;
}
