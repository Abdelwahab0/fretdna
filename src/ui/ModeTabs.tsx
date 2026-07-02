import { useStore } from './store';
import type { Mode } from '../core/types';

const MODES: { m: Mode; label: string }[] = [
  { m: 'shapes', label: 'Shapes' },
  { m: 'intervals', label: 'Intervals' },
];

export default function ModeTabs() {
  const { mode, setMode } = useStore();
  return (
    <div id="tabs">
      {MODES.map(({ m, label }) => (
        <button key={m} className={`tab${mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>
          {label}
        </button>
      ))}
    </div>
  );
}
