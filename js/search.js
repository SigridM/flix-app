import { global } from './globals.js';

import { getSelectedLanguages, getSelectedGenres } from './filter.js';
import {
  KeywordSearchDetailReturnInfo,
  TitleSearchDetailReturnInfo,
} from './detailReturn.js';

// Search Movies/Shows. We can come here either from an intial search or because we are returning here from
// a details page. If the latter, the URL will hold all the information needed to restore the correct page
// for the correct search. Check the URL to see if there is saved data there before taking the data from the
// inputs.
export async function search() {
  const isTV = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#tv').checked;
  global.search.space = isTV ? 'tv' : 'movie';
  const textInput = document.querySelector('#search-term');
  global.search.term = textInput.value;
  console.log(global.search);
  // http://127.0.0.1:5500/search.html?type=movie&search-term=&filter=movie-genre&movie-genre-container-combine-using=and&filter=language&language-container-combine-using=and
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  console.log(urlParams);
  const savedPage = urlParams.get('page');

  const noSearchTerm = global.search.term === '' || global.search.term === null;

  // Check for unrestricted searches
  if (searchByTitle() && noSearchTerm) {
    return showAlert('Please enter a word in the title');
  } else if (
    getSelectedLanguages().length === 0 &&
    getSelectedGenres(global.search.space === 'tv').length === 0 &&
    noSearchTerm
  ) {
    return showAlert(
      'Please enter a keyword, one or more genres, or a language'
    );
  }
  const searchBox = document.querySelector('#search-term');
  searchBox.placeholder = global.search.term;
  global.search.page = savedPage ? Number(savedPage) : 1;

  document.querySelector('#movie').checked = global.search.space == 'movie';
  document.querySelector('#tv').checked = global.search.space == 'tv';

  const returnInfo = searchByTitle()
    ? new TitleSearchDetailReturnInfo(
        isTV,
        global.search.term,
        global.search.page
      )
    : new KeywordSearchDetailReturnInfo(
        isTV,
        global.search.term,
        global.search.page
      );
  const results = await returnInfo.getInitialResults();
  if (results.length === 0) {
    return showAlert('No matches', 'alert-success');
  }
  returnInfo.displayResults(results);
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
