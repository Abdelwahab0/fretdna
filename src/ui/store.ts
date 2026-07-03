import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mode, StringSet } from '../core/types';
import type { VoicingStyle } from '../core/chords';

interface AppState {
  root: number;
  quality: string;
  mode: Mode;
  showLabels: boolean;
  stringSet: StringSet;
  voicing: VoicingStyle;
  hlInterval: number | null;
  voicingView: boolean;
  shapeIndex: number;
  showGhost: boolean;
  showBox: boolean;
  showAllPositions: boolean;
  showScale: boolean;
  progId: string | null;
  progStep: number;
  theme: 'day' | 'night';
  setRoot: (n: number) => void;
  setQuality: (q: string) => void;
  setMode: (m: Mode) => void;
  setShowLabels: (b: boolean) => void;
  setStringSet: (s: StringSet) => void;
  setVoicing: (v: VoicingStyle) => void;
  setHlInterval: (i: number | null) => void;
  setVoicingView: (b: boolean) => void;
  setShapeIndex: (i: number) => void;
  setShowGhost: (b: boolean) => void;
  setShowBox: (b: boolean) => void;
  setShowAllPositions: (b: boolean) => void;
  setShowScale: (b: boolean) => void;
  setProgId: (id: string | null) => void;
  setProgStep: (n: number) => void;
  setTheme: (t: 'day' | 'night') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
  root: 0,
  quality: 'maj7',
  mode: 'shapes',
  showLabels: true,
  stringSet: 'all',
  voicing: 'standard',
  hlInterval: 0,
  voicingView: false,
  shapeIndex: 0,
  showGhost: true,
  showBox: true,
  showAllPositions: false,
  showScale: false,
  progId: null,
  progStep: 0,
  theme: 'day',
  setRoot: (root) => set({ root }),
  setQuality: (quality) => set({ quality }),
  setMode: (mode) =>
    set((s) => ({ mode, hlInterval: mode === 'intervals' && s.hlInterval === null ? 0 : s.hlInterval })),
  setShowLabels: (showLabels) => set({ showLabels }),
  setStringSet: (stringSet) => set({ stringSet }),
  setVoicing: (voicing) => set({ voicing }),
  setHlInterval: (hlInterval) => set({ hlInterval }),
  setVoicingView: (voicingView) => set({ voicingView }),
  setShapeIndex: (shapeIndex) => set({ shapeIndex }),
  setShowGhost: (showGhost) => set({ showGhost }),
  setShowBox: (showBox) => set({ showBox }),
  setShowAllPositions: (showAllPositions) => set({ showAllPositions }),
  setShowScale: (showScale) => set({ showScale }),
  setProgId: (progId) => set({ progId }),
  setProgStep: (progStep) => set({ progStep }),
  setTheme: (theme) => set({ theme }),
    }),
    { name: 'fretdna-store' },
  ),
);
