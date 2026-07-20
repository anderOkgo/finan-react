import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabInfo from '../TabInfo';

vi.mock('../../Table/Table', () => ({
  default: ({ data }) => <div data-testid="table-mock">rows:{data.length}</div>,
}));
vi.mock('../../CountDownEnd/CountDownEnd', () => ({
  default: () => <div data-testid="countdown-mock" />,
}));

const t = (key) => key;

describe('TabInfo', () => {
  it('renders the summary banners, the countdown, and the filtered trips table', () => {
    const tripInfo = [
      { detail: 'trip-1', total: '10' },
      { detail: 'final-trip', total: '999' },
      { detail: 'trip-2', total: '20' },
    ];
    render(
      <TabInfo
        tripInfo={tripInfo}
        generalInfo={{ total: '1500.75' }}
        exchangeCol={{ total: '4200' }}
        t={t}
      />
    );

    expect(screen.getByText('totalSaveAU: $1,500.75')).toBeInTheDocument();
    expect(screen.getByText('totalExchangeCol: $4,200.00')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-mock')).toBeInTheDocument();
    // The 'final-trip' row is excluded from the trips table.
    expect(screen.getByTestId('table-mock')).toHaveTextContent('rows:2');
  });

  it('shows $NaN, not the intended -1 fallback, when generalInfo/exchangeCol totals are missing', () => {
    // Real gotcha, not a guess: `parseFloat(generalInfo?.['total']) ?? -1`
    // looks like a "-1 when missing" fallback, but `??` only substitutes on
    // null/undefined -- parseFloat(undefined) returns NaN, which `??`
    // does NOT treat as nullish, so the fallback never actually fires. The
    // rendered value is "$NaN", not "-$1.00". Same root cause affects
    // exchangeCol's total (parseInt(undefined) is also NaN). Documented
    // here rather than "fixed" since correcting it is a one-line change to
    // a real component, out of scope for a coverage-only pass.
    render(<TabInfo tripInfo={[]} generalInfo={{}} exchangeCol={{}} t={t} />);
    expect(screen.getByText('totalSaveAU: $NaN')).toBeInTheDocument();
    expect(screen.getByText('totalExchangeCol: $NaN')).toBeInTheDocument();
  });

  it('does fall back to -1 for a missing tripInfo[5] (optional chaining actually short-circuits here)', () => {
    render(<TabInfo tripInfo={[]} generalInfo={{ total: '0' }} exchangeCol={{ total: '0' }} t={t} />);
    expect(screen.getByText('totalFinalTrip: -$1.00')).toBeInTheDocument();
  });
});
