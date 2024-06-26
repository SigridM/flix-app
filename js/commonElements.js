import { fetchAPIData } from './fetchData.js';
import { formatDate, currencyFormatter } from './formatters.js';
import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { DetailReturnInfo, PopularDetailReturnInfo } from './detailReturn.js';

/* Keep all the string constants in one place */
const stringConstants = {
  // html elements that will be created or searched for
  iconElement: 'i',
  spanElement: 'span',
  unorderedListElement: 'ul',
  listItemElement: 'li',
  paragraphElement: 'p',
  anchorElement: 'a',
  divElement: 'div',
  heading2Element: 'h2',
  heading4Element: 'h4',
  heading5Element: 'h5',

  // classes that will be added or seached for
  ratingClasses: ['fas', 'fa-star', 'text-secondary'],
  listGroupClass: 'list-group',
  boldClass: 'text-secondary-bold',
  plainTextClass: 'text-secondary',
  buttonClass: 'btn',
  detailsTopClass: 'details-top',
  detailsBottomClass: 'details-bottom',
  backClass: '.back',

  // media types
  tvType: 'tv',
  movieType: 'movie',

  // common UI strings
  outOfTen: ' / 10',
  unavailable: 'Information unavailable',

  // targets
  blankAnchorTarget: '_blank',
  tvDetailsTarget: '#tv-details',
  movieDetailsTarget: '#movie-details',

  // error strings
  fetchError: 'A fetch error occurred:',
};

// Add the rating icon inside the wrapper element (a paragraph or h4)
export function addRatingIcon(media, wrapper) {
  const ratingIcon = document.createElement(stringConstants.iconElement);
  stringConstants.ratingClasses.forEach((ratingClass) => {
    ratingIcon.classList.add(ratingClass);
  });
  const vote = media.vote_average ? media.vote_average : 0;
  wrapper.textContent = vote.toFixed(1) + stringConstants.outOfTen;
  wrapper.insertBefore(ratingIcon, wrapper.firstChild);
}

// Create and return a span element containing the given text.
function spanFor(text) {
  const span = document.createElement(stringConstants.spanElement);
  span.textContent = text;
  return span;
}

// Create and return a ul containing all the genres of movie as lis
function genreList(media) {
  const genreList = document.createElement(
    stringConstants.unorderedListElement
  );
  genreList.classList.add(stringConstants.listGroupClass);
  media.genres.forEach((genre) => {
    const li = document.createElement(stringConstants.listItemElement);
    li.textContent = genre.name;
    genreList.appendChild(li);
  });
  return genreList;
}

// Create and return an object containing four parts:
// 1) a semicolon-separated list of places where someone can rent a movie
// 2) a semicolon-separated list of places where someone can get a TV show for free;
// 3) a semicolon-separated list of places where someone can buy a movie or TV show; and
// 4) a semicolon-separated list of places where someone can stream a movie or TV show
async function mediaProviders(mediaID, isTV) {
  const type = isTV ? stringConstants.tvType : stringConstants.movieType;
  let mediaProviders;
  try {
    mediaProviders = await fetchAPIData(`${type}/${mediaID}/watch/providers`);
  } catch (error) {
    console.error(stringConstants.fetchError, error);
  }

  const providers = {
    rent: null,
    free: null,
    buy: null,
    stream: null,
  };
  if (!mediaProviders.results) {
    return providers;
  }
  const usProviders = mediaProviders.results.US;
  if (!usProviders) {
    return providers;
  }
  if (usProviders.free) {
    providers.free = usProviders.free
      .map((provider) => provider.provider_name)
      .join('; ');
  }
  if (usProviders.rent) {
    providers.rent = usProviders.rent
      .map((provider) => provider.provider_name)
      .join('; ');
  }
  if (usProviders.buy) {
    providers.buy = usProviders.buy
      .map((provider) => provider.provider_name)
      .join('; ');
  }
  if (usProviders.flatrate) {
    providers.stream = usProviders.flatrate
      .map((provider) => provider.provider_name)
      .join('; ');
  }
  return providers;
}

// Create and return a paragraph (p) element that contains either the release date
// (for movies) or the aired-from and aired-to dates (for TV), along with labels
function dateParagraph(media, isTV) {
  const date = document.createElement(stringConstants.paragraphElement);
  if (isTV) {
    const airedFrom = spanFor('Aired from: ');
    airedFrom.classList.add(stringConstants.boldClass);
    const fromDate = spanFor(formatDate(media.first_air_date));
    const airedTo = spanFor(' to ');
    airedTo.classList.add(stringConstants.boldClass);
    const toDate = spanFor(formatDate(media.last_air_date));
    [airedFrom, fromDate, airedTo, toDate].forEach((el) =>
      date.appendChild(el)
    );
    return date;
  }
  // Movie
  const releaseTitle = spanFor('Release Date: ');
  releaseTitle.classList.add(stringConstants.boldClass);
  const releaseDate = spanFor(formatDate(media.release_date));
  date.appendChild(releaseTitle);
  date.appendChild(releaseDate);
  return date;
}

