# FretDNA Phase 3 — Library Polish + Triads-in-Position (Design)

Date: 2026-07-03
Status: Approved (approach A for triads-in-box)

## Goal

Phase 3 of the FretDNA roadmap: make the DNA library complete and browsable by
harmonic concept, deepen the Frusciante/RHCP content, and add the literal
"7 diatonic triads inside one CAGED position" visualization deferred from the
diatonic-triads feature.

Four parts, in build order:

1. DNA text for all 20 `LIBRARY` progressions
2. Concept grouping (second filter chip row)
3. Five new Frusciante/RHCP progressions
4. Triads-in-position (in-box scale highlighting)

## Part 1 — DNA text for the LIBRARY entries

`src/content/progressions.ts`: all 20 `LIBRARY` entries (`l1`–`l20`) currently
have `dna: null`. Write real DNA prose for each, in the established FEATURED
voice: name the functional move (roman numerals), then the *why it works*
insight (shared tones, voice leading, borrowed color, rhythmic role). 1–3
sentences each.

- The `Progression.dna` type stays `string | null` (future entries may land
  before their text), but after this phase every shipped entry has text.
- New content test: every entry in `FEATURED` and `LIBRARY` has a non-empty
  `dna` string.

## Part 2 — Concept grouping

- `src/core/types.ts`: add `concept: string` to `Progression` (required).
- `src/content/progressions.ts`: export
  `CONCEPTS = ['All', 'Shared tones', 'Borrowed chords', 'ii–V family',
  'Modal vamp', 'Blues', 'Pop loop', 'Suspensions & add9', 'Chromatic moves']`
  (same pattern as `STYLES`) and tag every progression with exactly one
  concept (the non-'All' values).
- `src/ui/Progressions.tsx`: second chip row under the style row, local
  `useState` like the style filter. Style and concept combine with AND;
  both default to `'All'`. Reuse the existing `.spill` chip styling; reuse
  `data-testid="style-chip"` pattern with a new `concept-chip` testid.
- Tests: every progression's `concept` is a member of `CONCEPTS` (and not
  'All'); component test that combining filters narrows the list.

## Part 3 — More Frusciante/RHCP content

Five new `FEATURED` entries (ids `jf6`–`jf10`), each with full DNA and a
concept tag, decoding named devices:

1. **Snow (Hey Oh) intro cycle** — the four-chord cycle and the top-string
   pedal running through it.
2. **Can't Stop verse vamp** — minor vamp driven by muted 16ths; harmony as
   percussion.
3. **Scar Tissue verse** — sliding 6ths/double-stops outlining I and IV
   instead of strummed chords.
4. **Soul to Squeeze loop** — the vi–IV-family loop and its top-voice motion.
5. **Frusciante inversion device** — slash-chord/first-inversion move (bass
   3rd walking under a major triad) as a reusable device entry.

Chord spellings must use existing `QTYPES` qualities; validated by the
existing content test that every chord quality resolves.

## Part 4 — Triads-in-position (approach A: scale-window highlight)

The deferred literal version of "7 triads": show each diatonic triad's tones
*inside the currently selected CAGED position window*, instead of jumping the
board to a new chord.

### Core

`src/core/diatonic.ts` (or a small addition alongside): pure helper

```ts
triadTonesInWindow(
  keyRoot: number, quality: string, degree: number,
  loFret: number, hiFret: number,
): ScaleDot[]  // scale dots within the window, flagged inTriad
```

Implementation: reuse `getScaleDots(keyRoot, quality, …)` + `diatonicTriads`;
filter dots to `loFret..hiFret` and flag membership in the selected degree's
triad (root/3rd/5th pitch classes). Returns `[]` when `scaleFor(quality)` is
null (no parent scale). The window comes from the existing `voicingSpan` of
the selected shape.

### Store

Two new persisted fields in `src/ui/store.ts`:

- `triadsInBox: boolean` (default `false`) — the mode toggle.
- `triadDegree: number | null` (default `null`) — selected degree 0–6.

### UI

- `DiatonicTriads` panel: an "in position" toggle. When ON, clicking a
  I–vii° chip sets `triadDegree` instead of calling `setRoot`/`setQuality`
  (board root/quality/shape stay put). Clicking the active degree again
  clears it. When OFF, behavior is unchanged (key chord picker).
- `Fretboard.tsx`: when `triadsInBox && triadDegree != null` and a position
  box is active, render the window's scale tones with the selected triad's
  tones full-strength (interval colors relative to the *triad* root:
  root/3rd/5th) and the remaining scale tones dimmed. Outside the window,
  nothing extra.
- Edge cases: if `scaleFor(quality)` returns null (quality outside both
  scale families), the toggle renders disabled with a hint; with
  `showAllPositions` ON, triads-in-box applies to the selected shape's
  window only.

### Tests

Unit tests for `triadTonesInWindow` (window filtering, triad flagging,
degree selection, null-scale case); store defaults; component test that the
toggle switches chip behavior from jump-board to highlight.

## Out of scope

- Fingered 3-note triad voicings per position (approach B) — possible later
  evolution of part 4.
- Shareable URL state (explicitly deferred by the owner).
- New voicing qualities (dim/aug/sus/dim7/m7b5).
- Audio (Phase 4).

## Build / verification rules

- `npm test` AND `npm run build` before every commit (Vitest does not
  enforce `noUnusedLocals`; only `tsc -b` does).
- Verify live on the dev server (port 5173) before claiming done.
- Run `graphify update .` after code changes.
- Executed directly in the main thread (owner preference; no subagents).
