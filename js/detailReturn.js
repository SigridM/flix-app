import { global } from './globals.js';
import { searchAPIData } from './fetchData.js';
import { getFilterResults } from './filter.js';
export class DetailReturnInfo {
  // Abstract
  constructor(isTV = false) {
    this.isTV = isTV;
    this.media = null;
  }

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

    const genres = urlParams.get('genres').split('+');
    const genreCombineUsing = urlParams.get('genre-combine-using');
    const languages = urlParams.get('languages').split('+');
    const excludeAdult = urlParams.get('exclude-adult');
    const sortBy = urlParams.get('sort-by');

    return new KeywordSearchDetailReturnInfo(
      isTV,
      searchTerm,
      savedPage,
      genres,
      genreCombineUsing,
      languages,
      excludeAdult,
      sortBy
    );
  }

  detailsPage() {
    return this.isTV ? 'tv-details.html' : 'movie-details.html';
  }

  imagePaths = {
    original: 'https://image.tmdb.org/t/p/original', // 'original' means original size
    width500: 'https://image.tmdb.org/t/p/w500', // 'w500' means width of 500
  };

  noImage() {
    const alt = this.isTV ? 'Show Title' : 'Movie Title';
    const img = document.createElement('img');
    img.src = '../images/no-image.jpg';
    img.classList.add('card-img-top');
    img.alt = alt;
    return img;
  }

  imageLink() {
    const img = document.createElement('img');
    img.src = this.imagePaths.width500 + this.media.poster_path;
    img.alt = this.isTV ? this.media.name : this.media.title;
    img.classList.add('card-img-top');
    return img;
  }

  posterPathImageLink() {
    return this.media.poster_path // if not null
      ? this.imageLink()
      : this.noImage();
  }

  detailsHRef() {
    return (
      this.detailsPage() + '?id=' + this.media.id + '&search=' + this.isSearch()
    );
  }

  backButtonHRef() {
    return this.isTV ? 'shows.html' : 'index.html';
  }

  backButtonTextContent() {
    return this.isTV ? 'Back to TV Shows' : 'Back to Movies';
  }

  isSearch() {
    return false;
  }
  anchor() {
    const imageLink = this.posterPathImageLink();

    const anchor = document.createElement('a');
    anchor.href = this.detailsHRef();
    anchor.appendChild(imageLink);
    return anchor;
  }

  initAction() {}

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

  cardDiv() {
    const div = document.createElement('div');
    div.classList.add(this.divClassName);

    div.appendChild(this.anchor());
    div.appendChild(this.cardBody());
    this.initAction();
    return div;
  }

  addCardDivFor(media) {
    this.media = media;
    const parentDiv = document.querySelector(this.parentDivClassName);
    parentDiv.appendChild(this.cardDiv());
  }

  // Create and return the default card body div element for a particular movie or TV show, including a
  // caption under the title
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

  displayResults(results) {
    results.forEach((mediaResult) => {
      const div = this.addCardDivFor(mediaResult);
    });
  }
}

export class PopularDetailReturnInfo extends DetailReturnInfo {
  constructor(isTV) {
    super(isTV);
    this.parentDivClassName = this.isTV ? '#popular-shows' : '#popular-movies';
  }
  divClassName = 'card';
}

export class SwiperDetailReturnInfo extends DetailReturnInfo {
  divClassName = 'swiper-slide';
  parentDivClassName = '.swiper-wrapper';

  // Create and return the h4 element that contains a rating icon
  cardBody() {
    const h4 = document.createElement('h4');
    h4.classList.add('swiper-rating');
    this.addRatingIcon(h4);
    return h4;
  }

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

export class SearchDetailReturnInfo extends DetailReturnInfo {
  constructor(isTV, searchTerm = '', originPage = 1) {
    super(isTV);
    this.searchTerm = searchTerm;
    this.originPage = originPage;
  }

  divClassName = 'card';
  parentDivClassName = '#search-results';
  searchType = 'title';

  isSearch() {
    return true;
  }

  searchSpace() {
    return this.isTV ? 'tv' : 'movie';
  }

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

  backButtonTextContent() {
    return this.isTV ? 'Back to TV Show Search' : 'Back to Movie Search';
  }

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

  searchResultsH2() {
    let h2 = document.querySelector('#results-heading');
    if (!h2) {
      h2 = document.createElement('h2');
      h2.id = 'results-heading';
    }
    return h2;
  }

  searchResultsPreamble(numResultsThisPage) {
    const beforeStart = 20 * (this.originPage - 1);
    const end = beforeStart + Math.min(numResultsThisPage, 20);
    const totalResults = global.search.totalResults.toLocaleString();

    const textContent = `Showing ${
      beforeStart + 1
    } to ${end} of ${totalResults} results for `;
    return textContent;
  }
  searchResultsHeading(numResultsThisPage) {
    const h2 = this.searchResultsH2();

    h2.textContent =
      this.searchResultsPreamble(numResultsThisPage) +
      `${
        this.isTV ? ' TV Shows' : ' Movies'
      } with ${this.quotedSearchTerm()} in the title`;
    return h2;
  }
  quotedSearchTerm() {
    return `'${this.searchTerm}'`;
  }

  increaseOriginPage() {
    this.originPage++;
    global.search.page = this.originPage;
  }

  decreaseOriginPage() {
    this.originPage--;
    global.search.page = this.originPage;
  }

  goToFirstOriginPage() {
    this.originPage = 1;
    global.search.page = this.originPage;
  }

  goToLastOriginPage() {
    this.originPage = global.search.totalPages;
    global.search.page = this.originPage;
  }

  async getResults() {
    return await searchAPIData();
  }

  async getInitialResults() {
    const { results, total_pages, page, total_results } =
      await this.getResults();
    global.search.page = page;
    this.originPage = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    return results;
  }

  clearPreviousResults() {
    document.querySelector('#search-results').innerHTML = '';
  }
  async pageButtonClick(pageSetFunction) {
    pageSetFunction();
    const { results } = await this.getResults();
    this.displayResults(results);
  }

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

  // Create and display pagination for search
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
      //   paginationDiv.appendChild(pageCounter);
      document.querySelector('#pagination' + num).appendChild(pageCounter);
    }
    pageCounter.textContent =
      'Page ' + this.originPage + ' of ' + global.search.totalPages;
  }
  displayResults(results) {
    this.clearPreviousResults();
    this.displayPagination(results.length, 1);
    super.displayResults(results);
    this.displayPagination(results.length, 2);
  }
}

export class KeywordSearchDetailReturnInfo extends SearchDetailReturnInfo {
  constructor(
    isTV,
    searchTerm = '',
    originPage = 1,
    genres = [],
    genreCombineUsing = 'and',
    languages = [],
    excludeAdult = false,
    sortBy = null
  ) {
    super(isTV, searchTerm, originPage);
    this.genres = genres;
    this.genreCombineUsing = genreCombineUsing;
    this.languages = languages;
    this.excludeAdult = excludeAdult;
    this.sortBy = sortBy;
  }

  searchType = 'keyword';

  backButtonHRef() {
    return (
      super.backButtonHRef() +
      '&genres=' +
      this.genres.join('+') +
      '&genre-combine-using=' +
      this.genreCombineUsing +
      '&languages=' +
      this.languages.join('+') +
      '&exclude-adult=' +
      this.excludeAdult +
      '&sort-by=' +
      this.sortBy
    );
  }
  detailsHRef() {
    return (
      super.detailsHRef() +
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

  async getResults() {
    // go to filter.js to get the results
    return await getFilterResults(this.isTV);
  }
}
