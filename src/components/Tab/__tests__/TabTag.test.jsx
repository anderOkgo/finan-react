import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabTag from '../TabTag';

vi.mock('../../Table/Table', () => ({
  default: ({ label, data, onFilteredDataChange }) => (
    <div>
      <div data-testid={`table-${label}`}>{JSON.stringify(data)}</div>
      {onFilteredDataChange && (
        <button type="button" data-testid={`filter-${label}`} onClick={() => onFilteredDataChange(data.slice(0, 1))}>
          filter
        </button>
      )}
    </div>
  ),
}));

const t = (key) => key;

const movementTag = [
  { tag: 'food', name_source: 'cash', montly_sum: 10, currency: 'COP' },
  { tag: 'food', name_source: 'cash', montly_sum: 5, currency: 'COP' },
  { tag: 'rent', name_source: 'card', montly_sum: 100, currency: 'COP' },
];

describe('TabTag', () => {
  it('shows the monthly-budget banner for admins, and the daily-expenses banner otherwise', () => {
    const { rerender } = render(
      <TabTag movementTag={[]} monthlyBudget={500} totalDay={20} t={t} userRole="admin" />
    );
    expect(screen.getByText('monthlyBudget: $500.00')).toBeInTheDocument();

    rerender(<TabTag movementTag={[]} monthlyBudget={500} totalDay={20} t={t} userRole="user" />);
    expect(screen.getByText('dailyExpenses: $20.00')).toBeInTheDocument();
  });

  it('falls back to 0 for a missing monthlyBudget when the role is admin', () => {
    render(<TabTag movementTag={[]} monthlyBudget={undefined} totalDay={20} t={t} userRole="admin" />);
    expect(screen.getByText('monthlyBudget: $0.00')).toBeInTheDocument();
  });

  it('groups movementTag entries by tag+source and sums montly_sum into the tag-summary table', () => {
    render(<TabTag movementTag={movementTag} monthlyBudget={0} totalDay={0} t={t} userRole="user" />);

    const summary = JSON.parse(screen.getByTestId('table-tagSummaryTable').textContent);
    expect(summary).toEqual([
      { tag: 'food', source: 'cash', total: 15, currency: 'COP' },
      { tag: 'rent', source: 'card', total: 100, currency: 'COP' },
    ]);
  });

  it('further groups the tag-summary by source into the type-summary table', () => {
    render(<TabTag movementTag={movementTag} monthlyBudget={0} totalDay={0} t={t} userRole="user" />);

    const typeSummary = JSON.parse(screen.getByTestId('table-typeSummaryTable').textContent);
    expect(typeSummary).toEqual([
      { type: 'cash', total: 15, currency: 'COP' },
      { type: 'card', total: 100, currency: 'COP' },
    ]);
  });

  it('adds up two tags of the same source in the type summary', () => {
    const twoTagsOneSource = [...movementTag, { tag: 'fun', name_source: 'cash', montly_sum: 7, currency: 'COP' }];
    render(<TabTag movementTag={twoTagsOneSource} monthlyBudget={0} totalDay={0} t={t} userRole="user" />);
    expect(JSON.parse(screen.getByTestId('table-typeSummaryTable').textContent)[0]).toEqual({
      type: 'cash',
      total: 22,
      currency: 'COP',
    });
  });

  it('summarizes only the rows the tag-summary table shows after a search', () => {
    render(<TabTag movementTag={movementTag} monthlyBudget={0} totalDay={0} t={t} userRole="user" />);
    fireEvent.click(screen.getByTestId('filter-tagSummaryTable'));
    expect(JSON.parse(screen.getByTestId('table-typeSummaryTable').textContent)).toEqual([
      { type: 'cash', total: 15, currency: 'COP' },
    ]);
  });
});
