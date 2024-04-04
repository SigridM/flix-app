import { global } from './globals.js';
import { searchAPIData } from './fetchData.js';
import { getFilterResults } from './filter.js';

/* An Abstract superclass of classes that contain all the details for going to a return page and
   returning from that page when the back button is clicked. Their primary functions are to 
   populate the URL parameters with the data necessary for going to the details page when a
   movie or tv show is clicked on, and for the back button anchor when the user wishes to return
   from the details. */
export class DetailReturnInfo {
  /* Create a new instance. Default is not a TV details page; therefore: a movie details page.
   Also defaults to null media, but this will be overridden with subclasses. */
  constructor(isTV = false) {
    this.isTV = isTV;
    this.media = null;
  }

  //@to-do add stringConstants

  /* Create and answer a new instance of the receiver using the Abstract Factory pattern.
     Based on the settings in the urlParams, determine which subclass to instantiate.  
     If there is no search in the urlParams, return an intance of PopularDetailReturnInfo, 
     which works for popular, now-playing, and top-rated movies and tv shows.
     If it is a search, determine whether it is a simple title search or a keyworded
     and filtered search, and return the appropriate subclass instance.*/
  static fromURL(urlParams, isTV) {
    const isSearch = urlParams.get('search') == 'true';
    if (!isSearch) {
      return new PopularDetailReturnInfo(isTV);
    }

    const searchType = urlParams.get('search-type');
    const searchTerm = urlParams.get('search-term');
    const savedPage = urlParams.get('page');
    if (searchType === 'title') {
      return new SearchDetailReturnInfo(isTV, searchTerm, savedPage);
    }

    const keywords = urlParams.get('keywords').split('-');
    const keywordCombineUsing = urlParams.get('keyword-combine-using');
    const genres = urlParams.get('genres').split('-');
    const genreCombineUsing = urlParams.get('genre-combine-using');
    const languages = urlParams.get('languages').split('-');
    const excludeAdult = urlParams.get('exclude-adult');
    const sortBy = urlParams.get('sort-by');

    return new KeywordSearchDetailReturnInfo(
      isTV,
      searchTerm,
      savedPage,
      keywords,
      keywordCombineUsing,
      genres,
      genreCombineUsing,
      languages,
      excludeAdult,
      sortBy
    );
  }

  /* Answer the url for the details page for either tv show or movie details */
  detailsPage() {
    return this.isTV ? 'tv-details.html' : 'movie-details.html';
  }

  /* Set the two different image paths for getting different-sized images from the API */
  imagePaths = {
    original: 'https://image.tmdb.org/t/p/original', // 'original' means original size
    width500: 'https://image.tmdb.org/t/p/w500', // 'w500' means width of 500
  };

  /* Answer an image element that displays 'No Image' when the image is not 
     provided by the API */
  noImage() {
    const alt = this.isTV ? 'Show Title' : 'Movie Title';
    const img = document.createElement('img');
    img.src = 'images/no-image.jpg';
    img.classList.add('card-img-top');
    img.alt = alt;
    return img;
  }

  /* Answer an image element with the 500-pixel-width image provided by
     the API */
  imageLink() {
    const img = document.createElement('img');
    img.src = this.imagePaths.width500 + this.media.poster_path;
    img.alt = this.isTV ? this.media.name : this.media.title;
    img.classList.add('card-img-top');
    return img;
  }

  /* Answer the image element that will display the poster path image
     for this instance's media, if there is one; otherwise, answer the
     no-image image element. */
  posterPathImageLink() {
    return this.media.poster_path // if not null
      ? this.imageLink()
      : this.noImage();
  }

  /* Answer the url + search parameters string that will form the link for when
     a user clicks on an image of a movie or tv show to get to the details
     page for that movie or show */
  detailsHRef() {
    return (
      this.detailsPage() + '?id=' + this.media.id + '&search=' + this.isSearch()
    );
  }

  /* Answer the url string attached to the back button that will get the user back
     from the details page to the list or search page where they started */
  backButtonHRef() {
    return this.isTV ? 'shows.html' : 'index.html';
  }

