import { discoverAPIData, fetchAPIData } from './fetchData.js';
import { global } from './globals.js';
import { KeywordSearchDetailReturnInfo } from './detailReturn.js';
import { clearSearchResults } from './search.js';
import { ExtendedMap } from './extensions.js';

/* A simple Boolean filter with a Checkbox  */
export class Filter {
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  /* Answer a String, the name in the DOM of the checkbox for this filter */
  checkboxID() {
    return this.name + '-filter-checkbox';
  }

  /* Answer the input element from the DOM that is the checkbox for this filter */
  checkbox() {
    return document.getElementById(this.checkboxID());
  }

  /* Uncheck the checkbox */
  uncheck() {
    this.checkbox().checked = false;
  }

  /* Deselect this filter and clear its state */
  clear() {
    this.uncheck();
  }
}

/* A Filter that displays a popUpMenu when the checkbox is checked, but only one option at a time can be
   selected in the menu */
export class SingleChoiceMenuFilter extends Filter {
  /* Answer a String, the name in the DOM of the popUpMenu for this filter*/
  popUpID() {
    return this.name + '-popupMenu';
  }

  /* Answer the div element from the DOM behaves as a popUpMenu for this filter */
  popUpMenu() {
    return document.getElementById(this.popUpID());
  }

  /* Answer a String, the name in the DOM of the interactive checkbox label for this filter */
  labelID() {
    return this.name + '-label';
  }

  /* Answer the anchor element from the DOM serves as the interactive label for the checkbox of this filter */
  label() {
    return document.getElementById(this.labelID);
  }

  /* Answer a String, the name in the DOM of the div that will hold the popUpMenu for this filter */
  popUpContainerID() {
    return this.name + '-container';
  }

  /* Answer the div element from the DOM that will hold the popUpMenu for this filter */
  popUpContainer() {
    return document.getElementById(this.popUpContainerID);
  }

  /* Answer a String, the name in the DOM of the div showing clarifying text for what is selected in the 
     popUpMenu for this filter when only one item is selected */
  singleClarifierID() {
    return this.name + '-single-clarifier';
  }

  /* Answer the div element from the DOM that contains text clarifying what is selected in the popUpMenu
     for this filter when ony one item is selected in the menu*/
  singleClarifier() {
    return document.getElementById(this.singleClarifierID());
  }

  /* Answer the function used to sort the options in the popUpMenu */
  sortFunction() {
    return this.textContentSort;
  }

  textContentSort(a, b) {
    if (a.textContent > b.textContent) {
      return -1; // Return -1 to indicate 'a' should come before 'b'
    }
    if (a.textContent < b.textContent) {
      return 1; // Return 1 to indicate 'b' should come before 'a'
    }
    return 0; // Return 0 if they are equal
  }

  /* Deselect this filter and clear its state */
  clear() {
    this.uncheck();
  }

  /* Add a function that will react to a change of the checkbox's state: it will lazy-initialize
     the popUpMenu, lazy-initialize the text element (clarifier) that shows what is selected in 
     the popUpMenu, show the popUpMenu and, if the checkbox is unchecked, clear any menu selections. */
  addMenuListeners() {
    // Add a change listener to the checkbox
    const filterCheckbox = this.checkbox();
    filterCheckbox.addEventListener('change', function () {
      if (!this.popupMenu()) {
        // popUpMenu has not yet been created; lazy-initialize it
        this.createAndPostionPopupMenu();
      }
      if (!menuInfo.singleClarifier) {
        // clarifier has not yet been created; lazy-initialize it
        this.createSingleClarifier();
      }

      this.openPopupMenu();

      if (!filterCheckbox.checked) {
        this.clearSelected();
        setTimeout(this.closeOtherPopUps.bind(this), 500); // is this necessary?
      }
    });
  }

  /* Create and return a div that acts as a pop-up menu for this filter. It contains an unordered
     list, which contains list items for all of the filter options. */
  newPopUpMenu() {
    const div = document.createElement('div');
    div.classList.add('popup-menu');
    div.id = this.popUpID();
    const list = document.createElement('ul');
    const closeItem = this.newCloseMenuItem();
    list.appendChild(closeItem);
    this.options.forEach((option) => {
      const item = this.newMenuItem(option);
      list.appendChild(item);
    });
    div.appendChild(list);
    // div.style.display = 'block'; // show the menu
    return div;
  }

