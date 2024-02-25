export const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
  },
  api: {
    // Registor your key at https://www.themoviedb.org/settings/api and enter here
    // Only use this for development or very small projects you should store your key an dmake requests from a server
    apiKey: '0588b79e9e6f5bcfa157f943d262c18c', // if it's a production application, don't do this; use a backend server to store this key, make the request to the API from your server. Normallly, you'd have it in a .ENV file on your local server
    apiURL: 'https://api.themoviedb.org/3/',
  },
};
