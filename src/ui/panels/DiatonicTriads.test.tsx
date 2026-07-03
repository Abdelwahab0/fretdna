import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DiatonicTriads from './DiatonicTriads';
import { useStore } from '../store';

describe('DiatonicTriads in-position toggle', () => {
  beforeEach(() => {
    cleanup();
    // Ensure a key with a parent scale so the panel renders.
    useStore.setState({ root: 0, quality: 'maj', triadsInBox: false, triadDegree: null });
  });

  it('renders an in-position toggle', () => {
    render(<DiatonicTriads />);
    expect(screen.getByTestId('triads-in-box-toggle')).toBeTruthy();
  });

  it('with the toggle on, clicking a degree sets triadDegree and leaves root/quality alone', () => {
    useStore.setState({ triadsInBox: true });
    render(<DiatonicTriads />);
    const before = useStore.getState().root;
    fireEvent.click(screen.getAllByTestId('triad-btn')[1]); // 2nd degree
    expect(useStore.getState().triadDegree).toBe(1);
    expect(useStore.getState().root).toBe(before); // board did not jump
  });

  it('with the toggle off, clicking a degree jumps the board (root changes)', () => {
    render(<DiatonicTriads />);
    fireEvent.click(screen.getAllByTestId('triad-btn')[1]); // ii = D minor, root 2
    expect(useStore.getState().root).toBe(2);
    expect(useStore.getState().triadDegree).toBe(null);
  });
});
