import Tab from '../Tab/Tab';
import Login from '../Auth/Login/Login';
import Register from '../Auth/Register/Register';
import ResetPassword from '../Auth/ResetPassword/ResetPassword';
import './Home.css';
import GlobalContext from '../../contexts/GlobalContext';
import { useContext, useState, useCallback, useRef } from 'react';

const LOGIN_TAPS_TO_REVEAL_REGISTER = 10;

const Home = () => {
  const { username, t, language, toggleLanguage } = useContext(GlobalContext);
  const [showRegister, setShowRegister] = useState(false);
  const loginButtonTapCountRef = useRef(0);

  const onLoginButtonClick = useCallback(() => {
    loginButtonTapCountRef.current += 1;
    if (loginButtonTapCountRef.current >= LOGIN_TAPS_TO_REVEAL_REGISTER) {
      setShowRegister(true);
    }
  }, []);

  return (
    <>
      {!username ? (
        <div>
          <span className="lang-container">
            <span className="lang" onClick={toggleLanguage}>
              {language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
            </span>
          </span>
          <h2 className="title">{t('login')}</h2>
          <Login t={t} onLoginButtonClick={onLoginButtonClick} />
          {showRegister ? (
            <>
              <h2 className="title">{t('register')}</h2>
              <Register t={t} />
              {/* Auth SPEC v0.5 (P5): the password reset lives in the same hidden panel */}
              <h2 className="title">{t('forgotPassword')}</h2>
              <ResetPassword t={t} />
            </>
          ) : null}
        </div>
      ) : (
        <Tab />
      )}
    </>
  );
};

export default Home;
