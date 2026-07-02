import { useStore } from '../store';
import { NOTES } from '../../core/theory';

export default function RootPicker() {
  const { root, setRoot } = useStore();
  return (
    <div className="sec">
      <div className="sec-label">Root</div>
      <div id="root-grid">
        {NOTES.map((n, i) => (
          <button key={n} className={`rbtn${root === i ? ' on' : ''}`} onClick={() => setRoot(i)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
