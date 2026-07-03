import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChordInfo from './ChordInfo';
import { useStore } from './store';

const strumSpy = vi.fn();
vi.mock('./sound', () => ({
  strum: (...args: unknown[]) => strumSpy(...args),
  playNote: vi.fn(),
  pluck: vi.fn(),
}));

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

  it('play button strums the current chord tones', () => {
    strumSpy.mockClear();
    useStore.setState({ root: 0, quality: 'maj', mode: 'shapes', voicingView: false });
    render(<ChordInfo />);
    fireEvent.click(screen.getByTestId('play-chord'));
    expect(strumSpy).toHaveBeenCalledTimes(1);
    const freqs = strumSpy.mock.calls[0][0] as number[];
    expect(freqs).toHaveLength(3); // C major triad
  });
});
