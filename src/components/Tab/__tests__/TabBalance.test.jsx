import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabBalance from '../TabBalance';

vi.mock('../../Table/Table', () => ({
  default: ({ label, data }) => (
    <div data-testid="table-mock">
      {label}:{data.length}
    </div>
  ),
}));
vi.mock('../../Charts/LineChart', () => ({
  default: ({ dataI }) => <div data-testid="chart-mock">points:{dataI.length}</div>,
}));

const t = (key) => key;

describe('TabBalance', () => {
  it('renders the balance banner, the chart, and all four tables with the right data', () => {
    render(
      <TabBalance
        bankTotal={5000}
        balance={[{ id: 1 }, { id: 2 }]}
        yearlyBalance={[{ year: 2024 }]}
        balanceUntilDate={[
          { detail: 'day-1' },
          { detail: 'final-trip' },
          { detail: 'day-2' },
        ]}
        monthlyExpensesUntilDay={[{ name: 'rent' }]}
        t={t}
      />
    );

    expect(screen.getByText('totalBalance: $5,000.00')).toBeInTheDocument();
    expect(screen.getByTestId('chart-mock')).toHaveTextContent('points:2');

    const tables = screen.getAllByTestId('table-mock');
    expect(tables.map((el) => el.textContent)).toEqual([
      'annualBalanceTable:1',
      'monthlyBalanceTable:2',
      // 'final-trip' rows are excluded from the daily-balance table.
      'dailyBalanceTable:2',
      'monthlyExpensesUntilDay:1',
    ]);
  });

  it('handles a missing balanceUntilDate gracefully (empty daily-balance table)', () => {
    render(
      <TabBalance
        bankTotal={0}
        balance={[]}
        yearlyBalance={[]}
        balanceUntilDate={undefined}
        monthlyExpensesUntilDay={[]}
        t={t}
      />
    );

    const tables = screen.getAllByTestId('table-mock');
    expect(tables[2]).toHaveTextContent('dailyBalanceTable:0');
  });
});
