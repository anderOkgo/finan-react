import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from '../src/hooks/useAlive';
import AuthService from '../src/services/auth.service';
import { useEffect, useState } from 'react';
import Status from '../src/components/Status/Status';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    user && setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  const title = 'Finanz';
  const menuItems = [
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/' },
    { label: 'R-Animecream', url: 'https://react.animecream.com/' },
    { label: 'Animecream', url: 'https://www.animecream.com/' },
    { label: 'Nabu', url: 'https://nabu.animecream.com/' },
    {
      label: 'session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'login', url: '/' },
        { isSessionNeeded: true, label: 'logout', url: '/', trigger: handleLogout },
      ],
    },
  ];
  return (
    <div className="app">
      <Menu {...{ init, proc, menuItems, title, currentUser, Status }} />
      <Home {...{ setInit, init, setProc, proc }} />
    </div>
  );
};

export default App;
