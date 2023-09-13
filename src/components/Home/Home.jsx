import AuthService from '../../services/auth.service';
import Tabs from '../Tabs/Tabs';
import Login from '../Login/Login';
import { useAlive } from '../../hooks/useAlive';

const Home = () => {
  const { setInit, init, setProc, proc } = useAlive();
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
