# FretDNA Phase 2b — Voicing UI (render fingered voicings + ghost overlay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. In THIS project, execute directly in the main thread (subagents surface permission prompts to the user). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the Phase 2a CAGED voicing engine visible: a "Voicing" view that renders one selected, fingered CAGED shape on the maple neck, with the all-notes map behind it as a dimmed **ghost overlay**, plus a shape picker to move between CAGED positions.

**Architecture:** Add UI state to the Zustand store (`voicingView`, `shapeIndex`, `showGhost`) and a pure `triadQualityOf` mapper in `core/voicings.ts`. `Fretboard.tsx` gains a voicing render path: when Voicing view is on and the current quality maps to a triad, it renders the selected `voicingsFor(...)` voicing (finger-numbered dots) over an optional dimmed ghost of the existing all-notes dots; otherwise it renders exactly as today.

**Tech Stack:** React 18, TypeScript, Zustand, Vitest (existing). No new dependencies.

## Global Constraints

- `core/` never imports React/store/`ui/`. `ui/` imports `core/` + store only.
- Strict tsc (`noUnusedLocals`/`noUnusedParameters`): run `npm run build` before every commit.
- Every task runs BOTH `npm test` and `npm run build` before committing.
- Engine scope is triads only (`maj`/`min`). Phase 2b maps ONLY `quality === 'maj'` → `'maj'` and `quality === 'min'` → `'min'`; every other quality returns `null` and shows today's all-notes view unchanged (extended-chord voicings are Phase 2c). Do not fake voicings for unsupported qualities.
- Existing `data-testid="fretboard"` stays. New: `data-testid="voicing-dot"` for solid fingered voicing dots, `data-testid="ghost-dot"` for dimmed overlay dots.
- Maple `BOARD` palette and fixed interval colors (root #E04808, 3rd #149A70, 5th #3A70B8, 7th #A028B0, ext #6840C8) are reused via `core`.

---

### Task 1: Store state + `triadQualityOf` mapper

**Files:**
- Modify: `src/ui/store.ts`
- Modify: `src/core/voicings.ts`
- Test: `src/core/voicings.test.ts` (append cases)

**Interfaces:**
- Consumes: `TriadQuality` from `core/caged` (already imported by `voicings.ts`).
- Produces:
  - store: `voicingView: boolean` (default `false`), `shapeIndex: number` (default `0`), `showGhost: boolean` (default `true`), with setters `setVoicingView(b)`, `setShapeIndex(i)`, `setShowGhost(b)`.
  - `triadQualityOf(quality: string): TriadQuality | null`.

- [ ] **Step 1: Add failing tests to `src/core/voicings.test.ts`** (append at end of file)

```ts
import { triadQualityOf } from './voicings';

describe('triadQualityOf', () => {
  it('maps maj -> maj and min -> min', () => {
    expect(triadQualityOf('maj')).toBe('maj');
    expect(triadQualityOf('min')).toBe('min');
  });
  it('returns null for qualities without a Phase-2b triad voicing', () => {
    for (const q of ['maj7', 'm7', 'dom7', 'dim', 'aug', 'sus2', 'add9', 'bogus']) {
      expect(triadQualityOf(q)).toBeNull();
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/core/voicings.test.ts`
Expected: FAIL — `triadQualityOf` is not exported.

- [ ] **Step 3: Add `triadQualityOf` to `src/core/voicings.ts`** (append after `voicingsFor`)

```ts
/** Map an app chord-quality key to the triad this plan can voice, or null. */
export function triadQualityOf(quality: string): TriadQuality | null {
  if (quality === 'maj') return 'maj';
  if (quality === 'min') return 'min';
  return null;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/core/voicings.test.ts`
Expected: PASS.

- [ ] **Step 5: Add state to `src/ui/store.ts`**

In the `AppState` interface, after `hlInterval: number | null;` add:
```ts
  voicingView: boolean;
  shapeIndex: number;
  showGhost: boolean;
```
and after `setHlInterval: (i: number | null) => void;` add:
```ts
  setVoicingView: (b: boolean) => void;
  setShapeIndex: (i: number) => void;
  setShowGhost: (b: boolean) => void;
```
In the `create` initializer, after `hlInterval: 0,` add:
```ts
  voicingView: false,
  shapeIndex: 0,
  showGhost: true,
```
and after `setHlInterval: (hlInterval) => set({ hlInterval }),` add:
```ts
  setVoicingView: (voicingView) => set({ voicingView }),
  setShapeIndex: (shapeIndex) => set({ shapeIndex }),
  setShowGhost: (showGhost) => set({ showGhost }),
```

- [ ] **Step 6: Full suite + build**

Run: `npm test` → Expected: PASS (existing + new triadQualityOf cases).
Run: `npm run build` → Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ui/store.ts src/core/voicings.ts src/core/voicings.test.ts
git commit -m "feat(ui): add voicing-view store state and triadQualityOf mapper"
```

---

### Task 2: Fretboard voicing render path + ghost overlay

**Files:**
- Modify: `src/ui/Fretboard.tsx` (full replacement below)
- Test: `src/ui/Fretboard.test.tsx` (append cases)

**Interfaces:**
- Consumes: store (`voicingView`, `shapeIndex`, `showGhost`, plus existing fields), `voicingsFor`/`triadQualityOf` from `core/voicings`, `chipKind` from `core/chords`, existing `core/fretboard` + `core/theory` exports.
- Produces: `<Fretboard />` renders `data-testid="voicing-dot"` per selected-voicing note (with finger number) and `data-testid="ghost-dot"` per dimmed all-notes dot when the voicing path is active.

- [ ] **Step 1: Append failing tests to `src/ui/Fretboard.test.tsx`**

```ts
import { voicingsFor } from '../core/voicings';

describe('<Fretboard /> voicing view', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('renders one voicing-dot per note of the selected CAGED voicing (C major, C-shape)', () => {
    useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: true, shapeIndex: 0, showGhost: false });
    render(<Fretboard />);
    const expected = voicingsFor(0, 'maj')[0].notes.length; // C-shape
    expect(screen.getAllByTestId('voicing-dot')).toHaveLength(expected);
  });

  it('shows ghost dots when showGhost is on', () => {
    useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: true, shapeIndex: 0, showGhost: true });
    render(<Fretboard />);
    expect(screen.getAllByTestId('ghost-dot').length).toBeGreaterThan(0);
  });

  it('falls back to the all-notes view for unsupported qualities (maj7)', () => {
    useStore.setState({ root: 0, quality: 'maj7', mode: 'shapes', voicingView: true });
    render(<Fretboard />);
    expect(screen.queryAllByTestId('voicing-dot')).toHaveLength(0);
    expect(screen.getAllByTestId('dot').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/ui/Fretboard.test.tsx`
Expected: FAIL — no `voicing-dot`/`ghost-dot` yet.

- [ ] **Step 3: Replace `src/ui/Fretboard.tsx` with:**

```tsx
import { useStore } from './store';
import { NOTES, S_NAMES, SC, ICOLORS, intervalName } from '../core/theory';
import {
  getDots, sy, fcx, flx, BOARD, SW, INLAYS,
  VW, VH, NX, PT, PB, FMAX,
} from '../core/fretboard';
import { voicingsFor, triadQualityOf } from '../core/voicings';

export default function Fretboard() {
  const { root, quality, mode, voicing, stringSet, hlInterval, showLabels, voicingView, shapeIndex, showGhost } = useStore();
  const my = PT + ((SC - 1) * (sy(1) - sy(0))) / 2;

  const tq = mode === 'shapes' && voicingView ? triadQualityOf(quality) : null;
  const voicings = tq ? voicingsFor(root, tq) : [];
  const selected = voicings.length ? voicings[shapeIndex % voicings.length] : null;

  // Dots for the classic all-notes view (also used as the ghost overlay).
  const allDots = getDots({ mode, root, quality, voicing, stringSet, hlInterval });

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

      {/* Voicing path: ghost overlay (optional) + selected fingered voicing */}
      {selected ? (
        <>
          {showGhost && allDots.map(({ s, f, semi }) => (
            <circle key={`gh${s}-${f}`} data-testid="ghost-dot" cx={fcx(f)} cy={sy(s)} r={8}
              fill={ICOLORS[semi] ?? '#888'} opacity={0.14} />
          ))}
          {selected.notes.map(({ string, fret, semi, finger }) => {
            const cx = fcx(fret), cy = sy(string);
            const color = ICOLORS[semi] ?? '#888';
            const r = semi === 0 ? 13 : 11;
            return (
              <g key={`v${string}-${fret}`} transform={`translate(${cx},${cy})`}>
                <g className="nd">
                  {semi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />}
                  <circle data-testid="voicing-dot" cx={0} cy={0} r={r} fill={color} opacity={semi === 0 ? 1 : 0.9} />
                  <text x={0} y={4} textAnchor="middle" fontSize={semi === 0 ? 9 : 8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={500}>
                    {showLabels ? (finger === 0 ? '0' : String(finger)) : NOTES[(root + semi) % 12]}
                  </text>
                </g>
              </g>
            );
          })}
        </>
      ) : (
        /* Classic all-notes view (unchanged) */
        allDots.map(({ s, f, semi, note, delay }) => {
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
        })
      )}
    </svg>
  );
}
```

Note: in Voicing view, the label toggle shows the **finger number** (when "Show intervals" is on) or the note name (when off). `chipKind` is intentionally not needed here — dot color already comes from `ICOLORS[semi]`.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/ui/Fretboard.test.tsx`
Expected: PASS (voicing-dot count, ghost-dot presence, maj7 fallback).

- [ ] **Step 5: Full suite + build**

Run: `npm test` → Expected: PASS.
Run: `npm run build` → Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/Fretboard.tsx src/ui/Fretboard.test.tsx
git commit -m "feat(ui): render selected CAGED voicing with ghost overlay"
```

---

### Task 3: Voicing controls panel + App wiring

**Files:**
- Create: `src/ui/panels/VoicingControls.tsx`
- Modify: `src/App.tsx`
- Test: `src/ui/panels/VoicingControls.test.tsx`

**Interfaces:**
- Consumes: store (`voicingView`, `shapeIndex`, `showGhost`, `root`, `quality`, setters), `voicingsFor`/`triadQualityOf` from `core/voicings`.
- Produces: default-exported `VoicingControls`; rendered in `App` within shapes mode.

- [ ] **Step 1: Write failing test `src/ui/panels/VoicingControls.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VoicingControls from './VoicingControls';
import { useStore } from '../store';

const initial = useStore.getState();

describe('<VoicingControls />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('shows the Voicing toggle', () => {
    useStore.setState({ quality: 'maj' });
    render(<VoicingControls />);
    expect(screen.getByText('Voicing view')).toBeInTheDocument();
  });

  it('lists one shape button per available CAGED shape when voicing view is on (C major → 5)', () => {
    useStore.setState({ root: 0, quality: 'maj', voicingView: true });
    render(<VoicingControls />);
    expect(screen.getAllByTestId('shape-btn')).toHaveLength(5);
  });

  it('shows no shape buttons for unsupported qualities', () => {
    useStore.setState({ root: 0, quality: 'maj7', voicingView: true });
    render(<VoicingControls />);
    expect(screen.queryAllByTestId('shape-btn')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/ui/panels/VoicingControls.test.tsx`
Expected: FAIL — cannot resolve `./VoicingControls`.

- [ ] **Step 3: Write `src/ui/panels/VoicingControls.tsx`**

```tsx
import { useStore } from '../store';
import { voicingsFor, triadQualityOf } from '../../core/voicings';

export default function VoicingControls() {
  const { root, quality, voicingView, setVoicingView, shapeIndex, setShapeIndex, showGhost, setShowGhost } = useStore();
  const tq = triadQualityOf(quality);
  const voicings = tq ? voicingsFor(root, tq) : [];

  return (
    <div className="sec">
      <div className="sec-label">Voicings</div>
      <div className="tog-row">
        <label className="tog">
          <input type="checkbox" checked={voicingView} onChange={(e) => setVoicingView(e.target.checked)} />
          <span className="tog-t" />
        </label>
        <span className="tog-l">Voicing view</span>
      </div>

      {voicingView && (
        tq ? (
          <>
            <div id="shape-wrap">
              {voicings.map((v, i) => (
                <button
                  key={v.shape}
                  data-testid="shape-btn"
                  className={`fbtn${i === shapeIndex % voicings.length ? ' on' : ''}`}
                  onClick={() => setShapeIndex(i)}
                >
                  {v.shape}-shape{v.baseFret > 0 ? ` (fret ${v.baseFret})` : ' (open)'}
                </button>
              ))}
            </div>
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showGhost} onChange={(e) => setShowGhost(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">Ghost notes</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            Voicings for this chord type are coming soon — showing all notes.
          </div>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/ui/panels/VoicingControls.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire into `src/App.tsx`**

Add the import after the `ShapeControls` import:
```tsx
import VoicingControls from './ui/panels/VoicingControls';
```
Inside the shapes-mode block, add `<VoicingControls />` after `<ShapeControls />`:
```tsx
          {mode === 'shapes' ? (
            <>
              <QualityPicker />
              <ShapeControls />
              <VoicingControls />
            </>
          ) : (
            <IntervalControls />
          )}
```

- [ ] **Step 6: Add minimal CSS for the shape button row to `src/index.css`** (append)

```css
#shape-wrap{display:flex;flex-direction:column;gap:3px}
```

- [ ] **Step 7: Full suite + build**

Run: `npm test` → Expected: PASS.
Run: `npm run build` → Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/ui/panels/VoicingControls.tsx src/ui/panels/VoicingControls.test.tsx src/App.tsx src/index.css
git commit -m "feat(ui): voicing controls panel (view toggle, shape picker, ghost)"
```

---

## Self-Review

**Spec coverage (Phase 2b scope):**
- Render one selected fingered CAGED voicing on the neck → Task 2 (`voicing-dot`, finger labels). ✓
- Ghost overlay of all-notes behind it → Task 2 (`ghost-dot`, dimmed), toggleable → Task 3. ✓
- Navigate CAGED positions (chord-chart-card precursor) → Task 3 shape buttons set `shapeIndex`. ✓
- Only supported qualities voice; others keep the all-notes view → `triadQualityOf` gate (Task 1), fallback path (Task 2), "coming soon" note (Task 3). ✓
- Deferred: mini vertical chord-chart card graphics (`ChordChart.tsx`), 7th/extended voicings (Phase 2c), audio (Phase 4). Noted in Global Constraints.

**Placeholder scan:** No TBD/TODO; every code step has complete code; run steps have exact commands + expected results.

**Type consistency:** `triadQualityOf(quality: string): TriadQuality | null` uses `TriadQuality` from `core/caged` (already imported in `voicings.ts`). Store field/setter names (`voicingView`/`setVoicingView`, `shapeIndex`/`setShapeIndex`, `showGhost`/`setShowGhost`) are identical across `store.ts`, `Fretboard.tsx`, and `VoicingControls.tsx`. `selected.notes` items are `VoicedNote` (`string`,`fret`,`semi`,`finger`) — matches the destructuring in Task 2.
