export type VoicingStyle = 'standard' | 'shell' | 'rootless';

export interface Quality {
  i: number[]; // intervals in semitones from root
  l: string;   // display label suffix
  g: number;   // group (for future ordering)
}

export const QTYPES: Record<string, Quality> = {
  maj:  { i: [0, 4, 7],        l: 'maj',   g: 0 },
  min:  { i: [0, 3, 7],        l: 'min',   g: 0 },
  dim:  { i: [0, 3, 6],        l: 'dim',   g: 0 },
  aug:  { i: [0, 4, 8],        l: 'aug',   g: 0 },
  maj7: { i: [0, 4, 7, 11],    l: 'maj7',  g: 1 },
  m7:   { i: [0, 3, 7, 10],    l: 'm7',    g: 1 },
  dom7: { i: [0, 4, 7, 10],    l: '7',     g: 1 },
  m7b5: { i: [0, 3, 6, 10],    l: 'm7b5',  g: 1 },
  dim7: { i: [0, 3, 6, 9],     l: 'dim7',  g: 1 },
  maj9: { i: [0, 4, 7, 11, 2], l: 'maj9',  g: 2 },
  m9:   { i: [0, 3, 7, 10, 2], l: 'm9',    g: 2 },
  dom9: { i: [0, 4, 7, 10, 2], l: '9',     g: 2 },
  s9:   { i: [0, 4, 7, 10, 3], l: '7#9',   g: 2 },
  sus2: { i: [0, 2, 7],        l: 'sus2',  g: 3 },
  sus4: { i: [0, 5, 7],        l: 'sus4',  g: 3 },
  add9: { i: [0, 4, 7, 2],     l: 'add9',  g: 3 },
};

export function getChordIntervals(quality: string, voicing: VoicingStyle = 'standard'): number[] {
  const q = QTYPES[quality];
  if (!q) return [];
  let ivs = [...q.i];
  if (voicing === 'shell') ivs = ivs.filter((i) => [3, 4, 10, 11].includes(i));
  if (voicing === 'rootless') ivs = ivs.filter((i) => i !== 0);
  return ivs;
}

export function chipKind(semi: number): 'root' | '3rd' | '5th' | '7th' | 'ext' {
  if (semi === 0) return 'root';
  if (semi === 3 || semi === 4) return '3rd';
  if (semi === 6 || semi === 7 || semi === 8) return '5th';
  if (semi === 10 || semi === 11) return '7th';
  return 'ext';
}
