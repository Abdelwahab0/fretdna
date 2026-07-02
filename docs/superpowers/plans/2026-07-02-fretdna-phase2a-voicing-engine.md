# FretDNA Phase 2a — CAGED Voicing Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure, unit-tested `core/` engine that produces **playable, fingered CAGED voicings** for major and minor triads — the foundation for FretDNA's "how do I actually finger this?" feature.

**Architecture:** Encode each CAGED shape as its canonical open-chord instance (open C/A/G/E/D major; open Em/Am/Dm), then make it movable by shifting to any root pitch class. Two new pure modules: `core/caged.ts` (shape data + `shapeAt`) and `core/voicings.ts` (`voicingsFor` + finger assignment). Correctness is anchored by tests that assert each shape reproduces the real open chord. No UI in this plan.

**Tech Stack:** TypeScript, Vitest (existing). No new dependencies.

## Global Constraints

- `core/` MUST NOT import React, the store, or anything from `ui/`. `caged.ts`/`voicings.ts` may import other `core/` modules (`theory`).
- String indexing is fixed: string 0 = high e … string 5 = low E. `TUNING = [4,11,7,2,9,4]`, `SC = 6`.
- A muted/unused string in a shape template is represented by fret `-1`.
- Strict tsc: `noUnusedLocals`/`noUnusedParameters` — run `npm run build` before every commit; Vitest (esbuild) does NOT enforce this.
- Every implementer runs BOTH `npm test` (full suite) and `npm run build` before committing.
- Interval color coding and `chipKind` from Phase 1 are unchanged and reused downstream.
- Scope of THIS plan: **major & minor triads only** (`quality` ∈ `'maj' | 'min'`). Major uses all 5 shapes (C,A,G,E,D); minor uses E/A/D shapes only (C-minor and G-minor have no standard CAGED open form). 7th chords, extensions, and all UI are explicitly out of scope (later plans).

---

### Task 1: Rename `Voicing` → `VoicingStyle` (free the name for the fingered-shape type)

Phase 1 defined `type Voicing = 'standard' | 'shell' | 'rootless'` in `core/chords.ts` — a display filter. Phase 2 needs the name `Voicing` for the central fingered-shape type. This task renames the Phase-1 type to `VoicingStyle` everywhere it is used. Pure mechanical rename; `tsc` catches any miss.

