import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabGeneral from '../TabGeneral';

// Same isolation strategy as every other Tab*.test.jsx in this repo: Table
// already has its own dedicated suite, so it's mocked here to a thin stub
// that exposes exactly the props TabGeneral wires into it (label/data plus
// buttons to trigger onRowDoubleClick/onFilteredDataChange from the test),
// rather than re-rendering the real Table for every TabGeneral test.
vi.mock('../../Table/Table', () => ({
  default: ({ label, data, onRowDoubleClick, onFilteredDataChange }) => (
    <div data-testid={`table-${label}`}>
      <span data-testid={`table-data-${label}`}>{JSON.stringify(data)}</span>
      {onRowDoubleClick && (
        <button data-testid={`dblclick-${label}`} onClick={() => onRowDoubleClick(data[0])}>
          dblclick
        </button>
      )}
      {onFilteredDataChange && (
        <button data-testid={`filter-${label}`} onClick={() => onFilteredDataChange(data.slice(0, 1))}>
          filter
        </button>
      )}
    </div>
  ),
}));

const t = (key) => key;

const movements = [
  { id: 1, source: 'expense', name: 'Coffee', val: 10, tag: 'food', datemov: '2024-01-01', log: 'x', currency: 'COP' },
  { id: 2, source: 'expense', name: 'Coffee', val: 5, tag: 'food', datemov: '2024-01-02', log: 'y', currency: 'COP' },
  { id: 3, source: 'income', name: 'Salary', val: 100, tag: 'work', datemov: '2024-01-03', log: 'z', currency: 'COP' },
];

// A real <select id="movement_type"> must exist in the DOM for
// handleRowDoubleClick to run without throwing -- the real app always has
// this element rendered by TabInput/Form's markup; here it's stood in for
// directly since Form has its own dedicated suite and isn't re-rendered.
beforeEach(() => {
  const select = document.createElement('select');
  select.id = 'movement_type';
  for (let i = 0; i < 10; i++) select.appendChild(document.createElement('option'));
  document.body.appendChild(select);
});

afterEach(() => {
  document.getElementById('movement_type')?.remove();
  vi.useRealTimers();
});

describe('TabGeneral budget banner', () => {
  it('shows remainingBudget for admins and cycles monthly -> daily -> dailyNoToday -> monthly on double-click', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 10)); // Jan 10, 2024 -- 31-day month, 22 days left including today

    render(<TabGeneral movements={[]} remainingBudget={2200} setForm={vi.fn()} setEdit={vi.fn()} setSelectedOption={vi.fn()} currency="COP" t={t} userRole="admin" totalDay={0} />);

    expect(screen.getByText('remainingBudget: $2,200.00')).toBeInTheDocument();

    const banner = document.querySelector('.label-InfoBanner');
    fireEvent.doubleClick(banner);
    // 22 days remain (31 - 10 + 1) -> 2200 / 22 = 100
    expect(screen.getByText('dailyAverageBudget: $100.00')).toBeInTheDocument();

    fireEvent.doubleClick(document.querySelector('.label-InfoBanner'));
    // 21 days remain excluding today (31 - 10) -> 2200 / 21 = 104.76
    expect(screen.getByText('dailyAverageBudgetNoToday: $104.76')).toBeInTheDocument();

    fireEvent.doubleClick(document.querySelector('.label-InfoBanner'));
    expect(screen.getByText('remainingBudget: $2,200.00')).toBeInTheDocument();
  });

  it('shows the dailyExpenses banner for non-admin users instead', () => {
    render(<TabGeneral movements={[]} remainingBudget={2200} totalDay={42} currency="COP" t={t} userRole="user" />);
    expect(screen.getByText('dailyExpenses: $42.00')).toBeInTheDocument();
  });
});

