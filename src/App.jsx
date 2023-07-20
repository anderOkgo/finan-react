import { useState, useEffect } from 'react';
import './App.css';
import { helpHttp } from './helpers/helpHttp';
import Home from './Home';

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = async () => {
    const loginPayload = {
      first_name: username,
      password,
    };

    let options = {
      body: loginPayload,
    };

    const response = await helpHttp().post('http://localhost:3001/api/users/login', options);
    localStorage.setItem('user', JSON.stringify(response));
  };

  return (
    <div>
      <h1>Login</h1>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated) {
    return <Home />;
  } else {
    return <LoginComponent />;
  }
};

export default App;
