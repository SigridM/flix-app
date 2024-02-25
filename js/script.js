import { global } from './globals.js';
import { displaySlider } from './imageManagement.js';
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
    const results = await searchAPIData();
    console.log(results);
  } else {
    showAlert('Please enter a search term');
  }
}

// Show Alert
function showAlert(message, className) {
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