describe('TabGeneral tables', () => {
  it('wires the Movement Table to the raw movements prop, and derives the Name/Type summary tables from it', () => {
    render(<TabGeneral movements={movements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" />);

    expect(JSON.parse(screen.getByTestId('table-data-movementTable').textContent)).toEqual(movements);

    // Grouped by name, values summed, rounded to 2 decimals.
    expect(JSON.parse(screen.getByTestId('table-data-nameSummaryTable').textContent)).toEqual([
      { name: 'Coffee', total: 15, currency: 'COP', source: 'expense' },
      { name: 'Salary', total: 100, currency: 'COP', source: 'income' },
    ]);

    // filteredNameData is still null at this point, so typeSummaryArray
    // is derived from nameSummaryArray, grouped further by source.
    expect(JSON.parse(screen.getByTestId('table-data-typeSummaryTable').textContent)).toEqual([
      { type: 'expense', total: 15, currency: 'COP' },
      { type: 'income', total: 100, currency: 'COP' },
    ]);
  });

  it('recomputes the Name Summary table when the Movement Table reports filtered data', () => {
    render(<TabGeneral movements={movements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" />);

    // Movement Table's onFilteredDataChange -> setFilteredData; the mock
    // reports back only the first row (a single 'Coffee' expense of 10).
    fireEvent.click(screen.getByTestId('filter-movementTable'));

    expect(JSON.parse(screen.getByTestId('table-data-nameSummaryTable').textContent)).toEqual([
      { name: 'Coffee', total: 10, currency: 'COP', source: 'expense' },
    ]);
  });

  it('recomputes the Type Summary table when the Name Summary table reports filtered data', () => {
    render(<TabGeneral movements={movements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" />);

    // Name Summary Table's onFilteredDataChange -> setFilteredNameData;
    // once non-null, typeSummaryArray switches from summarizing
    // nameSummaryArray to summarizing this filtered set instead.
    fireEvent.click(screen.getByTestId('filter-nameSummaryTable'));

    expect(JSON.parse(screen.getByTestId('table-data-typeSummaryTable').textContent)).toEqual([
      { type: 'expense', total: 15, currency: 'COP' },
    ]);
  });
});

describe('TabGeneral handleRowDoubleClick', () => {
  it('maps an expense row into the edit form and selects the Input tab', () => {
    const setForm = vi.fn();
    const setEdit = vi.fn();
    const setSelectedOption = vi.fn();
    render(
      <TabGeneral
        movements={movements}
        remainingBudget={0}
        totalDay={0}
        currency="COP"
        t={t}
        userRole="user"
        setForm={setForm}
        setEdit={setEdit}
        setSelectedOption={setSelectedOption}
      />
    );

    fireEvent.click(screen.getByTestId('dblclick-movementTable'));

    expect(setForm).toHaveBeenCalledWith({
      id: 1,
      source: 'expense',
      movement_name: 'Coffee',
      movement_val: 10,
      movement_tag: 'food',
      movement_date: '2024-01-01',
      movement_type: 2,
      currency: 'COP',
      operate_for: 'x',
    });
    expect(setEdit).toHaveBeenCalledWith(true);
    expect(setSelectedOption).toHaveBeenCalledWith(1);
    expect(document.getElementById('movement_type').selectedIndex).toBe(2);
  });

  it('maps income (type 1) and balance (type 8) rows to their respective movement_type indexes', () => {
    const setForm = vi.fn();
    const incomeMovements = [movements[2]];
    const { rerender } = render(
      <TabGeneral movements={incomeMovements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" setForm={setForm} setEdit={vi.fn()} setSelectedOption={vi.fn()} />
    );
    fireEvent.click(screen.getByTestId('dblclick-movementTable'));
    expect(setForm).toHaveBeenLastCalledWith(expect.objectContaining({ movement_type: 1 }));
    expect(document.getElementById('movement_type').selectedIndex).toBe(1);

    const balanceMovements = [{ id: 9, source: 'balance', name: 'Bank', val: 1, tag: '', datemov: '2024-01-01', log: '' }];
    rerender(
      <TabGeneral movements={balanceMovements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" setForm={setForm} setEdit={vi.fn()} setSelectedOption={vi.fn()} />
    );
    fireEvent.click(screen.getByTestId('dblclick-movementTable'));
    expect(setForm).toHaveBeenLastCalledWith(expect.objectContaining({ movement_type: 8 }));
    expect(document.getElementById('movement_type').selectedIndex).toBe(8);
  });

  it('leaves movement_type undefined for a source that matches no known case', () => {
    const setForm = vi.fn();
    const otherMovements = [{ id: 4, source: 'transfer', name: 'Other', val: 1, tag: '', datemov: '2024-01-01', log: '' }];
    render(
      <TabGeneral movements={otherMovements} remainingBudget={0} totalDay={0} currency="COP" t={t} userRole="user" setForm={setForm} setEdit={vi.fn()} setSelectedOption={vi.fn()} />
    );
    fireEvent.click(screen.getByTestId('dblclick-movementTable'));
    expect(setForm).toHaveBeenCalledWith(expect.objectContaining({ movement_type: undefined }));
  });
});
