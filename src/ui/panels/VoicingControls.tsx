import { useStore } from '../store';
import { voicingsFor, triadQualityOf } from '../../core/voicings';

export default function VoicingControls() {
  const { root, quality, voicingView, setVoicingView, shapeIndex, setShapeIndex, showGhost, setShowGhost, showBox, setShowBox, showAllPositions, setShowAllPositions } = useStore();
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
                <input type="checkbox" checked={showBox} onChange={(e) => setShowBox(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">CAGED box</span>
            </div>
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showAllPositions} onChange={(e) => setShowAllPositions(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">All positions</span>
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
