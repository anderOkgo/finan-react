import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import cyfer from '../helpers/cyfer';
import { formattedDate } from '../helpers/operations';

const BASE_URL = set.base_url;
const API_URL = BASE_URL + 'api/users/';

const register = async (username, email, password, verificationCode) => {
  const loginPayload = {
    username,
    email,
    password,
    verificationCode,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'add', options);
  if (!response.error) login(username, password);
  return response;
};

const login = async (username, password) => {
  const loginPayload = {
    username: username,
    password,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'login', options);
  if (response.token === undefined) {
    return false;
  } else {
    localStorage.setItem(cyfer().cy('user', formattedDate()), JSON.stringify(response));
    return true;
  }
};

const logout = () => {
  localStorage.removeItem(cyfer().cy('user', formattedDate()));
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(cyfer().cy('user', formattedDate())));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
