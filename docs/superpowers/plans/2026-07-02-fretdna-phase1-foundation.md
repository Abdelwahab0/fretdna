# FretDNA Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Vite + React + TypeScript app with a tested, framework-agnostic music-theory core that renders a **maple** fretboard at parity with the v1 all-notes/interval view.

**Architecture:** Pure `core/` TypeScript modules (theory, chords, fretboard math + dot logic) with unit tests, a typed Zustand store replacing v1's global `S`, and thin React components (`Fretboard` + control panels) that read the store and render SVG. `ui/` imports from `core/`, never the reverse.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Zustand 4, Vitest 2 + jsdom + Testing Library.

## Global Constraints

- Node 20 (`v20.20.2`), npm 10 — already verified on this machine.
- `core/` modules MUST NOT import React, the store, or anything from `ui/`. Enforced by review.
- Standard tuning only in Phase 1: `TUNING = [4,11,7,2,9,4]` (strings high-e→low-E as pitch classes).
- Fretboard SVG viewBox is `0 0 1000 190`; 15 frets (`FMAX = 15`); 6 strings.
- Maple palette for the board (light wood) — no dark rosewood.
- Interval color coding is fixed: root `#E04808`, 3rds `#149A70`, 5ths `#3A70B8`, 7ths `#A028B0`, extensions `#6840C8`.
- This plan is Phase 1 only. The progression **Library** right-panel and the **Loop** strip from v1 are intentionally deferred to a follow-on plan (they are content/playback, not core). Root, quality, mode (shapes/intervals), string-set, voicing filter, show-labels toggle, chord-info bar, and legend ARE in scope.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/test/setup.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a runnable dev server (`npm run dev`) and a working test runner (`npm test`) that later tasks build on. Exposes `App` React component (placeholder for now).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fretdna",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FretDNA</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 8: Create placeholder `src/App.tsx`**

```tsx
export default function App() {
  return <div id="hdr"><div id="logo">Fret<em>DNA</em></div></div>;
}
```

- [ ] **Step 9: Create minimal `src/index.css`** (full styling arrives in Task 8; this just proves the pipeline)

```css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Space Grotesk',sans-serif;background:#EDE7DC;color:#1A1208}
#logo{font-size:17px;font-weight:600}
#logo em{font-style:normal;color:#B06818}
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`
Expected: completes without error; `node_modules/` created (already gitignored).

- [ ] **Step 11: Verify the test runner boots**

Run: `npm test`
Expected: Vitest runs and reports `No test files found` (exit 0) — the runner works even with zero tests.

- [ ] **Step 12: Verify the build type-checks**

Run: `npm run build`
Expected: PASS — `tsc -b` succeeds and Vite emits `dist/`.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Vitest project"
```

---

### Task 2: Core theory module

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/theory.ts`
- Test: `src/core/theory.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `types.ts`: `interface Chord { root: number; quality: string; label: string }`, `interface Progression { id: string; title: string; style: string; chords: Chord[]; dna: string | null }`, `type Mode = 'shapes' | 'intervals'`, `type StringSet = 'all' | '123' | '234' | '345' | '456'`.
  - `theory.ts`: `NOTES: readonly string[]`, `TUNING: number[]`, `S_NAMES: string[]`, `SC = 6`, `INAMES: Record<number,string>`, `ICOLORS: Record<number,string>`, `noteAt(string:number, fret:number): number`, `semitoneFrom(root:number, note:number): number`, `intervalName(semi:number): string`.

- [ ] **Step 1: Write `src/core/types.ts`** (no test needed — pure type declarations)

```ts
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
```

- [ ] **Step 2: Write the failing test `src/core/theory.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { noteAt, semitoneFrom, intervalName, NOTES, TUNING, SC } from './theory';

