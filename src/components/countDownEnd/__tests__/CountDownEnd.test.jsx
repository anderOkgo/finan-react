import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountDownEnd from '../CountDownEnd';
import cyfer from '../../../helpers/cyfer';
import set from '../../../helpers/set.json';

vi.mock('../../Table/Table', () => ({
  default: ({ label, data }) => (
    <div data-testid="table-mock">
      {label}:{JSON.stringify(data)}
    </div>
  ),
}));

const t = (key) => key;

describe('CountDownEnd', () => {
  it('renders the remaining-time table, starting with no rows', () => {
    render(<CountDownEnd t={t} />);
    expect(screen.getByTestId('table-mock')).toHaveTextContent('remainingTimeTable:[]');
  });

  it('loads a previously-saved (encrypted) snapshot from localStorage on mount', () => {
    const saved = [{ total: '100', elapsed: '5', remaining: '95' }];
    localStorage.setItem('count_down', cyfer().cy(JSON.stringify(saved), set.salt));

    render(<CountDownEnd t={t} />);

    expect(screen.getByTestId('table-mock')).toHaveTextContent(JSON.stringify(saved));
  });

  it('recomputes and persists a fresh (encrypted) snapshot every second', () => {
    vi.useFakeTimers();
    render(<CountDownEnd t={t} />);

    vi.advanceTimersByTime(1000);

    const stored = localStorage.getItem('count_down');
    expect(stored).not.toBeNull();
    const decrypted = JSON.parse(cyfer().dcy(stored, set.salt));
    expect(decrypted).toHaveLength(3);
    expect(decrypted[0]).toHaveProperty('total');
    expect(decrypted[2].total).toBe('100%');

    vi.useRealTimers();
  });
});