  /* Create and return a list item for the top of the menu that has a couple of anchors
     for the user to click on to close the entire menu. */
  newCloseMenuItem() {
    const closeText = document.createElement('a');
    closeText.href = '#';
    closeText.classList.add('close-text');
    closeText.textContent = 'Close';
    closeText.addEventListener('click', function (event) {
      this.closeMenu(event);
    });

    const closeX = document.createElement('a');
    closeX.href = '#';
    closeX.classList.add('close-x');
    closeX.textContent = 'X';
    closeX.addEventListener('click', function (event) {
      this.closeMenu(event);
    });

    const listItem = document.createElement('li');
    listItem.id = 'close-menu-list-item';
    listItem.appendChild(closeText);
    listItem.appendChild(closeX);
    return listItem;
  }

  /* Close this filter's popUpMenu */
  closeMenu(event) {
    event.preventDefault();
    this.closePopUpMenu();
  }

  /* Show the popUpMenu for this filter in the DOM, hiding all other popUpMenus */
  openPopUpMenu() {
    this.closeOtherPopUps();
    this.popUpMenu().style.display = 'block';
  }

  /* Hide the popUpMenu for this filter in the DOM */
  closePopUpMenu() {
    this.popUpMenu().style.display = 'none';
  }

  /* Create anew the div that serves as the popUpMenu for this filter and position it just to the
     right of the checkbox label */
  createAndPostionPopupMenu() {
    this.closeOtherPopUps();

    const popUpDiv = this.newPopUpMenu();
    const labelRect = this.label().getBoundingClientRect();
    popUpDiv.style.position = 'absolute';
    popUpDiv.style.top = labelRect.top + 'px';
    popUpDiv.style.left = labelRect.right + 10 + 'px';

    const container = this.popUpContainer();
    container.appendChild(popUpDiv);
  }

  /* Search the DOM for all popUpMenus. Close them all so only the popUpMenu for this filter
     can show. */
  closeOtherPopUps() {
    const allPopUps = document.querySelectorAll('.popup-menu');
    const myPopUp = this.popUpMenu();
    allPopUps.forEach((popUp) => {
      if (popUp !== myPopUp) {
        popUp.style.display = 'none';
      }
    });
  }

  /* Answer the String that is the display style for the single clarifier of this filter. 
     Single choice menus should always show their single clarifier */
  singleClarifierDisplayStyle() {
    return 'inline-block';
  }

  /* The single clarifier div does not yet exist in the DOM. Create it and add it to the popUpMenu container
     for this filter */
  createSingleClarifier() {
    const clarifier = document.createElement('div');
    clarifier.id = this.singleClarifierID();
    clarifier.classList.add('single-clarifier');
    clarifier.textContent = '(' + this.selected[0] + ')';
    clarifier.style.display = this.singleClarifierDisplayStyle();

    this.popUpContainer().appendChild(clarifier);
  }

  // End Filter class
}

export class MultipleChoiceFilter extends SingleChoiceMenuFilter {
  /* Answer a String, the name in the DOM of the div containing the div showing clarifying text for 
     what is selected in the popUpMenu for this filter and how the selections are combined when more 
     than one item is selected */
  combinerID() {
    return this.name + '-combiner';
  }

  /* Answer the div element from the DOM that contains the div shows clarifying text for what is selected in the 
     popUpMenu for this filter and how the selections are combined when more than one item is selected */
  combiner() {
    return document.getElementById(this.combinerID());
  }

  /* Answer a String, the name in the DOM of the div showing clarifying text for what is selected in the 
     popUpMenu for this filter and how the selections are combined when more than one item is selected */
  combinerClarifierID() {
    return this.name + '-combiner-clarifier';
  }

  /* Answer the div element from the DOM that shows clarifying text for what is selected in the 
     popUpMenu for this filter and how the selections are combined when more than one item is selected */
  combinerClarifier() {
    return document.getElementById(this.combinerClarifierID());
  }

