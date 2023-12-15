import PropTypes from 'prop-types';
import AuthService from '../../services/auth.service';
import Tab from '../Tab/Tab';
import Login from '../Login/Login';

const Home = ({ setInit, init, setProc, proc }) => {
  const currentUser = AuthService.getCurrentUser();
  return (
    <>
      {!currentUser ? (
        <Login {...{ setInit, init, setProc, proc }} />
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
