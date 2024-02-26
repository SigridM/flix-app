import { global } from './globals.js';
import { displaySlider, displayResults } from './imageManagement.js';
import { displayDetails, displayPopular } from './commonElements.js';
import { searchAPIData } from './fetchData.js';

console.log(global.currentPage);

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link'); // all with class of nav-link
  links.forEach((link) => {
    if (link.getAttribute('href') == global.currentPage) {
      link.classList.add('active');
    }
  });
}

// Search Movies/Shows
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');
  console.log(global.search);

  if (global.search.term !== '' && global.search.term !== null) {
    // @todo - make request and display results
    const { results, total_pages, page, total_results } = await searchAPIData();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    if (results.length === 0) {
      showAlert('No matches', 'alert-success');
    }
    console.log(results);
    displayResults(
      results,
      'card',
      '#search-results',
      global.search.type == 'tv'
    );
    document.querySelector('#search-term').value = '';
    document.querySelector(
      '#search-results-heading'
    ).innerHTML = `<h2>${results.length} of ${global.search.totalResults} results for ${global.search.term}</h2>`;
    displayPagination();
  } else {
    showAlert('Please enter a search term');
  }
}

async function nextPage() {
  global.search.page++;
  const { results, total_pages } = await searchAPIData();
  clearPreviousResults();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.type == 'tv'
  );
  displayPagination();
}

async function previousPage() {
  global.search.page--;
  const { results, total_pages } = await searchAPIData();
  clearPreviousResults();
  displayResults(
    results,
    'card',
    '#search-results',
    global.search.type == 'tv'
  );
  displayPagination();
}
// Create and display pagination for search
function displayPagination() {
  console.log('in displayPagination');
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `
     <button class="btn btn-primary" id="prev">Prev</button>
     <button class="btn btn-primary" id="next">Next</button>
     <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
`;
  document.querySelector('#pagination').appendChild(div);
  // Disable prev button if on first page
  if (global.search.page == 1) {
    document.querySelector('#prev').disabled = true;
  }
  // Disable next button if on last page
  if (global.search.page == global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  // Next page
  document.querySelector('#next').addEventListener('click', nextPage);
  document.querySelector('#prev').addEventListener('click', previousPage);
}

// Clear previous results
function clearPreviousResults() {
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

// Init App - runs on every page
function init() {
  switch (
    global.currentPage // Simple router
  ) {
    case '/':
    case '/index.html':
      displaySlider();
      displayPopular();
      break;
    case '/shows.html':
      displaySlider(true);
      displayPopular(true);
      break;
    case '/movie-details.html':
      displayDetails();
      break;
    case '/tv-details.html':
      displayDetails(true);
      break;
    case '/search.html':
      console.log('Search');
      search();
      break;
  }
  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
