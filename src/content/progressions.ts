import { NOTES } from '../core/theory';
import { QTYPES } from '../core/chords';
import type { Chord, Progression } from '../core/types';

export function chord(root: string, quality: string): Chord {
  const ri = NOTES.indexOf(root as (typeof NOTES)[number]);
  const label = root + (QTYPES[quality]?.l ?? quality);
  return { root: ri, quality, label };
}

const c = chord;

export const FEATURED: Progression[] = [
  { id: 'f1', title: 'Neo-Soul I→IV Float', style: 'Neo-Soul', chords: [c('C','maj9'), c('F','maj9')],
    dna: 'The E (3rd of C) becomes the maj7 of F. Same note, two identities — that shared tone is what makes this progression float.' },
  { id: 'f2', title: 'Gravity Vamp', style: 'Mayer', chords: [c('G','maj7'), c('C','add9')],
    dna: 'I→IV with extensions. The B (3rd of G) floats as the maj7 of C. Resolution that never fully lands.' },
  { id: 'f3', title: 'Purple Haze Chord', style: 'Hendrix', chords: [c('E','s9')],
    dna: 'The #9 (G natural) clashes with the 3rd (G#). Major and minor at once. Maximum tension, minimum movement.' },
  { id: 'f4', title: 'Neo-Soul ii–V–I', style: 'Neo-Soul', chords: [c('D','m9'), c('G','dom9'), c('C','maj9')],
    dna: 'Jazz backbone with extensions. The 9 on ii creates melodic tension that folds beautifully into Imaj9.' },
  { id: 'f5', title: "D'Angelo Drift", style: 'Neo-Soul', chords: [c('E','maj9'), c('D','maj7'), c('A','maj9')],
    dna: "Borrowed bVII gives it a modal quality. Dmaj7 doesn't belong in E major but sounds inevitable." },
  { id: 'f6', title: 'Funk One-Chord Vamp', style: 'Funk', chords: [c('E','dom9')],
    dna: 'One chord. All the work is rhythmic. The 9th (F#) adds shimmer without shifting the harmonic center.' },
  { id: 'f7', title: 'Little Wing', style: 'Hendrix', chords: [c('E','min'), c('G','maj'), c('A','maj'), c('C','maj'), c('D','sus2')],
    dna: 'Guitar acts like a whole band. The Dsus2 is the signature suspension before the cycle repeats.' },
  { id: 'f8', title: 'Neon Progression', style: 'Mayer', chords: [c('B','m7'), c('E','dom7'), c('A','maj7'), c('D','maj')],
    dna: 'ii→V→I→IV in A. The E7→Amaj7 is the emotional core — tension folding into warmth every cycle.' },
  { id: 'f9', title: 'Funk ii–V Loop', style: 'Funk', chords: [c('A','m9'), c('D','dom9')],
    dna: 'Looping ii-V. Add rhythmic displacement and you have the foundation of 70s funk guitar.' },
  { id: 'f10', title: 'iii–VI–ii–V Descent', style: 'Neo-Soul', chords: [c('E','m7'), c('A','m7'), c('D','m7'), c('G','dom7')],
    dna: 'Each chord is the ii of the next. Spirals inward before resolving to the dominant.' },
  { id: 'f11', title: 'Hey Joe Walk', style: 'Hendrix', chords: [c('C','maj'), c('G','maj'), c('D','maj'), c('A','maj'), c('E','maj')],
    dna: 'bVI→bIII→bVII→IV→I. Each chord a perfect 5th down. Pure harmonic gravity.' },
  { id: 'f12', title: 'Slow Dancing', style: 'Mayer', chords: [c('E','m7'), c('A','dom7'), c('D','maj7'), c('G','maj')],
    dna: 'ii→V→I→IV in D. The A7→Dmaj7 resolution is where the emotion lives.' },
  { id: 'f13', title: 'Californication Loop', style: 'Frusciante', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'vi→IV→I→V. Am gives emotional weight, G creates perpetual resolution hunger.' },
  { id: 'f14', title: 'Tritone Sub Move', style: 'Neo-Soul', chords: [c('C','maj7'), c('C#','dom7'), c('F','maj7')],
    dna: 'Db7 substitutes for G7 (tritone away). Its 3rd (F) becomes the root of Fmaj7. Chromatic bass, same function.' },
  { id: 'f15', title: 'Mixolydian Funk', style: 'Funk', chords: [c('G','dom7'), c('F','maj'), c('G','dom7')],
    dna: 'The bVII (F) adds mixolydian flavor. B in G7 moves to Bb then back. Earthy, forever repeatable.' },
  { id: 'f16', title: 'Bold as Love', style: 'Hendrix', chords: [c('A','maj'), c('B','maj'), c('F#','min'), c('D','maj'), c('E','maj')],
    dna: 'The borrowed II (B major instead of Bm) brightens the progression unexpectedly.' },
  { id: 'f17', title: 'Sus2 Landscape', style: 'Neo-Soul', chords: [c('D','sus2'), c('A','sus2'), c('E','sus2')],
    dna: 'No 3rd in any chord — major/minor ambiguity permanently suspended. The whole thing floats.' },
  { id: 'f18', title: 'Under the Bridge', style: 'Frusciante', chords: [c('D','maj'), c('F#','min'), c('E','maj'), c('A','maj'), c('G','maj')],
    dna: 'The F#m as III adds depth before lifting to E. G at the end stretches the modal picture wide.' },
  { id: 'f19', title: 'Parallel Dominants', style: 'Hendrix', chords: [c('D','s9'), c('G','s9')],
    dna: 'Parallel 7#9 chords a 4th apart. No tonal center — pure energy and grit.' },
  { id: 'f20', title: 'By The Way Lift', style: 'Frusciante', chords: [c('F','maj7'), c('A#','maj'), c('C','maj')],
    dna: 'Imaj7→bVII→I: the bVII movement gives that lifted quality before resolving.' },

  // ── Frusciante / RHCP (decode his moves) ──
  { id: 'jf1', title: 'Californication Verse', style: 'Frusciante', chords: [c('A','min'), c('F','maj')],
    dna: 'The whole verse is just vi→IV in C. Frusciante makes two chords hypnotic by moving only the top voice each pass — the Am/F barely shifts underneath while the melody note climbs.' },
  { id: 'jf2', title: 'Dani California Verse', style: 'Frusciante', chords: [c('A','min'), c('G','maj'), c('D','min')],
    dna: 'i→bVII→iv in A minor. The bVII (G) is a borrowed shot of brightness; falling to Dm (iv) keeps it brooding. The RHCP verse engine.' },
  { id: 'jf3', title: 'Otherside Loop', style: 'Frusciante', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'vi→IV→I→V in C — the same four chords as a thousand pop songs. Frusciante sells it by letting the open B and high-E strings ring through all four, so a pedal tone floats on top.' },
  { id: 'jf4', title: 'Frusciante Add9 Jangle', style: 'Frusciante', chords: [c('D','add9'), c('A','add9'), c('G','add9')],
    dna: 'His glassy shimmer: plain triads become add9 by letting an open string ring against the shape. The 9th sits a whole step above the root and rubs against it — that friction is the sheen.' },
  { id: 'jf5', title: 'Frusciante Pentatonic Vamp', style: 'Frusciante', chords: [c('E','maj'), c('A','maj')],
    dna: 'His country-tinged RHCP move: I→IV in E played as major-pentatonic double-stops — sliding 3rds and 6ths between the E and A shapes instead of strumming full chords.' },

  // ── SRV ──
  { id: 'srv1', title: 'SRV Shuffle in E', style: 'SRV', chords: [c('E','dom7'), c('A','dom7'), c('B','dom7')],
    dna: 'A 12-bar in E, all dominant 7ths. The harmony is ordinary blues — what makes it SRV is the raked quarter-note ghost-strums packed between the chords.' },
  { id: 'srv2', title: 'Texas Flood Slow Blues', style: 'SRV', chords: [c('G','dom7'), c('C','dom7'), c('D','dom7')],
    dna: 'Slow 12-bar in G. The IV (C7) hitting on bar 5 is where SRV leans into the vibrato — a b7 in every chord keeps it aching and never quite sweet.' },

  // ── Vulfpeck ──
  { id: 'vulf1', title: 'Vulf Soul Turnaround', style: 'Vulfpeck', chords: [c('C','maj7'), c('A','m7'), c('D','m7'), c('G','dom7')],
    dna: 'I→vi→ii→V, the soul turnaround Vulfpeck lives on. Every chord a clean 7th, every stab on the front of the beat, and — crucially — silence in between. The pocket is the point.' },
  { id: 'vulf2', title: 'Vulf Dorian Pocket', style: 'Vulfpeck', chords: [c('D','m9'), c('G','dom9')],
    dna: 'A ii→V in C that never resolves — it just loops in D dorian. All 9th chords played impossibly tight and quiet; the groove does the harmonic work.' },
];

