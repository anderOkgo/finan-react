import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import AuthService from './auth.service';

const BASE_URL = set.base_url;
const API_URL = BASE_URL + set.api_url;

const formatToken = (token) => 'Bearer ' + token;

const formatParams = (par) => {
  let { username } = AuthService.getUserName(AuthService.getCurrentUser().token);
  const { movement_name, movement_val, operate_for, movement_type, movement_date, movement_tag, currency } = par;
  return {
    movement_name: movement_name.trim(),
    movement_val: parseFloat(parseFloat(movement_val).toFixed(2)),
    operate_for,
    movement_type: parseInt(movement_type, 10),
    movement_date,
    movement_tag: movement_tag.trim(),
    currency,
    username,
  };
};

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
    body: formatParams(par),
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const update = async (par) => {
  return await helpHttp.put(API_URL + 'update/' + par.id, {
    body: formatParams(par),
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const del = async (par) => {
  let { username } = AuthService.getUserName(AuthService.getCurrentUser().token);
  return await helpHttp.del(API_URL + 'delete/' + par.id, {
    body: { username },
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const DataService = { initialLoad, insert, update, del, boot };

export default DataService;
