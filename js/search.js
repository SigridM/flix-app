import { global } from './globals.js';
import { displayResults } from './imageManagement.js';
import { searchAPIData } from './fetchData.js';
import { addFilterListeners, getFilterResults } from './filter.js';

// Search Movies/Shows
export async function search() {
  const radioButtonPanel = document.querySelector('#search-radio-button-panel');

  global.search.space = radioButtonPanel.querySelector('#movie').checked
    ? 'movie'
    : 'tv';
  const textInput = document.querySelector('#search-term');
  global.search.term = textInput.value;
  console.log(global.search);
  // http://127.0.0.1:5500/search.html?type=movie&search-term=&filter=movie-genre&movie-genre-container-combine-using=and&filter=language&language-container-combine-using=and
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const savedPage = urlParams.get('page');

  const searchByTitle =
    radioButtonPanel.querySelector('#search-by-title').checked;
  if (
    searchByTitle &&
    (global.search.term === '' || global.search.term === null)
  ) {
    return showAlert('Please enter a word in the title');
  } else {
    const searchBox = document.querySelector('#search-term');
    searchBox.placeholder = global.search.term;
  }
  global.search.page = savedPage ? Number(savedPage) : 1;

  document.querySelector('#movie').checked = global.search.space == 'movie';
  document.querySelector('#tv').checked = global.search.space == 'tv';

  const { results, total_pages, page, total_results } = searchByTitle
    ? await searchAPIData()
    : await getFilterResults(global.search.space == 'tv');

  global.search.page = page;
  global.search.totalPages = total_pages;
  global.search.totalResults = total_results;
  if (results.length === 0) {
    return showAlert('No matches', 'alert-success');
  }
  clearPreviousPage();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.space == 'tv',
    false, // not swiper
    true // is search
  );
  displayPagination(results.length, global.search.space == 'tv', searchByTitle);
}

function searchResultsHeading(numResultsThisPage, isTV, isSearchByTitle) {
  const beforeStart = 20 * (global.search.page - 1);
  const end = beforeStart + Math.min(numResultsThisPage, 20);
  const quotedSearchTerm = `'${global.search.term}'`;
  const totalResults = global.search.totalResults.toLocaleString();
  let h2 = document.querySelector('#results-heading');
  if (!h2) {
    h2 = document.createElement('h2');
  }
  h2.id = 'results-heading';
  h2.textContent = `Showing ${
    beforeStart + 1
  } to ${end} of ${totalResults} results for ${isTV ? ' TV Shows' : ' Movies'} 
  ${
    isSearchByTitle
      ? ' with ' + quotedSearchTerm + ' in the title'
      : ' containing ' + quotedSearchTerm
  }`;
  return h2;
}
async function nextPage() {
  global.search.page++;
  const { results, total_pages } = await searchAPIData();
  clearPreviousPage();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.space == 'tv',
    false,
    true
  );
  displayPagination(results.length);
}

async function previousPage() {
  global.search.page--;
  const { results, total_pages } = await searchAPIData();
  clearPreviousPage();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.space == 'tv',
    false,
    true
  );
  displayPagination(results.length);
}

async function firstPage() {
  global.search.page = 1;
  const { results, total_pages } = await searchAPIData();
  clearPreviousPage();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.space == 'tv',
    false,
    true
  );
  displayPagination(results.length);
}

async function lastPage() {
  global.search.page = global.search.totalPages;
  const { results, total_pages } = await searchAPIData();
  clearPreviousPage();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.space == 'tv',
    false,
    true
  );
  displayPagination(results.length);
}

// Create and display pagination for search
function displayPagination(numResultsThisPage, isTV, isSearchByTitle) {
  const heading = document.querySelector('#search-results-heading');
  const h2 = searchResultsHeading(numResultsThisPage, isTV, isSearchByTitle);
  heading.appendChild(h2);

  let paginationDiv = document.querySelector('.pagination');
  if (!paginationDiv) {
    paginationDiv = document.createElement('div');
    paginationDiv.classList.add('pagination');
    document.querySelector('#pagination').appendChild(paginationDiv);
  }

  const firstButton = paginationButton('First', firstPage, paginationDiv);
  firstButton.disabled = global.search.page == 1;

  const prevButton = paginationButton('Prev', previousPage, paginationDiv);
  prevButton.disabled = global.search.page == 1;

  const nextButton = paginationButton('Next', nextPage, paginationDiv);
  nextButton.disabled = global.search.page == global.search.totalPages;

  let lastButton = paginationButton('Last', lastPage, paginationDiv);
  lastButton.disabled = global.search.page == global.search.totalPages;

  let pageCounter = document.querySelector('.page-counter');
  if (!pageCounter) {
    pageCounter = document.createElement('div');
    pageCounter.classList.add('page-counter');
    paginationDiv.appendChild(pageCounter);
  }
  pageCounter.textContent =
    global.search.page + ' of ' + global.search.totalPages;
}

function paginationButton(text, listenerFuntion, paginationDiv) {
  const id = text.toLowerCase();
  let button = document.getElementById(id);
  if (!button) {
    button = document.createElement('button');
    button.classList.add('btn', 'btn-primary');
    button.id = id;
    button.textContent = text;
    button.addEventListener('click', listenerFuntion);
    paginationDiv.appendChild(button);
  }
  return button;
}
// Clear previous results
function clearPreviousPage() {
  document.querySelector('#search-results').innerHTML = '';
  // document.querySelector('#search-results-heading').innerHTML = '';
  // document.querySelector('#pagination').innerHTML = '';
}
// Show Alert
function showAlert(message, className = 'alert-error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000); // remove after 3 seconds
}
