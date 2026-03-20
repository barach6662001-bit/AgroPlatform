import { describe, it, expect, beforeEach } from 'vitest';
import { useSyncQueueStore } from '../syncQueueStore';

describe('syncQueueStore', () => {
  beforeEach(() => {
    useSyncQueueStore.setState({
      isOnline: true,
      pendingCount: 0,
    });
  });

  it('has correct initial state', () => {
    const state = useSyncQueueStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.pendingCount).toBe(0);
  });

  it('setOnline updates isOnline', () => {
    useSyncQueueStore.getState().setOnline(false);
    expect(useSyncQueueStore.getState().isOnline).toBe(false);

    useSyncQueueStore.getState().setOnline(true);
    expect(useSyncQueueStore.getState().isOnline).toBe(true);
  });

  it('setPendingCount sets exact count', () => {
    useSyncQueueStore.getState().setPendingCount(5);
    expect(useSyncQueueStore.getState().pendingCount).toBe(5);
  });

  it('incrementPending increases count by 1', () => {
    useSyncQueueStore.getState().incrementPending();
    useSyncQueueStore.getState().incrementPending();
    expect(useSyncQueueStore.getState().pendingCount).toBe(2);
  });

  it('decrementPending decreases count by 1', () => {
    useSyncQueueStore.setState({ pendingCount: 3 });
    useSyncQueueStore.getState().decrementPending();
    expect(useSyncQueueStore.getState().pendingCount).toBe(2);
  });

  it('decrementPending does not go below 0', () => {
    useSyncQueueStore.setState({ pendingCount: 0 });
    useSyncQueueStore.getState().decrementPending();
    expect(useSyncQueueStore.getState().pendingCount).toBe(0);
  });
});
