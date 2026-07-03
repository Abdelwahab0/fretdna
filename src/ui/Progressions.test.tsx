import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Progressions from './Progressions';
import { useStore } from './store';

const strumSpy = vi.fn();
vi.mock('./sound', () => ({
  strum: (...a: unknown[]) => strumSpy(...a),
  playNote: vi.fn(),
  pluck: vi.fn(),
}));

describe('Progressions concept filter', () => {
  beforeEach(() => cleanup());

  it('renders a concept chip row', () => {
    render(<Progressions />);
    const chips = screen.getAllByTestId('concept-chip');
    expect(chips.length).toBeGreaterThan(1);
    expect(chips.some((c) => c.textContent === 'All')).toBe(true);
  });

  it('style and concept filters combine (AND) to narrow the list', () => {
    render(<Progressions />);
    const all = screen.getAllByTestId('prog-chip').length;
    fireEvent.click(screen.getByRole('button', { name: 'Blues' }));
    const blues = screen.getAllByTestId('prog-chip').length;
    expect(blues).toBeLessThan(all);
    expect(blues).toBeGreaterThan(0);
  });
});

describe('Progressions playback', () => {
  beforeEach(() => {
    cleanup();
    useStore.setState({ progId: null, progStep: 0, progFollow: true, tempo: 'med' });
  });

  it('renders tempo chips and a follow toggle', () => {
    render(<Progressions />);
    fireEvent.click(screen.getAllByTestId('prog-chip')[0]); // reveal transport row
    expect(screen.getByTestId('follow-toggle')).toBeTruthy();
    expect(screen.getAllByTestId('tempo-chip').length).toBe(3);
  });

  it('follow toggle flips progFollow', () => {
    useStore.setState({ progFollow: true });
    render(<Progressions />);
    fireEvent.click(screen.getAllByTestId('prog-chip')[0]);
    fireEvent.click(screen.getByTestId('follow-toggle'));
    expect(useStore.getState().progFollow).toBe(false);
  });

  it('selecting a progression then Play strums its first chord', () => {
    strumSpy.mockClear();
    render(<Progressions />);
    fireEvent.click(screen.getAllByTestId('prog-chip')[0]);
    fireEvent.click(screen.getByTestId('prog-play'));
    expect(strumSpy).toHaveBeenCalled();
  });
});
