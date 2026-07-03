import { useStore } from '../store';
import { diatonicTriads } from '../../core/diatonic';
import { strum } from '../sound';
import { chordFreqs } from '../../core/audio';

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
                strum(chordFreqs(t.root, t.quality));
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
