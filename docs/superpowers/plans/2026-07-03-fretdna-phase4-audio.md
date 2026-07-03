# FretDNA Phase 4 — Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the fretboard audible — click a note to play it, strum the current chord/voicing, sound diatonic-triad chips, and auto-play progressions — using a zero-dependency Karplus-Strong plucked string.

**Architecture:** Pure DSP + pitch math live in `core/audio.ts` (fully unit-tested, no Web Audio). A thin browser-only `ui/sound.ts` owns the `AudioContext` lifecycle and scheduling and is mocked in component tests. UI components call `ui/sound.ts` from click handlers.

**Tech Stack:** Vite + React 18 + TypeScript (strict) + Zustand (persist) + Vitest + Testing Library. Web Audio API (native). No new npm dependencies.

## Global Constraints

- `npm test` AND `npm run build` must both pass before every commit. Vitest (esbuild) does NOT enforce `noUnusedLocals`/`noUnusedParameters`; only `tsc -b` (via `npm run build`) does. An unused import passes tests but breaks the build.
- **No new dependencies.** Do not add `tone` or any package. Use the native Web Audio API.
- `core/` must never import from `ui/`. `ui/` imports `core/` + store only. `ui/sound.ts` may import `core/audio` only.
- Chord qualities are keys in `QTYPES` (`src/core/chords.ts`). `getChordIntervals(quality, voicing='standard')` returns semitone intervals (empty for unknown quality).
- Interval colors: `ICOLORS` (`src/core/theory.ts`). Open-string MIDI: `STRING_MIDI = [64,59,55,50,45,40]` (index 0..5 = high-e..low-E).
- After code changes, run `graphify update .` (AST-only, no API cost).
- Dev server: `npm run dev` (port 5173). Owner runs bypassPermissions; execute directly in the main thread.

---

### Task 1: `core/audio.ts` — pure pitch math + Karplus-Strong DSP

**Files:**
- Create: `src/core/audio.ts`
- Test: `src/core/audio.test.ts`

**Interfaces:**
- Produces:
  - `STRING_MIDI: number[]`
  - `midiToFreq(midi: number): number`
  - `stringFretToFreq(string: number, fret: number): number`
  - `chordFreqs(rootPc: number, quality: string): number[]`
  - `renderKarplusStrong(freq: number, seconds: number, sampleRate: number, rng: () => number): Float32Array`

- [ ] **Step 1: Write the failing test**

Create `src/core/audio.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  midiToFreq, stringFretToFreq, chordFreqs, renderKarplusStrong,
} from './audio';

const seededRng = () => {
  let s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

describe('pitch math', () => {
  it('midiToFreq: A4 (MIDI 69) is 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
  });

  it('stringFretToFreq: open strings match standard tuning', () => {
    expect(stringFretToFreq(5, 0)).toBeCloseTo(82.41, 1);  // low E (E2)
    expect(stringFretToFreq(0, 0)).toBeCloseTo(329.63, 1); // high e (E4)
    expect(stringFretToFreq(4, 12)).toBeCloseTo(220.0, 1); // A string, 12th fret = A3
  });

  it('chordFreqs: C major triad gives three ascending freqs', () => {
    const f = chordFreqs(0, 'maj');
    expect(f).toHaveLength(3);
    expect(f[0]).toBeLessThan(f[1]);
    expect(f[1]).toBeLessThan(f[2]);
  });

  it('chordFreqs: unknown quality returns []', () => {
    expect(chordFreqs(0, 'bogus')).toEqual([]);
  });
});

describe('renderKarplusStrong', () => {
  it('returns round(seconds*sampleRate) samples', () => {
    const buf = renderKarplusStrong(220, 0.5, 44100, seededRng());
    expect(buf.length).toBe(Math.round(0.5 * 44100));
  });

  it('produces a non-silent, decaying signal', () => {
    const buf = renderKarplusStrong(220, 1, 44100, seededRng());
    const meanAbs = (a: Float32Array, start: number, n: number) => {
      let sum = 0;
      for (let i = start; i < start + n; i++) sum += Math.abs(a[i]);
      return sum / n;
    };
    const early = meanAbs(buf, 0, 200);
    const late = meanAbs(buf, buf.length - 200, 200);
    expect(early).toBeGreaterThan(0.01);   // non-silent
    expect(late).toBeLessThan(early);      // decays over time
  });

  it('clamps the ring buffer to at least 2 samples for very high freqs', () => {
    // freq == sampleRate would give N=1; must not crash or divide oddly.
    const buf = renderKarplusStrong(44100, 0.01, 44100, seededRng());
    expect(buf.length).toBe(Math.round(0.01 * 44100));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- core/audio`
