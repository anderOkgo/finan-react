import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import GlobalContext from './contexts/GlobalContext';
import AuthService from './services/auth.service';

const App = () => {
  const { init, setInit, proc, setProc, boot } = useAlive();
  const {
    language,
    toggleLanguage,
    saveLanguageAsDefault,
    restoreSystemDefault: restoreLanguageDefault,
    t,
  } = useLanguage();
  const { toggleDarkMode, saveThemeAsDefault, restoreSystemDefault: restoreThemeDefault } = useTheme();
  if (AuthService.getCurrentUser()) {
    var { username, role } = AuthService.getUserName(AuthService.getCurrentUser()?.token);
  }

  const globalState = {
    init,
    setInit,
    proc,
    setProc,
    toggleDarkMode,
    saveThemeAsDefault,
    restoreThemeDefault,
    boot,
    username,
    role,
    language,
    toggleLanguage,
    saveLanguageAsDefault,
    restoreLanguageDefault,
    t,
  };

  return (
    <GlobalContext.Provider value={globalState}>
      <div className="app">
        <Menu />
        <Home />
      </div>
    </GlobalContext.Provider>
  );
};

export default App;
