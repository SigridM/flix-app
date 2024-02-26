import { global } from './globals.js';
// Fetch data from TMDB API
export async function fetchAPIData(endpoint) {
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
    `${global.api.apiURL}${endpoint}?api_key=${global.api.apiKey}&language=en-US` //,
    // options
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

// Make request to search
export async function searchAPIData() {
  showSpinner();
  const response = await fetch(
    `${global.api.apiURL}search/${global.search.type}?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=${global.search.page}` //,
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
