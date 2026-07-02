import { useStore } from '../store';
import { QTYPES } from '../../core/chords';

export default function QualityPicker() {
  const { quality, setQuality } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Quality</div>
      <div id="qual-grid">
        {Object.entries(QTYPES).map(([k, v]) => (
          <button key={k} className={`qbtn${quality === k ? ' on' : ''}`} onClick={() => setQuality(k)}>
            {v.l}
          </button>
        ))}
      </div>
    </div>
  );
}