  /* Add a function that will react to a change of the checkbox's state: it will lazy-initialize
     the popUpMenu, lazy-initialize any refinements of the filter, like and/or radio buttons and text 
     clarifying what is selected in the popUpMenu, show the popUpMenu and, if the checkbox is unchecked, 
     clear any menu selections. 
     This overrides the superclass function of the same name because this one adds a combiner clarifier*/
  addMenuListeners() {
    // Add a change listener to the checkbox
    const filterCheckbox = this.checkbox();
    filterCheckbox.addEventListener('change', function () {
      if (!this.popupMenu()) {
        // popUpMenu has not yet been created; lazy-initialize it
        this.createAndPostionPopupMenu();
      }
      if (!this.combiner()) {
        // combiner has not yet been created; lazy-initialize it
        this.createCombiner();
      }
      if (!this.singleClarifier()) {
        // clarifier has not yet been created; lazy-initialize it
        this.createSingleClarifier();
      }

      this.openPopupMenu();

      if (!filterCheckbox.checked) {
        this.clearSelected();
        setTimeout(this.closeOtherPopUps.bind(this), 500); // is this necessary? Other popUps are closed during openPopUp()
      }
    });
  }

  /* Answer the String used to combine options for this filter. Because we are Or-Only, the only way to
     combine options is with 'or' */
  combineUsing() {
    return 'or';
  }

  /* Answer the String that is the display style for the single clarifier of this filter. 
     This will depend on how many items are selected in the popUpMenu. If only one, show the 
     clarifier. If zero, displaying it is not necessary. If more than one, hide the sinble clarfier
     and show a more detailed combiner clarifier */
  singleClarifierDisplayStyle() {
    if (this.selected.length === 1) {
      return 'inline-block';
    }
    return 'none';
  }

  /* Answer the String that is the display style for the combiner clarifier of this filter. 
     This will depend on how many items are selected in the popUpMenu. If more than one, show the 
     clarifier. Otherwiser, show either the singleClarifier (for one selection) or no clarifier 
     at all (for no selection). */
  combinerDisplayStyle() {
    if (menuInfo.selected.length > 1) {
      return 'inline-block';
    }
    return 'none';
  }

  createCombiner() {
    const combiner = document.createElement('div');
    combiner.id = this.combinerID();
    combiner.classList.add('combiner');

    combiner.appendChild(this.newCombinerClarifier());
    combiner.style.display = this.combinerDisplayStyle();

    this.popUpContainer().appendChild(combiner);
  }

  newCombinerClarifier() {
    const combinerClarifier = document.createElement('div');
    combinerClarifier.id = this.combinerClarifierID();
    combinerClarifier.classList.add('clarifier');
    combinerClarifier.textContent =
      '(' + this.selected.join(' ' + this.combineUsing() + ' ') + ')';
    combinerClarifier.style.display = 'inline-block';

    return combinerClarifier;
  }
  /* End MultpleChoiceFilter class */
}

/* A Filter that allows multiple choice selections in the popUpMenu and also allows those choices to be combined
   with either 'and' or 'or' */
export class AndOrMultipleChoiceFilter extends MultipleChoiceFilter {
  /* Override the superclass constructor because this filter allows the combiner to be set by the user */
  constructor(name, options) {
    super(name, options);
    this.combineUsing = 'and'; // default combiner choice
  }

  /* Answer how to combine the options when there is more than one selected in the popUpMenu */
  combineUsing() {
    return this.combineUsing;
  }

  /* In response to a radio button selection, set how to combine the options when there is more than one selected in the popUpMenu*/
  setCombineUsing(aString) {
    this.combineUsing = aString;
    this.combinerClarifier().textContent =
      '(' + this.selected.join(' ' + aString + ' ') + ')';
  }

  /* Create and return a single radio button with the choice of how to combine the filter options for this filter when
     more than one item is selected in the popUpMenu */
  newCombinationChoice(choiceString) {
    const choice = document.createElement('input');
    choice.type = 'radio';
    choice.id = this.name + '-' + choiceString;
    choice.name = this.name + '-combine-using';
    choice.value = choiceString;
    choice.checked = true;
    choice.addEventListener('change', function (event) {
      this.setCombineUsing(event.target.value);
    });
    return choice;
  }

  /* Create and return the label for a radio button that allows the choice of how to combine the filter options for 
    this filter when more than one item is selected in the popUpMenu */
  newCombinationLabel(choice, labelString) {
    const label = document.createElement('label');
    label.for = choice.id;
    label.textContent = labelString;
    return label;
  }

