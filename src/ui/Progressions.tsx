import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { FEATURED, LIBRARY, STYLES, CONCEPTS } from '../content/progressions';
import type { Chord, Progression } from '../core/types';
import { strum } from './sound';
import { chordFreqs } from '../core/audio';
import type { Tempo } from './store';

const ALL: Progression[] = [...FEATURED, ...LIBRARY];

const TEMPO_MS: Record<Tempo, number> = { slow: 1400, med: 900, fast: 550 };
const TEMPOS: Tempo[] = ['slow', 'med', 'fast'];

export default function Progressions() {
  const {
    progId, progStep, setProgId, setProgStep, setRoot, setQuality,
    progFollow, tempo, setProgFollow, setTempo,
  } = useStore();
  const [style, setStyle] = useState('All');
  const [concept, setConcept] = useState('All');
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = ALL.find((p) => p.id === progId) ?? null;
  const shown = ALL.filter(
    (p) => (style === 'All' || p.style === style) && (concept === 'All' || p.concept === concept),
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

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
    strum(chordFreqs(active.chords[i].root, active.chords[i].quality));
  };

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

  return (
    <div id="prog">
      <div className="sec-label">Progressions — the DNA</div>

      <div id="prog-styles">
        {STYLES.map((s) => (
          <button
            key={s}
            data-testid="style-chip"
            className={`spill${s === style ? ' on' : ''}`}
            onClick={() => setStyle(s)}
          >
            {s}
          </button>
        ))}
      </div>

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

      <div id="prog-list">
        {shown.map((p) => (
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
