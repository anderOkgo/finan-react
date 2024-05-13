import PropTypes from 'prop-types';
import AuthService from '../../services/auth.service';
import Tab from '../Tab/Tab';
import Login from '../Login/Login';
import Register from '../Register/Register';
import './Home.css';

const Home = ({ setInit, init, setProc, proc }) => {
  const currentUser = AuthService.getCurrentUser();
  return (
    <>
      {!currentUser ? (
        <div>
          <h2 className="title">Login</h2>
          <Login {...{ setInit, init, setProc, proc }} />
          <h2 className="title">Register</h2>
          <Register {...{ setInit, init, setProc, proc }} />
        </div>
      ) : (
        <Tab {...{ setInit, init, setProc, proc }} />
      )}
    </>
  );
};

Home.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
};

export default Home;
