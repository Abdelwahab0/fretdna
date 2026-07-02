export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;

// Standard tuning, strings 0-5 = high e -> low E, as pitch classes.
export const TUNING = [4, 11, 7, 2, 9, 4];
export const S_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
export const SC = 6; // string count

export const INAMES: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '9', 3: 'b3', 4: '3', 5: '4',
  6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: 'Δ7',
};

export const ICOLORS: Record<number, string> = {
  0: '#E04808',  // root
  1: '#6840C8', 2: '#6840C8',           // b2 / 9  (ext)
  3: '#149A70', 4: '#149A70',           // b3 / 3
  5: '#6840C8',                         // 4  (ext)
  6: '#3A70B8', 7: '#3A70B8', 8: '#3A70B8', // b5 / 5 / #5
  9: '#6840C8',                         // 6  (ext)
  10: '#A028B0', 11: '#A028B0',         // b7 / Δ7
};

export function noteAt(string: number, fret: number): number {
  return (TUNING[string] + fret) % 12;
}

export function semitoneFrom(root: number, note: number): number {
  return (note - root + 12) % 12;
}

export function intervalName(semi: number): string {
  return INAMES[semi];
}
