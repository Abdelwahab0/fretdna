import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Fretboard from './Fretboard';
import { useStore } from './store';
import { getDots } from '../core/fretboard';

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
