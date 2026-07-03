import { useStore } from './store';
import { chordFreqs, stringFretToFreq } from '../core/audio';
import { voicingsFor, shapeQualityOf } from '../core/voicings';

/**
 * Frequencies for the notes currently shown on the neck, ordered low string ->
 * high string (i.e. natural downstrum order). If a CAGED voicing is selected,
 * uses its fretted notes; otherwise falls back to the chord's tones.
 */
export function useAudibleNotes(): number[] {
  const { root, quality, mode, voicingView, shapeIndex } = useStore();
  const tq = mode === 'shapes' && voicingView ? shapeQualityOf(quality) : null;
  if (tq) {
    const vs = voicingsFor(root, tq);
    const v = vs.length ? vs[shapeIndex % vs.length] : null;
    if (v) {
      return [...v.notes]
        .sort((a, b) => b.string - a.string) // string 5 (low E) first
        .map((n) => stringFretToFreq(n.string, n.fret));
    }
  }
  return chordFreqs(root, quality);
}