  /* Answer the text content string of the back button */
  backButtonTextContent() {
    return this.isTV ? 'Back to TV Shows' : 'Back to Movies';
  }

  /* Answer a Boolean: whether this detail info represents a search; default is false;
     subclasses may override. */
  isSearch() {
    return false;
  }

  /* Answer the anchor element that will take the user to the details page for
     a movie or tv show when they click on an image. */
  anchor() {
    const imageLink = this.posterPathImageLink();

    const anchor = document.createElement('a');
    anchor.href = this.detailsHRef();
    anchor.appendChild(imageLink);
    return anchor;
  }

  /* Create and add to the DOM an icon element showing the average rating for this
     tv show or movie. */
  addRatingIcon(wrapper) {
    const ratingIcon = document.createElement('i');
    // ['fas', 'fa-star', 'text-secondary'].forEach((ratingClass) => {
    //   ratingIcon.classList.add(ratingClass);
    // });
    ratingIcon.classList.add('fas', 'fa-star', 'text-secondary');
    const vote = this.media.vote_average ? this.media.vote_average : 0;
    wrapper.textContent = ` ${vote.toFixed(1)} / 10`;
    wrapper.insertBefore(ratingIcon, wrapper.firstChild);
  }

  /* Create and return a div element for an image card for the receiver's tv show
     or movie which will contain the anchor for showing details when the user 
     clicks on the image. */
  cardDiv() {
    const div = document.createElement('div');
    div.classList.add(this.divClassName);

    div.appendChild(this.anchor());
    div.appendChild(this.cardBody());
    return div;
  }

  /* Add to the DOM an image card showing the receiver's tv show or movie. */
  addCardDivFor(media) {
    this.media = media;
    const parentDiv = document.querySelector(this.parentDivClassName);
    parentDiv.appendChild(this.cardDiv());
  }

  /* Create and return the default card body div element for a particular movie 
   or TV show, including a caption under the title */
  cardBody() {
    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = this.isTV ? this.media.name : this.media.title;

    const cardCaption = document.createElement('p');
    cardCaption.classList.add('card-text');

    const releaseDate = document.createElement('small');
    releaseDate.textContent = this.isTV
      ? this.media.first_air_date
      : this.media.release_date;
    cardCaption.appendChild(releaseDate);

    const rating = document.createElement('small');
    this.addRatingIcon(rating); // adds a star and a number to the element
    cardCaption.appendChild(rating);

    cardCaption.style.display = 'flex';
    cardCaption.style.justifyContent = 'space-between';

    cardBodyDiv.appendChild(title);
    cardBodyDiv.appendChild(cardCaption);

    return cardBodyDiv;
  }

  /* Given the Array of tv shows or movies in the results parameter, create  
     and add to the DOM an image card for each. */
  displayResults(results) {
    results.forEach((mediaResult) => {
      const div = this.addCardDivFor(mediaResult);
    });
  }
}

/* A subclass of DetailReturnInfo that shows a simple static image for a 
   popular tv show or popular movie, without search parameters in the 
   details link, and without any swiper activity */
export class PopularDetailReturnInfo extends DetailReturnInfo {
  constructor(isTV) {
    super(isTV);
    this.parentDivClassName = this.isTV ? '#popular-shows' : '#popular-movies';
  }
  divClassName = 'card';
}

/* A subclass of DetailReturnInfo that displays its image within a 
   swiper */
export class SwiperDetailReturnInfo extends DetailReturnInfo {
  divClassName = 'swiper-slide';
  parentDivClassName = '.swiper-wrapper';

  /* Create and return the h4 element that contains a rating icon */
  cardBody() {
    const h4 = document.createElement('h4');
    h4.classList.add('swiper-rating');
    this.addRatingIcon(h4);
    return h4;
  }

  /* Create and return a div element for an image card for the receiver's tv show
     or movie which will contain the anchor for showing details when the user 
     clicks on the image. This overrides the superclass method to also initialize 
     the swiper action on the card */
  cardDiv() {
    const div = super.cardDiv();
    this.initAction();
    return div;
  }

