import { vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Table from '../Table';
import GlobalContext from '../../../contexts/GlobalContext';

// Confirmed live (not dead code, unlike animecream-react's own Table.jsx):
// a basename grep for "Table/Table" across src/ turns up direct imports
// from TabGeneral.jsx, TabTag.jsx, TabInfo.jsx, TabBalance.jsx, and
// Form.jsx -- all of which already mock it in their own suites the way
// every other already-tested child is mocked here. TableSearch and
// TablePagination have their own dedicated suites, so they're mocked here
// too, isolating Table.jsx's own logic: column reordering, hidden/money
// columns, sorting, row actions, and the onFilteredDataChange callback.
vi.mock('../TableSearch', () => ({
  default: (props) => (
    <div data-testid="table-search-mock">{JSON.stringify({ itemsPerPage: props.itemsPerPage, datasetLength: props.dataset.length })}</div>
  ),
}));
vi.mock('../TablePagination', () => ({
  default: (props) => (
    <div data-testid="table-pagination-mock">
      {JSON.stringify({ currentPage: props.currentPage, itemsPerPage: props.itemsPerPage, filteredLength: props.filteredData.length, elemet: props.elemet })}
    </div>
  ),
}));

const t = (key) => key;

const data = [
  { name: 'Zeta', value: 30, tag: 'x', log: 'secret-1' },
  { name: 'Alpha', value: 10, tag: '', log: 'secret-2' },
  { name: 'Mid', value: 20, tag: 'z', log: 'secret-3' },
];

const renderTable = (props = {}, contextValue = { t }) =>
  render(
    <GlobalContext.Provider value={contextValue}>
      <Table data={data} columns={['Name', 'Value', 'Tag', 'Log']} orderColumnsList={['name', 'value', 'tag', 'log']} label="Test table" {...props} />
    </GlobalContext.Provider>
  );

const bodyRows = () => within(screen.getAllByRole('table')[0]).getAllByRole('row').slice(1); // drop header row

describe('Table rendering', () => {
  it('reorders columns per orderColumnsList and renders every row', () => {
    renderTable();
    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['Zeta', '30', 'x', 'secret-1']);
  });

  it('formats moneyColumns via tableMoneyFormat, splitting whole/decimals into a span', () => {
    renderTable({ moneyColumns: ['value'] });
    const rows = bodyRows();
    const valueCell = within(rows[1]).getAllByRole('cell')[1]; // Alpha's value = 10
    expect(valueCell).toHaveTextContent('10.00');
    expect(valueCell.querySelector('.money-decimals')).toHaveTextContent('.00');
    expect(valueCell).toHaveClass('money-column');
  });

  it('renders 0 instead of an empty string for a falsy non-money cell value', () => {
    renderTable();
    const rows = bodyRows();
    // Alpha's tag is '' -- t('') === '' triggers the `value === '' ? 0 : value` fallback.
    expect(within(rows[1]).getAllByRole('cell')[2]).toHaveTextContent('0');
  });

  it('hides a column from the header but still renders its (empty-visually) cell with a hidden-column class', () => {
    // Real gotcha, not a guess: hiddenColumns is matched against two
    // different arrays depending on where it's checked. renderTableHeader
    // filters whatever array is actually rendered as the header -- here
    // that's the `columns` display-label prop ('Log'), since columns.length
    // > 0. renderTableColumns, however, always iterates the raw object-key
    // `header` state ('log') to build each row's cells and className. A
    // hiddenColumns entry that only matches one casing hides the column
    // from one of the two but not the other -- exactly why TabGeneral.jsx's
    // real usage lists both casings (`['id', 'Id', 'ID', 'log', 'Log', ...]`)
    // instead of a single value.
    renderTable({ hiddenColumns: ['Log', 'log'] });
    const headerCells = within(screen.getAllByRole('table')[0]).getAllByRole('columnheader');
    expect(headerCells.map((c) => c.textContent.trim())).toEqual(['Name', 'Value', 'Tag']);

    const rows = bodyRows();
    const logCell = within(rows[0]).getAllByRole('cell')[3];
    expect(logCell).toHaveClass('hidden-column');
  });

  it('hiding only the display-label casing removes the header cell but leaves the row cell unhidden', () => {
    renderTable({ hiddenColumns: ['Log'] });
    const headerCells = within(screen.getAllByRole('table')[0]).getAllByRole('columnheader');
    expect(headerCells.map((c) => c.textContent.trim())).toEqual(['Name', 'Value', 'Tag']);

    // The row cell is still present and NOT marked hidden-column, since
    // renderTableColumns checked the raw key 'log', which isn't in this
    // hiddenColumns list.
    const rows = bodyRows();
    const logCell = within(rows[0]).getAllByRole('cell')[3];
    expect(logCell).not.toHaveClass('hidden-column');
    expect(logCell).toHaveTextContent('secret-1');
  });

  it('passes dataset/itemsPerPage down to TableSearch and currentPage/filteredData down to TablePagination', () => {
    renderTable();
    expect(JSON.parse(screen.getByTestId('table-search-mock').textContent)).toEqual({ itemsPerPage: 20, datasetLength: 3 });
    expect(JSON.parse(screen.getByTestId('table-pagination-mock').textContent)).toEqual({
      currentPage: 1,
      itemsPerPage: 20,
      filteredLength: 3,
      elemet: 'Test table',
    });
  });

  it('notifies the parent of filtered-data changes via onFilteredDataChange', () => {
    const onFilteredDataChange = vi.fn();
    renderTable({ onFilteredDataChange });
    expect(onFilteredDataChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Zeta' }), expect.objectContaining({ name: 'Alpha' }), expect.objectContaining({ name: 'Mid' })])
    );
  });
});

