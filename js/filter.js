import {
  discoverAPIData,
  fetchAPIData,
  getKeywordObjects,
} from './fetchData.js';
import { global } from './globals.js';
import { KeywordSearchDetailReturnInfo } from './detailReturn.js';
import { clearSearchResults } from './search.js';
import { ExtendedMap } from './extensions.js';
import {
  Filter,
  MultipleChoiceMenuFilter,
  SingleChoiceMenuFilter,
  AndOrMultipleChoiceMenuFilter,
  DynamicAndOrMultipleChoiceMenuFilter,
} from './filterClasses.js';

/* Keep all the filters in a dictionary */
const allFilters = new ExtendedMap();

/* Keep all the string constants in one place */
const stringConstants = {
  // Keys into the allFilters dictionary (Map)
  refineKeywordKey: 'refineKeyword',
  movieGenreKey: 'movieGenres',
  tvGenreKey: 'tvGenres',
  adultKey: 'adult',
  languagesKey: 'languages',
  sortKey: 'sort',

  // BaseIDs used when creating the filters, consistent with the html and css docs
  refineKeywordBaseID: 'refine-keyword',
  movieGenreBaseID: 'movie-genre',
  tvGenreBaseID: 'tv-genre',
  adultBaseID: 'adult',
  languageBaseID: 'language',
  sortBaseID: 'sort-by',

  // Styles for hiding and showing elements
  blockStyle: 'block',
  hiddenStyle: 'none',

  // IDs in the html docs for finding elements in the DOM
  filterTitleID: 'filter-title',
  filterContainerID: 'filter-container',
  filterListID: 'all-filters',

  movieRadioButtonID: 'movie-radio-button',
  tvRadioButtonID: 'tv-radio-button',
  keywordRadioButtonID: 'search-by-keyword',
  titleRadioButtonID: 'search-by-title',

  // Event names
  changeEvent: 'change',
  clickEvent: 'click',

  // Beginnings of parameters used in the API for fetching filtered data
  keywordAPIParam: '&with_keywords=',
  genreAPIParam: '&with_genres=',
  languageAPIParam: '&with_original_language=',
  adultAPIParam: '&include_adult=',
  sortAPIParam: '&sort_by=',

  // The class for finding popUpMenus
  popUpClassName: 'popup-menu',

  // The fetch endpoints into the API for accessing lists
  tvGenreAPIEndpoint: `genre/tv/list`,
  movieGenreAPIEndpoint: `genre/movie/list`,
  languagesAPIEndoint: 'configuration/languages',
};

/* Create and return a new DetailReturnInfo that is specific to a keyword search.
   This allows the user to come back to this specific state of a search after
   visiting the detail page for a specific movie or tv show. */
export function keywordResultInfo(isTV) {
  return new KeywordSearchDetailReturnInfo(
    isTV,
    global.search.term,
    global.search.page,
    getSelectedKeywords(),
    getKeywordCombineUsing(),
    getSelectedGenres(isTV),
    getGenreCombineUsing(isTV),
    getSelectedLanguages(),
    !includeAdult(),
    sortBy()
  );
}

/* Create and store the filter objects for all the different ways of filtering 
   a keyword search */
function createFilters() {
  allFilters.set(
    stringConstants.refineKeywordKey,
    new DynamicAndOrMultipleChoiceMenuFilter(
      stringConstants.refineKeywordBaseID,
      false, // use simple join strings
      repopulatedKeywordOptions
    )
  );
  allFilters.set(
    stringConstants.movieGenreKey,
    new AndOrMultipleChoiceMenuFilter(
      stringConstants.movieGenreBaseID,
      global.lists.genres.movies.map((ea) => ea.name)
    )
  );
  allFilters.set(
    stringConstants.tvGenreKey,
    new AndOrMultipleChoiceMenuFilter(
      stringConstants.tvGenreBaseID,
      global.lists.genres.tv.map((ea) => ea.name)
    )
  );
  allFilters.set(
    stringConstants.adultKey,
    new Filter(stringConstants.adultBaseID)
  );
  allFilters.set(
    stringConstants.languagesKey,
    new MultipleChoiceMenuFilter(
      stringConstants.languageBaseID,
      global.lists.languages.map((ea) => ea.english_name)
    )
  );
  allFilters.set(
    stringConstants.sortKey,
    new SingleChoiceMenuFilter(
      stringConstants.sortBaseID,
      Array.from(global.lists.sortCriteria.values())
    )
  );
}

/* Show in the DOM all of the filters; this requires showing both
   the filterContainer and the fliterList, the latter of which can
   be hidden independently. */
