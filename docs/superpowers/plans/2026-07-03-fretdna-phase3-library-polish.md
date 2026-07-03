# FretDNA Phase 3 — Library Polish + Triads-in-Position Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the DNA library (text + concept tagging + more Frusciante content) and add a literal "diatonic triads inside the current CAGED position" fretboard visualization.

**Architecture:** Content lives in `src/content/progressions.ts` (pure data). A new `concept` field on `Progression` drives a second filter chip row in `src/ui/Progressions.tsx`. Triads-in-position adds one pure helper in `src/core/diatonic.ts`, two persisted store fields, a toggle on the `DiatonicTriads` panel, and a render branch in `Fretboard.tsx`. Pure `core/` stays UI-free; `ui/` imports `core/` + store only.

**Tech Stack:** Vite + React 18 + TypeScript (strict) + Zustand (persist) + Vitest + Testing Library.

## Global Constraints

- `npm test` AND `npm run build` must both pass before every commit. Vitest (esbuild) does NOT enforce `noUnusedLocals`/`noUnusedParameters`; only `tsc -b` (via `npm run build`) does. An unused import passes tests but breaks the build.
- `core/` must never import from `ui/`. `ui/` imports `core/` + store only.
- Chord qualities must be existing keys in `QTYPES` (`src/core/chords.ts`): `maj, min, maj7, m7, dom7, maj9, m9, dom9, s9, add9, sus2, sus4, m7b5, dim7, dim, aug`.
- Interval colors come from `ICOLORS` (`src/core/theory.ts`), keyed by semitone-from-root: root=0, 3rd=3/4, 5th=6/7/8, etc.
- After code changes, run `graphify update .` (AST-only, no API cost).
- Dev server: `npm run dev` (port 5173). Owner runs bypassPermissions; execute directly in the main thread.

---

### Task 1: Add `concept` field and tag every progression

**Files:**
- Modify: `src/core/types.ts` (add `concept` to `Progression`)
- Modify: `src/content/progressions.ts` (add `CONCEPTS`, tag all 40 entries)
- Test: `src/content/progressions.test.ts`

**Interfaces:**
- Produces: `Progression.concept: string`; `export const CONCEPTS: string[]` (first element `'All'`).

- [ ] **Step 1: Write the failing test**

Add to `src/content/progressions.test.ts` (import `CONCEPTS` in the existing import line: `import { chord, FEATURED, LIBRARY, STYLES, CONCEPTS } from './progressions';`):

```ts
it('every progression has a concept from CONCEPTS (never "All")', () => {
  const all = [...FEATURED, ...LIBRARY];
  const valid = new Set(CONCEPTS.filter((c) => c !== 'All'));
  for (const p of all) {
    expect(valid.has(p.concept), `${p.id} has invalid concept "${p.concept}"`).toBe(true);
  }
});

it('CONCEPTS lists every concept used', () => {
  const used = new Set([...FEATURED, ...LIBRARY].map((p) => p.concept));
  for (const c of used) expect(CONCEPTS).toContain(c);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progressions`
Expected: FAIL — `CONCEPTS` is undefined / not exported.

- [ ] **Step 3: Add the field to the type**

In `src/core/types.ts`, change the `Progression` interface:

```ts
export interface Progression {
  id: string;
  title: string;
  style: string;
  concept: string;
  chords: Chord[];
  dna: string | null;
}
```

- [ ] **Step 4: Add CONCEPTS and tag every entry**

In `src/content/progressions.ts`, add at the bottom near `STYLES`:

```ts
export const CONCEPTS = [
  'All', 'Shared tones', 'Borrowed chords', 'ii–V family', 'Modal vamp',
  'Blues', 'Pop loop', 'Suspensions & add9', 'Chromatic moves',
];
```

Then add `concept: '<value>'` to every entry object using this exact mapping (add the property right after `style`):

