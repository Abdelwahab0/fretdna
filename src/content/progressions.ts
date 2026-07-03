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
  { id: 'f1', title: 'Neo-Soul I→IV Float', style: 'Neo-Soul', concept: 'Shared tones', chords: [c('C','maj9'), c('F','maj9')],
    dna: 'The E (3rd of C) becomes the maj7 of F. Same note, two identities — that shared tone is what makes this progression float.' },
  { id: 'f2', title: 'Gravity Vamp', style: 'Mayer', concept: 'Shared tones', chords: [c('G','maj7'), c('C','add9')],
    dna: 'I→IV with extensions. The B (3rd of G) floats as the maj7 of C. Resolution that never fully lands.' },
  { id: 'f3', title: 'Purple Haze Chord', style: 'Hendrix', concept: 'Chromatic moves', chords: [c('E','s9')],
    dna: 'The #9 (G natural) clashes with the 3rd (G#). Major and minor at once. Maximum tension, minimum movement.' },
  { id: 'f4', title: 'Neo-Soul ii–V–I', style: 'Neo-Soul', concept: 'ii–V family', chords: [c('D','m9'), c('G','dom9'), c('C','maj9')],
    dna: 'Jazz backbone with extensions. The 9 on ii creates melodic tension that folds beautifully into Imaj9.' },
  { id: 'f5', title: "D'Angelo Drift", style: 'Neo-Soul', concept: 'Borrowed chords', chords: [c('E','maj9'), c('D','maj7'), c('A','maj9')],
    dna: "Borrowed bVII gives it a modal quality. Dmaj7 doesn't belong in E major but sounds inevitable." },
  { id: 'f6', title: 'Funk One-Chord Vamp', style: 'Funk', concept: 'Modal vamp', chords: [c('E','dom9')],
    dna: 'One chord. All the work is rhythmic. The 9th (F#) adds shimmer without shifting the harmonic center.' },
  { id: 'f7', title: 'Little Wing', style: 'Hendrix', concept: 'Suspensions & add9', chords: [c('E','min'), c('G','maj'), c('A','maj'), c('C','maj'), c('D','sus2')],
    dna: 'Guitar acts like a whole band. The Dsus2 is the signature suspension before the cycle repeats.' },
  { id: 'f8', title: 'Neon Progression', style: 'Mayer', concept: 'ii–V family', chords: [c('B','m7'), c('E','dom7'), c('A','maj7'), c('D','maj')],
    dna: 'ii→V→I→IV in A. The E7→Amaj7 is the emotional core — tension folding into warmth every cycle.' },
  { id: 'f9', title: 'Funk ii–V Loop', style: 'Funk', concept: 'ii–V family', chords: [c('A','m9'), c('D','dom9')],
    dna: 'Looping ii-V. Add rhythmic displacement and you have the foundation of 70s funk guitar.' },
  { id: 'f10', title: 'iii–VI–ii–V Descent', style: 'Neo-Soul', concept: 'ii–V family', chords: [c('E','m7'), c('A','m7'), c('D','m7'), c('G','dom7')],
    dna: 'Each chord is the ii of the next. Spirals inward before resolving to the dominant.' },
  { id: 'f11', title: 'Hey Joe Walk', style: 'Hendrix', concept: 'Borrowed chords', chords: [c('C','maj'), c('G','maj'), c('D','maj'), c('A','maj'), c('E','maj')],
    dna: 'bVI→bIII→bVII→IV→I. Each chord a perfect 5th down. Pure harmonic gravity.' },
  { id: 'f12', title: 'Slow Dancing', style: 'Mayer', concept: 'ii–V family', chords: [c('E','m7'), c('A','dom7'), c('D','maj7'), c('G','maj')],
    dna: 'ii→V→I→IV in D. The A7→Dmaj7 resolution is where the emotion lives.' },
  { id: 'f13', title: 'Californication Loop', style: 'Frusciante', concept: 'Pop loop', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'vi→IV→I→V. Am gives emotional weight, G creates perpetual resolution hunger.' },
  { id: 'f14', title: 'Tritone Sub Move', style: 'Neo-Soul', concept: 'Chromatic moves', chords: [c('C','maj7'), c('C#','dom7'), c('F','maj7')],
    dna: 'Db7 substitutes for G7 (tritone away). Its 3rd (F) becomes the root of Fmaj7. Chromatic bass, same function.' },
  { id: 'f15', title: 'Mixolydian Funk', style: 'Funk', concept: 'Modal vamp', chords: [c('G','dom7'), c('F','maj'), c('G','dom7')],
    dna: 'The bVII (F) adds mixolydian flavor. B in G7 moves to Bb then back. Earthy, forever repeatable.' },
  { id: 'f16', title: 'Bold as Love', style: 'Hendrix', concept: 'Borrowed chords', chords: [c('A','maj'), c('B','maj'), c('F#','min'), c('D','maj'), c('E','maj')],
    dna: 'The borrowed II (B major instead of Bm) brightens the progression unexpectedly.' },
  { id: 'f17', title: 'Sus2 Landscape', style: 'Neo-Soul', concept: 'Suspensions & add9', chords: [c('D','sus2'), c('A','sus2'), c('E','sus2')],
    dna: 'No 3rd in any chord — major/minor ambiguity permanently suspended. The whole thing floats.' },
  { id: 'f18', title: 'Under the Bridge', style: 'Frusciante', concept: 'Borrowed chords', chords: [c('D','maj'), c('F#','min'), c('E','maj'), c('A','maj'), c('G','maj')],
    dna: 'The F#m as III adds depth before lifting to E. G at the end stretches the modal picture wide.' },
  { id: 'f19', title: 'Parallel Dominants', style: 'Hendrix', concept: 'Chromatic moves', chords: [c('D','s9'), c('G','s9')],
    dna: 'Parallel 7#9 chords a 4th apart. No tonal center — pure energy and grit.' },
  { id: 'f20', title: 'By The Way Lift', style: 'Frusciante', concept: 'Borrowed chords', chords: [c('F','maj7'), c('A#','maj'), c('C','maj')],
    dna: 'Imaj7→bVII→I: the bVII movement gives that lifted quality before resolving.' },

  // ── Frusciante / RHCP (decode his moves) ──
  { id: 'jf1', title: 'Californication Verse', style: 'Frusciante', concept: 'Shared tones', chords: [c('A','min'), c('F','maj')],
    dna: 'The whole verse is just vi→IV in C. Frusciante makes two chords hypnotic by moving only the top voice each pass — the Am/F barely shifts underneath while the melody note climbs.' },
  { id: 'jf2', title: 'Dani California Verse', style: 'Frusciante', concept: 'Borrowed chords', chords: [c('A','min'), c('G','maj'), c('D','min')],
    dna: 'i→bVII→iv in A minor. The bVII (G) is a borrowed shot of brightness; falling to Dm (iv) keeps it brooding. The RHCP verse engine.' },
  { id: 'jf3', title: 'Otherside Loop', style: 'Frusciante', concept: 'Pop loop', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'vi→IV→I→V in C — the same four chords as a thousand pop songs. Frusciante sells it by letting the open B and high-E strings ring through all four, so a pedal tone floats on top.' },
  { id: 'jf4', title: 'Frusciante Add9 Jangle', style: 'Frusciante', concept: 'Suspensions & add9', chords: [c('D','add9'), c('A','add9'), c('G','add9')],
    dna: 'His glassy shimmer: plain triads become add9 by letting an open string ring against the shape. The 9th sits a whole step above the root and rubs against it — that friction is the sheen.' },
  { id: 'jf5', title: 'Frusciante Pentatonic Vamp', style: 'Frusciante', concept: 'Modal vamp', chords: [c('E','maj'), c('A','maj')],
    dna: 'His country-tinged RHCP move: I→IV in E played as major-pentatonic double-stops — sliding 3rds and 6ths between the E and A shapes instead of strumming full chords.' },

  // ── More Frusciante / RHCP devices ──
  { id: 'jf6', title: 'Snow (Hey Oh) Cycle', style: 'Frusciante', concept: 'Pop loop', chords: [c('C#','min'), c('A','maj'), c('E','maj'), c('B','maj')],
    dna: 'vi→IV→I→V in E, but played as a fast fingerpicked arpeggio cycle. The high E and B strings ring open through every chord, so a single pedal tone floats over the whole spinning figure.' },
  { id: 'jf7', title: "Can't Stop Vamp", style: 'Frusciante', concept: 'Modal vamp', chords: [c('E','min'), c('D','maj')],
    dna: 'i→bVII in E minor, but the harmony barely matters — it is all muted 16th-note stabs. Frusciante turns two chords into a rhythm part, harmony used as percussion.' },
  { id: 'jf8', title: 'Scar Tissue Sixths', style: 'Frusciante', concept: 'Shared tones', chords: [c('F','maj'), c('C','maj')],
    dna: 'I→V in F, outlined not by strumming but by sliding 6ths — two-note shapes on non-adjacent strings. Each double-stop is the 3rd and root of the chord, so the harmony is implied by just two voices.' },
  { id: 'jf9', title: 'Soul to Squeeze Loop', style: 'Frusciante', concept: 'Pop loop', chords: [c('E','maj'), c('C#','min'), c('A','maj'), c('B','maj')],
    dna: 'I→vi→IV→V in E, the classic doo-wop turnaround slowed to a lazy sway. The vi (C#m) is the wistful pivot; the top voice barely moves while the bass does the walking.' },
  { id: 'jf10', title: 'Frusciante Inversion Walk', style: 'Frusciante', concept: 'Shared tones', chords: [c('C','maj'), c('G','maj'), c('A','min'), c('F','maj')],
    dna: 'I–V–vi–IV, but the device is in the bass: play the G as G/B and the F as F/A so the bassline steps C–B–A–A instead of leaping. First-inversion slash chords turn block triads into a descending melodic bass.' },

  // ── SRV ──
  { id: 'srv1', title: 'SRV Shuffle in E', style: 'SRV', concept: 'Blues', chords: [c('E','dom7'), c('A','dom7'), c('B','dom7')],
    dna: 'A 12-bar in E, all dominant 7ths. The harmony is ordinary blues — what makes it SRV is the raked quarter-note ghost-strums packed between the chords.' },
  { id: 'srv2', title: 'Texas Flood Slow Blues', style: 'SRV', concept: 'Blues', chords: [c('G','dom7'), c('C','dom7'), c('D','dom7')],
    dna: 'Slow 12-bar in G. The IV (C7) hitting on bar 5 is where SRV leans into the vibrato — a b7 in every chord keeps it aching and never quite sweet.' },

  // ── Vulfpeck ──
  { id: 'vulf1', title: 'Vulf Soul Turnaround', style: 'Vulfpeck', concept: 'Pop loop', chords: [c('C','maj7'), c('A','m7'), c('D','m7'), c('G','dom7')],
    dna: 'I→vi→ii→V, the soul turnaround Vulfpeck lives on. Every chord a clean 7th, every stab on the front of the beat, and — crucially — silence in between. The pocket is the point.' },
  { id: 'vulf2', title: 'Vulf Dorian Pocket', style: 'Vulfpeck', concept: 'Modal vamp', chords: [c('D','m9'), c('G','dom9')],
    dna: 'A ii→V in C that never resolves — it just loops in D dorian. All 9th chords played impossibly tight and quiet; the groove does the harmonic work.' },
];

