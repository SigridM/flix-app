import { global } from './globals.js';
// Fetch data from TMDB API
export async function fetchAPIData(endpoint) {
  const options = {
    // how themoviedb.org says to do it; Brad Traversy's method works better
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

  const data = await response.json();

  hideSpinner();

  return data;
}

// Make a request to do a simple title search
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

/* Make a request to do the more complicated keyword and
   filtered search */
export async function discoverAPIData(filters, filtersRefined = false) {
  showSpinner();

  let fetchString;
  if (filtersRefined) {
    // keywords will be in the filters
    fetchString = `${global.api.apiURL}discover/${global.search.space}?api_key=${global.api.apiKey}&language=en-US&page=${global.search.page}${filters}`;
  } else {
    const keywords = await getKeywordCodes();
    // const keywordString = keywords.join('%7C');
    const keywordString = keywords.join('|');

    fetchString = `${global.api.apiURL}discover/${global.search.space}?api_key=${global.api.apiKey}&language=en-US&with_keywords=${keywordString}&page=${global.search.page}${filters}`;
  }
  const response = await fetch(fetchString);

  const data = await response.json();

  hideSpinner();
  return data;
}

/* Show a spinner while doing the search in case the connection is slow */
function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

/* Hide the spinner after a search is complete */
function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}

/* Answer all of the keyword codes from the API that correspond to 
   the word in the search box. E.g., if the search term is 'comedy', 
   there are many keywords containing 'comedy', including 'romantic comedy',
   'musical comedy', 'comedy of errors', etc. Each of those has its own
   code, and the codes have to be combined in the search. */
async function getKeywordCodes() {
  const objects = await getKeywordObjects();
  return objects.map((ea) => ea.id);
}

/* Answer all of the keyword objects from the API that correspond to 
   the word in the search box. E.g., if the search term is 'comedy', 
   there are many keywords containing 'comedy', including 'romantic comedy',
   'musical comedy', 'comedy of errors', etc. Each of those has its own
   object containing both a name and an id; the id codes have to be combined 
   in the search, and the names can show up in the refine keyword filter's popUpMenu. */
export async function getKeywordObjects() {
  showSpinner();

  const response = await fetch(
    `${global.api.apiURL}search/keyword?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=1` //,
  );
  const data = await response.json();
  const totalPages = data.total_pages;
  const allKeywordObjects = data.results;
  let nextPage = 2;

  while (nextPage <= totalPages) {
    const response = await fetch(
      `${global.api.apiURL}search/keyword?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=${nextPage}` //,
    );
    const data = await response.json();
    allKeywordObjects.push(...data.results);
    nextPage++;
  }

  hideSpinner();

  return allKeywordObjects;
}
