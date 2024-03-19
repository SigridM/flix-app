import { fetchAPIData } from './fetchData.js';
import { formatDate, currencyFormatter } from './formatters.js';
import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { DetailReturnInfo, PopularDetailReturnInfo } from './detailReturn.js';

// Add the rating icon inside the wrapper element (a paragraph or h4)
export function addRatingIcon(media, wrapper) {
  const ratingIcon = document.createElement('i');
  ['fas', 'fa-star', 'text-secondary'].forEach((ratingClass) => {
    ratingIcon.classList.add(ratingClass);
  });
  const vote = media.vote_average ? media.vote_average : 0;
  wrapper.textContent = ` ${vote.toFixed(1)} / 10`;
  wrapper.insertBefore(ratingIcon, wrapper.firstChild);
}

// Create and return a span element containing the given text.
function spanFor(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

// Create and return a ul containing all the genres of movie as lis
function genreList(media) {
  const genreList = document.createElement('ul');
  genreList.classList.add('list-group');
  media.genres.forEach((genre) => {
    const li = document.createElement('li');
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
  const type = isTV ? 'tv' : 'movie';
  let mediaProviders;
  try {
    mediaProviders = await fetchAPIData(`${type}/${mediaID}/watch/providers`);
  } catch (error) {
    console.error('A fetch error occurred:', error);
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
  const date = document.createElement('p');
  if (isTV) {
    const airedFrom = spanFor('Aired from: ');
    airedFrom.classList.add('text-secondary-bold');
    const fromDate = spanFor(formatDate(media.first_air_date));
    const airedTo = spanFor(' to ');
    airedTo.classList.add('text-secondary-bold');
    const toDate = spanFor(formatDate(media.last_air_date));
    [airedFrom, fromDate, airedTo, toDate].forEach((el) =>
      date.appendChild(el)
    );
    return date;
  }
  // Movie
  const releaseTitle = spanFor('Release Date: ');
  releaseTitle.classList.add('text-secondary-bold');
  const releaseDate = spanFor(formatDate(media.release_date));
  date.appendChild(releaseTitle);
  date.appendChild(releaseDate);
  return date;
}

// Create and return the div that is to the right of the poster image and
// contains a number of details about the media
function detailsTopRight(media, isTV) {
  const div = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = isTV ? media.name : media.title;

  const tagline = document.createElement('h5');
  tagline.textContent = media.tagline;

  const rating = document.createElement('p');
  addRatingIcon(media, rating);

  const overview = document.createElement('p');
  overview.textContent = media.overview;

  const genresTitle = document.createElement('h4');
  genresTitle.classList.add('text-secondary');
  genresTitle.textContent = 'Genres';

  const anchor = document.createElement('a');
  anchor.href = media.homepage;
  anchor.target = '_blank';
  anchor.classList.add('btn');
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
  const div = document.createElement('div');
  div.classList.add('details-top');
  const posterPathDiv = document.createElement('div');
  posterPathDiv.appendChild(posterPathImageLink(media, isTV));

  div.appendChild(posterPathDiv);
  div.appendChild(detailsTopRight(media, isTV));
  return div;
}

//Create and return the div that should appear at the bottom of the details page
async function detailsBottom(media, mediaID, isTV) {
  const providers = await mediaProviders(mediaID, isTV);
  const div = document.createElement('div');
  div.classList.add('details-bottom');

  const title = document.createElement('h2');
  title.textContent = isTV ? 'Show Info' : 'Movie Info';

  div.appendChild(title);
  //   debugger;

  div.appendChild(detailsBottomList(media, providers));

  return div;
}

// Add the budget to the array of details, if that detail exists
function addBudget(media, details) {
  const detail = media.budget;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Budget: '),
    listText: currencyFormatter.format(detail),
  });
}

// Add the revenue to the array of details, if that detail exists
function addRevenue(media, details) {
  const detail = media.revenue;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Revenue: '),
    listText: currencyFormatter.format(detail),
  });
}

