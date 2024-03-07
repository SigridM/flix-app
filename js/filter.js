import { discoverAPIData, fetchAPIData } from './fetchData.js';
import { global } from './globals.js';

export async function addFilterListeners(isTV = false) {
  await fillLists();

  let menuInfo;

  const genreNames = isTV
    ? global.lists.genres.tv.map((ea) => ea.name)
    : global.lists.genres.movies.map((ea) => ea.name);

  menuInfo = {
    checkbox: document.querySelector('#genre-filter-checkbox'),
    popupName: 'genre-popup-menu',
    label: document.querySelector('#genre-label'),
    container: document.querySelector('#genre-container'),
    contents: genreNames,
    isExlcusive: false,
    sortFunction: textContentSort,
  };
  addListenersTo(menuInfo);

  menuInfo = {
    checkbox: document.querySelector('#adult-filter-checkbox'),
    popupName: 'adult-popup-menu',
    label: document.querySelector('#adult-label'),
    container: document.querySelector('#adult-container'),
    contents: ['Adult Only', 'Non-Adult Only'],
    isExlcusive: true,
    sortFunction: textContentSort,
  };
  addListenersTo(menuInfo);

  menuInfo = {
    checkbox: document.querySelector('#language-filter-checkbox'),
    popupName: 'language-popup-menu',
    label: document.querySelector('#language-label'),
    container: document.querySelector('#language-container'),
    contents: global.lists.languages.map((ea) => ea.english_name).sort(),
    isExlcusive: false,
    sortFunction: textContentSort,
  };
  addListenersTo(menuInfo);

  menuInfo = {
    checkbox: document.querySelector('#sort-by-checkbox'),
    popupName: 'sort-by-popup-menu',
    label: document.querySelector('#sort-by-label'),
    container: document.querySelector('#sort-by-container'),
    contents: global.lists.sortCritera,
    isExlcusive: true,
    sortFunction: textContentSort,
  };
  addListenersTo(menuInfo);

  const submitButton = document.querySelector('#filter-submit-button');
  submitButton.addEventListener('click', function (event) {
    event.preventDefault();
    doFilter(isTV);
  });
}

async function doFilter(isTV) {
  closeAllPopups();
  const andJoinString = '%2C';
  const orJoinString = '%7C';

  let filters = '';
  const genres = getSelectedGenreCodes(isTV);
  if (genres.length > 0) {
    filters += '&with_genres=' + genres.join(orJoinString);
  }
  const languages = getSelectedLanguageCodes();
  if (languages.length > 0) {
    filters += '&with_original_language=' + languages.join(orJoinString);
  }
  console.log(await discoverAPIData(filters));
}

function getSelectedGenres(isTV) {
  const popupMenu = document.querySelector('#genre-popup-menu');
  if (!popupMenu) {
    return [];
  }
  const selected = Array.from(
    popupMenu.querySelector('ul').querySelectorAll('.selected')
  ).map((ea) => ea.textContent);
  return selected;
}
function getSelectedGenreCodes(isTV) {
  const wholeList = isTV ? global.lists.genres.tv : global.lists.genres.movies;

  const selectedGenreNames = getSelectedGenres(isTV);
  const selectedGenreCodes = wholeList
    .filter((ea) => selectedGenreNames.includes(ea.name))
    .map((ea) => ea.id);
  return selectedGenreCodes;
}

function getSelectedLanguages() {
  const popupMenu = document.querySelector('#language-popup-menu');
  if (!popupMenu) {
    return [];
  }
  const selected = Array.from(
    popupMenu.querySelector('ul').querySelectorAll('.selected')
  ).map((ea) => ea.textContent);
  return selected;
}

function getSelectedLanguageCodes() {
  const wholeList = global.lists.languages;
  const selectedLanguages = getSelectedLanguages();
  const selectedLanguageCodes = wholeList
    .filter((ea) => selectedLanguages.includes(ea.english_name))
    .map((ea) => ea.iso_639_1);
  return selectedLanguageCodes;
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
  if (global.lists.sortCriteria.length === 0) {
    global.lists.sortCritera = getSortCriteria();
  }
}
async function getGenres(isTV = false) {
  const endPoint = `genre/${isTV ? 'tv' : 'movie'}/list`;
  const genres = await fetchAPIData(endPoint);
  return genres;
}
async function getLanguages() {
  const languages = await fetchAPIData('configuration/languages');
  return languages;
}

function getSortCriteria() {
  const sortCriteria = [];
  sortCriteria.push('original_title.asc');
  sortCriteria.push('original_title.desc');
  sortCriteria.push('popularity.asc');
  sortCriteria.push('popularity.desc');
  sortCriteria.push('primary_release_date.asc');
  sortCriteria.push('primary_release_date.desc');
  sortCriteria.push('revenue.asc');
  sortCriteria.push('revenue.desc');
  sortCriteria.push('title.asc');
  sortCriteria.push('title.desc');
  sortCriteria.push('vote_average.asc');
  sortCriteria.push('vote_average.desc');
  sortCriteria.push('vote_count.asc');
  sortCriteria.push('vote_count.desc');
  return sortCriteria;
}

function createMenuItem(title, menuInfo) {
  const listItem = document.createElement('li');
  const anchor = document.createElement('a');

  anchor.href = '#';
  anchor.classList.add('filter-menu-item', 'unselected');
  anchor.textContent = title;
  anchor.addEventListener('click', function (event) {
    event.preventDefault();
    if (menuInfo.isExlcusive) {
      const wasSelected = event.target.classList.contains('selected');
      const popupMenu = menuInfo.popupMenu;
      const ul = popupMenu.querySelector('ul');
      const selectedItems = Array.from(ul.querySelectorAll('.selected'));
      selectedItems.forEach((ea) => {
        ea.classList.toggle('selected');
        ea.classList.toggle('unselected');
      });
      if (!wasSelected) {
        event.target.classList.toggle('selected');
        event.target.classList.toggle('unselected');
      }
    } else {
      event.target.classList.toggle('selected');
      event.target.classList.toggle('unselected');
    }
    moveSelectedToTop(menuInfo);
  });
  listItem.appendChild(anchor);
  return listItem;
}

