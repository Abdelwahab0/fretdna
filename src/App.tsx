import { useEffect } from 'react';
import ModeTabs from './ui/ModeTabs';
import RootPicker from './ui/panels/RootPicker';
import QualityPicker from './ui/panels/QualityPicker';
import ShapeControls from './ui/panels/ShapeControls';
import IntervalControls from './ui/panels/IntervalControls';
import ChordInfo from './ui/ChordInfo';
import Legend from './ui/Legend';
import Fretboard from './ui/Fretboard';
import { useStore } from './ui/store';

export default function App() {
  const { mode, showLabels, setShowLabels } = useStore();

  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);

  return (
    <>
      <div id="hdr">
        <div id="logo">Fret<em>DNA</em></div>
        <ModeTabs />
      </div>

      <div id="main">
        <aside id="lp">
          <RootPicker />
          {mode === 'shapes' ? (
            <>
              <QualityPicker />
              <ShapeControls />
            </>
          ) : (
            <IntervalControls />
          )}
          <div className="sec">
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">Show intervals</span>
            </div>
          </div>
        </aside>

        <div id="ctr">
          <ChordInfo />
          <div id="fb-wrap">
            <Fretboard />
          </div>
          <Legend />
        </div>
      </div>
    </>
  );
}