// Add the runtime to the array of details, if that detail exists
function addRuntime(media, details) {
  const detail = media.runtime;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Runtime: '),
    listText: detail + ' minutes',
  });
}

// Add the number of episodes to the array of details, if that detail exists
function addNumEpisodes(media, details) {
  const detail = media.number_of_episodes;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Number of Episodes: '),
    listText: detail,
  });
}

// Add the number of seasons to the array of details, if that detail exists
function addNumSeasons(media, details) {
  const detail = media.number_of_seasons;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Number of Seasons: '),
    listText: detail,
  });
}

// Add the last episode to the array of details, if that detail exists
function addLastEpisode(media, details) {
  const detail = media.last_episode_to_air;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Last Episode to Air: '),
    listText: detail.name,
  });
}

// Add the episode runtime to the array of details, if that detail exists
function addEpisodeRuntime(media, details) {
  const detail = media.episode_run_time;
  if (!detail) {
    return;
  }
  const runtimeText = detail[0] ? `${detail[0]} minutes` : 'unavailable';
  details.push({
    span: spanFor('Episode Runtime: '),
    listText: runtimeText,
  });
}

// Add the status to the array of details, if that detail exists
function addStatus(media, details) {
  const detail = media.status;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Status: '),
    listText: detail,
  });
}

// Add the status to the array of details, if that detail exists
function addAdult(media, details) {
  const detail = media.adult;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Adult: '),
    listText: detail,
  });
}

// Add the production companies list to the array of details, if that detail exists
function addProductionCompanies(media, details) {
  const detail = media.production_companies;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Production Companies: '),
    listText: detail.map((company) => company.name).join('; '),
  });
}

// Add the spoken languages list to the array of details, if that detail exists
function addLanguages(media, details) {
  const detail = media.spoken_languages;
  if (!detail) {
    return;
  }
  const label = detail.length > 1 ? 'Spoken Langages: ' : 'Spoken Language: ';
  details.push({
    span: spanFor(label),
    listText: detail.map((language) => language.english_name).join(', '),
  });
}

// Add the places to rent list to the array of details, if that detail exists
function addRentFrom(providers, details) {
  const detail = providers.rent;
  if (!detail) {
    return;
  }
  details.push({
    span: spanFor('Rent from: '),
    listText: detail,
  });
}

// Add the free places list to the array of details, if that detail exists
function addFreeFrom(providers, details) {
  const detail = providers.free;
  if (!detail) {
    return;
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
  const detail = providers.stream;
  if (!detail) {
    return;
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

  const list = document.createElement('ul');
  details.forEach((el) => {
    el.span.classList.add('text-secondary');
    const li = document.createElement('li');
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
  const searchType = isTV ? 'tv' : 'movie';
  const endPoint = searchType + '/';
  const media = await fetchAPIData(endPoint + mediaID);
  const returnInfo = DetailReturnInfo.fromURL(urlParams, isTV);

  displayBackgroundImage(media.backdrop_path, isTV);

  const div = document.createElement('div');
  const bottom = await detailsBottom(media, mediaID, isTV);

  div.appendChild(detailsTop(media, isTV));
  div.appendChild(bottom);

  const selector = isTV ? '#tv-details' : '#movie-details';

  const btn = document.createElement('a');
  btn.classList.add('btn');
  btn.href = returnInfo.backButtonHRef();
  btn.textContent = returnInfo.backButtonTextContent();

  document.querySelector('.back').innerHTML = '';
  document.querySelector('.back').appendChild(btn);
  document.querySelector(selector).appendChild(div);
}

// Display the 20 most popular tv shows or movies
export async function displayPopular(isTV = false) {
  const endPoint = isTV ? 'tv/popular' : 'movie/popular';

  const { results } = await fetchAPIData(endPoint);

  const returnInfo = new PopularDetailReturnInfo(isTV);
  returnInfo.displayResults(results, returnInfo);
}
