import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSwipeableTabs from '../useSwipeableTabs';

const target = (html = '<div></div>') => {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host.firstChild;
};

const swipe = (result, fromX, toX, el = target()) => {
  act(() => result.current.handleTouchStart({ touches: [{ clientX: fromX }] }));
  act(() => result.current.handleTouchEnd({ target: el, changedTouches: [{ clientX: toX }] }));
};

describe('useSwipeableTabs', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts on the first tab, with the defaults', () => {
    const { result } = renderHook(() => useSwipeableTabs());
    expect(result.current.selectedOption).toBe(1);
  });

  it('moves to the next tab on a long swipe left and back on a long swipe right', () => {
    const onSwipeChange = vi.fn();
    const { result } = renderHook(() => useSwipeableTabs(4, 170, onSwipeChange));
    swipe(result, 400, 100);
    expect(result.current.selectedOption).toBe(2);
    expect(onSwipeChange).toHaveBeenCalledWith(2);
    swipe(result, 100, 400);
    expect(result.current.selectedOption).toBe(1);
    expect(onSwipeChange).toHaveBeenLastCalledWith(1);
  });

  it('stays on the first and last tabs at the edges, without calling back', () => {
    const onSwipeChange = vi.fn();
    const { result } = renderHook(() => useSwipeableTabs(2, 170, onSwipeChange));
    swipe(result, 100, 400); // already on the first tab
    expect(result.current.selectedOption).toBe(1);
    swipe(result, 400, 100);
    swipe(result, 400, 100); // already on the last tab
    expect(result.current.selectedOption).toBe(2);
    expect(onSwipeChange).toHaveBeenCalledTimes(1);
  });

  it('changes tab without a callback', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 170));
    swipe(result, 400, 100);
    expect(result.current.selectedOption).toBe(2);
  });

  it('ignores a short swipe', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 170));
    swipe(result, 200, 100);
    expect(result.current.selectedOption).toBe(1);
  });

  it('ignores a touch end with no touch start', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 170));
    act(() => result.current.handleTouchEnd({ target: target(), changedTouches: [{ clientX: 0 }] }));
    expect(result.current.selectedOption).toBe(1);
  });

  it('ignores a swipe on a range input or inside one', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 170));
    swipe(result, 400, 100, target('<input type="range">'));
    expect(result.current.selectedOption).toBe(1);
    const inner = { type: 'text', closest: (sel) => (sel === 'input[type="range"]' ? {} : null) };
    swipe(result, 400, 100, inner);
    expect(result.current.selectedOption).toBe(1);
  });

  it('ignores a swipe over a table in cell selection', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 170));
    const cell = target('<table class="cell-selecting"><tbody><tr><td>1</td></tr></tbody></table>').querySelector('td');
    swipe(result, 400, 100, cell);
    expect(result.current.selectedOption).toBe(1);
  });
});
