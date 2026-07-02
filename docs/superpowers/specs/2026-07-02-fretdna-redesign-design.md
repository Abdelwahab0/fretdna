# FretDNA v2 — Design Spec

**Date:** 2026-07-02
**Status:** Approved (pending final review)

## Vision

FretDNA is a **fretboard harmony visualizer** whose distinctive hook is the **"DNA"** — plain-language explanations of *why* a chord progression works (shared tones, voice leading, borrowed chords, tritone subs). Seeing + understanding the harmony together is the whole point.

It is a **free tool for everyone**, but built first for the author's own learning. No accounts, no backend — it runs as a static web app. **Content (the DNA library) is the most important asset. Learning is the reason it exists.**

### The core problem being solved

The v1 prototype (single HTML file) renders a **note-map, not a chord**: it lights up *every* location of each chord interval across 15 frets. That answers "where do the notes live" but not "how do I actually finger this chord right here." The user can see the notes but has no way to play them.

**FretDNA v2's central bet:** show **playable, fingered voicings anchored to CAGED positions** — one grabbable shape at a time, with finger numbers — with the DNA explanation riding on top.

## Non-goals (YAGNI)

- No accounts, auth, or backend.
- No SaaS / paid tier.
- No save/share of user-created progressions (may revisit later; not in scope now).
- Audio is in scope but is the **last** phase — least important.

## Stack

- **React + TypeScript + Vite** for the view layer.
- **Zustand** for state (typed store replacing the global `S` object).
- **Tone.js** for audio (Phase 4 only).
- Static hosting (any static host / GitHub Pages).

### Rationale

The hard part of this app is not the UI framework — it is the music-theory domain (voicings, CAGED anchoring, fingering). That logic is framework-agnostic and lives in a separate typed **core**. React was chosen because the app is a dense control surface with lots of derived state, which fits the component + store model well, and for its ecosystem and portfolio value.

## Architecture — brain vs. skin

```
src/
├─ core/            ← pure TypeScript, zero DOM, unit-testable
│  ├─ theory.ts        notes, intervals, tunings, interval names/colors
│  ├─ chords.ts        QTYPES → Chord (root, quality, tones)
│  ├─ voicings.ts      ★ the new heart: generate PLAYABLE fingered voicings
│  ├─ caged.ts         ★ CAGED position anchoring + neck "windows"
│  └─ types.ts         Chord, Voicing, Fingering, Position, Progression
├─ content/         ← the DNA library as typed data (not hardcoded in logic)
│  └─ progressions.ts  FEATURED + LIBRARY with DNA annotations
├─ audio/           ← optional, isolated (Phase 4)
│  └─ synth.ts
├─ ui/              ← React (the skin)
│  ├─ store.ts         one typed Zustand store replacing global `S`
│  ├─ Fretboard.tsx    big horizontal neck: SVG renderer (maple palette) driven by a Voicing
│  ├─ ChordChart.tsx   ★ mini vertical box-chart card for one Voicing (also the voicing picker)
│  ├─ panels/          RootPicker, QualityPicker
│  ├─ Library.tsx      progression browser + DNA cards
│  └─ LoopStrip.tsx    player
└─ main.tsx
```

**Dependency rule:** `ui/` and `audio/` may import from `core/`, never the reverse. `core/` has no DOM or framework dependencies and is testable with plain assertions.

### Boundaries per unit

- **`core/theory.ts`** — What: notes, tuning, interval math and naming/colors. Uses: pure functions. Depends on: nothing.
- **`core/chords.ts`** — What: chord quality definitions → a `Chord` (root + intervals + tones). Depends on: `theory`.
- **`core/voicings.ts`** — What: given a `Chord`, return the *list* of playable fingered `Voicing`s (one per CAGED position, frets per string within a hand span). Depends on: `theory`, `chords`, `caged`.
- **`ui/ChordChart.tsx`** — What: render one `Voicing` as a compact vertical box chart; the row of these is the voicing picker. Depends on: `core` types.
- **`core/caged.ts`** — What: map a chord/position to a CAGED shape and a neck window. Depends on: `theory`.
- **`content/progressions.ts`** — What: the DNA library as data. Depends on: `chords`.
- **`ui/store.ts`** — What: typed app state + actions. Depends on: `core`.
- **`ui/Fretboard.tsx`** — What: pure render of `(Voicing, displayOptions)` → SVG. Depends on: `core` types.

