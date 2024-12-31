import Tab from '../Tab/Tab';
import Login from '../Auth/Login/Login';
import Register from '../Auth/Register/Register';
import './Home.css';
import GlobalContext from '../../contexts/GlobalContext';
import { useContext } from 'react';

const Home = () => {
  const { username, t, language, toggleLanguage } = useContext(GlobalContext);

  return (
    <>
      {!username ? (
        <div>
          <span className="lang" onClick={toggleLanguage}>
            {language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
          </span>
          <h2 className="title">{t('login')}</h2>
          <Login t={t} />
          <h2 className="title">{t('register')}</h2>
          <Register t={t} />
        </div>
      ) : (
        <Tab />
      )}
    </>
  );
};

export default Home;
