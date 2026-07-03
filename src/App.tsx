import RootPicker from './ui/panels/RootPicker';
import QualityPicker from './ui/panels/QualityPicker';
import DiatonicTriads from './ui/panels/DiatonicTriads';
import ShapeControls from './ui/panels/ShapeControls';
import VoicingControls from './ui/panels/VoicingControls';
import ChordInfo from './ui/ChordInfo';
import Legend from './ui/Legend';
import Fretboard from './ui/Fretboard';
import Progressions from './ui/Progressions';
import { useStore } from './ui/store';
import { useEffect } from 'react';

export default function App() {
  const { showLabels, setShowLabels, showScale, setShowScale, theme, setTheme } = useStore();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <div id="hdr">
        <div id="logo">Fret<em>DNA</em></div>
        <button
          id="theme-btn"
          onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}
          title="Toggle night mode"
        >
          {theme === 'night' ? '☀ Day' : '☾ Night'}
        </button>
      </div>

      <div id="main">
        <aside id="lp">
          <RootPicker />
          <QualityPicker />
          <DiatonicTriads />
        </aside>

        <div id="ctr">
          <ChordInfo />
          <div id="fb-wrap">
            <Fretboard />
          </div>
          <Legend />
          <Progressions />
        </div>

        <aside id="rp">
          <VoicingControls />
          <div className="sec">
            <div className="sec-label">Scale</div>
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showScale} onChange={(e) => setShowScale(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">Show scale</span>
            </div>
          </div>
          <ShapeControls />
          <div className="sec">
            <div className="sec-label">Labels</div>
            <div className="tog-row">
              <label className="tog">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                <span className="tog-t" />
              </label>
              <span className="tog-l">Interval names</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
