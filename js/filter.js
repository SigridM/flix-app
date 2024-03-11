import { discoverAPIData, fetchAPIData } from './fetchData.js';
import { global } from './globals.js';
const allMenuInfo = {
  movieGenreMenuInfo: {
    checkbox: document.querySelector('#movie-genre-filter-checkbox'),
    popupName: 'movie-genre-popup-menu',
    label: document.querySelector('#movie-genre-label'),
    container: document.querySelector('#movie-genre-container'),
    isExlcusive: false,
    orOnly: false,
    selected: [],
    sortFunction: textContentSort,
  },
  tvGenreMenuInfo: {
    checkbox: document.querySelector('#tv-genre-filter-checkbox'),
    popupName: 'tv-genre-popup-menu',
    label: document.querySelector('#tv-genre-label'),
    container: document.querySelector('#tv-genre-container'),
    isExlcusive: false,
    orOnly: false,
    selected: [],
    sortFunction: textContentSort,
  },
  languageMenuInfo: {
    checkbox: document.querySelector('#language-filter-checkbox'),
    popupName: 'language-popup-menu',
    label: document.querySelector('#language-label'),
    container: document.querySelector('#language-container'),
    isExlcusive: false,
    orOnly: true,
    selected: [],
    sortFunction: textContentSort,
  },
  sortMenuInfo: {
    checkbox: document.querySelector('#sort-by-checkbox'),
    popupName: 'sort-by-popup-menu',
    label: document.querySelector('#sort-by-label'),
    container: document.querySelector('#sort-by-container'),
    isExlcusive: true,
    selected: [],
    sortFunction: textContentSort,
  },
};

export async function addFilterListeners() {
  const filterTitle = document.querySelector('#filter-title');
  filterTitle.addEventListener('click', function (event) {
    const filterHolder = document.querySelector('#all-filters');
    if (filterHolder.style.display === 'block') {
      filterHolder.style.display = 'none';
    } else {
      filterHolder.style.display = 'block';
    }
  });
  await fillLists();

  addListenersTo(allMenuInfo.movieGenreMenuInfo);
  addListenersTo(allMenuInfo.tvGenreMenuInfo);
  addListenersTo(allMenuInfo.languageMenuInfo);
  addListenersTo(allMenuInfo.sortMenuInfo);

  addRadioBUttonListeners();
}

function addRadioBUttonListeners() {
  // TV vs. Movie
  const movieRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#movie');
  movieRadioButton.addEventListener('change', function (event) {
    const isTV = !movieRadioButton.checked;
    hideUnusedGenreFilter(isTV);
  });

  const tvRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#tv');
  tvRadioButton.addEventListener('change', function (event) {
    const isTV = tvRadioButton.checked;
    hideUnusedGenreFilter(isTV);
  });

  hideUnusedGenreFilter(tvRadioButton.checked);

  // Keyword vs. Title
  const filterContainer = document.querySelector('#filter-container');
  const keywordRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#search-by-keyword');
  keywordRadioButton.addEventListener('change', function (event) {
    keywordRadioButton.checked
      ? (filterContainer.style.display = 'block')
      : (filterContainer.style.display = 'none');
  });
  const titleRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#search-by-title');
  titleRadioButton.addEventListener('change', function (event) {
    titleRadioButton.checked
      ? (filterContainer.style.display = 'none')
      : (filterContainer.style.display = 'block');
  });

  titleRadioButton.checked
    ? (filterContainer.style.display = 'none')
    : (filterContainer.style.display = 'block');
}

export function hideUnusedGenreFilter(isTV) {
  closeAllPopups();
  const movieGenreFilter = document.querySelector('#movie-genre-div');
  const tvGenreFilter = document.querySelector('#tv-genre-div');
  if (isTV) {
    movieGenreFilter.style.display = 'none';
    tvGenreFilter.style.display = 'block';
  } else {
    movieGenreFilter.style.display = 'block';
    tvGenreFilter.style.display = 'none';
  }
}

export async function getFilterResults(isTV = false) {
  const results = await doFilter(
    allMenuInfo.movieGenreMenuInfo,
    allMenuInfo.tvGenreMenuInfo,
    allMenuInfo.languageMenuInfo,
    allMenuInfo.sortMenuInfo,
    isTV
  );
  return results;
}

