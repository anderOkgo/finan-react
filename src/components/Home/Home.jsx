import AuthService from '../../services/auth.service';
import Tab from '../Tab/Tab';
import Login from '../Auth/Login/Login';
import Register from '../Auth/Register/Register';
import './Home.css';

const Home = () => {
  const currentUser = AuthService.getCurrentUser();

  return (
    <>
      {!currentUser ? (
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