  /* Initialize the swiper action for a card. */
  initAction() {
    const swiperClass = this.isTV ? '.tv-swiper' : '.swiper';
    const swiper = new Swiper(swiperClass, {
      slidesPerView: 1,
      speed: 400,
      spaceBetween: 30,
      freeMode: true,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      breakpoints: {
        500: {
          slidesPerView: 2,
        },
        700: {
          slidesPerView: 3,
        },
        1200: {
          slidesPerView: 4,
        },
      },
    });
  }
}

/* A subclass of DetailReturnInfo that keeps track of any simple search 
   info that was used to compile the list of movies shown to the user.
   This search info will be passed via url params to the details page
   and also set into the back button on the details page so the user 
   can return to the same search results after they have finished viewing
   the details of a tv show or movie. */
export class SearchDetailReturnInfo extends DetailReturnInfo {
  /* Override the superclass constructor to also set the search 
     term and the search page being displayed. Default is no search
     term and the first search page. */
  constructor(isTV, searchTerm = '', originPage = 1) {
    super(isTV);
    this.searchTerm = searchTerm;
    this.originPage = originPage;
  }

  /* Initalize some default string constants. */
  divClassName = 'card';
  parentDivClassName = '#search-results';
  searchType = 'title';

  /* Answer a Boolean indicating that this is a search detail. */
  isSearch() {
    return true;
  }

  /* Answer a String indicating whether we are searching tv shows
     or movies */
  searchSpace() {
    return this.isTV ? 'tv' : 'movie';
  }

  /* Answer the url string that will go into the back button displayed
     on the details page, and will allow the user to return to the 
     same page of the same search they were on before they clicked 
     the details page. */
  backButtonHRef() {
    return (
      'search.html?space=' +
      this.searchSpace() +
      '&search-type=' +
      this.searchType +
      '&search-term=' +
      this.searchTerm +
      '&page=' +
      this.originPage
    );
  }

  /* Answer the string that will go into the text of the back button
     on the details page. */
  backButtonTextContent() {
    return this.isTV ? 'Back to TV Show Search' : 'Back to Movie Search';
  }

  /* Answer the string that will serve as the url for getting to the 
     details page with all the information in the url necessary to return
     to the same search. */
  detailsHRef() {
    return (
      super.detailsHRef() +
      '&search-type=' +
      this.searchType +
      '&search-term=' +
      this.searchTerm +
      '&page=' +
      this.originPage
    );
  }

  /* Create and answer an h2 element for showing the user exactly 
     what they searched for (e.g., "Movies containing 'Comedy' in 
     the title"). */
  searchResultsH2() {
    let h2 = document.querySelector('#results-heading');
    if (!h2) {
      h2 = document.createElement('h2');
      h2.id = 'results-heading';
    }
    return h2;
  }

  /* Create and answer a String that will go at the beginning of
     the information showing the user exactly what they searched
     for. At the beginnning of the string, it will show how many
     movies or tv shows are being displayed and how many total
     tv shows or movies were in the search. */
  searchResultsPreamble(numResultsThisPage) {
    const beforeStart = 20 * (this.originPage - 1);
    const end = beforeStart + Math.min(numResultsThisPage, 20);
    const totalResults = global.search.totalResults.toLocaleString();

    const textContent = `Showing ${
      beforeStart + 1
    } to ${end} of ${totalResults} results for `;
    return textContent;
  }

  /* Answer the h2 element showing the user exactly what they
     searched for and what is currently being displayed */
  searchResultsHeading(numResultsThisPage) {
    const h2 = this.searchResultsH2();

    h2.textContent =
      this.searchResultsPreamble(numResultsThisPage) +
      `${
        this.isTV ? ' TV Shows' : ' Movies'
      } with ${this.quotedSearchTerm()} in the title`;
    return h2;
  }

  /* Answer a String that is the search term surrounded by quotes */
  quotedSearchTerm() {
    return `'${this.searchTerm}'`;
  }

  /* Go to the next search page (called an "origin" page because this
     is the origin for the details, the place to which the details page
     back button will return). */
  increaseOriginPage() {
    this.originPage++;
    global.search.page = this.originPage;
  }

