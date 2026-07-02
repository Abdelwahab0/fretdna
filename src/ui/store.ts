import { create } from 'zustand';
import type { Mode, StringSet } from '../core/types';
import type { Voicing } from '../core/chords';

interface AppState {
  root: number;
  quality: string;
  mode: Mode;
  showLabels: boolean;
  stringSet: StringSet;
  voicing: Voicing;
  hlInterval: number | null;
  setRoot: (n: number) => void;
  setQuality: (q: string) => void;
  setMode: (m: Mode) => void;
  setShowLabels: (b: boolean) => void;
  setStringSet: (s: StringSet) => void;
  setVoicing: (v: Voicing) => void;
  setHlInterval: (i: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  root: 0,
  quality: 'maj7',
  mode: 'shapes',
  showLabels: true,
  stringSet: 'all',
  voicing: 'standard',
  hlInterval: 0,
  setRoot: (root) => set({ root }),
  setQuality: (quality) => set({ quality }),
  setMode: (mode) =>
    set((s) => ({ mode, hlInterval: mode === 'intervals' && s.hlInterval === null ? 0 : s.hlInterval })),
  setShowLabels: (showLabels) => set({ showLabels }),
  setStringSet: (stringSet) => set({ stringSet }),
  setVoicing: (voicing) => set({ voicing }),
  setHlInterval: (hlInterval) => set({ hlInterval }),
}));
