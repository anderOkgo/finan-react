import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../../services/auth.service';
import { translateApiMessage } from '../../../hooks/useLanguage';
import { onNativeInvalid, onNativeInput } from '../../../helpers/nativeValidation';
import GlobalContext from '../../../contexts/GlobalContext';
import '../Login/Login.css';
import './ResetPassword.css';

/**
 * Auth SPEC v0.5, B1 (P5): "Forgot your password?" in the hidden panel that also holds Register.
 * Step 1: the email → C4 (always the same answer). Step 2: the code and the new password twice → C5.
 * Design: module-docs/apps/finan/design/Login.dc.html (Reset step tweak).
 */
const ResetPassword = ({ t }) => {
  const { init } = useContext(GlobalContext);
  const [step, setStep] = useState('ask'); // ask → confirm → done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const send = async (e) => {
    e.preventDefault();
    if (!init) return setError(t('Offline'));
    if (busy) return undefined;
    setBusy(true);
    setError('');
    const resp = await AuthService.requestPasswordReset(email);
    setBusy(false);
    if (resp.err) return setError(translateApiMessage(t, resp.err.message));
    setNotice(translateApiMessage(t, resp.message));
    return setStep('confirm');
  };

  const change = async (e) => {
    e.preventDefault();
    if (!init) return setError(t('Offline'));
    if (busy) return undefined;
    if (newPassword !== repeat) return setError(t('passwordsDoNotMatch'));
    setBusy(true);
    setError('');
    const resp = await AuthService.confirmPasswordReset(email, code, newPassword);
    setBusy(false);
    if (resp.err) return setError(translateApiMessage(t, resp.err.message));
    setNotice(translateApiMessage(t, resp.message));
    return setStep('done');
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <form onSubmit={step === 'ask' ? send : change}>
          <div className="form-group">
            <label className="label" htmlFor="reset-email">
              {t('email')}
            </label>
            <input
              id="reset-email"
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInvalid={(e) => onNativeInvalid(e, t)}
              onInput={onNativeInput}
              autoComplete="email"
              readOnly={step !== 'ask'}
              required
            />
          </div>

          {step !== 'ask' && notice && (
            <p className="reset-notice" role="status">
              {notice}
            </p>
          )}

          {step === 'confirm' && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="reset-code">
                  {t('verificationCode')}
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onInvalid={(e) => onNativeInvalid(e, t)}
                  onInput={onNativeInput}
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reset-new">
                  {t('newPassword')}
                </label>
                <input
                  id="reset-new"
                  type="password"
                  className="form-control"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onInvalid={(e) => onNativeInvalid(e, t)}
                  onInput={onNativeInput}
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={20}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reset-repeat">
                  {t('repeatNewPassword')}
                </label>
                <input
                  id="reset-repeat"
                  type="password"
                  className="form-control"
                  name="repeat"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  onInvalid={(e) => onNativeInvalid(e, t)}
                  onInput={onNativeInput}
                  autoComplete="new-password"
                  maxLength={20}
                  required
                />
              </div>
            </>
          )}

          {error && (
            <p className="reset-error" role="alert">
              {error}
            </p>
          )}

          {step !== 'done' && (
            <div className="form-group">
              <button className="btn-primary btn-block" disabled={busy}>
                <span>{busy ? t('sending') : step === 'ask' ? t('sendCode') : t('changePassword')}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

ResetPassword.propTypes = {
  t: PropTypes.func.isRequired,
};

export default ResetPassword;
