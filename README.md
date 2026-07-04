# FretDNA

A guitar **fretboard harmony visualizer** whose signature feature is the **"DNA"** — plain-language explanations of *why* a chord progression works (shared tones, voice leading, borrowed chords, tritone subs). Free, static, and built for learning the neck.

**Live:** https://abdelwahab0.github.io/fretdna/

## What it does

- **Fretboard map** — pick a root and quality; see every chord tone on the neck, colored by interval (root / 3rd / 5th / 7th / extension).
- **CAGED voicings** — step through playable, fingered shapes one at a time, with a dimmable "ghost" overlay of all notes, a position box, and an all-positions view.
- **Scales & diatonic triads** — overlay the parent scale, or light up the seven diatonic triads *inside the current CAGED position*.
- **The DNA library** — 50+ progressions (Frusciante/RHCP, Hendrix, SRV, Vulfpeck, neo-soul, funk), each with a short explanation of the harmonic move behind it. Filter by artist style or by concept (shared tones, ii–V, borrowed chords, blues…).
- **Audio** — click any note to hear it, strum the current chord, sound the triads, or play a progression back at a chosen tempo. A hand-rolled Karplus-Strong plucked string over the Web Audio API — **no samples, no audio libraries**.

## Tech

Vite · React 18 · TypeScript (strict) · Zustand (with `persist`) · Vitest + Testing Library. Zero runtime dependencies beyond React/Zustand — the synth is built directly on the Web Audio API.

The codebase keeps a strict split:

- `src/core/` — pure, unit-tested music theory, fretboard geometry, CAGED/voicing logic, and audio DSP. Never imports UI.
- `src/content/` — the progression/DNA library data.
- `src/ui/` — thin React layer: Zustand store, `Fretboard`, and panels.

## Develop

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # run the test suite
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Deploy

Pushing to `main` auto-builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`. The Vite `base` is relative (`./`), so the build also works served from any root domain or a static drop.
