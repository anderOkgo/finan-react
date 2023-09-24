import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import cyfer from '../helpers/cyfer';

const BASE_URL = set.baseUrl;
const API_URL = BASE_URL + 'api/users/';

const register = (username, email, password) => {
  return helpHttp.post(API_URL, {
    username,
    email,
    password,
  });
};

const login = async (username, password) => {
  const loginPayload = {
    first_name: username,
    password,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'login', options);
  if (response.token === undefined) {
    return false;
  } else {
    console.log(cyfer().cy('user', 'enter'));
    localStorage.setItem(cyfer().cy('user', 'enter'), JSON.stringify(response));
    return true;
  }
};

const logout = () => {
  localStorage.removeItem(cyfer().cy('user', 'enter'));
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(cyfer().cy('user', 'enter')));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