// Create and return the div that is to the right of the poster image and
// contains a number of details about the media
function detailsTopRight(media, isTV) {
  const div = document.createElement(stringConstants.divElement);

  const title = document.createElement(stringConstants.heading2Element);
  title.textContent = isTV ? media.name : media.title;

  const tagline = document.createElement(stringConstants.heading5Element);
  tagline.textContent = media.tagline;

  const rating = document.createElement(stringConstants.paragraphElement);
  addRatingIcon(media, rating);

  const overview = document.createElement(stringConstants.paragraphElement);
  overview.textContent = media.overview;

  const genresTitle = document.createElement(stringConstants.heading4Element);
  genresTitle.classList.add(stringConstants.plainTextClass);
  genresTitle.textContent = 'Genres';

  const anchor = document.createElement(stringConstants.anchorElement);
  anchor.href = media.homepage;
  anchor.target = stringConstants.blankAnchorTarget;
  anchor.classList.add(stringConstants.buttonClass);
  anchor.textContent = isTV ? 'Visit Show Homepage' : 'Visit Movie Homepage';
  [
    title,
    tagline,
    rating,
    dateParagraph(media, isTV),
    overview,
    genresTitle,
    genreList(media),
    anchor,
  ].forEach((el) => {
    div.appendChild(el);
  });
  return div;
}

// Create and return the div that is in the top portion of the window
// containing the movie poster image and other details
function detailsTop(media, isTV) {
  const div = document.createElement(stringConstants.divElement);
  div.classList.add(stringConstants.detailsTopClass);
  const posterPathDiv = document.createElement(stringConstants.divElement);
  posterPathDiv.appendChild(posterPathImageLink(media, isTV));

  div.appendChild(posterPathDiv);
  div.appendChild(detailsTopRight(media, isTV));
  return div;
}

//Create and return the div that should appear at the bottom of the details page
async function detailsBottom(media, mediaID, isTV) {
  const providers = await mediaProviders(mediaID, isTV);
  const div = document.createElement(stringConstants.divElement);
  div.classList.add(stringConstants.detailsBottomClass);

  const title = document.createElement(stringConstants.heading2Element);
  title.textContent = isTV ? 'Show Info' : 'Movie Info';

  div.appendChild(title);
  //   debugger;

  div.appendChild(detailsBottomList(media, providers));

  return div;
}

// Add the budget to the array of details, if that detail exists
function addBudget(media, details) {
  let detail = media.budget;
  if (!detail) {
    detail = stringConstants.unavailable;
  } else {
    detail = currencyFormatter.format(detail);
  }
  details.push({
    span: spanFor('Budget: '),
    listText: detail,
  });
}

// Add the revenue to the array of details, if that detail exists
function addRevenue(media, details) {
  let detail = media.revenue;
  if (!detail) {
    detail = stringConstants.unavailable;
  } else {
    detail = currencyFormatter.format(detail);
  }
  details.push({
    span: spanFor('Revenue: '),
    listText: detail,
  });
}

// Add the runtime to the array of details, if that detail exists
function addRuntime(media, details) {
  let detail = media.runtime;
  if (!detail) {
    detail = stringConstants.unavailable;
  } else {
    detail += ' minutes';
  }
  details.push({
    span: spanFor('Runtime: '),
    listText: detail,
  });
}

// Add the number of episodes to the array of details, if that detail exists
function addNumEpisodes(media, details) {
  let detail = media.number_of_episodes;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Number of Episodes: '),
    listText: detail,
  });
}

// Add the number of seasons to the array of details, if that detail exists
function addNumSeasons(media, details) {
  let detail = media.number_of_seasons;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Number of Seasons: '),
    listText: detail,
  });
}

// Add the last episode to the array of details, if that detail exists
function addLastEpisode(media, details) {
  let detail = media.last_episode_to_air;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Last Episode to Air: '),
    listText: detail.name,
  });
}

// Add the episode runtime to the array of details, if that detail exists
function addEpisodeRuntime(media, details) {
  let detail = media.episode_run_time;
  if (!detail) {
    detail = stringConstants.unavailable;
  } else {
    detail = detail[0] ? `${detail[0]} minutes` : stringConstants.unavailable;
  }
  const runtimeText = details.push({
    span: spanFor('Episode Runtime: '),
    listText: detail,
  });
}

