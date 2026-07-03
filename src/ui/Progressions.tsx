import { useStore } from './store';
import { FEATURED, LIBRARY } from '../content/progressions';
import type { Chord, Progression } from '../core/types';

const ALL: Progression[] = [...FEATURED, ...LIBRARY];

export default function Progressions() {
  const { progId, progStep, setProgId, setProgStep, setRoot, setQuality } = useStore();
  const active = ALL.find((p) => p.id === progId) ?? null;

  const loadChord = (c: Chord) => {
    setRoot(c.root);
    setQuality(c.quality);
  };

  const selectProg = (p: Progression) => {
    setProgId(p.id);
    setProgStep(0);
    loadChord(p.chords[0]);
  };

  const step = (i: number) => {
    if (!active) return;
    setProgStep(i);
    loadChord(active.chords[i]);
  };

  return (
    <div id="prog">
      <div className="sec-label">Progressions — the DNA</div>

      <div id="prog-list">
        {ALL.map((p) => (
          <button
            key={p.id}
            data-testid="prog-chip"
            className={`prog-chip${p.id === progId ? ' on' : ''}`}
            onClick={() => selectProg(p)}
          >
            <span className="prog-title">{p.title}</span>
            <span className="prog-style">{p.style}</span>
          </button>
        ))}
      </div>

      {active && (
        <div id="prog-active">
          <div id="prog-steps">
            {active.chords.map((c, i) => (
              <button
                key={i}
                data-testid="prog-step"
                className={`lc${i === progStep ? ' on' : ''}`}
                onClick={() => step(i)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {active.dna && (
            <p id="prog-dna">
              <span className="dna-tag">DNA</span>
              {active.dna}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
