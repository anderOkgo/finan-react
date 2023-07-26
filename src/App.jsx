import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AuthService from './services/auth.service';
import Login from './components/Login/Login';
import Register from './components/Register';
import Home from './components/Home';

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">Finan</div>
        <ul className="navbar-nav">
          {!currentUser ? (
            <li className="nav-item">
              <Link to={'/'} className="nav-link">
                Login
              </Link>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <a href="/" className="nav-link" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
