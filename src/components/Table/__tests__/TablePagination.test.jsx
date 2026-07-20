import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TablePagination from '../TablePagination';
import GlobalContext from '../../../contexts/GlobalContext';

const t = (key) => key;
const filteredData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

const renderWithContext = (ui, contextValue = { t }) =>
  render(<GlobalContext.Provider value={contextValue}>{ui}</GlobalContext.Provider>);

describe('TablePagination', () => {
  it('renders with no GlobalContext.Provider at all (context default is {})', () => {
    // GlobalContext's default value is `{}`, not null -- so useContext()
    // without a Provider returns `{}`, both `t` and `navigation` are
    // undefined, and `t('showing')` in the render throws regardless of
    // the navigation-related fix below (this is a real crash, but a
    // different, unrelated one -- the whole component assumes a Provider
    // is always present, which is true in the real app's single
    // top-level Provider).
    expect(() =>
      render(<TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />)
    ).toThrow();
  });

  it('renders when the context provides t but no navigation', () => {
    // Before the source fix, both dependency arrays read
    // `navigation.pushHistory`/`navigation.currentState` unconditionally,
    // which threw whenever `navigation` was undefined -- reachable
    // whenever a GlobalContext.Provider supplies `t` but not `navigation`.
    // Fixed with optional chaining; same bug and fix as
    // animecream-react's copy of this component.
    expect(() =>
      renderWithContext(
        <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
      )
    ).not.toThrow();
  });

  it('computes the showing-range label from currentPage/itemsPerPage', () => {
    renderWithContext(
      <TablePagination currentPage={2} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
    );
    expect(screen.getByText(/11-20/)).toBeInTheDocument();
  });

  it('disables prev on the first page and next on the last page', () => {
    const { rerender } = renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
    );
    expect(screen.getByText('prev')).toBeDisabled();
    expect(screen.getByText('next')).not.toBeDisabled();

    rerender(
      <GlobalContext.Provider value={{ t }}>
        <TablePagination currentPage={3} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
      </GlobalContext.Provider>
    );
    expect(screen.getByText('next')).toBeDisabled();
  });

  it('calls setCurrentPage with the clamped next/prev page', () => {
    const setCurrentPage = vi.fn();
    renderWithContext(
      <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} />
    );

    fireEvent.click(screen.getByText('next'));
    const updater = setCurrentPage.mock.calls[0][0];
    expect(updater(2)).toBe(3);
  });

  it('toggles the range slider enabled state on double-click', () => {
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
    );
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();

    fireEvent.doubleClick(slider.parentElement);
    expect(slider).not.toBeDisabled();
  });

  it('pushes pagination state to navigation.history when the page changes externally, skipping the initial page-1 mount', () => {
    const pushHistory = vi.fn();
    const navigation = { pushHistory, currentState: null };

    const { rerender } = renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} elemet="main-content" />,
      { t, navigation }
    );
    expect(pushHistory).not.toHaveBeenCalled();

    rerender(
      <GlobalContext.Provider value={{ t, navigation }}>
        <TablePagination currentPage={2} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} elemet="main-content" />
      </GlobalContext.Provider>
    );
    expect(pushHistory).toHaveBeenCalledWith('pagination', { page: 2, id: 'main-content' });
  });

  it('restores currentPage from navigation.currentState when it targets this element', () => {
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'pagination', data: { page: 3, id: 'main-content' } } };

    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="main-content" />,
      { t, navigation }
    );

    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  it('resets to page 1 when navigation restores the initial state', () => {
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'initial' } };

    renderWithContext(
      <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="main-content" />,
      { t, navigation }
    );

    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });
});