describe('theory', () => {
  it('has 12 note names and 6 strings', () => {
    expect(NOTES).toHaveLength(12);
    expect(SC).toBe(6);
    expect(TUNING).toEqual([4, 11, 7, 2, 9, 4]);
  });

  it('noteAt returns the open-string pitch class at fret 0', () => {
    expect(noteAt(5, 0)).toBe(4);  // low E
    expect(noteAt(0, 0)).toBe(4);  // high e
    expect(noteAt(4, 0)).toBe(9);  // A
  });

  it('noteAt wraps past the octave', () => {
    expect(noteAt(0, 12)).toBe(4); // high e, 12th fret = E again
    expect(noteAt(5, 3)).toBe(7);  // low E + 3 = G
  });

  it('semitoneFrom computes the interval from a root', () => {
    expect(semitoneFrom(0, 4)).toBe(4);   // C -> E = major 3rd
    expect(semitoneFrom(4, 0)).toBe(8);   // E -> C = 8 semitones
    expect(semitoneFrom(0, 0)).toBe(0);
  });

  it('intervalName maps semitones to interval labels', () => {
    expect(intervalName(0)).toBe('R');
    expect(intervalName(4)).toBe('3');
    expect(intervalName(11)).toBe('Δ7');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/core/theory.test.ts`
Expected: FAIL — cannot resolve `./theory`.

- [ ] **Step 4: Write `src/core/theory.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/core/theory.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/core/types.ts src/core/theory.ts src/core/theory.test.ts
git commit -m "feat(core): add theory module (notes, tuning, intervals)"
```

---

### Task 3: Core chords module

**Files:**
- Create: `src/core/chords.ts`
- Test: `src/core/chords.test.ts`

**Interfaces:**
- Consumes: nothing (self-contained data + logic).
- Produces:
  - `type Voicing = 'standard' | 'shell' | 'rootless'`
  - `interface Quality { i: number[]; l: string; g: number }`
  - `QTYPES: Record<string, Quality>` (16 entries)
  - `getChordIntervals(quality: string, voicing?: Voicing): number[]`
  - `chipKind(semi: number): 'root' | '3rd' | '5th' | '7th' | 'ext'`

- [ ] **Step 1: Write the failing test `src/core/chords.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { QTYPES, getChordIntervals, chipKind } from './chords';

describe('chords', () => {
  it('defines the expected qualities', () => {
    expect(QTYPES.maj7.i).toEqual([0, 4, 7, 11]);
    expect(QTYPES.dom7.l).toBe('7');
    expect(Object.keys(QTYPES)).toHaveLength(16);
  });

  it('getChordIntervals returns full intervals by default', () => {
    expect(getChordIntervals('maj7')).toEqual([0, 4, 7, 11]);
  });

  it('shell voicing keeps only 3rds and 7ths', () => {
    expect(getChordIntervals('maj7', 'shell')).toEqual([4, 11]);
    expect(getChordIntervals('m7', 'shell')).toEqual([3, 10]);
  });

  it('rootless voicing drops the root', () => {
    expect(getChordIntervals('maj7', 'rootless')).toEqual([4, 7, 11]);
  });

  it('unknown quality returns empty', () => {
    expect(getChordIntervals('bogus')).toEqual([]);
  });

  it('chipKind categorises intervals', () => {
    expect(chipKind(0)).toBe('root');
    expect(chipKind(4)).toBe('3rd');
    expect(chipKind(7)).toBe('5th');
    expect(chipKind(10)).toBe('7th');
    expect(chipKind(2)).toBe('ext');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/core/chords.test.ts`
Expected: FAIL — cannot resolve `./chords`.

- [ ] **Step 3: Write `src/core/chords.ts`**

```ts
export type Voicing = 'standard' | 'shell' | 'rootless';

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

export function getChordIntervals(quality: string, voicing: Voicing = 'standard'): number[] {
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/core/chords.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/chords.ts src/core/chords.test.ts
git commit -m "feat(core): add chord qualities and interval selection"
```

---

### Task 4: Fretboard geometry + dot logic

**Files:**
- Create: `src/core/fretboard.ts`
- Test: `src/core/fretboard.test.ts`

**Interfaces:**
- Consumes: `theory` (`TUNING`, `SC`, `noteAt`, `semitoneFrom`), `chords` (`getChordIntervals`, `Voicing`), `types` (`Mode`, `StringSet`).
- Produces:
  - Layout constants: `VW, VH, NX, OW, FMAX, PT, PB, SS, FAW, FW`, `INLAYS: number[]`, `SW: number[]` (string widths), `BOARD` (maple palette object).
  - `STRING_SETS: Record<StringSet, number[] | null>`
  - `sy(s:number):number`, `fcx(f:number):number`, `flx(f:number):number`
  - `interface Dot { s:number; f:number; semi:number; note:number; delay:number }`
  - `interface DotParams { mode:Mode; root:number; quality:string; voicing:Voicing; stringSet:StringSet; hlInterval:number|null }`
  - `getDots(p: DotParams): Dot[]`

- [ ] **Step 1: Write the failing test `src/core/fretboard.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getDots, sy, flx, STRING_SETS, FMAX } from './fretboard';

const base = {
  mode: 'shapes' as const,
  root: 0,
  quality: 'maj7',
  voicing: 'standard' as const,
  stringSet: 'all' as const,
  hlInterval: null as number | null,
};

describe('fretboard geometry', () => {
  it('sy spaces strings evenly and increases with index', () => {
    expect(sy(0)).toBeLessThan(sy(5));
  });
  it('flx increases with fret number', () => {
    expect(flx(1)).toBeLessThan(flx(5));
  });
  it('STRING_SETS.all is null (no filter)', () => {
    expect(STRING_SETS.all).toBeNull();
    expect(STRING_SETS['123']).toEqual([0, 1, 2]);
  });
});

describe('getDots (shapes mode)', () => {
  it('marks every location of each chord interval across the neck', () => {
    const dots = getDots(base);
    // Cmaj7 = {C,E,G,B}. Every dot must be one of those pitch classes.
    const allowed = new Set([0, 4, 7, 11]);
    expect(dots.every((d) => allowed.has(d.note))).toBe(true);
    // Open low-E string (index 5): frets 0..15 include E(0),G#? no -> only chord tones.
    // At least the open high-e (E, fret 0, string 0) is present.
    expect(dots.some((d) => d.s === 0 && d.f === 0 && d.note === 4)).toBe(true);
  });

  it('respects a string-set filter', () => {
    const dots = getDots({ ...base, stringSet: '123' });
    expect(dots.every((d) => [0, 1, 2].includes(d.s))).toBe(true);
  });

  it('shell voicing yields only 3rd and 7th dots', () => {
    const dots = getDots({ ...base, voicing: 'shell' });
    expect(dots.every((d) => [4, 11].includes(d.semi))).toBe(true);
  });
});

describe('getDots (intervals mode)', () => {
  it('marks only the highlighted interval', () => {
    const dots = getDots({ ...base, mode: 'intervals', hlInterval: 7 });
    expect(dots.length).toBeGreaterThan(0);
    expect(dots.every((d) => d.semi === 7)).toBe(true);
  });

  it('scans all frets up to FMAX', () => {
    const dots = getDots({ ...base, mode: 'intervals', hlInterval: 0 });
    expect(Math.max(...dots.map((d) => d.f))).toBeLessThanOrEqual(FMAX);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/core/fretboard.test.ts`
Expected: FAIL — cannot resolve `./fretboard`.

- [ ] **Step 3: Write `src/core/fretboard.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/core/fretboard.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/core/fretboard.ts src/core/fretboard.test.ts
git commit -m "feat(core): add fretboard geometry and dot computation"
```

---

### Task 5: Typed Zustand store

**Files:**
- Create: `src/ui/store.ts`
- Test: `src/ui/store.test.ts`

**Interfaces:**
- Consumes: `types` (`Mode`, `StringSet`), `chords` (`Voicing`).
- Produces: `useStore` hook with state `{ root, quality, mode, showLabels, stringSet, voicing, hlInterval }` and setters `setRoot, setQuality, setMode, setShowLabels, setStringSet, setVoicing, setHlInterval`. `setMode('intervals')` when `hlInterval === null` defaults it to `0` (mirrors v1 `setMode`).

- [ ] **Step 1: Write the failing test `src/ui/store.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

const initial = useStore.getState();

describe('store', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('has sensible defaults', () => {
    const s = useStore.getState();
    expect(s.root).toBe(0);
    expect(s.quality).toBe('maj7');
    expect(s.mode).toBe('shapes');
    expect(s.showLabels).toBe(true);
  });

  it('setRoot and setQuality update state', () => {
    useStore.getState().setRoot(5);
    useStore.getState().setQuality('m7');
    expect(useStore.getState().root).toBe(5);
    expect(useStore.getState().quality).toBe('m7');
  });

  it('switching to intervals mode with null highlight defaults it to root', () => {
    useStore.getState().setHlInterval(null);
    useStore.getState().setMode('intervals');
    expect(useStore.getState().hlInterval).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/ui/store.test.ts`
Expected: FAIL — cannot resolve `./store`.

- [ ] **Step 3: Write `src/ui/store.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/ui/store.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/store.ts src/ui/store.test.ts
git commit -m "feat(ui): add typed Zustand store"
```

---

### Task 6: Content — port progressions data

**Files:**
- Create: `src/content/progressions.ts`
- Test: `src/content/progressions.test.ts`

**Interfaces:**
- Consumes: `chords` (`QTYPES`), `theory` (`NOTES`), `types` (`Chord`, `Progression`).
- Produces: `chord(root: string, quality: string): Chord` helper, `FEATURED: Progression[]`, `LIBRARY: Progression[]`, `STYLES: string[]`.
- NOTE: This data is not rendered by any Phase 1 UI (Library panel is deferred), but porting it now keeps the content typed and unit-checked, and unblocks the follow-on plan.

- [ ] **Step 1: Write the failing test `src/content/progressions.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { chord, FEATURED, LIBRARY, STYLES } from './progressions';
import { QTYPES } from '../core/chords';

describe('progressions content', () => {
  it('chord() builds a labelled Chord from name + quality', () => {
    expect(chord('C', 'maj7')).toEqual({ root: 0, quality: 'maj7', label: 'Cmaj7' });
    expect(chord('F', 'dom9').label).toBe('F9');
  });

  it('has featured and library entries', () => {
    expect(FEATURED.length).toBeGreaterThan(0);
    expect(LIBRARY.length).toBeGreaterThan(0);
  });

  it('every chord references a real quality', () => {
    const all = [...FEATURED, ...LIBRARY];
    for (const p of all) {
      for (const c of p.chords) {
        expect(QTYPES[c.quality], `${p.id} uses unknown quality ${c.quality}`).toBeDefined();
      }
    }
  });

  it('STYLES lists every style used', () => {
    const used = new Set([...FEATURED, ...LIBRARY].map((p) => p.style));
    for (const s of used) expect(STYLES).toContain(s);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/content/progressions.test.ts`
Expected: FAIL — cannot resolve `./progressions`.

- [ ] **Step 3: Write `src/content/progressions.ts`** (ported verbatim from v1 `FEATURED`/`LIBRARY`)

```ts
import { NOTES } from '../core/theory';
import { QTYPES } from '../core/chords';
import type { Chord, Progression } from '../core/types';

export function chord(root: string, quality: string): Chord {
  const ri = NOTES.indexOf(root as (typeof NOTES)[number]);
  const label = root + (QTYPES[quality]?.l ?? quality);
  return { root: ri, quality, label };
}

const c = chord;

export const FEATURED: Progression[] = [
  { id: 'f1', title: 'Neo-Soul I→IV Float', style: 'Neo-Soul', chords: [c('C','maj9'), c('F','maj9')],
    dna: 'The E (3rd of C) becomes the maj7 of F. Same note, two identities — that shared tone is what makes this progression float.' },
  { id: 'f2', title: 'Gravity Vamp', style: 'Mayer', chords: [c('G','maj7'), c('C','add9')],
    dna: 'I→IV with extensions. The B (3rd of G) floats as the maj7 of C. Resolution that never fully lands.' },
  { id: 'f3', title: 'Purple Haze Chord', style: 'Hendrix', chords: [c('E','s9')],
    dna: 'The #9 (G natural) clashes with the 3rd (G#). Major and minor at once. Maximum tension, minimum movement.' },
  { id: 'f4', title: 'Neo-Soul ii–V–I', style: 'Neo-Soul', chords: [c('D','m9'), c('G','dom9'), c('C','maj9')],
    dna: 'Jazz backbone with extensions. The 9 on ii creates melodic tension that folds beautifully into Imaj9.' },
  { id: 'f5', title: "D'Angelo Drift", style: 'Neo-Soul', chords: [c('E','maj9'), c('D','maj7'), c('A','maj9')],
    dna: "Borrowed bVII gives it a modal quality. Dmaj7 doesn't belong in E major but sounds inevitable." },
  { id: 'f6', title: 'Funk One-Chord Vamp', style: 'Funk', chords: [c('E','dom9')],
    dna: 'One chord. All the work is rhythmic. The 9th (F#) adds shimmer without shifting the harmonic center.' },
  { id: 'f7', title: 'Little Wing', style: 'Hendrix', chords: [c('E','min'), c('G','maj'), c('A','maj'), c('C','maj'), c('D','sus2')],
    dna: 'Guitar acts like a whole band. The Dsus2 is the signature suspension before the cycle repeats.' },
  { id: 'f8', title: 'Neon Progression', style: 'Mayer', chords: [c('B','m7'), c('E','dom7'), c('A','maj7'), c('D','maj')],
    dna: 'ii→V→I→IV in A. The E7→Amaj7 is the emotional core — tension folding into warmth every cycle.' },
  { id: 'f9', title: 'Funk ii–V Loop', style: 'Funk', chords: [c('A','m9'), c('D','dom9')],
    dna: 'Looping ii-V. Add rhythmic displacement and you have the foundation of 70s funk guitar.' },
  { id: 'f10', title: 'iii–VI–ii–V Descent', style: 'Neo-Soul', chords: [c('E','m7'), c('A','m7'), c('D','m7'), c('G','dom7')],
    dna: 'Each chord is the ii of the next. Spirals inward before resolving to the dominant.' },
  { id: 'f11', title: 'Hey Joe Walk', style: 'Hendrix', chords: [c('C','maj'), c('G','maj'), c('D','maj'), c('A','maj'), c('E','maj')],
    dna: 'bVI→bIII→bVII→IV→I. Each chord a perfect 5th down. Pure harmonic gravity.' },
  { id: 'f12', title: 'Slow Dancing', style: 'Mayer', chords: [c('E','m7'), c('A','dom7'), c('D','maj7'), c('G','maj')],
    dna: 'ii→V→I→IV in D. The A7→Dmaj7 resolution is where the emotion lives.' },
  { id: 'f13', title: 'Californication Loop', style: 'Frusciante', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'vi→IV→I→V. Am gives emotional weight, G creates perpetual resolution hunger.' },
  { id: 'f14', title: 'Tritone Sub Move', style: 'Neo-Soul', chords: [c('C','maj7'), c('C#','dom7'), c('F','maj7')],
    dna: 'Db7 substitutes for G7 (tritone away). Its 3rd (F) becomes the root of Fmaj7. Chromatic bass, same function.' },
  { id: 'f15', title: 'Mixolydian Funk', style: 'Funk', chords: [c('G','dom7'), c('F','maj'), c('G','dom7')],
    dna: 'The bVII (F) adds mixolydian flavor. B in G7 moves to Bb then back. Earthy, forever repeatable.' },
  { id: 'f16', title: 'Bold as Love', style: 'Hendrix', chords: [c('A','maj'), c('B','maj'), c('F#','min'), c('D','maj'), c('E','maj')],
    dna: 'The borrowed II (B major instead of Bm) brightens the progression unexpectedly.' },
  { id: 'f17', title: 'Sus2 Landscape', style: 'Neo-Soul', chords: [c('D','sus2'), c('A','sus2'), c('E','sus2')],
    dna: 'No 3rd in any chord — major/minor ambiguity permanently suspended. The whole thing floats.' },
  { id: 'f18', title: 'Under the Bridge', style: 'Frusciante', chords: [c('D','maj'), c('F#','min'), c('E','maj'), c('A','maj'), c('G','maj')],
    dna: 'The F#m as III adds depth before lifting to E. G at the end stretches the modal picture wide.' },
  { id: 'f19', title: 'Parallel Dominants', style: 'Hendrix', chords: [c('D','s9'), c('G','s9')],
    dna: 'Parallel 7#9 chords a 4th apart. No tonal center — pure energy and grit.' },
  { id: 'f20', title: 'By The Way Lift', style: 'Frusciante', chords: [c('F','maj7'), c('A#','maj'), c('C','maj')],
    dna: 'Imaj7→bVII→I: the bVII movement gives that lifted quality before resolving.' },
];

export const LIBRARY: Progression[] = [
  { id: 'l1', style: 'Funk', title: 'I–IV Funk Vamp', chords: [c('A','dom7'), c('D','dom7')], dna: null },
  { id: 'l2', style: 'Neo-Soul', title: 'Minor ii–V–i', chords: [c('B','m7b5'), c('E','dom7'), c('A','min')], dna: null },
  { id: 'l3', style: 'Funk', title: 'Dorian Vamp', chords: [c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l4', style: 'Hendrix', title: 'I–bVII–IV–I', chords: [c('A','maj'), c('G','maj'), c('D','maj'), c('A','maj')], dna: null },
  { id: 'l5', style: 'Mayer', title: 'I–V–vi–IV', chords: [c('D','maj'), c('A','maj'), c('B','min'), c('G','maj')], dna: null },
  { id: 'l6', style: 'Neo-Soul', title: 'Drop 2 Shell Loop', chords: [c('F','maj7'), c('E','m7'), c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l7', style: 'Frusciante', title: 'RHCP Minor Loop', chords: [c('E','min'), c('F','maj'), c('G','maj')], dna: null },
  { id: 'l8', style: 'Funk', title: 'Chicken Scratch', chords: [c('G','dom9'), c('C','dom9')], dna: null },
  { id: 'l9', style: 'Neo-Soul', title: 'Modal Float', chords: [c('E','m9'), c('A','maj9'), c('D','maj9')], dna: null },
  { id: 'l10', style: 'Mayer', title: 'Lydian Lift', chords: [c('D','maj7'), c('E','maj'), c('D','maj7')], dna: null },
  { id: 'l11', style: 'Hendrix', title: 'Phrygian Dom', chords: [c('E','dom7'), c('F','maj'), c('E','dom7')], dna: null },
  { id: 'l12', style: 'Neo-Soul', title: 'Soul ii–V', chords: [c('C','m9'), c('F','dom9'), c('A#','maj9')], dna: null },
  { id: 'l13', style: 'Hendrix', title: 'Classic 12-Bar', chords: [c('A','dom7'), c('D','dom7'), c('A','dom7'), c('E','dom7')], dna: null },
  { id: 'l14', style: 'Frusciante', title: 'Higher Ground', chords: [c('D#','min'), c('G#','maj'), c('A#','maj')], dna: null },
  { id: 'l15', style: 'Funk', title: 'Scofield Dorian', chords: [c('G','m9'), c('C','dom9')], dna: null },
  { id: 'l16', style: 'Mayer', title: 'vi–IV–I–V', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')], dna: null },
  { id: 'l17', style: 'Neo-Soul', title: 'Dim Turnaround', chords: [c('C','maj7'), c('C#','dim7'), c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l18', style: 'Funk', title: 'One Drop', chords: [c('A','maj'), c('D','maj'), c('E','maj')], dna: null },
  { id: 'l19', style: 'Hendrix', title: 'E Blues', chords: [c('E','dom7'), c('A','dom7'), c('B','dom7')], dna: null },
  { id: 'l20', style: 'Mayer', title: 'Peaceful Walk', chords: [c('G','maj'), c('D','maj'), c('A','m7'), c('C','maj')], dna: null },
];

export const STYLES = ['All', 'Neo-Soul', 'Funk', 'Hendrix', 'Mayer', 'Frusciante'];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/content/progressions.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/content/progressions.ts src/content/progressions.test.ts
git commit -m "feat(content): port progression library as typed data"
```

---

### Task 7: Fretboard component (maple SVG renderer)

**Files:**
- Create: `src/ui/Fretboard.tsx`
- Test: `src/ui/Fretboard.test.tsx`

**Interfaces:**
- Consumes: `store` (`useStore`), `fretboard` (`getDots`, geometry, `BOARD`, `SW`, `INLAYS`, `sy`, `fcx`, `flx`, layout constants), `theory` (`NOTES`, `S_NAMES`, `SC`, `ICOLORS`, `intervalName`).
- Produces: default-exported `<Fretboard />` React component. Renders an `<svg data-testid="fretboard">` whose interval dots are `<circle data-testid="dot">` elements — one per `getDots(...)` result.

- [ ] **Step 1: Write the failing test `src/ui/Fretboard.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Fretboard from './Fretboard';
import { useStore } from './store';
import { getDots } from '../core/fretboard';

const initial = useStore.getState();

describe('<Fretboard />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('renders an svg', () => {
    render(<Fretboard />);
    expect(screen.getByTestId('fretboard')).toBeInTheDocument();
  });

  it('renders one dot per computed chord tone (Cmaj7 default)', () => {
    render(<Fretboard />);
    const s = useStore.getState();
    const expected = getDots({
      mode: s.mode, root: s.root, quality: s.quality,
      voicing: s.voicing, stringSet: s.stringSet, hlInterval: s.hlInterval,
    }).length;
    expect(screen.getAllByTestId('dot')).toHaveLength(expected);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/ui/Fretboard.test.tsx`
Expected: FAIL — cannot resolve `./Fretboard`.

- [ ] **Step 3: Write `src/ui/Fretboard.tsx`**

```tsx
import { useStore } from './store';
import { NOTES, S_NAMES, SC, ICOLORS, intervalName } from '../core/theory';
import {
  getDots, sy, fcx, flx, BOARD, SW, INLAYS,
  VW, VH, NX, PT, PB, FMAX,
} from '../core/fretboard';

export default function Fretboard() {
  const { root, quality, mode, voicing, stringSet, hlInterval, showLabels } = useStore();
  const dots = getDots({ mode, root, quality, voicing, stringSet, hlInterval });
  const my = PT + ((SC - 1) * (sy(1) - sy(0))) / 2;

  return (
    <svg data-testid="fretboard" id="fb" viewBox={`0 0 ${VW} ${VH}`} xmlns="http://www.w3.org/2000/svg">
      {/* wood */}
      <rect x={NX} y={0} width={VW - NX} height={VH} fill={BOARD.wood} />
      {/* grain */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = (VH / 12) * i + 1;
        return <line key={`g${i}`} x1={NX} y1={y} x2={VW} y2={y} stroke={BOARD.grain} strokeWidth={1.2} />;
      })}
      {/* inlays */}
      {INLAYS.map((f) => {
        const cx = flx(f - 1) + (flx(1) - flx(0)) / 2;
        if (f === 12) {
          const g = (sy(1) - sy(0)) * 0.9;
          return (
            <g key={`in${f}`}>
              <circle cx={cx} cy={my - g / 2} r={4.5} fill={BOARD.inlay} />
              <circle cx={cx} cy={my + g / 2} r={4.5} fill={BOARD.inlay} />
            </g>
          );
        }
        return <circle key={`in${f}`} cx={cx} cy={my} r={4.5} fill={BOARD.inlay} />;
      })}
      {/* strings */}
      {Array.from({ length: SC }, (_, s) => (
        <line key={`s${s}`} x1={NX} y1={sy(s)} x2={VW - 2} y2={sy(s)} stroke={BOARD.string} strokeWidth={SW[s]} opacity={0.75} />
      ))}
      {/* nut */}
      <rect x={NX} y={PT - 5} width={5} height={(SC - 1) * (sy(1) - sy(0)) + 10} fill={BOARD.nut} rx={1} />
      {/* frets */}
      {Array.from({ length: FMAX }, (_, i) => {
        const f = i + 1;
        return <line key={`f${f}`} x1={flx(f)} y1={PT - 2} x2={flx(f)} y2={VH - PB + 2} stroke={BOARD.fret} strokeWidth={1.4} />;
      })}
      {/* string labels */}
      {Array.from({ length: SC }, (_, s) => (
        <text key={`sl${s}`} x={NX - 8} y={sy(s) + 4} textAnchor="end" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={BOARD.label}>
          {S_NAMES[s]}
        </text>
      ))}
      {/* fret numbers */}
      {Array.from({ length: FMAX }, (_, i) => i + 1).filter((f) => f % 2 === 1).map((f) => (
        <text key={`fn${f}`} x={fcx(f)} y={VH - 5} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" fill={BOARD.fretNum}>
          {f}
        </text>
      ))}
      <text x={fcx(0)} y={VH - 5} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" fill={BOARD.fretNum}>O</text>
      {/* dots */}
      {dots.map(({ s, f, semi, note, delay }) => {
        const cx = fcx(f), cy = sy(s);
        const color = ICOLORS[semi] ?? '#888';
        const r = semi === 0 ? 13 : 11;
        return (
          <g key={`d${s}-${f}`} transform={`translate(${cx},${cy})`}>
            <g className="nd" style={{ animationDelay: `${delay}ms` }}>
              {semi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />}
              <circle data-testid="dot" cx={0} cy={0} r={r} fill={color} opacity={semi === 0 ? 1 : 0.9} />
              <text x={0} y={4} textAnchor="middle" fontSize={semi === 0 ? 9 : 8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={500}>
                {showLabels ? intervalName(semi) : NOTES[note]}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/ui/Fretboard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/Fretboard.tsx src/ui/Fretboard.test.tsx
git commit -m "feat(ui): render maple fretboard SVG from store"
```

---

### Task 8: Control panels, chord info, legend, and full styling

**Files:**
- Create: `src/ui/panels/RootPicker.tsx`
- Create: `src/ui/panels/QualityPicker.tsx`
- Create: `src/ui/panels/ShapeControls.tsx`
- Create: `src/ui/panels/IntervalControls.tsx`
- Create: `src/ui/ChordInfo.tsx`
- Create: `src/ui/Legend.tsx`
- Create: `src/ui/ModeTabs.tsx`
- Modify: `src/App.tsx` (replace placeholder with full layout)
- Modify: `src/index.css` (replace minimal CSS with full maple styling)
- Test: `src/ui/ChordInfo.test.tsx`

**Interfaces:**
- Consumes: `store`, `theory` (`NOTES`, `INAMES`, `intervalName`), `chords` (`QTYPES`, `getChordIntervals`, `chipKind`), `types`.
- Produces: default-exported components `RootPicker`, `QualityPicker`, `ShapeControls`, `IntervalControls`, `ChordInfo`, `Legend`, `ModeTabs`, and the composed `App`. No further tasks depend on these.

- [ ] **Step 1: Write `src/ui/ModeTabs.tsx`**

```tsx
import { useStore } from './store';
import type { Mode } from '../core/types';

const MODES: { m: Mode; label: string }[] = [
  { m: 'shapes', label: 'Shapes' },
  { m: 'intervals', label: 'Intervals' },
];

export default function ModeTabs() {
  const { mode, setMode } = useStore();
  return (
    <div id="tabs">
      {MODES.map(({ m, label }) => (
        <button key={m} className={`tab${mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/ui/panels/RootPicker.tsx`**

```tsx
import { useStore } from '../store';
import { NOTES } from '../../core/theory';

export default function RootPicker() {
  const { root, setRoot } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Root</div>
      <div id="root-grid">
        {NOTES.map((n, i) => (
          <button key={n} className={`rbtn${root === i ? ' on' : ''}`} onClick={() => setRoot(i)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/ui/panels/QualityPicker.tsx`**

```tsx
import { useStore } from '../store';
import { QTYPES } from '../../core/chords';

export default function QualityPicker() {
  const { quality, setQuality } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Quality</div>
      <div id="qual-grid">
        {Object.entries(QTYPES).map(([k, v]) => (
          <button key={k} className={`qbtn${quality === k ? ' on' : ''}`} onClick={() => setQuality(k)}>
            {v.l}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/ui/panels/ShapeControls.tsx`**

```tsx
import { useStore } from '../store';
import type { StringSet } from '../../core/types';
import type { Voicing } from '../../core/chords';

const STRING_SET_OPTS: { v: StringSet; l: string }[] = [
  { v: 'all', l: 'All strings' },
  { v: '123', l: 'Strings 1-2-3  (e B G)' },
  { v: '234', l: 'Strings 2-3-4  (B G D)' },
  { v: '345', l: 'Strings 3-4-5  (G D A)' },
  { v: '456', l: 'Strings 4-5-6  (D A E)' },
];

const VOICING_OPTS: { v: Voicing; l: string }[] = [
  { v: 'standard', l: 'Standard' },
  { v: 'shell', l: 'Shell (3 + 7)' },
  { v: 'rootless', l: 'Rootless' },
];

export default function ShapeControls() {
  const { stringSet, setStringSet, voicing, setVoicing } = useStore();
  return (
    <>
      <div className="sec">
        <div className="sec-label">String Set</div>
        <div id="ss-wrap">
          {STRING_SET_OPTS.map(({ v, l }) => (
            <button key={v} className={`fbtn${stringSet === v ? ' on' : ''}`} onClick={() => setStringSet(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="sec">
        <div className="sec-label">Voicing</div>
        <div id="vc-wrap">
          {VOICING_OPTS.map(({ v, l }) => (
            <button key={v} className={`fbtn${voicing === v ? ' on' : ''}`} onClick={() => setVoicing(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Write `src/ui/panels/IntervalControls.tsx`**

```tsx
import { useStore } from '../store';

const IV_OPTS: { v: number | null; l: string }[] = [
  { v: null, l: 'All' }, { v: 0, l: 'R' }, { v: 2, l: '9' }, { v: 3, l: 'b3' },
  { v: 4, l: '3' }, { v: 5, l: '4' }, { v: 6, l: 'b5' }, { v: 7, l: '5' },
  { v: 8, l: '#5' }, { v: 9, l: '6' }, { v: 10, l: 'b7' }, { v: 11, l: 'Δ7' },
];

export default function IntervalControls() {
  const { hlInterval, setHlInterval } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Highlight</div>
      <div id="iv-grid">
        {IV_OPTS.map(({ v, l }) => (
          <button key={l} className={`ivbtn${hlInterval === v ? ' on' : ''}`} onClick={() => setHlInterval(v)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write `src/ui/ChordInfo.tsx`**

```tsx
import { useStore } from './store';
import { NOTES, INAMES, intervalName } from '../core/theory';
import { QTYPES, getChordIntervals, chipKind } from '../core/chords';

export default function ChordInfo() {
  const { root, quality, mode, voicing, hlInterval } = useStore();
  const rn = NOTES[root];
  const ql = mode === 'intervals'
    ? `${hlInterval === null ? 'all' : intervalName(hlInterval)} intervals`
    : QTYPES[quality]?.l ?? quality;

  return (
    <div id="cinfo">
      <div id="cname">{rn}{ql}</div>
      <div id="ctones">
        {mode === 'shapes' &&
          getChordIntervals(quality, voicing).map((semi) => {
            const ni = (root + semi) % 12;
            return (
              <div key={semi} className={`chip chip-${chipKind(semi)}`}>
                <span style={{ fontSize: 9, opacity: 0.6 }}>{INAMES[semi]}</span> {NOTES[ni]}
              </div>
            );
          })}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write `src/ui/Legend.tsx`**

```tsx
const LEG: [string, string][] = [
  ['#E04808', 'Root'], ['#149A70', '3rd'], ['#3A70B8', '5th'],
  ['#A028B0', '7th'], ['#6840C8', 'Extension'],
];

export default function Legend() {
  return (
    <div id="legend">
      {LEG.map(([c, l]) => (
        <div key={l} className="leg">
          <div className="leg-dot" style={{ background: c }} />
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Write the failing test `src/ui/ChordInfo.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChordInfo from './ChordInfo';
import { useStore } from './store';

const initial = useStore.getState();

describe('<ChordInfo />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('shows the chord name for the current root + quality', () => {
    useStore.setState({ root: 0, quality: 'maj7', mode: 'shapes' });
    render(<ChordInfo />);
    expect(screen.getByText('Cmaj7')).toBeInTheDocument();
  });

  it('shows a tone chip per chord interval', () => {
    useStore.setState({ root: 0, quality: 'maj7', mode: 'shapes' });
    render(<ChordInfo />);
    // Cmaj7 -> C E G B = 4 chips
    expect(document.querySelectorAll('.chip')).toHaveLength(4);
  });
});
```

- [ ] **Step 9: Run the test to verify it fails**

Run: `npx vitest run src/ui/ChordInfo.test.tsx`
Expected: FAIL — cannot resolve `./ChordInfo` (until Step 6 file compiles alongside App wiring; if this step is run before Step 6, that is expected).

- [ ] **Step 10: Replace `src/App.tsx` with the full layout**

```tsx
import { useEffect } from 'react';
import ModeTabs from './ui/ModeTabs';
import RootPicker from './ui/panels/RootPicker';
import QualityPicker from './ui/panels/QualityPicker';
import ShapeControls from './ui/panels/ShapeControls';
import IntervalControls from './ui/panels/IntervalControls';
import ChordInfo from './ui/ChordInfo';
import Legend from './ui/Legend';
import Fretboard from './ui/Fretboard';
import { useStore } from './ui/store';

export default function App() {
  const { mode, showLabels, setShowLabels } = useStore();

  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);

  return (
    <>
      <div id="hdr">
        <div id="logo">Fret<em>DNA</em></div>
        <ModeTabs />
      </div>

      <div id="main">
        <aside id="lp">
          <RootPicker />
          {mode === 'shapes' ? (
            <>
              <QualityPicker />
              <ShapeControls />
            </>
          ) : (
            <IntervalControls />
          )}
          <div className="sec">
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">Show intervals</span>
            </div>
          </div>
        </aside>

        <div id="ctr">
          <ChordInfo />
          <div id="fb-wrap">
            <Fretboard />
          </div>
          <Legend />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 11: Replace `src/index.css` with full maple styling**

```css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#EDE7DC;--panel:#FAFAF8;--panel2:#F4F0E8;--border:#DDD5C4;--border2:#C8BC9A;
  --text:#1A1208;--dim:#7A6A52;--mute:#B8AC94;--accent:#B06818;
  --accent-bg:rgba(176,104,24,.1);--accent-border:rgba(176,104,24,.35);
  --c-root:#E04808;--c-3rd:#149A70;--c-5th:#3A70B8;--c-7th:#A028B0;--c-ext:#6840C8;
  --r:7px;--rs:5px;
}
html,body{height:100%}
body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--text);display:flex;flex-direction:column;min-height:100vh}
button{font-family:inherit;cursor:pointer;border:none;background:none}

#hdr{display:flex;align-items:center;height:50px;padding:0 18px;background:var(--panel);border-bottom:1px solid var(--border);gap:16px;flex-shrink:0}
#logo{font-size:17px;font-weight:600;letter-spacing:-.5px}
#logo em{font-style:normal;color:var(--accent)}
#tabs{display:flex;gap:2px;background:var(--bg);padding:3px;border-radius:var(--r);border:1px solid var(--border)}
.tab{padding:5px 16px;font-size:13px;font-weight:500;color:var(--dim);border-radius:var(--rs);transition:all .15s}
.tab.on{background:var(--panel);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.12)}

#main{display:flex;flex:1;min-height:0}
#lp{width:196px;flex-shrink:0;background:var(--panel);border-right:1px solid var(--border);overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:16px}
.sec{display:flex;flex-direction:column;gap:6px}
.sec-label{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute)}

#root-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
.rbtn{padding:7px 2px;font-size:12px;font-weight:500;font-family:'JetBrains Mono',monospace;background:var(--panel2);border:1px solid var(--border);color:var(--dim);border-radius:var(--rs);text-align:center;transition:all .12s}
.rbtn.on{background:var(--c-root);border-color:var(--c-root);color:#fff;font-weight:600}
.rbtn:hover:not(.on){border-color:var(--border2);color:var(--text)}

#qual-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
.qbtn{padding:6px 4px;font-size:11px;font-weight:500;font-family:'JetBrains Mono',monospace;background:var(--panel2);border:1px solid var(--border);color:var(--dim);border-radius:var(--rs);text-align:center;transition:all .12s}
.qbtn.on{background:rgba(20,154,112,.1);border-color:var(--c-3rd);color:var(--c-3rd);font-weight:600}
.qbtn:hover:not(.on){border-color:var(--border2);color:var(--text)}

.fbtn{padding:6px 9px;font-size:11px;background:var(--panel2);border:1px solid var(--border);color:var(--dim);border-radius:var(--rs);text-align:left;transition:all .12s;width:100%}
.fbtn.on{background:var(--accent-bg);border-color:var(--accent-border);color:var(--accent)}
.fbtn:hover:not(.on){border-color:var(--border2);color:var(--text)}
#ss-wrap,#vc-wrap{display:flex;flex-direction:column;gap:3px}

#iv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
.ivbtn{padding:5px 2px;font-size:11px;font-family:'JetBrains Mono',monospace;background:var(--panel2);border:1px solid var(--border);color:var(--dim);border-radius:var(--rs);text-align:center;transition:all .12s}
.ivbtn.on{background:rgba(104,64,200,.1);border-color:var(--c-ext);color:var(--c-ext);font-weight:600}
.ivbtn:hover:not(.on){border-color:var(--border2);color:var(--text)}

.tog-row{display:flex;align-items:center;gap:8px}
.tog{position:relative;width:34px;height:19px;flex-shrink:0;cursor:pointer}
.tog input{opacity:0;width:0;height:0}
.tog-t{position:absolute;inset:0;background:var(--border2);border-radius:10px;transition:background .2s}
.tog-t::after{content:'';position:absolute;left:2px;top:2px;width:15px;height:15px;background:#fff;border-radius:50%;transition:transform .18s;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.tog input:checked+.tog-t{background:var(--c-3rd)}
.tog input:checked+.tog-t::after{transform:translateX(15px)}
.tog-l{font-size:12px;color:var(--dim)}

#ctr{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 18px;gap:10px;min-width:0}
#cinfo{display:flex;align-items:center;gap:12px;padding:8px 14px;background:var(--panel);border:1px solid var(--border);border-radius:var(--r);width:100%;max-width:940px}
#cname{font-size:21px;font-weight:600;font-family:'JetBrains Mono',monospace;min-width:100px}
#ctones{display:flex;gap:5px;flex-wrap:wrap}
.chip{padding:2px 9px;border-radius:20px;font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:500;display:flex;align-items:center;gap:4px}
.chip-root{background:rgba(224,72,8,.1);color:var(--c-root);border:1px solid rgba(224,72,8,.25)}
.chip-3rd{background:rgba(20,154,112,.1);color:var(--c-3rd);border:1px solid rgba(20,154,112,.25)}
.chip-5th{background:rgba(58,112,184,.1);color:var(--c-5th);border:1px solid rgba(58,112,184,.25)}
.chip-7th{background:rgba(160,40,176,.1);color:var(--c-7th);border:1px solid rgba(160,40,176,.25)}
.chip-ext{background:rgba(104,64,200,.1);color:var(--c-ext);border:1px solid rgba(104,64,200,.25)}

#fb-wrap{width:100%;max-width:940px}
#fb{width:100%;height:auto;display:block}
@keyframes bloom{from{opacity:0;transform:scale(.15)}to{opacity:1;transform:scale(1)}}
.nd{animation:bloom .2s ease-out both}

#legend{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--dim)}
.leg-dot{width:11px;height:11px;border-radius:50%}
```

- [ ] **Step 12: Run all tests**

Run: `npm test`
Expected: PASS — all suites green (theory, chords, fretboard, store, progressions, Fretboard, ChordInfo).

- [ ] **Step 13: Type-check the build**

Run: `npm run build`
Expected: PASS — no TypeScript errors, `dist/` emitted.

- [ ] **Step 14: Manual verification in the browser**

Run: `npm run dev`, open the printed URL.
Confirm:
- The fretboard is **maple (light wood)**, not dark.
- Cmaj7 dots appear with a bloom animation; root has a ring.
- Changing Root / Quality updates the board and the chord-info chips.
- The "Show intervals" toggle flips dot labels between interval names (R, 3, 5, Δ7) and note names (C, E, G, B).
- Switching to the **Intervals** tab swaps the left panel to the Highlight grid and lights only the chosen interval.
- Legend shows the five color categories.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat(ui): control panels, chord info, legend, maple styling, app layout"
```

---

## Self-Review

**Spec coverage (Phase 1 scope):**
- Vite + React + TS + Zustand + Vitest scaffold → Task 1. ✓
- `core/theory` → Task 2. ✓
- `core/chords` → Task 3. ✓
- `core/fretboard` (geometry + `getDots`, replaces v1 inline logic) → Task 4. ✓
- Typed store replacing global `S` → Task 5. ✓
- Content ported as typed data → Task 6. ✓
- Maple fretboard renderer (SVG, bloom animation preserved) → Task 7. ✓
- Controls (root, quality, string-set, voicing, intervals mode, show-labels), chord info, legend, full styling → Task 8. ✓
- `ui/` imports `core/`, never reverse (global constraint) — verified by inspection in each UI task. ✓
- Deferred by design: Library right-panel, Loop strip, ghost overlay, `voicings.ts`/`caged.ts`, `ChordChart.tsx`, audio — all belong to later phases per the spec. Noted in Global Constraints.

**Placeholder scan:** No TBD/TODO; every code step contains complete code; every run step has an exact command + expected result.

**Type consistency:** `Voicing` defined once in `chords.ts` and imported everywhere; `Dot`/`DotParams` defined in `fretboard.ts` and consumed by `Fretboard.tsx`; store field/setter names match between `store.ts`, its test, and all consuming components; `chipKind` return union matches the `.chip-*` CSS classes and `ChordInfo` usage.
