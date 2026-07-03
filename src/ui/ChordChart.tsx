import { SC, ICOLORS } from '../core/theory';
import { voicingSpan, type Voicing } from '../core/voicings';

// A compact vertical chord-box diagram for a single voicing.
// Strings run left→right as low-E … high-e (conventional chord-chart order).
const W = 82, H = 104;
const PADX = 11, TOP = 20, BOT = 10;
const NROWS = 5;

interface Props {
  voicing: Voicing;
  selected: boolean;
  onClick: () => void;
}

export default function ChordChart({ voicing, selected, onClick }: Props) {
  const { minFret } = voicingSpan(voicing);
  const open = minFret === 0;
  // First fret row represents: open position → fret 1; barre → the barre fret.
  const windowFirst = open ? 1 : minFret;

  const colGap = (W - 2 * PADX) / (SC - 1);
  const gridTop = TOP + 4;
  const gridBottom = H - BOT;
  const rowGap = (gridBottom - gridTop) / NROWS;
  const stringX = (dispCol: number) => PADX + dispCol * colGap;
  const rowCenterY = (row: number) => gridTop + row * rowGap + rowGap / 2;
  // low-E (string 5) on the left → display column 0
  const colOf = (string: number) => SC - 1 - string;

  const played = new Set(voicing.notes.map((n) => n.string));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className={`chord-chart${selected ? ' on' : ''}`}
      data-testid="chord-chart"
      aria-label={`${voicing.shape}-shape`}
    >
      {/* card background */}
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={7}
        fill="var(--panel2)" stroke={selected ? 'var(--accent)' : 'var(--border)'} strokeWidth={selected ? 2 : 1} />

      {/* fret-position label for barre shapes */}
      {!open && (
        <text x={PADX - 7} y={rowCenterY(0) + 3} textAnchor="end" fontSize={8}
          fontFamily="JetBrains Mono, monospace" fill="var(--dim)">{minFret}fr</text>
      )}

      {/* open/muted markers above the nut */}
      {Array.from({ length: SC }, (_, s) => {
        const x = stringX(colOf(s));
        const isPlayed = played.has(s);
        const isOpen = open && voicing.notes.some((n) => n.string === s && n.fret === 0);
        const mark = !isPlayed ? '×' : isOpen ? '○' : '';
        return mark ? (
          <text key={`m${s}`} x={x} y={TOP - 4} textAnchor="middle" fontSize={9}
            fontFamily="JetBrains Mono, monospace" fill="var(--dim)">{mark}</text>
        ) : null;
      })}

      {/* nut (open position) */}
      {open && <rect x={PADX - 2} y={gridTop - 2.5} width={(SC - 1) * colGap + 4} height={2.5} fill="var(--text)" rx={1} />}

      {/* strings (vertical) */}
      {Array.from({ length: SC }, (_, i) => (
        <line key={`v${i}`} x1={stringX(i)} y1={gridTop} x2={stringX(i)} y2={gridBottom} stroke="var(--border2)" strokeWidth={1} />
      ))}
      {/* frets (horizontal) */}
      {Array.from({ length: NROWS + 1 }, (_, r) => (
        <line key={`h${r}`} x1={PADX} y1={gridTop + r * rowGap} x2={W - PADX} y2={gridTop + r * rowGap} stroke="var(--border2)" strokeWidth={1} />
      ))}

      {/* finger dots */}
      {voicing.notes.filter((n) => n.fret > 0).map((n) => {
        const row = n.fret - windowFirst;
        if (row < 0 || row >= NROWS) return null;
        const cx = stringX(colOf(n.string));
        const cy = rowCenterY(row);
        return (
          <g key={`d${n.string}`}>
            <circle cx={cx} cy={cy} r={7} fill={ICOLORS[n.semi] ?? '#888'} />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={600}>
              {n.finger}
            </text>
          </g>
        );
      })}

      {/* shape label */}
      <text x={W / 2} y={H - 1.5} textAnchor="middle" fontSize={8.5} fontFamily="Space Grotesk, sans-serif"
        fontWeight={600} fill={selected ? 'var(--accent)' : 'var(--dim)'}>
        {voicing.shape}-shape
      </text>
    </svg>
  );
}
