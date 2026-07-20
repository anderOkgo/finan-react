import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register';
import GlobalContext from '../../../../contexts/GlobalContext';

vi.mock('../../../../services/auth.service', () => ({
  default: { register: vi.fn() },
}));
import AuthService from '../../../../services/auth.service';

const t = (key) => key;

const renderRegister = (contextOverrides = {}) =>
  render(
    <GlobalContext.Provider value={{ init: true, setInit: vi.fn(), setProc: vi.fn(), ...contextOverrides }}>
      <Register t={t} />
    </GlobalContext.Provider>
  );

// Several fields carry HTML5 `required`; submitting via fireEvent.submit
// dispatches straight to React's onSubmit, bypassing native constraint
// validation the same way Card/AdminPanel's suites already established
// this codebase's forms need (see animecream-react's AdminPanel.test.jsx
// for the jsdom file-input gotcha that originally forced this pattern).
const submitForm = () => fireEvent.submit(document.querySelector('form'));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Register', () => {
  it('strips whitespace from the username as it is typed', () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText('usernameForRegistration'), { target: { value: 'al ice ' } });
    expect(screen.getByLabelText('usernameForRegistration')).toHaveValue('alice');
  });

  it('registers successfully: alerts the message, reveals the verification-code field, and marks init', async () => {
    AuthService.register.mockResolvedValue({ message: 'Check your email' });
    const setInit = vi.fn();
    renderRegister({ setInit });

    fireEvent.change(screen.getByLabelText('usernameForRegistration'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@x.com' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    submitForm();

    await waitFor(() => expect(AuthService.register).toHaveBeenCalledWith('alice', 'a@x.com', 'secret', ''));
    expect(window.alert).toHaveBeenCalledWith('Check your email');
    expect(screen.getByLabelText('verificationCode')).toBeInTheDocument();
    expect(setInit).toHaveBeenCalled();
  });

  it('alerts the translated error and does not reveal the verification-code field on failure', async () => {
    AuthService.register.mockResolvedValue({ err: { message: 'Username already taken' } });
    renderRegister();

    fireEvent.change(screen.getByLabelText('usernameForRegistration'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@x.com' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    submitForm();

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(screen.queryByLabelText('verificationCode')).not.toBeInTheDocument();
  });

  it('alerts Offline and never calls AuthService when init is falsy', () => {
    renderRegister({ init: false });
    submitForm();

    expect(window.alert).toHaveBeenCalledWith('Offline');
    expect(AuthService.register).not.toHaveBeenCalled();
  });
});
