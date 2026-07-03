import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Progressions from './Progressions';

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