function createCloseMenuButtonItem(menuInfo) {
  const closeText = document.createElement('a');
  closeText.href = '#';
  closeText.classList.add('close-text');
  closeText.textContent = 'Close';
  closeText.addEventListener('click', function (event) {
    closeMenu(menuInfo, event);
  });

  const closeX = document.createElement('a');
  closeX.href = '#';
  closeX.classList.add('close-x');
  closeX.textContent = 'X';
  closeX.addEventListener('click', function (event) {
    closeMenu(menuInfo, event);
  });

  const listItem = document.createElement('li');
  listItem.id = 'close-menu-list-item';
  listItem.appendChild(closeText);
  listItem.appendChild(closeX);
  return listItem;
}

function createPopUpMenu(menuInfo) {
  const filterCheckbox = menuInfo.checkbox;

  const div = document.createElement('div');
  div.classList.add('popup-menu');
  div.id = menuInfo.popupName;
  menuInfo.popupMenu = div;
  const list = document.createElement('ul');
  const closeItem = createCloseMenuButtonItem(menuInfo);
  list.appendChild(closeItem);
  menuInfo.contents.forEach((title) => {
    const item = createMenuItem(title, menuInfo);
    list.appendChild(item);
  });
  div.appendChild(list);
  div.style.display = 'block';
  return div;
}
function createAndPostionPopupMenu(menuInfo) {
  closeAllPopups();

  const popUpDiv = createPopUpMenu(menuInfo);
  const labelRect = menuInfo.label.getBoundingClientRect();
  popUpDiv.style.position = 'absolute';
  popUpDiv.style.top = labelRect.top + 'px';
  popUpDiv.style.left = labelRect.right + 10 + 'px';

  const container = menuInfo.container;
  container.appendChild(popUpDiv);
}
function togglePopupMenu(menuInfo) {
  const popupMenu = menuInfo.popupMenu;
  const show = popupMenu.style.display === 'none';

  closeAllPopups();

  if (show) {
    popupMenu.style.display = 'block';
  }
}
function clearSelected(menuInfo) {
  const popupMenu = menuInfo.popupMenu;
  const ul = popupMenu.querySelector('ul');

  let selectedItems = Array.from(ul.querySelectorAll('.selected'));
  selectedItems.forEach((ea) => {
    ea.classList.toggle('selected'); // turn off selected
    ea.classList.toggle('unselected'); // turn on unselected
  });

  moveSelectedToTop(menuInfo); // reorder all the unselected
}
function moveSelectedToTop(menuInfo) {
  const popupMenu = menuInfo.popupMenu;
  const ul = popupMenu.querySelector('ul');

  // Sort the items in reverse alphabetical order so they can be re-added from the bottom up
  let selectedItems = Array.from(ul.querySelectorAll('.selected')).sort(
    menuInfo.sortFunction
  );
  let unselectedItems = Array.from(ul.querySelectorAll('.unselected')).sort(
    menuInfo.sortFunction
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

  // Make sure teh close menu item is at the very top
  const closeMenuItem = ul.querySelector('#close-menu-list-item');
  ul.removeChild(closeMenuItem);
  ul.insertBefore(closeMenuItem, ul.firstChild);

  // Check or uncheck the checkbox associated with this menu based on whether there
  // are any selected items
  menuInfo.checkbox.checked = selectedItems.length > 0;

  // Add a separator line if needed
  // First remove the old separator, if there is one
  const separator = ul.querySelector('.separator');
  if (separator) {
    ul.removeChild(separator);
  }

  // Add a separator if there are any selected
  if (selectedItems.length > 0) {
    const lastSelectedItem = selectedItems[0]; //selectedItems are in reverse alphabetical order;
    const nextListItem = lastSelectedItem.parentNode.nextElementSibling;

    // if there are unselected items
    if (nextListItem) {
      // Add a separator line
      const separator = document.createElement('li');
      separator.className = 'separator';
      ul.insertBefore(separator, nextListItem);
    }
  }
}

function closeMenu(menuInfo, event) {
  event.preventDefault();
  const popupMenu = menuInfo.popupMenu;
  popupMenu.style.display = 'none';
}

function openPopupMenu(menuInfo) {
  const popupMenu = menuInfo.popupMenu;
  closeAllPopups(popupMenu);
  popupMenu.style.display = 'block';
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
function byOrderAddedSort(a, b) {
  return 0;
}
function addListenersTo(menuInfo) {
  // Add a change listener to the checkbox
  const filterCheckbox = menuInfo.checkbox;
  filterCheckbox.addEventListener('change', function () {
    const popupMenu = menuInfo.popupMenu;
    if (!popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      openPopupMenu(menuInfo);
      if (!filterCheckbox.checked) {
        clearSelected(menuInfo);
        setTimeout(closeAllPopups, 500);
      }
    }
  });

  // Add a click listener to the checkbox's label
  menuInfo.label.addEventListener('click', function () {
    const popupMenu = menuInfo.popupMenu;
    if (!popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      togglePopupMenu(menuInfo);
    }
  });
}

function closeAllPopups(exceptPopUp) {
  const allPopups = document.querySelectorAll('.popup-menu');
  allPopups.forEach((popup) => {
    if (popup !== exceptPopUp) {
      popup.style.display = 'none';
    }
  });
}