export const LIBRARY: Progression[] = [
  { id: 'l1', style: 'Funk', title: 'I–IV Funk Vamp', chords: [c('A','dom7'), c('D','dom7')], dna: null },
  { id: 'l2', style: 'Neo-Soul', title: 'Minor ii–V–i', chords: [c('B','m7b5'), c('E','dom7'), c('A','min')], dna: null },
  { id: 'l3', style: 'Funk', title: 'Dorian Vamp', chords: [c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l4', style: 'Hendrix', title: 'I–bVII–IV–I', chords: [c('A','maj'), c('G','maj'), c('D','maj'), c('A','maj')], dna: null },
  { id: 'l5', style: 'Mayer', title: 'I–V–vi–IV', chords: [c('D','maj'), c('A','maj'), c('B','min'), c('G','maj')], dna: null },
  { id: 'l6', style: 'Neo-Soul', title: 'Drop 2 Shell Loop', chords: [c('F','maj7'), c('E','m7'), c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l7', style: 'Frusciante', title: 'RHCP Minor Loop', chords: [c('E','min'), c('F','maj'), c('G','maj')], dna: null },
  { id: 'l8', style: 'Funk', title: 'Chicken Scratch', chords: [c('G','dom9'), c('C','dom9')], dna: null },
  { id: 'l9', style: 'Neo-Soul', title: 'Modal Float', chords: [c('E','m9'), c('A','maj9'), c('D','maj9')], dna: null },
  { id: 'l10', style: 'Mayer', title: 'Lydian Lift', chords: [c('D','maj7'), c('E','maj'), c('D','maj7')], dna: null },
  { id: 'l11', style: 'Hendrix', title: 'Phrygian Dom', chords: [c('E','dom7'), c('F','maj'), c('E','dom7')], dna: null },
  { id: 'l12', style: 'Neo-Soul', title: 'Soul ii–V', chords: [c('C','m9'), c('F','dom9'), c('A#','maj9')], dna: null },
  { id: 'l13', style: 'Hendrix', title: 'Classic 12-Bar', chords: [c('A','dom7'), c('D','dom7'), c('A','dom7'), c('E','dom7')], dna: null },
  { id: 'l14', style: 'Frusciante', title: 'Higher Ground', chords: [c('D#','min'), c('G#','maj'), c('A#','maj')], dna: null },
  { id: 'l15', style: 'Funk', title: 'Scofield Dorian', chords: [c('G','m9'), c('C','dom9')], dna: null },
  { id: 'l16', style: 'Mayer', title: 'vi–IV–I–V', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')], dna: null },
  { id: 'l17', style: 'Neo-Soul', title: 'Dim Turnaround', chords: [c('C','maj7'), c('C#','dim7'), c('D','m7'), c('G','dom7')], dna: null },
  { id: 'l18', style: 'Funk', title: 'One Drop', chords: [c('A','maj'), c('D','maj'), c('E','maj')], dna: null },
  { id: 'l19', style: 'Hendrix', title: 'E Blues', chords: [c('E','dom7'), c('A','dom7'), c('B','dom7')], dna: null },
  { id: 'l20', style: 'Mayer', title: 'Peaceful Walk', chords: [c('G','maj'), c('D','maj'), c('A','m7'), c('C','maj')], dna: null },
];

export const STYLES = ['All', 'Frusciante', 'SRV', 'Vulfpeck', 'Hendrix', 'Neo-Soul', 'Funk', 'Mayer'];
