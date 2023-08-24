import AuthService from '../../services/auth.service';
import Tabs from '../Tabs/Tabs';
import Login from '../Login/Login';

const Home = () => {
  const currentUser = AuthService.getCurrentUser();
  return <>{!currentUser ? <Login /> : <Tabs />}</>;
};

export default Home;