FEATURED:
`f1`→`Shared tones`, `f2`→`Shared tones`, `f3`→`Chromatic moves`, `f4`→`ii–V family`, `f5`→`Borrowed chords`, `f6`→`Modal vamp`, `f7`→`Suspensions & add9`, `f8`→`ii–V family`, `f9`→`ii–V family`, `f10`→`ii–V family`, `f11`→`Borrowed chords`, `f12`→`ii–V family`, `f13`→`Pop loop`, `f14`→`Chromatic moves`, `f15`→`Modal vamp`, `f16`→`Borrowed chords`, `f17`→`Suspensions & add9`, `f18`→`Borrowed chords`, `f19`→`Chromatic moves`, `f20`→`Borrowed chords`, `jf1`→`Shared tones`, `jf2`→`Borrowed chords`, `jf3`→`Pop loop`, `jf4`→`Suspensions & add9`, `jf5`→`Modal vamp`, `srv1`→`Blues`, `srv2`→`Blues`, `vulf1`→`Pop loop`, `vulf2`→`Modal vamp`

LIBRARY:
`l1`→`Modal vamp`, `l2`→`ii–V family`, `l3`→`Modal vamp`, `l4`→`Borrowed chords`, `l5`→`Pop loop`, `l6`→`ii–V family`, `l7`→`Borrowed chords`, `l8`→`Modal vamp`, `l9`→`Shared tones`, `l10`→`Modal vamp`, `l11`→`Modal vamp`, `l12`→`ii–V family`, `l13`→`Blues`, `l14`→`Borrowed chords`, `l15`→`Modal vamp`, `l16`→`Pop loop`, `l17`→`Chromatic moves`, `l18`→`Pop loop`, `l19`→`Blues`, `l20`→`Pop loop`

Example (f1 after edit):

```ts
{ id: 'f1', title: 'Neo-Soul I→IV Float', style: 'Neo-Soul', concept: 'Shared tones', chords: [c('C','maj9'), c('F','maj9')],
  dna: 'The E (3rd of C) becomes the maj7 of F. Same note, two identities — that shared tone is what makes this progression float.' },
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- progressions`
Expected: PASS (all progressions content tests).

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: clean (no unused/type errors).

- [ ] **Step 7: Commit**

```bash
git add src/core/types.ts src/content/progressions.ts src/content/progressions.test.ts
git commit -m "feat(content): tag every progression with a harmonic concept"
```

---

### Task 2: Write DNA text for the 20 LIBRARY entries

**Files:**
- Modify: `src/content/progressions.ts` (`LIBRARY` entries `l1`–`l20`)
- Test: `src/content/progressions.test.ts`

**Interfaces:**
- Consumes: `Progression.dna` (unchanged type `string | null`).

- [ ] **Step 1: Write the failing test**

Add to `src/content/progressions.test.ts`:

```ts
it('every shipped progression has non-empty DNA text', () => {
  const all = [...FEATURED, ...LIBRARY];
  for (const p of all) {
    expect(typeof p.dna, `${p.id} dna missing`).toBe('string');
    expect((p.dna ?? '').trim().length, `${p.id} dna empty`).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progressions`
Expected: FAIL — the `l1`–`l20` entries have `dna: null`.

- [ ] **Step 3: Replace each `dna: null` with real text**

In `src/content/progressions.ts`, set the `dna` of each LIBRARY entry to exactly:

- `l1`: `'I7→IV7 in A, both dominant. Staying on 7th chords keeps it bluesy and unresolved — the vamp lives in the groove, not the harmony.'`
- `l2`: `'The minor ii–V–i. The b5 in Bm7b5 and the E7\'s raised 3rd (G#) both pull hard toward Am — two leading tones squeezing home.'`
- `l3`: `'A ii–V that refuses to resolve, looping in D dorian. The G7\'s B natural is the dorian giveaway — a raised 6th that keeps it bright, not sad.'`
- `l4`: `'The bVII (G) is borrowed from A mixolydian. That flat-7 chord is the whole rock-and-roll sound — brightness without leaving home.'`
- `l5`: `'The four-chord anthem. The vi (Bm) is the emotional dip; landing on IV instead of I keeps every cycle wanting more.'`
- `l6`: `'A stepwise descent (IV–iii–ii–V in C) voiced as shells — just root, 3rd, 7th. The 3rds and 7ths glide down by half-steps while the ear fills in the rest.'`
- `l7`: `'i→bII→bIII in E. The F is a Neapolitan-flavored half-step above the tonic — a dark, cinematic lift Frusciante loves under a droning top string.'`
- `l8`: `'I9→IV9 funk. The 9th chords are almost incidental — the point is the scratched, muted 16ths. Harmony as percussion.'`
- `l9`: `'Parallel 9th chords sliding by 4ths. No functional pull — the shared 9th color on each makes them feel like one sound moving, not three chords.'`
- `l10`: `'The E major (II) against a D tonic raises the 4th to G# — pure lydian shimmer. It floats up and settles back without ever needing a V.'`
- `l11`: `'The bII (F) sitting on a dominant E gives the Spanish, phrygian-dominant color. That half-step above the root is the whole flavor.'`
- `l12`: `'A ii–V–I in Bb, dressed in 9ths. The Cm9 melts into F9 by shared tones, and the maj9 landing is soft, never a hard resolution.'`
- `l13`: `'The blues skeleton. Every chord a dominant 7th — theory says that shouldn\'t work, but the b7 in each is exactly what makes it the blues.'`
- `l14`: `'i→IV→V in D# minor, but the major IV and V drive it like a gospel-funk engine. Relentless, rising, never resting.'`
- `l15`: `'A jazz-funk ii–V vamp in F that stays home in G dorian. The C9\'s E natural keeps it bright; the loop is a launchpad for soloing.'`
- `l16`: `'The sensitive-song loop. Starting on vi (Am) gives it the melancholy; the I–V tail keeps pulling it back around.'`
- `l17`: `'The C#dim7 is a chromatic passing chord bridging I to ii. Its notes are a rootless A7b9 — a secondary dominant in disguise, walking the bass up by half-step.'`
- `l18`: `'I–IV–V, the three chords that built rock and reggae. Nothing borrowed, nothing extended — all the character comes from where you put the beat.'`
- `l19`: `'The 12-bar in E, the guitar\'s home blues key. Open-string dominant chords ring against the pentatonic — the reason every guitarist starts here.'`
- `l20`: `'I–V–ii–IV in G. The ii (Am7) softens the turn and the walking bass underneath ties the four chords into one gentle stroll.'`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- progressions`
Expected: PASS.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/content/progressions.ts src/content/progressions.test.ts
git commit -m "feat(content): write DNA text for all library progressions"
```

---

### Task 3: Concept filter chip row in the Progressions panel

**Files:**
- Modify: `src/ui/Progressions.tsx`
- Test: `src/ui/Progressions.test.tsx` (create if absent)

**Interfaces:**
- Consumes: `CONCEPTS` from `src/content/progressions.ts`; `Progression.concept`.

- [ ] **Step 1: Write the failing test**

Create/append `src/ui/Progressions.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Progressions from './Progressions';

describe('Progressions concept filter', () => {
  beforeEach(() => cleanup());

  it('renders a concept chip row', () => {
    render(<Progressions />);
    const chips = screen.getAllByTestId('concept-chip');
    expect(chips.length).toBeGreaterThan(1);
    expect(chips.some((c) => c.textContent === 'All')).toBe(true);
  });

  it('style and concept filters combine (AND) to narrow the list', () => {
    render(<Progressions />);
    const all = screen.getAllByTestId('prog-chip').length;
    fireEvent.click(screen.getByRole('button', { name: 'Blues' }));
    const blues = screen.getAllByTestId('prog-chip').length;
    expect(blues).toBeLessThan(all);
    expect(blues).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Progressions`
