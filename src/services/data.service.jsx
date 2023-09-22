import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';

const BASE_URL = set.baseUrl;
const API_URL = BASE_URL + 'api/finan/';

const balanceMonthly = async () => {
  return await helpHttp.get(API_URL + 'totalbank', {});
};

const totalBank = async (data) => {
  return await helpHttp.post(API_URL + 'totalbank', { body: data });
};

const boot = async () => {
  return await helpHttp.get(BASE_URL, { timeout: set.boot_timeout });
};

const insert = async (par) => {
  return await helpHttp.put(API_URL + 'insert', { body: par });
};

const DataService = { totalBank, insert, boot, balanceMonthly };

export default DataService;
