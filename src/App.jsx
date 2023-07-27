import './App.css';
import Home from './components/Home';
import Menu from './components/Menu/Menu';

const App = () => {
  return (
    <div className="app">
      <Menu />
      <Home />
    </div>
  );
};

export default App;