export const LIBRARY: Progression[] = [
  { id: 'l1', style: 'Funk', concept: 'Modal vamp', title: 'I–IV Funk Vamp', chords: [c('A','dom7'), c('D','dom7')],
    dna: 'I7→IV7 in A, both dominant. Staying on 7th chords keeps it bluesy and unresolved — the vamp lives in the groove, not the harmony.' },
  { id: 'l2', style: 'Neo-Soul', concept: 'ii–V family', title: 'Minor ii–V–i', chords: [c('B','m7b5'), c('E','dom7'), c('A','min')],
    dna: "The minor ii–V–i. The b5 in Bm7b5 and the E7's raised 3rd (G#) both pull hard toward Am — two leading tones squeezing home." },
  { id: 'l3', style: 'Funk', concept: 'Modal vamp', title: 'Dorian Vamp', chords: [c('D','m7'), c('G','dom7')],
    dna: "A ii–V that refuses to resolve, looping in D dorian. The G7's B natural is the dorian giveaway — a raised 6th that keeps it bright, not sad." },
  { id: 'l4', style: 'Hendrix', concept: 'Borrowed chords', title: 'I–bVII–IV–I', chords: [c('A','maj'), c('G','maj'), c('D','maj'), c('A','maj')],
    dna: 'The bVII (G) is borrowed from A mixolydian. That flat-7 chord is the whole rock-and-roll sound — brightness without leaving home.' },
  { id: 'l5', style: 'Mayer', concept: 'Pop loop', title: 'I–V–vi–IV', chords: [c('D','maj'), c('A','maj'), c('B','min'), c('G','maj')],
    dna: 'The four-chord anthem. The vi (Bm) is the emotional dip; landing on IV instead of I keeps every cycle wanting more.' },
  { id: 'l6', style: 'Neo-Soul', concept: 'ii–V family', title: 'Drop 2 Shell Loop', chords: [c('F','maj7'), c('E','m7'), c('D','m7'), c('G','dom7')],
    dna: 'A stepwise descent (IV–iii–ii–V in C) voiced as shells — just root, 3rd, 7th. The 3rds and 7ths glide down by half-steps while the ear fills in the rest.' },
  { id: 'l7', style: 'Frusciante', concept: 'Borrowed chords', title: 'RHCP Minor Loop', chords: [c('E','min'), c('F','maj'), c('G','maj')],
    dna: 'i→bII→bIII in E. The F is a Neapolitan-flavored half-step above the tonic — a dark, cinematic lift Frusciante loves under a droning top string.' },
  { id: 'l8', style: 'Funk', concept: 'Modal vamp', title: 'Chicken Scratch', chords: [c('G','dom9'), c('C','dom9')],
    dna: 'I9→IV9 funk. The 9th chords are almost incidental — the point is the scratched, muted 16ths. Harmony as percussion.' },
  { id: 'l9', style: 'Neo-Soul', concept: 'Shared tones', title: 'Modal Float', chords: [c('E','m9'), c('A','maj9'), c('D','maj9')],
    dna: 'Parallel 9th chords sliding by 4ths. No functional pull — the shared 9th color on each makes them feel like one sound moving, not three chords.' },
  { id: 'l10', style: 'Mayer', concept: 'Modal vamp', title: 'Lydian Lift', chords: [c('D','maj7'), c('E','maj'), c('D','maj7')],
    dna: 'The E major (II) against a D tonic raises the 4th to G# — pure lydian shimmer. It floats up and settles back without ever needing a V.' },
  { id: 'l11', style: 'Hendrix', concept: 'Modal vamp', title: 'Phrygian Dom', chords: [c('E','dom7'), c('F','maj'), c('E','dom7')],
    dna: 'The bII (F) sitting on a dominant E gives the Spanish, phrygian-dominant color. That half-step above the root is the whole flavor.' },
  { id: 'l12', style: 'Neo-Soul', concept: 'ii–V family', title: 'Soul ii–V', chords: [c('C','m9'), c('F','dom9'), c('A#','maj9')],
    dna: 'A ii–V–I in Bb, dressed in 9ths. The Cm9 melts into F9 by shared tones, and the maj9 landing is soft, never a hard resolution.' },
  { id: 'l13', style: 'Hendrix', concept: 'Blues', title: 'Classic 12-Bar', chords: [c('A','dom7'), c('D','dom7'), c('A','dom7'), c('E','dom7')],
    dna: "The blues skeleton. Every chord a dominant 7th — theory says that shouldn't work, but the b7 in each is exactly what makes it the blues." },
  { id: 'l14', style: 'Frusciante', concept: 'Borrowed chords', title: 'Higher Ground', chords: [c('D#','min'), c('G#','maj'), c('A#','maj')],
    dna: 'i→IV→V in D# minor, but the major IV and V drive it like a gospel-funk engine. Relentless, rising, never resting.' },
  { id: 'l15', style: 'Funk', concept: 'Modal vamp', title: 'Scofield Dorian', chords: [c('G','m9'), c('C','dom9')],
    dna: "A jazz-funk ii–V vamp in F that stays home in G dorian. The C9's E natural keeps it bright; the loop is a launchpad for soloing." },
  { id: 'l16', style: 'Mayer', concept: 'Pop loop', title: 'vi–IV–I–V', chords: [c('A','min'), c('F','maj'), c('C','maj'), c('G','maj')],
    dna: 'The sensitive-song loop. Starting on vi (Am) gives it the melancholy; the I–V tail keeps pulling it back around.' },
  { id: 'l17', style: 'Neo-Soul', concept: 'Chromatic moves', title: 'Dim Turnaround', chords: [c('C','maj7'), c('C#','dim7'), c('D','m7'), c('G','dom7')],
    dna: 'The C#dim7 is a chromatic passing chord bridging I to ii. Its notes are a rootless A7b9 — a secondary dominant in disguise, walking the bass up by half-step.' },
  { id: 'l18', style: 'Funk', concept: 'Pop loop', title: 'One Drop', chords: [c('A','maj'), c('D','maj'), c('E','maj')],
    dna: 'I–IV–V, the three chords that built rock and reggae. Nothing borrowed, nothing extended — all the character comes from where you put the beat.' },
  { id: 'l19', style: 'Hendrix', concept: 'Blues', title: 'E Blues', chords: [c('E','dom7'), c('A','dom7'), c('B','dom7')],
    dna: "The 12-bar in E, the guitar's home blues key. Open-string dominant chords ring against the pentatonic — the reason every guitarist starts here." },
  { id: 'l20', style: 'Mayer', concept: 'Pop loop', title: 'Peaceful Walk', chords: [c('G','maj'), c('D','maj'), c('A','m7'), c('C','maj')],
    dna: 'I–V–ii–IV in G. The ii (Am7) softens the turn and the walking bass underneath ties the four chords into one gentle stroll.' },
];

export const STYLES = ['All', 'Frusciante', 'SRV', 'Vulfpeck', 'Hendrix', 'Neo-Soul', 'Funk', 'Mayer'];

export const CONCEPTS = [
  'All', 'Shared tones', 'Borrowed chords', 'ii–V family', 'Modal vamp',
  'Blues', 'Pop loop', 'Suspensions & add9', 'Chromatic moves',
];
