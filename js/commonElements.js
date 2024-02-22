import { fetchAPIData } from './fetchData.js';
import { formatDate } from './formatters.js';
import { posterPathImageLink } from './imageManagement.js';

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
export function cardBodyDiv(media, isTV = false) {
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
export function spanFor(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

// Create and return a ul containing all the genres of movie as lis
export function genreList(media) {
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
export async function mediaProviders(media, isTV = false) {
  const type = isTV ? 'tv' : 'movie';
  let mediaProviders;
  try {
    mediaProviders = await fetchAPIData(`${type}/${media}/watch/providers`);
  } catch (error) {
    console.error('A fetch error occurred:', error);
  }
  const providers = {
    rentOrFree: '',
    buy: '',
    stream: '',
  };
  if (!mediaProviders.results) {
    return providers;
  }
  const usProviders = mediaProviders.results.US;
  if (!usProviders) {
    return providers;
  }
  if (isTV) {
    if (usProviders.free) {
      providers.rentOrFree = usProviders.free
        .map((provider) => provider.provider_name)
        .join('; ');
    }
  } else {
    // movie
    if (usProviders.rent) {
      providers.rentOrFree = usProviders.rent
        .map((provider) => provider.provider_name)
        .join('; ');
    }
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
function detailsTopRight(media, isTV = false) {
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
export function detailsTop(media, isTV = false) {
  const div = document.createElement('div');
  div.classList.add('details-top');
  const posterPathDiv = document.createElement('div');
  posterPathDiv.appendChild(posterPathImageLink(media, isTV));

  div.appendChild(posterPathDiv);
  div.appendChild(detailsTopRight(media, isTV));
  return div;
}

//Create and return the div that should appear at the bottom of the details page
export function detailsBottom(
  media,
  providers,
  bottomListFunction,
  isTV = false
) {
  const div = document.createElement('div');
  div.classList.add('details-bottom');

  const title = document.createElement('h2');
  title.textContent = isTV ? 'Show Info' : 'Movie Info';

  div.appendChild(title);
  div.appendChild(bottomListFunction(media, providers));

  return div;
}
