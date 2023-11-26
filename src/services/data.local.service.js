function createCookie(name, value) {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes in milliseconds
  const cookieString = `${name}=${value}; expires=${expirationTime.toUTCString()}; path=/`;
  document.cookie = cookieString;
}

function checkCookieExistence(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName] = cookie.split('=').map((c) => c.trim());
    if (cookieName === name) {
      return true; // Cookie with the specified name exists
    }
  }
  return false; // Cookie with the specified name does not exist
}

const DataLocalService = { createCookie, checkCookieExistence };

export default DataLocalService;
