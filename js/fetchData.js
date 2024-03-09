import { global } from './globals.js';
// Fetch data from TMDB API
export async function fetchAPIData(endpoint) {
  const options = {
    // how themoviedb.org says to do it
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: global.api.apiKey, // '0588b79e9e6f5bcfa157f943d262c18c',
    },
  };
  showSpinner();
  const response = await fetch(
    `${global.api.apiURL}${endpoint}?api_key=${global.api.apiKey}&language=en-US`
  );

  // const response = await fetch(
  //   `${global.api.apiURL}${endpoint}?language=en-US`,
  //   options
  // );
  const data = await response.json();

  hideSpinner();

  return data;
}

// Make request to search
export async function searchAPIData() {
  showSpinner();
  const response = await fetch(
    `${global.api.apiURL}search/${global.search.space}?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=${global.search.page}` //,
    // options
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

export async function discoverAPIData(filters) {
  showSpinner();
  const keywords = await getKeywordCodes();
  const keywordString = keywords.join('%7C');
  const fetchString = `${global.api.apiURL}discover/${global.search.space}?api_key=${global.api.apiKey}&language=en-US&with_keywords=${keywordString}&page=${global.search.page}${filters}`;
  console.log(fetchString);
  const response = await fetch(fetchString);

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

async function getKeywordCodes() {
  showSpinner();

  const response = await fetch(
    `${global.api.apiURL}search/keyword?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=1` //,
  );
  const data = await response.json();
  const totalPages = data.total_pages;
  const allKeywordCodes = data.results.map((ea) => ea.id);
  let nextPage = 2;

  while (nextPage <= totalPages) {
    const response = await fetch(
      `${global.api.apiURL}search/keyword?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=${nextPage}` //,
    );
    const data = await response.json();
    allKeywordCodes.push(...data.results.map((ea) => ea.id));
    nextPage++;
  }

  hideSpinner();

  return allKeywordCodes;
}
