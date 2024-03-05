import { fetchAPIData } from './fetchData.js';
import { global } from './globals.js';

export async function addFilterListeners(isTV = false) {
  const genreFilter = document.querySelector('#genre-filter');
  await fillLists();
  const genreNames = isTV
    ? global.lists.genres.tv.map((ea) => ea.name)
    : global.lists.genres.movies.map((ea) => ea.name);
  genreFilter.addEventListener('change', function () {
    if (genreFilter.checked) {
      console.log('Genre checkbox is checked');
      createGenreCheckboxes(genreNames);
    } else {
      clearGenreCheckboxes();
    }
  });

  const adultFilter = document.querySelector('#adult-filter');
  adultFilter.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('adult checkbox is checked');
    } else {
      console.log('adult checkbox is unchecked');
    }
  });

  const languageFilter = document.querySelector('#language-filter');
  const languages = global.lists.languages.map((ea) => ea.english_name).sort();
  languageFilter.addEventListener('change', function () {
    const popupMenu = document.getElementById('language-popup-menu');
    if (!popupMenu) {
      console.log('language checkbox is checked');
      const popUpDiv = createPopUpMenu(languages, 'language-popup-menu');
      const languageContainer = document.querySelector('#language-container');
      languageContainer.appendChild(popUpDiv);
      const checkboxRect = document
        .querySelector('#language-label')
        .getBoundingClientRect();
      popUpDiv.style.position = 'absolute';
      popUpDiv.style.top = checkboxRect.top + 'px';
      popUpDiv.style.left = checkboxRect.right + 'px';
    } else {
      togglePopupMenu('language-popup-menu');
      console.log('language checkbox is unchecked');
    }
  });
  const sortBy = document.querySelector('#sort-by');
  sortBy.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('sort-by checkbox is checked');
    } else {
      console.log('sort-by checkbox is unchecked');
    }
  });
  //@todo: put a span with flexible spacing in the filter.html with a space for a menu element
}

async function fillLists() {
  if (global.lists.genres.movies.length === 0) {
    const genreList = await getGenres();
    global.lists.genres.movies = genreList.genres;
  }
  if (global.lists.genres.tv.length === 0) {
    const genreList = await getGenres(true);
    global.lists.genres.tv = genreList.genres;
  }
  if (global.lists.languages.length === 0) {
    global.lists.languages = await getLanguages();
  }
}
async function getGenres(isTV = false) {
  const genreContainer = document.querySelector('#genre-container');
  // @todo - get the list of genres from the API
  const endPoint = `genre/${isTV ? 'tv' : 'movie'}/list`;
  const genres = await fetchAPIData(endPoint);
  console.log(genres);
  return genres;
}
async function getLanguages() {
  const genreContainer = document.querySelector('#genre-container');
  // @todo - get the list of genres from the API
  const languages = await fetchAPIData('configuration/languages');
  console.log(languages);
  return languages;
}
function createGenreCheckboxes(genreNames) {
  const genreContainer = document.querySelector('#genre-container');
  genreNames.forEach((genre) => {
    const checkbox = createCheckbox(genre);
    genreContainer.appendChild(checkbox);
  });
}

function createCheckbox(labelText) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = labelText.toLowerCase();

  const label = document.createElement('label');
  label.setAttribute('for', labelText.toLowerCase());
  label.textContent = '  ' + labelText;

  const br = document.createElement('br');

  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkbox-container');
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  checkboxContainer.appendChild(br);

  return checkboxContainer;
}

function clearGenreCheckboxes() {
  // Remove all child nodes from the container
  const genreContainer = document.querySelector('#genre-container');
  while (genreContainer.firstChild) {
    genreContainer.removeChild(genreContainer.firstChild);
  }
}

function createMenuItem(title, menuID) {
  const listItem = document.createElement('li');
  const anchor = document.createElement('a');

  anchor.href = '#';
  anchor.classList.add('filter-menu-item');
  anchor.textContent = title;
  anchor.addEventListener('click', function (event) {
    event.preventDefault();
    event.target.classList.toggle('selected');
    moveItemToTop(anchor.parentNode, menuID);
  });
  listItem.appendChild(anchor);
  return listItem;
}

function createPopUpMenu(titles, id) {
  const div = document.createElement('div');
  div.classList.add('popup-menu');
  div.id = id;
  const list = document.createElement('ul');
  titles.forEach((title) => {
    const item = createMenuItem(title, id);
    list.appendChild(item);
  });
  div.appendChild(list);
  div.style.display = 'block';
  return div;
}

function togglePopupMenu(id) {
  var popupMenu = document.getElementById(id);
  if (popupMenu.style.display === 'block') {
    popupMenu.style.display = 'none';
  } else {
    popupMenu.style.display = 'block';
  }
}

function moveItemToTop(item, menuID) {
  const popupMenu = document.getElementById(menuID);
  const ul = popupMenu.querySelector('ul');

  // Remove the item from its current position
  ul.removeChild(item);

  // Insert the item at the top
  ul.insertBefore(item, ul.firstChild);

  // Add a separator line if needed
  const selectedItems = ul.querySelectorAll('.selected');
  const lastSelectedItem = selectedItems[selectedItems.length - 1];
  const nextListItem = lastSelectedItem.parentNode.nextElementSibling;

  if (nextListItem && !nextListItem.classList.contains('separator')) {
    // Add a separator line
    const separator = document.createElement('li');
    separator.className = 'separator';
    // separator.innerHTML = '&nbsp;'; // Optional: add some content to the separator

    ul.insertBefore(separator, nextListItem);
  }
}
