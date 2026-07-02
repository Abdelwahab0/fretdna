import { useStore } from '../store';

const IV_OPTS: { v: number | null; l: string }[] = [
  { v: null, l: 'All' }, { v: 0, l: 'R' }, { v: 2, l: '9' }, { v: 3, l: 'b3' },
  { v: 4, l: '3' }, { v: 5, l: '4' }, { v: 6, l: 'b5' }, { v: 7, l: '5' },
  { v: 8, l: '#5' }, { v: 9, l: '6' }, { v: 10, l: 'b7' }, { v: 11, l: 'Δ7' },
];

export default function IntervalControls() {
  const { hlInterval, setHlInterval } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Highlight</div>
      <div id="iv-grid">
        {IV_OPTS.map(({ v, l }) => (
          <button key={l} className={`ivbtn${hlInterval === v ? ' on' : ''}`} onClick={() => setHlInterval(v)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
