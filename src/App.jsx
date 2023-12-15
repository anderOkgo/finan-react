import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();
  const { toggleDarkMode } = useTheme();
  return (
    <div className="app">
      <Menu {...{ init, setInit, proc, toggleDarkMode }} />
      <Home {...{ setInit, init, setProc, proc }} />
    </div>
  );
};

export default App;
