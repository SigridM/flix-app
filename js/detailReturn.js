import { global } from './globals.js';
import { searchAPIData } from './fetchData.js';
import { getFilterResults } from './filter.js';
export class DetailReturnInfo {
  // Abstract
  constructor(isTV = false) {
    this.isTV = isTV;
    this.media = null;
  }

  detailsPage = this.isTV ? 'tv-details.html' : 'movie-details.html';

  imagePaths = {
    original: 'https:/image.tmdb.org/t/p/original/', // 'original' means original size
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
    const alt = this.isTV ? this.media.name : this.media.title;

    return this.media.poster_path // if not null
      ? this.imageLink()
      : this.noImage();
  }

  hRefExtension() {
    return this.detailsPage + '?id=' + this.media.id + '&search=false';
  }

  anchor() {
    const imageLink = this.posterPathImageLink();

    const anchor = document.createElement('a');
    anchor.href = this.hRefExtension();
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
  divClassName = 'card';
  parentDivClassName = this.isTV ? '#popular-shows' : '#popular-movies';
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

export class TitleSearchDetailReturnInfo extends DetailReturnInfo {
  constructor(isTV, searchTerm = '', originPage = 1) {
    super(isTV);
    this.searchTerm = searchTerm;
    this.originPage = originPage;
  }

  divClassName = 'card';
  parentDivClassName = '.search-results';

  hRefExtension =
    super.hRefExtension +
    '&search-term=' +
    this.searchTerm +
    '&page=' +
    this.originPage;

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
    const { results, total_pages, page, total_results } = this.getResults();
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
    this.displayResults(results, returnInfo);
  }

  addPaginationButton(text, pageSetFunction, paginationDiv, isDisabled) {
    const id = text.toLowerCase();
    let button = document.getElementById(id);
    if (!button) {
      button = document.createElement('button');
      button.classList.add('btn', 'btn-primary');
      button.id = id;
      button.textContent = text;
      button.addEventListener('click', function () {
        this.pageButtonClick(pageSetFunction);
      });
      paginationDiv.appendChild(button);
    }
    button.disabled = isDisabled;
  }

  // Create and display pagination for search
  displayPagination(numResultsThisPage) {
    const heading = document.querySelector('#search-results-heading');
    const h2 = this.searchResultsHeading(numResultsThisPage);
    heading.appendChild(h2);

    let paginationDiv = document.querySelector('.pagination');
    if (!paginationDiv) {
      paginationDiv = document.createElement('div');
      paginationDiv.classList.add('pagination');
      document.querySelector('#pagination').appendChild(paginationDiv);
    }

    this.addPaginationButtonn(
      'First',
      goToFirstOriginPage,
      paginationDiv,
      this.originPage == 1
    );

    this.addPaginationButton(
      'Prev',
      decreaseOriginPage,
      paginationDiv,
      this.originPage == 1
    );

    this.addPaginationButton(
      'Next',
      increaseOriginPage,
      paginationDiv,
      this.originPage == global.search.totalPages
    );

    this.addPaginationButton(
      'Last',
      goToLastOriginPage,
      paginationDiv,
      this.originPage == global.search.totalPages
    );

    let pageCounter = document.querySelector('.page-counter');
    if (!pageCounter) {
      pageCounter = document.createElement('div');
      pageCounter.classList.add('page-counter');
      paginationDiv.appendChild(pageCounter);
    }
    pageCounter.textContent =
      this.originPage + ' of ' + global.search.totalPages;
  }
  displayResults(results) {
    this.clearPreviousResults();
    super.displayResults(results);
    this.displayPagination(results.length);
  }
}

export class KeywordSearchDetailReturnInfo extends TitleSearchDetailReturnInfo {
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

  hRefExtension =
    super.hRefExtension +
    '&genreCodes=' +
    this.genres.map((ea) => ea.name).join('+');

  searchResultsHeading(numResultsThisPage) {
    const h2 = super.searchResultsH2();

    let textContent = this.searchResultsPreamble(numResultsThisPage);
    textContent += this.genres
      .map((ea) => ea.name)
      .join(' ' + this.genreCombineUsing + ' ');
    textContent += `${this.isTV ? ' TV Shows' : ' Movies'}`;

    const noSearchTerm =
      global.search.term === '' || global.search.term === null;
    textContent += noSearchTerm ? '' : ' containing ' + this.quotedSearchTerm();

    if (languages.length > 0) {
      textContent +=
        ' in ' + this.languages.map((ea) => ea.english_name).join(' or ');
    }

    if (this.excludeAdult) {
      textContent += ', excluding adult content';
    }

    textContent +=
      this.sortBy === null
        ? ''
        : '; sorted by ' + this.friendlySortString(this.sortBy);
    h2.textContent = textContent;
    return h2;
  }
  friendlySortString(sortString) {
    switch (sortString) {
      case 'original_title.asc':
        return 'Original Title, Ascending';
      case 'original_title.desc':
        return 'Original Title, Descending';
      case 'pouplarity.asc':
        return 'Popularity, Ascending';
      case 'pouplarity.desc':
        return 'Popularity, Descending';
      case 'revenue.asc':
        return 'Revenue, Ascending';
      case 'revenue.desc':
        return 'Revenue, Descending';
      case 'primary_release_date.asc':
        return 'Primary release date, Ascending';
      case 'primary_release_date.desc':
        return 'Primary release date, Descending';
      case 'title.asc':
        return 'title, Ascending';
      case 'title.desc':
        return 'title, Descending';
      case 'vote_average.asc':
        return 'vote average, Ascending';
      case 'vote_average.desc':
        return 'vote average, Descending';
      case 'vote_count.asc':
        return 'vote count, Ascending';
      case 'vote_count.desc':
        return 'vote count, Descending';
    }
  }

  async getResults() {
    return await getFilterResults(this.isTV);
  }
}