export function showFilters() {
  showAsBlock(filterContainer());
  showAsBlock(filterList());
}

export function hideFilters() {
  let container = filterContainer();
  if (container) {
    container.style.display = stringConstants.hiddenStyle;
  }
}

/* Either show or hide the given element, depending on whether
   it was currently showing. */
function toggleBlockVisibilityOf(element) {
  isShowing(element) ? hide(element) : showAsBlock(element);
}

/* Show the given element in the DOM using the block display style */
function showAsBlock(element) {
  if (element) {
    element.style.display = stringConstants.blockStyle;
  }
}

/* Hide the given element in the DOM */
function hide(element) {
  element.style.display = stringConstants.hiddenStyle;
}

/* Answer a Boolean: whether the given element is showing in the DOM */
function isShowing(element) {
  return element.style.display !== stringConstants.hiddenStyle;
}

/* Answer the element in the DOM that shows the filter title */
function filterTitle() {
  return document.getElementById(stringConstants.filterTitleID);
}

/* Answer the element in the DOM that holds both the filter list
   and the filter title */
function filterContainer() {
  return document.getElementById(stringConstants.filterContainerID);
}

/* Answer the element in the DOM that contains the list of filters */
function filterList() {
  return document.getElementById(stringConstants.filterListID);
}

/* Add the listeners that will respond to user events: when the filter
   title is clicked, hide or show the filter list; fill the global lists
   from the API; create the filters; and respond to changes in the radio buttons */
export async function addFilterListeners() {
  filterTitle().addEventListener(stringConstants.clickEvent, () => {
    toggleBlockVisibilityOf(filterList());
  });
  await fillLists();
  createFilters(); // these add their own listeners when created

  addRadioButtonListeners();

  if (!isKeywordSearch()) {
    hide(filterContainer());
    hide(filterList());
  }
}

/* Uncheck all the filter radio buttons */
function clearCheckboxes() {
  allFilters.forEach((filter) => filter.clear());
}

/* Answer the element in the DOM that the user clicks on to search for movies */
function movieRadioButton() {
  return document.getElementById(stringConstants.movieRadioButtonID);
}

/* Answer the element in the DOM that the user clicks on to search for tv shows */
function tvRadioButton() {
  return document.getElementById(stringConstants.tvRadioButtonID);
}

/* Answer the element in the DOM that the user clicks on to search by keyword 
   and filter search results */
function keywordRadioButton() {
  return document.getElementById(stringConstants.keywordRadioButtonID);
}

/* Answer the element in the DOM that the user clicks on to search by title */
function titleRadioButton() {
  return document.getElementById(stringConstants.titleRadioButtonID);
}

function isKeywordSearch() {
  return keywordRadioButton().checked;
}

/* Add the listeners that respond to clicks on radio buttons. When switching
   between movie and tv, clear all the search results and uncheck all the filter
   checkboxes. Also, hide whichever genre filter (tv or movie) is not selected.
   When switching between title and keyword search, clear all the search results
   and if a title search, hide the filters or, if a keyword search, show the filters. */
function addRadioButtonListeners() {
  // TV vs. Movie
  movieRadioButton().addEventListener(stringConstants.changeEvent, (event) => {
    clearSearchResults();
    if (isKeywordSearch()) {
      clearCheckboxes();
      hideUnusedGenreFilter(!event.target.checked);
    }
  });

  tvRadioButton().addEventListener(stringConstants.changeEvent, (event) => {
    clearSearchResults();
    if (isKeywordSearch()) {
      clearCheckboxes();
      hideUnusedGenreFilter(event.target.checked);
    }
  });

  hideUnusedGenreFilter(tvRadioButton.checked);

  // Keyword vs. Title
  keywordRadioButton().addEventListener(
    stringConstants.changeEvent,
    (event) => {
      clearSearchResults();
      hideFilterContainerIf(!event.target.checked);
    }
  );

  titleRadioButton().addEventListener(stringConstants.changeEvent, (event) => {
    clearSearchResults();
    hideFilterContainerIf(event.target.checked);
  });

  hideFilterContainerIf(titleRadioButton.checked);
}

/* If a title search is chosen (titleChecked is true), hide the filters; otherwise, show them */
function hideFilterContainerIf(titleChecked) {
  titleChecked ? hide(filterContainer()) : showAsBlock(filterContainer());
}

/* If doing a TV search, hide the movie genre filter and vice versa. Close
   any open popUpMenus when switching. */
function hideUnusedGenreFilter(isTV) {
  closeAllPopups();
  getGenreFilter(isTV).show();
  getGenreFilter(!isTV).hide();
}

