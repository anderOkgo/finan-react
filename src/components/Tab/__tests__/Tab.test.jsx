import { vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tab from '../Tab';
import GlobalContext from '../../../contexts/GlobalContext';
import cyfer from '../../../helpers/cyfer';
import set from '../../../helpers/set.json';
import { formattedDate } from '../../../helpers/operations';

// Every child already has its own dedicated suite (TabInput, TabGeneral,
// TabTag, TabBalance, TabInfo, currencySelector) -- same isolation
// strategy as every other component-tree test in this repo: stub each to a
// thin placeholder exposing just enough of its props to prove Tab.jsx
// wired them correctly, without re-rendering the real subtree.
vi.mock('../TabInput', () => ({
  default: ({ totalDay, operateFor }) => (
    <div data-testid="tabinput-mock">{JSON.stringify({ totalDay, operateFor })}</div>
  ),
}));
vi.mock('../TabGeneral', () => ({
  default: ({ movements, remainingBudget, setSelectedOption }) => (
    <div>
      <div data-testid="tabgeneral-mock">{JSON.stringify({ movementsCount: movements.length, remainingBudget })}</div>
      {/* TabGeneral opens a movement in Input this way (a double click on a row) */}
      <button type="button" onClick={() => setSelectedOption(1)}>
        open-in-input
      </button>
    </div>
  ),
}));
vi.mock('../TabInfo', () => ({
  default: ({ exchangeCol }) => <div data-testid="tabinfo-mock">{JSON.stringify(exchangeCol ?? null)}</div>,
}));
vi.mock('../TabTag', () => ({ default: () => <div data-testid="tabtag-mock" /> }));
vi.mock('../TabBalance', () => ({
  default: ({ bankTotal }) => <div data-testid="tabbalance-mock">{bankTotal}</div>,
}));
vi.mock('../../currencySelector/currencySelector', () => ({
  default: () => <div data-testid="currency-mock" />,
}));

vi.mock('../../../services/data.service', () => ({
  default: { initialLoad: vi.fn() },
}));
vi.mock('../../../services/auth.service', () => ({
  default: { logout: vi.fn() },
}));
import DataService from '../../../services/data.service';
import AuthService from '../../../services/auth.service';

// useSwipeableTabs has no dedicated suite of its own in this roadmap's
// scope (only components are covered by Phase 2.5) -- mocked here to a
// stateful stand-in (backed by a real useState, since it's invoked during
// Tab's own render) so selectedOption/setSelectedOption behave exactly
// like the real hook's return value, while letting the test capture and
// directly invoke the onSwipeChange callback Tab.jsx passes in, to
// simulate a swipe without needing real touch events.
let capturedOnSwipeChange;
vi.mock('../../../hooks/useSwipeableTabs', () => ({ default: vi.fn() }));
import useSwipeableTabs from '../../../hooks/useSwipeableTabs';

beforeEach(() => {
  useSwipeableTabs.mockImplementation((numOptions, threshold, onSwipeChange) => {
    const [selectedOption, setSelectedOption] = useState(1);
    capturedOnSwipeChange = onSwipeChange;
    return { selectedOption, setSelectedOption, handleTouchStart: vi.fn(), handleTouchEnd: vi.fn() };
  });
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const t = (key) => key;

const baseContext = (overrides = {}) => ({
  init: false,
  username: 'alice',
  role: 'user',
  language: 'en',
  toggleLanguage: vi.fn(),
  saveLanguageAsDefault: vi.fn(),
  restoreLanguageDefault: vi.fn(),
  t,
  navigation: { pushHistory: vi.fn(), currentState: null },
  ...overrides,
});

const renderTab = (contextValue) => render(<GlobalContext.Provider value={contextValue}>
  <Tab />
</GlobalContext.Provider>);

describe('Tab layout', () => {
  it('renders 4 tabs for a non-admin user, with no currency selector', () => {
    renderTab(baseContext({ role: 'user' }));
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryAllByTestId('currency-mock')).toHaveLength(0);
    expect(screen.getByTestId('tabinput-mock')).toBeInTheDocument();
    expect(screen.getByTestId('tabgeneral-mock')).toBeInTheDocument();
    expect(screen.getByTestId('tabtag-mock')).toBeInTheDocument();
    expect(screen.getByTestId('tabbalance-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('tabinfo-mock')).not.toBeInTheDocument();
  });

  it('renders a 5th Info tab and the currency selector for an admin user', () => {
    renderTab(baseContext({ role: 'admin' }));
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByTestId('tabinfo-mock')).toBeInTheDocument();
    // The lang/currency container is duplicated once per tab panel (this
    // component uses the CSS radio-sibling-selector tab technique, where
    // every panel -- including its lang/currency header -- is always
    // mounted; only the active one is shown via CSS jsdom doesn't apply).
    expect(screen.getAllByTestId('currency-mock')).toHaveLength(5);
  });
});

describe('Tab switching', () => {
  it("clicking a tab's label checks its radio and pushes tab-change history", () => {
    const navigation = { pushHistory: vi.fn(), currentState: null };
    renderTab(baseContext({ navigation }));

    const tab2Label = document.querySelector('label[for="tab-2"]');
    fireEvent.click(tab2Label);

    expect(document.getElementById('tab-2')).toBeChecked();
    expect(document.getElementById('tab-1')).not.toBeChecked();
    // isInitialMountRef flips to false in a mount-only effect that has
    // already run by the time this click fires, so the click is treated
    // as a real navigation, not the initial render.
    expect(navigation.pushHistory).toHaveBeenCalledWith('tab-change', { tabId: 2 });
  });

  it('a swipe reported via useSwipeableTabs onSwipeChange also pushes tab-change history', () => {
    const navigation = { pushHistory: vi.fn(), currentState: null };
    renderTab(baseContext({ navigation }));

    capturedOnSwipeChange(3);

    expect(navigation.pushHistory).toHaveBeenCalledWith('tab-change', { tabId: 3 });
  });

  it('restores the selected tab when navigation.currentState is a tab-change entry targeting a different tab', () => {
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'tab-change', data: { tabId: 3 } } };
    renderTab(baseContext({ navigation }));

    expect(document.getElementById('tab-3')).toBeChecked();
  });

  it('resets to tab 1 when navigation.currentState is the initial entry and a different tab is selected', () => {
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'tab-change', data: { tabId: 3 } } };
    const { rerender } = renderTab(baseContext({ navigation }));
    expect(document.getElementById('tab-3')).toBeChecked();

    rerender(
      <GlobalContext.Provider value={baseContext({ navigation: { pushHistory: vi.fn(), currentState: { type: 'initial' } } })}>
        <Tab />
      </GlobalContext.Provider>
    );

    expect(document.getElementById('tab-1')).toBeChecked();
  });

  it('does not throw when the context supplies no navigation object at all', () => {
    // Real crash bug found and fixed while writing this suite: the
    // restore-tab effect's dependency array read `navigation.currentState`
    // (no optional chaining) even though its own guard used
    // `navigation?.currentState` -- dependency arrays are evaluated every
    // render regardless of the guard, so this threw whenever `navigation`
    // was undefined. Same bug class, same fix, as TablePagination.jsx's
    // two effects (see that component's comments). Not observed in
    // production because the real app's single top-level Provider always
    // supplies `navigation`, but reachable in principle, same as there.
    expect(() => renderTab(baseContext({ navigation: undefined }))).not.toThrow();
  });
});

