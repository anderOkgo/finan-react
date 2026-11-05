import { vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import Table from '../Table';
import { LONG_PRESS_MS } from '../useCellSelection';
import GlobalContext from '../../../contexts/GlobalContext';

vi.mock('../TableSearch', () => ({
  default: (props) => <button onClick={() => props.setFilteredData(props.dataset.slice(0, 1))}>filter-first-row</button>,
}));
vi.mock('../TablePagination', () => ({ default: () => null }));

const t = (key) => key;
const movements = [
  { id: 1, name: 'Salary', val: 3200, source: 'income' },
  { id: 2, name: 'Rent', val: 950, source: 'expense' },
  { id: 3, name: 'Food', val: 84.35, source: 'expense' },
];

const tableProps = {
  columns: ['Name', 'Value', 'Type'],
  orderColumnsList: ['id', 'name', 'val', 'source'],
  hiddenColumns: ['id'],
  moneyColumns: ['val'],
  label: 'Movements',
};
const renderTable = (props = {}) =>
  render(
    <GlobalContext.Provider value={{ t }}>
      <Table data={movements} {...tableProps} {...props} />
    </GlobalContext.Provider>
  );

const cell = (text) => screen.getByText(text).closest('td');
const longPress = (el, pointerType = 'touch') => {
  fireEvent.pointerDown(el, { button: 0, pointerType });
  act(() => vi.advanceTimersByTime(LONG_PRESS_MS));
  fireEvent.pointerUp(el);
  fireEvent.click(el);
};
const bar = () => screen.queryByRole('status');

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Cell selection', () => {
  it('a long press starts it, and it marks the cell', () => {
    renderTable();
    const salary = cell('3,200');
    longPress(salary);
    expect(salary).toHaveClass('cell-selected');
    expect(within(bar()).getByText('1 selectedCells')).toBeInTheDocument();
    expect(within(bar()).getByText('sumCells 3,200.00')).toBeInTheDocument();
  });

  it('a short press does nothing; moving away cancels the press', () => {
    renderTable();
    const salary = cell('3,200');
    fireEvent.pointerDown(salary, { button: 0, pointerType: 'touch' });
    fireEvent.pointerCancel(salary);
    act(() => vi.advanceTimersByTime(LONG_PRESS_MS));
    fireEvent.click(salary);
    expect(bar()).not.toBeInTheDocument();
  });

  it('then a tap adds or removes a cell, and an ingreso minus its gastos reads as Net', () => {
    renderTable();
    longPress(cell('3,200'));
    fireEvent.click(cell('950'));
    fireEvent.click(cell('84'));
    expect(within(bar()).getByText('netCells 2,165.65')).toBeInTheDocument();
    fireEvent.click(cell('84'));
    expect(within(bar()).getByText('netCells 2,250.00')).toBeInTheDocument();
  });

  it('only gastos read as a plain sum', () => {
    renderTable();
    longPress(cell('950'));
    fireEvent.click(cell('84'));
    expect(within(bar()).getByText('sumCells 1,034.35')).toBeInTheDocument();
  });

  it('the Gastos column subtracts in the balance tables', () => {
    renderTable({
      data: [{ month: 'Nov', incomes: 3810, expenses: 1076.85 }],
      columns: ['Month', 'In', 'Out'],
      orderColumnsList: ['month', 'incomes', 'expenses'],
      hiddenColumns: [],
      moneyColumns: ['incomes', 'expenses'],
    });
    longPress(cell('3,810'));
    fireEvent.click(cell('1,076'));
    expect(within(bar()).getByText('netCells 2,733.15')).toBeInTheDocument();
  });

  it('shows the details, and a cell removed by a filter still counts as hidden', () => {
    renderTable();
    longPress(cell('3,200'));
    fireEvent.click(cell('950'));
    fireEvent.click(screen.getByText('filter-first-row'));
    expect(within(bar()).getByText('2 selectedCells · 1 hiddenCells')).toBeInTheDocument();
    expect(within(bar()).getByText('netCells 2,250.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'moreStats' }));
    expect(within(bar()).getByText('1,125.00')).toBeInTheDocument();
    expect(within(bar()).getByText('-950.00')).toBeInTheDocument();
    expect(within(bar()).getByText('3,200.00')).toBeInTheDocument();
  });

  it('Ctrl + click starts it and Shift + click selects a range of the column', () => {
    renderTable();
    fireEvent.click(cell('3,200'), { ctrlKey: true });
    fireEvent.click(cell('84'), { shiftKey: true });
    expect(within(bar()).getByText('3 selectedCells')).toBeInTheDocument();
  });

  it('a plain click on a computer does not start it', () => {
    renderTable();
    fireEvent.click(cell('3,200'));
    expect(bar()).not.toBeInTheDocument();
  });

  it('follows the data: a new value updates the total, a deleted row leaves it', () => {
    const { rerender } = renderTable();
    longPress(cell('3,200'));
    fireEvent.click(cell('950'));
    const wrap = (data) => (
      <GlobalContext.Provider value={{ t }}>
        <Table data={data} {...tableProps} />
      </GlobalContext.Provider>
    );
    rerender(wrap([{ ...movements[0], val: 4000 }, movements[1], movements[2]]));
    expect(within(bar()).getByText('netCells 3,050.00')).toBeInTheDocument();
    rerender(wrap([movements[0], movements[2]]));
    expect(within(bar()).getByText('sumCells 3,200.00')).toBeInTheDocument();
    rerender(wrap([movements[2]]));
    expect(bar()).not.toBeInTheDocument();
  });

  it('the X and Escape clear it', () => {
    renderTable();
    longPress(cell('3,200'));
    fireEvent.click(screen.getByRole('button', { name: 'clearSelection' }));
    expect(bar()).not.toBeInTheDocument();
    longPress(cell('3,200'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(bar()).not.toBeInTheDocument();
  });

  it('removing the last cell ends it', () => {
    renderTable();
    longPress(cell('3,200'));
    fireEvent.click(cell('3,200'));
    expect(bar()).not.toBeInTheDocument();
  });

  it('a second table takes over: one selection at a time', () => {
    render(
      <GlobalContext.Provider value={{ t }}>
        <Table data={movements} {...tableProps} />
        <Table data={[{ name: 'Rent', total: 75 }]} columns={['Name', 'Total']} orderColumnsList={['name', 'total']} moneyColumns={['total']} label="Summary" />
      </GlobalContext.Provider>
    );
    longPress(cell('3,200'));
    longPress(cell('75'));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(within(bar()).getByText('sumCells 75.00')).toBeInTheDocument();
  });

  it('while selecting, a double click does not open the row', () => {
    const onRowDoubleClick = vi.fn();
    renderTable({ onRowDoubleClick });
    longPress(cell('3,200'));
    fireEvent.doubleClick(cell('950'));
    expect(onRowDoubleClick).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.doubleClick(cell('950'));
    expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('blocks the context menu of a long press, not of a right click', () => {
    renderTable();
    const salary = cell('3,200');
    fireEvent.pointerDown(salary, { button: 2, pointerType: 'mouse' });
    expect(fireEvent.contextMenu(salary)).toBe(true);
    fireEvent.pointerDown(salary, { button: 0, pointerType: 'touch' });
    expect(fireEvent.contextMenu(salary)).toBe(false);
    fireEvent.pointerUp(salary);
  });

  it('copies the total and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderTable();
    longPress(cell('3,200'));
    fireEvent.click(cell('950'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copyTotal' }));
    });
    expect(writeText).toHaveBeenCalledWith('2250.00');
    expect(screen.getByRole('button', { name: 'copied' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('button', { name: 'copyTotal' })).toBeInTheDocument();
  });

  it('without clipboard access the total stays on screen', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    renderTable();
    longPress(cell('3,200'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copyTotal' }));
    });
    expect(screen.getByRole('button', { name: 'copyTotal' })).toBeInTheDocument();
  });
});
