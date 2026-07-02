import { useStore } from '../store';
import { diatonicTriads } from '../../core/diatonic';

export default function DiatonicTriads() {
  const { root, quality, setRoot, setQuality } = useStore();
  const triads = diatonicTriads(root, quality);
  if (!triads.length) return null;

  return (
    <div className="sec">
      <div className="sec-label">Diatonic triads</div>
      <div id="tri-wrap">
        {triads.map((t) => (
          <button
            key={t.roman}
            data-testid="triad-btn"
            className={`fbtn${t.root === root && (t.quality === quality) ? ' on' : ''}`}
            onClick={() => { setRoot(t.root); setQuality(t.quality); }}
          >
            <span style={{ opacity: 0.55, marginRight: 8, fontFamily: 'JetBrains Mono, monospace' }}>{t.roman}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
