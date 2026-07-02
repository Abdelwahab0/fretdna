import { useStore } from './store';
import { NOTES, INAMES, intervalName } from '../core/theory';
import { QTYPES, getChordIntervals, chipKind } from '../core/chords';

export default function ChordInfo() {
  const { root, quality, mode, voicing, hlInterval } = useStore();
  const rn = NOTES[root];
  const ql = mode === 'intervals'
    ? `${hlInterval === null ? 'all' : intervalName(hlInterval)} intervals`
    : QTYPES[quality]?.l ?? quality;

  return (
    <div id="cinfo">
      <div id="cname">{rn}{ql}</div>
      <div id="ctones">
        {mode === 'shapes' &&
          getChordIntervals(quality, voicing).map((semi) => {
            const ni = (root + semi) % 12;
            return (
              <div key={semi} className={`chip chip-${chipKind(semi)}`}>
                <span style={{ fontSize: 9, opacity: 0.6 }}>{INAMES[semi]}</span> {NOTES[ni]}
              </div>
            );
          })}
      </div>
    </div>
  );
}
