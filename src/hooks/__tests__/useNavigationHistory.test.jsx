import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationHistory } from '../useNavigationHistory';

const pop = (state) => act(() => window.dispatchEvent(new PopStateEvent('popstate', { state })));
const wait = (ms) => act(async () => vi.advanceTimersByTimeAsync(ms));

describe('useNavigationHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState(null, '', window.location.href);
    vi.spyOn(window.history, 'go').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('starts at the initial entry and marks the browser state', () => {
    const { result } = renderHook(() => useNavigationHistory());
    expect(result.current.currentState).toEqual({ type: 'initial', data: null });
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
    expect(window.history.state).toEqual({ index: 0, type: 'initial', data: null });
  });

  it('resets an index left by a reload, and keeps any other browser state', () => {
    window.history.replaceState({ index: 4, type: 'tab-change', data: {} }, '', window.location.href);
    renderHook(() => useNavigationHistory());
    expect(window.history.state.index).toBe(0);

    window.history.replaceState({ other: true }, '', window.location.href);
    renderHook(() => useNavigationHistory());
    expect(window.history.state).toEqual({ other: true });
  });

  it('pushes an entry, skips a duplicate, and locks pushes for 100 ms', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    expect(result.current.currentState.type).toBe('tab-change');
    expect(result.current.canGoBack).toBe(true);

    act(() => result.current.pushHistory('tab-change', { tabId: 3 })); // locked
    expect(result.current.history).toHaveLength(2);

    await wait(100);
    act(() => result.current.pushHistory('tab-change', { tabId: 2 })); // same as current
    expect(result.current.history).toHaveLength(2);

    act(() => result.current.pushHistory('menu')); // data defaults to null
    expect(result.current.currentState).toMatchObject({ type: 'menu', data: null });
  });

  it('replaces the current entry', () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.replaceHistory('tab-change', { tabId: 4 }));
    act(() => result.current.replaceHistory('menu'));
    expect(result.current.history).toHaveLength(1);
    expect(result.current.currentState).toMatchObject({ type: 'menu', data: null });
    expect(window.history.state).toEqual({ index: 0, type: 'menu', data: null });
  });

  it('goes back and forward through the browser, and skips the push that follows', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    expect(result.current.goBack()).toBeNull();
    expect(result.current.goForward()).toBeNull();

    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    await wait(100);
    let entry;
    act(() => {
      entry = result.current.goBack();
    });
    expect(entry.type).toBe('initial');
    expect(window.history.go).toHaveBeenCalledWith(-1);

    // The browser answers with a popstate to index 0
    pop({ index: 0 });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canGoForward).toBe(true);
    await wait(50);

    act(() => {
      entry = result.current.goForward();
    });
    expect(entry.type).toBe('tab-change');
    expect(window.history.go).toHaveBeenCalledWith(1);

    // While navigating, the next push is dropped once
    act(() => result.current.pushHistory('menu'));
    expect(result.current.history).toHaveLength(2);
  });

  it('ignores a push while a popstate is being processed, and a second popstate in that time', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    pop({ index: 0 });
    pop({ index: 1 }); // dropped: still processing the first
    expect(result.current.currentIndex).toBe(0);
    act(() => result.current.pushHistory('b'));
    expect(result.current.history).toHaveLength(2);
    await wait(50);
  });

  it('steps back one entry on a popstate without an index', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    pop(null);
    expect(result.current.currentIndex).toBe(0);
    await wait(50);

    // At the start there is nothing to step back to
    pop(null);
    expect(result.current.currentIndex).toBe(0);
    await wait(50);
  });

  it('ignores a popstate with an index out of range', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    pop({ index: 7 });
    pop({ index: -1 });
    await wait(50);
    pop({ index: -1 });
    expect(result.current.currentIndex).toBe(0);
    await wait(50);
  });

  it('stops listening on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useNavigationHistory());
    unmount();
    expect(remove).toHaveBeenCalledWith('popstate', expect.any(Function));
  });
});
