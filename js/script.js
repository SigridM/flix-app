import { global } from './globals.js';
import { displaySlider } from './imageManagement.js';
import { displayDetails, displayPopular } from './commonElements.js';
import { search } from './search.js';
import { addFilterListeners } from './filter.js';

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link'); // all with class of nav-link
  links.forEach((link) => {
    if (link.getAttribute('href') == global.currentPage) {
      link.classList.add('active');
    }
  });
}

// Init App - runs on every page
function init() {
  switch (
    global.currentPage // Simple router
  ) {
    case '/':
    case '/index.html':
      initSearchForm();
      displaySlider();
      displayPopular();
      break;
    case '/shows.html':
      initSearchForm();
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
      initSearchForm();
      // search();
      break;
  }
  highlightActiveLink();
}

function initSearchForm() {
  const searchForm = document.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      search();
    });
    addFilterListeners();
  }
}

document.addEventListener('DOMContentLoaded', init);
