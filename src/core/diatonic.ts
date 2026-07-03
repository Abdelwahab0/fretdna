import { NOTES, semitoneFrom } from './theory';
import { MAJOR_SCALE, scaleFor, getScaleDots } from './scales';

// Triad quality on each scale degree of the harmonized major / natural-minor scale.
const MAJOR_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const MINOR_QUALITIES = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

export interface DiatonicTriad {
  roman: string;
  root: number;   // pitch class
  quality: string; // 'maj' | 'min' | 'dim'
  label: string;   // e.g. "Dm", "B°"
}

/** The 7 diatonic triads of the key implied by (root, quality). Empty if no scale. */
export function diatonicTriads(root: number, quality: string): DiatonicTriad[] {
  const scale = scaleFor(quality);
  if (!scale) return [];
  const isMajor = scale === MAJOR_SCALE;
  const quals = isMajor ? MAJOR_QUALITIES : MINOR_QUALITIES;
  const romans = isMajor ? ROMAN_MAJOR : ROMAN_MINOR;
  return scale.map((iv, i) => {
    const r = (root + iv) % 12;
    const q = quals[i];
    const suffix = q === 'maj' ? '' : q === 'min' ? 'm' : '°';
    return { roman: romans[i], root: r, quality: q, label: NOTES[r] + suffix };
  });
}

export interface TriadWindowDot {
  s: number;        // string 0..5
  f: number;        // fret
  note: number;     // pitch class
  inTriad: boolean; // is this a tone of the selected diatonic triad
  triadSemi: number; // interval from the triad root (0..11), for coloring
}

/**
 * Scale tones inside a fret window [loFret, hiFret], flagged for whether each
 * is a tone of the `degree`-th diatonic triad of the key implied by
 * (keyRoot, quality). Empty when the quality has no parent scale or the degree
 * is out of range.
 */
export function triadTonesInWindow(
  keyRoot: number,
  quality: string,
  degree: number,
  loFret: number,
  hiFret: number,
): TriadWindowDot[] {
  if (scaleFor(quality) === null) return [];
  const triad = diatonicTriads(keyRoot, quality)[degree];
  if (!triad) return [];
  const third = (triad.root + (triad.quality === 'maj' ? 4 : 3)) % 12;
  const fifth = (triad.root + (triad.quality === 'dim' ? 6 : 7)) % 12;
  const triadPcs = new Set([triad.root, third, fifth]);
  return getScaleDots(keyRoot, quality, [])
    .filter((d) => d.f >= loFret && d.f <= hiFret)
    .map((d) => ({
      s: d.s,
      f: d.f,
      note: d.note,
      inTriad: triadPcs.has(d.note),
      triadSemi: semitoneFrom(triad.root, d.note),
    }));
}
