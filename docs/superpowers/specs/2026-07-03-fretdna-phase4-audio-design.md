# FretDNA Phase 4 — Audio Design

**Date:** 2026-07-03
**Status:** Approved (design)

## Goal

Make the fretboard audible. Clicking any note plays it; a play button strums the
current chord/voicing; diatonic-triad chips sound the triad; and a progression can
be auto-played chord-by-chord. The instrument is a hand-rolled Karplus-Strong
plucked string built directly on the Web Audio API — **zero new dependencies**
(the roadmap's Tone.js line is intentionally dropped in favor of keeping the
bundle small for this lightweight free static app).

## Scope (agreed)

All four triggers are in scope:
1. **Play current chord/voicing** — a play button strums the notes currently on the neck.
2. **Click individual notes** — every dot on the board plays its pitch when clicked.
3. **Play progression** — a play/stop button strums each chord in sequence at a chosen tempo.
4. **Hear diatonic triads/scale** — clicking a diatonic-triad chip strums the triad; scale
   tones are audible via the per-dot click handler (they are dots on the board).

Chords **strum** low-string→high with a small stagger (~22 ms) — guitar feel, no
block-chord toggle. Progression playback **auto-advances the board by default**, with
a **"Follow on neck"** toggle to turn that off (audio only).

## Architecture — pure / impure split

The design keeps all deterministic DSP and pitch math in the pure, unit-tested
`core/` layer, and confines Web Audio lifecycle and scheduling to a thin
browser-only `ui/sound.ts`.

### `core/audio.ts` (pure, fully unit-tested)

```ts
// MIDI note number of each open string, index 0..5 = high-e .. low-E.
// Matches the existing TUNING pitch classes (theory.ts) with real octaves.
export const STRING_MIDI = [64, 59, 55, 50, 45, 40]; // E4 B3 G3 D3 A2 E2

// Equal-tempered frequency of a MIDI note (A4 = MIDI 69 = 440 Hz).
export function midiToFreq(midi: number): number;

// Frequency of a fretted note. string 0..5, fret >= 0.
export function stringFretToFreq(string: number, fret: number): number;

// Ascending frequencies for a chord's tones in a comfortable low register.
// Places the root near C3 (MIDI 48 + rootPc) and stacks the chord's intervals
// (from getChordIntervals(quality) in core/chords.ts) above it. Used by the
// "play chord" button (no voicing selected), triad chips, and progression
// playback. Returns [] for an unknown quality.
export function chordFreqs(rootPc: number, quality: string): number[];

// The plucked-string synth as a pure function. Karplus-Strong: seed a ring
// buffer of length round(sampleRate/freq) with noise, then repeatedly average
// adjacent samples (a one-zero lowpass) with a decay factor, emitting one
// sample per step. rng() must return [0,1). Returns Float32Array of
// round(seconds*sampleRate) samples in roughly [-1, 1].
export function renderKarplusStrong(
  freq: number,
  seconds: number,
  sampleRate: number,
  rng: () => number,
): Float32Array;
```

`renderKarplusStrong` reference algorithm:

```
N = max(2, round(sampleRate / freq))
ring = [rng()*2-1 for _ in range(N)]
out = Float32Array(round(seconds*sampleRate))
decay = 0.996
idx = 0
for i in range(len(out)):
  cur = ring[idx]
  nxt = (idx + 1) % N
  ring[idx] = decay * 0.5 * (cur + ring[nxt])
  out[i] = cur
  idx = nxt
return out
```

### `ui/sound.ts` (thin, browser-only, side-effecting)

- Lazy singleton `AudioContext`, created and `resume()`d on first call (browsers
  block audio until a user gesture — the first click/press covers this).
- `getCtx(): AudioContext | null` — returns null when `AudioContext`/`webkitAudioContext`
  is unavailable (jsdom, SSR), so all callers safely no-op.
- `pluck(freq: number, whenOffset = 0, gain = 0.7): void` — builds an `AudioBuffer`
  from `renderKarplusStrong(freq, ~1.6s, ctx.sampleRate, Math.random)`, routes
  `BufferSource → GainNode → destination`, starts at `ctx.currentTime + whenOffset`.
- `strum(freqs: number[], stagger = 0.022): void` — calls `pluck(f, i*stagger)` for
  each freq in the given order (callers pass low→high).
- `playNote(string: number, fret: number): void` — `pluck(stringFretToFreq(string, fret))`.

`ui/sound.ts` imports `core/audio` only. It is mocked in component tests.

