import AuthService from '../../services/auth.service';
import Tabs from '../Tabs/Tabs';
import Login from '../Login/Login';

// eslint-disable-next-line react/prop-types
const Home = ({ setInit, init, setProc, proc }) => {
  const currentUser = AuthService.getCurrentUser();
  return (
    <>
      {!currentUser ? (
        <Login setInit={setInit} init={init} setProc={setProc} proc={proc} />
      ) : (
        <Tabs setInit={setInit} init={init} setProc={setProc} proc={proc} />
      )}
    </>
  );
};

export default Home;