describe('Tab data fetching', () => {
  const fakeResp = {
    data: {
      totalExpenseDay: [{ Total_day: 42 }],
      movements: [{ id: 1, name: 'Coffee', val: 10, source: 'expense', tag: 'food', datemov: '2024-01-01', log: '' }],
      movementTag: [],
      totalBalance: [{ total_bank: 500 }],
      yearlyBalance: [],
      monthlyBalance: [],
      balanceUntilDate: [],
      generalInfo: [],
      tripInfo: [],
      monthlyExpensesUntilDay: [],
      monthlyBudget: 1000,
      currentMonthExpenses: 300,
      remainingBudget: 700,
    },
  };

  it('loads a cached snapshot from localStorage on mount, independent of init', () => {
    localStorage.setItem('storage', cyfer().cy(JSON.stringify(fakeResp), set.salt));

    renderTab(baseContext({ init: false }));

    expect(DataService.initialLoad).not.toHaveBeenCalled();
    expect(JSON.parse(screen.getByTestId('tabgeneral-mock').textContent)).toEqual({
      movementsCount: 1,
      remainingBudget: 700,
    });
    expect(screen.getByTestId('tabbalance-mock')).toHaveTextContent('500');
  });

  it('fetches fresh data via DataService.initialLoad when init is true, and caches the encrypted response', async () => {
    DataService.initialLoad.mockResolvedValue(fakeResp);

    renderTab(baseContext({ init: true }));

    await waitFor(() => expect(DataService.initialLoad).toHaveBeenCalledWith({ date: formattedDate(), currency: 'COP' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('tabgeneral-mock').textContent)).toEqual({ movementsCount: 1, remainingBudget: 700 })
    );

    const cached = localStorage.getItem('storage');
    expect(JSON.parse(cyfer().dcy(cached, set.salt))).toEqual(fakeResp);
  });

  it('logs the user out via AuthService when the fetch responds with a 401', async () => {
    DataService.initialLoad.mockResolvedValue({ err: { status: 401 } });

    renderTab(baseContext({ init: true }));

    await waitFor(() => expect(AuthService.logout).toHaveBeenCalled());
  });
});