## UI wiring

- **Per-dot click:** in `Fretboard.tsx`, each rendered dot group (classic `dot`,
  `voicing-dot`, scale dots, `triad-box-dot`) gets `onClick={() => playNote(string, fret)}`
  and `style={{ cursor: 'pointer' }}`. A single helper avoids repetition.
- **Play current chord:** a small round ▶ button rendered in/next to `ChordInfo`.
  It strums the notes currently on the neck. The set of audible notes is derived
  the same way the board derives its dots: if a voicing is selected, use
  `selected.notes` (sorted low string→high); otherwise use the classic `allDots`.
  To avoid duplicating that logic, `Fretboard` already computes these; the play
  button lives where it can read the same store-derived values. Implementation:
  a tiny `useAudibleNotes()` helper in `ui/useAudibleNotes.ts` that reads the store
  and returns `{ string, fret }[]` (low→high), used by both the button and
  (optionally) reused by Fretboard. Strum order: descending string index (5→0).
- **Diatonic triad chips:** `DiatonicTriads.tsx` — clicking a chip also strums the
  triad via `strum(chordFreqs(t.root, t.quality))`.
- **Progression playback:** `Progressions.tsx` gets a ▶/■ control plus the tempo
  chip row and the follow toggle. Playback uses `setTimeout` scheduling driven by
  the tempo; on each step it `strum`s `chordFreqs(chord.root, chord.quality)` and,
  if `progFollow`, loads the chord onto the board (existing `setRoot`/`setQuality`
  + `setProgStep`). Stop clears the pending timer. "Is playing" is local component
  state (not persisted). The timer must be cleared on unmount.

### Tempo

`tempo: 'slow' | 'med' | 'fast'` maps to per-chord durations: slow = 1400 ms,
med = 900 ms, fast = 550 ms. A 3-button chip row (reusing `.spill` styling).

## Store additions (persisted via existing zustand `persist`)

```ts
progFollow: boolean;              // default true
tempo: 'slow' | 'med' | 'fast';   // default 'med'
setProgFollow: (b: boolean) => void;
setTempo: (t: 'slow' | 'med' | 'fast') => void;
```

Playback progress reuses the existing `progStep`. No master mute flag (YAGNI —
the browser tab is mutable and playback is user-initiated).

## Error handling

- No `AudioContext` (jsdom/older browsers): `getCtx` returns null and every audio
  call no-ops. The app remains fully functional silently.
- Autoplay policy: the context is created lazily inside the first user-gesture
  handler (a click), which satisfies browser autoplay rules. No pre-warming.
- Overlapping plucks: each pluck is an independent short BufferSource; the browser
  mixes them. No voice cap needed at this scale (≤6 notes/strum).

## Testing

- **`core/audio.test.ts`:** `midiToFreq(69) === 440`; `stringFretToFreq(5,0) ≈ 82.41`
  (low E), `stringFretToFreq(0,0) ≈ 329.63` (high e), `stringFretToFreq(4,12) ≈ 220`
  (A string octave); `renderKarplusStrong` returns `round(seconds*sampleRate)`
  samples, is non-silent (some |sample| > 0.01), and its zero-crossing-derived
  period is within a tolerance of `sampleRate/freq`; `chordFreqs(0, 'maj')` returns
  three ascending values (C major triad) and `chordFreqs(0, 'bogus')` returns [].
- **`ui/store.test.ts`:** `progFollow` defaults true, `tempo` defaults 'med',
  setters work.
- **Component tests** (mock `ui/sound.ts`): the ▶ chord button calls `strum` with
  the expected freq count; a Fretboard dot click calls `playNote`; the follow
  toggle flips `progFollow`; selecting a tempo chip updates `tempo`.

## File structure

- Create: `src/core/audio.ts`, `src/core/audio.test.ts`
- Create: `src/ui/sound.ts`
- Create: `src/ui/useAudibleNotes.ts`
- Create: `src/ui/panels/PlayButton.tsx` (or inline into ChordInfo — decided in plan)
- Modify: `src/ui/store.ts`, `src/ui/store.test.ts`
- Modify: `src/ui/Fretboard.tsx` (+ test), `src/ui/panels/DiatonicTriads.tsx` (+ test),
  `src/ui/Progressions.tsx` (+ test), `src/ui/ChordInfo.tsx`
- Modify: `src/index.css` (play button, tempo chips)

## Out of scope (future)

Metronome/click track, per-string mute, sustain/damping controls, MIDI export,
recording, note-length articulation, volume slider.
