import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from '../Menu';
import GlobalContext from '../../../contexts/GlobalContext';

vi.mock('../../../services/auth.service', () => ({
  default: { logout: vi.fn() },
}));
import AuthService from '../../../services/auth.service';

const t = (key) => key;

const baseContext = {
  init: true,
  setInit: vi.fn(),
  proc: false,
  toggleDarkMode: vi.fn(),
  saveThemeAsDefault: vi.fn(),
  restoreThemeDefault: vi.fn(),
  boot: vi.fn(),
  username: undefined,
  t,
};

const renderMenu = (contextOverrides = {}) =>
  render(
    <GlobalContext.Provider value={{ ...baseContext, ...contextOverrides }}>
      <Menu />
    </GlobalContext.Provider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Menu', () => {
  it('shows the login link and hides logout when logged out', () => {
    renderMenu({ username: undefined });
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.queryByText('logout')).not.toBeInTheDocument();
  });

  it('shows the logout link and hides login when logged in', () => {
    renderMenu({ username: 'alice' });
    expect(screen.getByText('logout')).toBeInTheDocument();
    expect(screen.queryByText('login')).not.toBeInTheDocument();
  });

  it('boots and toggles dark mode when the status icon is clicked', () => {
    const boot = vi.fn();
    const toggleDarkMode = vi.fn();
    const { container } = renderMenu({ boot, toggleDarkMode });

    fireEvent.click(container.querySelector('.icon-activity'));
    expect(boot).toHaveBeenCalledTimes(1);
    expect(toggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('saves the theme as default on first double-click (no stored preference)', () => {
    const saveThemeAsDefault = vi.fn();
    const { container } = renderMenu({ saveThemeAsDefault });

    fireEvent.doubleClick(container.querySelector('.icon-activity'));
    expect(saveThemeAsDefault).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalled();
  });

  it('restores the system default theme on double-click when a preference is stored', () => {
    localStorage.setItem('themePreference', 'dark');
    const restoreThemeDefault = vi.fn();
    const { container } = renderMenu({ restoreThemeDefault });

    fireEvent.doubleClick(container.querySelector('.icon-activity'));
    expect(restoreThemeDefault).toHaveBeenCalledTimes(1);
  });

  it('logs out, marks init, and closes the mobile menu on logout click', () => {
    const setInit = vi.fn();
    renderMenu({ username: 'alice', setInit });

    fireEvent.click(screen.getByText('logout'));

    expect(AuthService.logout).toHaveBeenCalledTimes(1);
    expect(setInit).toHaveBeenCalled();
    expect(document.getElementById('checkbox_toggle').checked).toBe(false);
  });
});
