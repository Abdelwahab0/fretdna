import { useStore } from './store';
import { NOTES, S_NAMES, SC, ICOLORS, intervalName } from '../core/theory';
import {
  getDots, sy, fcx, flx, BOARD, BOARD_NIGHT, SW, INLAYS,
  VW, VH, NX, PT, PB, FMAX,
} from '../core/fretboard';
import { voicingsFor, shapeQualityOf, voicingSpan } from '../core/voicings';
import { getScaleDots, SCALE_DEGREE } from '../core/scales';
import { triadTonesInWindow } from '../core/diatonic';
import { getChordIntervals } from '../core/chords';

const DOT_R = 13;
const ROOT_R = 15;
const GHOST_R = 10;

export default function Fretboard() {
  const { root, quality, mode, voicing, stringSet, hlInterval, showLabels, voicingView, shapeIndex, showGhost, showBox, showAllPositions, showScale, triadsInBox, triadDegree, theme } = useStore();
  const board = theme === 'night' ? BOARD_NIGHT : BOARD;
  const stringGap = sy(1) - sy(0);
  const my = PT + ((SC - 1) * stringGap) / 2;

  const tq = mode === 'shapes' && voicingView ? shapeQualityOf(quality) : null;
  const voicings = tq ? voicingsFor(root, tq) : [];
  const selected = voicings.length ? voicings[shapeIndex % voicings.length] : null;

  // CAGED position box geometry. Show all positions, or just the selected one.
  const boxTop = sy(0) - stringGap * 0.6;
  const boxBottom = sy(SC - 1) + stringGap * 0.6;
  const boxStroke = theme === 'night' ? 'rgba(79,195,247,0.6)' : 'rgba(176,104,24,0.55)';
  const boxFill = theme === 'night' ? 'rgba(79,195,247,0.09)' : 'rgba(176,104,24,0.08)';
  const boxList = (showAllPositions ? voicings : selected ? [selected] : []).map((v, i) => {
    const sp = voicingSpan(v);
    return {
      shape: v.shape,
      isSel: v === selected,
      left: sp.minFret === 0 ? NX + 2 : flx(sp.minFret - 1),
      right: flx(sp.maxFret),
      labelY: boxTop + 15 + (i % 2) * 15, // stagger labels so overlapping boxes stay readable
    };
  });

  // Dots for the classic all-notes view (also used as the ghost overlay).
  const allDots = getDots({ mode, root, quality, voicing, stringSet, hlInterval });

  // Scale overlay: full parent-scale tones (chord tones flagged), when no voicing is selected.
  const scaleDots = !selected && showScale ? getScaleDots(root, quality, getChordIntervals(quality)) : [];

  // Triads-in-position: the selected diatonic triad's tones inside the current box window.
  const triadBox =
    selected && triadsInBox && triadDegree != null
      ? triadTonesInWindow(root, quality, triadDegree, voicingSpan(selected).minFret, voicingSpan(selected).maxFret)
      : [];

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
          {showBox && boxList.map((b) => (
            <g key={`box${b.shape}`}>
              <rect x={b.left} y={boxTop} width={b.right - b.left} height={boxBottom - boxTop} rx={9}
                fill={b.isSel ? boxFill : 'none'} stroke={boxStroke} strokeWidth={b.isSel ? 2.5 : 1.2}
                strokeOpacity={b.isSel ? 1 : 0.45} />
              <text x={b.left + 8} y={b.labelY} fontSize={12} fontFamily="Space Grotesk, sans-serif"
                fontWeight={600} fill={boxStroke} fillOpacity={b.isSel ? 1 : 0.55}>
                {b.shape}
              </text>
            </g>
          ))}
          {triadBox.length ? (
            triadBox.map(({ s, f, note, inTriad, triadSemi }) => {
              const cx = fcx(f), cy = sy(s);
              const color = inTriad ? (ICOLORS[triadSemi] ?? '#888') : (theme === 'night' ? '#48597C' : '#B4AB96');
              const r = inTriad ? (triadSemi === 0 ? ROOT_R : DOT_R) : 9;
              return (
                <g key={`tb${s}-${f}`} data-testid="triad-box-dot" transform={`translate(${cx},${cy})`}>
                  <g className="nd">
                    {inTriad && triadSemi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
                    <circle cx={0} cy={0} r={r} fill={color} opacity={inTriad ? 0.95 : 0.5} />
                    <text x={0} y={4} textAnchor="middle" fontSize={inTriad ? 11 : 8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={inTriad ? 600 : 500}>
                      {showLabels ? (triadSemi === 0 ? 'R' : triadSemi === 3 || triadSemi === 4 ? '3' : '5') : NOTES[note]}
                    </text>
                  </g>
                </g>
              );
            })
          ) : null}
          {!triadBox.length && showGhost && allDots.map(({ s, f, semi }) => (
            <circle key={`gh${s}-${f}`} data-testid="ghost-dot" cx={fcx(f)} cy={sy(s)} r={GHOST_R}
              fill={ICOLORS[semi] ?? '#888'} opacity={theme === 'night' ? 0.2 : 0.14} />
          ))}
          {!triadBox.length && selected.notes.map(({ string, fret, semi, finger }) => {
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
      ) : scaleDots.length ? (
        /* Scale overlay: chord tones colored, passing tones muted */
        scaleDots.map(({ s, f, semi, note, inChord }) => {
          const cx = fcx(f), cy = sy(s);
          const color = inChord ? (ICOLORS[semi] ?? '#888') : (theme === 'night' ? '#48597C' : '#B4AB96');
          const r = inChord ? (semi === 0 ? ROOT_R : DOT_R) : 9;
          return (
            <g key={`sc${s}-${f}`} transform={`translate(${cx},${cy})`}>
              <g className="nd">
                {inChord && semi === 0 && <circle cx={0} cy={0} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />}
                <circle cx={0} cy={0} r={r} fill={color} opacity={inChord ? 0.95 : 0.55} />
                <text x={0} y={4} textAnchor="middle" fontSize={inChord ? 11 : 8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={inChord ? 600 : 500}>
                  {showLabels ? SCALE_DEGREE[semi] : NOTES[note]}
                </text>
              </g>
            </g>
          );
        })
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