describe('Tab language toggle', () => {
  it('shows switchToSpanish when language is en, and calls toggleLanguage on click', () => {
    const toggleLanguage = vi.fn();
    renderTab(baseContext({ language: 'en', toggleLanguage }));

    const langSpans = screen.getAllByText('switchToSpanish');
    expect(langSpans.length).toBeGreaterThan(0);
    fireEvent.click(langSpans[0]);
    expect(toggleLanguage).toHaveBeenCalled();
  });

  it('double-clicking the language label saves the current language as default when none is stored', () => {
    const saveLanguageAsDefault = vi.fn();
    renderTab(baseContext({ language: 'en', saveLanguageAsDefault }));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.doubleClick(screen.getAllByText('switchToSpanish')[0]);

    expect(saveLanguageAsDefault).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('languageUserDefault');
  });

  it('double-clicking restores the system default when a language preference is already stored', () => {
    localStorage.setItem('lang', 'en');
    const restoreLanguageDefault = vi.fn();
    renderTab(baseContext({ language: 'en', restoreLanguageDefault }));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.doubleClick(screen.getAllByText('switchToSpanish')[0]);

    expect(restoreLanguageDefault).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('languageSystemDefault');
  });

  it('shows switchToEnglish in Spanish, and plain-text alerts when the keys are not translated', () => {
    const blank = () => '';
    renderTab(baseContext({ language: 'es', t: blank }));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const label = document.querySelector('.lang');
    fireEvent.doubleClick(label);
    expect(window.alert).toHaveBeenCalledWith('Language: User Default');
    localStorage.setItem('lang', 'es');
    fireEvent.doubleClick(label);
    expect(window.alert).toHaveBeenCalledWith('Language: System Default');

    renderTab(baseContext({ language: 'es' }));
    expect(screen.getAllByText('switchToEnglish').length).toBeGreaterThan(0);
  });
});

