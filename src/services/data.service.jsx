import helpHttp from '../helpers/helpHttp';

const API_URL = 'https://info.animecream.com/api/finan/';

const totalBank = async () => {
  return await helpHttp.get(API_URL + 'totalbank', {});
};

const insert = async (par) => {
  return await helpHttp.put(API_URL + 'insert', {
    body: par,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

const DataService = { totalBank, insert };

export default DataService;