  /* Go to the previous search page (called an "origin" page because this
     is the origin for the details, the place to which the details page
     back button will return). */
  decreaseOriginPage() {
    this.originPage--;
    global.search.page = this.originPage;
  }

  /* Go to the first search page (called an "origin" page because this
     is the origin for the details, the place to which the details page
     back button will return). */
  goToFirstOriginPage() {
    this.originPage = 1;
    global.search.page = this.originPage;
  }

  /* Go to the last search page (called an "origin" page because this
     is the origin for the details, the place to which the details page
     back button will return). */
  goToLastOriginPage() {
    this.originPage = global.search.totalPages;
    global.search.page = this.originPage;
  }

  /* Based on the search details stored in the global variable, perform
     a title search. */
  async getResults() {
    return await searchAPIData();
  }

  /* Fetch and answer the search results for a title search initiated for 
     the first time (sent from search.js when the user clicks the search
     button). */
  async getInitialResults() {
    const { results, total_pages, page, total_results } =
      await this.getResults();
    global.search.page = page;
    this.originPage = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    return results;
  }

  /* Clear the current search page. This has to happen whenever we go to
     a new page of a search or performa a new search. */
  clearPreviousResults() {
    document.querySelector('#search-results').innerHTML = '';
  }

  /* Respond to a page button (First, Previous, Next or Last) being clicked 
   by displaying the appropriate traunch of results. */
  async pageButtonClick(pageSetFunction) {
    pageSetFunction();
    const { results } = await this.getResults();
    this.displayResults(results);
  }

  /* Create a page button (First, Previous, Next or Last) if it doesn't
     already exist in the DOM and add it to the DOM. Also give it the function
     it should peform when it is clicked. */
  addPaginationButton(text, num, pageSetFunction, paginationDiv, isDisabled) {
    const id = text.toLowerCase() + num;
    let button = document.getElementById(id);
    if (!button) {
      button = document.createElement('button');
      button.classList.add('btn', 'btn-primary');
      button.id = id;
      button.textContent = text;
      button.addEventListener('click', async () => {
        await this.pageButtonClick(pageSetFunction);
      });
      paginationDiv.appendChild(button);
    }
    button.disabled = isDisabled;
  }

  /* Create and add to the DOM pagination for search, if it is not already
     in the DOM. This means adding all of the page buttons (First, Previous, 
     Next and Last) and the div element in which they reside, as well as the 
     text saying which page we are on of the total number of pages.*/
  displayPagination(numResultsThisPage, num) {
    const heading = document.querySelector('#search-results-heading');
    const h2 = this.searchResultsHeading(numResultsThisPage);
    heading.appendChild(h2);

    let paginationDiv = document.querySelector('#page-button-container' + num);
    if (!paginationDiv) {
      paginationDiv = document.createElement('div');
      paginationDiv.id = 'page-button-container' + num;
      paginationDiv.classList.add('page-button-container');
      document.querySelector('#pagination' + num).appendChild(paginationDiv);
    }

    this.addPaginationButton(
      'First',
      num,
      this.goToFirstOriginPage.bind(this),
      paginationDiv,
      this.originPage == 1
    );

    this.addPaginationButton(
      'Prev',
      num,
      this.decreaseOriginPage.bind(this),
      paginationDiv,
      this.originPage == 1
    );

    this.addPaginationButton(
      'Next',
      num,
      this.increaseOriginPage.bind(this),
      paginationDiv,
      this.originPage == global.search.totalPages
    );

    this.addPaginationButton(
      'Last',
      num,
      this.goToLastOriginPage.bind(this),
      paginationDiv,
      this.originPage == global.search.totalPages
    );

    let pageCounter = document.querySelector('.page-counter' + num);
    if (!pageCounter) {
      pageCounter = document.createElement('div');
      pageCounter.classList.add('page-counter' + num);
      document.querySelector('#pagination' + num).appendChild(pageCounter);
    }
    pageCounter.textContent =
      'Page ' + this.originPage + ' of ' + global.search.totalPages;
  }

