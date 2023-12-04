import AuthService from '../../services/auth.service';
import Tabs from '../Tab/Tab';
import Login from '../Login/Login';

// eslint-disable-next-line react/prop-types
const Home = ({ setInit, init, setProc, proc }) => {
  const currentUser = AuthService.getCurrentUser();
  return (
    <>
      {!currentUser ? (
        <Login {...{ setInit, init, setProc, proc }} />
      ) : (
        <Tabs {...{ setInit, init, setProc, proc }} />
      )}
    </>
  );
};

export default Home;