## The core reframe — Voicings, not note-maps

New central type:

```ts
type Voicing = {
  chord: Chord;
  position: number;           // which region of the neck
  cagedShape: 'C' | 'A' | 'G' | 'E' | 'D';
  notes: { string: number; fret: number; finger: 1|2|3|4|0; interval: number }[];
};
```

- The big neck renders **one grabbable shape at a time**, with **finger numbers on the dots**.
- The full v1 note-map is preserved as a **toggleable ghost overlay** ("where else does this live"), so nothing is lost.

### The voicing picker = chord charts (unified concept)

Rather than a separate abstract "position picker" of text buttons, **navigation happens through chord-chart cards** — the standard vertical box diagrams guitarists already read fluently:

- `core/voicings.ts` returns the *list* of playable voicings for the current chord (one per CAGED position).
- Each voicing renders as a compact **mini box chart** (`ChordChart.tsx`) in a strip beside/below the neck — showing finger dots and fret position.
- **Clicking a mini chart blooms that voicing onto the big neck** in full context, with the ghost overlay behind it and the DNA riding on top.
- The same `Voicing` data and renderer serve **two scales**: the big horizontal neck and the mini vertical charts.

Mental model of the screen: **mini charts = the menu · big neck = selected shape in context · ghost overlay = everywhere else the notes live · DNA = why it matters.** This directly answers the core problem — the mini chart *is* the fingering, the neck shows where it lives.

## View & state

- **Zustand store** holds typed state (root, quality, current voicing, position, mode, loop). Components subscribe to only what they need. This is the disciplined replacement for v1's global `S` object and manual `syncUI`.
- **`<Fretboard>`** is a pure function of `(Voicing, displayOptions)` → SVG. **Maple wood palette** (light), colored interval dots, finger numbers, bloom animation preserved from v1.
- Panels are small, single-purpose components. The DNA library data drives the right panel; adding a progression = adding a data entry, never touching UI code.

## Visual direction

- **Maple fretboard** (light wood) instead of v1's dark rosewood — cleaner, and the colored interval dots pop more against it.
- Keep v1's overall palette intent (warm, editorial) and the interval color coding (root / 3rd / 5th / 7th / extension).

## Audio (Phase 4)

- Isolated `audio/` module; `core/` never depends on it.
- **Plucked-string synth** (Tone.js `PluckSynth` / Karplus-Strong) — code-only, no audio-file assets, sounds guitar-like, can strum the current voicing and drive the loop player.
- Upgrade path to real samples later without touching other modules.

## Testing

- `core/` modules get real unit tests (e.g., a Cmaj7 E-shape at fret 7 produces a specific, asserted set of frets + fingers). This logic is miserable to verify by eye and trivial to verify with assertions.
- UI is lightly tested.

## Phasing (each phase leaves the app runnable)

1. **Foundation** — Vite + React + TS scaffold; port `core/theory` + `core/chords` with unit tests; render the **maple fretboard** showing the current all-notes view. Parity with today, but modular, typed, and better-looking.
2. **Voicings & CAGED** *(the reason for the project)* — build `voicings.ts` + `caged.ts`, finger numbers, the **chord-chart voicing picker** (`ChordChart.tsx`), and click-to-bloom onto the big neck. FretDNA becomes the tool the author actually needs.
3. **Library polish** — expand DNA content, concept grouping (shared tones, tritone subs, borrowed chords), style filters.
4. **Audio** *(least important, last)* — plucked-string synth, strum the current voicing, wire into the loop player.
