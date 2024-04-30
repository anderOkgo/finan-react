import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import AuthService from './auth.service';

const BASE_URL = set.base_url;
const API_URL = BASE_URL + set.api_url;

const balanceMonthly = async () => {
  return await helpHttp.get(API_URL + 'initial-load', {});
};

const formatToken = (token) => 'Bearer ' + token;

const initialLoad = async (data) => {
  return await helpHttp.post(API_URL + 'initial-load', {
    body: data,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};
const boot = async () => {
  return await helpHttp.get(BASE_URL, { timeout: set.boot_timeout });
};

const insert = async (par) => {
  return await helpHttp.post(API_URL + 'insert', {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const update = async (par) => {
  console.log(par);
  return await helpHttp.put(API_URL + 'update/' + par.id, {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const del = async (par) => {
  return await helpHttp.del(API_URL + 'delete/' + par.id, {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const DataService = { initialLoad, insert, update, del, boot, balanceMonthly };

export default DataService;
