import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

const initial = useStore.getState();

describe('store', () => {
  beforeEach(() => useStore.setState(initial, true));

  it('has sensible defaults', () => {
    const s = useStore.getState();
    expect(s.root).toBe(0);
    expect(s.quality).toBe('maj7');
    expect(s.mode).toBe('shapes');
    expect(s.showLabels).toBe(true);
  });

  it('setRoot and setQuality update state', () => {
    useStore.getState().setRoot(5);
    useStore.getState().setQuality('m7');
    expect(useStore.getState().root).toBe(5);
    expect(useStore.getState().quality).toBe('m7');
  });

  it('switching to intervals mode with null highlight defaults it to root', () => {
    useStore.getState().setHlInterval(null);
    useStore.getState().setMode('intervals');
    expect(useStore.getState().hlInterval).toBe(0);
  });
});