  /* Override the superclas method for creating a combiner. This one is more complicated because we allow the user
     to choose how to combine the options in the popUpMenu: either with 'and' or 'or'. We add the radio buttons for
     those choices before the combiner clarifier. */
  createCombiner() {
    const combiner = document.createElement('div');
    combiner.id = this.combinerID();
    combiner.classList.add('combiner');
    combiner.textContent = '- combine using: ';

    const andChoice = this.newCombinationChoice('and');
    const andLabel = this.newCombinationLabel(andChoice, ' And ');

    const orChoice = this.newCombinationChoice('or');
    const orLabel = this.newCombinationLabel(orChoice, ' Or ');

    combiner.appendChild(andChoice);
    combiner.appendChild(andLabel);
    combiner.appendChild(orChoice);
    combiner.appendChild(orLabel);
    combiner.appendChild(newCombinerClarifier());

    this.popUpContainer().appendChild(combiner);
  }
}

const allMenuInfo = {
  movieGenreMenuInfo: {
    checkbox: () => document.querySelector('#movie-genre-filter-checkbox'),
    popupName: 'movie-genre-popup-menu',
    label: () => document.querySelector('#movie-genre-label'),
    container: () => document.querySelector('#movie-genre-container'),
    isExlcusive: false,
    orOnly: false,
    selected: [],
    sortFunction: textContentSort,
  },
  tvGenreMenuInfo: {
    checkbox: () => document.querySelector('#tv-genre-filter-checkbox'),
    popupName: 'tv-genre-popup-menu',
    label: () => document.querySelector('#tv-genre-label'),
    container: () => document.querySelector('#tv-genre-container'),
    isExlcusive: false,
    orOnly: false,
    selected: [],
    sortFunction: textContentSort,
  },
  languageMenuInfo: {
    checkbox: () => document.querySelector('#language-filter-checkbox'),
    popupName: 'language-popup-menu',
    label: () => document.querySelector('#language-label'),
    container: () => document.querySelector('#language-container'),
    isExlcusive: false,
    orOnly: true,
    selected: [],
    sortFunction: textContentSort,
  },
  sortMenuInfo: {
    checkbox: () => document.querySelector('#sort-by-checkbox'),
    popupName: 'sort-by-popup-menu',
    label: () => document.querySelector('#sort-by-label'),
    container: () => document.querySelector('#sort-by-container'),
    isExlcusive: true,
    selected: [],
    sortFunction: textContentSort,
  },
};

export function keywordResultInfo(isTV) {
  return new KeywordSearchDetailReturnInfo(
    isTV,
    global.search.term,
    global.search.page,
    getSelectedGenres(isTV),
    getGenreCombineUsing(isTV),
    getSelectedLanguages(),
    !includeAdult(),
    sortBy()
  );
}

export function showFilters() {
  document.querySelector('#filter-container').style.display = 'block';
  document.querySelector('#all-filters').style.display = 'block';
}

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

  addMenuListenersTo(allMenuInfo.movieGenreMenuInfo);
  addMenuListenersTo(allMenuInfo.tvGenreMenuInfo);
  addMenuListenersTo(allMenuInfo.languageMenuInfo);
  addMenuListenersTo(allMenuInfo.sortMenuInfo);

  document
    .querySelector('#adult-filter-checkbox')
    .addEventListener('change', function () {
      closeAllPopups();
    });
  // document
  //   .querySelector('#adult-filter-label')
  //   .addEventListener('change', function () {
  //     closeAllPopups();
  //   });

  addRadioButtonListeners();
}

function clearCheckboxes() {
  [
    allMenuInfo.movieGenreMenuInfo,
    allMenuInfo.languageMenuInfo,
    allMenuInfo.sortMenuInfo,
    allMenuInfo.tvGenreMenuInfo,
  ].forEach((menuInfo) => {
    if (menuInfo.popupMenu) {
      clearSelected(menuInfo);
      menuInfo.checkbox().checked = false;
    }
  });
  document.querySelector('#adult-filter-checkbox').checked = false;
}

