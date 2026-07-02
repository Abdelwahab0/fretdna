import { useStore } from '../store';
import type { StringSet } from '../../core/types';
import type { Voicing } from '../../core/chords';

const STRING_SET_OPTS: { v: StringSet; l: string }[] = [
  { v: 'all', l: 'All strings' },
  { v: '123', l: 'Strings 1-2-3  (e B G)' },
  { v: '234', l: 'Strings 2-3-4  (B G D)' },
  { v: '345', l: 'Strings 3-4-5  (G D A)' },
  { v: '456', l: 'Strings 4-5-6  (D A E)' },
];

const VOICING_OPTS: { v: Voicing; l: string }[] = [
  { v: 'standard', l: 'Standard' },
  { v: 'shell', l: 'Shell (3 + 7)' },
  { v: 'rootless', l: 'Rootless' },
];

export default function ShapeControls() {
  const { stringSet, setStringSet, voicing, setVoicing } = useStore();
  return (
    <>
      <div className="sec">
        <div className="sec-label">String Set</div>
        <div id="ss-wrap">
          {STRING_SET_OPTS.map(({ v, l }) => (
            <button key={v} className={`fbtn${stringSet === v ? ' on' : ''}`} onClick={() => setStringSet(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="sec">
        <div className="sec-label">Voicing</div>
        <div id="vc-wrap">
          {VOICING_OPTS.map(({ v, l }) => (
            <button key={v} className={`fbtn${voicing === v ? ' on' : ''}`} onClick={() => setVoicing(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
