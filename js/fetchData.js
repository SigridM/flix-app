// Fetch data from TMDB API
export async function fetchAPIData(endpoint) {
  // Registor your key at https://www.themoviedb.org/settings/api and enter here
  // Only use this for development or very small projects you should store your key an dmake requests from a server
  const API_KEY = '0588b79e9e6f5bcfa157f943d262c18c'; // if it's a production application, don't do this; use a backend server to store this key, make the request to the API from your server. Normallly, you'd have it in a .ENV file on your local server
  const API_URL = 'https://api.themoviedb.org/3/';

  const options = {
    // how themoviedb.org says to do it
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: '0588b79e9e6f5bcfa157f943d262c18c',
    },
  };
  showSpinner();
  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US` //,
    // options
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}
