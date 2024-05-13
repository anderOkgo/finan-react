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
  if (response?.message === 'User created successfully') await login(username, password);
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
    return { err: true, message: response.err.response.message };
  } else {
    localStorage.setItem(cyfer().cy('user', formattedDate()), JSON.stringify(response));
    return { err: false };
  }
};

const logout = () => {
  localStorage.removeItem('storage');
  localStorage.removeItem(cyfer().cy('user', formattedDate()));
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(cyfer().cy('user', formattedDate())));
};

const getUserName = (token) => {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace(/_/g, '/');
    const decodedPayload = atob(base64);
    const decodedJson = JSON.parse(decodedPayload);
    return { role: decodedJson.role, username: decodedJson.username };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserName,
};

export default AuthService;
