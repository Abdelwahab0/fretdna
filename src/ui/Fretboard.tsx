import { useStore } from './store';
import { NOTES, S_NAMES, SC, ICOLORS, intervalName } from '../core/theory';
import {
  getDots, sy, fcx, flx, BOARD, BOARD_NIGHT, SW, INLAYS,
  VW, VH, NX, PT, PB, FMAX,
} from '../core/fretboard';
import { voicingsFor, triadQualityOf } from '../core/voicings';

const DOT_R = 13;
const ROOT_R = 15;
const GHOST_R = 10;

export default function Fretboard() {
  const { root, quality, mode, voicing, stringSet, hlInterval, showLabels, voicingView, shapeIndex, showGhost, theme } = useStore();
  const board = theme === 'night' ? BOARD_NIGHT : BOARD;
  const my = PT + ((SC - 1) * (sy(1) - sy(0))) / 2;

  const tq = mode === 'shapes' && voicingView ? triadQualityOf(quality) : null;
  const voicings = tq ? voicingsFor(root, tq) : [];
  const selected = voicings.length ? voicings[shapeIndex % voicings.length] : null;

  // Dots for the classic all-notes view (also used as the ghost overlay).
  const allDots = getDots({ mode, root, quality, voicing, stringSet, hlInterval });

  return (
    <svg data-testid="fretboard" id="fb" viewBox={`0 0 ${VW} ${VH}`} xmlns="http://www.w3.org/2000/svg">
      {/* wood */}
      <rect x={NX} y={0} width={VW - NX} height={VH} fill={board.wood} />
      {/* grain */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = (VH / 12) * i + 1;
        return <line key={`g${i}`} x1={NX} y1={y} x2={VW} y2={y} stroke={board.grain} strokeWidth={1.2} />;
      })}
      {/* inlays */}
      {INLAYS.map((f) => {
        const cx = flx(f - 1) + (flx(1) - flx(0)) / 2;
        if (f === 12) {
          const g = (sy(1) - sy(0)) * 0.9;
          return (
            <g key={`in${f}`}>
              <circle cx={cx} cy={my - g / 2} r={5.5} fill={board.inlay} />
              <circle cx={cx} cy={my + g / 2} r={5.5} fill={board.inlay} />
            </g>
          );
        }
        return <circle key={`in${f}`} cx={cx} cy={my} r={5.5} fill={board.inlay} />;
      })}
      {/* strings */}
      {Array.from({ length: SC }, (_, s) => (
        <line key={`s${s}`} x1={NX} y1={sy(s)} x2={VW - 2} y2={sy(s)} stroke={board.string} strokeWidth={SW[s]} opacity={0.8} />
      ))}
      {/* nut */}
      <rect x={NX} y={PT - 5} width={6} height={(SC - 1) * (sy(1) - sy(0)) + 10} fill={board.nut} rx={1} />
      {/* frets */}
      {Array.from({ length: FMAX }, (_, i) => {
        const f = i + 1;
        return <line key={`f${f}`} x1={flx(f)} y1={PT - 2} x2={flx(f)} y2={VH - PB + 2} stroke={board.fret} strokeWidth={1.6} />;
      })}
      {/* string labels */}
      {Array.from({ length: SC }, (_, s) => (
        <text key={`sl${s}`} x={NX - 8} y={sy(s) + 4} textAnchor="end" fontSize={13} fontFamily="JetBrains Mono, monospace" fill={board.label}>
          {S_NAMES[s]}
        </text>
      ))}
      {/* fret numbers */}
      {Array.from({ length: FMAX }, (_, i) => i + 1).filter((f) => f % 2 === 1).map((f) => (
        <text key={`fn${f}`} x={fcx(f)} y={VH - 6} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={board.fretNum}>
          {f}
        </text>
      ))}
      <text x={fcx(0)} y={VH - 6} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={board.fretNum}>O</text>

      {/* Voicing path: ghost overlay (optional) + selected fingered voicing */}
      {selected ? (
        <>
          {showGhost && allDots.map(({ s, f, semi }) => (
            <circle key={`gh${s}-${f}`} data-testid="ghost-dot" cx={fcx(f)} cy={sy(s)} r={GHOST_R}
              fill={ICOLORS[semi] ?? '#888'} opacity={theme === 'night' ? 0.2 : 0.14} />
          ))}
          {selected.notes.map(({ string, fret, semi, finger }) => {
            const cx = fcx(fret), cy = sy(string);
            const color = ICOLORS[semi] ?? '#888';
            const r = semi === 0 ? ROOT_R : DOT_R;
            return (
              <g key={`v${string}-${fret}`} transform={`translate(${cx},${cy})`}>
                <g className="nd">
                  {semi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
                  <circle data-testid="voicing-dot" cx={0} cy={0} r={r} fill={color} opacity={semi === 0 ? 1 : 0.92} />
                  <text x={0} y={4} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={600}>
                    {showLabels ? (finger === 0 ? '0' : String(finger)) : NOTES[(root + semi) % 12]}
                  </text>
                </g>
              </g>
            );
          })}
        </>
      ) : (
        /* Classic all-notes view */
        allDots.map(({ s, f, semi, note, delay }) => {
          const cx = fcx(f), cy = sy(s);
          const color = ICOLORS[semi] ?? '#888';
          const r = semi === 0 ? ROOT_R : DOT_R;
          return (
            <g key={`d${s}-${f}`} transform={`translate(${cx},${cy})`}>
              <g className="nd" style={{ animationDelay: `${delay}ms` }}>
                {semi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
                <circle data-testid="dot" cx={0} cy={0} r={r} fill={color} opacity={semi === 0 ? 1 : 0.92} />
                <text x={0} y={4} textAnchor="middle" fontSize={semi === 0 ? 11 : 10} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={500}>
                  {showLabels ? intervalName(semi) : NOTES[note]}
                </text>
              </g>
            </g>
          );
        })
      )}
    </svg>
  );
}
