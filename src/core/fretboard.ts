import { TUNING, SC, noteAt, semitoneFrom } from './theory';
import { getChordIntervals, type Voicing } from './chords';
import type { Mode, StringSet } from './types';

// ── Layout (SVG viewBox 0 0 1000 190) ──
export const VW = 1000, VH = 190, NX = 40, OW = 46, FMAX = 15;
export const PT = 20, PB = 24;
export const SS = (VH - PT - PB) / (SC - 1); // string spacing
export const FAW = VW - NX - OW - 4;         // fretted area width
export const FW = FAW / FMAX;                // per-fret width
export const INLAYS = [3, 5, 7, 9, 12, 15];
export const SW = [0.55, 0.7, 0.9, 1.1, 1.35, 1.6]; // string thickness

// ── Maple palette (light wood) ──
export const BOARD = {
  wood: '#E6C889',
  grain: 'rgba(150,110,45,0.20)',
  fret: '#A49A86',
  string: '#7A6A45',
  nut: '#F3ECD6',
  inlay: 'rgba(120,90,45,0.28)',
  label: '#6A5228',
  fretNum: '#8A6E3C',
} as const;

export const STRING_SETS: Record<StringSet, number[] | null> = {
  all: null,
  '123': [0, 1, 2],
  '234': [1, 2, 3],
  '345': [2, 3, 4],
  '456': [3, 4, 5],
};

export function sy(s: number): number {
  return PT + s * SS;
}
export function fcx(f: number): number {
  return f === 0 ? NX + OW / 2 : NX + OW + (f - 1) * FW + FW / 2;
}
export function flx(f: number): number {
  return NX + OW + f * FW;
}

export interface Dot {
  s: number;
  f: number;
  semi: number;
  note: number;
  delay: number;
}

export interface DotParams {
  mode: Mode;
  root: number;
  quality: string;
  voicing: Voicing;
  stringSet: StringSet;
  hlInterval: number | null;
}

export function getDots(p: DotParams): Dot[] {
  const dots: Dot[] = [];

  if (p.mode === 'intervals') {
    if (p.hlInterval === null) return dots;
    for (let s = 0; s < SC; s++) {
      for (let f = 0; f <= FMAX; f++) {
        const note = noteAt(s, f);
        const semi = semitoneFrom(p.root, note);
        if (semi === p.hlInterval) dots.push({ s, f, semi, note, delay: 0 });
      }
    }
    return dots;
  }

  const ivs = getChordIntervals(p.quality, p.voicing);
  const iSet = new Set(ivs);
  const strSet = STRING_SETS[p.stringSet];
  for (let s = 0; s < SC; s++) {
    if (strSet && !strSet.includes(s)) continue;
    for (let f = 0; f <= FMAX; f++) {
      const note = noteAt(s, f);
      const semi = semitoneFrom(p.root, note);
      if (iSet.has(semi)) dots.push({ s, f, semi, note, delay: ivs.indexOf(semi) * 55 });
    }
  }
  return dots;
}
