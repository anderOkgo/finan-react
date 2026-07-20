import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import GlobalContext from '../../../../contexts/GlobalContext';

vi.mock('../../../../services/auth.service', () => ({
  default: { login: vi.fn() },
}));
import AuthService from '../../../../services/auth.service';

const t = (key) => key;

const renderLogin = (contextOverrides = {}, props = {}) =>
  render(
    <GlobalContext.Provider value={{ init: true, setInit: vi.fn(), setProc: vi.fn(), ...contextOverrides }}>
      <Login t={t} {...props} />
    </GlobalContext.Provider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Login', () => {
  it('logs in with the typed credentials and marks init on success', async () => {
    AuthService.login.mockResolvedValue({ message: 'ok' });
    const setInit = vi.fn();
    renderLogin({ setInit });

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.submit(screen.getByRole('button', { name: 'login' }).closest('form'));

    await waitFor(() => expect(AuthService.login).toHaveBeenCalledWith('alice', 'secret'));
    expect(setInit).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('alerts the translated error message on failed login, without marking init false', async () => {
    AuthService.login.mockResolvedValue({ err: { message: 'Invalid credentials' } });
    const setInit = vi.fn();
    renderLogin({ setInit });

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: 'login' }).closest('form'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    // Bad credentials != server offline -- setInit(false) must NOT be called.
    expect(setInit).not.toHaveBeenCalledWith(false);
  });

  it('alerts Offline and never calls AuthService when init is falsy', () => {
    renderLogin({ init: false });

    fireEvent.submit(screen.getByRole('button', { name: 'login' }).closest('form'));

    expect(window.alert).toHaveBeenCalledWith('Offline');
    expect(AuthService.login).not.toHaveBeenCalled();
  });

  it('calls the optional onLoginButtonClick when the submit button is clicked', () => {
    const onLoginButtonClick = vi.fn();
    AuthService.login.mockResolvedValue({ message: 'ok' });
    renderLogin({}, { onLoginButtonClick });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(onLoginButtonClick).toHaveBeenCalledTimes(1);
  });
});
