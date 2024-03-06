import { global } from './globals.js';
import { displayResults } from './imageManagement.js';
import { searchAPIData } from './fetchData.js';
import { addFilterListeners } from './filter.js';

// Search Movies/Shows
export async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');
  const savedPage = urlParams.get('page');
  addFilterListeners(global.search.type == 'tv');

  if (global.search.term === '' || global.search.term === null) {
    return showAlert('Please enter a search term');
  }
  global.search.page = savedPage ? Number(savedPage) : 1;

  document.querySelector('#movie').checked = global.search.type == 'movie';
  document.querySelector('#tv').checked = global.search.type == 'tv';

  const { results, total_pages, page, total_results } = await searchAPIData();
  global.search.page = page;
  global.search.totalPages = total_pages;
  global.search.totalResults = total_results;
  if (results.length === 0) {
    showAlert('No matches', 'alert-success');
  }
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.type == 'tv',
    false, // not swiper
    true // is search
  );
  displayPagination(results.length, global.search.type == 'tv');
}

function searchResultsHeading(resultsThisPage, isTV) {
  const beforeStart = 20 * (global.search.page - 1);
  const end = beforeStart + Math.min(resultsThisPage, 20);
  const h2 = document.createElement('h2');
  h2.textContent = `Showing ${beforeStart + 1} to ${end} of ${
    global.search.totalResults
  } results for ${isTV ? ' TV Shows' : ' Movies'} containing ' ${
    global.search.term
  } '`;
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
    global.search.type == 'tv',
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
    global.search.type == 'tv',
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
    global.search.type == 'tv',
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
    global.search.type == 'tv',
    false,
    true
  );
  displayPagination(results.length);
}

// Create and display pagination for search
function displayPagination(resultsThisPage, isTV) {
  const heading = document.querySelector('#search-results-heading');
  const h2 = searchResultsHeading(resultsThisPage, isTV);
  heading.appendChild(h2);

  const div = document.createElement('div');
  div.classList.add('pagination');

  const prevButton = document.createElement('button');
  prevButton.classList.add('btn', 'btn-primary');
  prevButton.id = 'prev';
  prevButton.textContent = 'Prev';
  prevButton.addEventListener('click', previousPage);
  prevButton.disabled = global.search.page == 1;

  const firstButton = document.createElement('button');
  firstButton.classList.add('btn', 'btn-primary');
  firstButton.id = 'first';
  firstButton.textContent = 'First';
  firstButton.addEventListener('click', firstPage);
  firstButton.disabled = global.search.page == 1;

  const nextButton = document.createElement('button');
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.id = 'next';
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', nextPage);
  nextButton.disabled = global.search.page == global.search.totalPages;

  const lastButton = document.createElement('button');
  lastButton.classList.add('btn', 'btn-primary');
  lastButton.id = 'last';
  lastButton.textContent = 'Last';
  lastButton.addEventListener('click', lastPage);
  lastButton.disabled = global.search.page == global.search.totalPages;

  const pageCounter = document.createElement('div');
  pageCounter.classList.add('page-counter');
  pageCounter.textContent =
    global.search.page + ' of ' + global.search.totalPages;

  div.appendChild(firstButton);
  div.appendChild(prevButton);
  div.appendChild(nextButton);
  div.appendChild(lastButton);

  div.appendChild(pageCounter);
  document.querySelector('#pagination').appendChild(div);
}

// Clear previous results
function clearPreviousPage() {
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
}
// Show Alert
function showAlert(message, className = 'alert-error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000); // remove after 3 seconds
}
