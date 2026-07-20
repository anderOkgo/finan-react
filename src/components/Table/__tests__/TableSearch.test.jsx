import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableSearch from '../TableSearch';
import GlobalContext from '../../../contexts/GlobalContext';

const t = (key) => key;

const dataset = [
  { name: 'Coffee', tag: 'food' },
  { name: 'Bus ticket', tag: 'transport' },
  { name: 'Coffee beans', tag: 'food' },
];

const renderSearch = (props = {}) =>
  render(
    <GlobalContext.Provider value={{ t }}>
      <TableSearch
        setCurrentPage={vi.fn()}
        setFilteredData={vi.fn()}
        setItemsPerPage={vi.fn()}
        dataset={dataset}
        itemsPerPage={10}
        {...props}
      />
    </GlobalContext.Provider>
  );

describe('TableSearch', () => {
  it('shows the full dataset when the search box is empty', () => {
    const setFilteredData = vi.fn();
    renderSearch({ setFilteredData });
    expect(setFilteredData).toHaveBeenCalledWith(dataset);
  });

  it('AND-filters (comma-separated terms) requiring every term to match', () => {
    const setFilteredData = vi.fn();
    renderSearch({ setFilteredData });
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'coffee, beans' },
    });
    expect(setFilteredData).toHaveBeenLastCalledWith([{ name: 'Coffee beans', tag: 'food' }]);
  });

  it('OR-filters (plus-separated terms) matching any term', () => {
    const setFilteredData = vi.fn();
    renderSearch({ setFilteredData });
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'transport+beans' },
    });
    expect(setFilteredData).toHaveBeenLastCalledWith([
      { name: 'Bus ticket', tag: 'transport' },
      { name: 'Coffee beans', tag: 'food' },
    ]);
  });

  it('resets to page 1 when typing a new search term', () => {
    const setCurrentPage = vi.fn();
    renderSearch({ setCurrentPage });
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), { target: { value: 'coffee' } });
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('changes items-per-page and resets to page 1', () => {
    const setItemsPerPage = vi.fn();
    const setCurrentPage = vi.fn();
    renderSearch({ setItemsPerPage, setCurrentPage });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
    expect(setItemsPerPage).toHaveBeenCalledWith(20);
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });
});