**Files:**
- Modify: `src/core/chords.ts`
- Modify: `src/ui/store.ts`
- Modify: `src/core/fretboard.ts`
- Modify: `src/ui/panels/ShapeControls.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `export type VoicingStyle = 'standard' | 'shell' | 'rootless'` in `chords.ts`; `getChordIntervals(quality: string, voicing?: VoicingStyle)`. The identifier `Voicing` is now unused and free for Task 3.

- [ ] **Step 1: Rename the type and its use in `src/core/chords.ts`**

Change line 1 from:
```ts
export type Voicing = 'standard' | 'shell' | 'rootless';
```
to:
```ts
export type VoicingStyle = 'standard' | 'shell' | 'rootless';
```
And change the `getChordIntervals` signature from:
```ts
export function getChordIntervals(quality: string, voicing: Voicing = 'standard'): number[] {
```
to:
```ts
export function getChordIntervals(quality: string, voicing: VoicingStyle = 'standard'): number[] {
```

- [ ] **Step 2: Update `src/ui/store.ts`**

Change the import:
```ts
import type { Voicing } from '../core/chords';
```
to:
```ts
import type { VoicingStyle } from '../core/chords';
```
Change the state field and setter type (two occurrences of `Voicing`):
```ts
  voicing: VoicingStyle;
```
```ts
  setVoicing: (v: VoicingStyle) => void;
```

- [ ] **Step 3: Update `src/core/fretboard.ts`**

Change the import:
```ts
import { getChordIntervals, type Voicing } from './chords';
```
to:
```ts
import { getChordIntervals, type VoicingStyle } from './chords';
```
Change the `DotParams` field:
```ts
  voicing: VoicingStyle;
```

- [ ] **Step 4: Update `src/ui/panels/ShapeControls.tsx`**

Change the import:
```ts
import type { Voicing } from '../../core/chords';
```
to:
```ts
import type { VoicingStyle } from '../../core/chords';
```
Change the options constant type annotation:
```ts
const VOICING_OPTS: { v: VoicingStyle; l: string }[] = [
```

- [ ] **Step 5: Run the full suite + build to prove nothing broke**

Run: `npm test`
Expected: PASS — all 30 existing tests still pass (behavior unchanged; only a type name changed).

Run: `npm run build`
Expected: PASS — `tsc -b` reports no errors (no remaining reference to the old `Voicing` name).

- [ ] **Step 6: Commit**

```bash
git add src/core/chords.ts src/ui/store.ts src/core/fretboard.ts src/ui/panels/ShapeControls.tsx
git commit -m "refactor(core): rename Voicing display-filter type to VoicingStyle"
```

---

### Task 2: CAGED shape data + `shapeAt` (movable shapes anchored to open chords)

**Files:**
- Create: `src/core/caged.ts`
- Test: `src/core/caged.test.ts`

**Interfaces:**
- Consumes: `theory` (`SC`, `noteAt`, `semitoneFrom`).
- Produces:
  - `type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D'`
  - `type TriadQuality = 'maj' | 'min'`
  - `interface ShapeNote { string: number; fret: number; semi: number }`
  - `const MAJOR_SHAPE_ORDER: CagedShape[]` = `['C','A','G','E','D']`
  - `const MINOR_SHAPE_ORDER: CagedShape[]` = `['E','A','D']`
  - `function shapeAt(root: number, shape: CagedShape, quality: TriadQuality): { baseFret: number; notes: ShapeNote[] } | null` — returns `null` for shapes that don't exist for the given quality (Cm, Gm).

- [ ] **Step 1: Write the failing test `src/core/caged.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { shapeAt, MAJOR_SHAPE_ORDER, MINOR_SHAPE_ORDER } from './caged';

// Helper: get [fret per string 0..5], using -1 where the shape omits a string.
function fretRow(notes: { string: number; fret: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.fret;
  return row;
}
function semiRow(notes: { string: number; semi: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.semi;
  return row;
}

describe('caged shape orders', () => {
  it('major has 5 shapes, minor has 3', () => {
    expect(MAJOR_SHAPE_ORDER).toEqual(['C', 'A', 'G', 'E', 'D']);
    expect(MINOR_SHAPE_ORDER).toEqual(['E', 'A', 'D']);
  });
});

describe('shapeAt reproduces canonical open chords at their natural root', () => {
  it('E-shape major at root E = open E [0,0,1,2,2,0]', () => {
    const r = shapeAt(4, 'E', 'maj')!;
    expect(r.baseFret).toBe(0);
    expect(fretRow(r.notes)).toEqual([0, 0, 1, 2, 2, 0]);
    // semis: R on low E, 3rd on G string, 5th on B/A strings
    expect(semiRow(r.notes)).toEqual([0, 7, 4, 0, 7, 0]);
  });

  it('A-shape major at root A = open A [0,2,2,2,0,-1]', () => {
    const r = shapeAt(9, 'A', 'maj')!;
    expect(fretRow(r.notes)).toEqual([0, 2, 2, 2, 0, -1]);
  });

  it('D-shape major at root D = open D [2,3,2,0,-1,-1]', () => {
    const r = shapeAt(2, 'D', 'maj')!;
    expect(fretRow(r.notes)).toEqual([2, 3, 2, 0, -1, -1]);
  });

  it('C-shape major at root C = open C [0,1,0,2,3,-1]', () => {
    const r = shapeAt(0, 'C', 'maj')!;
    expect(fretRow(r.notes)).toEqual([0, 1, 0, 2, 3, -1]);
  });

  it('G-shape major at root G = open G [3,0,0,0,2,3]', () => {
    const r = shapeAt(7, 'G', 'maj')!;
    expect(fretRow(r.notes)).toEqual([3, 0, 0, 0, 2, 3]);
  });

  it('E-shape minor at root E = open Em [0,0,0,2,2,0]', () => {
    const r = shapeAt(4, 'E', 'min')!;
    expect(fretRow(r.notes)).toEqual([0, 0, 0, 2, 2, 0]);
    // minor: b3 (semi 3) on the G string
    expect(semiRow(r.notes)).toEqual([0, 7, 3, 0, 7, 0]);
  });

  it('A-shape minor at root A = open Am [0,1,2,2,0,-1]', () => {
    const r = shapeAt(9, 'A', 'min')!;
    expect(fretRow(r.notes)).toEqual([0, 1, 2, 2, 0, -1]);
  });

  it('D-shape minor at root D = open Dm [1,3,2,0,-1,-1]', () => {
    const r = shapeAt(2, 'D', 'min')!;
    expect(fretRow(r.notes)).toEqual([1, 3, 2, 0, -1, -1]);
  });
});

describe('shapeAt movability (barre)', () => {
  it('E-shape major at root F = F barre [1,1,2,3,3,1], baseFret 1', () => {
    const r = shapeAt(5, 'E', 'maj')!;
    expect(r.baseFret).toBe(1);
    expect(fretRow(r.notes)).toEqual([1, 1, 2, 3, 3, 1]);
    // interval pattern is preserved when moved
    expect(semiRow(r.notes)).toEqual([0, 7, 4, 0, 7, 0]);
  });

  it('A-shape major at root C = C barre at 3rd fret [3,5,5,5,3,-1]', () => {
    const r = shapeAt(0, 'A', 'maj')!;
    expect(r.baseFret).toBe(3);
    expect(fretRow(r.notes)).toEqual([3, 5, 5, 5, 3, -1]);
  });
});

describe('shapeAt returns null for nonexistent minor shapes', () => {
  it('C-shape minor and G-shape minor are null', () => {
    expect(shapeAt(0, 'C', 'min')).toBeNull();
    expect(shapeAt(0, 'G', 'min')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/core/caged.test.ts`
Expected: FAIL — cannot resolve `./caged`.

- [ ] **Step 3: Write `src/core/caged.ts`**

```ts
import { SC, noteAt, semitoneFrom } from './theory';

export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';
export type TriadQuality = 'maj' | 'min';

export interface ShapeNote {
  string: number; // 0 = high e … 5 = low E
  fret: number;   // absolute fret (0 = open)
  semi: number;   // interval from the chord root (0..11)
}

// A CAGED shape, encoded as its canonical open-position instance.
// `frets` is indexed by string 0..5; -1 means the string is not played.
// `naturalRoot` is the pitch class of the chord this open instance spells.
interface ShapeDef {
  frets: number[];
  naturalRoot: number;
}

// Major open chords (canonical). String order: 0=high e,1=B,2=G,3=D,4=A,5=low E.
const MAJOR_SHAPES: Record<CagedShape, ShapeDef> = {
  E: { frets: [0, 0, 1, 2, 2, 0], naturalRoot: 4 }, // open E
  A: { frets: [0, 2, 2, 2, 0, -1], naturalRoot: 9 }, // open A
  D: { frets: [2, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open D
  C: { frets: [0, 1, 0, 2, 3, -1], naturalRoot: 0 }, // open C
  G: { frets: [3, 0, 0, 0, 2, 3], naturalRoot: 7 }, // open G
};

// Minor open chords. Only E/A/D forms are standard CAGED shapes;
// C-minor and G-minor have no common open form.
const MINOR_SHAPES: Partial<Record<CagedShape, ShapeDef>> = {
  E: { frets: [0, 0, 0, 2, 2, 0], naturalRoot: 4 }, // open Em
  A: { frets: [0, 1, 2, 2, 0, -1], naturalRoot: 9 }, // open Am
  D: { frets: [1, 3, 2, 0, -1, -1], naturalRoot: 2 }, // open Dm
};

export const MAJOR_SHAPE_ORDER: CagedShape[] = ['C', 'A', 'G', 'E', 'D'];
export const MINOR_SHAPE_ORDER: CagedShape[] = ['E', 'A', 'D'];

/**
 * Move a CAGED shape to `root`. The whole shape shifts up by `delta` frets
 * (the barre fret); strings that were open (fret 0) become fretted at `delta`.
 * Returns null when the shape does not exist for the given quality (Cm, Gm).
 */
export function shapeAt(
  root: number,
  shape: CagedShape,
  quality: TriadQuality,
): { baseFret: number; notes: ShapeNote[] } | null {
  const def = quality === 'maj' ? MAJOR_SHAPES[shape] : MINOR_SHAPES[shape];
  if (!def) return null;
  const delta = (((root - def.naturalRoot) % 12) + 12) % 12;
  const notes: ShapeNote[] = [];
  for (let s = 0; s < SC; s++) {
    const f = def.frets[s];
    if (f < 0) continue;
    const fret = f + delta;
    const note = noteAt(s, fret);
    notes.push({ string: s, fret, semi: semitoneFrom(root, note) });
  }
  return { baseFret: delta, notes };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/core/caged.test.ts`
Expected: PASS (all cases — the open-chord and barre assertions confirm the shape data is correct).

- [ ] **Step 5: Run full suite + build**

Run: `npm test`
Expected: PASS (existing 30 + new caged tests).
Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/core/caged.ts src/core/caged.test.ts
git commit -m "feat(core): add CAGED shape data and movable shapeAt"
```

---

### Task 3: `voicingsFor` + finger assignment (the `Voicing` type)

**Files:**
- Create: `src/core/voicings.ts`
- Test: `src/core/voicings.test.ts`

**Interfaces:**
- Consumes: `caged` (`shapeAt`, `MAJOR_SHAPE_ORDER`, `MINOR_SHAPE_ORDER`, `CagedShape`, `TriadQuality`, `ShapeNote`).
- Produces:
  - `interface VoicedNote extends ShapeNote { finger: 0 | 1 | 2 | 3 | 4 }` (0 = played open)
  - `interface Voicing { root: number; quality: TriadQuality; shape: CagedShape; baseFret: number; notes: VoicedNote[] }`
  - `function assignFingers(baseFret: number, notes: ShapeNote[]): VoicedNote[]`
  - `function voicingsFor(root: number, quality: TriadQuality): Voicing[]` — one `Voicing` per applicable shape, in `MAJOR_SHAPE_ORDER`/`MINOR_SHAPE_ORDER`.

- [ ] **Step 1: Write the failing test `src/core/voicings.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { voicingsFor, assignFingers } from './voicings';

function fingerRow(notes: { string: number; finger: number }[]): number[] {
  const row = [-1, -1, -1, -1, -1, -1];
  for (const n of notes) row[n.string] = n.finger;
  return row;
}

describe('assignFingers', () => {
  it('open chord: fret 0 = finger 0 (open), higher frets numbered by ascending fret', () => {
    // open E major shape frets [0,0,1,2,2,0]
    const notes = [
      { string: 0, fret: 0, semi: 0 },
      { string: 1, fret: 0, semi: 7 },
      { string: 2, fret: 1, semi: 4 },
      { string: 3, fret: 2, semi: 0 },
      { string: 4, fret: 2, semi: 7 },
      { string: 5, fret: 0, semi: 0 },
    ];
    expect(fingerRow(assignFingers(0, notes))).toEqual([0, 0, 1, 2, 2, 0]);
  });

  it('barre chord: notes at baseFret = finger 1, higher frets numbered 2,3,4', () => {
    // F major (E-shape at fret 1): frets [1,1,2,3,3,1]
    const notes = [
      { string: 0, fret: 1, semi: 0 },
      { string: 1, fret: 1, semi: 7 },
      { string: 2, fret: 2, semi: 4 },
      { string: 3, fret: 3, semi: 0 },
      { string: 4, fret: 3, semi: 7 },
      { string: 5, fret: 1, semi: 0 },
    ];
    expect(fingerRow(assignFingers(1, notes))).toEqual([1, 1, 2, 3, 3, 1]);
  });
});

describe('voicingsFor', () => {
  it('major returns 5 shapes in CAGED order', () => {
    const vs = voicingsFor(0, 'maj'); // C major
    expect(vs.map((v) => v.shape)).toEqual(['C', 'A', 'G', 'E', 'D']);
  });

  it('minor returns 3 shapes (E, A, D)', () => {
    const vs = voicingsFor(9, 'min'); // A minor
    expect(vs.map((v) => v.shape)).toEqual(['E', 'A', 'D']);
  });

  it('every note in every voicing is a real chord tone', () => {
    const majTones = new Set([0, 4, 7]); // root, 3, 5
    for (const v of voicingsFor(0, 'maj')) {
      for (const n of v.notes) expect(majTones.has(n.semi)).toBe(true);
    }
    const minTones = new Set([0, 3, 7]); // root, b3, 5
    for (const v of voicingsFor(9, 'min')) {
      for (const n of v.notes) expect(minTones.has(n.semi)).toBe(true);
    }
  });

  it('every voicing spans at most 4 frets among its fretted notes', () => {
    for (const v of voicingsFor(0, 'maj')) {
      const fretted = v.notes.filter((n) => n.fret > 0).map((n) => n.fret);
      if (fretted.length > 1) {
        expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(4);
      }
    }
  });

  it('the C-major C-shape voicing is the open C chord with fingers', () => {
    const cShape = voicingsFor(0, 'maj').find((v) => v.shape === 'C')!;
    expect(cShape.baseFret).toBe(0);
    expect(fingerRow(cShape.notes)).toEqual([0, 1, 0, 2, 3, -1]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/core/voicings.test.ts`
Expected: FAIL — cannot resolve `./voicings`.

- [ ] **Step 3: Write `src/core/voicings.ts`**

```ts
import {
  shapeAt,
  MAJOR_SHAPE_ORDER,
  MINOR_SHAPE_ORDER,
  type CagedShape,
  type TriadQuality,
  type ShapeNote,
} from './caged';

export interface VoicedNote extends ShapeNote {
  finger: 0 | 1 | 2 | 3 | 4; // 0 = played open
}

export interface Voicing {
  root: number;
  quality: TriadQuality;
  shape: CagedShape;
  baseFret: number;
  notes: VoicedNote[];
}

/**
 * Assign fingers with a simple, deterministic heuristic:
 * - Open chord (baseFret 0): fret 0 = open (finger 0); each higher distinct
 *   fret gets the next finger (1,2,3,4) in ascending fret order.
 * - Barre (baseFret > 0): every note at baseFret shares finger 1 (the barre);
 *   each higher distinct fret gets 2,3,4 in ascending order.
 * Finger numbers are capped at 4.
 */
export function assignFingers(baseFret: number, notes: ShapeNote[]): VoicedNote[] {
  const distinctAscending = (min: number) =>
    [...new Set(notes.filter((n) => n.fret > min).map((n) => n.fret))].sort((a, b) => a - b);

  if (baseFret === 0) {
    const fretted = distinctAscending(0);
    const fingerOf = new Map<number, number>();
    fretted.forEach((f, i) => fingerOf.set(f, Math.min(i + 1, 4)));
    return notes.map((n) => ({
      ...n,
      finger: (n.fret === 0 ? 0 : fingerOf.get(n.fret)!) as 0 | 1 | 2 | 3 | 4,
    }));
  }

  const higher = distinctAscending(baseFret);
  const fingerOf = new Map<number, number>();
  higher.forEach((f, i) => fingerOf.set(f, Math.min(i + 2, 4)));
  return notes.map((n) => ({
    ...n,
    finger: (n.fret === baseFret ? 1 : fingerOf.get(n.fret)!) as 0 | 1 | 2 | 3 | 4,
  }));
}

/** All playable CAGED voicings for a triad, in canonical CAGED order. */
export function voicingsFor(root: number, quality: TriadQuality): Voicing[] {
  const order = quality === 'maj' ? MAJOR_SHAPE_ORDER : MINOR_SHAPE_ORDER;
  const out: Voicing[] = [];
  for (const shape of order) {
    const res = shapeAt(root, shape, quality);
    if (!res) continue;
    out.push({
      root,
      quality,
      shape,
      baseFret: res.baseFret,
      notes: assignFingers(res.baseFret, res.notes),
    });
  }
  return out;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/core/voicings.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Run full suite + build**

Run: `npm test`
Expected: PASS (existing + caged + voicings).
Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/core/voicings.ts src/core/voicings.test.ts
git commit -m "feat(core): add voicingsFor and finger assignment (Voicing type)"
```

---

## Self-Review

**Spec coverage (Phase 2a scope):**
- Fingered, playable voicings anchored to CAGED positions → `voicingsFor` produces one `Voicing` per shape with per-note fingers (Task 3). ✓
- CAGED shapes (C,A,G,E,D) → `caged.ts` shape data + `shapeAt`, movable to any root (Task 2). ✓
- The `Voicing` type from the design spec → defined in `voicings.ts` (Task 3), name freed by renaming Phase-1 filter to `VoicingStyle` (Task 1). ✓
- Correctness anchored to reality → tests assert each shape reproduces the canonical open chord and barre chords (Task 2), and that every voiced note is a real chord tone within a 4-fret span (Task 3). ✓
- Deferred (later plans): 7th chords/extensions, `ChordChart.tsx` chord-chart picker, big-neck voicing rendering, ghost overlay, store wiring, position selection. Noted in Global Constraints.

**Placeholder scan:** No TBD/TODO; every code step has complete code; every run step has an exact command + expected result.

**Type consistency:** `CagedShape`, `TriadQuality`, `ShapeNote` defined in `caged.ts` (Task 2) and imported by `voicings.ts` (Task 3). `VoicedNote extends ShapeNote`; `Voicing.notes: VoicedNote[]`. `shapeAt` returns `{ baseFret, notes: ShapeNote[] } | null`; `assignFingers(baseFret, notes: ShapeNote[]): VoicedNote[]` consumes exactly that. `VoicingStyle` (Task 1) is distinct from `Voicing` (Task 3) — no remaining collision.
