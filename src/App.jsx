import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from '../src/hooks/useAlive';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();
  return (
    <div className="app">
      <Menu init={init} proc={proc} />
      <Home setInit={setInit} init={init} setProc={setProc} proc={proc} />
    </div>
  );
};

export default App;
