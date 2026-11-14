import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '../ResetPassword';
import GlobalContext from '../../../../contexts/GlobalContext';

vi.mock('../../../../services/auth.service', () => ({
  default: { requestPasswordReset: vi.fn(), confirmPasswordReset: vi.fn() },
}));
import AuthService from '../../../../services/auth.service';

const t = (key) => key;
const renderReset = (init = true) =>
  render(
    <GlobalContext.Provider value={{ init }}>
      <ResetPassword t={t} />
    </GlobalContext.Provider>
  );
const submit = () => fireEvent.submit(document.querySelector('form'));
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const toConfirmStep = async () => {
  AuthService.requestPasswordReset.mockResolvedValue({ message: 'If an account uses this email, a code was sent' });
  renderReset();
  type('email', 'sample@example.com');
  submit();
  await waitFor(() => expect(screen.getByLabelText('verificationCode')).toBeInTheDocument());
};

beforeEach(() => vi.clearAllMocks());

describe('ResetPassword (Auth SPEC v0.5, B1)', () => {
  it('starts with only the email and the Send code button', () => {
    renderReset();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.queryByLabelText('verificationCode')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'sendCode' })).toBeInTheDocument();
  });

  it('asks for a code, shows the one answer and moves to the code step with the email locked', async () => {
    await toConfirmStep();
    expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('sample@example.com');
    expect(screen.getByRole('status')).toHaveTextContent('If an account uses this email, a code was sent');
    expect(screen.getByLabelText('email')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'changePassword' })).toBeInTheDocument();
  });

  it('shows the API error of a code request and stays on the first step', async () => {
    AuthService.requestPasswordReset.mockResolvedValue({ err: { message: 'Invalid email format' } });
    renderReset();
    type('email', 'x');
    submit();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format'));
    expect(screen.queryByLabelText('verificationCode')).not.toBeInTheDocument();
  });

  it('keeps only digits in the code', async () => {
    await toConfirmStep();
    type('verificationCode', '12a 34-56');
    expect(screen.getByLabelText('verificationCode')).toHaveValue('123456');
  });

  it('refuses two different new passwords without calling the API', async () => {
    await toConfirmStep();
    type('verificationCode', '123456');
    type('newPassword', 'newSecret1');
    type('repeatNewPassword', 'newSecret2');
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('passwordsDoNotMatch');
    expect(AuthService.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('changes the password and shows the success message without a button', async () => {
    await toConfirmStep();
    AuthService.confirmPasswordReset.mockResolvedValue({ message: 'Password changed' });
    type('verificationCode', '123456');
    type('newPassword', 'newSecret1');
    type('repeatNewPassword', 'newSecret1');
    submit();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Password changed'));
    expect(AuthService.confirmPasswordReset).toHaveBeenCalledWith('sample@example.com', '123456', 'newSecret1');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('verificationCode')).not.toBeInTheDocument();
  });

  it('shows a wrong or expired code and lets the person try again', async () => {
    await toConfirmStep();
    AuthService.confirmPasswordReset.mockResolvedValue({ err: { message: 'Invalid or expired code' } });
    type('verificationCode', '000000');
    type('newPassword', 'newSecret1');
    type('repeatNewPassword', 'newSecret1');
    submit();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired code'));
    expect(screen.getByRole('button', { name: 'changePassword' })).toBeInTheDocument();
  });

  it('says Offline and calls nothing while the server is unreachable', () => {
    renderReset(false);
    type('email', 'sample@example.com');
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Offline');
    expect(AuthService.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('says Offline on the code step too', async () => {
    AuthService.requestPasswordReset.mockResolvedValue({ message: 'sent' });
    const { rerender } = renderReset();
    type('email', 'sample@example.com');
    submit();
    await waitFor(() => expect(screen.getByLabelText('verificationCode')).toBeInTheDocument());
    rerender(
      <GlobalContext.Provider value={{ init: false }}>
        <ResetPassword t={t} />
      </GlobalContext.Provider>
    );
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Offline');
    expect(AuthService.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('ignores a second submit while a request is running, and shows Sending', async () => {
    let finish;
    AuthService.requestPasswordReset.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderReset();
    type('email', 'sample@example.com');
    submit();
    expect(screen.getByRole('button', { name: 'sending' })).toBeDisabled();
    submit();
    expect(AuthService.requestPasswordReset).toHaveBeenCalledTimes(1);
    finish({ message: 'sent' });
    await waitFor(() => expect(screen.getByLabelText('verificationCode')).toBeInTheDocument());

    let done;
    AuthService.confirmPasswordReset.mockReturnValue(new Promise((resolve) => (done = resolve)));
    type('verificationCode', '123456');
    type('newPassword', 'newSecret1');
    type('repeatNewPassword', 'newSecret1');
    submit();
    submit();
    expect(AuthService.confirmPasswordReset).toHaveBeenCalledTimes(1);
    done({ message: 'Password changed' });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Password changed'));
  });

  it('shows a translated message for an empty email on the first step', () => {
    renderReset();
    const field = screen.getByLabelText('email');
    fireEvent.invalid(field);
    expect(field.validationMessage).toBe('pleaseFillThisField');
    fireEvent.input(field);
    expect(field.validationMessage).not.toBe('pleaseFillThisField');
  });

  it('shows a translated message for each empty field of the code step', async () => {
    await toConfirmStep();
    // The email is read-only there, so the browser does not validate it again
    ['verificationCode', 'newPassword', 'repeatNewPassword'].forEach((label) => {
      const field = screen.getByLabelText(label);
      fireEvent.change(field, { target: { value: '' } });
      fireEvent.invalid(field); // an empty required field gets the translated message
      expect(field.validationMessage).toBe('pleaseFillThisField');
      fireEvent.input(field); // typing clears it
      expect(field.validationMessage).not.toBe('pleaseFillThisField');
    });
  });
});
