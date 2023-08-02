import helpHttp from '../helpers/helpHttp';

const API_URL = 'https://info.animecream.com/api/finan/';

const totalBank = async () => {
  return await helpHttp.get(API_URL + 'totalbank', {});
};

const insert = async (par) => {
  //return await helpHttp.put(API_URL + 'insert', par);
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append(
    'Authorization',
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub21icmUiOiJqb2EiLCJpYXQiOjE2Nzg2MTQzNzJ9.233oWiPpIlfzHyva4gdXBuobsssrEf3Ce4tGTZHWm-I'
  );

  var raw = JSON.stringify(par);

  var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch(API_URL + 'insert', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error));
};

const DataService = { totalBank, insert };

export default DataService;