Expected: FAIL — module `./audio` does not exist.

- [ ] **Step 3: Implement `core/audio.ts`**

Create `src/core/audio.ts`:

```ts
import { getChordIntervals } from './chords';

/** MIDI note of each open string, index 0..5 = high-e .. low-E (E4 B3 G3 D3 A2 E2). */
export const STRING_MIDI = [64, 59, 55, 50, 45, 40];

/** Equal-tempered frequency of a MIDI note (A4 = MIDI 69 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Frequency of a fretted note. string 0..5 (high-e..low-E), fret >= 0. */
export function stringFretToFreq(string: number, fret: number): number {
  return midiToFreq(STRING_MIDI[string] + fret);
}

/**
 * Ascending frequencies for a chord's tones in a comfortable low register.
 * Root sits near C3 (MIDI 48 + rootPc); the chord's intervals stack above it.
 * Empty for an unknown quality.
 */
export function chordFreqs(rootPc: number, quality: string): number[] {
  return getChordIntervals(quality).map((semi) => midiToFreq(48 + rootPc + semi));
}

/**
 * Karplus-Strong plucked string as a pure function. Seeds a ring buffer of
 * length round(sampleRate/freq) with noise from rng(), then repeatedly averages
 * adjacent samples (a one-zero lowpass) with a decay factor, emitting one sample
 * per step. Returns round(seconds*sampleRate) samples in roughly [-1, 1].
 */
export function renderKarplusStrong(
  freq: number,
  seconds: number,
  sampleRate: number,
  rng: () => number,
): Float32Array {
  const N = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = rng() * 2 - 1;

  const out = new Float32Array(Math.round(seconds * sampleRate));
  const decay = 0.996;
  let idx = 0;
  for (let i = 0; i < out.length; i++) {
    const cur = ring[idx];
    const nxt = (idx + 1) % N;
    ring[idx] = decay * 0.5 * (cur + ring[nxt]);
    out[i] = cur;
    idx = nxt;
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- core/audio`
Expected: PASS (7 tests).

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/core/audio.ts src/core/audio.test.ts
git commit -m "feat(core): pure pitch math + Karplus-Strong plucked-string DSP"
```

---

### Task 2: `ui/sound.ts` — Web Audio engine

**Files:**
- Create: `src/ui/sound.ts`
- Test: `src/ui/sound.test.ts`

**Interfaces:**
- Consumes: `renderKarplusStrong`, `stringFretToFreq` from `../core/audio`.
- Produces:
  - `pluck(freq: number, whenOffset?: number, gain?: number): void`
  - `strum(freqs: number[], stagger?: number): void`
  - `playNote(string: number, fret: number): void`

- [ ] **Step 1: Write the failing test**

Create `src/ui/sound.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pluck, strum, playNote } from './sound';

const starts: number[] = [];

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  resume = vi.fn();
  createBuffer(_ch: number, len: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  createBufferSource() {
    return { buffer: null, connect() {}, start: (t: number) => starts.push(t) };
  }
  createGain() {
    return { gain: { value: 0 }, connect() {} };
  }
}

describe('ui/sound with no AudioContext', () => {
  beforeEach(() => {
    starts.length = 0;
    delete (globalThis as any).AudioContext;
    delete (globalThis as any).webkitAudioContext;
  });

  it('no-ops safely when Web Audio is unavailable', () => {
    expect(() => pluck(220)).not.toThrow();
    expect(() => strum([220, 330])).not.toThrow();
    expect(() => playNote(0, 0)).not.toThrow();
    expect(starts).toHaveLength(0);
  });
});

