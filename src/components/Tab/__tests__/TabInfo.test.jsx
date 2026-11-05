import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabInfo from '../TabInfo';

vi.mock('../../Table/Table', () => ({
  default: ({ data }) => <div data-testid="table-mock">rows:{data.length}</div>,
}));

const t = (key) => key;

describe('TabInfo', () => {
  it('renders the summary banners and the filtered trips table, without the countdown', () => {
    const tripInfo = [
      { detail: 'trip-1', total: '10' },
      { detail: 'final-trip', total: '999' },
      { detail: 'trip-2', total: '20' },
    ];
    render(
      <TabInfo
        tripInfo={tripInfo}
        exchangeCol={{ total: '4200' }}
        t={t}
      />
    );

    expect(screen.getByText('totalExchangeCol: $4,200.00')).toBeInTheDocument();
    expect(screen.queryByText('remainingTimeTable')).not.toBeInTheDocument();
    // The 'final-trip' row is excluded from the trips table.
    expect(screen.getByTestId('table-mock')).toHaveTextContent('rows:2');
  });

  it('finds the final trip total by its key, wherever the row comes', () => {
    const tripInfo = [
      { detail: 'trip-1', total: '10' },
      { detail: 'final-trip', total: '999.50' },
      { detail: 'trip-2', total: '20' },
    ];
    render(<TabInfo tripInfo={tripInfo} exchangeCol={{ total: '0' }} t={t} />);
    expect(screen.getByText('totalFinalTrip: $999.50')).toBeInTheDocument();
  });

  it('falls back to -1, never $NaN, when the exchange total is missing', () => {
    render(<TabInfo tripInfo={[]} exchangeCol={{}} t={t} />);
    expect(screen.getByText('totalExchangeCol: -$1.00')).toBeInTheDocument();
  });

  it('falls back to -1 when there is no final trip row or its sum is null', () => {
    const { rerender } = render(<TabInfo tripInfo={[]} exchangeCol={{ total: '0' }} t={t} />);
    expect(screen.getByText('totalFinalTrip: -$1.00')).toBeInTheDocument();

    rerender(<TabInfo tripInfo={[{ detail: 'final-trip', total: null }]} exchangeCol={{ total: '0' }} t={t} />);
    expect(screen.getByText('totalFinalTrip: -$1.00')).toBeInTheDocument();
  });
});
