import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../Home';
import GlobalContext from '../../../contexts/GlobalContext';

vi.mock('../../Tab/Tab', () => ({
  default: () => <div data-testid="tab-mock" />,
}));
vi.mock('../../Auth/Login/Login', () => ({
  default: ({ onLoginButtonClick }) => (
    <div data-testid="login-mock">
      <button onClick={onLoginButtonClick}>tap-login</button>
    </div>
  ),
}));
vi.mock('../../Auth/Register/Register', () => ({
  default: () => <div data-testid="register-mock" />,
}));

const t = (key) => key;

const renderHome = (contextOverrides = {}) =>
  render(
    <GlobalContext.Provider value={{ username: undefined, t, language: 'en', toggleLanguage: vi.fn(), ...contextOverrides }}>
      <Home />
    </GlobalContext.Provider>
  );

describe('Home', () => {
  it('shows the login screen when logged out', () => {
    renderHome({ username: undefined });
    expect(screen.getByTestId('login-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-mock')).not.toBeInTheDocument();
  });

  it('shows Tab once a username is present', () => {
    renderHome({ username: 'alice' });
    expect(screen.getByTestId('tab-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('login-mock')).not.toBeInTheDocument();
  });

  it('toggles the language on click, with the label reflecting the current language', () => {
    const toggleLanguage = vi.fn();
    renderHome({ language: 'en', toggleLanguage });
    expect(screen.getByText('switchToSpanish')).toBeInTheDocument();

    fireEvent.click(screen.getByText('switchToSpanish'));
    expect(toggleLanguage).toHaveBeenCalledTimes(1);
  });

  it('reveals Register only after 10 taps on the login button', () => {
    renderHome();
    const tapButton = screen.getByText('tap-login');

    for (let i = 0; i < 9; i++) fireEvent.click(tapButton);
    expect(screen.queryByTestId('register-mock')).not.toBeInTheDocument();

    fireEvent.click(tapButton);
    expect(screen.getByTestId('register-mock')).toBeInTheDocument();
  });
});
