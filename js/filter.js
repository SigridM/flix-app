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
      createLanguagePopupMenu(languages); // also shows the menu
    } else {
      openPopupMenu('language-popup-menu');
      if (!languageFilter.checked) {
        clearSelected(languageFilter, 'language-popup-menu');
      }
    }
  });

  const languageLabel = document.querySelector('#language-label');
  languageLabel.addEventListener('click', function () {
    const popupMenu = document.getElementById('language-popup-menu');
    if (!popupMenu) {
      createLanguagePopupMenu(languages); // also shows the menu
    } else {
      togglePopupMenu('language-popup-menu');
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
  return genres;
}
async function getLanguages() {
  const genreContainer = document.querySelector('#genre-container');
  // @todo - get the list of genres from the API
  const languages = await fetchAPIData('configuration/languages');
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

function createMenuItem(checkbox, title, menuID) {
  const listItem = document.createElement('li');
  const anchor = document.createElement('a');

  anchor.href = '#';
  anchor.classList.add('filter-menu-item', 'unselected');
  anchor.textContent = title;
  anchor.addEventListener('click', function (event) {
    event.preventDefault();
    event.target.classList.toggle('selected');
    event.target.classList.toggle('unselected');
    moveSelectedToTop(checkbox, menuID);
  });
  listItem.appendChild(anchor);
  return listItem;
}

function createCloseMenuButtonItem(menuID) {
  const closeText = document.createElement('a');
  closeText.href = '#';
  closeText.classList.add('close-text');
  closeText.textContent = 'Close';
  closeText.addEventListener('click', function (event) {
    closeMenu(menuID, event);
  });

  const closeX = document.createElement('a');
  closeX.href = '#';
  closeX.classList.add('close-x');
  closeX.textContent = 'X';
  closeX.addEventListener('click', function (event) {
    closeMenu(menuID, event);
  });

  const listItem = document.createElement('li');
  listItem.id = 'close-menu-list-item';
  listItem.appendChild(closeText);
  listItem.appendChild(closeX);
  return listItem;
}

function createPopUpMenu(checkbox, titles, id) {
  const div = document.createElement('div');
  div.classList.add('popup-menu');
  div.id = id;
  const list = document.createElement('ul');
  const closeItem = createCloseMenuButtonItem(id);
  list.appendChild(closeItem);
  titles.forEach((title) => {
    const item = createMenuItem(checkbox, title, id);
    list.appendChild(item);
  });
  div.appendChild(list);
  div.style.display = 'block';
  return div;
}

function togglePopupMenu(menuID) {
  const popupMenu = document.getElementById(menuID);
  if (popupMenu.style.display === 'block') {
    popupMenu.style.display = 'none';
  } else {
    popupMenu.style.display = 'block';
  }
}
function clearSelected(checkbox, menuID) {
  const popupMenu = document.getElementById(menuID);
  const ul = popupMenu.querySelector('ul');

  // Sort the items in reverse alphabetical order so they can be re-added from the bottom up
  let selectedItems = Array.from(ul.querySelectorAll('.selected'));
  selectedItems.forEach((ea) => {
    ea.classList.toggle('selected');
    ea.classList.toggle('unselected');
  });

  moveSelectedToTop(checkbox, menuID);
}
function moveSelectedToTop(checkbox, menuID) {
  const popupMenu = document.getElementById(menuID);
  const ul = popupMenu.querySelector('ul');

  // Sort the items in reverse alphabetical order so they can be re-added from the bottom up
  let selectedItems = Array.from(ul.querySelectorAll('.selected')).sort(
    textContentSort
  );
  let unselectedItems = Array.from(ul.querySelectorAll('.unselected')).sort(
    textContentSort
  );

  // Remove the unselected items and re-add them in alphabetical order
  unselectedItems.forEach((ea) => {
    ul.removeChild(ea.parentNode);
    ul.insertBefore(ea.parentNode, ul.firstChild);
  });

  // Remove the selected items and re-add them in alphabetical order above the unselected items
  selectedItems.forEach((ea) => {
    ul.removeChild(ea.parentNode);
    ul.insertBefore(ea.parentNode, ul.firstChild);
  });

  const closeMenuItem = ul.querySelector('#close-menu-list-item');
  ul.removeChild(closeMenuItem);
  ul.insertBefore(closeMenuItem, ul.firstChild);

  checkbox.checked = selectedItems.length > 0;

  // Add a separator line if needed
  selectedItems = ul.querySelectorAll('.selected');

  const lastSelectedItem = selectedItems[selectedItems.length - 1];
  if (lastSelectedItem) {
    const nextListItem = lastSelectedItem.parentNode.nextElementSibling;

    if (nextListItem && !nextListItem.classList.contains('separator')) {
      // Add a separator line
      const separator = document.createElement('li');
      separator.className = 'separator';
      ul.insertBefore(separator, nextListItem);
    }
  } else {
    const separator = ul.querySelector('.separator');
    if (separator) {
      ul.removeChild(separator);
    }
  }
}

function closeMenu(menuID, event = null) {
  if (event) {
    event.preventDefault();
  }
  const popupMenu = document.getElementById(menuID);
  popupMenu.style.display = 'none';
}

function openPopupMenu(menuID) {
  const popupMenu = document.getElementById(menuID);
  popupMenu.style.display = 'block';
}

function createLanguagePopupMenu(languages) {
  const languageFilter = document.querySelector('#language-filter');
  const popUpDiv = createPopUpMenu(
    languageFilter,
    languages,
    'language-popup-menu'
  );
  const languageContainer = document.querySelector('#language-container');
  languageContainer.appendChild(popUpDiv);
  const checkboxRect = document
    .querySelector('#language-label')
    .getBoundingClientRect();
  popUpDiv.style.position = 'absolute';
  popUpDiv.style.top = checkboxRect.top + 'px';
  popUpDiv.style.left = checkboxRect.right + 'px';
}

function textContentSort(a, b) {
  if (a.textContent > b.textContent) {
    return -1; // Return -1 to indicate 'a' should come before 'b'
  }
  if (a.textContent < b.textContent) {
    return 1; // Return 1 to indicate 'b' should come before 'a'
  }
  return 0; // Return 0 if they are equal
}