describe('Tab history edge cases', () => {
  it('opens Input from another tab and records it', () => {
    const navigation = { pushHistory: vi.fn(), currentState: null };
    renderTab(baseContext({ navigation }));
    fireEvent.click(document.querySelector('label[for="tab-2"]'));
    fireEvent.click(screen.getByText('open-in-input'));
    expect(document.getElementById('tab-1')).toBeChecked();
    expect(navigation.pushHistory).toHaveBeenLastCalledWith('tab-change', { tabId: 1 });
  });

  it('changes tab without recording it when there is no history to record in', () => {
    renderTab(baseContext({ navigation: { currentState: null } }));
    fireEvent.click(document.querySelector('label[for="tab-2"]'));
    capturedOnSwipeChange(3);
    expect(document.getElementById('tab-2')).toBeChecked();
  });

  it('does not record clicks or swipes while a tab is being restored from history', () => {
    vi.useFakeTimers();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'tab-change', data: { tabId: 3 } } };
    renderTab(baseContext({ navigation }));
    expect(document.getElementById('tab-3')).toBeChecked();
    fireEvent.click(document.querySelector('label[for="tab-2"]'));
    capturedOnSwipeChange(4);
    expect(document.getElementById('tab-2')).toBeChecked();
    expect(navigation.pushHistory).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('ignores a history entry for the tab already shown, or without a tab', () => {
    // One at a time: every Tab's radios share the name "tab", so two in one document form one group
    const states = [
      { type: 'tab-change' },
      { type: 'tab-change', data: { tabId: 1 } },
      { type: 'initial' },
      { type: 'menu' },
    ];
    states.forEach((currentState) => {
      const { unmount } = renderTab(baseContext({ navigation: { pushHistory: vi.fn(), currentState } }));
      expect(document.getElementById('tab-1')).toBeChecked();
      unmount();
    });
  });
});

describe('Tab data edge cases', () => {
  it('fills defaults for a missing or malformed snapshot', () => {
    const odd = {
      data: {
        totalExpenseDay: [],
        totalBalance: [],
        generalInfo: 'not a list',
        balanceUntilDate: 'x',
        tripInfo: 'x',
        monthlyExpensesUntilDay: 'x',
        monthlyBudget: '1000',
        remainingBudget: '700',
      },
    };
    localStorage.setItem('storage', cyfer().cy(JSON.stringify(odd), set.salt));
    renderTab(baseContext({ role: 'admin' }));
    expect(JSON.parse(screen.getByTestId('tabinput-mock').textContent).totalDay).toBe(0);
    expect(screen.getByTestId('tabbalance-mock')).toHaveTextContent('-1');
    expect(JSON.parse(screen.getByTestId('tabgeneral-mock').textContent)).toEqual({ movementsCount: 0, remainingBudget: 0 });
  });

  it('finds the Colombian exchange row and the balance origins', () => {
    const resp = {
      data: {
        generalInfo: [{ detail: 'Other' }, { detail: 'Exchange Colombia', value: 4000 }],
        movements: [{ id: 1, source: 'balance' }, { id: 2, source: 'expense' }],
      },
    };
    localStorage.setItem('storage', cyfer().cy(JSON.stringify(resp), set.salt));
    renderTab(baseContext({ role: 'admin' }));
    expect(JSON.parse(screen.getByTestId('tabinfo-mock').textContent)).toEqual({ detail: 'Exchange Colombia', value: 4000 });
    expect(JSON.parse(screen.getByTestId('tabinput-mock').textContent).operateFor).toEqual([{ id: 1, source: 'balance' }]);
  });

  it('logs and goes on when the cached snapshot cannot be read', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorage.setItem('storage', cyfer().cy('not a snapshot', set.salt));
    renderTab(baseContext());
    expect(log).toHaveBeenCalled();
  });

  it('ignores a cached snapshot from the old cyfer (change 20261120-cyfer-v2): it reads as nothing', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorage.setItem('storage', 'not a snapshot');
    renderTab(baseContext());
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('skips an empty cached snapshot', () => {
    localStorage.setItem('storage', cyfer().cy(JSON.stringify({}), set.salt));
    renderTab(baseContext());
    expect(screen.getByTestId('tabbalance-mock')).toHaveTextContent('0');
  });

  it('keeps the cached data and stays logged in on a load error other than 401', async () => {
    DataService.initialLoad.mockResolvedValue({ err: { status: 500 } });
    renderTab(baseContext({ init: true }));
    await waitFor(() => expect(DataService.initialLoad).toHaveBeenCalled());
    expect(AuthService.logout).not.toHaveBeenCalled();
    expect(localStorage.getItem('storage')).toBeNull();
  });
});
