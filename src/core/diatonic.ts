import { NOTES } from './theory';
import { MAJOR_SCALE, scaleFor } from './scales';

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