describe('Table sorting', () => {
  it('sorts ascending on first click and toggles to descending on a second click of the same column', () => {
    renderTable();
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });

    fireEvent.click(nameHeader);
    let rows = bodyRows();
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual(['Alpha', 'Mid', 'Zeta']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveTextContent('Name ▲');

    fireEvent.click(screen.getByRole('columnheader', { name: /Name/ }));
    rows = bodyRows();
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual(['Zeta', 'Mid', 'Alpha']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveTextContent('Name ▼');
  });
});

describe('Table row interactions', () => {
  it('invokes onRowDoubleClick with the row item on a double-click', () => {
    const onRowDoubleClick = vi.fn();
    renderTable({ onRowDoubleClick });
    fireEvent.doubleClick(bodyRows()[0]);
    expect(onRowDoubleClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Zeta' }));
  });

  it('adds an actions column and wires onRowEdit/onRowDelete to their buttons, stopping propagation', () => {
    const onRowEdit = vi.fn();
    const onRowDelete = vi.fn();
    const onRowDoubleClick = vi.fn();
    renderTable({ onRowEdit, onRowDelete, onRowDoubleClick });

    expect(screen.getByRole('columnheader', { name: 'actions' })).toBeInTheDocument();

    const firstRow = bodyRows()[0];
    fireEvent.click(within(firstRow).getByTitle('edit'));
    expect(onRowEdit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Zeta' }));

    fireEvent.click(within(firstRow).getByTitle('delete'));
    expect(onRowDelete).toHaveBeenCalledWith(expect.objectContaining({ name: 'Zeta' }));

    // Both buttons call e.stopPropagation(), so neither click should also
    // trigger the row's own onDoubleClick handler.
    expect(onRowDoubleClick).not.toHaveBeenCalled();
  });

  it('omits the actions column entirely when neither onRowEdit nor onRowDelete is provided', () => {
    renderTable();
    expect(screen.queryByRole('columnheader', { name: 'actions' })).not.toBeInTheDocument();
  });
});