  /* Show in the DOM the results of the current search, clearing the previous
     search first, and showing pagination buttons at the top and bottom of
     the result cards. */
  displayResults(results) {
    this.clearPreviousResults();
    this.displayPagination(results.length, 1);
    super.displayResults(results);
    this.displayPagination(results.length, 2);
  }
}

/* A subclass of SearchDetailReturnInfo, KeywordSearchDetailReturnInfo is the 
   most complicated type of search, allowing the user to filter their search 
   results by keyword, genre, language, and other parameters. */
export class KeywordSearchDetailReturnInfo extends SearchDetailReturnInfo {
  /* Create a new KeywordSearchDetailReturnInfo */
  constructor(
    isTV,
    searchTerm = '',
    originPage = 1,
    keywords = [],
    keywordCombineUsing = 'and',
    genres = [],
    genreCombineUsing = 'and',
    languages = [],
    excludeAdult = false,
    sortBy = null
  ) {
    super(isTV, searchTerm, originPage);
    this.keywords = keywords;
    this.keywordCombineUsing = keywordCombineUsing;
    this.genres = genres;
    this.genreCombineUsing = genreCombineUsing;
    this.languages = languages;
    this.excludeAdult = excludeAdult;
    this.sortBy = sortBy;
  }

  /* Set the kind of search */
  searchType = 'keyword';

  /* Answer the url string that will go into the back button displayed
     on the details page, and will allow the user to return to the 
     same page of the same keyword search they were on before they clicked 
     the details page. */
  backButtonHRef() {
    return (
      super.backButtonHRef() +
      '&keywords=' +
      this.keywords.join('-') +
      '&keyword-combine-using=' +
      this.keywordCombineUsing +
      '&genres=' +
      this.genres.join('-') +
      '&genre-combine-using=' +
      this.genreCombineUsing +
      '&languages=' +
      this.languages.join('-') +
      '&exclude-adult=' +
      this.excludeAdult +
      '&sort-by=' +
      this.sortBy
    );
  }
  /* Answer the string that will serve as the url for getting to the 
     details page with all the information in the url necessary to return
     to the same keyword search. */
  detailsHRef() {
    return (
      super.detailsHRef() +
      '&keywords=' +
      this.keywords.join('-') +
      '&keyword-combine-using=' +
      this.keywordCombineUsing +
      '&genres=' +
      this.genres.join('-') +
      '&genre-combine-using=' +
      this.genreCombineUsing +
      '&languages=' +
      this.languages.join('-') +
      '&exclude-adult=' +
      this.excludeAdult +
      '&sort-by=' +
      this.sortBy
    );
  }

  /* Answer the h2 element showing the user exactly what they
     searched for and what is currently being displayed */
  searchResultsHeading(numResultsThisPage) {
    const h2 = this.searchResultsH2();

    let textContent = this.searchResultsPreamble(numResultsThisPage);
    textContent += this.genres.join(' ' + this.genreCombineUsing + ' ');
    textContent += `${this.isTV ? ' TV Shows' : ' Movies'}`;

    const noSearchTerm =
      global.search.term === '' || global.search.term === null;
    textContent += noSearchTerm ? '' : ' containing ' + this.quotedSearchTerm();

    if (this.languages.length > 0) {
      textContent += ' in ' + this.languages.join(' or ');
    }

    if (this.excludeAdult) {
      textContent += ', excluding adult content';
    }

    textContent += this.sortBy
      ? '; sorted by ' + global.lists.sortCriteria.get(this.sortBy)
      : '';
    h2.textContent = textContent;
    return h2;
  }

  /* Override the superclass method because the user could search on a 
     number of keywords. */
  quotedSearchTerm() {
    if (this.keywords.length === 0) {
      return super.quotedSearchTerm();
    }
    return (
      '"' + this.keywords.join('" ' + this.keywordCombineUsing + ' "') + '"'
    );
  }

  /* Override the superclass method to get the results filtered by all
     the filter criteria as managed in filter.js */
  async getResults() {
    // go to filter.js to get the results
    return await getFilterResults(this.isTV);
  }
}