// Add the status to the array of details, if that detail exists
function addStatus(media, details) {
  let detail = media.status;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Status: '),
    listText: detail,
  });
}

// Add the adult Boolean to the array of details
function addAdult(media, details) {
  let detail = media.adult;
  details.push({
    span: spanFor('Adult: '),
    listText: detail,
  });
}

// Add the production companies list to the array of details, if that detail exists
function addProductionCompanies(media, details) {
  let detail = media.production_companies;
  let label = 'Production Company:';
  if (!detail || detail.length === 0) {
    detail = stringConstants.unavailable;
  } else {
    label =
      detail.length > 1 ? 'Production Companies: ' : 'Production Company: ';
    detail = detail.map((company) => company.name).join('; ');
  }
  details.push({
    span: spanFor(label),
    listText: detail,
  });
}

// Add the spoken languages list to the array of details, if that detail exists
function addLanguages(media, details) {
  let detail = media.spoken_languages;
  let label = 'Spoken Language: ';
  if (!detail) {
    detail = stringConstants.unavailable;
  } else {
    label = detail.length > 1 ? 'Spoken Langages: ' : 'Spoken Language: ';
    detail = detail.map((language) => language.english_name).join(', ');
  }
  details.push({
    span: spanFor(label),
    listText: detail,
  });
}

// Add the places to rent list to the array of details, if that detail exists
function addRentFrom(providers, details) {
  let detail = providers.rent;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Rent from: '),
    listText: detail,
  });
}

// Add the free places list to the array of details, if that detail exists
function addFreeFrom(providers, details) {
  let detail = providers.free;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Free from: '),
    listText: detail,
  });
}

// Add the places to buy list to the array of details, if that detail exists
function addBuyFrom(providers, details) {
  const detail = providers.buy;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Buy from: '),
    listText: detail,
  });
}

// Add the places to stream list to the array of details, if that detail exists
function addStreamFrom(providers, details) {
  let detail = providers.stream;
  if (!detail) {
    detail = stringConstants.unavailable;
  }
  details.push({
    span: spanFor('Stream from: '),
    listText: detail,
  });
}

// Create and return the unordered list element containing the media details to appear
// at the bottom of the details page
function detailsBottomList(media, providers) {
  const details = [];
  addBudget(media, details);
  addRevenue(media, details);
  addRuntime(media, details);
  addNumEpisodes(media, details);
  addNumSeasons(media, details);
  addLastEpisode(media, details);
  addEpisodeRuntime(media, details);
  addStatus(media, details);
  addAdult(media, details);

  addRentFrom(providers, details);
  addFreeFrom(providers, details);
  addBuyFrom(providers, details);
  addStreamFrom(providers, details);

  addProductionCompanies(media, details);
  addLanguages(media, details);

  const list = document.createElement(stringConstants.unorderedListElement);
  details.forEach((el) => {
    el.span.classList.add(stringConstants.plainTextClass);
    const li = document.createElement(stringConstants.listItemElement);
    li.textContent = el.listText;
    li.insertBefore(el.span, li.firstChild);
    list.appendChild(li);
  });
  return list;
}

// Display the Details page for movie or tv show
export async function displayDetails(isTV = false) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const mediaID = urlParams.get('id');
  const searchType = isTV ? stringConstants.tvType : stringConstants.movieType;
  const endPoint = searchType + '/';
  const media = await fetchAPIData(endPoint + mediaID);
  const returnInfo = DetailReturnInfo.fromURL(urlParams, isTV);

  displayBackgroundImage(media.backdrop_path, isTV);

  const div = document.createElement(stringConstants.divElement);
  const bottom = await detailsBottom(media, mediaID, isTV);

  div.appendChild(detailsTop(media, isTV));
  div.appendChild(bottom);

  const selector = isTV
    ? stringConstants.tvDetailsTarget
    : stringConstants.movieDetailsTarget;

  const btn = document.createElement(stringConstants.anchorElement);
  btn.classList.add(stringConstants.buttonClass);
  btn.href = returnInfo.backButtonHRef();
  btn.textContent = returnInfo.backButtonTextContent();

  backButton().innerHTML = '';
  backButton().appendChild(btn);
  document.querySelector(selector).appendChild(div);
}

/* Answer the back button from the DOM */
function backButton() {
  return document.querySelector(stringConstants.backClass);
}

// Display the 20 most popular tv shows or movies
export async function displayPopular(isTV = false) {
  let endPoint = isTV ? stringConstants.tvType : stringConstants.movieType;
  endPoint += '/popular';

  const { results } = await fetchAPIData(endPoint);

  const returnInfo = new PopularDetailReturnInfo(isTV);
  returnInfo.displayResults(results, returnInfo);
}