async function doFilter(
  movieGenreInfo,
  tvGenreInfo,
  languageInfo,
  sortInfo,
  isTV
) {
  closeAllPopups();

  const genreInfo = isTV ? tvGenreInfo : movieGenreInfo;
  let filters = '';
  const genres = getSelectedGenreCodes(isTV);
  if (genres.length > 0) {
    filters += '&with_genres=' + genres.join(getJoinStringFor(genreInfo));
  }
  const languages = getSelectedLanguageCodes();
  if (languages.length > 0) {
    filters += '&with_original_language=' + languages.join('|');
  }
  filters += '&include_adult=' + includeAdult();
  console.log(filters);
  const results = await discoverAPIData(filters);
  console.log(results);
  return results;
}

function getJoinStringFor(menuInfo) {
  const andJoinString = '%2C';
  const orJoinString = '%7C';

  const radioButtons = menuInfo.combiner.querySelectorAll(
    'input[type="radio"]'
  );
  let selectedRadiobuttonValue = null;
  radioButtons.forEach((ea) => {
    if (ea.checked) {
      selectedRadiobuttonValue = ea.value;
    }
  });

  if ((selectedRadiobuttonValue = 'and')) {
    return andJoinString;
  }
  return orJoinString;
}

function getSelectedGenres(isTV) {
  const popupID = isTV ? '#tv-genre-popup-menu' : '#movie-genre-popup-menu';
  const popupMenu = document.querySelector(popupID);
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

function includeAdult() {
  const adultCheckbox = document.querySelector('#adult-filter-checkbox');
  return !adultCheckbox.checked;
}
async function fillLists() {
  if (global.lists.genres.movies.length === 0) {
    const genreList = await getGenres();
    global.lists.genres.movies = genreList.genres;
    allMenuInfo.movieGenreMenuInfo.contents = genreList.genres.map(
      (ea) => ea.name
    );
  }
  if (global.lists.genres.tv.length === 0) {
    const genreList = await getGenres(true);
    global.lists.genres.tv = genreList.genres;
    allMenuInfo.tvGenreMenuInfo.contents = genreList.genres.map(
      (ea) => ea.name
    );
  }
  if (global.lists.languages.length === 0) {
    global.lists.languages = await getLanguages();
    allMenuInfo.languageMenuInfo.contents = global.lists.languages
      .map((ea) => ea.english_name)
      .sort();
  }
  if (global.lists.sortCriteria.length === 0) {
    global.lists.sortCriteria = getSortCriteria();
    allMenuInfo.sortMenuInfo.contents = global.lists.sortCriteria;
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
  anchor.classList.add('filter-menu-item');
  anchor.textContent = title;
  anchor.addEventListener('click', function (event) {
    event.preventDefault();
    if (menuInfo.isExlcusive) {
      const wasSelected = event.target.classList.contains('selected');
      const popupMenu = menuInfo.popupMenu;
      const ul = popupMenu.querySelector('ul');
      const selectedItems = Array.from(ul.querySelectorAll('.selected'));
      selectedItems.forEach((ea) => {
        ea.classList.remove('selected'); // turn selection off
      });
      if (!wasSelected) {
        event.target.classList.add('selected'); // turn selection on
      }
    } else {
      // not exclusive
      event.target.classList.toggle('selected');
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
  const show = popupMenu.style.display === 'none'; // was hidden; will show

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
    ea.classList.remove('selected'); // turn off selected
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

  let unselectedItems = Array.from(
    ul.querySelectorAll('a:not(.selected):not(.close-x):not(.close-text)')
  ).sort(menuInfo.sortFunction);

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

  menuInfo.selected = selectedItems
    .sort(menuInfo.sortFunction)
    .reverse()
    .map((ea) => ea.textContent);

  const combiner = menuInfo.combiner;
  if (combiner) {
    const clarifier = combiner.querySelector('.clarifier');
    clarifier.textContent =
      '(' + menuInfo.selected.join(' ' + menuInfo.combineUsing + ' ') + ')';
    if (menuInfo.selected.length > 1) {
      combiner.style.display = 'inline-block';
    } else {
      combiner.style.display = 'none';
    }
  }
  const singleClarifier = menuInfo.singleClarifier;
  if (singleClarifier) {
    if (menuInfo.selected.length === 1) {
      singleClarifier.textContent = '(' + menuInfo.selected[0] + ')';
      singleClarifier.style.display = 'inline-block';
    } else {
      singleClarifier.style.display = 'none';
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
    if (!menuInfo.popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      openPopupMenu(menuInfo);
      if (!filterCheckbox.checked) {
        clearSelected(menuInfo);
        setTimeout(closeAllPopups, 500);
      }
    }
    if (!menuInfo.isExlcusive && !menuInfo.combiner) {
      createCombinersFor(menuInfo);
    }
    if (!menuInfo.singleClarifier) {
      createSingleClarifierFor(menuInfo);
    }
  });

  // Add a click listener to the checkbox's label
  menuInfo.label.addEventListener('click', function () {
    if (!menuInfo.popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      togglePopupMenu(menuInfo);
    }
    if (!menuInfo.isExlcusive && !menuInfo.combiner) {
      createCombinersFor(menuInfo);
    }
    if (!menuInfo.singleClarifier) {
      createSingleClarifierFor(menuInfo);
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

function createCombinersFor(menuInfo) {
  const combiner = document.createElement('div');
  combiner.classList.add('combiner');
  if (!menuInfo.orOnly) {
    combiner.textContent = '- combine using: ';
    menuInfo.combineUsing = 'and';
    const andChoice = document.createElement('input');
    andChoice.type = 'radio';
    andChoice.id = menuInfo.container.id + '-and';
    andChoice.name = menuInfo.container.id + '-combine-using';
    andChoice.value = 'and';
    andChoice.checked = true;
    andChoice.addEventListener('change', function (event) {
      menuInfo.combineUsing = event.target.value;
      clarification.textContent =
        '(' + menuInfo.selected.join(' ' + menuInfo.combineUsing + ' ') + ')';
    });

    const andLabel = document.createElement('label');
    andLabel.for = andChoice.id;
    andLabel.textContent = ' And ';

    const orChoice = document.createElement('input');
    orChoice.type = 'radio';
    orChoice.id = menuInfo.container.id + '-or';
    orChoice.name = menuInfo.container.id + '-combine-using';
    orChoice.value = 'or';
    orChoice.checked = false;
    orChoice.addEventListener('change', function (event) {
      menuInfo.combineUsing = event.target.value;
      clarification.textContent =
        '(' + menuInfo.selected.join(' ' + menuInfo.combineUsing + ' ') + ')';
    });
    const orLabel = document.createElement('label');
    orLabel.for = orChoice.id;
    orLabel.textContent = ' Or ';

    combiner.appendChild(andChoice);
    combiner.appendChild(andLabel);
    combiner.appendChild(orChoice);
    combiner.appendChild(orLabel);
  } else {
    menuInfo.combineUsing = 'or';
  }
  const clarification = document.createElement('div');
  clarification.id = menuInfo.container.id + '-clarification';
  clarification.classList.add('clarifier');
  clarification.textContent =
    '(' + menuInfo.selected.join(' ' + menuInfo.combineUsing + ' ') + ')';
  clarification.style.display = 'inline-block';

  combiner.appendChild(clarification);

  if (menuInfo.selected.length > 1) {
    combiner.style.display = 'inline-block';
  } else {
    combiner.style.display = 'none';
  }

  menuInfo.container.appendChild(combiner);

  menuInfo.combiner = combiner; // save the combiner in the menuInfo
}
function createSingleClarifierFor(menuInfo) {
  const clarification = document.createElement('div');
  clarification.id = menuInfo.container.id + '-single-clarification';
  clarification.classList.add('single-clarifier');
  clarification.textContent = '(' + menuInfo.selected[0] + ')';
  if (menuInfo.selected.length === 1) {
    clarification.style.display = 'inline-block';
  } else {
    clarification.style.display = 'none';
  }
  menuInfo.container.appendChild(clarification);

  menuInfo.singleClarifier = clarification; // save the single clarifier in the menuInfo
}
