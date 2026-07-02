import {
  shapeAt,
  MAJOR_SHAPE_ORDER,
  MINOR_SHAPE_ORDER,
  type CagedShape,
  type TriadQuality,
  type ShapeNote,
} from './caged';

export interface VoicedNote extends ShapeNote {
  finger: 0 | 1 | 2 | 3 | 4; // 0 = played open
}

export interface Voicing {
  root: number;
  quality: TriadQuality;
  shape: CagedShape;
  baseFret: number;
  notes: VoicedNote[];
}

/**
 * Assign fingers with a simple, deterministic heuristic:
 * - Open chord (baseFret 0): fret 0 = open (finger 0); each higher distinct
 *   fret gets the next finger (1,2,3,4) in ascending fret order.
 * - Barre (baseFret > 0): every note at baseFret shares finger 1 (the barre);
 *   each higher distinct fret gets 2,3,4 in ascending order.
 * Finger numbers are capped at 4.
 */
export function assignFingers(baseFret: number, notes: ShapeNote[]): VoicedNote[] {
  const distinctAscending = (min: number) =>
    [...new Set(notes.filter((n) => n.fret > min).map((n) => n.fret))].sort((a, b) => a - b);

  if (baseFret === 0) {
    const fretted = distinctAscending(0);
    const fingerOf = new Map<number, number>();
    fretted.forEach((f, i) => fingerOf.set(f, Math.min(i + 1, 4)));
    return notes.map((n) => ({
      ...n,
      finger: (n.fret === 0 ? 0 : fingerOf.get(n.fret)!) as 0 | 1 | 2 | 3 | 4,
    }));
  }

  const higher = distinctAscending(baseFret);
  const fingerOf = new Map<number, number>();
  higher.forEach((f, i) => fingerOf.set(f, Math.min(i + 2, 4)));
  return notes.map((n) => ({
    ...n,
    finger: (n.fret === baseFret ? 1 : fingerOf.get(n.fret)!) as 0 | 1 | 2 | 3 | 4,
  }));
}

/** All playable CAGED voicings for a triad, in canonical CAGED order. */
export function voicingsFor(root: number, quality: TriadQuality): Voicing[] {
  const order = quality === 'maj' ? MAJOR_SHAPE_ORDER : MINOR_SHAPE_ORDER;
  const out: Voicing[] = [];
  for (const shape of order) {
    const res = shapeAt(root, shape, quality);
    if (!res) continue;
    out.push({
      root,
      quality,
      shape,
      baseFret: res.baseFret,
      notes: assignFingers(res.baseFret, res.notes),
    });
  }
  return out;
}

/** Map an app chord-quality key to the triad this plan can voice, or null. */
export function triadQualityOf(quality: string): TriadQuality | null {
  if (quality === 'maj') return 'maj';
  if (quality === 'min') return 'min';
  return null;
}
