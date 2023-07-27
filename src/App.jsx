import './App.css';
import Home from './components/Home';
import Menu from './components/Menu/Menu';

const App = () => {
  return (
    <div className="app">
      <Menu></Menu>
      <div>{<Home />}</div>
    </div>
  );
};

export default App;
