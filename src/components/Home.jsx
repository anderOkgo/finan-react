import AuthService from '../services/auth.service';
import CardRow from './Tabs/Tabs';
import Login from './Login/Login';

const Home = () => {
  const currentUser = AuthService.getCurrentUser();
  return (
    <div className="container">
      <div>{!currentUser ? <Login></Login> : <CardRow />}</div>
    </div>
  );
};

export default Home;