function getRefineKeywordFilter() {
  return allFilters.get(stringConstants.refineKeywordKey);
}

/* Answer the correct genre filter, depending on whether the user is searching
   for TV shows or movies. */
function getGenreFilter(isTV) {
  return isTV
    ? allFilters.get(stringConstants.tvGenreKey)
    : allFilters.get(stringConstants.movieGenreKey);
}

/* Answer the language filter */
function getLanguageFilter() {
  return allFilters.get(stringConstants.languagesKey);
}

/* Answer the adult filter */
function getAdultFilter() {
  return allFilters.get(stringConstants.adultKey);
}

/* Answer the sort filter */
function getSortFilter() {
  return allFilters.get(stringConstants.sortKey);
}

/* Answer the results of executing a keyword search with
   the current filter settings */
export async function getFilterResults(isTV = false) {
  const results = await doFilter(isTV);
  return results;
}

/* Do the keyword search with the current filter settings */
async function doFilter(isTV) {
  closeAllPopups();

  // Build the filter parameters string
  let filters = '';

  if (hasRefinedKeywords()) {
    const keywordRefinements = getSelectedKeywordCodes();
    filters +=
      stringConstants.keywordAPIParam +
      keywordRefinements.join(getRefineKeywordJoinString());
  }

  if (hasSelectedGenres(isTV)) {
    const genreCodes = getSelectedGenreCodes(isTV);
    filters +=
      stringConstants.genreAPIParam + genreCodes.join(getGenreJoinString(isTV));
  }

  if (hasSelectedLanguages()) {
    const languages = getSelectedLanguageCodes();
    filters += stringConstants.languageAPIParam + languages.join('|');
  }

  filters += stringConstants.adultAPIParam + includeAdult();

  if (hasSort()) {
    filters += stringConstants.sortAPIParam + sortBy();
  }

  const results = await discoverAPIData(filters, hasRefinedKeywords());
  return results;
}

/* Answer the API-friendly sort-by string of whichever sort criteria
   the user has chosen */
function sortBy() {
  return global.lists.sortCriteria.getKeyByValue(getSortFilter().selected[0]);
}

/* The user has returned from a details page and we are restoring the last
   search. Replace the language filter with one that has selected the specific 
   languages last chosen by the user. */
export function setSelectedLanguages(languages) {
  let languageFilter = getLanguageFilter();
  if (languageFilter) {
    languageFilter.setSelectedListItemAnchorTextFrom(languages);
  }
}

/* The user has returned from a details page and we are restoring the last
   search. Replace the sort filter with one that has selected the specific 
   sort criteria last chosen by the user. */
export function setSortBy(sortByString) {
  let sortFilter = getSortFilter();
  if (sortFilter) {
    sortFilter.setSelectedListItemAnchorTextFrom([
      global.lists.sortCriteria.get(sortByString),
    ]);
  }
}

/* The user has returned from a details page and we are restoring the last
   search. Replace the genre filter with one that has selected the specific 
   genres and combiner last chosen by the user. */
export function setSelectedGenres(isTV, genres, genreCombiner) {
  let genreFilter = getGenreFilter(isTV);
  if (genreFilter) {
    genreFilter.setSelectedListItemAnchorTextFrom(genres);
    genreFilter.setCombineUsing(genreCombiner);
    hideUnusedGenreFilter(isTV); // make sure only TV genres or Movie genres are showing
  }
}

/* The user has returned from a details page and we are restoring the last
   search. Replace the genre filter with one that has selected the specific 
   genres and combiner last chosen by the user. */
export async function setSelectedKeywords(keywords, keywordCombiner) {
  let keywordFilter = getRefineKeywordFilter();
  if (keywordFilter) {
    await keywordFilter.setSelectedListItemAnchorTextFrom(keywords);
    keywordFilter.setCombineUsing(keywordCombiner);
  }
}

/* The user has returned from a details page and we are restoring the last
   search. Set the state of the excludeAdult filter to the state last 
   chosen by the user. */
export function setExcludeAdult(excludeAdult) {
  let adultFilter = getAdultFilter();
  if (adultFilter) {
    adultFilter.setFiltered(excludeAdult);
  }
}

export function hasRefinedKeywords() {
  return getRefineKeywordFilter().hasSelected();
}
/* Answer a Boolean: whether there are any genres to filter the search results by */
export function hasSelectedGenres(isTV) {
  return getGenreFilter(isTV).hasSelected();
}

/* Answer a Boolean: whether there are any languages to filter the search results by */
export function hasSelectedLanguages() {
  return getLanguageFilter().hasSelected();
}