function addRadioButtonListeners() {
  // TV vs. Movie
  const movieRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#movie');
  movieRadioButton.addEventListener('change', function (event) {
    clearSearchResults();
    clearCheckboxes();
    hideUnusedGenreFilter(!movieRadioButton.checked);
  });

  const tvRadioButton = document
    .querySelector('#search-radio-button-panel')
    .querySelector('#tv');
  tvRadioButton.addEventListener('change', function (event) {
    clearSearchResults();
    clearCheckboxes();
    hideUnusedGenreFilter(tvRadioButton.checked);
  });

  hideUnusedGenreFilter(tvRadioButton.checked);

  // Keyword vs. Title
  const keywordRadioButton = document.querySelector('#search-by-keyword');
  keywordRadioButton.addEventListener('change', function (event) {
    clearSearchResults();
    hideOrShowFilterContainer(!keywordRadioButton.checked);
  });

  const titleRadioButton = document.querySelector('#search-by-title');
  titleRadioButton.addEventListener('change', function (event) {
    clearSearchResults();
    hideOrShowFilterContainer(titleRadioButton.checked);
  });

  hideOrShowFilterContainer(titleRadioButton.checked);
}

function hideOrShowFilterContainer(titleChecked) {
  const filterContainer = document.querySelector('#filter-container');
  titleChecked
    ? (filterContainer.style.display = 'none')
    : (filterContainer.style.display = 'block');
}
function hideUnusedGenreFilter(isTV) {
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
  const results = await doFilter(isTV);
  return results;
}

async function doFilter(isTV) {
  closeAllPopups();

  const genreInfo = isTV
    ? allMenuInfo.tvGenreMenuInfo
    : allMenuInfo.movieGenreMenuInfo;
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

  filters += hasSort() ? '&sort_by=' + sortBy() : '';
  const results = await discoverAPIData(filters);
  return results;
}

function hasSort() {
  return allMenuInfo.sortMenuInfo.selected.length > 0;
}