Expected: FAIL — no `concept-chip` testid rendered.

- [ ] **Step 3: Implement the concept row**

In `src/ui/Progressions.tsx`:

1. Extend the import: `import { FEATURED, LIBRARY, STYLES, CONCEPTS } from '../content/progressions';`
2. Add concept state next to style state: `const [concept, setConcept] = useState('All');`
3. Change the `shown` filter to AND both dimensions:

```tsx
const shown = ALL.filter(
  (p) => (style === 'All' || p.style === style) && (concept === 'All' || p.concept === concept),
);
```

4. Add a concept chip row directly after the closing `</div>` of `#prog-styles`:

```tsx
<div id="prog-concepts">
  {CONCEPTS.map((cn) => (
    <button
      key={cn}
      data-testid="concept-chip"
      className={`spill${cn === concept ? ' on' : ''}`}
      onClick={() => setConcept(cn)}
    >
      {cn}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Progressions`
Expected: PASS.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/Progressions.tsx src/ui/Progressions.test.tsx
git commit -m "feat(ui): filter progressions by harmonic concept"
```

---

### Task 4: Five new Frusciante/RHCP progressions

**Files:**
- Modify: `src/content/progressions.ts` (append to `FEATURED`)

**Interfaces:**
- Consumes: `chord()` alias `c`; `Progression` shape (needs `concept` + `dna` from Tasks 1–2).

- [ ] **Step 1: Confirm existing content tests still constrain new entries**

The Task 1 concept test, Task 2 DNA test, and the existing "every chord references a real quality" test already cover new entries. No new test file needed; run them after adding.

- [ ] **Step 2: Append the five entries**

In `src/content/progressions.ts`, inside the `FEATURED` array, after the `vulf2` entry (before the closing `];`), add:

```ts
  // ── More Frusciante / RHCP devices ──
  { id: 'jf6', title: 'Snow (Hey Oh) Cycle', style: 'Frusciante', concept: 'Pop loop', chords: [c('C#','min'), c('A','maj'), c('E','maj'), c('B','maj')],
    dna: 'vi→IV→I→V in E, but played as a fast fingerpicked arpeggio cycle. The high E and B strings ring open through every chord, so a single pedal tone floats over the whole spinning figure.' },
  { id: 'jf7', title: "Can't Stop Vamp", style: 'Frusciante', concept: 'Modal vamp', chords: [c('E','min'), c('D','maj')],
    dna: 'i→bVII in E minor, but the harmony barely matters — it is all muted 16th-note stabs. Frusciante turns two chords into a rhythm part, harmony used as percussion.' },
  { id: 'jf8', title: 'Scar Tissue Sixths', style: 'Frusciante', concept: 'Shared tones', chords: [c('F','maj'), c('C','maj')],
    dna: 'I→V in F, outlined not by strumming but by sliding 6ths — two-note shapes on non-adjacent strings. Each double-stop is the 3rd and root of the chord, so the harmony is implied by just two voices.' },
  { id: 'jf9', title: 'Soul to Squeeze Loop', style: 'Frusciante', concept: 'Pop loop', chords: [c('E','maj'), c('C#','min'), c('A','maj'), c('B','maj')],
    dna: 'I→vi→IV→V in E, the classic doo-wop turnaround slowed to a lazy sway. The vi (C#m) is the wistful pivot; the top voice barely moves while the bass does the walking.' },
  { id: 'jf10', title: 'Frusciante Inversion Walk', style: 'Frusciante', concept: 'Shared tones', chords: [c('C','maj'), c('G','maj'), c('A','min'), c('F','maj')],
    dna: 'I–V–vi–IV, but the device is in the bass: play the G as G/B and the F as F/A so the bassline steps C–B–A–A instead of leaping. First-inversion slash chords turn block triads into a descending melodic bass.' },
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm test -- progressions`
Expected: PASS (quality, concept, and DNA tests all cover the five new entries).

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/content/progressions.ts
git commit -m "feat(content): decode five more Frusciante/RHCP progressions"
```

