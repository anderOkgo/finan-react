import { vi } from 'vitest';
import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import GlobalContext from '../contexts/GlobalContext';

// The hooks and the two children have their own suites: here they are stand-ins, to check
// that App puts every value in the one GlobalContext and reads the user from the session.
vi.mock('../hooks/useAlive', () => ({
  useAlive: () => ({ init: 1, setInit: vi.fn(), proc: 0, setProc: vi.fn(), boot: vi.fn() }),
}));
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    toggleLanguage: vi.fn(),
    saveLanguageAsDefault: vi.fn(),
    restoreSystemDefault: vi.fn(),
    t: (k) => k,
  }),
}));
vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ isDarkMode: true, toggleDarkMode: vi.fn(), saveThemeAsDefault: vi.fn(), restoreSystemDefault: vi.fn() }),
}));
vi.mock('../hooks/useNavigationHistory', () => ({
  useNavigationHistory: () => ({ currentState: { type: 'initial' } }),
}));
vi.mock('../services/auth.service', () => ({ default: { getCurrentUser: vi.fn(), getUserName: vi.fn() } }));
vi.mock('../components/Menu/Menu', () => ({ default: () => <nav data-testid="menu" /> }));
vi.mock('../components/Home/Home', () => ({
  default: function HomeStandIn() {
    const ctx = useContext(GlobalContext);
    const keys = Object.keys(ctx).sort().join(',');
    return <main data-testid="home" data-keys={keys} data-user={`${ctx.username}|${ctx.role}`} />;
  },
}));
import AuthService from '../services/auth.service';
import App from '../App';

describe('App', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gives Menu and Home the whole global state, with the logged-in user', () => {
    AuthService.getCurrentUser.mockReturnValue({ token: 'tok' });
    AuthService.getUserName.mockReturnValue({ username: 'sample', role: 'admin' });
    render(<App />);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    const home = screen.getByTestId('home');
    expect(home.dataset.user).toBe('sample|admin');
    expect(AuthService.getUserName).toHaveBeenCalledWith('tok');
    expect(home.dataset.keys.split(',')).toEqual(
      [
        'boot',
        'init',
        'isDarkMode',
        'language',
        'navigation',
        'proc',
        'restoreLanguageDefault',
        'restoreThemeDefault',
        'role',
        'saveLanguageAsDefault',
        'saveThemeAsDefault',
        'setInit',
        'setProc',
        't',
        'toggleDarkMode',
        'toggleLanguage',
        'username',
      ].sort()
    );
  });

  it('has no user without a session', () => {
    AuthService.getCurrentUser.mockReturnValue(null);
    render(<App />);
    expect(screen.getByTestId('home').dataset.user).toBe('undefined|undefined');
    expect(AuthService.getUserName).not.toHaveBeenCalled();
  });

  it('reads no token when the session is gone by the second read', () => {
    AuthService.getCurrentUser.mockReturnValueOnce({ token: 'tok' }).mockReturnValueOnce(null);
    AuthService.getUserName.mockReturnValue({ username: undefined, role: undefined });
    render(<App />);
    expect(AuthService.getUserName).toHaveBeenCalledWith(undefined);
  });
});
