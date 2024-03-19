import { global } from './globals.js';

import {
  addFilterListeners,
  hasSelectedLanguages,
  hasSelectedGenres,
  setSelectedGenres,
  setSelectedLanguages,
  setExcludeAdult,
  setSortBy,
  keywordResultInfo,
  showFilters,
} from './filter.js';
import { SearchDetailReturnInfo } from './detailReturn.js';

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

export function clearSearchResults() {
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
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
  const radioButtonPanel = document.querySelector('#search-radio-button-panel');
  radioButtonPanel.querySelector('#tv').checked = isTV;
  radioButtonPanel.querySelector('#movie').checked = !isTV;
  radioButtonPanel.querySelector('#search-by-title').checked = !isKeyword;
  radioButtonPanel.querySelector('#search-by-keyword').checked = isKeyword;

  isKeyword
    ? showFilters()
    : (document.querySelector('#filter-container').style.display = 'none');

  const textInput = document.querySelector('#search-term');
  textInput.placeholder = searchTerm;

  if (isKeyword) {
    initializeFilterCriteraInDOMFrom(isTV, urlParams);
  }

  await doSearch(isTV);
}

function initializeFilterCriteraInDOMFrom(isTV, urlParams) {
  let genres = urlParams.get('genres');
  genres = genres.split(' ');
  const genreCombiner = urlParams.get('genre-combine-using');
  setSelectedGenres(isTV, genres, genreCombiner);
  const languages = urlParams.get('languages').split('+');
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
    .querySelector('#tv').checked;
  global.search.space = isTV ? 'tv' : 'movie';

  const textInput = document.querySelector('#search-term');
  global.search.term = textInput.value;

  if (alertOnBlankSearchTerm(global.search.space === 'tv')) {
    return;
  }
  global.search.page = 1;

  doSearch(isTV);
}

async function doSearch(isTV) {
  const returnInfo = getReturnInfo(isTV);
  const results = await returnInfo.getInitialResults();
  if (results.length === 0) {
    clearSearchResults();
    return showAlert('No matches', 'alert-success');
  }
  returnInfo.displayResults(results);
}

function getReturnInfo(isTV) {
  return searchByTitle()
    ? new SearchDetailReturnInfo(isTV, global.search.term, global.search.page)
    : keywordResultInfo(isTV);
}

// Check for unrestricted searches, alert the user if unrestricted, and answer
// whether the search was unrestricted. Unrestricted means ablank search term for search-by-title
// or blank search term and no filters for search-by-keyword.
function alertOnBlankSearchTerm(isTV) {
  const noSearchTerm = global.search.term === '' || global.search.term === null;

  // Check for unrestricted searches
  if (searchByTitle() && noSearchTerm) {
    showAlert('Please enter a word in the title');
    return true;
  }
  if (!hasSelectedLanguages() && !hasSelectedGenres(isTV) && noSearchTerm) {
    showAlert('Please enter a keyword, one or more genres, or a language');
    return true;
  }
  return false;
}
function searchByTitle() {
  return document
    .querySelector('#search-radio-button-panel')
    .querySelector('#search-by-title').checked;
}

// Show Alert
function showAlert(message, className = 'alert-error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000); // remove after 3 seconds
}