---

### Task 5: `triadTonesInWindow` core helper

**Files:**
- Modify: `src/core/diatonic.ts`
- Test: `src/core/diatonic.test.ts` (create if absent)

**Interfaces:**
- Consumes: `diatonicTriads(root, quality)` (existing), `getScaleDots`/`scaleFor` from `./scales`, `semitoneFrom` from `./theory`.
- Produces:
  - `interface TriadWindowDot { s: number; f: number; note: number; inTriad: boolean; triadSemi: number; }`
  - `triadTonesInWindow(keyRoot: number, quality: string, degree: number, loFret: number, hiFret: number): TriadWindowDot[]`

- [ ] **Step 1: Write the failing test**

Create `src/core/diatonic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { triadTonesInWindow } from './diatonic';

describe('triadTonesInWindow', () => {
  // Key C major (root 0, quality 'maj'). Degree 0 = C major triad {C,E,G} = pcs {0,4,7}.
  it('flags the selected triad tones inside the window', () => {
    const dots = triadTonesInWindow(0, 'maj', 0, 0, 3);
    expect(dots.length).toBeGreaterThan(0);
    const triadPcs = new Set(dots.filter((d) => d.inTriad).map((d) => d.note));
    expect([...triadPcs].sort((a, b) => a - b)).toEqual([0, 4, 7]);
  });

  it('restricts dots to the fret window', () => {
    const dots = triadTonesInWindow(0, 'maj', 0, 5, 8);
    expect(dots.every((d) => d.f >= 5 && d.f <= 8)).toBe(true);
  });

  it('colors triad tones by interval from the triad root', () => {
    // Degree 1 in C major = D minor {D,F,A} = pcs {2,5,9}; triad root D=2.
    const dots = triadTonesInWindow(0, 'maj', 1, 0, 12).filter((d) => d.inTriad);
    const byNote = new Map(dots.map((d) => [d.note, d.triadSemi]));
    expect(byNote.get(2)).toBe(0); // root
    expect(byNote.get(5)).toBe(3); // minor 3rd
    expect(byNote.get(9)).toBe(7); // 5th
  });

  it('returns [] when the quality has no parent scale', () => {
    expect(triadTonesInWindow(0, 'dim7', 0, 0, 5)).toEqual([]);
  });

  it('returns [] for an out-of-range degree', () => {
    expect(triadTonesInWindow(0, 'maj', 9, 0, 5)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- diatonic`
Expected: FAIL — `triadTonesInWindow` is not exported.

- [ ] **Step 3: Implement the helper**

In `src/core/diatonic.ts`, update the imports and append the helper:

```ts
import { NOTES, semitoneFrom } from './theory';
import { MAJOR_SCALE, scaleFor, getScaleDots } from './scales';
```

(Keep the existing `diatonicTriads` code. Note `semitoneFrom` is added to the `./theory` import.)

Append:

```ts
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
```

Note: `MAJOR_SCALE` and `NOTES` remain used by the existing `diatonicTriads` code above — do not remove them from the import.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- diatonic`
Expected: PASS (5 tests).

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/core/diatonic.ts src/core/diatonic.test.ts
git commit -m "feat(core): triadTonesInWindow - diatonic triad tones inside a fret window"
```

---

### Task 6: Store fields for triads-in-position

**Files:**
- Modify: `src/ui/store.ts`
- Test: `src/ui/store.test.ts`