function sortBy() {
  if (!hasSort()) {
    return '';
  }
  return global.lists.sortCriteria.getKeyByValue(
    allMenuInfo.sortMenuInfo.selected[0]
  );
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

export function setSelectedLanguages(languages) {
  const menuInfo = allMenuInfo.languageMenuInfo;
  let popupMenu = document.getElementById(menuInfo.popupName);
  if (!popupMenu) {
    createAndPostionPopupMenu(menuInfo); // also shows the menu
    popupMenu = document.getElementById(menuInfo.popupName);
    popupMenu.style.display = 'none'; // hide it again
  }

  if (!menuInfo.isExlcusive && !menuInfo.combiner) {
    createCombinersFor(menuInfo);
  }
  if (!menuInfo.singleClarifier) {
    createSingleClarifierFor(menuInfo);
  }

  const listItems = Array.from(popupMenu.querySelectorAll('li')).filter((li) =>
    languages.includes(li.textContent)
  );
  listItems.forEach((li) => li.querySelector('a').classList.add('selected'));
  menuInfo.selected = languages;

  moveSelectedToTop(menuInfo);
}

export function setSortBy(sortByString) {
  if (sortByString.length === 0) {
    return;
  }
  const menuInfo = allMenuInfo.sortMenuInfo;
  let popupMenu = document.getElementById(menuInfo.popupName);
  if (!popupMenu) {
    createAndPostionPopupMenu(menuInfo); // also shows the menu
    popupMenu = document.getElementById(menuInfo.popupName);
    popupMenu.style.display = 'none'; // hide it again
  }

  if (!menuInfo.isExlcusive && !menuInfo.combiner) {
    createCombinersFor(menuInfo);
  }
  if (!menuInfo.singleClarifier) {
    createSingleClarifierFor(menuInfo);
  }

  const friendlySortString = global.lists.sortCriteria.get(sortByString);
  const listItem = Array.from(popupMenu.querySelectorAll('li')).find(
    (li) => friendlySortString === li.textContent
  );
  listItem.querySelector('a').classList.add('selected');
  menuInfo.selected = new Array(friendlySortString);

  moveSelectedToTop(menuInfo);
}

export function setSelectedGenres(isTV, genres, genreCombiner) {
  hideUnusedGenreFilter(isTV); // make sure only TV genres or Movie genres are showing
  const menuInfo = isTV
    ? allMenuInfo.tvGenreMenuInfo
    : allMenuInfo.movieGenreMenuInfo;

  let popupMenu = document.getElementById(menuInfo.popupName);
  if (!popupMenu) {
    createAndPostionPopupMenu(menuInfo); // also shows the menu
    popupMenu = document.getElementById(menuInfo.popupName);
    popupMenu.style.display = 'none'; // hide it again
  }

  if (!menuInfo.isExlcusive && !menuInfo.combiner) {
    createCombinersFor(menuInfo);
  }
  if (!menuInfo.singleClarifier) {
    createSingleClarifierFor(menuInfo);
  }

  const listItems = Array.from(popupMenu.querySelectorAll('li')).filter((li) =>
    genres.includes(li.textContent)
  );
  listItems.forEach((li) => li.querySelector('a').classList.add('selected'));

  menuInfo.selected = genres;

  menuInfo.combinUsing = genreCombiner;

  moveSelectedToTop(menuInfo);
}

export function hasSelectedGenres(isTV) {
  return getSelectedGenres(isTV).length > 0;
}

export function hasSelectedLanguages() {
  return getSelectedLanguages().length > 0;
}

function getSelectedGenres(isTV) {
  const menuInfo = isTV
    ? allMenuInfo.tvGenreMenuInfo
    : allMenuInfo.movieGenreMenuInfo;
  const popupMenu = document.getElementById(menuInfo.popupName);
  if (!popupMenu) {
    return [];
  }
  const selected = Array.from(
    popupMenu.querySelector('ul').querySelectorAll('.selected')
  ).map((ea) => ea.textContent);
  return selected;
}

function getGenreCombineUsing(isTV) {
  const menuInfo = isTV
    ? allMenuInfo.tvGenreMenuInfo
    : allMenuInfo.movieGenreMenuInfo;
  return menuInfo.combinUsing;
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
  const popupMenu = document.getElementById(
    allMenuInfo.languageMenuInfo.popupName
  );
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

export function setExcludeAdult(excludeAdult) {
  const adultCheckbox = document.querySelector('#adult-filter-checkbox');
  adultCheckbox.checked = excludeAdult;
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
    global.lists.sortCriteria = initSortByDictionary();
    allMenuInfo.sortMenuInfo.contents = Array.from(
      global.lists.sortCriteria.values()
    );
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
  const labelRect = menuInfo.label().getBoundingClientRect();
  popUpDiv.style.position = 'absolute';
  popUpDiv.style.top = labelRect.top + 'px';
  popUpDiv.style.left = labelRect.right + 10 + 'px';

  const container = menuInfo.container();
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
  menuInfo.checkbox().checked = selectedItems.length > 0;

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
function addMenuListenersTo(menuInfo) {
  // Add a change listener to the checkbox
  const filterCheckbox = menuInfo.checkbox();
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
  menuInfo.label().addEventListener('click', function () {
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
    andChoice.id = menuInfo.container().id + '-and';
    andChoice.name = menuInfo.container().id + '-combine-using';
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
    orChoice.id = menuInfo.container().id + '-or';
    orChoice.name = menuInfo.container().id + '-combine-using';
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
  clarification.id = menuInfo.container().id + '-clarification';
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

  menuInfo.container().appendChild(combiner);

  menuInfo.combiner = combiner; // save the combiner in the menuInfo
}
function createSingleClarifierFor(menuInfo) {
  const clarification = document.createElement('div');
  clarification.id = menuInfo.container().id + '-single-clarification';
  clarification.classList.add('single-clarifier');
  clarification.textContent = '(' + menuInfo.selected[0] + ')';
  if (menuInfo.selected.length === 1) {
    clarification.style.display = 'inline-block';
  } else {
    clarification.style.display = 'none';
  }
  menuInfo.container().appendChild(clarification);

  menuInfo.singleClarifier = clarification; // save the single clarifier in the menuInfo
}

function initSortByDictionary() {
  const dictionary = new ExtendedMap();
  dictionary.set('original_title.asc', 'Original Title, Ascending');
  dictionary.set('original_title.desc', 'Original Title, Descending');
  dictionary.set('pouplarity.asc', 'Popularity, Ascending');
  dictionary.set('pouplarity.desc', 'Popularity, Descending');
  dictionary.set('revenue.asc', 'Revenue, Ascending');
  dictionary.set('revenue.desc', 'Revenue, Descending');
  dictionary.set('primary_release_date.asc', 'Primary release date, Ascending');
  dictionary.set(
    'primary_release_date.desc',
    'Primary release date, Descending'
  );
  dictionary.set('title.asc', 'Title, Ascending');
  dictionary.set('title.desc', 'Title, Descending');
  dictionary.set('vote_average.asc', 'Vote average, Ascending');
  dictionary.set('vote_average.desc', 'Vote average, Descending');
  dictionary.set('vote_count.desc', 'Vote count, Descending');

  return dictionary;
}