describe('ui/sound with a mock AudioContext', () => {
  beforeEach(() => {
    starts.length = 0;
    (globalThis as any).AudioContext = MockAudioContext;
  });
  afterEach(() => {
    delete (globalThis as any).AudioContext;
  });

  it('pluck starts one buffer source', () => {
    pluck(220);
    expect(starts).toHaveLength(1);
  });

  it('strum starts one source per frequency', () => {
    strum([110, 220, 330]);
    expect(starts).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ui/sound`
Expected: FAIL — module `./sound` does not exist.

- [ ] **Step 3: Implement `ui/sound.ts`**

Create `src/ui/sound.ts`:

```ts
import { renderKarplusStrong, stringFretToFreq } from '../core/audio';

const PLUCK_SECONDS = 1.6;

let ctx: AudioContext | null = null;

/** Lazily create/resume a shared AudioContext. Returns null if Web Audio is unavailable. */
function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    (globalThis as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null; // not cached — safe to retry once Web Audio exists
  ctx = new AC();
  return ctx;
}

/** Pluck a single frequency, optionally offset in seconds, at the given gain. */
export function pluck(freq: number, whenOffset = 0, gain = 0.7): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();

  const samples = renderKarplusStrong(freq, PLUCK_SECONDS, c.sampleRate, Math.random);
  const buffer = c.createBuffer(1, samples.length, c.sampleRate);
  buffer.getChannelData(0).set(samples);

  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(c.destination);
  src.start(c.currentTime + whenOffset);
}

/** Strum a set of frequencies with a small stagger (callers pass low->high order). */
export function strum(freqs: number[], stagger = 0.022): void {
  freqs.forEach((f, i) => pluck(f, i * stagger));
}

/** Play a single fretted note. */
export function playNote(string: number, fret: number): void {
  pluck(stringFretToFreq(string, fret));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ui/sound`
Expected: PASS (3 tests).

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/sound.ts src/ui/sound.test.ts
git commit -m "feat(ui): Web Audio pluck/strum engine over the pure DSP core"
```

---

### Task 3: Store — `progFollow` + `tempo`

**Files:**
- Modify: `src/ui/store.ts`
- Test: `src/ui/store.test.ts`

**Interfaces:**
- Produces store fields: `progFollow: boolean` (default `true`), `tempo: 'slow'|'med'|'fast'` (default `'med'`), setters `setProgFollow(b)`, `setTempo(t)`.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/store.test.ts`:

```ts
it('audio playback defaults and setters', () => {
  const s = useStore.getState();
  expect(s.progFollow).toBe(true);
  expect(s.tempo).toBe('med');
  s.setProgFollow(false);
  s.setTempo('fast');
  expect(useStore.getState().progFollow).toBe(false);
  expect(useStore.getState().tempo).toBe('fast');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- store`
Expected: FAIL — `progFollow` undefined / `setTempo` not a function.

- [ ] **Step 3: Add fields, defaults, setters, and the Tempo type**

In `src/ui/store.ts`:

1. Add a type export near the top (after the imports):

```ts
export type Tempo = 'slow' | 'med' | 'fast';
```

2. In the `AppState` interface, after `triadDegree: number | null;` add:

```ts
  progFollow: boolean;
  tempo: Tempo;
```

3. In the setter list, after `setTriadDegree: (n: number | null) => void;` add:

```ts
  setProgFollow: (b: boolean) => void;
  setTempo: (t: Tempo) => void;
```

4. In the state object, after `triadDegree: null,` add:

```ts
  progFollow: true,
  tempo: 'med',
```

5. After `setTriadDegree: (triadDegree) => set({ triadDegree }),` add:

```ts
  setProgFollow: (progFollow) => set({ progFollow }),
  setTempo: (tempo) => set({ tempo }),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- store`
Expected: PASS.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/store.ts src/ui/store.test.ts
git commit -m "feat(ui): store state for progression follow-mode and tempo"
```

---

### Task 4: `useAudibleNotes` + Play button in ChordInfo

**Files:**
- Create: `src/ui/useAudibleNotes.ts`
- Modify: `src/ui/ChordInfo.tsx`
- Test: `src/ui/ChordInfo.test.tsx` (append)

**Interfaces:**
- Consumes: `chordFreqs`, `stringFretToFreq` from `../core/audio`; `voicingsFor`, `shapeQualityOf` from `../core/voicings`; `strum` from `./sound`.
- Produces: `useAudibleNotes(): number[]` — the current on-neck notes as freqs, ordered low→high.

- [ ] **Step 1: Write the failing test**

Append to `src/ui/ChordInfo.test.tsx` (add these imports at the top if missing: `import { fireEvent } from '@testing-library/react';` and `import { useStore } from './store';`). Also add the mock at module top:

```tsx
import { vi } from 'vitest';
const strumSpy = vi.fn();
vi.mock('./sound', () => ({
  strum: (...args: unknown[]) => strumSpy(...args),
  playNote: vi.fn(),
  pluck: vi.fn(),
}));
```

Add the test:

```tsx
it('play button strums the current chord tones', () => {
  strumSpy.mockClear();
  useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: false });
  render(<ChordInfo />);
  fireEvent.click(screen.getByTestId('play-chord'));
  expect(strumSpy).toHaveBeenCalledTimes(1);
  const freqs = strumSpy.mock.calls[0][0] as number[];
  expect(freqs).toHaveLength(3); // C major triad
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ChordInfo`
Expected: FAIL — no `play-chord` testid.

- [ ] **Step 3: Implement `useAudibleNotes`**

Create `src/ui/useAudibleNotes.ts`:

```ts
import { useStore } from './store';
import { chordFreqs, stringFretToFreq } from '../core/audio';
import { voicingsFor, shapeQualityOf } from '../core/voicings';

/**
 * Frequencies for the notes currently shown on the neck, ordered low string ->
 * high string (i.e. natural downstrum order). If a CAGED voicing is selected,
 * uses its fretted notes; otherwise falls back to the chord's tones.
 */
export function useAudibleNotes(): number[] {
  const { root, quality, mode, voicingView, shapeIndex } = useStore();
  const tq = mode === 'shapes' && voicingView ? shapeQualityOf(quality) : null;
  if (tq) {
    const vs = voicingsFor(root, tq);
    const v = vs.length ? vs[shapeIndex % vs.length] : null;
    if (v) {
      return [...v.notes]
        .sort((a, b) => b.string - a.string) // string 5 (low E) first
        .map((n) => stringFretToFreq(n.string, n.fret));
    }
  }
  return chordFreqs(root, quality);
}
```

- [ ] **Step 4: Add the play button to ChordInfo**

In `src/ui/ChordInfo.tsx`:

1. Add imports:

```tsx
import { useAudibleNotes } from './useAudibleNotes';
import { strum } from './sound';
```

2. Inside the component, after the existing `const { ... } = useStore();` line, add:

```tsx
  const audible = useAudibleNotes();
```

3. Change the `#cname` line to include the play button:

```tsx
      <div id="cname">
        {rn}{ql}
        <button
          id="play-chord"
          data-testid="play-chord"
          onClick={() => strum(audible)}
          title="Play chord"
          aria-label="Play chord"
        >
          ▶
        </button>
      </div>
```

- [ ] **Step 5: Add play-button styling**

In `src/index.css`, after the `#cname` rule (search for `#cname`), add:

```css
#play-chord{margin-left:10px;width:26px;height:26px;border-radius:50%;border:1px solid var(--border2);background:var(--panel2);color:var(--accent);font-size:11px;cursor:pointer;vertical-align:middle;transition:all .12s}
#play-chord:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- ChordInfo`
Expected: PASS.

- [ ] **Step 7: Build + commit**

```bash
npm run build
git add src/ui/useAudibleNotes.ts src/ui/ChordInfo.tsx src/ui/ChordInfo.test.tsx src/index.css
git commit -m "feat(ui): play button strums the current chord/voicing"
```

---

### Task 5: Click a fretboard dot to play it

**Files:**
- Modify: `src/ui/Fretboard.tsx`
- Test: `src/ui/Fretboard.test.tsx` (append)

**Interfaces:**
- Consumes: `playNote` from `./sound`.

- [ ] **Step 1: Write the failing test**

At the top of `src/ui/Fretboard.test.tsx`, add the sound mock (place with the other imports):

```tsx
import { vi } from 'vitest';
const playNoteSpy = vi.fn();
vi.mock('./sound', () => ({
  playNote: (...a: unknown[]) => playNoteSpy(...a),
  strum: vi.fn(),
  pluck: vi.fn(),
}));
```

Add a test in the first `describe('<Fretboard />')` block:

```tsx
it('clicking a dot plays that note', () => {
  playNoteSpy.mockClear();
  useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: false });
  render(<Fretboard />);
  const dots = screen.getAllByTestId('dot');
  fireEvent.click(dots[0].closest('g[transform]')!);
  expect(playNoteSpy).toHaveBeenCalled();
});
```

Ensure `fireEvent` is imported: `import { render, screen, fireEvent } from '@testing-library/react';`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Fretboard`
Expected: FAIL — click handler absent, `playNoteSpy` not called.

- [ ] **Step 3: Wire click handlers on each dot group**

In `src/ui/Fretboard.tsx`:

1. Add import:

```tsx
import { playNote } from './sound';
```

2. Each of the four dot render branches wraps its dot in a `<g transform=...>`. Add an `onClick` and pointer cursor to each group. Make these exact edits:

**Classic all-notes view** — change:

```tsx
            <g key={`d${s}-${f}`} transform={`translate(${cx},${cy})`}>
```
to:
```tsx
            <g key={`d${s}-${f}`} transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => playNote(s, f)}>
```

**Scale overlay** — change:

```tsx
            <g key={`sc${s}-${f}`} transform={`translate(${cx},${cy})`}>
```
to:
```tsx
            <g key={`sc${s}-${f}`} transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => playNote(s, f)}>
```

**Triad-in-position overlay** — change:

```tsx
                <g key={`tb${s}-${f}`} data-testid="triad-box-dot" transform={`translate(${cx},${cy})`}>
```
to:
```tsx
                <g key={`tb${s}-${f}`} data-testid="triad-box-dot" transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => playNote(s, f)}>
```

**Fingered voicing** — this branch destructures `{ string, fret, semi, finger }`. Change:

```tsx
              <g key={`v${string}-${fret}`} transform={`translate(${cx},${cy})`}>
```
to:
```tsx
              <g key={`v${string}-${fret}`} transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => playNote(string, fret)}>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Fretboard`
Expected: PASS (existing + new).

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/Fretboard.tsx src/ui/Fretboard.test.tsx
git commit -m "feat(ui): click any fretboard dot to hear that note"
```

---

### Task 6: Diatonic-triad chips strum the triad

**Files:**
- Modify: `src/ui/panels/DiatonicTriads.tsx`
- Test: `src/ui/panels/DiatonicTriads.test.tsx` (append)

**Interfaces:**
- Consumes: `strum` from `../sound`; `chordFreqs` from `../../core/audio`.

- [ ] **Step 1: Write the failing test**

At the top of `src/ui/panels/DiatonicTriads.test.tsx`, add the mock:

```tsx
const strumSpy = vi.fn();
vi.mock('../sound', () => ({
  strum: (...a: unknown[]) => strumSpy(...a),
  playNote: vi.fn(),
  pluck: vi.fn(),
}));
```

Ensure `vi` is imported from vitest. Add a test:

```tsx
it('clicking a triad chip strums it', () => {
  strumSpy.mockClear();
  useStore.setState({ root: 0, quality: 'maj', triadsInBox: false, triadDegree: null });
  render(<DiatonicTriads />);
  fireEvent.click(screen.getAllByTestId('triad-btn')[0]);
  expect(strumSpy).toHaveBeenCalledTimes(1);
  expect((strumSpy.mock.calls[0][0] as number[]).length).toBe(3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- DiatonicTriads`
Expected: FAIL — `strumSpy` not called.

- [ ] **Step 3: Strum on chip click**

In `src/ui/panels/DiatonicTriads.tsx`:

1. Add imports:

```tsx
import { strum } from '../sound';
import { chordFreqs } from '../../core/audio';
```

2. In the chip `onClick`, add a strum call as the first action (both in-position and jump modes should sound):

Change:

```tsx
              onClick={() => {
                if (triadsInBox) {
                  setTriadDegree(i === triadDegree ? null : i);
                } else {
                  setRoot(t.root);
                  setQuality(t.quality);
                }
              }}
```
to:
```tsx
              onClick={() => {
                strum(chordFreqs(t.root, t.quality));
                if (triadsInBox) {
                  setTriadDegree(i === triadDegree ? null : i);
                } else {
                  setRoot(t.root);
                  setQuality(t.quality);
                }
              }}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- DiatonicTriads`
Expected: PASS.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/ui/panels/DiatonicTriads.tsx src/ui/panels/DiatonicTriads.test.tsx
git commit -m "feat(ui): diatonic-triad chips sound the triad"
```

---

### Task 7: Progression playback — play/stop, tempo, follow toggle

**Files:**
- Modify: `src/ui/Progressions.tsx`
- Test: `src/ui/Progressions.test.tsx` (append)

**Interfaces:**
- Consumes: `strum` from `./sound`; `chordFreqs` from `../core/audio`; store `progFollow`, `tempo`, `setProgFollow`, `setTempo`, `type Tempo`.

- [ ] **Step 1: Write the failing test**

At the top of `src/ui/Progressions.test.tsx`, add the mock:

```tsx
import { vi } from 'vitest';
const strumSpy = vi.fn();
vi.mock('./sound', () => ({
  strum: (...a: unknown[]) => strumSpy(...a),
  playNote: vi.fn(),
  pluck: vi.fn(),
}));
```

Ensure `useStore` is imported: `import { useStore } from './store';`. Add tests:

```tsx
it('renders tempo chips and a follow toggle', () => {
  render(<Progressions />);
  expect(screen.getByTestId('follow-toggle')).toBeTruthy();
  expect(screen.getAllByTestId('tempo-chip').length).toBe(3);
});

it('follow toggle flips progFollow', () => {
  useStore.setState({ progFollow: true });
  render(<Progressions />);
  fireEvent.click(screen.getByTestId('follow-toggle'));
  expect(useStore.getState().progFollow).toBe(false);
});

it('selecting a progression then Play strums its first chord', () => {
  strumSpy.mockClear();
  render(<Progressions />);
  fireEvent.click(screen.getAllByTestId('prog-chip')[0]); // load a progression
  fireEvent.click(screen.getByTestId('prog-play'));
  expect(strumSpy).toHaveBeenCalled();
});
```

Ensure `fireEvent` is imported.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Progressions`
Expected: FAIL — no `follow-toggle` / `tempo-chip` / `prog-play` testids.

- [ ] **Step 3: Implement playback UI + logic**

In `src/ui/Progressions.tsx`:

1. Update imports:

```tsx
import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { FEATURED, LIBRARY, STYLES, CONCEPTS } from '../content/progressions';
import type { Chord, Progression } from '../core/types';
import { strum } from './sound';
import { chordFreqs } from '../core/audio';
import type { Tempo } from './store';
```

2. Add tempo duration mapping above the component:

```tsx
const TEMPO_MS: Record<Tempo, number> = { slow: 1400, med: 900, fast: 550 };
const TEMPOS: Tempo[] = ['slow', 'med', 'fast'];
```

3. Inside the component, extend the store destructure to include the new fields:

```tsx
  const {
    progId, progStep, setProgId, setProgStep, setRoot, setQuality,
    progFollow, tempo, setProgFollow, setTempo,
  } = useStore();
```

4. Add playback state + a timer ref + cleanup, after the existing `useState` lines:

```tsx
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
```

5. Add play/stop handlers before the `return`:

```tsx
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPlaying(false);
  };

  const play = () => {
    if (!active) return;
    stop();
    setPlaying(true);
    let i = 0;
    const stepOne = () => {
      const chord = active.chords[i];
      strum(chordFreqs(chord.root, chord.quality));
      setProgStep(i);
      if (progFollow) { setRoot(chord.root); setQuality(chord.quality); }
      i += 1;
      if (i < active.chords.length) {
        timer.current = setTimeout(stepOne, TEMPO_MS[tempo]);
      } else {
        timer.current = setTimeout(() => setPlaying(false), TEMPO_MS[tempo]);
      }
    };
    stepOne();
  };
```

6. In the `#prog-active` block, add the transport row just before the `active.chords.map(...)` step buttons — i.e. change:

```tsx
        <div id="prog-active">
          <div id="prog-steps">
```
to:
```tsx
        <div id="prog-active">
          <div id="prog-transport">
            <button
              data-testid="prog-play"
              className="transport-btn"
              onClick={() => (playing ? stop() : play())}
              aria-label={playing ? 'Stop' : 'Play progression'}
            >
              {playing ? '■' : '▶'}
            </button>
            <div id="tempo-chips">
              {TEMPOS.map((t) => (
                <button
                  key={t}
                  data-testid="tempo-chip"
                  className={`spill${t === tempo ? ' on' : ''}`}
                  onClick={() => setTempo(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              data-testid="follow-toggle"
              className={`mini-toggle${progFollow ? ' on' : ''}`}
              onClick={() => setProgFollow(!progFollow)}
            >
              follow neck
            </button>
          </div>
          <div id="prog-steps">
```

- [ ] **Step 4: Add transport styling**

In `src/index.css`, after the `#prog-concepts` rules, add:

```css
#prog-transport{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}
.transport-btn{width:30px;height:30px;border-radius:50%;border:1px solid var(--accent);background:var(--accent);color:#fff;font-size:12px;cursor:pointer;transition:all .12s}
.transport-btn:hover{filter:brightness(1.1)}
#tempo-chips{display:flex;gap:4px}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Progressions`
Expected: PASS.

- [ ] **Step 6: Full test suite + build**

Run: `npm test`
Expected: all suites PASS.
Run: `npm run build`
Expected: clean.

- [ ] **Step 7: Verify live**

Start the dev server (`npm run dev`, port 5173). In the browser: click a fretboard dot (hear a pluck), click the ▶ next to the chord name (hear a strum), open a progression and press ▶ (hear it play through, board following), toggle "follow neck" off and replay (audio only), change tempo. Confirm no console errors. Screenshot the transport row.

- [ ] **Step 8: Update graph + commit**

```bash
graphify update .
git add src/ui/Progressions.tsx src/ui/Progressions.test.tsx src/index.css
git commit -m "feat(ui): play progressions with tempo and follow-neck toggle"
```

---

## Self-Review Notes

- **Spec coverage:** core/audio (Task 1); ui/sound engine (Task 2); store progFollow/tempo (Task 3); play-current-chord + useAudibleNotes (Task 4); click-note (Task 5); triad chips (Task 6); progression playback + tempo + follow (Task 7). All four triggers + strum feel + follow-toggle covered.
- **Type consistency:** `Tempo` type defined in Task 3, imported in Task 7. `strum(freqs: number[])`, `playNote(string, fret)`, `chordFreqs(rootPc, quality)`, `stringFretToFreq(string, fret)` signatures identical across producing (Tasks 1–2) and consuming (Tasks 4–7) tasks. `STRING_MIDI` index convention (0=high-e..5=low-E) matches Fretboard's string indexing and `useAudibleNotes` low→high sort (string 5 first).
- **Mock consistency:** every component test that imports a component using `./sound` (or `../sound`) mocks the whole module with `strum`/`playNote`/`pluck`, since jsdom has no `AudioContext`. Path is `./sound` from `src/ui/*` and `../sound` from `src/ui/panels/*`.
- **Cleanup:** the playback timer is cleared on unmount (Task 7 step 4) and on stop.
- **Edge cases:** no `AudioContext` → engine no-ops (Task 2); unknown quality → `chordFreqs` returns [] → silent strum (Task 1).
