import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import GlobalContext from './contexts/GlobalContext';

const App = () => {
  const { init, setInit, proc, setProc, boot } = useAlive();
  const { toggleDarkMode } = useTheme();

  const globalState = {
    init,
    setInit,
    proc,
    setProc,
    toggleDarkMode,
    boot,
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
