import { global } from './globals.js';

import {
  addFilterListeners,
  hasSelectedLanguages,
  hasSelectedGenres,
  setSelectedKeywords,
  setSelectedGenres,
  setSelectedLanguages,
  setExcludeAdult,
  setSortBy,
  keywordResultInfo,
  showFilters,
  hideFilters,
} from './filter.js';
import { SearchDetailReturnInfo } from './detailReturn.js';

/* Initialize the search form by adding even listeners to 
   the submit button. */
async function initSearchForm() {
  const searchForm = document.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      firstSearch();
    });
    await addFilterListeners();
  }
}

/* Clear any existing search results so a new search can be performed. */
export function clearSearchResults() {
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#search-results').innerHTML = '';
  Array.from(document.querySelectorAll('.pagination')).forEach(
    (ea) => (ea.innerHTML = '')
  );
}

// We landed on the search page, either from an intial search or because we are returning here from
// a details page. If the latter, the URL will hold all the information needed to restore the correct page
// for the correct search. Check the URL params to see if there is saved data there to decide from where to
// take the search data. If there are no URL params, wait for the user to click the search button.
export async function openSearchPage() {
  await initSearchForm();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.size > 0) {
    await returnSearch(urlParams);
  }
}

// Search Movies/Shows. We can come here because we are returning here from a details page.
// The URL will hold all the information needed to restore the correct page for the correct search.
// Check the URL to see if there is saved data there before taking the data from the
// inputs.
async function returnSearch(urlParams) {
  // Get the four paramaters common to both a title search and a keyword search.
  // These are searchSpace, searchType, searchTerm and page
  const searchSpace = urlParams.get('space');
  global.search.space = searchSpace;
  const isTV = searchSpace === 'tv';

  const searchType = urlParams.get('search-type');
  const isKeyword = searchType === 'keyword';

  const searchTerm = urlParams.get('search-term');
  global.search.term = searchTerm;

  const savedPage = Number(urlParams.get('page'));
  global.search.page = savedPage;

  // Set the three parameters that are visible in the DOM and common to both
  // title search and keyword search: searchSpace, searchType and searchTerm.
  // Page will be obtained from the global in the repeat search.
  let radioButtonPanel = document.querySelector('#search-radio-button-panel');
  if (radioButtonPanel) {
    radioButtonPanel.querySelector('#tv-radio-button').checked = isTV;
    radioButtonPanel.querySelector('#movie-radio-button').checked = !isTV;
    radioButtonPanel.querySelector('#search-by-title').checked = !isKeyword;
    radioButtonPanel.querySelector('#search-by-keyword').checked = isKeyword;
  }

  isKeyword ? showFilters() : hideFilters();

  let textInput = document.querySelector('#search-term');
  if (textInput) {
    textInput.value = searchTerm;
  }

  if (isKeyword) {
    await initializeFilterCriteraInDOMFrom(isTV, urlParams);
  }

  await doSearch(isTV);
}

/* We have returned from a detail view back to the search form. All of the
   information used to perform the last search was stored in the url on
   return from the details page. Restore the search and filter parameters
   in the DOM elements. */
async function initializeFilterCriteraInDOMFrom(isTV, urlParams) {
  const keywords = urlParams.get('keywords').split('-');
  const keywordCombiner = urlParams.get('keyword-combine-using');
  await setSelectedKeywords(keywords, keywordCombiner);
  const genres = urlParams.get('genres').split('-');
  const genreCombiner = urlParams.get('genre-combine-using');
  setSelectedGenres(isTV, genres, genreCombiner);
  const languages = urlParams.get('languages').split('-');
  setSelectedLanguages(languages);
  const excludeAdult = urlParams.get('exclude-adult') === 'true';
  setExcludeAdult(excludeAdult);
  const sortBy = urlParams.get('sort-by');
  setSortBy(sortBy);
}

// Search Movies/Shows. We can come here either from an intial search or because we are returning here from
// a details page. If the latter, the URL will hold all the information needed to restore the correct page
// for the correct search. Check the URL to see if there is saved data there before taking the data from the
// inputs.
async function firstSearch() {
  // Get search critera from the DOM
  const isTV = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#tv-radio-button').checked;
  global.search.space = isTV ? 'tv' : 'movie';

  const textInput = document.querySelector('#search-term');
  global.search.term = textInput.value;

  if (alertOnBlankSearchTerm(global.search.space === 'tv')) {
    return;
  }
  global.search.page = 1;

  doSearch(isTV);
}

/* Perform either a title or keyword search for either tv shows or 
   movies. The heavy lifting will be done by a DetailReturnInfo object,
   the specifics of which will be determined by parameters set in the
   global variable. This search can occur either as a result of the
   user clicking the search button, or as a 'return search' performed
   when we return from a details page. */
async function doSearch(isTV) {
  const returnInfo = getReturnInfo(isTV);
  const results = await returnInfo.getInitialResults();
  if (!results) {
    return;
  }
  if (results.length === 0) {
    clearSearchResults();
    return showAlert('No matches', 'alert-success');
  }
  returnInfo.displayResults(results);
}

/* Answser the DetailReturnInfo appropriate for doing a search, based
   on settings in the global and in the DOM. */
function getReturnInfo(isTV) {
  return searchByTitle()
    ? new SearchDetailReturnInfo(isTV, global.search.term, global.search.page)
    : keywordResultInfo(isTV);
}

/* Check for unrestricted searches, alert the user if unrestricted, and answer
   whether the search was unrestricted. Unrestricted means ablank search term for search-by-title
   or blank search term and no filters for search-by-keyword. */
function alertOnBlankSearchTerm(isTV) {
  const noSearchTerm = global.search.term === '' || global.search.term === null;

  // Check for unrestricted searches
  if (searchByTitle() && noSearchTerm) {
    showAlert('Please enter a word in the title');
    return true;
  }
  if (
    !searchByTitle() &&
    !hasSelectedLanguages() &&
    !hasSelectedGenres(isTV) &&
    noSearchTerm
  ) {
    showAlert('Please enter a keyword, one or more genres, or a language');
    return true;
  }
  return false;
}

/* Answer a Boolean, whether we are searching by title, based on what radio button
   is checked in the DOM.  */
function searchByTitle() {
  let radioButtonPanel = document.querySelector('#search-radio-button-panel');
  if (!radioButtonPanel) {
    return true;
  }
  return radioButtonPanel.querySelector('#search-by-title').checked;
}

// Show an alert to the user if there is not enough information to do a search
function showAlert(message, className = 'alert-error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000); // remove after 3 seconds
}