**Interfaces:**
- Produces store fields: `triadsInBox: boolean` (default `false`), `triadDegree: number | null` (default `null`), setters `setTriadsInBox(b)`, `setTriadDegree(n)`.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/store.test.ts`:

```ts
it('triads-in-position defaults and setters', () => {
  const s = useStore.getState();
  expect(s.triadsInBox).toBe(false);
  expect(s.triadDegree).toBe(null);
  s.setTriadsInBox(true);
  s.setTriadDegree(2);
  expect(useStore.getState().triadsInBox).toBe(true);
  expect(useStore.getState().triadDegree).toBe(2);
  useStore.getState().setTriadDegree(null);
  expect(useStore.getState().triadDegree).toBe(null);
});
```

(If `store.test.ts` does not import `useStore`, add `import { useStore } from './store';` at the top.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- store`
Expected: FAIL — `triadsInBox` undefined / `setTriadsInBox` not a function.

- [ ] **Step 3: Add fields, defaults, and setters**

In `src/ui/store.ts`:

1. In the `AppState` interface, after `showScale: boolean;` add:

```ts
  triadsInBox: boolean;
  triadDegree: number | null;
```

2. In the setter list, after `setShowScale: (b: boolean) => void;` add:

```ts
  setTriadsInBox: (b: boolean) => void;
  setTriadDegree: (n: number | null) => void;
```

3. In the state object, after `showScale: false,` add:

```ts
  triadsInBox: false,
  triadDegree: null,
```

4. After `setShowScale: (showScale) => set({ showScale }),` add:

```ts
  setTriadsInBox: (triadsInBox) => set({ triadsInBox }),
  setTriadDegree: (triadDegree) => set({ triadDegree }),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- store`
Expected: PASS.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/store.ts src/ui/store.test.ts
git commit -m "feat(ui): store state for triads-in-position toggle and degree"
```

---

### Task 7: "In position" toggle on the DiatonicTriads panel

**Files:**
- Modify: `src/ui/panels/DiatonicTriads.tsx`
- Test: `src/ui/panels/DiatonicTriads.test.tsx` (create if absent)

**Interfaces:**
- Consumes: store `triadsInBox`, `triadDegree`, `setTriadsInBox`, `setTriadDegree` (Task 6); `diatonicTriads`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/panels/DiatonicTriads.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DiatonicTriads from './DiatonicTriads';
import { useStore } from '../store';

describe('DiatonicTriads in-position toggle', () => {
  beforeEach(() => {
    cleanup();
    // Ensure a key with a parent scale so the panel renders.
    useStore.setState({ root: 0, quality: 'maj', triadsInBox: false, triadDegree: null });
  });

  it('renders an in-position toggle', () => {
    render(<DiatonicTriads />);
    expect(screen.getByTestId('triads-in-box-toggle')).toBeTruthy();
  });

  it('with the toggle on, clicking a degree sets triadDegree and leaves root/quality alone', () => {
    useStore.setState({ triadsInBox: true });
    render(<DiatonicTriads />);
    const before = useStore.getState().root;
    fireEvent.click(screen.getAllByTestId('triad-btn')[1]); // 2nd degree
    expect(useStore.getState().triadDegree).toBe(1);
    expect(useStore.getState().root).toBe(before); // board did not jump
  });

  it('with the toggle off, clicking a degree jumps the board (root changes)', () => {
    render(<DiatonicTriads />);
    fireEvent.click(screen.getAllByTestId('triad-btn')[1]); // ii = D minor, root 2
    expect(useStore.getState().root).toBe(2);
    expect(useStore.getState().triadDegree).toBe(null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- DiatonicTriads`
Expected: FAIL — no `triads-in-box-toggle`, click still jumps the board in on-mode.

- [ ] **Step 3: Implement the toggle and dual-mode click**

Replace the contents of `src/ui/panels/DiatonicTriads.tsx` with:

```tsx
import { useStore } from '../store';
import { diatonicTriads } from '../../core/diatonic';

export default function DiatonicTriads() {
  const { root, quality, setRoot, setQuality, triadsInBox, triadDegree, setTriadsInBox, setTriadDegree } = useStore();
  const triads = diatonicTriads(root, quality);
  if (!triads.length) return null;

  return (
    <div className="sec">
      <div className="sec-label">
        Diatonic triads
        <button
          data-testid="triads-in-box-toggle"
          className={`mini-toggle${triadsInBox ? ' on' : ''}`}
          onClick={() => { setTriadsInBox(!triadsInBox); setTriadDegree(null); }}
        >
          in position
        </button>
      </div>
      <div id="tri-wrap">
        {triads.map((t, i) => {
          const on = triadsInBox ? i === triadDegree : t.root === root && t.quality === quality;
          return (
            <button
              key={t.roman}
              data-testid="triad-btn"
              className={`fbtn${on ? ' on' : ''}`}
              onClick={() => {
                if (triadsInBox) {
                  setTriadDegree(i === triadDegree ? null : i);
                } else {
                  setRoot(t.root);
                  setQuality(t.quality);
                }
              }}
            >
              <span style={{ opacity: 0.55, marginRight: 8, fontFamily: 'JetBrains Mono, monospace' }}>{t.roman}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add minimal styling for the toggle**

In the stylesheet that defines `.sec-label` / `.fbtn` (search `src/` for `.sec-label` — likely `src/index.css` or `src/App.css`), add:

```css
.mini-toggle {
  margin-left: 10px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: transparent;
  opacity: 0.6;
  cursor: pointer;
}
.mini-toggle.on { opacity: 1; background: rgba(224,72,8,0.12); }
```

(Match the file's existing color conventions; if a `.spill.on` rule exists, mirror its accent.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- DiatonicTriads`
Expected: PASS (3 tests).

- [ ] **Step 6: Build + commit**

```bash
npm run build
git add src/ui/panels/DiatonicTriads.tsx src/index.css
git commit -m "feat(ui): in-position toggle for diatonic triads picker"
```

(Adjust the CSS path in `git add` to whichever file you edited.)

---

### Task 8: Render triads-in-position on the fretboard

**Files:**
- Modify: `src/ui/Fretboard.tsx`
- Test: `src/ui/Fretboard.test.tsx`

**Interfaces:**
- Consumes: store `triadsInBox`, `triadDegree`; `triadTonesInWindow` + `TriadWindowDot` (Task 5); `voicingSpan` (existing).

- [ ] **Step 1: Write the failing test**

Add to `src/ui/Fretboard.test.tsx` (import `useStore` if not already imported):

```tsx
it('renders triad-in-position dots when the mode is active with a selected voicing', () => {
  useStore.setState({
    root: 0, quality: 'maj', mode: 'shapes', voicingView: true,
    triadsInBox: true, triadDegree: 0,
  });
  render(<Fretboard />);
  expect(screen.getAllByTestId('triad-box-dot').length).toBeGreaterThan(0);
});

it('does not render triad-in-position dots when triadDegree is null', () => {
  useStore.setState({
    root: 0, quality: 'maj', mode: 'shapes', voicingView: true,
    triadsInBox: true, triadDegree: null,
  });
  render(<Fretboard />);
  expect(screen.queryByTestId('triad-box-dot')).toBe(null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Fretboard`
Expected: FAIL — no `triad-box-dot` testid.

- [ ] **Step 3: Wire the store + compute the overlay**

In `src/ui/Fretboard.tsx`:

1. Add to the imports:

```tsx
import { triadTonesInWindow } from '../core/diatonic';
```

2. Add `triadsInBox, triadDegree` to the destructured `useStore()` call.

3. After the `scaleDots` line, compute the triad overlay (only when a voicing is selected and the mode is active):

```tsx
const triadBox =
  selected && triadsInBox && triadDegree != null
    ? triadTonesInWindow(root, quality, triadDegree, voicingSpan(selected).minFret, voicingSpan(selected).maxFret)
    : [];
```

