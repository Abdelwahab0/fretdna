export interface Chord {
  root: number;      // pitch class 0-11
  quality: string;   // key into QTYPES
  label: string;     // display label e.g. "Cmaj7"
}

export interface Progression {
  id: string;
  title: string;
  style: string;
  chords: Chord[];
  dna: string | null;
}

export type Mode = 'shapes' | 'intervals';
export type StringSet = 'all' | '123' | '234' | '345' | '456';
