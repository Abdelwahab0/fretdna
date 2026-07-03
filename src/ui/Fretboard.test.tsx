import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Fretboard from './Fretboard';
import { useStore } from './store';
import { getDots } from '../core/fretboard';
import { voicingsFor } from '../core/voicings';

const initial = useStore.getState();

describe('<Fretboard />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('renders an svg', () => {
    render(<Fretboard />);
    expect(screen.getByTestId('fretboard')).toBeInTheDocument();
  });

  it('renders one dot per computed chord tone (Cmaj7 default)', () => {
    render(<Fretboard />);
    const s = useStore.getState();
    const expected = getDots({
      mode: s.mode, root: s.root, quality: s.quality,
      voicing: s.voicing, stringSet: s.stringSet, hlInterval: s.hlInterval,
    }).length;
    expect(screen.getAllByTestId('dot')).toHaveLength(expected);
  });
});

describe('<Fretboard /> voicing view', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('renders one voicing-dot per note of the selected CAGED voicing (C major, C-shape)', () => {
    useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: true, shapeIndex: 0, showGhost: false });
    render(<Fretboard />);
    const expected = voicingsFor(0, 'maj')[0].notes.length; // C-shape
    expect(screen.getAllByTestId('voicing-dot')).toHaveLength(expected);
  });

  it('shows ghost dots when showGhost is on', () => {
    useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: true, shapeIndex: 0, showGhost: true });
    render(<Fretboard />);
    expect(screen.getAllByTestId('ghost-dot').length).toBeGreaterThan(0);
  });

  it('falls back to the all-notes view for unsupported qualities (sus2)', () => {
    useStore.setState({ root: 0, quality: 'sus2', mode: 'shapes', voicingView: true });
    render(<Fretboard />);
    expect(screen.queryAllByTestId('voicing-dot')).toHaveLength(0);
    expect(screen.getAllByTestId('dot').length).toBeGreaterThan(0);
  });
});

describe('<Fretboard /> triads in position', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('renders triad-in-position dots when the mode is active with a selected voicing', () => {
    useStore.setState({
      root: 0, quality: 'maj', mode: 'shapes', voicingView: true,
      triadsInBox: true, triadDegree: 0,
    });
    render(<Fretboard />);
    expect(screen.getAllByTestId('triad-box-dot').length).toBeGreaterThan(0);
  });

  it('does not render triad-in-position dots when triadDegree is null', () => {
    useStore.setState({
      root: 0, quality: 'maj', mode: 'shapes', voicingView: true,
      triadsInBox: true, triadDegree: null,
    });
    render(<Fretboard />);
    expect(screen.queryByTestId('triad-box-dot')).toBe(null);
  });
});
