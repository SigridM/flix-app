import { fetchAPIData } from './fetchData.js';
import { global } from './globals.js';

export async function addFilterListeners(isTV = false) {
  await fillLists();

  let menuInfo;

  const genreNames = isTV
    ? global.lists.genres.tv.map((ea) => ea.name)
    : global.lists.genres.movies.map((ea) => ea.name);

  menuInfo = {
    checkboxID: '#genre-filter-checkbox',
    popupName: 'genre-popup-menu',
    labelID: '#genre-label',
    containerID: '#genre-container',
    contents: genreNames,
  };
  addListenersTo(menuInfo);

  menuInfo = {
    checkboxID: '#adult-filter-checkbox',
    popupName: 'adult-popup-menu',
    labelID: '#adult-label',
    containerID: '#adult-container',
    contents: ['Adult Only', 'Non-Adult Only'],
  };
  addListenersTo(menuInfo);

  menuInfo = {
    checkboxID: '#language-filter-checkbox',
    popupName: 'language-popup-menu',
    labelID: '#language-label',
    containerID: '#language-container',
    contents: global.lists.languages.map((ea) => ea.english_name).sort(),
  };
  addListenersTo(menuInfo);

  const sortBy = document.querySelector('#sort-by-checkbox');
  sortBy.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('sort-by checkbox is checked');
    } else {
      console.log('sort-by checkbox is unchecked');
    }
  });
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
  const endPoint = `genre/${isTV ? 'tv' : 'movie'}/list`;
  const genres = await fetchAPIData(endPoint);
  return genres;
}
async function getLanguages() {
  const languages = await fetchAPIData('configuration/languages');
  return languages;
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

function createPopUpMenu(menuInfo) {
  const filterCheckbox = document.querySelector(menuInfo.checkboxID);

  const div = document.createElement('div');
  div.classList.add('popup-menu');
  div.id = menuInfo.popupName;
  const list = document.createElement('ul');
  const closeItem = createCloseMenuButtonItem(menuInfo.popupName);
  list.appendChild(closeItem);
  menuInfo.contents.forEach((title) => {
    const item = createMenuItem(filterCheckbox, title, menuInfo.popupName);
    list.appendChild(item);
  });
  div.appendChild(list);
  div.style.display = 'block';
  return div;
}
function createAndPostionPopupMenu(menuInfo) {
  closeAllPopups();

  const popUpDiv = createPopUpMenu(menuInfo);
  const labelRect = document
    .querySelector(menuInfo.labelID)
    .getBoundingClientRect();
  popUpDiv.style.position = 'absolute';
  popUpDiv.style.top = labelRect.top + 'px';
  popUpDiv.style.left = labelRect.right + 'px';

  const container = document.querySelector(menuInfo.containerID);
  container.appendChild(popUpDiv);
}
function togglePopupMenu(menuID) {
  const popupMenu = document.getElementById(menuID);
  const show = popupMenu.style.display === 'none';

  closeAllPopups();

  if (show) {
    popupMenu.style.display = 'block';
  }
}
function clearSelected(checkbox, menuID) {
  const popupMenu = document.getElementById(menuID);
  const ul = popupMenu.querySelector('ul');

  let selectedItems = Array.from(ul.querySelectorAll('.selected'));
  selectedItems.forEach((ea) => {
    ea.classList.toggle('selected'); // turn off selected
    ea.classList.toggle('unselected'); // turn on unselected
  });

  moveSelectedToTop(checkbox, menuID); // reorder all the unselected
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

  // Make sure teh close menu item is at the very top
  const closeMenuItem = ul.querySelector('#close-menu-list-item');
  ul.removeChild(closeMenuItem);
  ul.insertBefore(closeMenuItem, ul.firstChild);

  // Check or uncheck the checkbox associated with this menu based on whether there
  // are any selected items
  checkbox.checked = selectedItems.length > 0;

  // Add a separator line if needed
  // First remove the old separator, if there is one
  const separator = ul.querySelector('.separator');
  console.log(separator);
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

function closeMenu(menuID, event = null) {
  if (event) {
    event.preventDefault();
  }
  const popupMenu = document.getElementById(menuID);
  popupMenu.style.display = 'none';
}

function openPopupMenu(menuID) {
  closeAllPopups();
  const popupMenu = document.getElementById(menuID);
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
function addListenersTo(menuInfo) {
  const filterCheckbox = document.querySelector(menuInfo.checkboxID);
  filterCheckbox.addEventListener('change', function () {
    const popupMenu = document.getElementById(menuInfo.popupName);
    if (!popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      openPopupMenu(menuInfo.popupName);
      if (!filterCheckbox.checked) {
        clearSelected(filterCheckbox, menuInfo.popupName);
      }
    }
  });

  const label = document.querySelector(menuInfo.labelID);
  label.addEventListener('click', function () {
    const popupMenu = document.getElementById(menuInfo.popupName);
    if (!popupMenu) {
      createAndPostionPopupMenu(menuInfo); // also shows the menu
    } else {
      togglePopupMenu(menuInfo.popupName);
    }
  });
}

function closeAllPopups() {
  const allPopups = document.querySelectorAll('.popup-menu');
  allPopups.forEach((popup) => (popup.style.display = 'none'));
}
