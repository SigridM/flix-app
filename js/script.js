import { global } from './globals.js';
import { displaySlider } from './imageManagement.js';
import { displayDetails, displayPopular } from './commonElements.js';
import { openSearchPage } from './search.js';

// Highlight active link (either Movies or TV Shows)
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link'); // all with class of nav-link
  links.forEach((link) => {
    let href = link.getAttribute('href');
    if (href === '/') {
      href = '/index.html';
    }
    if (href === '/' + currentPage()) {
      link.classList.add('active');
    }
  });
}

function currentPage() {
  let page = global.currentPage.split('/').slice(-1)[0];
  if (page === '') {
    page = 'index.html';
  }
  return page;
}

// Init App - runs on every page
async function init() {
  switch (
    currentPage() // Simple router
  ) {
    case '':
    case 'index.html':
      await displaySlider();
      await displayPopular();
      break;
    case 'shows.html':
      await displaySlider(true);
      await displayPopular(true);
      break;
    case 'movie-details.html':
      await displayDetails();
      break;
    case 'tv-details.html':
      await displayDetails(true);
      break;
    case 'search.html':
      await openSearchPage();

      break;
  }
  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
// window.addEventListener('load', init);
