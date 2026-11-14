import { vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AutoDismissMessage from '../AutoDismissMessage.jsx';

describe('AutoDismissMessage', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(
      <AutoDismissMessage msg="hi" bgColor="red" duration={1000} visible={false} setVisible={vi.fn()} />
    );
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders the message (as HTML) when visible', () => {
    render(
      <AutoDismissMessage msg="<b>Saved</b>" bgColor="red" duration={1000} visible={true} setVisible={vi.fn()} />
    );
    expect(screen.getByText('Saved').tagName).toBe('B');
  });

  it('auto-dismisses via setVisible(false) after the given duration', () => {
    vi.useFakeTimers();
    const setVisible = vi.fn();
    render(<AutoDismissMessage msg="hi" bgColor="red" duration={2000} visible={true} setVisible={setVisible} />);

    expect(setVisible).not.toHaveBeenCalledWith(false);
    vi.advanceTimersByTime(2000);
    expect(setVisible).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it('fades out over the duration after a one-second delay, then stops animating', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    render(<AutoDismissMessage msg="hi" bgColor="red" duration={2000} visible={true} setVisible={vi.fn()} />);
    const box = screen.getByText('hi').parentElement;
    act(() => vi.advanceTimersByTime(2000)); // 1 s into the fade
    expect(Number(box.style.opacity)).toBeCloseTo(0.5, 1);
    act(() => vi.advanceTimersByTime(1500)); // past the end: no more frames change it
    const last = box.style.opacity;
    act(() => vi.advanceTimersByTime(1000));
    expect(box.style.opacity).toBe(last);
    vi.useRealTimers();
  });
});