- [ ] **Step 4: Render the overlay branch**

In `src/ui/Fretboard.tsx`, in the `selected ? ( ... )` branch, wrap so the triad overlay replaces the ghost+fingered-voicing dots when active. Change the opening of the selected branch from:

```tsx
{selected ? (
  <>
    {showBox && boxList.map((b) => (
```

Keep the `showBox && boxList.map(...)` box rendering. Then, immediately after the box `))}` block and BEFORE the `{showGhost && allDots.map(...)}` line, insert:

```tsx
{triadBox.length ? (
  triadBox.map(({ s, f, note, inTriad, triadSemi }) => {
    const cx = fcx(f), cy = sy(s);
    const color = inTriad ? (ICOLORS[triadSemi] ?? '#888') : (theme === 'night' ? '#48597C' : '#B4AB96');
    const r = inTriad ? (triadSemi === 0 ? ROOT_R : DOT_R) : 9;
    return (
      <g key={`tb${s}-${f}`} data-testid="triad-box-dot" transform={`translate(${cx},${cy})`}>
        <g className="nd">
          {inTriad && triadSemi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
          <circle cx={0} cy={0} r={r} fill={color} opacity={inTriad ? 0.95 : 0.5} />
          <text x={0} y={4} textAnchor="middle" fontSize={inTriad ? 11 : 8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={inTriad ? 600 : 500}>
            {showLabels ? (triadSemi === 0 ? 'R' : triadSemi === 3 || triadSemi === 4 ? '3' : '5') : NOTES[note]}
          </text>
        </g>
      </g>
    );
  })
) : null}
```

Then guard the existing ghost + fingered-voicing rendering so they hide when the triad overlay is active. Change:

```tsx
{showGhost && allDots.map(({ s, f, semi }) => (
```

to:

```tsx
{!triadBox.length && showGhost && allDots.map(({ s, f, semi }) => (
```

and change the fingered-voicing map from:

```tsx
{selected.notes.map(({ string, fret, semi, finger }) => {
```

to:

```tsx
{!triadBox.length && selected.notes.map(({ string, fret, semi, finger }) => {
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Fretboard`
Expected: PASS (both new tests + existing Fretboard tests).

- [ ] **Step 6: Full test + build**

Run: `npm test`
Expected: all suites PASS.
Run: `npm run build`
Expected: clean.

- [ ] **Step 7: Verify live**

Start the dev server (`npm run dev`, port 5173). In the browser: set a maj/min chord, turn on Voicings (so a CAGED box appears), open Diatonic triads, click "in position", click a degree. Confirm the selected triad's tones light up inside the box with the rest of the scale dimmed, and the board root does not jump. Screenshot to confirm.

- [ ] **Step 8: Update graph + commit**

```bash
graphify update .
git add src/ui/Fretboard.tsx src/ui/Fretboard.test.tsx
git commit -m "feat(ui): draw the 7 diatonic triads inside the current CAGED position"
```

---

## Self-Review Notes

- **Spec coverage:** Part 1 (DNA) → Task 2; Part 2 (concept grouping) → Tasks 1+3; Part 3 (Frusciante) → Task 4; Part 4 (triads-in-position) → Tasks 5–8. All covered.
- **Type consistency:** `triadTonesInWindow` signature and `TriadWindowDot` fields (`s,f,note,inTriad,triadSemi`) are identical in Tasks 5 and 8. Store field names (`triadsInBox`, `triadDegree`) identical in Tasks 6, 7, 8. `CONCEPTS` used consistently in Tasks 1 and 3.
- **Ordering:** Task 1 adds the required `concept` field before Task 4 relies on it; Tasks 2/4 rely on the Task 2 DNA test only for their own entries (order 2→4 keeps the DNA test green as entries are added).
- **Edge cases:** null parent scale and out-of-range degree return `[]` (Task 5); overlay only renders with a selected voicing (Task 8 guard).
