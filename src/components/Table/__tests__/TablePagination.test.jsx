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

  it('calls setCurrentPage with the clamped previous page', () => {
    const setCurrentPage = vi.fn();
    renderWithContext(
      <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} />
    );
    fireEvent.click(screen.getByText('prev'));
    const updater = setCurrentPage.mock.calls[0][0];
    expect(updater(2)).toBe(1);
    expect(updater(1)).toBe(1);
  });

  it('goes to a numbered page and scrolls to its table when it exists', () => {
    const setCurrentPage = vi.fn();
    const target = document.createElement('div');
    target.id = 'table-1';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="table-1" />
    );
    fireEvent.click(screen.getByText('3'));
    expect(setCurrentPage).toHaveBeenCalledWith(3);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(screen.getByText('1').className).toContain('active');
    target.remove();
  });

  it('goes to a numbered page without scrolling when the table is not found', () => {
    const setCurrentPage = vi.fn();
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="missing" />
    );
    fireEvent.click(screen.getByText('2'));
    expect(setCurrentPage).toHaveBeenCalledWith(2);
  });

  it('shows a full window of page buttons near the last page', () => {
    const many = Array.from({ length: 200 }, (_, i) => ({ id: i }));
    renderWithContext(
      <TablePagination currentPage={20} setCurrentPage={() => {}} filteredData={many} itemsPerPage={10} />
    );
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('moves to the page the enabled slider points at', () => {
    const setCurrentPage = vi.fn();
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} />
    );
    const slider = screen.getByRole('slider');
    fireEvent.doubleClick(slider.parentElement);
    fireEvent.change(slider, { target: { value: '2' } });
    expect(setCurrentPage).toHaveBeenCalledWith(2);
    fireEvent.doubleClick(slider.parentElement);
    expect(slider).toBeDisabled();
  });

  it('toggles the slider on a tap, not on a swipe or a cancelled touch', () => {
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
    );
    const slider = screen.getByRole('slider');
    const wrapper = slider.parentElement;

    fireEvent.touchStart(wrapper, { touches: [{ clientX: 10, clientY: 10 }] });
    fireEvent.touchMove(wrapper);
    fireEvent.touchEnd(wrapper);
    expect(slider).toBeDisabled();

    fireEvent.touchStart(wrapper, { touches: [{ clientX: 10, clientY: 10 }] });
    fireEvent.touchMove(wrapper);
    fireEvent.touchCancel(wrapper);
    fireEvent.touchEnd(wrapper);
    expect(slider).not.toBeDisabled();
  });

  it('toggles the slider on a left click, not on a drag or another button', () => {
    renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} />
    );
    const slider = screen.getByRole('slider');
    const wrapper = slider.parentElement;

    // A drag of more than 5 px is not a click
    fireEvent.mouseDown(wrapper, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(wrapper, { buttons: 1, clientX: 20, clientY: 0 });
    fireEvent.mouseUp(wrapper, { button: 0 });
    expect(slider).toBeDisabled();

    // A small wobble, or a move with no button held, is still a click
    fireEvent.mouseDown(wrapper, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(wrapper, { buttons: 1, clientX: 2, clientY: 2 });
    fireEvent.mouseMove(wrapper, { buttons: 0, clientX: 50, clientY: 50 });
    fireEvent.mouseUp(wrapper, { button: 0 });
    expect(slider).not.toBeDisabled();

    // A vertical drag counts too; the right button does nothing
    fireEvent.mouseDown(wrapper, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(wrapper, { buttons: 1, clientX: 0, clientY: 20 });
    fireEvent.mouseUp(wrapper, { button: 0 });
    fireEvent.mouseDown(wrapper, { button: 2 });
    fireEvent.mouseUp(wrapper, { button: 2 });
    expect(slider).not.toBeDisabled();
  });

  it('records the page in history on the first render when it is not page 1', () => {
    const pushHistory = vi.fn();
    renderWithContext(
      <TablePagination currentPage={2} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} elemet="t" />,
      { t, navigation: { pushHistory, currentState: null } }
    );
    expect(pushHistory).toHaveBeenCalledWith('pagination', { page: 2, id: 't' });
  });

  it('does not record a page change that came from history', () => {
    const pushHistory = vi.fn();
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory, currentState: { type: 'pagination', data: { page: 2, id: 't' } } };
    const { rerender } = renderWithContext(
      <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="t" />,
      { t, navigation }
    );
    expect(setCurrentPage).toHaveBeenCalledWith(2);
    rerender(
      <GlobalContext.Provider value={{ t, navigation }}>
        <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="t" />
      </GlobalContext.Provider>
    );
    expect(pushHistory).not.toHaveBeenCalled();
  });

  it('leaves the page alone when history already matches it, targets another table, or is initial on page 1', () => {
    const setCurrentPage = vi.fn();
    const states = [
      { type: 'pagination', data: { page: 1, id: 't' } },
      { type: 'pagination', data: { page: 3, id: 'other' } },
      { type: 'initial' },
    ];
    states.forEach((currentState) =>
      renderWithContext(
        <TablePagination currentPage={1} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} elemet="t" />,
        { t, navigation: { pushHistory: vi.fn(), currentState } }
      )
    );
    expect(setCurrentPage).not.toHaveBeenCalled();
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
