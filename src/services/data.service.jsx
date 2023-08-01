import helpHttp from '../helpers/helpHttp';

const API_URL = 'https://info.animecream.com/api/finan/totalbank';

const totalBank = async () => {
  let ad = await helpHttp.get(API_URL, {});
  return ad;
};

const DataService = { totalBank };

export default DataService;
