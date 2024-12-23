import Tab from '../Tab/Tab';
import Login from '../Auth/Login/Login';
import Register from '../Auth/Register/Register';
import './Home.css';
import GlobalContext from '../../contexts/GlobalContext';
import { useContext } from 'react';

const Home = () => {
  const { username } = useContext(GlobalContext);

  return (
    <>
      {!username ? (
        <div>
          <h2 className="title">Login</h2>
          <Login />
          <h2 className="title">Register</h2>
          <Register />
        </div>
      ) : (
        <Tab />
      )}
    </>
  );
};

export default Home;