/* Answer a Boolean: whether to filter the search results by excluding adult content */
function filterAdult() {
  return getAdultFilter().isFiltered();
}

/* Answer a Boolean: whether there is any sort criteria for the search results */
function hasSort() {
  return getSortFilter().hasSelected();
}

function getSelectedKeywords() {
  return getRefineKeywordFilter().getSelected();
}

function getSelectedKeywordCodes() {
  return global.lists.keywordObjects
    .filter((ea) => getSelectedKeywords().includes(ea.name))
    .map((ea) => ea.id);
}

/* Answer the selected genres for either TV or movies */
function getSelectedGenres(isTV) {
  return getGenreFilter(isTV).getSelected();
}

/* Answer the string used by the API to join selected genres */
function getGenreJoinString(isTV) {
  return getGenreFilter(isTV).getJoinString();
}

function getRefineKeywordJoinString() {
  return getRefineKeywordFilter().getJoinString();
}

/* Answer the string the user sees ('and' or 'or') for joining selected genres;
   this is also the string sent to the details page for restoring the search on
   return from the details page. */
function getGenreCombineUsing(isTV) {
  return getGenreFilter(isTV).getCombineUsing();
}

function getKeywordCombineUsing() {
  return getRefineKeywordFilter().getCombineUsing();
}

/* Answer an Array of the API-defined genre codes for the selected genre strings, 
   which differ depending on whether we are searching for movies or TV shows. */
function getSelectedGenreCodes(isTV) {
  const wholeList = isTV ? global.lists.genres.tv : global.lists.genres.movies;

  const selectedGenreNames = getSelectedGenres(isTV);
  const selectedGenreCodes = wholeList
    .filter((ea) => selectedGenreNames.includes(ea.name))
    .map((ea) => ea.id);
  return selectedGenreCodes;
}

/* Answer an Array of Strings: the languages selected by the user */
function getSelectedLanguages() {
  return getLanguageFilter().getSelected();
}

/* Answer an Array of the API-defined language codes for the selected language
   strings. */
function getSelectedLanguageCodes() {
  const wholeList = global.lists.languages;
  const selectedLanguages = getSelectedLanguages();
  const selectedLanguageCodes = wholeList
    .filter((ea) => selectedLanguages.includes(ea.english_name))
    .map((ea) => ea.iso_639_1);
  return selectedLanguageCodes;
}

/* Answer a Boolean: whether to include adult content in the search */
function includeAdult() {
  return !getAdultFilter().isFiltered();
}

/* Go to the API and get the lists of tv and movie genres and their API-defined
   codes, plus the list of languages and their API-defined codes, and store them
   in the global. Also fill in the sort criteria copied from the movie db website,
   and store those in the global. */
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
    global.lists.sortCriteria = initSortByDictionary();
  }
}

/* Go to the API for the list of genres and their API-defined codes and answer
   an Array of those objects (strings and codes bundled together). There are 
   different genres, depending on whether we're searching the tv or movie database. */
async function getGenres(isTV = false) {
  const endPoint = isTV
    ? stringConstants.tvGenreAPIEndpoint
    : stringConstants.movieGenreAPIEndpoint;
  const genres = await fetchAPIData(endPoint);
  return genres;
}

/* Go to the API for the list of languages and their API-defined codes and answer
   an Array of those objects (strings and codes bundled together). */
async function getLanguages() {
  const languages = await fetchAPIData(stringConstants.languagesAPIEndoint);
  return languages;
}

/* Find and answer all of the popUpMenus in the DOM by the popUpClassName */
function allPopUps() {
  return Array.from(
    document.getElementsByClassName(stringConstants.popUpClassName)
  );
}

/* Close (hide) all of the popUpMenus in the DOM */
function closeAllPopups() {
  allPopUps().forEach((popUp) => {
    hide(popUp);
  });
}

/* Create and answer a Dictionary (Map) of all of the sort criteria. The keys
   are the sort strings used by the API, and the values are the sort strings
   friendly to the user, for use in displaying the menu and feedback strings. */
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

/* For the dynamically-popuplated keyword menu, this is the function it uses
   to repopulate its menu options. Answer the Array of Strings it will use
   in its menu. */
async function repopulatedKeywordOptions() {
  const textInput = document.querySelector('#search-term');
  global.search.term = textInput.value;
  let options = [];
  if (global.search.term.length > 0) {
    global.lists.keywordObjects = await getKeywordObjects();
    options = global.lists.keywordObjects
      .map((ea) => ea.name)
      .filter((ea) => ea[0] !== '#');
  }
  return options;
}
