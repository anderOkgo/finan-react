import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import GlobalStateContext from './contexts/GlobalStateContext';

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
    <GlobalStateContext.Provider value={globalState}>
      <div className="app">
        <Menu />
        <Home />
      </div>
    </GlobalStateContext.Provider>
  );
};

export default App;
