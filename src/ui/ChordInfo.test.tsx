import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChordInfo from './ChordInfo';
import { useStore } from './store';

const initial = useStore.getState();

describe('<ChordInfo />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('shows the chord name for the current root + quality', () => {
    useStore.setState({ root: 0, quality: 'maj7', mode: 'shapes' });
    render(<ChordInfo />);
    expect(screen.getByText('Cmaj7')).toBeInTheDocument();
  });

  it('shows a tone chip per chord interval', () => {
    useStore.setState({ root: 0, quality: 'maj7', mode: 'shapes' });
    render(<ChordInfo />);
    // Cmaj7 -> C E G B = 4 chips
    expect(document.querySelectorAll('.chip')).toHaveLength(4);
  });
});
