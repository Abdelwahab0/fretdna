import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VoicingControls from './VoicingControls';
import { useStore } from '../store';

const initial = useStore.getState();

describe('<VoicingControls />', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('shows the Voicing toggle', () => {
    useStore.setState({ quality: 'maj' });
    render(<VoicingControls />);
    expect(screen.getByText('Voicing view')).toBeInTheDocument();
  });

  it('lists one shape button per available CAGED shape when voicing view is on (C major → 5)', () => {
    useStore.setState({ root: 0, quality: 'maj', voicingView: true });
    render(<VoicingControls />);
    expect(screen.getAllByTestId('chord-chart')).toHaveLength(5);
  });

  it('shows no shape buttons for unsupported qualities', () => {
    useStore.setState({ root: 0, quality: 'maj7', voicingView: true });
    render(<VoicingControls />);
    expect(screen.queryAllByTestId('chord-chart')).toHaveLength(0);
  });
});
