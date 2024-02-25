import { fetchAPIData } from './fetchData.js';
import { formatDate, currencyFormatter } from './formatters.js';
import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';

// Add the rating icon inside the wrapper element (a paragraph or h4)
export function addRatingIcon(media, wrapper) {
  const ratingIcon = document.createElement('i');
  ['fas', 'fa-star', 'text-secondary'].forEach((ratingClass) => {
    ratingIcon.classList.add(ratingClass);
  });
  wrapper.textContent = ` ${media.vote_average.toFixed(1)} / 10`;
  wrapper.insertBefore(ratingIcon, wrapper.firstChild);
}

// Create and return the card body div element for a particular movie or TV show, including a
// caption under the title
function cardBodyDiv(media, isTV) {
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');

  const title = document.createElement('h5');
  title.classList.add('card-title');
  title.textContent = isTV ? media.name : media.title;

  const cardCaption = document.createElement('p');
  cardCaption.classList.add('card-text');

  const releaseDate = document.createElement('small');
  releaseDate.textContent = isTV ? media.first_air_date : media.release_date;
  cardCaption.appendChild(releaseDate);

  const rating = document.createElement('small');
  addRatingIcon(media, rating); // adds a star and a number to the element
  cardCaption.appendChild(rating);

  cardCaption.style.display = 'flex';
  cardCaption.style.justifyContent = 'space-between';

  cardBodyDiv.appendChild(title);
  cardBodyDiv.appendChild(cardCaption);

  // cardBodyDiv.appendChild(rating);
  return cardBodyDiv;
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

// Create and return an object containing three parts:
// 1) a semicolon-separated list of places where someone can either rent a movie or get a TV show free;
// 2) a semicolon-separated list of places where someone can buy a movie or TV show; and
// 3) a semicolon-separated list of places where someone can stream a movie or TV show
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
  const theProviders = await mediaProviders(mediaID, isTV);
  const div = document.createElement('div');
  div.classList.add('details-bottom');

  const title = document.createElement('h2');
  title.textContent = isTV ? 'Show Info' : 'Movie Info';

  div.appendChild(title);
  //   debugger;

  div.appendChild(detailsBottomList(media, theProviders));

  return div;
}

// Create and return the list of media details appearing at the bottom of the
// details page
const detailsBottomList = (media, providers) => {
  const list = document.createElement('ul');
  const details = [];
  let detail = media.budget;
  if (detail) {
    details.push({
      span: spanFor('Budget: '),
      listText: currencyFormatter.format(detail),
    });
  }
  detail = media.revenue;
  if (detail) {
    details.push({
      span: spanFor('Revenue: '),
      listText: currencyFormatter.format(detail),
    });
  }
  detail = media.runtime;
  if (detail) {
    details.push({
      span: spanFor('Runtime: '),
      listText: detail + ' minutes',
    });
  }
  detail = media.number_of_episodes;
  if (detail) {
    details.push({
      span: spanFor('Number of Episodes: '),
      listText: detail,
    });
  }
  detail = media.number_of_seasons;
  if (detail) {
    details.push({
      span: spanFor('Number of Seasons: '),
      listText: detail,
    });
  }
  detail = media.last_episode_to_air;
  if (detail) {
    details.push({
      span: spanFor('Last Episode to Air: '),
      listText: detail.name,
    });
  }
  detail = media.episode_run_time;
  if (detail) {
    const runtimeText = detail[0] ? `${detail[0]} minutes` : 'unavailable';
    details.push({
      span: spanFor('Episode Runtime: '),
      listText: runtimeText,
    });
  }
  detail = media.status;
  if (detail) {
    details.push({
      span: spanFor('Status: '),
      listText: detail,
    });
  }
  if (providers.rent) {
    details.push({
      span: spanFor('Rent from: '),
      listText: providers.rent,
    });
  }
  if (providers.free) {
    details.push({
      span: spanFor('Free from: '),
      listText: providers.free,
    });
  }

  if (providers.buy) {
    details.push({
      span: spanFor('Buy from: '),
      listText: providers.buy,
    });
  }

  if (providers.stream) {
    details.push({
      span: spanFor('Stream from: '),
      listText: providers.stream,
    });
  }

  detail = media.production_companies;
  if (detail) {
    details.push({
      span: spanFor('Production Companies: '),
      listText: detail.map((company) => company.name).join('; '),
    });
  }
  detail = media.spoken_languages;
  if (detail) {
    details.push({
      span: spanFor('Spoken Languages: '),
      listText: detail.map((language) => language.english_name).join(', '),
    });
  }

  details.forEach((el) => {
    el.span.classList.add('text-secondary');
    const li = document.createElement('li');
    li.textContent = el.listText;
    li.insertBefore(el.span, li.firstChild);
    list.appendChild(li);
  });
  return list;
};

// Display the Details page for movie or tv show
export async function displayDetails(isTV = false) {
  const mediaID = window.location.search.split('=')[1];
  const endPointType = isTV ? 'tv/' : 'movie/';
  const media = await fetchAPIData(endPointType + mediaID);

  displayBackgroundImage(media.backdrop_path, isTV);

  const div = document.createElement('div');
  const bottom = await detailsBottom(media, mediaID, isTV);

  div.appendChild(detailsTop(media, isTV));
  div.appendChild(bottom);

  const selector = isTV ? '#tv-details' : '#movie-details';

  document.querySelector(selector).appendChild(div);
}

// Display the 20 most popular tv shows or movies
export async function displayPopular(isTV = false) {
  const endPoint = isTV ? 'tv/popular' : 'movie/popular';
  const detailsPage = isTV ? 'tv-details.html?id=' : 'movie-details.html?id=';
  const popularPage = isTV ? '#popular-shows' : '#popular-movies';

  const { results } = await fetchAPIData(endPoint);

  results.forEach((media) => {
    const div = document.createElement('div');
    div.classList.add('card');

    const anchor = document.createElement('a');
    anchor.href = detailsPage + media.id;
    anchor.appendChild(posterPathImageLink(media, isTV));
    div.appendChild(anchor);
    div.appendChild(cardBodyDiv(media, isTV));

    document.querySelector(popularPage).appendChild(div);
  });
}
