const customFetch = async (endpoint, options = {}) => {
  const defaultHeaders = {
    Authorization: options.token,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const controller = new AbortController();
  const timeout = options.timeout || 7000;

  options.signal = controller.signal;
  options.method = options.method || 'GET';
  options.headers = { ...defaultHeaders, ...options.headers };

  options.body = JSON.stringify(options.body) || false;
  if (!options.body) delete options.body;

  setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(endpoint, options);
    return await (res.ok
      ? res.json()
      : Promise.reject({
          err: true,
          status: res.status || '00',
          statusText: res.statusText || 'Ocurrió un error',
        }));
  } catch (err) {
    return { err };
  }
};

const get = (url, options = {}) => customFetch(url, options);

const post = (url, options = {}) => {
  options.method = 'POST';
  return customFetch(url, options);
};

const put = (url, options = {}) => {
  options.method = 'PUT';
  return customFetch(url, options);
};

const del = (url, options = {}) => {
  options.method = 'DELETE';
  return customFetch(url, options);
};

const helpHttp = { get, post, put, del };

export default helpHttp;
